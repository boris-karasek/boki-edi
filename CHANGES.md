# CHANGES

Log of the website reorganisation: what was done, decisions made, and open questions.
Newest session first.

---

## Session 1 — 2026-10-30 (branch `reorganisation`)

### Done

| # | Issue | Fix | Commit |
|---|-------|-----|--------|
| 1 | `/products` and `/contact` returned 404 when opened directly | Every page is pre-rendered to its own HTML file; `vercel.json` enables clean URLs | `26e71cc` |
| 2 | Empty `index.html`, generic title, meta tags only via JS | Each page ships real HTML with its own `<title>`, description, canonical URL and Open Graph tags | `26e71cc` |
| 3 | Navigation used `<button>` | Menu, logo and calls-to-action are router links (`<a href>`); menu switches with CSS | `ca031c1` |
| 4 | `<html lang="en">` | `lang="sr"` | `26e71cc` |
| 5 | Default `/vite.svg` favicon | Favicons and web manifest served from `public/` | `26e71cc` |
| 6 | No `robots.txt` / `sitemap.xml` | `public/robots.txt`; `sitemap.xml` generated at build time | `26e71cc` |
| 7 | Product images without useful alt text | Descriptive Serbian alt text, width/height, lazy loading | `3008aa7` |
| 8 | Busy AI background image | Light gray "brushed steel" CSS gradient; decorative circles removed | `134bf26`, `6c83e68` |
| 9 | Footer "© 2024" | Current year automatically; footer in Serbian | `134bf26` |
| 10 | Contact page without h1 | h1 on every page; h2/h3 below it (checked on all pages) | `6c83e68`, `3008aa7`, `2407924` |

Also done:
- **Home:** new headline, short intro, 4 benefits, links to the contact and products pages.
- **Products:**
  - grouped into Kalendari / Fascikle i registratori / Ramovi / Ostalo, with one sentence per product and the shared note on dimensions, quantities and packaging
  - "Pošaljite upit" on each product opens the contact form with the subject prefilled ("Upit: <proizvod>")
  - ATŠ mehanizam removed
  - lightbox closes with Escape, a ✕ button, a click outside the photo, or Back
- **Contact:**
  - form keeps the typed message if sending fails, shows errors in red and disables the button while sending
  - fields have labels for screen readers
  - phone and e-mail are clickable
- **404 page:** in Serbian, shown inside the site layout, returned with a real 404 status.
- **Link previews:** `public/og-image.jpg` (1200×630) for Viber, WhatsApp and e-mail.
- **Google:** structured business data (schema.org LocalBusiness) on the home page.
- **Housekeeping:**
  - line endings normalised (`.gitattributes`)
  - unused packages removed
  - react-router-dom updated (security fixes)
  - EmailJS moved to `@emailjs/browser`
  - environment variables read via `import.meta.env`
  - Node ≥ 20 required
- **Navigation:** the page scrolls to the top after client-side navigation.

### How it works now (for future edits)

- **Build:** `npm run build` = client build → server build → `scripts/prerender.mjs`, which writes `dist/index.html`, `products.html`, `contact.html`, `404.html` and `sitemap.xml`.
- **Local check:** `npm run preview` serves `dist/` like Vercel does (clean URLs, real 404). `npm run dev` for development.
- **Where to edit:**
  - page titles and descriptions: `src/seo.js` (a new page also needs a route in `src/App.jsx`)
  - products: `src/data/products.js` (one entry plus one photo in `src/assets/`)
  - address, phone, e-mail: `src/data/company.js` (used on the contact page, in descriptions and in the Google data)
  - background: `src/index.css`; the comment there explains how to use a webp image (under 200 KB) instead
- **Link preview image:** `public/og-image.jpg`. Replace it with any 1200×630 JPG (made with ImageMagick from `Brzovez.webp`).

### Decisions

- **Pre-rendering within the existing Vite + React setup** instead of rewriting as static HTML pages. The code and styling stay; adding a product means one entry in a data file. The trade-off is a two-step build plus a ~100-line script.
- **URLs stay `/products` and `/contact`**, so links already sent to customers keep working. Serbian slugs could be added later with redirects.
- **Unknown URLs return a real 404** (`404.html`) instead of the home page, so Google doesn't index error pages.
- **Dropped `react-helmet`** (unmaintained). Head tags are written at build time; the title also updates during in-app navigation (`usePageMeta`).
- **Dropped the `keywords` meta tag**; Google ignores it.
- **The Vercel variable keeps its name** `REACT_APP_EMAILJS_PUBLIC_KEY` (`envPrefix` in `vite.config.js`), so nothing changes in Vercel.
- **Ugao za 25 / 32 sit under "Ramovi"** because they are used for A-boards (A table).
- **Opružni lim has no description** until its use is confirmed.
- **Product panel and card colors kept;** the page titles (h1) now sit on the light background so they are readable.
- **Deleted background images and ATŠ photos** stay available in git history (e.g. commit `dab4737`).

### Open questions / next steps

- [ ] **Opružni lim:** confirm what it is used for (A-boards?) and add a sentence in `src/data/products.js`.
- [ ] Rename the "Ramovi" group to "Ramovi i A table"?
- [ ] **Otvarač sa stikerom:** who supplies or prints the sticker? The description is neutral for now.
- [ ] **Metalni završeci sa gumicom:** also for planners (rokovnici)? The description now says folders only.
- [ ] **Vercel → Domains:** change the `boki-edi.com` → `www.boki-edi.com` redirect from 307 (temporary) to 308 (permanent).
- [ ] **Vercel → Project Settings → Build:**
  - Build Command must be `npm run build` (the Vite preset default)
  - Output Directory must be `dist`
- [ ] Merge `reorganisation` into `main` and deploy, then check `/products` and `/contact` on the live site, and a link preview in Viber/WhatsApp.
- [ ] **Google Search Console:** add the site and submit the sitemap (steps were given in chat).
- [ ] **info@boki-edi.com forwarding** (optional; steps were given in chat). When it works, change `email` in `src/data/company.js`.
- [ ] **Later:**
  - upgrade Vite 4 → current major (the remaining `npm audit` advisories are in build tools only)
  - run `npx update-browserslist-db@latest`
- [ ] **Local quirk on the NTFS drive:** stop `npm run preview` before `npm run build`, otherwise emptying `dist/` fails (files in use).
