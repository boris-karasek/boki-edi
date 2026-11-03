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
// poppler-utils (pdftoppm, pdffonts). Shared with the flyers: scripts/lib/print.mjs, print-base.css and
// the fonts (Noto Sans, OFL) in scripts/lib/fonts/.
// Catalogue-only fields of a product (fullDescription, catalogPhoto, inCatalog) are described in
// src/data/products.js; a benefit with `catalog` (src/data/about.js) becomes a service block. How the
// photos are cropped: `catalog` in FRAMING (scripts/lib/framing.mjs).
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { MdBuild, MdCheckCircle, MdEmail, MdLanguage, MdLocationOn, MdPhone } from "react-icons/md";

import { frameForCatalog } from "./lib/framing.mjs";
import { setPdfInfo } from "./lib/pdf-info.mjs";
import {
  BuildError,
  PREVIEW_DPI,
  checkFonts,
  editionOf,
  esc,
  formatMB,
  htmlDocument,
  icon,
  loadSiteData,
  printPdf,
  qrSvg,
  renderPreviews,
} from "./lib/print.mjs";
import { CATALOG_SOURCES, sourceHash } from "./lib/source-hash.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDir = path.join(rootDir, "scripts", "catalog");
const assetsDir = path.join(rootDir, "src", "assets");

const draft = process.argv.includes("--draft");
const OUTPUT = draft
  ? { pdf: "catalog-draft/katalog-nacrt.pdf", previews: "catalog-draft" }
  : { pdf: "public/katalog.pdf", previews: "docs/catalog-preview", json: "src/data/catalog.json" };
const PUBLIC_PATH = "/katalog.pdf";
const DOWNLOAD_NAME = "Boki-Edi katalog.pdf"; // also in vercel.json (Content-Disposition)
const MAX_BYTES = 2 * 1024 * 1024;
const COLUMNS = 4; // cards per row; also in catalog.css (.row)
const PHOTO_SIZE = { width: 800, height: 600 }; // about 500 dpi in the 4 cm photo box, for zooming in
const SERVICE_PHOTO_SIZE = { width: 1600, height: 1200 }; // shown larger and cropped in the service band

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
// --- Data -------------------------------------------------------------------------------------

// File name (in src/assets/) of the photo the catalogue shows for a product; null if it has none
function photoFile(product) {
  if (product.catalogPhoto) return product.catalogPhoto;
  return product.image ? path.basename(decodeURI(product.image)) : null;
}

// Crops each photo for the catalogue (the part fills about 80 % of the box, scripts/lib/framing.mjs)
// and saves it as JPEG: Chrome embeds JPEG files in the PDF as they are, which keeps the PDF small.
async function preparePhotos(files, dir, size, photos = new Map()) {
  for (const file of new Set(files)) {
    const input = path.join(assetsDir, file);
    await fs.access(input).catch(() => {
      throw new BuildError(`Photo not found: src/assets/${file}`);
    });
    const { image, filled } = await frameForCatalog(input, file).catch((error) => {
      throw new BuildError(error.message);
    });
    const output = path.join(dir, file.replace(/\.\w+$/, ".jpg"));
    const info = await image
      .resize(size.width, size.height, { withoutEnlargement: true })
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
      <div class="band">
        <p class="band-brand">${esc(company.name.toUpperCase())}</p>
        <h1 class="band-title">${esc(headline)}</h1>
        <div class="bar"></div>
        <p class="band-lead">${esc(intro[0])}</p>
        <p class="band-since">${esc(company.locality)}, od ${company.foundingYear}.</p>
        <p class="band-site"><a href="${esc(SITE_URL)}/">${esc(siteHost)}</a></p>
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
        <p class="callout price-note">${esc(TEXT.priceNote)}</p>
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

  const html = htmlDocument({
    title: TEXT.documentTitle,
    stylesheets: [path.join(catalogDir, "catalog.css")],
    body: `${cover}
    <div id="flow" hidden>${units}
    </div>
    <template id="product-page">
      <section class="page products-page"><div class="page-content"></div>${footer}</section>
    </template>${contact}`,
  });
  return { html, missing };
}

// --- PDF --------------------------------------------------------------------------------------

// Runs in the page: places the product rows (#flow) on as many product pages as they need and numbers
// the pages. A group's heading stays with its first row; a group that continues on a new page gets its
// heading again, "(nastavak)". The checks afterwards are shared (checkPage in scripts/lib/print.mjs).
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

  return { problems, pageCount: pages.length, groupPages };
};

// --- Main -------------------------------------------------------------------------------------

async function main() {
  const data = await loadSiteData(rootDir, ["/src/data/products.js", "/src/data/company.js", "/src/data/about.js", "/src/seo.js"]);
  const edition = editionOf(new Date());

  for (const benefit of data.benefits) {
    if (benefit.catalog && !data.productGroups.some((group) => group.id === benefit.catalog.group)) {
      throw new BuildError(`Benefit "${benefit.title}": no product group with id "${benefit.catalog.group}"`);
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
    const cells = groups.flatMap(({ rows }) => rows.flat());
    const cardPhotos = cells.filter((cell) => cell.product).map((cell) => photoFile(cell.product)).filter(Boolean);
    const servicePhotos = cells.filter((cell) => cell.service).map((cell) => cell.service.photo);
    const photos = await preparePhotos(cardPhotos, tempDir, PHOTO_SIZE);
    await preparePhotos(servicePhotos, tempDir, SERVICE_PHOTO_SIZE, photos);

    const { html, missing } = buildHtml(data, photos, groups, edition);
    if (missing.length && !draft) {
      throw new BuildError(
        `Missing information — the catalogue was not built:\n  ${missing.join("\n  ")}\n` +
          "Add it in src/data/, or leave the product out (inCatalog: false). To see a draft: npm run catalog -- --draft"
      );
    }
    const htmlFile = path.join(tempDir, "katalog.html");
    await fs.writeFile(htmlFile, html);

    const products = groups.flatMap((entry) => entry.products);
    const printed = await printPdf(htmlFile, {
      prepare: layoutPages,
      prepareArgs: [TEXT.continued],
      checkSelectors: ".page-content, .page-footer, .band, .about",
      draft,
    });
    const layout = printed.prepared;
    const pdf = setPdfInfo(printed.pdf, {
      Title: TEXT.documentTitle,
      Author: data.company.name,
      Subject: `${data.headline.replace(/ /g, " ")} – katalog proizvoda, ${TEXT.edition.toLowerCase()} ${edition}`,
      Keywords: [...groups.map(({ group }) => group.title), ...products.map((product) => product.name)].join(", "),
      Creator: "npm run catalog (scripts/make-catalog.mjs)",
    });
    if (pdf.length > MAX_BYTES && !draft) {
      throw new BuildError(`The PDF is ${formatMB(pdf.length)}, over the 2 MB limit for e-mail attachments: lower PHOTO_SIZE`);
    }

    const pdfFile = path.join(rootDir, OUTPUT.pdf);
    await fs.mkdir(path.dirname(pdfFile), { recursive: true });
    const checkedFile = path.join(tempDir, "katalog.pdf");
    await fs.writeFile(checkedFile, pdf);
    const fonts = await checkFonts(checkedFile, draft);
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
        sourceHash: await sourceHash(rootDir, CATALOG_SOURCES),
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
  console.error(error instanceof BuildError ? `\n${error.message}` : error);
  process.exitCode = 1;
}
