# Boki-Edi website

One-page website of Boki-Edi (Dobanovci, Belgrade, since 2007), a workshop that makes small metal parts: calendar strips, folder mechanisms, corners for A-boards and other small hardware. Live at https://www.boki-edi.com.

The site text is Serbian (Latin script); code comments and commits are English. Dimensions, quantities, packaging, lead times and prices are never published: they are agreed with each customer.

**Stack:** Vite + React, pre-rendered to static HTML at build time, hosted on Vercel. The contact form sends e-mail through EmailJS (`@emailjs/browser`).

## Requirements

- **Node.js 20 or newer**
- Optional, only for the generator scripts:
  - **Google Chrome** for the catalogue, the flyers and the screenshots. It's found in its usual place on Linux, macOS and Windows; otherwise set `CHROME=/path/to/chrome`.
  - **poppler-utils** (`pdftoppm`, `pdffonts`) for the catalogue's and flyers' page images and font check. Without it, these steps are skipped with a note.
  - **ImageMagick 7** (`magick`) and the **Noto Sans** fonts (Linux: `fonts-noto-core`) for the link-preview image.

## Setup

```bash
npm install
```

Environment variables (put them in `.env`, which git ignores; never commit values):

| Variable | Used for |
|---|---|
| `REACT_APP_EMAILJS_PUBLIC_KEY` | EmailJS public key for the contact form (also set in Vercel and Netlify) |
| `CHROME` | optional: path to Chrome for the generator scripts |
| `PORT` | optional: port for `npm run preview` (default 4173) |

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Client build, server build, then pre-render: `dist/index.html`, `dist/404.html`, `dist/sitemap.xml`. Warns if the catalogue or a flyer may be out of date. |
| `npm run preview` | Serves `dist/` like Vercel (redirects, clean URLs, headers from `vercel.json`, real 404) |
| `npm run preview:netlify` | Builds and serves the site with Netlify's own tools (`netlify serve`) at http://localhost:8888. Needs Node 22.13 or newer; installs the CLI once under `~/.cache/boki-edi/`. |
| `npm run check:hosting` | Checks redirects, the 404, the PDFs' headers and more on that local server. `-- <url>` checks a deployed address. See [docs/hosting-migration.md](docs/hosting-migration.md). |
| `npm run thumbnails` | Makes the 4:3 card images in `src/assets/thumbs/` from the photos in `src/assets/` |
| `npm run catalog` | Makes `public/katalog.pdf`, `src/data/catalog.json` and `docs/catalog-preview/`. `-- --draft` makes a marked draft in `catalog-draft/`. |
| `npm run flyer` | Makes all flyers; `-- kalendari` makes one, `-- --draft <name>` a draft in `flyer-draft/` |
| `npm run screenshots` | Screenshots of the built site into `docs/screenshots/` (run `npm run build` first) |
| `bash scripts/make-og-image.sh` | Remakes `public/og-image.jpg`, the link-preview image (run after changing the headline) |

## Where to edit

| What | Where |
|---|---|
| Products and groups (group order = tab order) | `src/data/products.js` |
| Photo framing (cards, catalogue, flyers) | `FRAMING` in `scripts/lib/framing.mjs` |
| Address, phone, e-mail | `src/data/company.js` |
| Headline, intro and benefits (site and catalogue) | `src/data/about.js` |
| Page title, description, preview image | `src/seo.js` |
| Flyers | `src/data/flyers.js` |
| Catalogue texts and layout | `TEXT` in `scripts/make-catalog.mjs`, `scripts/catalog/catalog.css` |
| Page sections and menu | `src/pages/Home.jsx`, `src/sections/`, `src/components/NavBar.jsx` |
| Background (brushed steel) | `.background-div` in `src/index.css` |

Keep the section ids (`#pocetna`, `#prednosti`, `#proizvodi`, `#kontakt`) and the group ids unchanged: the menu, the redirects and links already sent to customers use them.

## Adding or changing a product

1. **Photo** (if new or replaced): put the `.webp` in `src/assets/` and run `npm run thumbnails`. Check the card image in `src/assets/thumbs/`: the whole part should be visible with about 20 px of background on every side (the cards zoom on hover). If not, add an entry for the photo to `FRAMING` in `scripts/lib/framing.mjs` and run it again.
2. **Entry** in the right group in `src/data/products.js`: `name`, a short `description` (cards show 2 lines), `...photo("File.webp")` and `alt`. Optional, for the catalogue only: `fullDescription`, `catalogPhoto`, `inCatalog: false`.
3. **Check** it in `npm run dev`.
4. **Catalogue:** run `npm run catalog` and look at `docs/catalog-preview/page-*.png`. If the photo or text is also on a flyer, run `npm run flyer`.
5. **Build:** `npm run build` should print no "may be out of date" warning.
6. **Commit** the photo, its card image, `products.js` and the catalogue outputs (`public/katalog.pdf`, `src/data/catalog.json`, `docs/catalog-preview/`).

The catalogue and the flyers aren't made on Vercel (no Chrome there), so their files are committed.

## Deploy

**The hosting is moving to Netlify:** see the checklist in [docs/hosting-migration.md](docs/hosting-migration.md). `netlify.toml` holds the same settings for Netlify. This section stays valid until the switch.

Pushing to `main` deploys production on Vercel. Project settings:

- Framework Preset: Vite
- Build Command: `npm run build` (not `vite build`, which skips the pre-render)
- Output Directory: `dist`
- Node.js: 20 or newer
- Environment variable `REACT_APP_EMAILJS_PUBLIC_KEY` set

`vercel.json` holds the redirects (`/products` → `/#proizvodi`, `/contact` → `/#kontakt`, 308), clean URLs and the file-name headers for the PDFs. `npm run flyer` adds the header for a new flyer itself, to `netlify.toml` too.

## Links for customers

| Link | Opens |
|---|---|
| https://www.boki-edi.com/#fascikle | Products, Fascikle i registratori tab |
| https://www.boki-edi.com/#kalendari | Products, Kalendari tab |
| https://www.boki-edi.com/#ramovi | Products, Ramovi i A table tab |
| https://www.boki-edi.com/#ostalo | Products, Ostalo tab |
| https://www.boki-edi.com/katalog.pdf | PDF catalogue |
| https://www.boki-edi.com/letak-kalendari.pdf | Flyer for calendar printers (not linked from the site) |

An inquiry with the subject filled in: `/?proizvod=<name>#kontakt`, e.g. https://www.boki-edi.com/?proizvod=Brzovez#kontakt.

## More

- [CHANGES.md](CHANGES.md): history of the reorganisation, decisions, open questions and the merge-and-deploy checklist
- [docs/hosting-migration.md](docs/hosting-migration.md): moving from Vercel to Netlify: checklist, credit budget, rollback
- [docs/design-brief.md](docs/design-brief.md): colors, fonts, layout and the page background

**Local note:** on the NTFS drive, stop `npm run preview` before `npm run build`, otherwise emptying `dist/` fails.
