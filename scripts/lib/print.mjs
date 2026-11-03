// Shared parts of the printed documents (the PDF catalogue, scripts/make-catalog.mjs, and the flyers,
// scripts/make-flyer.mjs): loading the site's data, HTML helpers, printing with Chrome, the checks
// and the page images. Styles shared by all documents: print-base.css; fonts: fonts/ (Noto Sans, OFL).
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import qrcode from "qrcode-generator";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

import { connect, launchChrome } from "./chrome.mjs";

const libDir = path.dirname(fileURLToPath(import.meta.url));
const run = promisify(execFile);

export const PREVIEW_DPI = 100;
const MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];

// A problem the owner can fix (missing text, size limit, layout); printed without a stack trace
export class BuildError extends Error {}

// "novembar 2026": the edition shown on the documents, from the date they are made
export const editionOf = (date) => `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

export const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

// --- Data -------------------------------------------------------------------------------------

// Loads modules from src/ (e.g. "/src/data/products.js"). The data files use Vite features
// (import.meta.glob for the photos), so they are loaded through Vite. Returns the modules' exports.
export async function loadSiteData(rootDir, files) {
  const vite = await createServer({
    root: rootDir,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { disabled: true },
  });
  try {
    const modules = await Promise.all(files.map((file) => vite.ssrLoadModule(file)));
    return Object.assign({}, ...modules);
  } finally {
    await vite.close();
  }
}

// --- HTML -------------------------------------------------------------------------------------

export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// A react-icons icon (the site's icons) as inline SVG
export const icon = (Icon) => renderToStaticMarkup(createElement(Icon, { "aria-hidden": true }));

// QR code as a vector (sharp at any zoom and in print), dark on white with the standard quiet zone
export function qrSvg(url) {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 4;
  const size = count + 2 * quiet;
  let d = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue;
      let run = 1;
      while (col + run < count && qr.isDark(row, col + run)) run++;
      d += `M${col + quiet} ${row + quiet}h${run}v1h-${run}z`;
      col += run - 1;
    }
  }
  return (
    `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="QR kod: ${esc(url)}" shape-rendering="crispEdges">` +
    `<rect width="${size}" height="${size}" fill="#ffffff"/><path d="${d}" fill="#1c1917"/></svg>`
  );
}

// A complete HTML document: the bundled fonts, print-base.css, then the document's own stylesheets
export function htmlDocument({ title, stylesheets = [], body }) {
  const fileUrl = (file) => pathToFileURL(file).href;
  const font = (file) => fileUrl(path.join(libDir, "fonts", file));
  const links = [path.join(libDir, "print-base.css"), ...stylesheets]
    .map((file) => `<link rel="stylesheet" href="${fileUrl(file)}">`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
  /* Bundled fonts under their own family name, so a system font is never used instead */
  @font-face { font-family: "Print Sans"; font-weight: 400; src: url("${font("NotoSans-Regular.ttf")}") format("truetype"); }
  @font-face { font-family: "Print Sans"; font-weight: 700; src: url("${font("NotoSans-Bold.ttf")}") format("truetype"); }
</style>
${links}
</head>
<body>${body}
</body>
</html>
`;
}

// --- Printing ---------------------------------------------------------------------------------

// Runs in the page after `prepare`: fonts and photos loaded, nothing cut off in the elements matched
// by `selectors` (each page's parts that must not overflow). Returns the problems found.
const checkPage = async (selectors) => {
  await document.fonts.ready;
  const problems = [];
  for (const face of document.fonts) {
    if (face.status !== "loaded") problems.push(`font ${face.family} ${face.weight} not loaded (${face.status})`);
  }
  for (const img of document.images) {
    await img.decode().catch(() => problems.push(`photo not loaded: ${decodeURI(img.src)}`));
  }
  document.querySelectorAll(".page").forEach((page, index) => {
    for (const part of page.querySelectorAll(selectors)) {
      if (part.scrollHeight > part.clientHeight + 1 || part.scrollWidth > part.clientWidth + 1) {
        problems.push(
          `page ${index + 1}: ${part.className} does not fit (${part.scrollWidth}×${part.scrollHeight} px ` +
            `in ${part.clientWidth}×${part.clientHeight} px)`
        );
      }
    }
  });
  return problems;
};

// Opens the HTML file in Chrome, runs `prepare(...prepareArgs)` in the page if given (it may return
// { problems, ... }), checks the page (checkPage), and prints the PDF. Layout problems stop a final
// build; in a draft they are only reported. With `image: { width }` it also takes a PNG of the first
// page, `width` pixels wide. Returns { pdf, prepared, png }.
export async function printPdf(htmlFile, { prepare, prepareArgs = [], checkSelectors, draft, image }) {
  const chrome = await launchChrome();
  try {
    const cdp = await connect(chrome.wsUrl);
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const send = (method, params) => cdp.send(method, params, sessionId);
    const evaluate = async (fn, args) => {
      const { result, exceptionDetails } = await send("Runtime.evaluate", {
        expression: `(${fn})(${args.map((arg) => JSON.stringify(arg)).join(", ")})`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (exceptionDetails) throw new Error(`Page script failed: ${exceptionDetails.exception?.description}`);
      return result.value;
    };

    await send("Page.enable");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const loaded = cdp.once("Page.loadEventFired", sessionId);
    await send("Page.navigate", { url: pathToFileURL(htmlFile).href });
    await loaded;

    const prepared = prepare ? await evaluate(prepare, prepareArgs) : {};
    const problems = [...(prepared?.problems ?? []), ...(await evaluate(checkPage, [checkSelectors]))];
    if (problems.length) {
      const message = `The layout has problems:\n  ${problems.join("\n  ")}`;
      if (!draft) throw new BuildError(message);
      console.warn(`  ! ${message}`);
    }

    const { data } = await send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      generateTaggedPDF: true, // accessible PDF; also carries the language (sr)
      generateDocumentOutline: true, // bookmarks from the headings
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });

    let png = null;
    if (image) {
      // The first A4 page (210 × 297 mm = 793.7 × 1122.5 CSS px), still laid out for print
      const width = (210 / 25.4) * 96;
      const height = (297 / 25.4) * 96;
      await send("Emulation.setDeviceMetricsOverride", {
        width: Math.ceil(width),
        height: Math.ceil(height),
        deviceScaleFactor: image.width / width,
        mobile: false,
      });
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height, scale: 1 },
      });
      png = Buffer.from(shot.data, "base64");
    }
    cdp.close();
    return { pdf: Buffer.from(data, "base64"), prepared, png };
  } finally {
    await chrome.close();
  }
}

// Number of pages of a PDF made by Chrome
export const pdfPageCount = (pdf) => (pdf.toString("latin1").match(/\/Type \/Page(?!s)/g) ?? []).length;

// Fonts embedded in the PDF file must be the bundled Noto Sans only (another font would mean a
// character that Noto Sans lacks was drawn with a system font). Returns the font names, or null if
// pdffonts (poppler-utils) is not installed.
export async function checkFonts(pdfFile, draft) {
  let stdout;
  try {
    ({ stdout } = await run("pdffonts", [pdfFile]));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  const fonts = stdout.split("\n").slice(2).filter(Boolean).map((line) => line.split(/\s+/)[0].replace(/^[A-Z]{6}\+/, ""));
  const foreign = fonts.filter((font) => !/^NotoSans-(Regular|Bold)$/.test(font));
  if (foreign.length) {
    const message = `Fonts other than the bundled Noto Sans in the PDF: ${foreign.join(", ")} (a character Noto Sans lacks?)`;
    if (!draft) throw new BuildError(message);
    console.warn(`  ! ${message}`);
  }
  return fonts;
}

// One PNG per page, dir/page-N.png (old page images in dir are removed first). Returns their number,
// 0 if pdftoppm (poppler-utils) is not installed.
export async function renderPreviews(pdfFile, dir) {
  await fs.mkdir(dir, { recursive: true });
  for (const file of await fs.readdir(dir)) {
    if (/^page-\d+\.png$/.test(file)) await fs.rm(path.join(dir, file));
  }
  if (!(await pdftoppm(["-png", "-r", String(PREVIEW_DPI), pdfFile, path.join(dir, "page")]))) return 0;
  return (await fs.readdir(dir)).filter((file) => /^page-\d+\.png$/.test(file)).length;
}

// The first page as one PNG file (outFile ends in .png). Returns false if pdftoppm is not installed.
export async function renderPreview(pdfFile, outFile) {
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  return pdftoppm(["-png", "-singlefile", "-r", String(PREVIEW_DPI), pdfFile, outFile.replace(/\.png$/, "")]);
}

async function pdftoppm(args) {
  try {
    await run("pdftoppm", args);
    return true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.warn("  ! pdftoppm not found (poppler-utils): page images skipped");
    return false;
  }
}
