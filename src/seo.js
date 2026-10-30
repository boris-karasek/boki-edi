// Title and description of the site (a single page) and of the 404 page. Used at build time
// (scripts/prerender.mjs writes them into <head>, incl. Open Graph, and lists the pages in sitemap.xml)
// and in the browser (usePageMeta).
// Keep titles under ~60 characters and descriptions under ~160 so Google shows them in full.

import { company } from "./data/company.js";

export const SITE_URL = "https://www.boki-edi.com";
export const SITE_NAME = "Boki-Edi";

// Preview image for links shared on Viber, WhatsApp, e-mail, social networks (public/og-image.jpg).
export const OG_IMAGE = {
  path: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Boki-Edi – metalni delovi po meri: lajsne za kalendare, brzovezi, uglovi za A table. Dobanovci, od 2007.",
};

export const pages = {
  "/": {
    title: "Boki-Edi – radnja za proizvodnju sitne metalne galanterije",
    description:
      "Boki-Edi iz Dobanovaca (Beograd) od 2007. izrađuje metalne delove po meri: lajsne za kalendare, brzoveze, mehanike za fascikle, uglove za A table i drugo.",
  },
};

export const notFoundPage = {
  title: "Stranica nije pronađena | Boki-Edi",
  description: "Tražena stranica ne postoji. Posetite naslovnu stranu sajta Boki-Edi.",
  noindex: true,
};

export function getPageMeta(pathname) {
  return pages[pathname] ?? notFoundPage;
}
