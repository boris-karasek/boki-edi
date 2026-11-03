// Build step: renders every page to a static HTML file so search engines and link previews
// (Viber, WhatsApp, e-mail) see real content, a title and a description without running JavaScript.
//
// Runs as part of `npm run build`, after the client build (dist/) and the server build (dist-ssr/).
// Output: one HTML file per entry in src/seo.js (currently only dist/index.html — the site is a single
// page), dist/404.html and dist/sitemap.xml. With "cleanUrls" in vercel.json, /x is served from x.html.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { CATALOG_SOURCES, FLYER_SOURCES, sourceHash } from "./lib/source-hash.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const ssrDir = path.join(rootDir, "dist-ssr");

const { render, pages, notFoundPage, SITE_URL, OG_IMAGE, company } = await import(
  pathToFileURL(path.join(ssrDir, "entry-server.mjs")).href
);

const template = await fs.readFile(path.join(distDir, "index.html"), "utf8");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Structured data (schema.org) so Google can show the business name, address and phone.
function localBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: pages["/"].description,
    url: `${SITE_URL}/`,
    image: SITE_URL + OG_IMAGE.path,
    telephone: company.phone,
    email: company.email,
    foundingDate: String(company.foundingYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.streetAddress,
      addressLocality: company.locality,
      postalCode: company.postalCode,
      addressRegion: company.city,
      addressCountry: company.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: company.phone,
      email: company.email,
      availableLanguage: "sr",
      url: `${SITE_URL}/#kontakt`,
    },
  };
  // Escape "<" so the JSON can never close the <script> element early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

function headTags(page, url) {
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
  ];

  if (page.noindex) {
    tags.push(`<meta name="robots" content="noindex" />`);
  } else {
    tags.push(
      `<link rel="canonical" href="${url}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="Boki-Edi" />`,
      `<meta property="og:locale" content="sr_RS" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
      `<meta property="og:image" content="${SITE_URL}${OG_IMAGE.path}" />`,
      `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
      `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(OG_IMAGE.alt)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  }

  if (page === pages["/"]) {
    tags.push(localBusinessJsonLd());
  }

  return tags.join("\n    ");
}

function renderPage(urlPath, page) {
  const html = template
    // Function replacers avoid special handling of "$" sequences in the inserted text.
    .replace(/<title>.*?<\/title>/s, () => headTags(page, SITE_URL + urlPath))
    .replace("<!--app-html-->", () => render(urlPath));

  if (html.includes("<!--app-html-->")) {
    throw new Error(`Pre-rendering ${urlPath} failed: placeholder not replaced`);
  }
  return html;
}

function outputFileFor(urlPath) {
  return urlPath === "/" ? "index.html" : `${urlPath.slice(1)}.html`;
}

const outputs = Object.entries(pages).map(([urlPath, page]) => [urlPath, page, outputFileFor(urlPath)]);
// Any unknown URL matches the "*" route, so "/404" renders the "not found" page.
outputs.push(["/404", notFoundPage, "404.html"]);

for (const [urlPath, page, fileName] of outputs) {
  await fs.writeFile(path.join(distDir, fileName), renderPage(urlPath, page));
  console.log(`prerendered ${urlPath.padEnd(10)} -> dist/${fileName}`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(pages)
  .map((urlPath) => `  <url><loc>${SITE_URL}${urlPath}</loc></url>`)
  .join("\n")}
</urlset>
`;
await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemap);
console.log("generated  sitemap.xml");

await fs.rm(ssrDir, { recursive: true, force: true });

// The PDF catalogue (public/katalog.pdf) and the flyers (public/letak-*.pdf) are not part of the build:
// they need Chrome and are committed. Warn when what they are made from has changed since
// `npm run catalog` / `npm run flyer` last ran.
const catalog = JSON.parse(await fs.readFile(path.join(rootDir, "src", "data", "catalog.json"), "utf8"));
if (catalog.sourceHash !== (await sourceHash(rootDir, CATALOG_SOURCES))) {
  console.warn(
    "\n! public/katalog.pdf may be out of date: products, texts, photos or the catalogue layout changed\n" +
      "  since it was made. Run `npm run catalog`, check docs/catalog-preview/, then commit."
  );
}
const flyers = JSON.parse(await fs.readFile(path.join(rootDir, "marketing", "flyers.json"), "utf8").catch(() => "{}"));
const flyerHash = await sourceHash(rootDir, FLYER_SOURCES);
const staleFlyers = Object.entries(flyers).filter(([, flyer]) => flyer.sourceHash !== flyerHash);
if (staleFlyers.length) {
  console.warn(
    `\n! Flyers may be out of date: ${staleFlyers.map(([, flyer]) => flyer.pdf).join(", ")}. Texts, photos or the\n` +
      "  layout changed since they were made. Run `npm run flyer`, check docs/flyer-preview/, then commit."
  );
}
