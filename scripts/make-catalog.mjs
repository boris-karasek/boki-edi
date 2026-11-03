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
// Pages: 1 cover and about (no footer); then the product groups in 4 columns, flowing over as many
// pages as needed (a group heading always stays with its first row of cards); last, how to order and
// contact. With today's 10 products that is 4 pages.
//
// Needs Google Chrome (scripts/lib/chrome.mjs) and, for the page images and the font check,
// poppler-utils (pdftoppm, pdffonts). The fonts (Noto Sans, OFL) are in scripts/catalog/fonts/.
// Catalogue-only fields of a product (fullDescription, catalogPhoto, inCatalog) are described in
// src/data/products.js; a benefit with `catalog` (src/data/about.js) becomes a service block. How the
// photos are cropped: `catalog` in FRAMING (scripts/lib/framing.mjs).
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
import { frameForCatalog } from "./lib/framing.mjs";
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
const COLUMNS = 4; // cards per row; also in catalog.css (.row)
const PHOTO_SIZE = { width: 800, height: 600 }; // about 500 dpi in the 4 cm photo box, for zooming in
const PREVIEW_DPI = 100;

// Catalogue-only texts (Serbian, Latin script). Everything else comes from the data files.
const TEXT = {
  documentTitle: "Boki-Edi – katalog proizvoda",
  continued: "nastavak",
  service: "Usluga",
  orderTitle: "Kako poručiti",
  orderSteps: [
    "Pošaljite upit telefonom, e-mailom ili preko formulara na sajtu.",
    "Dimenzije, količine, pakovanje i cenu dogovaramo direktno sa vama, prema potrebama vašeg proizvoda.",
    "Delove izrađujemo po porudžbini.",
  ],
  priceNote: "Cene i uslovi na upit.",
  contactTitle: "Kontakt",
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

// A problem the owner can fix (missing text, size limit, layout); printed without a stack trace
class CatalogError extends Error {}

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

// Crops each photo for the catalogue (the part fills about 80 % of the box, scripts/lib/framing.mjs)
// and saves it as JPEG: Chrome embeds JPEG files in the PDF as they are, which keeps the PDF small.
async function preparePhotos(files, dir) {
  const photos = new Map();
  for (const file of new Set(files)) {
    const input = path.join(assetsDir, file);
    await fs.access(input).catch(() => {
      throw new CatalogError(`Photo not found: src/assets/${file}`);
    });
    const { image, filled } = await frameForCatalog(input, file).catch((error) => {
      throw new CatalogError(error.message);
    });
    const output = path.join(dir, file.replace(/\.\w+$/, ".jpg"));
    const info = await image
      .resize(PHOTO_SIZE.width, PHOTO_SIZE.height, { withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(output);
    photos.set(file, { url: pathToFileURL(output).href, width: info.width, size: info.size, filled });
  }
  return photos;
}

// The rows of a group: COLUMNS cards per row. A service block takes the free columns of the last row
// if at least 2 are free, otherwise a row of its own.
function groupRows(products, services) {
  const rows = [];
  for (let i = 0; i < products.length; i += COLUMNS) {
    rows.push(products.slice(i, i + COLUMNS).map((product) => ({ product, span: 1 })));
  }
  for (const service of services) {
    const last = rows.at(-1);
    const used = last ? last.reduce((sum, cell) => sum + cell.span, 0) : COLUMNS;
    if (COLUMNS - used >= 2) last.push({ service, span: COLUMNS - used });
    else rows.push([{ service, span: COLUMNS }]);
  }
  return rows;
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

// groups: [{ group, rows }] (see groupRows). The product pages are made in the browser (layoutPages).
function buildHtml(data, photos, groups, edition) {
  const { company, SITE_URL, headline, intro, benefits } = data;
  const siteHost = new URL(SITE_URL).host;
  const contactUrl = `${SITE_URL}/#kontakt`;
  const inquiryUrl = (name) => esc(`${SITE_URL}/?proizvod=${encodeURIComponent(name)}#kontakt`);
  const missing = [];
  const placeholder = (label, where) => {
    missing.push(where);
    return `<span class="placeholder">${esc(label)}</span>`;
  };

  const footer = `
    <footer class="page-footer">
      <span>${esc(company.name)} · <a href="tel:${esc(company.phone)}">${esc(company.phoneDisplay)}</a> ·
        <a href="${esc(SITE_URL)}/">${esc(siteHost)}</a></span>
      <span>${draft ? `<span class="draft">${TEXT.draft}</span> · ` : ""}${TEXT.edition}: ${esc(edition)} ·
        <span class="page-number"></span></span>
    </footer>`;

  // Photo and name link to the site's contact form with the product as the subject (no visible link)
  const cardHtml = (product) => {
    const file = photoFile(product);
    const description = product.fullDescription ?? product.description;
    const link = inquiryUrl(product.name);
    return `
          <li class="card">
            <a class="photo${file ? "" : " no-photo"}" href="${link}">${
              file ? `<img src="${photos.get(file).url}" alt="${esc(product.alt ?? product.name)}">` : icon(MdBuild)
            }</a>
            <h3><a href="${link}">${esc(product.name)}</a></h3>
            <p>${description ? esc(description) : placeholder(TEXT.missingDescription, `${product.name}: description`)}</p>
          </li>`;
  };

  const serviceHtml = (service, span) => {
    const link = inquiryUrl(service.title);
    return `
          <li class="service" style="grid-column: span ${span}">
            <a class="service-photo" href="${link}"><img src="${photos.get(service.photo).url}" alt="${esc(service.title)}"></a>
            <div class="service-text">
              <p class="service-label">${esc(TEXT.service)}</p>
              <h3><a href="${link}">${esc(service.title)}</a></h3>
              <p>${esc(service.text)}</p>
            </div>
          </li>`;
  };

  // Units for the layout: one per row of cards; the first one of a group carries its heading
  const units = groups
    .map(({ group, rows }) =>
      rows
        .map(
          (row, index) => `
      <div class="unit${index === 0 ? " group-start" : ""}" data-group="${esc(group.title)}">${
        index === 0 ? `\n        <h2 class="group-title" id="grupa-${group.id}">${esc(group.title)}</h2><div class="bar"></div>` : ""
      }
        <ul class="row">${row.map((cell) => (cell.service ? serviceHtml(cell.service, cell.span) : cardHtml(cell.product))).join("")}
        </ul>
      </div>`
        )
        .join("")
    )
    .join("");

  const cover = `
    <section class="page cover-page">
      <div class="cover-band">
        <p class="cover-brand">${esc(company.name.toUpperCase())}</p>
        <h1 class="cover-title">${esc(headline)}</h1>
        <div class="bar"></div>
        <p class="cover-lead">${esc(intro[0])}</p>
        <p class="cover-since">${esc(company.locality)}, od ${company.foundingYear}.</p>
        <p class="cover-site"><a href="${esc(SITE_URL)}/">${esc(siteHost)}</a></p>
      </div>
      <div class="about">
        <p class="intro-text">${esc(intro.slice(1).join(" "))}</p>
        <ul class="benefits">${benefits
          .map(
            (benefit) => `
          <li>${icon(MdCheckCircle)}<div><p class="benefit-title">${esc(benefit.title)}</p><p>${esc(benefit.text)}</p></div></li>`
          )
          .join("")}
        </ul>
      </div>
    </section>`;

  const contact = `
    <section class="page contact-page">
      <div class="page-content">
        <h2 class="page-title">${esc(TEXT.orderTitle)}</h2><div class="bar"></div>
        <ol class="steps">${TEXT.orderSteps
          .map((step, index) => `
          <li><span class="step-number">${index + 1}</span><p>${esc(step)}</p></li>`)
          .join("")}
        </ol>
        <p class="price-note">${esc(TEXT.priceNote)}</p>
        <div class="contact-section">
          <h2 class="page-title">${esc(TEXT.contactTitle)}</h2><div class="bar"></div>
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
      </div>${footer}
    </section>`;

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
<body>${cover}
    <div id="flow" hidden>${units}
    </div>
    <template id="product-page">
      <section class="page products-page"><div class="page-content"></div>${footer}</section>
    </template>${contact}
</body>
</html>
`;
  return { html, missing };
}

// --- PDF --------------------------------------------------------------------------------------

// Runs in the page: places the product rows (#flow) on as many product pages as they need, numbers
// the pages, then checks the result (fonts and photos loaded, nothing cut off). A group's heading
// stays with its first row; a group that continues on a new page gets its heading again, "(nastavak)".
const layoutPages = async (continued) => {
  await document.fonts.ready;
  const problems = [];
  const flow = document.getElementById("flow");
  const template = document.getElementById("product-page");
  const lastPage = document.querySelector(".contact-page");
  let content;
  const newPage = () => {
    const page = template.content.firstElementChild.cloneNode(true);
    lastPage.before(page);
    content = page.querySelector(".page-content");
  };
  const fits = () => content.scrollHeight <= content.clientHeight;

  newPage();
  for (const unit of [...flow.children]) {
    content.append(unit);
    if (fits()) continue;
    if (content.children.length === 1) {
      problems.push(`a row of "${unit.dataset.group}" does not fit on an empty page`);
      continue;
    }
    newPage();
    if (!unit.classList.contains("group-start")) {
      const heading = Object.assign(document.createElement("p"), {
        className: "group-title",
        textContent: `${unit.dataset.group} (${continued})`,
      });
      const bar = Object.assign(document.createElement("div"), { className: "bar" });
      unit.prepend(heading, bar);
      unit.classList.add("group-start");
    }
    content.append(unit);
  }
  flow.remove();

  const pages = [...document.querySelectorAll(".page")];
  const groupPages = {};
  pages.forEach((page, index) => {
    const number = page.querySelector(".page-number");
    if (number) number.textContent = `${index + 1} / ${pages.length}`;
    for (const unit of page.querySelectorAll(".unit")) {
      const list = (groupPages[unit.dataset.group] ??= []);
      if (!list.includes(index + 1)) list.push(index + 1);
    }
  });

  for (const face of document.fonts) {
    if (face.status !== "loaded") problems.push(`font ${face.family} ${face.weight} not loaded (${face.status})`);
  }
  for (const img of document.images) {
    await img.decode().catch(() => problems.push(`photo not loaded: ${decodeURI(img.src)}`));
  }
  pages.forEach((page, index) => {
    for (const part of page.querySelectorAll(".page-content, .page-footer, .cover-band, .about")) {
      if (part.scrollHeight > part.clientHeight + 1 || part.scrollWidth > part.clientWidth + 1) {
        problems.push(
          `page ${index + 1}: ${part.className} does not fit (${part.scrollWidth}×${part.scrollHeight} px ` +
            `in ${part.clientWidth}×${part.clientHeight} px)`
        );
      }
    }
  });
  return { problems, pageCount: pages.length, groupPages };
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
      expression: `(${layoutPages})(${JSON.stringify(TEXT.continued)})`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(`Page layout failed: ${exceptionDetails.exception?.description}`);
    const layout = result.value;
    if (layout.problems.length) {
      const message = `The catalogue layout has problems:\n  ${layout.problems.join("\n  ")}`;
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
    return { pdf: Buffer.from(data, "base64"), layout };
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

const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

// --- Main -------------------------------------------------------------------------------------

async function main() {
  const data = await loadSiteData();
  const now = new Date();
  const edition = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  for (const benefit of data.benefits) {
    if (benefit.catalog && !data.productGroups.some((group) => group.id === benefit.catalog.group)) {
      throw new CatalogError(`Benefit "${benefit.title}": no product group with id "${benefit.catalog.group}"`);
    }
  }
  const leftOut = [];
  const groups = [];
  for (const group of data.productGroups) {
    const products = group.products.filter((product) => {
      if (product.inCatalog === false) leftOut.push(product.name);
      return product.inCatalog !== false;
    });
    const services = data.benefits
      .filter((benefit) => benefit.catalog?.group === group.id)
      .map((benefit) => ({ title: benefit.title, text: benefit.text, photo: benefit.catalog.photo }));
    if (products.length || services.length) groups.push({ group, products, rows: groupRows(products, services) });
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "boki-edi-catalog-"));
  try {
    const photoFiles = groups
      .flatMap(({ rows }) => rows.flat())
      .map((cell) => (cell.service ? cell.service.photo : photoFile(cell.product)))
      .filter(Boolean);
    const photos = await preparePhotos(photoFiles, tempDir);

    const { html, missing } = buildHtml(data, photos, groups, edition);
    if (missing.length && !draft) {
      throw new CatalogError(
        `Missing information — the catalogue was not built:\n  ${missing.join("\n  ")}\n` +
          "Add it in src/data/, or leave the product out (inCatalog: false). To see a draft: npm run catalog -- --draft"
      );
    }
    const htmlFile = path.join(tempDir, "katalog.html");
    await fs.writeFile(htmlFile, html);

    const products = groups.flatMap((entry) => entry.products);
    const printed = await printPdf(htmlFile);
    const { layout } = printed;
    const pdf = setPdfInfo(printed.pdf, {
      Title: TEXT.documentTitle,
      Author: data.company.name,
      Subject: `${data.headline.replace(/ /g, " ")} – katalog proizvoda, ${TEXT.edition.toLowerCase()} ${edition}`,
      Keywords: [...groups.map(({ group }) => group.title), ...products.map((product) => product.name)].join(", "),
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

    console.log(`Catalogue -> ${OUTPUT.pdf}  (${layout.pageCount} pages, ${formatMB(pdf.length)}, ${TEXT.edition}: ${edition}${draft ? ", DRAFT" : ""})`);
    for (const { group, products: groupProducts } of groups) {
      const pages = layout.groupPages[group.title] ?? [];
      console.log(`  p. ${pages.join("–").padEnd(4)} ${group.title}: ${groupProducts.map((product) => product.name).join(", ")}`);
    }
    if (leftOut.length) console.log(`  Left out (inCatalog: false): ${leftOut.join(", ")}`);
    if (missing.length) console.log(`  Placeholders (draft only): ${missing.join("; ")}`);
    const fills = [...photos.values()].map((photo) => photo.filled).filter(Boolean);
    console.log(
      `  Photos: ${photos.size}, ${formatMB([...photos.values()].reduce((sum, photo) => sum + photo.size, 0))} as JPEG; ` +
        `parts fill ${Math.round(Math.min(...fills) * 100)}–${Math.round(Math.max(...fills) * 100)} % of their box`
    );
    if (fonts === null) console.warn("  ! pdffonts not found (poppler-utils): font check skipped");

    const previewCount = await renderPreviews(pdfFile, path.join(rootDir, OUTPUT.previews));
    if (previewCount) console.log(`Page images -> ${OUTPUT.previews}/  (${previewCount}, ${PREVIEW_DPI} dpi)`);

    if (OUTPUT.json) {
      const info = {
        file: PUBLIC_PATH,
        downloadName: DOWNLOAD_NAME,
        sizeLabel: `PDF, ${formatMB(pdf.length)}`,
        bytes: pdf.length,
        pages: layout.pageCount,
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
