// Texts about the company, used on the home page (src/sections/Hero.jsx, src/sections/Benefits.jsx)
// and in the PDF catalogue (scripts/make-catalog.mjs: cover, intro page). Serbian, Latin script.

// h1 of the page and title of the catalogue cover. \u00a0 is a non-breaking space: it keeps
// "po meri" (and "A table" below) on one line.
export const headline = "Metalni delovi po\u00a0meri";

// Hero paragraph, one sentence per entry. The catalogue cover uses the first sentence as its
// supporting line; the catalogue's intro page shows the whole paragraph.
export const intro = [
  "Proizvodimo kvalitetnu sitnu metalnu galanteriju za potrebe štamparske, grafičke i druge industrije.",
  "U našem proizvodnom programu nalaze se lajsne za kalendare, šetajuća mehanika, brzovezi, uglovi za A\u00a0table i drugi metalni proizvodi.",
  "Uspešno poslujemo od 2007. godine.",
];

// The four benefits below the hero (one row on desktop, 2×2 on phones; also in the catalogue).
// catalog (optional, catalogue only): also show this benefit as a service block on the page of
// product group `group`, with the photo `photo` from src/assets/.
export const benefits = [
  {
    title: "Izrada po meri",
    text: "Delove izrađujemo po porudžbini, prema potrebama vašeg proizvoda.",
  },
  {
    title: "Male i velike serije",
    text: "Radimo i manje količine i veće serije.",
  },
  {
    title: "Montiranje lajsni na kalendare",
    text: "Osim izrade lajsni, montiramo ih i na vaše kalendare.",
    catalog: { group: "kalendari", photo: "Lajsna za kalendare.webp" },
  },
  {
    title: "Direktan kontakt sa proizvođačem",
    text: "Sve dogovarate direktno sa radionicom, bez posrednika.",
  },
];
