# CHANGES

Log of the website reorganisation: what was done, decisions made, and open questions.
Newest session first.

---

## Background session — 2026-11-02 (branch `reorganisation`)

Topic: the page background only. Result: a new **brushed-steel background**, chosen by the owner from four CSS variants. Nothing else on the site changed. Nothing was merged or deployed.

### Done

| Request | What changed | Commit |
|---------|--------------|--------|
| Design brief | `docs/design-brief.md`: <ul><li>palette with hex values and where each color is used</li><li>fonts and measured layout</li><li>where the background shows</li><li>the background CSS</li><li>the recommendation</li><li>image sizes and safe zones</li><li>prompts for an image AI</li><li>the compared CSS variants with their contrast check</li></ul> | `74313b1`, `8595b7f` |
| Screenshots | `docs/screenshots/`: first screen at 1920×1080, 1366×768, 390×844; whole page at 1366 and 390 wide. Retake with `npm run screenshots` (after a build). | `179bed0`, `8595b7f` |
| CSS variants compared | Four backgrounds without images, viewed with a temporary `?bg=1…4` switcher: <ol><li>brushed steel</li><li>steel blue with fine grain</li><li>technical-drawing grid</li><li>plain with a band behind the products</li></ol> | `fe9a354` |
| **Brushed steel chosen** | Variant 1 is now the page background (`.background-div` in `src/index.css`): <ul><li>a soft gray-blue gradient</li><li>fine horizontal streaks</li><li>a soft light from the top left</li></ul> Also applies to the 404 page. | `65a0c3e` |
| Switcher removed | Removed: <ul><li>the `dev/` folder</li><li>the Vite plugin</li><li>the injection in `scripts/preview.mjs`</li><li>the variant screenshots</li></ul> `vite.config.js` and `scripts/preview.mjs` are identical to before the session. The variants stay in git history (CSS in `fe9a354`, screenshots in `179bed0`). | `14da125` |
| Image background, ready but off | `.page-bg-image` in `src/index.css` shows an image behind the top of the page that fades into the brushed steel below (desktop/phone, 1× and 2×, webp). `npm run backgrounds` makes the four files from an AI image. | `ca1c42e` |

**Measured:**

- page height: 3112 px at 1920×1080 and at 1366×768; 4718 px at 390×844
- background beside the panels: 408 / 131 / 16 px per side

**Contrast (brushed steel):** every text that sits directly on the background has 7.1:1 or better (WCAG AAA for normal text). The other variants also passed; see the brief, section 10.

**Verified locally:**

- the permanent background is pixel-identical to `?bg=1` at 1366×768 and 390×844
- the production build contains no trace of the switcher
- `/` works; `/products` and `/contact` redirect (308); unknown URLs return 404, and the 404 page looks right on the new background
- the image path was tested with temporary test images in `npm run dev`; they were deleted afterwards

### Decisions

- **Brushed steel (variant 1), chosen by the owner.** The other variants were deleted.
- **Recommended for an image: only behind the top of the page, with CSS below.** Reasons:
  - Below the hero the background shows only in side strips (16 px on a phone).
  - The page is 3100–4700 px tall and grows with every product, so a full-page image would be mostly hidden and stretched.
  - `background-attachment: fixed` doesn't work on iOS Safari.
  - AI tiles rarely repeat without visible seams.
- **The image path stays in the code, switched off,** so an AI image can still be added with a one-line change. If no image is wanted, its rules can be deleted (see the open task).
- **The gradient settles within the first 1400 px** instead of stretching over the whole page height. The top of the page looks the same on every screen and doesn't shift when products are added.
- **Screenshot tooling:** the screenshot script uses the installed Chrome over the DevTools protocol, so there are no new packages. Whole-page screenshots are JPG because as PNG they were over 1.5 MB.
- **Image files go in `public/backgrounds/`** with fixed names, so switching the image on needs no file names in the code.

### How to change the background later

- **Adjust the brushed steel** in `.background-div` in `src/index.css`:
  - streak strength: `opacity='.13'` in the SVG
  - light: the `0.7` in the radial gradient
  - colors: the three gradient stops

  Then check the contrast (limits in the brief, section 8) and retake the screenshots.
- **Add an AI image:**
  1. Generate it with the prompts in `docs/design-brief.md`, section 9.
  2. Run `npm run backgrounds -- desktop.png phone.png`.
  3. In `src/pages/RootLayout.jsx`, change `className="background-div"` to `className="background-div page-bg-image"`. That is the one-line change.
  4. Check in `npm run dev` at laptop and phone size, then build and commit.

### Open questions / next steps

- [x] Choose the background: brushed steel. The switcher and `dev/` were removed (`65a0c3e`, `14da125`).
- [x] Delete the leftover temp folder `/tmp/boki-edi-chrome-BLH2e3`.
- [ ] **AI image: add it or drop it?** Until the image files exist in `public/backgrounds/`, `npm run build` prints four harmless notes: `/backgrounds/… didn't resolve at build time`.
  - **Add it:** follow the steps above.
  - **Drop it:** delete the `.page-bg-image` rules from `src/index.css`, and `scripts/make-backgrounds.mjs` with its `backgrounds` npm script.

  Either way, the notes go away.
- [ ] Session 2 open questions are unchanged (see below).

---

## Session 2 — 2026-10-30 (branch `reorganisation`)

### Done

| Request | What changed | Commit |
|---------|--------------|--------|
| One scrolling page | `/` has the sections `#pocetna`, `#prednosti`, `#proizvodi`, `#kontakt`; former pages are components in `src/sections/` | `03db121` |
| Navigation | Fixed header with anchor links (Početna / Proizvodi / Kontakt); the menu entry of the section on screen is highlighted; smooth scrolling (off for "reduce motion"); `scroll-margin-top` keeps titles below the header; the mobile menu closes after a tap | `03db121` |
| Old URLs | `vercel.json`: `/products` → `/#proizvodi`, `/contact` → `/#kontakt` (308) | `03db121` |
| SEO | Only `/` and `404.html` are pre-rendered; `sitemap.xml` lists `/` only; canonical `https://www.boki-edi.com/`; one h1, h2 per section, h3 per group, h4 per product | `03db121`, `9de2a47` |
| Headline and title | h1 "Metalni delovi po meri", the supporting line, two buttons; new `<title>`; meta/Open Graph description lists the main products; `og-image.jpg` regenerated | `9de2a47` |
| Compact product grid | 2 / 3 / 4 columns; 4:3 image box; description clamped to 2 lines; small "Pošaljite upit"; group chips; benefits in one row (2×2 on mobile) | `512cb69` |
| "Zoomed-in" photos | Cause: portrait photos in a wide 208 px box with `object-fit: cover`, plus `scale-105` on hover. Now 4:3 card images show the whole part with `object-fit: contain` | `512cb69`, `8c1118e` |
| Performance | Product images lazy-loaded; the Google Map is inserted only when the contact section is ~400 px from the screen | `8c1118e`, `7a04dea` |
| Contact layout | Contact details, form and map side by side on desktop, stacked on mobile | `7a04dea` |

**Measured at 1366×768:** when `#proizvodi` starts, the first row of 4 products (Fascikle i registratori) is fully visible. The whole products section is 1687 px, about 2.2 screens.

**Verified locally:** these checks ran in headless Chrome against the built site, served with the same redirects as `vercel.json`. Nothing was deployed.
- clean build
- `/`, `/#proizvodi`, `/#kontakt`, and `/products` / `/contact` (308 to the sections)
- the 404 page, the menu on desktop and mobile, the group chips
- product inquiry → contact form with the subject prefilled, also on a 390×844 phone
- form send and failure: EmailJS requests were intercepted, so no emails were sent
- lightbox, and that the map stays unloaded until the contact section is near
- no console errors

### How it works now (replaces the Session 1 notes)

- **Build:** `npm run build` runs the client build, then the server build, then `scripts/prerender.mjs`. That writes `dist/index.html`, `dist/404.html` and `dist/sitemap.xml`.
- **Local check:**
  - `npm run preview` serves `dist/` like Vercel, using the redirects and clean URLs from `vercel.json` (via `scripts/preview.mjs`)
  - `npm run dev` for development
- **Sections:** the page is assembled in `src/pages/Home.jsx` from `src/sections/` (Hero, Benefits, Products, Contact).
  - Menu entries are in `src/components/NavBar.jsx`.
  - Section ids are used by the menu, the buttons and the redirects; keep them unchanged.
- **Title and descriptions:** `src/seo.js`.
- **Products:** `src/data/products.js` (group order = order on the page). A photo is referenced by its file name.
  - **New or replaced photo:** put the `.webp` in `src/assets/`, then run `npm run thumbnails`. This creates the 4:3 card image in `src/assets/thumbs/`.
  - Check the result; if the part is cut off or too small, add a line for that photo to `FRAMING` in `scripts/make-thumbnails.mjs`.
  - Commit both the photo and its card image.
- **Contact details:** `src/data/company.js`.
- **Link preview image:** after changing the headline, run `bash scripts/make-og-image.sh`. It needs ImageMagick and the Noto Sans fonts.

### Decisions

- **Card images (thumbnails) instead of CSS only.** Photo backgrounds range from `#A6A6A6` to `#D4D4D4` and darken toward the corners, so `object-fit: contain` on one gray left visible edges and made small parts tiny.
  - The script rotates long parts 90°: brzovez, lajsna, šetajuća mehanika, iglica, gumica.
  - Other parts get a 4:3 crop around them.
  - Photos are only ever scaled down. The card images are 3–15 KB; the originals are used in the photo viewer.
- **No source photo is cropped too tightly;** every part is fully inside its frame.
- **Group order:** Fascikle i registratori first, so the first row has 4 products. "Ramovi" was renamed to "Ramovi i A table" (closes a Session 1 question).
- **Shorter product descriptions** so they fit two lines on the cards; the full text is in the HTML and in the photo viewer. Changed:
  - Lajsna
  - Montiranje
  - Standardna iglica
  - Zakačka
  - Otvarač sa stikerom
- **The benefits section has a hidden h2 "Prednosti".** It's in the HTML for Google and screen readers but takes no space on screen; the benefit titles are h3. To show it, remove `sr-only` in `src/sections/Benefits.jsx`.
- **Product inquiries keep the URL form** `/?proizvod=<name>#kontakt`, so such links can be shared. The canonical URL stays `/`, so Google treats them as the home page.
- **The map is inserted by JavaScript when near the screen,** because `loading="lazy"` alone loaded it immediately on desktop. Until then, and without JavaScript, a "Otvori lokaciju u Google mapama" link is shown (Google Maps search by name and address).
- **Schema:** LocalBusiness keeps the same data and gains a `contactPoint` pointing to `/#kontakt`. No Product markup: Google expects prices for it.
- **Tooling:**
  - `serve` was replaced by `serve-handler` (used by `scripts/preview.mjs`)
  - `sharp` was added as a dev dependency (only used by `npm run thumbnails`)
  - neither is used on Vercel

### Open questions / next steps

- [ ] **Deploy and check on Vercel:**
  - `curl -I https://www.boki-edi.com/products` should return `308` with `location: /#proizvodi` (the same for `/contact`)
  - the redirects were only verified locally
- [ ] **Search Console:** after deploying, resubmit `sitemap.xml`. It now has one URL; the old `/products` and `/contact` will drop out over time because of the 308s.
- [ ] **Products section height:** about 2.2 screens at 1366×768 (target "about 2"). To get closer, the 4:3 boxes could become slightly wider (16:10). Your call.
- [ ] **Standardna iglica photo:** it has a soft shadow along one edge that can't be cropped away without cutting the part. A re-shoot on a plain background would fix it.
- [ ] **Still open from Session 1:**
  - Opružni lim description
  - who supplies the sticker on "Otvarač sa stikerom"
  - Metalni završeci for planners
  - Vercel 307→308 for the bare domain
  - Vercel build settings
  - info@ forwarding
  - Vite upgrade

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

### How it works now (for future edits) — superseded by Session 2

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
- **URLs stay `/products` and `/contact`**, so links already sent to customers keep working. Serbian slugs could be added later with redirects. *(Superseded in Session 2: one page; these URLs now redirect with 308 to `/#proizvodi` and `/#kontakt`.)*
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
- [x] Rename the "Ramovi" group to "Ramovi i A table"? — done in Session 2
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
