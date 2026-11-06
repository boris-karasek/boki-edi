// Generates the one-page PDF flyers configured in src/data/flyers.js (e.g. calendar strips for printing
// houses), with the same pipeline as the PDF catalogue (scripts/lib/print.mjs).
//
// Usage: npm run flyer                    all flyers
//        npm run flyer -- kalendari       one flyer (its key in src/data/flyers.js)
//        npm run flyer -- --draft [name]  draft that may contain missing texts ("[TEKST – dopuniti]"),
//                                         marked "NACRT" -> flyer-draft/ (not committed)
//
// Per flyer (file: "letak-kalendari"):
//   public/letak-kalendari.pdf              https://www.boki-edi.com/letak-kalendari.pdf (not linked from the site)
//   marketing/letak-kalendari.jpg           the same page as an image for Viber/WhatsApp, 1200 px wide
//   docs/flyer-preview/letak-kalendari.png  page image for checking
// and, for all flyers, marketing/flyers.json (sizes, edition and the fingerprint for the "out of date"
// warning of `npm run build`). If vercel.json or netlify.toml has no header for the flyer's PDF yet, the
// script adds it, so the PDF opens in the browser and is saved as `downloadName`.
//
// A final flyer is not built while a text is missing, if it does not fit on one page, if a font other
// than the bundled Noto Sans gets in, or if the PDF is over 1 MB or the image over 500 KB.
// Needs Google Chrome and, for the page image and the font check, poppler-utils (pdftoppm, pdffonts).
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { MdCheckCircle, MdEmail, MdLanguage, MdPhone } from "react-icons/md";
import sharp from "sharp";

import { frameForCatalog } from "./lib/framing.mjs";
import { syncHostingHeaders } from "./lib/hosting-headers.mjs";
import { setPdfInfo } from "./lib/pdf-info.mjs";
import {
  BuildError,
  checkFonts,
  editionOf,
  esc,
  formatMB,
  htmlDocument,
  icon,
  loadSiteData,
  pdfPageCount,
  printPdf,
  qrSvg,
  renderPreview,
} from "./lib/print.mjs";
import { FLYER_SOURCES, sourceHash } from "./lib/source-hash.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(rootDir, "src", "assets");

const args = process.argv.slice(2);
const draft = args.includes("--draft");
const OUTPUT = draft
  ? { pdf: "flyer-draft", image: "flyer-draft", preview: "flyer-draft" }
  : { pdf: "public", image: "marketing", preview: "docs/flyer-preview", json: "marketing/flyers.json" };
const MAX_PDF_BYTES = 1024 * 1024;
const MAX_IMAGE_BYTES = 500 * 1024;
const IMAGE_WIDTH = 1200; // for messaging apps
const PHOTO_SIZE = { width: 1200, height: 900 }; // about 350 dpi in the 87 mm photo boxes

// Flyer-independent texts (Serbian, Latin script)
const TEXT = {
  phone: "Telefon",
  edition: "Izdanje",
  draft: "NACRT",
  missing: "[TEKST – dopuniti]",
};

// --- HTML -------------------------------------------------------------------------------------

function buildHtml(name, flyer, data, photos, edition) {
  const { company, SITE_URL } = data;
  const siteHost = new URL(SITE_URL).host;
  const missing = [];
  // A required text, or a clearly marked placeholder (a final flyer is not built while any is left)
  const text = (value, field) => {
    if (value) return esc(value);
    missing.push(`${name}: ${field}`);
    return `<span class="placeholder">${esc(TEXT.missing)}</span>`;
  };
  const qrUrl = flyer.qr?.path ? `${SITE_URL}${flyer.qr.path}` : null;
  if (!qrUrl) missing.push(`${name}: qr.path`);
  if (!flyer.photos?.length) missing.push(`${name}: photos`);
  const points = flyer.points?.length ? flyer.points : [null];

  const body = `
    <section class="page flyer-page">
      <header class="band">
        <p class="band-brand">${esc(company.name.toUpperCase())}</p>
        <h1 class="band-title">${text(flyer.headline, "headline")}</h1>
        <div class="bar"></div>
        <p class="band-lead">${
          flyer.lead ? flyer.lead.split(/(?<=\.)\s+/).map((line) => `<span>${esc(line)}</span>`).join(" ") : text(null, "lead")
        }</p>
      </header>
      <div class="flyer-content">
        <div class="flyer-photos">${(flyer.photos ?? [])
          .map((photo) => `
          <span class="photo"><img src="${photos.get(photo.file).url}" alt="${esc(photo.alt ?? "")}"></span>`)
          .join("")}
        </div>
        <ul class="points">${points
          .map((point) => `
          <li>${icon(MdCheckCircle)}<p>${text(point, "points")}</p></li>`)
          .join("")}
        </ul>${
          flyer.callToAction || flyer.priceNote
            ? `
        <div class="callout flyer-callout">
          <p>${esc(flyer.callToAction ?? "")}</p>
          <p class="price">${esc(flyer.priceNote ?? "")}</p>
        </div>`
            : ""
        }
        <div class="contact-panel"><div class="contact-card">
          <div>
            <p class="contact-label">${TEXT.phone}</p>
            <a class="flyer-phone" href="tel:${esc(company.phone)}">${icon(MdPhone)}<span>${esc(company.phoneDisplay)}</span></a>
            <ul class="contact-list">
              <li>${icon(MdEmail)}<a class="contact-value" href="mailto:${esc(company.email)}">${esc(company.email)}</a></li>
              <li>${icon(MdLanguage)}<a class="contact-value" href="${esc(SITE_URL)}/">${esc(siteHost)}</a></li>
            </ul>
          </div>
          <div class="qr">
            ${qrUrl ? qrSvg(qrUrl) : ""}
            <p>${text(flyer.qr?.caption, "qr.caption")}<br>${
              qrUrl ? `<a class="qr-url" href="${esc(qrUrl)}">${esc(qrUrl.replace(/^https:\/\//, ""))}</a>` : ""
            }</p>
          </div>
        </div></div>${
          flyer.more
            ? `
        <p class="more">${esc(flyer.more.text)} <a href="${esc(SITE_URL + flyer.more.path)}">${esc(flyer.more.linkLabel)}
          ${esc(siteHost + flyer.more.path)}</a></p>`
            : ""
        }
      </div>
      <footer class="page-footer">
        <span>${esc(company.name)} · <a href="tel:${esc(company.phone)}">${esc(company.phoneDisplay)}</a> ·
          <a href="${esc(SITE_URL)}/">${esc(siteHost)}</a></span>
        <span>${draft ? `<span class="draft">${TEXT.draft}</span> · ` : ""}${TEXT.edition}: ${esc(edition)}</span>
      </footer>
    </section>`;

  const html = htmlDocument({
    title: flyer.title ?? flyer.headline ?? name,
    stylesheets: [path.join(rootDir, "scripts", "flyer", "flyer.css")],
    body,
  });
  return { html, missing };
}

// --- Main -------------------------------------------------------------------------------------

async function makeFlyer(name, flyer, data, edition, tempDir) {
  if (!/^[a-z0-9-]+$/.test(flyer.file ?? "")) {
    throw new BuildError(`${name}: "file" must be a name like "letak-kalendari" (a-z, 0-9, -)`);
  }
  if (!/^[\x20-\x7e]+\.pdf$/.test(flyer.downloadName ?? "") || /["\\]/.test(flyer.downloadName)) {
    throw new BuildError(`${name}: "downloadName" must be plain ASCII without quotes and end in .pdf`);
  }

  // Photos framed like in the catalogue, larger
  const photos = new Map();
  for (const photo of flyer.photos ?? []) {
    const input = path.join(assetsDir, photo.file);
    await fs.access(input).catch(() => {
      throw new BuildError(`${name}: photo not found: src/assets/${photo.file}`);
    });
    const { image } = await frameForCatalog(input, photo.file).catch((error) => {
      throw new BuildError(error.message);
    });
    const output = path.join(tempDir, `${name}-${photos.size}.jpg`);
    await image.resize(PHOTO_SIZE.width, PHOTO_SIZE.height, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(output);
    photos.set(photo.file, { url: pathToFileURL(output).href });
  }

  const { html, missing } = buildHtml(name, flyer, data, photos, edition);
  if (missing.length && !draft) {
    throw new BuildError(
      `Missing texts — the flyer was not built:\n  ${missing.join("\n  ")}\n` +
        "Add them in src/data/flyers.js. To see a draft: npm run flyer -- --draft"
    );
  }
  const htmlFile = path.join(tempDir, `${name}.html`);
  await fs.writeFile(htmlFile, html);

  const printed = await printPdf(htmlFile, {
    checkSelectors: ".band, .flyer-content, .page-footer",
    draft,
    image: { width: IMAGE_WIDTH },
  });
  const pages = pdfPageCount(printed.pdf);
  if (pages !== 1) {
    const message = `${name}: the flyer has ${pages} pages instead of 1`;
    if (!draft) throw new BuildError(message);
    console.warn(`  ! ${message}`);
  }
  const pdf = setPdfInfo(printed.pdf, {
    Title: flyer.title ?? flyer.headline,
    Author: data.company.name,
    Subject: flyer.lead,
    Keywords: [flyer.headline, ...(flyer.points ?? [])].filter(Boolean).join(", "),
    Creator: "npm run flyer (scripts/make-flyer.mjs)",
  });
  const jpg = await sharp(printed.png).resize(IMAGE_WIDTH).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  if (!draft && pdf.length > MAX_PDF_BYTES) throw new BuildError(`${name}: the PDF is ${formatMB(pdf.length)}, over 1 MB`);
  if (!draft && jpg.length > MAX_IMAGE_BYTES) {
    throw new BuildError(`${name}: the image is ${Math.round(jpg.length / 1024)} KB, over 500 KB`);
  }

  const checkedFile = path.join(tempDir, `${name}.pdf`);
  await fs.writeFile(checkedFile, pdf);
  const fonts = await checkFonts(checkedFile, draft);

  const pdfOut = path.join(OUTPUT.pdf, `${flyer.file}${draft ? "-nacrt" : ""}.pdf`);
  const imageOut = path.join(OUTPUT.image, `${flyer.file}${draft ? "-nacrt" : ""}.jpg`);
  const previewOut = path.join(OUTPUT.preview, `${flyer.file}${draft ? "-nacrt" : ""}.png`);
  for (const dir of new Set([OUTPUT.pdf, OUTPUT.image])) await fs.mkdir(path.join(rootDir, dir), { recursive: true });
  await fs.copyFile(checkedFile, path.join(rootDir, pdfOut));
  await fs.writeFile(path.join(rootDir, imageOut), jpg);
  const previewMade = await renderPreview(path.join(rootDir, pdfOut), path.join(rootDir, previewOut));

  console.log(`Flyer "${name}"${draft ? " (DRAFT)" : ""}`);
  console.log(`  ${pdfOut.padEnd(42)} ${formatMB(pdf.length)}, ${TEXT.edition}: ${edition}`);
  console.log(`  ${imageOut.padEnd(42)} ${Math.round(jpg.length / 1024)} KB, ${IMAGE_WIDTH} px wide`);
  if (previewMade) console.log(`  ${previewOut}`);
  if (missing.length) console.log(`  Placeholders (draft only): ${missing.join("; ")}`);
  if (fonts === null) console.warn("  ! pdffonts not found (poppler-utils): font check skipped");

  if (!draft) {
    for (const [config, change] of await syncHostingHeaders(rootDir, flyer.file, flyer.downloadName)) {
      console.log(`  ${config}: header for /${flyer.file}.pdf ${change} ("${flyer.downloadName}") — commit it`);
    }
  }
  return { pdf: pdfOut, image: imageOut, pdfBytes: pdf.length, imageBytes: jpg.length, edition };
}

async function main() {
  const data = await loadSiteData(rootDir, ["/src/data/flyers.js", "/src/data/company.js", "/src/seo.js"]);
  const names = args.filter((arg) => !arg.startsWith("--"));
  for (const name of names) {
    if (!data.flyers[name]) {
      throw new BuildError(`No flyer "${name}" in src/data/flyers.js. Flyers: ${Object.keys(data.flyers).join(", ")}`);
    }
  }
  const edition = editionOf(new Date());
  const hash = await sourceHash(rootDir, FLYER_SOURCES);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boki-edi-flyer-"));
  try {
    const made = {};
    for (const name of names.length ? names : Object.keys(data.flyers)) {
      made[name] = await makeFlyer(name, data.flyers[name], data, edition, tempDir);
    }
    if (OUTPUT.json) {
      const jsonFile = path.join(rootDir, OUTPUT.json);
      const info = JSON.parse(await fs.readFile(jsonFile, "utf8").catch(() => "{}"));
      for (const [name, result] of Object.entries(made)) info[name] = { ...result, sourceHash: hash };
      for (const name of Object.keys(info)) if (!data.flyers[name]) delete info[name]; // removed flyers
      await fs.writeFile(jsonFile, `${JSON.stringify(info, null, 2)}\n`);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof BuildError ? `\n${error.message}` : error);
  process.exitCode = 1;
}
