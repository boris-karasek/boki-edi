# CHANGES

Log of the website reorganisation: what was done, decisions made, and open questions.
Newest session first.

---

## Flyer session — 2026-11-03 (branch `reorganisation`)

Topic: a one-page PDF flyer for printing houses about calendar strips, built from a reusable flyer config. The website is unchanged, and so is the catalogue's content. Nothing was merged or deployed. The merge-and-deploy checklist is at the end of this section.

### The flyer

- **PDF:** `public/letak-kalendari.pdf`, 1 page, 0.11 MB.
  - Link (works once deployed): https://www.boki-edi.com/letak-kalendari.pdf
  - It opens in the browser and saves as "Boki-Edi lajsne za kalendare.pdf".
  - It isn't linked from the site.
- **Image for Viber/WhatsApp:** `marketing/letak-kalendari.jpg`, 1200 × 1697 px, 151 KB. It's in the repository but not on the website.
- **Page image for review:** `docs/flyer-preview/letak-kalendari.png`

From top to bottom:

1. **Band:** BOKI-EDI, "Lajsne za zidne kalendare", and "Izrada po meri i montiranje na vaše kalendare." with "Dobanovci, od 2007." on its own line.
2. **Two photos,** 87 × 58 mm each (the catalogue's cards are 40 mm): the strip on gray, and the close-up of a mounted strip.
3. **The 4 points:**
   - Lajsne izrađujemo po meri, prema formatu vašeg kalendara
   - Male i velike serije
   - Montiranje lajsni na vaše kalendare
   - Direktan dogovor sa proizvođačem, bez posrednika
4. **Highlighted line:** "Kalendari za 2027: pošaljite upit na vreme." with "Cene i uslovi na upit."
5. **Contact card:**
   - the phone number, largest (24 pt)
   - e-mail
   - website
   - a QR code to https://www.boki-edi.com/#kalendari, with "Skenirajte kod i pogledajte lajsne na sajtu:"
6. **Other products:** "Izrađujemo i delove za fascikle i registratore, uglove za A table i drugu sitnu metalnu galanteriju. Ceo katalog: www.boki-edi.com/katalog.pdf"
7. **Footer:** Boki-Edi · phone · website, and "Izdanje: novembar 2026"

Clickable in the PDF:
- the phone and website (in the card and the footer)
- the e-mail
- the QR address
- the catalogue link

### Done

| Request | What changed | Commit |
|---------|--------------|--------|
| Shared print pipeline | <ul><li>The reusable parts of the catalogue script moved to `scripts/lib/print.mjs`:<ul><li>loading the data</li><li>HTML with the bundled fonts</li><li>icons and the QR code</li><li>Chrome printing and the page checks</li><li>the font check and page images</li></ul></li><li>The shared styles moved to `scripts/lib/print-base.css`, with the palette as CSS variables.</li><li>The fonts moved to `scripts/lib/fonts/`.</li><li>The catalogue was regenerated once: all 4 pages are pixel-identical (0 differing pixels at 150 dpi), with the same links, bookmarks and properties.</li></ul> | `f2ad1a4` |
| Flyer generator | <ul><li>`src/data/flyers.js`: one entry per flyer</li><li>`npm run flyer` makes all flyers; `npm run flyer -- kalendari` makes one</li><li>`scripts/make-flyer.mjs` and `scripts/flyer/flyer.css`</li></ul> | `d3d38f2` |
| The calendar flyer | The PDF, the JPG and the page image. `vercel.json` gets the readable file name for `/letak-kalendari.pdf`. | `f414f53` |
| Build warning | `npm run build` also names flyers that may be out of date (fingerprint in `marketing/flyers.json`). | `c79ca7f` |

**Checked:**

- **Page:**
  - exactly one page, viewed as an image
  - balanced: 5–6 mm between blocks, no empty area
  - nothing cut off: the script stops on overflow or a second page
- **Text:** the diacritics display correctly and come out right when copied or searched.
- **Fonts:** only the bundled Noto Sans is embedded.
- **Photos:** 350 ppi; checked at 300 dpi.
- **QR code:** decoded from the page image, the JPG and a 72 dpi render to exactly `https://www.boki-edi.com/#kalendari`. In `npm run preview`, that address selects the Kalendari tab and scrolls it into view, at laptop and phone size.
- **Links in the PDF:**
  - `tel:+381603331408` (2×)
  - `mailto:bokiedi@gmail.com`
  - `https://www.boki-edi.com/` (2×)
  - `/#kalendari`
  - `/katalog.pdf`
- **Properties:** title "Boki-Edi – lajsne za zidne kalendare", author, subject, keywords, language `sr`, tagged.
- **Sizes:** PDF 0.11 MB (limit 1 MB), JPG 151 KB (limit 500 KB), 1200 px wide.
- **In `npm run preview`:** `/letak-kalendari.pdf` → 200, `application/pdf`, `Content-Disposition: inline; filename="Boki-Edi lajsne za kalendare.pdf"`. `/katalog.pdf` is unchanged. Neither page of the site links to the flyer.
- **Safeguards:**
  - with the headline removed, the final build was refused and nothing was written
  - an unknown flyer name lists the existing ones
  - a second run leaves `vercel.json` unchanged
  - after changing the year in `flyers.js`, `npm run build` printed the flyer warning; without changes it is silent

### Decisions

- **Config in `src/data/flyers.js`,** next to the other texts you edit (products, about). The site doesn't use it.
- **The points are in one column,** not 2 × 2 as in the sketch. In a half column, point 1 took three lines; in one column every point fits on one line, which is faster to read.
- **The photo boxes are 3:2,** not 4:3. The framing is the catalogue's; the wider box trims a little gray above and below and gives the page more air.
- **The supporting line is shown one sentence per line.** That applies to any flyer's `lead`.
- **The JPG is taken by Chrome from the same page,** laid out for print, so it needs no extra tools.
- **The script keeps `vercel.json` in step:** it adds the header for a flyer's PDF if it's missing, or updates the name. So a new flyer needs only a config entry. Other entries aren't touched.
- **One fingerprint for all flyers.** Any change to `flyers.js`, the photos or the print code marks all flyers as possibly out of date. `npm run flyer` remakes them all.
- **The catalogue was regenerated once** because its code moved into the shared modules. The pages are pixel-identical.

### How to make a new flyer (e.g. for folder makers)

1. In `src/data/flyers.js`, copy the `kalendari` entry under a new key (e.g. `fascikle`) and change:
   - `file`: the output name, e.g. `"letak-fascikle"` (a-z, 0-9, -). It's also the link, so keep it unchanged once sent.
   - `downloadName`: the name when saved, plain ASCII, e.g. `"Boki-Edi delovi za fascikle.pdf"`
   - `title`, `headline`, `lead`
   - `photos`: file names in `src/assets/`, framed like in the catalogue
   - `points`
   - `callToAction`, `priceNote`
   - `qr`: e.g. `{ path: "/#fascikle", caption: … }`
   - `more`

   Only facts that are on the site; no dimensions, prices, quantities or lead times.
2. `npm run flyer -- --draft fascikle`: look at `flyer-draft/letak-fascikle-nacrt.png`. Missing texts show as "[TEKST – dopuniti]".
3. `npm run flyer -- fascikle` writes:
   - `public/letak-fascikle.pdf`
   - `marketing/letak-fascikle.jpg`
   - `docs/flyer-preview/letak-fascikle.png`
   - `marketing/flyers.json`
   - the header in `vercel.json`
4. Check the page image, then commit all of these and deploy.

If the texts don't fit on one page, the script stops with "does not fit" or "2 pages": shorten them.

### Open questions / next steps

- [ ] **Before the next calendar season:** update the year in "Kalendari za 2027" (`callToAction` in `src/data/flyers.js`), run `npm run flyer`, check `docs/flyer-preview/letak-kalendari.png` and commit. The edition month updates on its own.
- [ ] **The flyer's links and QR code work only once this branch is deployed.** Until then:
  - `/#kalendari` opens the old home page
  - `/letak-kalendari.pdf` and `/katalog.pdf` give a 404
- [ ] **Messaging apps:** links in the JPG aren't clickable, and a phone can't scan a QR code shown on its own screen. Put the link in the message next to the image: https://www.boki-edi.com/letak-kalendari.pdf.
- [ ] **Strip photo (optional):** the photo of the strip alone on gray is a small, soft original (1435 × 1920, 15 KB). It's fine at flyer size, but a new photo would sharpen both the flyer and the catalogue.
- [ ] **Folder-maker flyer:** not made; it needs only a config entry (see above).
- [ ] **Earlier open items are unchanged:**
  - Opružni lim description
  - longer product descriptions
  - the Lajsna alt text and photo size on the site
  - the unused `…veca.webp`
  - the brief's screenshots
  - the Standardna iglica reshoot

### Merge-and-deploy checklist (current; replaces the one in Session 3)

**Before merging**

1. Check the branch:
   - `git status`: clean
   - `npm run build`: prints only the three pre-render lines, with no "may be out of date" warning for the catalogue or the flyers
2. **Pull request** `reorganisation` → `main`. Review it, then merge.

**Vercel**

3. **Project → Settings → Build and Deployment:**
   - Framework Preset: Vite
   - Build Command: `npm run build` (not `vite build`)
   - Output Directory: `dist`
   - Node.js: 20 or newer
   - Environment variable `REACT_APP_EMAILJS_PUBLIC_KEY` still set
4. **Domains:** set the `boki-edi.com` → `www.boki-edi.com` redirect to **308 (permanent)**. It is 307 now.

**After the deployment is live**

5. Redirects:
   - `curl -I https://www.boki-edi.com/products` → `308`, `location: /#proizvodi`
   - `curl -I https://www.boki-edi.com/contact` → `308`, `location: /#kontakt`
   - `curl -I https://boki-edi.com/` → `308` to `https://www.boki-edi.com/`
6. The site:
   - open the four group links (`/#fascikle`, `/#kalendari`, `/#ramovi`, `/#ostalo`) and a product inquiry
   - send yourself one real test message from the form
   - paste `https://www.boki-edi.com/` into a Viber or WhatsApp chat (to yourself): the preview should show the title and `og-image.jpg`. If an old preview appears, it is cached; try again later or add `?v=2` to the link once.
7. **Catalogue:**
   - `curl -I https://www.boki-edi.com/katalog.pdf` → `200`, `content-type: application/pdf`, `content-disposition: inline; filename="Boki-Edi katalog.pdf"`
   - open the link in a browser, then save it: the file name should be "Boki-Edi katalog.pdf"
   - on the site, click "Preuzmite katalog (PDF, 0,3 MB)" in Proizvodi and in Kontakt: both download "Boki-Edi katalog.pdf"
   - scan the QR code on page 4 with a phone: it opens the contact section
8. **Flyer:**
   - `curl -I https://www.boki-edi.com/letak-kalendari.pdf` → `200`, `content-type: application/pdf`, `content-disposition: inline; filename="Boki-Edi lajsne za kalendare.pdf"`
   - open it on a computer and scan its QR code with a phone: the site opens on the **Kalendari** tab
   - in the PDF, click the phone, e-mail, website and "Ceo katalog" links: the last one opens the catalogue
   - send `marketing/letak-kalendari.jpg` to yourself on Viber/WhatsApp and check that it's readable on the phone
9. **Google Search Console:**
   1. Sitemaps → resubmit `https://www.boki-edi.com/sitemap.xml` (one URL)
   2. URL inspection → `https://www.boki-edi.com/` → Request indexing

---

## Catalogue revision — 2026-11-03 (branch `reorganisation`)

Topic: the PDF catalogue's layout only, following your feedback (too stretched and repetitive). The website is unchanged; only its download label now reads "PDF, 0,3 MB", because it comes from `src/data/catalog.json`. Nothing was merged or deployed.

### The catalogue now

- **File:** `public/katalog.pdf`, 4 pages, 0.29 MB (shown as "0,3 MB").
- **Same link:** https://www.boki-edi.com/katalog.pdf
- **Page images:** `docs/catalog-preview/page-1.png` … `page-4.png` (the old pages 5–7 are deleted)

| Page | Content |
|---|---|
| 1 | Cover and about, no footer: <ul><li>the dark band, now the top 43%: BOKI-EDI, "Metalni delovi po meri", underline, first hero sentence, "Dobanovci, od 2007.", website</li><li>below it: hero sentences 2–3, then the 4 benefits as a light 2 × 2 block</li></ul> |
| 2 | Fascikle i registratori (4 cards) and Kalendari: Lajsna, with the "Montiranje lajsni na kalendare" band across the other three columns |
| 3 | Ramovi i A table (3 cards) and Ostalo (2 cards) |
| 4 | Kako poručiti (3 steps), "Cene i uslovi na upit." once, Kontakt with the QR code |

### Done

| Request | What changed | Commit |
|---------|--------------|--------|
| Tighter photos | <ul><li>The catalogue finds each part on the gray background and crops so it fills about 80% of its box (80–87% now; long parts can't be cropped wider than their photo).</li><li>New: `frameForCatalog` in `scripts/lib/framing.mjs`.</li><li>The site's card images are byte-identical.</li></ul> | `21f74d6` |
| 4 pages, flowing groups | <ul><li>One card layout for every group: 4:3 photo (40.5 × 30 mm), name 13 pt, full description 11 pt, 4 per row.</li><li>Groups follow each other and share pages.</li><li>The service band sits in the Kalendari row.</li></ul> | `e9da06b` |
| Removed | <ul><li>the contents page (the PDF bookmarks stay)</li><li>the note box on product pages</li><li>the visible "Pošaljite upit ›" (the photo and the name are now the links to `/?proizvod=<name>#kontakt`)</li><li>the "PROIZVODI" / "BOKI-EDI" labels</li><li>the cover's row of group photos</li><li>the cover's footer</li></ul> | `e9da06b` |
| Fixes | <ul><li>**Bookmark titles of wrapped names:** Chrome dropped the space at the line break ("Šetajućamehanika").</li><li>**Service photo:** prepared larger, since the band shows it bigger than a card (410 ppi instead of 205).</li></ul> | `47c7dcb` |
| Regenerated | PDF, page images, `catalog.json` | `ff4bd1d` |

**Checked:**

- **Pages:** all 4 viewed. Nothing is cut off; the script still stops on any overflow.
- **Text:** the diacritics display correctly and come out right when copied or searched.
- **Fonts:** only the bundled Noto Sans is embedded.
- **Photos:** 356–502 ppi; checked at 300 dpi.
- **QR code:** decodes to exactly `https://www.boki-edi.com/#kontakt` at 72 and 100 dpi.
- **Links:**
  - each product's photo and name link to its inquiry; so do the service's photo and title
  - the footer phone and website are links
  - no visible "Pošaljite upit" is left
- **Bookmarks:** Metalni delovi po meri › 4 groups › their products and the service, then Kako poručiti and Kontakt. All titles are complete.
- **Properties:** title, author, subject, keywords, language `sr`, tagged.
- **Flow test** (temporary data, restored afterwards): with 13 Fascikle products and Opružni lim back in:
  - Fascikle continued on page 3 under "Fascikle i registratori (nastavak)"
  - Kalendari followed on page 3
  - Ramovi and Ostalo moved to page 4, contact to page 5, and the page numbers changed to "x / 5"
  - Opružni lim showed its red placeholder in the draft
- **Placeholder rule:** with Opružni lim back in, the final build was refused (exit code 1) and nothing was written.
- **Site:** `npm run build` prints no "out of date" warning; `dist/katalog.pdf` is the new file.

### Layout rule (replaces the rule in the Catalogue session)

- **Page order:**
  1. cover and about
  2. the product groups, in the order of `products.js`
  3. how to order and contact
- **Products:** 4 cards per row (`COLUMNS` in `scripts/make-catalog.mjs` and `.row` in `catalog.css`).
- **A service block** (a benefit with `catalog` in `about.js`) takes the free columns of its group's last row if at least 2 are free. Otherwise it gets a row of its own.
- **Pages are filled in order:**
  - Each row is placed on the current page; if it doesn't fit, it starts a new page.
  - A group heading always moves together with its first row.
  - A group that continues on a new page gets its heading again, with "(nastavak)".
  - A new page is added only when needed. Today a new row of cards needs about 90 mm, and pages 2 and 3 have about 55 mm free.

  So:
  - Opružni lim fits in the Ostalo row.
  - A 5th product in any group starts a new row, and the catalogue grows to 5 pages.
- **Photo framing:**
  - Automatic: the part fills about 80% of the box.
  - Per photo in `FRAMING` (`scripts/lib/framing.mjs`):
    - `catalog: { fill: 0.75 }`: another share of the box
    - `catalog: { zoom, centerX, centerY }`: a fixed crop, if detection goes wrong
    - `catalog: false`: the site's crop (used for the mounted-strip photo)
  - If no part is found, `npm run catalog` stops with a message naming the photo.

### Open questions / next steps

- [ ] **Free space on pages 2 and 3:** about 55 mm (20%) at the bottom of each. With 4 columns the photo boxes can't grow, and the next group's heading plus its first row (~90 mm) doesn't fit there. I left the space at the bottom rather than spreading the groups apart. It fills up as products are added. If you'd rather have it smaller now, the options are:
  - square photo boxes (taller cards; long parts get more gray above and below)
  - spreading the leftover space between the two groups on a page
- [ ] **Standardna iglica:** after the crop, the shadow along its upper edge is still visible. The reshoot is still planned.
- [ ] Everything else from the Catalogue session below is unchanged:
  - Opružni lim description
  - longer descriptions
  - the Lajsna alt text and photo size on the site
  - the unused `…veca.webp`
  - the brief's screenshots
  - the checks after deploying

---

## Catalogue session — 2026-11-02 (branch `reorganisation`)

Topic: a downloadable PDF product catalogue, generated from the site's data, plus a download link on the site. Nothing was merged or deployed.

### The catalogue

> **Replaced on 2026-11-03** by the 4-page layout: see "Catalogue revision" above. The rest of this section (link, safeguards, how to regenerate) still applies.

- **File:** `public/katalog.pdf`, A4, 7 pages, 0.37 MB (shown as "0,4 MB"). Edition "novembar 2026".
- **Link** (works once deployed): https://www.boki-edi.com/katalog.pdf. It opens in the browser and saves as "Boki-Edi katalog.pdf". The address stays the same when the catalogue is regenerated, so links in e-mails keep working.
- **Page images for review:** `docs/catalog-preview/page-1.png` … `page-7.png`

| Page | Content |
|---|---|
| 1 | Cover: BOKI-EDI, "Metalni delovi po meri", the first hero sentence, "Dobanovci, od 2007.", the website, one photo per product group |
| 2 | O nama: hero text, the 4 benefits, the shared note + "Cene i uslovi na upit.", contents (clickable) |
| 3 | Fascikle i registratori: 4 products, 2 × 2 |
| 4 | Kalendari: Lajsna (strip on gray) + the service block "Montiranje lajsni na kalendare" with the photo of a mounted strip |
| 5 | Ramovi i A table: 3 products |
| 6 | Ostalo: Otvarač, Otvarač sa stikerom (Opružni lim is left out until it has a description) |
| 7 | Kako poručiti (your 3 approved steps) and Kontakt: phone, e-mail, address, website, QR code to https://www.boki-edi.com/#kontakt |

Each product has its photo, name, full description and a clickable "Pošaljite upit ›". The link opens the site's form with the product as the subject. Each product page ends with the shared note. Every page has a footer: Boki-Edi · phone · website · "Izdanje: <month year>" · page number.

### Done

| Request | What changed | Commit |
|---------|--------------|--------|
| Your Lajsna change | Committed as it was: the new name "Lajsna za kalendare", the two new photos, the service card removed from the products | `b5e754f` |
| New Lajsna card image | Upright (not rotated), full width. The old photo keeps its framing, because the catalogue uses it. All other card images are byte-identical. | `361ad54` |
| Shared texts | The hero text and the benefits moved from the components to `src/data/about.js`. The pre-rendered HTML is identical to before. | `d885c04` |
| Shared helpers | The Chrome launcher (`scripts/lib/chrome.mjs`) and the photo framing (`FRAMING`, now in `scripts/lib/framing.mjs`) are used by the thumbnails, the screenshots and the catalogue. The output is unchanged. | `7aef634` |
| Catalogue fields | In `products.js`: <ul><li>`fullDescription` (the four longer texts from before Session 2)</li><li>`catalogPhoto` (Lajsna)</li><li>`inCatalog: false` (Opružni lim)</li></ul> | `33c2eae` |
| Generator | `npm run catalog`: `scripts/make-catalog.mjs`, the styles in `scripts/catalog/catalog.css`, Noto Sans Regular/Bold with their license in `scripts/catalog/fonts/` | `e8fc745`, `eefcabe`, `ce68411`, `1db879b` |
| The PDF | Generated, with the page images | `d9ef82d` |
| Download links | <ul><li>Products: an outlined button "Preuzmite katalog (PDF, 0,4 MB)" next to the note below the tabs</li><li>Contact: a "Katalog proizvoda:" row in "Podaci za kontakt"</li><li>`vercel.json`: the file name header for `/katalog.pdf`</li><li>`npm run preview` now applies the `vercel.json` headers too</li></ul> | `2c8e8df` |

**Verified locally** (nothing deployed):

- **Pages:**
  - all 7 viewed as images
  - nothing cut off: the script checks every page and stops if anything overflows
  - č, ć, š, ž, đ display correctly and come out right when text is copied or searched
- **Fonts:** only the bundled Noto Sans is embedded.
- **Photos:**
  - JPEG, 267–364 ppi on the product pages; the lowest is Zakačka, limited by its original
  - checked at 300 dpi: no visible compression
- **QR code:** decoded from the page images (72, 100 and 150 dpi) to exactly `https://www.boki-edi.com/#kontakt`.
- **Links in the PDF:** all inquiry links, phone, e-mail and website, plus the contents links to pages 3–7.
- **Properties:** title "Boki-Edi – katalog proizvoda", author "Boki-Edi", subject, keywords, language `sr`, tagged PDF (screen readers), bookmarks.
- **Placeholder rule:** with Opružni lim put back in, `npm run catalog` stopped with "Missing information … Opružni lim: description" and wrote nothing. The draft showed a red "[OPIS – dopuniti]".
- **In `npm run preview`:**
  - `/katalog.pdf` → 200, `application/pdf`, `Content-Disposition: inline; filename="Boki-Edi katalog.pdf"`, byte-identical to `public/katalog.pdf`
  - both links clicked in Chrome at 1366×768 and 390×844: each saved "Boki-Edi katalog.pdf", 380,564 bytes; the page stays where it is; no console errors
  - `/products` and `/contact` still 308; unknown URLs 404
- **Build warning:** after changing one character in `products.js`, `npm run build` printed the warning. Without changes it is silent, also in a fresh clone.

### Decisions

- **Separate from `npm run build`.**
  - Making the PDF needs Chrome, which Vercel's build doesn't have.
  - The PDF only changes when products change, so it's committed.
  - `npm run build` warns when products, texts, photos or the catalogue layout have changed since the last `npm run catalog`. The fingerprint is stored in `src/data/catalog.json`.
- **The site's link reads its label from `src/data/catalog.json`.** `npm run catalog` writes it, so the size shown always matches the committed PDF.
- **No unfinished catalogue gets out.** The final PDF is refused if:
  - a placeholder is left
  - a page overflows
  - a font other than the bundled Noto Sans gets embedded (a character Noto Sans lacks)
  - it is over 2 MB

  `npm run catalog -- --draft` builds a marked draft ("NACRT" in the footer) into `catalog-draft/`, which git ignores.
- **Layout rule:**
  - 4 products on a page → 2 × 2 cards; fewer → rows (photo left, text right)
  - more than 4 in a group → the group continues on another page ("nastavak"), split evenly
  - a page with a service block holds at most 3 items
- **Photos are framed exactly like the cards** (same `FRAMING`), at up to 1000×750 px as JPEG. Chrome embeds JPEGs as they are, which is why the PDF is only 0.37 MB.
- **Noto Sans is bundled** in `scripts/catalog/fonts/` (2 × 0.5 MB, unmodified, OFL license next to them). It's loaded under its own name, so a system font can never take its place. The site itself still uses the system font.
- **Document properties:** Chrome sets the title and language. The script appends author, subject and keywords at the end of the file (a standard PDF "incremental update"), with no extra package.
- **New dev dependency:** `qrcode-generator` 2.0.4 (MIT, no dependencies of its own). The QR code is a vector, so it stays sharp when zoomed or printed.
- **Readable file name:** the site links use `download="Boki-Edi katalog.pdf"`. Direct links (e-mails) get the same name from the `Content-Disposition` header. It is `inline`, so the PDF opens in the browser instead of downloading straight away.
- **Chrome is found** in its usual place on Linux, macOS and Windows, so the catalogue can be regenerated on another computer. Elsewhere, set `CHROME=/path/to/chrome`. The page images and the font check also need poppler (`pdftoppm`, `pdffonts`); without it they are skipped with a note.

### How to regenerate the catalogue

1. Change the product in `src/data/products.js` (and its photo + `npm run thumbnails`, as before). Catalogue-only fields, all optional:
   - `fullDescription`: a longer text for the catalogue
   - `catalogPhoto`: a different photo
   - `inCatalog: false`: leave the product out
2. Run `npm run catalog`. It prints the pages and products and writes:
   - `public/katalog.pdf`
   - `src/data/catalog.json`
   - `docs/catalog-preview/`
3. Look at `docs/catalog-preview/page-*.png`, or open the PDF.
4. Commit the three outputs, then deploy.

Notes:

- The edition month is the date of the run.
- The catalogue's own texts are in `TEXT` at the top of `scripts/make-catalog.mjs`: the "Kako poručiti" steps, headings, the QR caption.
- The colors and sizes are in `scripts/catalog/catalog.css`.
- The intro text and benefits come from `src/data/about.js`, so they also change the site.
- A benefit with `catalog: { group, photo }` becomes a service block on that group's page.

### Open questions / next steps

- [ ] **Opružni lim:** send me its description. Then remove `inCatalog: false` in `products.js` and run `npm run catalog`. It goes on page 6 with the other "Ostalo" products.
- [ ] **Longer descriptions** for the other 6 products (optional; for now they have their one sentence).
- [ ] **Standardna iglica photo:** after the reshoot, replace the file, then run `npm run thumbnails` and `npm run catalog`.
- [ ] **Lajsna on the site:**
  - The alt text still describes the strip alone ("…sa otvorom za kačenje"), while the site now shows the mounted strip. Suggestion: "Metalna lajsna montirana na zidni kalendar". The catalogue's strip photo would then need its own alt text (a small change).
  - The new photo is 3024×4032 / 362 KB. The photo viewer loads it whole; the other originals are 1435×1920 and under 75 KB. Scaling it down to 1435×1920 would cut it to about 100 KB.
- [ ] **`Lajsna za kalendare veca.webp` is unused** but still deployed: every photo in `src/assets/` is bundled, so 517 KB plus its card image go out with the site, though no page loads them. Delete it (and its card image) if you don't need it.
- [ ] **Design brief and screenshots** (`docs/`) still show the page before the Lajsna rename and the links. Page height is now 1997 px at 1366 wide (brief: 2008) and 3414 px at 390 (brief: 3282). Retake with `npm run build`, then `npm run screenshots`, when convenient.
- [ ] **After deploying:**
  - open https://www.boki-edi.com/katalog.pdf
  - check it saves as "Boki-Edi katalog.pdf"
  - scan the QR code on page 7 with a phone

  The header was only checked locally.
- [ ] **Merge and deploy:** see the current checklist in the Flyer session at the top of this file.
- [ ] **Still open from earlier sessions:**
  - who supplies the sticker on "Otvarač sa stikerom"
  - Metalni završeci for planners
  - info@ forwarding: when it works, change `email` in `src/data/company.js` and run `npm run catalog`
  - Vite upgrade

---

## Session 3 — 2026-11-02 (branch `reorganisation`)

Topic: product groups as tabs, scroll animations, hover zoom on product cards, and removing the switched-off image background. Nothing was merged or deployed.

### Links for customers

Each product group has its own link. It opens the products section with that group's tab selected. These links work once the branch is deployed.

| Group | Link |
|---|---|
| Fascikle i registratori | https://www.boki-edi.com/#fascikle |
| Kalendari | https://www.boki-edi.com/#kalendari |
| Ramovi i A table | https://www.boki-edi.com/#ramovi |
| Ostalo | https://www.boki-edi.com/#ostalo |

Other links that keep working:

- all products (first group open): https://www.boki-edi.com/#proizvodi
- contact: https://www.boki-edi.com/#kontakt
- an inquiry with the subject already filled in: click "Pošaljite upit" on a product and copy the address from the browser. Example: https://www.boki-edi.com/?proizvod=Brzovez#kontakt

The group ids (`fascikle`, `kalendari`, `ramovi`, `ostalo`) are set in `src/data/products.js`. Don't change them once links have been sent.

### Done

| Request | What changed | Commit |
|---------|--------------|--------|
| Cleanup | Removed the switched-off image background: <ul><li>the `.page-bg-image` CSS</li><li>`scripts/make-backgrounds.mjs` and its `backgrounds` npm script</li><li>the image sections of the design brief (recoverable from `ca1c42e` / `e063139`)</li></ul> Browserslist data was updated too, so `npm run build` prints no notes or warnings. | `c18d68c` |
| Product tabs | The group chips became a tab row: <ul><li>tablist / tab / tabpanel roles, ←/→/Home/End, a focus ring</li><li>"Fascikle i registratori" open by default, 250 ms crossfade</li><li>all groups in the pre-rendered HTML; inactive ones are invisible</li><li>the panel area is as tall as the tallest group, so nothing below moves</li><li>one tab row that scrolls sideways on a phone</li><li>the shared note is now below the panel</li></ul> | `b74a814` |
| Deep links | `/#fascikle`, `/#kalendari`, `/#ramovi`, `/#ostalo` open that tab, with the tab row visible below the header | `b74a814` |
| Scroll animations | Fade in with a 20 px upward move, 500 ms, once each: <ul><li>section headings</li><li>benefit items (staggered)</li><li>product cards (staggered 60 ms)</li><li>contact blocks</li></ul> The hero shows immediately; its 1 s fade-in was removed. | `64af525` |
| Hover zoom | The photo zooms to 1.05 inside its box and the card lifts 4 px (250 ms). Only on devices with a mouse; keyboard focus gets the same highlight; off with reduced motion. Three card images were re-framed so no part is cut off while zoomed. | `3721329` |
| Screenshots | `docs/screenshots/` retaken; the brief's page measurements updated | `8d28084` |

**Page height:** 2008 px at 1366×768, down from 3112, and 3282 px at 390×844, down from 4718. This resolves the Session 2 question about the products section being 2.2 screens tall. It now takes 366 px on desktop.

**Verified locally** (headless Chrome on the built site, served with the `vercel.json` rules; nothing deployed):

- **Clean build:** `npm run build` prints only the three pre-render lines.
- **Tabs, at 1366×768 and 390×844** (24 checks each):
  - mouse and keyboard, including wrap-around, Home/End and the Tab key into the visible group
  - **layout shift 0**: the panel height, the note and `#kontakt` stay at the same pixel position for every switch
  - the tab row is one line (on a phone it scrolls, keeping the selected tab in view without moving the page)
  - all four deep links
  - inquiry and lightbox from non-default tabs
- **Built HTML:** contains all 12 product names and 11 descriptions.
- **No hydration warnings** with a development-React build on five entry URLs. A deliberately changed HTML was detected, so the check works.
- **Animations:**
  - play once, staggered
  - nothing on the first screen is hidden
  - layout shift 0 during load and scrolling
  - with reduced motion nothing moves (no crossfade, no smooth scroll)
  - with JavaScript disabled everything is visible: all four groups with their titles, no tab row
- **Hover:**
  - on every card; screenshots of the 5 long parts while zoomed show their ends inside the box
  - no zoom after a tap with touch emulation, or with reduced motion
  - keyboard focus gets the same highlight
- **Unchanged and still working:**
  - menu and mobile menu
  - `/products` and `/contact` → 308
  - real 404
  - inquiry → contact form (send and failure simulated; no emails sent)
  - no console errors

### Decisions

- **Tabs only with JavaScript.** A one-line script in `index.html` adds the class `js` to `<html>` before the page is drawn, and the tab layout applies only then.
  - There's no flicker and no hydration mismatch.
  - Without JavaScript the page shows all groups one below the other.
  - The group titles (h3) stay in the HTML; with tabs they're visually hidden, because the tab shows the name.
- **Constant panel height from CSS, not JavaScript.** All groups sit in the same grid cell, so the area is as tall as the tallest group at every width.
  - On a phone, "Kalendari" (2 cards) leaves empty space below its cards. That's the price of nothing jumping.
- **Clicking a tab doesn't change the address.** Deep links work in, and on a fresh load the selected tab switches right after the page starts.
- **Reveal without hiding visible content.** The starting state is applied by the app after it starts, and only to elements still below the screen.
  - No animation library was added; about 1 KB of code.
  - Cards in the other tabs are revealed together with the visible ones, so switching tabs is only the crossfade.
- **Hover zoom 1.05 for all cards** (your choice). Card images keep at least 25 px of background around each part; the zoom hides about 16 px.
  - Šetajuća mehanika and Standardna iglica: a slightly wider crop. On iglica the photo's edge shadow is now a little more visible.
  - Lajsna runs almost edge to edge, so 60 px of the photo's own edge is added first (new `extend` option in `scripts/make-thumbnails.mjs`).
- **Image background dropped;** the CSS brushed steel stays.

### How it works now (additions to Session 2)

- **Product tabs:** `src/sections/Products.jsx`, plus the "Product tabs" rules in `src/index.css`. The tab order is the group order in `src/data/products.js`. A new group automatically gets a tab and a link (`/#<id>`).
- **Scroll reveal:** add `{...revealProps(index)}` (from `src/hooks/useRevealOnScroll.js`) to an element to make it fade in. The index staggers items 60 ms apart.
- **Hover zoom:** the "Product card hover" rules in `src/index.css`.
- **New photo:** as before (`npm run thumbnails`), but also check that the part has about 20 px of background on every side of the card image, for the hover zoom. If needed, adjust `zoom` or use `extend` in `FRAMING`.
- **Screenshots:** `npm run build`, then `npm run screenshots`.

### Open questions / next steps

- [ ] **Merge and deploy:** see the current checklist in the Flyer session at the top of this file.
- [ ] **Standardna iglica photo:** the edge shadow is slightly more visible after re-framing; a re-shoot would fix it.
- [ ] **Still open from Session 1:**
  - Opružni lim description
  - who supplies the sticker on "Otvarač sa stikerom"
  - Metalni završeci for planners
  - info@ forwarding
  - Vite upgrade (the remaining `npm audit` notes are in build tools only)

### Merge-and-deploy checklist

Replaced by the current checklist in the Flyer session (2026-11-03) at the top of this file.

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
- [x] **AI image: add it or drop it?** → dropped in Session 3 (`c18d68c`). Until the image files exist in `public/backgrounds/`, `npm run build` prints four harmless notes: `/backgrounds/… didn't resolve at build time`.
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
- [x] **Products section height:** about 2.2 screens at 1366×768 (target "about 2"). To get closer, the 4:3 boxes could become slightly wider (16:10). Your call. → Resolved in Session 3: the groups are tabs; the section is now 366 px tall on desktop.
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
