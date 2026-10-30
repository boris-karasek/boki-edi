// Build step: renders every page to a static HTML file so search engines and link previews
// (Viber, WhatsApp, e-mail) see real content, a title and a description without running JavaScript.
//
// Runs as part of `npm run build`, after the client build (dist/) and the server build (dist-ssr/).
// Output: dist/index.html, dist/products.html, dist/contact.html, dist/404.html and dist/sitemap.xml.
// Vercel serves /products from products.html thanks to "cleanUrls" in vercel.json.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const ssrDir = path.join(rootDir, "dist-ssr");

const { render, pages, notFoundPage, SITE_URL } = await import(
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
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`
    );
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
