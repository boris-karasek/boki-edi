// Generates the PDF product catalogue, public/katalog.pdf (https://www.boki-edi.com/katalog.pdf), from
// the same data as the site: src/data/products.js, company.js, about.js and the photos in src/assets/.
//
// Usage: npm run catalog              final catalogue:
//                                       public/katalog.pdf               the PDF
//                                       src/data/catalog.json            size and edition for the site's link
//                                       docs/catalog-preview/page-N.png  one image per page, for checking
//        npm run catalog -- --draft   draft that may contain missing information ("[OPIS – dopuniti]"),
//                                     marked "NACRT" -> catalog-draft/ (not committed)
//
// Run it after adding or changing a product, check the page images, then commit the three outputs and
// deploy. The final catalogue is not built while information is missing or if it is over 2 MB (e-mail
// attachments). `npm run build` warns when the data has changed since the catalogue was made.
//
// Needs Google Chrome (scripts/lib/chrome.mjs) and, for the page images and the font check,
// poppler-utils (pdftoppm, pdffonts). The fonts (Noto Sans, OFL) are in scripts/catalog/fonts/.
// Catalogue-only fields of a product (fullDescription, catalogPhoto, inCatalog) are described in
// src/data/products.js; a benefit with `catalog` (src/data/about.js) becomes a service block.
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import qrcode from "qrcode-generator";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MdBuild, MdCheckCircle, MdEmail, MdLanguage, MdLocationOn, MdPhone } from "react-icons/md";
import { createServer } from "vite";

import { catalogSourceHash } from "./lib/catalog-sources.mjs";
import { connect, launchChrome } from "./lib/chrome.mjs";
import { frame43 } from "./lib/framing.mjs";
import { setPdfInfo } from "./lib/pdf-info.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDir = path.join(rootDir, "scripts", "catalog");
const assetsDir = path.join(rootDir, "src", "assets");
const run = promisify(execFile);

const draft = process.argv.includes("--draft");
const OUTPUT = draft
  ? { pdf: "catalog-draft/katalog-nacrt.pdf", previews: "catalog-draft" }
  : { pdf: "public/katalog.pdf", previews: "docs/catalog-preview", json: "src/data/catalog.json" };
const PUBLIC_PATH = "/katalog.pdf";
const DOWNLOAD_NAME = "Boki-Edi katalog.pdf"; // also in vercel.json (Content-Disposition)
const MAX_BYTES = 2 * 1024 * 1024;
const PHOTO_SIZE = { width: 1000, height: 750 }; // about 300 dpi at the printed size (8 cm wide)
const PREVIEW_DPI = 100;

// Catalogue-only texts (Serbian, Latin script). Everything else comes from the data files.
const TEXT = {
  documentTitle: "Boki-Edi – katalog proizvoda",
  aboutTitle: "O nama",
  contentsTitle: "Sadržaj",
  productsOverline: "Proizvodi",
  continued: "nastavak",
  service: "Usluga",
  inquiry: "Pošaljite upit ›",
  priceNote: "Cene i uslovi na upit.",
  orderTitle: "Kako poručiti",
  orderSteps: [
    "Pošaljite upit telefonom, e-mailom ili preko formulara na sajtu.",
    "Dimenzije, količine, pakovanje i cenu dogovaramo direktno sa vama, prema potrebama vašeg proizvoda.",
    "Delove izrađujemo po porudžbini.",
  ],
  contactTitle: "Kontakt",
  contentsContact: "Kako poručiti i kontakt",
  phone: "Telefon",
  email: "E-mail",
  address: "Adresa",
  website: "Sajt",
  qrCaption: "Skenirajte kod i pošaljite upit preko sajta:",
  edition: "Izdanje",
  draft: "NACRT",
  missingDescription: "[OPIS – dopuniti]",
};
const MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];

// --- Data -------------------------------------------------------------------------------------

// The data files use Vite features (import.meta.glob for the photos), so they are loaded through Vite.
async function loadSiteData() {
  const vite = await createServer({
    root: rootDir,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { disabled: true },
  });
  try {
    const [products, { company }, about, { SITE_URL }] = await Promise.all(
      ["/src/data/products.js", "/src/data/company.js", "/src/data/about.js", "/src/seo.js"].map((file) =>
        vite.ssrLoadModule(file)
      )
    );
    return { ...products, ...about, company, SITE_URL };
  } finally {
    await vite.close();
  }
}

// File name (in src/assets/) of the photo the catalogue shows for a product; null if it has none
function photoFile(product) {
  if (product.catalogPhoto) return product.catalogPhoto;
  return product.image ? path.basename(decodeURI(product.image)) : null;
}

// Frames each photo like the site's cards (scripts/lib/framing.mjs), at print resolution, as JPEG:
// Chrome embeds JPEG files in the PDF as they are, which keeps the PDF small.
async function preparePhotos(files, dir) {
  const photos = new Map();
  for (const file of new Set(files)) {
    const input = path.join(assetsDir, file);
    await fs.access(input).catch(() => {
      throw new CatalogError(`Photo not found: src/assets/${file}`);
    });
    const { image } = await frame43(input, file);
    const output = path.join(dir, file.replace(/\.\w+$/, ".jpg"));
    const info = await image
      .resize(PHOTO_SIZE.width, PHOTO_SIZE.height, { withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(output);
    photos.set(file, { url: pathToFileURL(output).href, width: info.width, size: info.size });
  }
  return photos;
}

// Splits a group's items into pages: at most 4 per page (3 on a page with a service block), spread
// evenly, e.g. 5 -> 3 + 2. Pages with 4 products show them as 2 × 2 cards, others as rows.
function paginate(items) {
  for (let count = Math.ceil(items.length / 4); ; count++) {
    const pages = [];
    for (let start = 0, i = 0; i < count; i++) {
      const size = Math.ceil((items.length - start) / (count - i));
      pages.push(items.slice(start, start + size));
      start += size;
    }
    if (pages.every((page) => page.length <= (page.some((item) => item.isService) ? 3 : 4))) return pages;
  }
}

// --- HTML -------------------------------------------------------------------------------------

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const icon = (Icon) => renderToStaticMarkup(createElement(Icon, { "aria-hidden": true }));

// QR code as a vector (sharp at any zoom and in print), dark on white with the standard quiet zone
function qrSvg(url) {
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

function buildHtml(data, photos, pages, edition) {
  const { company, SITE_URL, headline, intro, benefits, productNote } = data;
  const siteHost = new URL(SITE_URL).host;
  const contactUrl = `${SITE_URL}/#kontakt`;
  const inquiryUrl = (name) => `${SITE_URL}/?proizvod=${encodeURIComponent(name)}#kontakt`;
  const missing = [];
  const placeholder = (label, where) => {
    missing.push(where);
    return `<span class="placeholder">${esc(label)}</span>`;
  };

  const photoHtml = (file, alt) =>
    file
      ? `<span class="photo"><img src="${photos.get(file).url}" alt="${esc(alt)}"></span>`
      : `<span class="photo no-photo">${icon(MdBuild)}</span>`;

  const header = (overline, title, id) => `
    <header class="page-header">
      <p class="overline">${esc(overline)}</p>
      <h2 class="title"${id ? ` id="${id}"` : ""}>${esc(title)}</h2>
      <div class="bar"></div>
    </header>`;

  const note = `<p class="note">${esc(productNote)} <strong>${esc(TEXT.priceNote)}</strong></p>`;

  const footer = (number) => `
    <footer class="page-footer">
      <span>${esc(company.name)} · <a href="tel:${esc(company.phone)}">${esc(company.phoneDisplay)}</a> ·
        <a href="${esc(SITE_URL)}/">${esc(siteHost)}</a></span>
      <span>${draft ? `<span class="draft">${TEXT.draft}</span> · ` : ""}${TEXT.edition}: ${esc(edition)} ·
        ${number} / ${pages.length}</span>
    </footer>`;

  const productHtml = (product) => {
    const description = product.fullDescription ?? product.description;
    return `
      <li class="product">
        ${photoHtml(photoFile(product), product.alt ?? product.name)}
        <div>
          <h3>${esc(product.name)}</h3>
          <p>${description ? esc(description) : placeholder(TEXT.missingDescription, `${product.name}: description`)}</p>
          <a class="inquiry" href="${esc(inquiryUrl(product.name))}">${esc(TEXT.inquiry)}</a>
        </div>
      </li>`;
  };

  const serviceHtml = (service) => `
      <li class="product service">
        ${photoHtml(service.photo, service.title)}
        <div>
          <p class="overline">${esc(TEXT.service)}</p>
          <h3>${esc(service.title)}</h3>
          <p>${esc(service.text)}</p>
          <a class="inquiry" href="${esc(inquiryUrl(service.title))}">${esc(TEXT.inquiry)}</a>
        </div>
      </li>`;

  const firstPageOf = (groupId) => pages.findIndex((page) => page.group?.id === groupId) + 1;

  const render = {
    cover: () => {
      const groups = pages.filter((page) => page.kind === "products" && page.first);
      return `
      <div class="cover-band">
        <p class="cover-brand">${esc(company.name.toUpperCase())}</p>
        <h1 class="cover-title">${esc(headline)}</h1>
        <div class="bar"></div>
        <p class="cover-lead">${esc(intro[0])}</p>
        <p class="cover-since">${esc(company.locality)}, od ${company.foundingYear}.</p>
        <p class="cover-site"><a href="${esc(SITE_URL)}/">${esc(siteHost)}</a></p>
      </div>
      <div class="cover-groups">
        ${groups
          .map(({ group, items }) => {
            const product = items.find((item) => !item.isService && photoFile(item)) ?? items[0];
            return `
        <a href="#grupa-${group.id}"><figure>
          ${photoHtml(photoFile(product), product.alt ?? product.name)}
          <figcaption>${esc(group.title)}</figcaption>
        </figure></a>`;
          })
          .join("")}
      </div>`;
    },

    intro: () => `
      <div class="page-content">
        ${header(company.name, TEXT.aboutTitle)}
        <p class="intro-text">${esc(intro.join(" "))}</p>
        <ul class="benefits">
          ${benefits
            .map(
              (benefit) => `
          <li>${icon(MdCheckCircle)}<div><h3>${esc(benefit.title)}</h3><p>${esc(benefit.text)}</p></div></li>`
            )
            .join("")}
        </ul>
        ${note}
        <nav class="contents">
          <h2>${esc(TEXT.contentsTitle)}</h2>
          <ol>
            ${pages
              .filter((page) => page.kind === "products" && page.first)
              .map(
                ({ group }) => `
            <li><a href="#grupa-${group.id}"><span>${esc(group.title)}</span><span class="dots"></span>
              <span class="number">${firstPageOf(group.id)}</span></a></li>`
              )
              .join("")}
            <li><a href="#kontakt"><span>${esc(TEXT.contentsContact)}</span><span class="dots"></span>
              <span class="number">${pages.length}</span></a></li>
          </ol>
        </nav>
      </div>`,

    products: ({ group, items, first }) => `
      <div class="page-content">
        ${header(TEXT.productsOverline, first ? group.title : `${group.title} (${TEXT.continued})`, first ? `grupa-${group.id}` : null)}
        <ul class="${items.length === 4 && !items.some((item) => item.isService) ? "grid" : "rows"}">
          ${items.map((item) => (item.isService ? serviceHtml(item) : productHtml(item))).join("")}
        </ul>
        ${note}
      </div>`,

    contact: () => `
      <div class="page-content">
        ${header(company.name, TEXT.orderTitle, "kontakt")}
        <ol class="steps">
          ${TEXT.orderSteps.map((step, index) => `<li><span class="step-number">${index + 1}</span><p>${esc(step)}</p></li>`).join("")}
        </ol>
        <div class="contact-section">
          <h2>${esc(TEXT.contactTitle)}</h2>
          <div class="contact-panel"><div class="contact-card">
            <ul class="contact-list">
              <li>${icon(MdPhone)}<div><p class="contact-label">${TEXT.phone}</p>
                <a class="contact-value" href="tel:${esc(company.phone)}">${esc(company.phoneDisplay)}</a></div></li>
              <li>${icon(MdEmail)}<div><p class="contact-label">${TEXT.email}</p>
                <a class="contact-value" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div></li>
              <li>${icon(MdLocationOn)}<div><p class="contact-label">${TEXT.address}</p>
                <p class="contact-value">${esc(company.streetAddress)}, ${esc(company.locality)} ${esc(company.postalCode)} ${esc(company.city)}</p></div></li>
              <li>${icon(MdLanguage)}<div><p class="contact-label">${TEXT.website}</p>
                <a class="contact-value" href="${esc(SITE_URL)}/">${esc(siteHost)}</a></div></li>
            </ul>
            <div class="qr">
              ${qrSvg(contactUrl)}
              <p>${esc(TEXT.qrCaption)}<br><a class="qr-url" href="${esc(contactUrl)}">${esc(contactUrl.replace(/^https:\/\//, ""))}</a></p>
            </div>
          </div></div>
        </div>
      </div>`,
  };

  const body = pages
    .map((page, index) => `
    <section class="page ${page.kind}-page">
      ${render[page.kind](page)}
      ${footer(index + 1)}
    </section>`)
    .join("");

  const fontUrl = (file) => pathToFileURL(path.join(catalogDir, "fonts", file)).href;
  const html = `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="utf-8">
<title>${esc(TEXT.documentTitle)}</title>
<style>
  /* Bundled fonts under their own family name, so a system font is never used instead */
  @font-face { font-family: "Catalog Sans"; font-weight: 400; src: url("${fontUrl("NotoSans-Regular.ttf")}") format("truetype"); }
  @font-face { font-family: "Catalog Sans"; font-weight: 700; src: url("${fontUrl("NotoSans-Bold.ttf")}") format("truetype"); }
</style>
<link rel="stylesheet" href="${pathToFileURL(path.join(catalogDir, "catalog.css")).href}">
</head>
<body>${body}
</body>
</html>
`;
  return { html, missing };
}

// --- PDF --------------------------------------------------------------------------------------

// Runs in the page before printing: fonts and photos loaded, nothing cut off
const checkPage = async () => {
  await document.fonts.ready;
  const problems = [];
  for (const face of document.fonts) {
    if (face.status !== "loaded") problems.push(`font ${face.family} ${face.weight} not loaded (${face.status})`);
  }
  for (const img of document.images) {
    await img.decode().catch(() => problems.push(`photo not loaded: ${decodeURI(img.src)}`));
  }
  document.querySelectorAll(".page").forEach((page, index) => {
    for (const part of page.querySelectorAll(".page-content, .page-footer")) {
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

async function printPdf(htmlFile) {
  const chrome = await launchChrome();
  try {
    const cdp = await connect(chrome.wsUrl);
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const send = (method, params) => cdp.send(method, params, sessionId);

    await send("Page.enable");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const loaded = cdp.once("Page.loadEventFired", sessionId);
    await send("Page.navigate", { url: pathToFileURL(htmlFile).href });
    await loaded;

    const { result, exceptionDetails } = await send("Runtime.evaluate", {
      expression: `(${checkPage})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(`Page check failed: ${exceptionDetails.exception?.description}`);
    if (result.value.length) {
      const message = `The catalogue layout has problems:\n  ${result.value.join("\n  ")}`;
      if (!draft) throw new CatalogError(message);
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
    cdp.close();
    return Buffer.from(data, "base64");
  } finally {
    await chrome.close();
  }
}

// Fonts embedded in the PDF: only the bundled Noto Sans (another font would mean a character that
// Noto Sans lacks was drawn with a system font). Returns null if pdffonts is not installed.
async function embeddedFonts(pdfFile) {
  try {
    const { stdout } = await run("pdffonts", [pdfFile]);
    return stdout.split("\n").slice(2).filter(Boolean).map((line) => line.split(/\s+/)[0].replace(/^[A-Z]{6}\+/, ""));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function renderPreviews(pdfFile, dir) {
  await fs.mkdir(dir, { recursive: true });
  for (const file of await fs.readdir(dir)) {
    if (/^page-\d+\.png$/.test(file)) await fs.rm(path.join(dir, file));
  }
  try {
    await run("pdftoppm", ["-png", "-r", String(PREVIEW_DPI), pdfFile, path.join(dir, "page")]);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.warn("  ! pdftoppm not found (poppler-utils): page images skipped");
    return 0;
  }
  return (await fs.readdir(dir)).filter((file) => /^page-\d+\.png$/.test(file)).length;
}

// A problem the owner can fix (missing text, size limit, layout); printed without a stack trace
class CatalogError extends Error {}

const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

// --- Main -------------------------------------------------------------------------------------

async function main() {
  const data = await loadSiteData();
  const now = new Date();
  const edition = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  // Pages: cover, intro, one or more per product group, how to order / contact
  const pages = [{ kind: "cover" }, { kind: "intro" }];
  const leftOut = [];
  for (const group of data.productGroups) {
    const products = group.products.filter((product) => {
      if (product.inCatalog === false) leftOut.push(product.name);
      return product.inCatalog !== false;
    });
    const services = data.benefits
      .filter((benefit) => benefit.catalog?.group === group.id)
      .map((benefit) => ({ isService: true, title: benefit.title, text: benefit.text, photo: benefit.catalog.photo }));
    const items = [...products, ...services];
    if (!items.length) continue;
    paginate(items).forEach((pageItems, index) => pages.push({ kind: "products", group, items: pageItems, first: index === 0 }));
  }
  pages.push({ kind: "contact" });
  for (const benefit of data.benefits) {
    if (benefit.catalog && !data.productGroups.some((group) => group.id === benefit.catalog.group)) {
      throw new CatalogError(`Benefit "${benefit.title}": no product group with id "${benefit.catalog.group}"`);
    }
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boki-edi-catalog-"));
  try {
    const photoFiles = pages
      .flatMap((page) => page.items ?? [])
      .map((item) => (item.isService ? item.photo : photoFile(item)))
      .filter(Boolean);
    const photos = await preparePhotos(photoFiles, tempDir);

    const { html, missing } = buildHtml(data, photos, pages, edition);
    if (missing.length && !draft) {
      throw new CatalogError(
        `Missing information — the catalogue was not built:\n  ${missing.join("\n  ")}\n` +
          "Add it in src/data/, or leave the product out (inCatalog: false). To see a draft: npm run catalog -- --draft"
      );
    }
    const htmlFile = path.join(tempDir, "katalog.html");
    await fs.writeFile(htmlFile, html);

    const products = data.productGroups.flatMap((group) => group.products).filter((product) => product.inCatalog !== false);
    const pdf = setPdfInfo(await printPdf(htmlFile), {
      Title: TEXT.documentTitle,
      Author: data.company.name,
      Subject: `${data.headline.replace(/ /g, " ")} – katalog proizvoda, ${TEXT.edition.toLowerCase()} ${edition}`,
      Keywords: [...data.productGroups.map((group) => group.title), ...products.map((product) => product.name)].join(", "),
      Creator: "npm run catalog (scripts/make-catalog.mjs)",
    });
    if (pdf.length > MAX_BYTES && !draft) {
      throw new CatalogError(`The PDF is ${formatMB(pdf.length)}, over the 2 MB limit for e-mail attachments: lower PHOTO_SIZE`);
    }

    const pdfFile = path.join(rootDir, OUTPUT.pdf);
    await fs.mkdir(path.dirname(pdfFile), { recursive: true });
    const checkedFile = path.join(tempDir, "katalog.pdf");
    await fs.writeFile(checkedFile, pdf);
    const fonts = await embeddedFonts(checkedFile);
    const foreign = fonts?.filter((font) => !/^NotoSans-(Regular|Bold)$/.test(font)) ?? [];
    if (foreign.length) {
      const message = `Fonts other than the bundled Noto Sans in the PDF: ${foreign.join(", ")} (a character Noto Sans lacks?)`;
      if (!draft) throw new CatalogError(message);
      console.warn(`  ! ${message}`);
    }
    await fs.copyFile(checkedFile, pdfFile);

    const pageNumber = (group) => pages.findIndex((page) => page.group === group) + 1;
    console.log(`Catalogue -> ${OUTPUT.pdf}  (${pages.length} pages, ${formatMB(pdf.length)}, ${TEXT.edition}: ${edition}${draft ? ", DRAFT" : ""})`);
    for (const group of data.productGroups) {
      const names = group.products.filter((product) => product.inCatalog !== false).map((product) => product.name);
      if (names.length) console.log(`  p. ${pageNumber(group)}  ${group.title}: ${names.join(", ")}`);
    }
    if (leftOut.length) console.log(`  Left out (inCatalog: false): ${leftOut.join(", ")}`);
    if (missing.length) console.log(`  Placeholders (draft only): ${missing.join("; ")}`);
    console.log(`  Photos: ${photos.size}, ${formatMB([...photos.values()].reduce((sum, photo) => sum + photo.size, 0))} as JPEG`);
    if (fonts === null) console.warn("  ! pdffonts not found (poppler-utils): font check skipped");

    const previewCount = await renderPreviews(pdfFile, path.join(rootDir, OUTPUT.previews));
    if (previewCount) console.log(`Page images -> ${OUTPUT.previews}/  (${previewCount}, ${PREVIEW_DPI} dpi)`);

    if (OUTPUT.json) {
      const info = {
        file: PUBLIC_PATH,
        downloadName: DOWNLOAD_NAME,
        sizeLabel: `PDF, ${formatMB(pdf.length)}`,
        bytes: pdf.length,
        pages: pages.length,
        edition,
        sourceHash: await catalogSourceHash(rootDir),
      };
      await fs.writeFile(path.join(rootDir, OUTPUT.json), `${JSON.stringify(info, null, 2)}\n`);
      console.log(`Link info -> ${OUTPUT.json}  ("${info.sizeLabel}")`);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof CatalogError ? `\n${error.message}` : error);
  process.exitCode = 1;
}
