// Title and description for every page. Used at build time (scripts/prerender.mjs writes them
// into each page's <head> and lists the pages in sitemap.xml) and in the browser (usePageMeta).
// Keep titles under ~60 characters and descriptions under ~160 so Google shows them in full.

import { company } from "./data/company.js";

export const SITE_URL = "https://www.boki-edi.com";
export const SITE_NAME = "Boki-Edi";

// Preview image for links shared on Viber, WhatsApp, e-mail, social networks (public/og-image.jpg).
export const OG_IMAGE = {
  path: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Boki-Edi – proizvođač metalnih delova za kalendare, fascikle i klik-ramove, Dobanovci",
};

export const pages = {
  "/": {
    title: "Boki-Edi – metalni delovi za kalendare, fascikle i ramove",
    description:
      "Radionica Boki-Edi iz Dobanovaca od 2007. izrađuje lajsne za kalendare, mehanike za fascikle i delove za ramove — po meri, u malim i velikim serijama.",
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
