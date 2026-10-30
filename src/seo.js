// Title and description for every page. Used at build time (scripts/prerender.mjs writes them
// into each page's <head> and lists the pages in sitemap.xml) and in the browser (usePageMeta).
// Keep titles under ~60 characters and descriptions under ~160 so Google shows them in full.

export const SITE_URL = "https://www.boki-edi.com";
export const SITE_NAME = "Boki-Edi";

export const pages = {
  "/": {
    title: "Boki-Edi – metalni delovi za kalendare, fascikle i ramove",
    description:
      "Radionica Boki-Edi iz Dobanovaca od 2007. izrađuje lajsne za kalendare, mehanike za fascikle i delove za ramove — po meri, u malim i velikim serijama.",
  },
  "/products": {
    title: "Proizvodi – lajsne, brzovez, delovi za ramove | Boki-Edi",
    description:
      "Lajsne za kalendare i montiranje lajsni, brzovez, šetajuća mehanika, iglice, završeci sa gumicom, zakačke i uglovi za ramove. Pošaljite upit.",
  },
  "/contact": {
    title: "Kontakt – Boki-Edi, Dobanovci",
    description:
      "Pošaljite upit radionici Boki-Edi: Janka Čmelika 13, Dobanovci, 11272 Beograd. Telefon +381 60 3331408.",
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
