import lajsna from "../assets/Lajsna za kalendare do 1m duzine.webp";
import brzovez from "../assets/Brzovez.webp";
import setajucaMehanika from "../assets/Setajuca mehanika.webp";
import standardnaIglica from "../assets/Standardna iglica.webp";
import metalniZavrseci from "../assets/Metalni zavrseci sa gumicom.webp";
import zakacka from "../assets/Zakacka za klik klak ramove.webp";
import ugao25 from "../assets/Ugao za 25.webp";
import ugao32 from "../assets/Ugao za 32.webp";
import otvarac from "../assets/Otvarac 1.webp";
import otvaracSaStikerom from "../assets/Otvarac 2.webp";
import opruzniLim from "../assets/Opruzni lim.webp";

// Shown once at the top of the #proizvodi section.
export const productNote = "Dimenzije, količine i pakovanje dogovaramo prema potrebama kupca.";

// Products shown in the #proizvodi section, grouped by use (group order = order on the page).
// Each product: name, description (short — cards show 2 lines), image + alt (optional — services have no photo).
// The name is also used as the subject of the "Pošaljite upit" contact form.
// Do not add dimensions, quantities, packaging, lead times or prices: these are agreed with each customer.
// Product photos: webp, portrait 3:4 (all current photos are 1435×1920).
export const productGroups = [
  {
    id: "fascikle-i-registratori",
    title: "Fascikle i registratori",
    products: [
      {
        name: "Brzovez",
        description: "Metalni mehanizam za fascikle koji drži perforirana dokumenta.",
        image: brzovez,
        alt: "Brzovez – metalni mehanizam za fascikle",
      },
      {
        name: "Šetajuća mehanika",
        description: "Metalni mehanizam za fascikle, sličan brzovezu.",
        image: setajucaMehanika,
        alt: "Šetajuća mehanika – metalni mehanizam za fascikle",
      },
      {
        name: "Standardna iglica",
        description: "Prodaje se zasebno ili uz brzovez i šetajuću mehaniku.",
        image: standardnaIglica,
        alt: "Standardna iglica – tanka metalna traka za mehanizme fascikli",
      },
      {
        name: "Metalni završeci sa gumicom",
        description: "Gumica sa metalnim završecima za zatvaranje fascikli.",
        image: metalniZavrseci,
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
        image: lajsna,
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
        image: zakacka,
        alt: "Metalna zakačka za kačenje klik-klak rama",
      },
      {
        name: "Ugao za 25",
        description: "Metalni ugao koji se koristi u izradi A tabli.",
        image: ugao25,
        alt: "Metalni ugao za 25 za A table",
      },
      {
        name: "Ugao za 32",
        description: "Metalni ugao koji se koristi u izradi A tabli.",
        image: ugao32,
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
        image: otvarac,
        alt: "Metalni otvarač za flaše",
      },
      {
        name: "Otvarač sa stikerom",
        description: "Sa okruglim poljem za stiker, npr. sa logotipom (na slici bez stikera).",
        image: otvaracSaStikerom,
        alt: "Metalni otvarač za flaše sa okruglim poljem za stiker, prikazan bez stikera",
      },
      {
        name: "Opružni lim",
        image: opruzniLim,
        alt: "Pravougaona pločica od opružnog lima",
      },
    ],
  },
];
