// One-page PDF flyers for first contact by e-mail (scripts/make-flyer.mjs). Not used by the site.
//   npm run flyer -- kalendari    makes one flyer (its key below)
//   npm run flyer                 makes all of them
// Each flyer gives public/<file>.pdf (https://www.boki-edi.com/<file>.pdf, not linked from the site),
// marketing/<file>.jpg (the same page as an image for Viber/WhatsApp) and docs/flyer-preview/<file>.png.
// Phone, e-mail and website come from src/data/company.js; the photos from src/assets/ (framed like
// in the catalogue, see FRAMING in scripts/lib/framing.mjs).
// Texts: Serbian, Latin script, only facts that are on the site. Never dimensions, prices,
// quantities or lead times: these are agreed with each customer.
export const flyers = {
  kalendari: {
    file: "letak-kalendari", // output name (stable: links in e-mails point to it)
    downloadName: "Boki-Edi lajsne za kalendare.pdf", // name when saved; plain ASCII, no quotes
    title: "Boki-Edi – lajsne za zidne kalendare", // document title (PDF properties)
    headline: "Lajsne za zidne kalendare",
    lead: "Izrada po meri i montiranje na vaše kalendare. Dobanovci, od 2007.",
    photos: [
      { file: "Lajsna za kalendare do 1m duzine.webp", alt: "Metalna lajsna za zidni kalendar sa otvorom za kačenje" },
      { file: "Lajsna za kalendare.webp", alt: "Metalna lajsna montirana na zidni kalendar" },
    ],
    points: [
      "Lajsne izrađujemo po meri, prema formatu vašeg kalendara",
      "Male i velike serije",
      "Montiranje lajsni na vaše kalendare",
      "Direktan dogovor sa proizvođačem, bez posrednika",
    ],
    // Update the year before each calendar season
    callToAction: "Kalendari za 2027: pošaljite upit na vreme.",
    priceNote: "Cene i uslovi na upit.",
    // The QR code opens this page of the site (/#kalendari: the products section, Kalendari tab)
    qr: { path: "/#kalendari", caption: "Skenirajte kod i pogledajte lajsne na sajtu:" },
    more: {
      text: "Izrađujemo i delove za fascikle i registratore, uglove za A table i drugu sitnu metalnu galanteriju.",
      linkLabel: "Ceo katalog:",
      path: "/katalog.pdf",
    },
  },
};
