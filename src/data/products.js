// Product photos live in src/assets/ (originals, used in the photo viewer); their 4:3 card images
// are in src/assets/thumbs/ (made with `npm run thumbnails`). Refer to a photo by its file name.
const originals = import.meta.glob("../assets/*.webp", { eager: true, import: "default" });
const thumbnails = import.meta.glob("../assets/thumbs/*.webp", { eager: true, import: "default" });

function photo(file) {
  const image = originals[`../assets/${file}`];
  if (!image) throw new Error(`Product photo not found: src/assets/${file}`);
  // Without a card image the grid shows the original photo (scaled to fit).
  return { image, thumbnail: thumbnails[`../assets/thumbs/${file}`] };
}

// Shown once at the top of the #proizvodi section.
export const productNote = "Dimenzije, količine i pakovanje dogovaramo prema potrebama kupca.";

// Products shown in the #proizvodi section, grouped by use (group order = order on the page).
// Each product: name, description (short — cards show 2 lines), photo file + alt (services have no photo).
// The name is also used as the subject of the "Pošaljite upit" contact form.
// Do not add dimensions, quantities, packaging, lead times or prices: these are agreed with each customer.
// New photo: add the .webp to src/assets/, run `npm run thumbnails`, then add the product here.
export const productGroups = [
  {
    id: "fascikle-i-registratori",
    title: "Fascikle i registratori",
    products: [
      {
        name: "Brzovez",
        description: "Metalni mehanizam za fascikle koji drži perforirana dokumenta.",
        ...photo("Brzovez.webp"),
        alt: "Brzovez – metalni mehanizam za fascikle",
      },
      {
        name: "Šetajuća mehanika",
        description: "Metalni mehanizam za fascikle, sličan brzovezu.",
        ...photo("Setajuca mehanika.webp"),
        alt: "Šetajuća mehanika – metalni mehanizam za fascikle",
      },
      {
        name: "Standardna iglica",
        description: "Prodaje se zasebno ili uz brzovez i šetajuću mehaniku.",
        ...photo("Standardna iglica.webp"),
        alt: "Standardna iglica – tanka metalna traka za mehanizme fascikli",
      },
      {
        name: "Metalni završeci sa gumicom",
        description: "Gumica sa metalnim završecima za zatvaranje fascikli.",
        ...photo("Metalni zavrseci sa gumicom.webp"),
        alt: "Gumica sa metalnim završecima na oba kraja",
      },
    ],
  },
  {
    id: "kalendari",
    title: "Kalendari",
    products: [
      {
        name: "Lajsna za kalendare do 1\u00a0m dužine",
        description: "Povezuje listove zidnog kalendara i služi za njegovo kačenje.",
        ...photo("Lajsna za kalendare do 1m duzine.webp"),
        alt: "Metalna lajsna za zidni kalendar sa otvorom za kačenje",
      },
      {
        name: "Montiranje lajsni na kalendare",
        description: "Lajsne montiramo na vaše kalendare.",
        isService: true,
      },
    ],
  },
  {
    id: "ramovi-i-a-table",
    title: "Ramovi i A table",
    products: [
      {
        name: "Zakačka za klik-klak ramove",
        description: "Postavlja se na poleđinu klik-klak rama, za kačenje na zid.",
        ...photo("Zakacka za klik klak ramove.webp"),
        alt: "Metalna zakačka za kačenje klik-klak rama",
      },
      {
        name: "Ugao za 25",
        description: "Metalni ugao koji se koristi u izradi A tabli.",
        ...photo("Ugao za 25.webp"),
        alt: "Metalni ugao za 25 za A table",
      },
      {
        name: "Ugao za 32",
        description: "Metalni ugao koji se koristi u izradi A tabli.",
        ...photo("Ugao za 32.webp"),
        alt: "Metalni ugao za 32 za A table",
      },
    ],
  },
  {
    id: "ostalo",
    title: "Ostalo",
    products: [
      {
        name: "Otvarač",
        description: "Metalni otvarač za flaše.",
        ...photo("Otvarac 1.webp"),
        alt: "Metalni otvarač za flaše",
      },
      {
        name: "Otvarač sa stikerom",
        description: "Sa okruglim poljem za stiker, npr. sa logotipom (na slici bez stikera).",
        ...photo("Otvarac 2.webp"),
        alt: "Metalni otvarač za flaše sa okruglim poljem za stiker, prikazan bez stikera",
      },
      {
        name: "Opružni lim",
        ...photo("Opruzni lim.webp"),
        alt: "Pravougaona pločica od opružnog lima",
      },
    ],
  },
];
