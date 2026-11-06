# SEO audit: boki-edi.com

**Audit date:** 2026-11-06. **Commit audited:** `d9752e1` (`main`). No code was changed. Lighthouse and the prototypes ran outside the project (see Appendix A).

Website texts in this report are in Serbian (Latin script). `[POTVRDITI]` marks every fact that isn't in the repository and that you must confirm or fill in before publishing.

---

## 1. Summary

- **What is live:** everything. Branch `reorganisation` was merged (PR #1) and no longer exists. The live home page is byte-identical to today's local build, and both PDFs match by SHA-256.
- **Current state:** the technical base is good. Lighthouse mobile on the live site: Performance 99–100, Accessibility 100, Best Practices 100, SEO 100. All content is in the HTML without JavaScript. The problem is relevance, not speed.
- **Problem 1:** no page is about šetajuća mehanika. The phrase is missing from the title, meta description, h1, link preview and schema. It appears only as the second item in a sentence, on the second card, with a 7-word description.
- **Problem 2:** one URL carries every product, so neither top keyword can have its own title, h1 or text. Lajsna, the seasonal product, sits in a closed tab during its peak.
- **Problem 3:** nobody can see results. There is no analytics, and I can't tell whether Search Console is set up. Rankings could not be measured in this audit (see 2.9).
- **The blocker:** the repository has only one sentence about what šetajuća mehanika is. The page needs your answers to the 7 questions in 2.1. Phase 1 doesn't depend on them.

---

## 2. Šetajuća mehanika plan

### 2.1 What is known, and what I need from you

**What the repository says (all of it):**

| Fact | Source |
|---|---|
| "Metalni mehanizam za fascikle, sličan brzovezu." | `src/data/products.js:40` |
| Standardna iglica "isporučuje se zasebno ili zajedno sa brzovezom ili šetajućom mehanikom" | `src/data/products.js:48` |
| It belongs to the group "Fascikle i registratori" | `src/data/products.js:30` |
| Customers are businesses, including makers of folders and binders | `docs/design-brief.md:3` |
| Made to order, small and large series, direct contact with the workshop | `src/data/about.js:19-37` |
| One photo: a metal strip with two round holes and a stamped middle section | `src/assets/Setajuca mehanika.webp` |

It has no `fullDescription`. The repository doesn't say which folders it fits, or what "šetajuća" refers to.

**Questions for the owner (these unblock the page):**

1. Which folders does it go into: PVC, PP, cardboard? Do the words "polumehanika" or "fascikla sa mehanizmom" apply? (Sellers use them; see 2.2.)
2. Does it also go into registratori? The group title says so, but no product text does.
3. What does "šetajuća" refer to, and how does the part work? Does it hold perforated documents, as the brzovez does?
4. How does it differ from a brzovez, and when would a buyer choose one over the other?
5. Material and finish? (No dimensions.)
6. Who usually buys it: folder makers, printing houses, office-supply wholesalers?
7. Do you deliver outside Belgrade? To the region?

**Photos I need:** a close-up, the part mounted in a folder, and the part with its iglica. Only one photo exists today.

### 2.2 Why this is winnable

I read the top pages returned for the phrase. They are reseller product pages with almost no text:

| Reseller | Title / h1 | Description text |
|---|---|---|
| Reseller A | "Mehanika šetajuća" | 1 word: "MEHANIKA" |
| Reseller B | "Metalni mehanizam za PVC fasciklu" (slug `mehanika-setajuca`) | About 10 words |
| Reseller C | "Mehanika za fascikle" | About 10 words |

None of the three says it makes the part (Reseller B has a general "own production" menu link, but the product page doesn't claim it). So a 300–500-word page from a manufacturer, with the phrase in its title and h1, would be the most useful page on this topic. The resellers do have larger sites, which helps them, so this is a good chance, not a guarantee.

**Caveat:** these results came from a search tool, not from google.rs, so the order may differ. Check it yourself (see 2.9).

**What they teach us about wording:** sellers say "mehanika šetajuća", "mehanika za fascikle", "mehanizam za PVC fascikle", "šina sa 2 klizača" and "metalni mehanizam sa šetajućim klizačem". Don't copy these as facts about your part: they are clues for questions 1 and 3.

### 2.3 Prominence today, and what to change

Measured on `dist/index.html` and the PDFs.

| Where | Today | Change to | File |
|---|---|---|---|
| `<title>` | "Boki-Edi – radnja za proizvodnju sitne metalne galanterije": **no** | "Šetajuća mehanika i lajsne za kalendare \| Boki-Edi" (50 characters) | `src/seo.js:21` |
| Meta description | "mehanike za fascikle": **not the phrase**. It was in an earlier version and was lost in `03db121` | See Phase 1, step 1.1 | `src/seo.js:23` |
| h1 | "Metalni delovi po meri": **no** | "Šetajuća mehanika i metalni delovi po meri" (also the catalogue cover) | `src/data/about.js:6`, `scripts/catalog/catalog.css:15` |
| Hero paragraph | Second in the list, after lajsne | First: "…nalaze se šetajuća mehanika za fascikle, lajsne za kalendare, brzovezi…" | `src/data/about.js:12` |
| First screen | Nothing clickable. The card is 1.5 screens down (1322 px on a phone, 1043 px on a laptop) | A link in the hero (Phase 1), then to its own page (Phase 2) | `src/sections/Hero.jsx` |
| Product order | Second, after Brzovez | First card of the default tab | `src/data/products.js:33-43` |
| Heading level | h4 only | h4 on the home page; h1 on its own page | Phase 2 |
| Alt text | "Šetajuća mehanika – metalni mehanizam za fascikle": **has it** | "Šetajuća mehanika za fascikle – metalni mehanizam" (phrase with context comes first) | `src/data/products.js:42` |
| Image file | `Setajuca mehanika-62670ff1.webp`, with a raw space in the HTML `src` | `setajuca-mehanika-za-fascikle.webp` in Phase 2 | `src/assets/` |
| Link preview | Photo of the **Brzovez**; the text lists lajsne, brzovezi, uglovi: **no** | Šetajuća photo and headline (tested) | `scripts/make-og-image.sh:8,27-28`, `src/seo.js:16` |
| Schema | Description lacks the phrase; no product info | Follows the new description; add `knowsAbout` | `scripts/prerender.mjs:33-60` |
| Catalogue text | Second in the list on page 1; second card on page 2 | First on both: follows `about.js` and `products.js` (tested in final mode: still 4 pages) | Regenerate |
| Catalogue title | "Boki-Edi – katalog proizvoda": **no** | "Boki-Edi katalog: šetajuća mehanika, lajsne za kalendare" | `scripts/make-catalog.mjs:67` |
| Catalogue keywords | Sixth entry (metadata only) | Earlier automatically after the reorder | Regenerate |
| Internal links | None describes the product. All 11 product links read "Pošaljite upit" and lead to the form | Links with the phrase as their text (2.6) | Phase 2 |

### 2.4 The page: `/setajuca-mehanika`

Pre-rendered, ASCII slug, canonical `https://www.boki-edi.com/setajuca-mehanika`. The prototype confirmed that the route, clean URL, canonical and sitemap entry all work (Appendix B).

- **Title (53):** Šetajuća mehanika za fascikle – proizvođač | Boki-Edi
- **Meta description (152):** Šetajuća mehanika za fascikle direktno od proizvođača: metalni mehanizam, izrada po porudžbini, male i velike serije. Dobanovci (Beograd). Cene na upit.
- **h1:** Šetajuća mehanika za fascikle
- **Body and FAQ:** full draft in section 5.1. It has 369 words without the markers and will reach about 400–500 once they are filled.
- **Context:** "za fascikle" in the title, h1 and first sentence separates it from engineering "walking mechanisms". I deliberately left out a sentence like "this isn't a machine mechanism": it would add the wrong vocabulary to the page and tell buyers nothing.
- **Form:** on the page itself, with the subject filled in ("Upit: Šetajuća mehanika"), so a visitor doesn't have to leave.

**Photos** (`loading="eager"` and `fetchpriority="high"` on the first; the rest lazy; all with width and height):

| File name | Source | Alt text | Status |
|---|---|---|---|
| `setajuca-mehanika-za-fascikle.webp` | `Setajuca mehanika.webp`, renamed (1435×1919, 33 KB) | Šetajuća mehanika za fascikle – metalni mehanizam, ceo deo | Exists |
| `setajuca-mehanika-detalj.webp` | New photo | Detalj šetajuće mehanike za fascikle | Needs a photo |
| `setajuca-mehanika-u-fascikli.webp` | New photo | Šetajuća mehanika ugrađena u fasciklu [POTVRDITI: vrsta fascikle] | Needs a photo |
| `setajuca-mehanika-i-iglica.webp` | New photo | Šetajuća mehanika sa standardnom iglicom | Needs a photo |

The page can launch with the first photo alone.

Renaming a photo means updating `products.js` and `FRAMING`, then running `npm run thumbnails`. It also changes the fingerprint of the PDFs, so run `npm run catalog` and `npm run flyer`.

### 2.5 Search variants

There is no search-volume data here (Keyword Planner needs an Ads account). Treat this list as a hypothesis, and let Search Console show which forms are actually used.

| Variant | Where to use it |
|---|---|
| šetajuća mehanika | Title, h1, first sentence, alt |
| šetajuća mehanika za fascikle | Title, h1, link text |
| setajuca mehanika | The slug, the file name, and once in the "drugi nazivi" sentence |
| mehanika šetajuća | Once in the "drugi nazivi" sentence |
| шетајућа механика | Once, in `<span lang="sr-Cyrl">` (needs your decision; see below) |
| mehanika za fascikle, mehanizam za fascikle | Body text and group page |
| šetajuća mehanika za PVC fascikle | Only if question 1 confirms it |

**One "drugi nazivi" sentence covers all the odd spellings.** Repeating them would be keyword stuffing and would read badly.

**Decision needed:** an earlier session recorded "Serbian, Latin script only" for visible text. A single Cyrillic mention is a small exception that you asked for here. Without it, the page relies on Google matching the two scripts by itself, which I can't confirm it does reliably.

### 2.6 Internal links to it

| From | Link text | File | Phase |
|---|---|---|---|
| Hero | Šetajuća mehanika za fascikle | `src/sections/Hero.jsx` | 1 (to `/#fascikle`), 2 (to the page) |
| Product card, name and photo caption | Šetajuća mehanika | `src/components/Product.jsx:76`, new `page` field in `products.js` | 2 |
| Top menu | Šetajuća mehanika | `src/components/NavBar.jsx:8` | 2 |
| Footer (every page) | Šetajuća mehanika za fascikle | `src/components/Footer.jsx` | 2 |
| Standardna iglica's description | šetajuću mehaniku | `src/data/products.js:46-48` | 2 |
| Group page `/delovi-za-fascikle-i-registratore` | First section, "Šetajuća mehanika" | New | 3 |
| PDF catalogue: photo and name | Links to the page, not the inquiry form | `scripts/make-catalog.mjs:139,161-164` | 2 |
| PDF catalogue: page 1 | Visible `www.boki-edi.com/setajuca-mehanika` | `scripts/make-catalog.mjs` | 2 |
| New folder-maker flyer | QR code and visible address | `src/data/flyers.js` | Off-site |

The inquiry link `/?proizvod=Šetajuća mehanika#kontakt` stays, and the product's name must not change, because the printed catalogue links to it.

### 2.7 Schema

`BreadcrumbList` plus `ItemPage`, generated at build time. Full JSON in Appendix D.

**No `FAQPage`:** Google removed FAQ rich results on 7 May 2026, so it would bring nothing. The visible FAQ stays because its text matches longer searches.

**No `Product` for now:** Google requires `offers`, `review` or `aggregateRating`, and you have none of them. Details in Appendix D.

### 2.8 Off-site steps

Full list in section 6. The ones that matter most for this phrase:

1. **Search Console:** record today's position first, then request indexing of the new page.
2. **Google Business Profile:** the map embed already points to a place called "Boki-EDI", so the listing exists. Claim it, and add šetajuća mehanika as the first product, linking to the page.
3. **Links from real businesses:** ask customers and resellers who sell the part to link to `/setajuca-mehanika`. On a topic this narrow, a few real links could decide this.
4. **Folder-maker flyer** (draft in 5.6) and a **short video** of the part.

### 2.9 How we'll know it works

I could not measure Google positions. My search tool isn't Google, and it returned nothing for `boki-edi.com`. That's only weak evidence, but check whether the site is indexed at all.

| When | Check |
|---|---|
| Before any change | Search Console → Performance → queries containing "mehanika": note position and impressions. Also search google.rs in a private window for "šetajuća mehanika" and "setajuca mehanika", and note the position |
| 1–2 weeks after deploy | Search Console → URL inspection: is `/setajuca-mehanika` indexed? |
| After 8 weeks | Position for both spellings; which URL ranks; inquiries with the subject "Upit: Šetajuća mehanika" |

Either URL ranking counts as success, since the goal is boki-edi.com in the top results. Nobody can guarantee a position. If the page isn't on the first page after 8 weeks, off-site links are the next lever, not more on-page text.

---

## 3. Findings

### 3.1 Findings table

Most important first. Impact is the expected effect on the goals (inquiries and rankings), or on a rule you set.

| # | Area | Problem | Evidence | Recommended change | Files | Impact | Effort |
|---|---|---|---|---|---|---|---|
| 1 | Keywords | No dedicated page for the main product | `src/seo.js:19-25`: one page; `dist/sitemap.xml`: one URL | Build `/setajuca-mehanika` (2.4) | New `src/data/productPages.js`, `src/pages/ProductPage.jsx`; `src/App.jsx`, `src/seo.js`, `scripts/prerender.mjs` | High | M |
| 2 | Keywords | Title has neither top keyword | `src/seo.js:21` | New title, same all year | `src/seo.js` | High | S |
| 3 | Keywords | Meta description lacks the phrase (lost in `03db121`) | `src/seo.js:23`: "mehanike za fascikle" | New description | `src/seo.js` | High | S |
| 4 | Keywords | h1 is generic | `src/data/about.js:6` | "Šetajuća mehanika i metalni delovi po meri" | `src/data/about.js`, `scripts/catalog/catalog.css` (the cover needs a taller band), then catalogue and OG image | High | S |
| 5 | Prominence | Main product is second everywhere; lajsne come first in the hero | `src/data/products.js:33-43`, `src/data/about.js:12` | Reorder both | Same | High | S |
| 6 | Content | Product text is 7 words and states nothing about use | `src/data/products.js:40`; no `fullDescription` | Answer 2.1, then write the text | `src/data/products.js`, new page data | High | M (needs owner) |
| 7 | Links | No internal link describes a product: all 11 read "Pošaljite upit" and lead to the form | `src/components/Product.jsx:82-87`; 25 links in `dist/index.html` | Link names to pages; extend menu and footer (2.6) | `Product.jsx`, `NavBar.jsx`, `Footer.jsx`, `Products.jsx` | High | M |
| 8 | Keywords | No page for lajsne; the card is in a closed tab during peak season (7 of 11 cards are in closed tabs) | `src/sections/Products.jsx:14`; `.js .product-panel[data-active="false"]` in `src/index.css:65` | Build `/lajsne-za-kalendare` | As #1 | High | M |
| 9 | Measurement | No analytics; Search Console status unknown; no verification tag in the HTML | `grep` for analytics tools in `src`, `index.html`: none | Search Console now; events in Phase 4 | New `src/analytics.js` | High | S–M |
| 10 | Crawling | Bare domain still 307, and the chain has two hops | `curl -I`: `http://boki-edi.com/` → 308 → `https://boki-edi.com/` → **307** → www | Vercel → Domains → set 308 (open since Session 1) | Dashboard only | Medium | S |
| 11 | Sharing | Link preview shows the Brzovez and doesn't name the main product | `scripts/make-og-image.sh:8,31`; `src/seo.js:16` | Šetajuća photo and headline | `make-og-image.sh`, `seo.js`, regenerate `og-image.jpg` | Medium | S |
| 12 | Images | 3 card images are base64 inside the HTML, so Google Images can't index them. They are 28 % of the HTML and also sit in the JS | `grep`: 3 `data:image/webp`, 13,545 of 48,336 bytes; Vite's default 4 KB inline limit | `assetsInlineLimit: 0` in **both** builds. Tested: HTML 48.3 → 34.9 KB; JS gzip 82.6 → 71.3 KB | `vite.config.js:15-17` | Medium | S |
| 13 | Content rule | A **dimension is publicly served**: an unused strip photo has a length in its file name; the file returns 200 and its name is in the JS. The rule is never to publish dimensions | `curl -I` → 200; `grep` in the JS bundle | Exclude unused photos from the glob (tested: gone from the build, catalogue still works); rename the file | `src/data/products.js:3-4` | Medium | S |
| 14 | Images | Lajsna photos are 362 KB and 517 KB (3024×4032). The 517 KB one is deployed but unused by the site. Harmless today (loaded only in the viewer), but a problem once shown inline | `src/assets`; Vite output | Scale both to 1435 px wide before Phase 2. By my calculation, print stays above 300 ppi; verify by regenerating | `src/assets/`, then `npm run catalog`, `npm run flyer` | Medium | S |
| 15 | Schema | Missing `logo`, `geo`, `sameAs`, `areaServed`, `openingHours`, `@id`; no `WebSite` node, which is Google's main signal for the site name | `dist/index.html` JSON-LD; `scripts/prerender.mjs:33-60` | Appendix D. Add what is confirmed; no empty placeholders | `scripts/prerender.mjs`, `src/data/company.js` | Medium | S |
| 16 | Content | Thin text: 6 products have one short sentence; Ugao 25 and Ugao 32 share the same one; the meaning of "25" and "32" isn't explained | `src/data/products.js:90,96` | Group pages; `fullDescription` after your answers | `src/data/products.js`, page data | Medium | M (needs owner) |
| 17 | Content | Opružni lim has no text, yet it shows a card and an inquiry link | `src/data/products.js:121-125`; question open since Session 1 | Send its use, or hide the card until then | `src/data/products.js` | Medium | S (needs owner) |
| 18 | PDFs | Catalogue title has no product word; catalogue links only to the form; flyer is linked from nowhere and isn't in the sitemap | `pdfinfo`; `scripts/make-catalog.mjs:67,139`; `src/data/flyers.js:4` | New title; link products to pages; link the flyer from the lajsne page | `make-catalog.mjs`, page data | Medium | S |
| 19 | Images | Google only sees 640×480 crops; originals appear only in the JS-opened viewer. File names have spaces and carry no context | `src/components/Product.jsx:59,106` | Full photos with ASCII names on the new pages | Page data, `src/assets/` | Medium | M |
| 20 | Crawling | `boki-edi.vercel.app` serves an identical copy (200, no `X-Robots-Tag`). Its canonical points to www, which limits the harm. It is also the "homepage" of the GitHub repo | `curl`: same SHA-256 as www | Host-based 308 in `vercel.json`, and change the GitHub field. **`scripts/preview.mjs:22-26` ignores `has`, so it must filter such rules** or every local page will redirect | `vercel.json`, `scripts/preview.mjs` | Low | S |
| 21 | Crawling | Sitemap has no `lastmod` | `scripts/prerender.mjs:123-129` | An `updated` date per page in the data. **Not the build date:** Google only trusts accurate values | `prerender.mjs`, page data | Low | S |
| 22 | Accessibility | Low contrast on both main actions: "Pošalji" 2.43:1; left edge of the hero's "Pošaljite upit" 2.28:1. Lighthouse misses them: the form is hidden by the scroll animation during the test, and gradients can't be measured | Computed colors in Chrome; `src/components/ContactForm.jsx:130`, `src/sections/Hero.jsx:31` | `bg-cyan-700` (5.36:1), `from-teal-700` (5.02:1) | Same files | Low | S |
| 23 | Mobile | Small tap targets: inquiry link 97×24, phone and e-mail 24 px high, tabs 32 px. They meet the 24 px minimum, but the phone link is the main action on a phone | Measured at 390 px; `Product.jsx:85`, `ContactInfo.jsx:28,39` | Add padding: phone/e-mail and inquiry to about 44 px | Same files | Low | S |
| 24 | Local | Map embed is in English | `src/sections/Contact.jsx:7`: `1sen` | Change both `1sen` to `1ssr`; check that it displays | Same | Low | S |
| 25 | Privacy | The repository is public, and PR #1 shows up in a search for the company. Committing this report would publish your SEO plan | GitHub API: `"visibility": "public"` | Your decision: keep this file uncommitted, or make the repo private | Dashboard only | Low | S |
| 26 | Performance | 28 KB of unused JS (EmailJS could load on demand) | Lighthouse `unused-javascript` | **Leave it:** scores are already 99–100 | None | Low | M |

### 3.2 Already done: checked, and it works

| Item | Result |
|---|---|
| Pre-rendered `/` and `404.html` | ✓ With JavaScript off: 298 words, all 11 product headings, all groups shown |
| Sitemap, robots.txt | ✓ Live and correct (no `lastmod`: #21) |
| Canonical | ✓ `/` also on `/?proizvod=…` and UTM addresses (checked in Chrome) |
| `lang="sr"` | ✓ `index.html:2` |
| Open Graph, og-image | ✓ Valid, 1200×630 (content: #11). Twitter has only `card`, which is fine: it falls back to Open Graph |
| LocalBusiness schema | ✓ Valid; name, address, phone, e-mail, URL, image, founding year, `contactPoint` |
| Alt texts | ✓ All 11 images (Lajsna's lacks the exact phrase: step 1.3) |
| Heading hierarchy | ✓ One h1, h2 per section, h3 per group, h4 per product |
| Lazy images | ✓ With width and height; CLS 0 |
| 308 redirects | ✓ `/products`, `/contact` live. The bare domain isn't (#10) |
| PDFs | ✓ 200, correct type and file name, tagged, properties set, no `noindex`, indexable |
| 404 handling | ✓ Unknown URLs return a real 404. `/404` itself returns 200 with `noindex`: harmless |
| Favicon | ✓ The linked `apple-touch-icon` (180×180) meets Google's guidance; no change needed |
| No JS-only content | ✓ Only the map iframe, which has a link as fallback |
| Printed links | ✓ All 4 tabs, `/#proizvodi`, `/#kontakt`, inquiry links and a UTM variant, checked in Chrome at 390 px |

The 11 `/?proizvod=…` links are crawlable but canonicalised to `/`. Search Console may list them as "Alternate page with proper canonical tag", which is expected. No action needed.

---

## 4. Implementation plan

**Before starting:** `reorganisation` no longer exists, so create a new branch from `main`. Stop `npm run preview` before every `npm run build`. Update `CHANGES.md` at the end of each session.

**The PDF rule:** `src/seo.js`, `src/assets/` and the data files feed the PDF fingerprints (`scripts/lib/source-hash.mjs:10-19`). The prototype confirmed that editing them makes `npm run build` warn about both the catalogue and the flyer. So each phase ends with `npm run catalog` and `npm run flyer`.

### Phase 1: quick wins (under an hour)

Uses only facts already in the repository, so it needs no answers from you.

**Dry run:** steps 1.1, 1.2, 1.3, 1.5, 1.7 and 1.9 ran together in a throwaway copy, through to final-mode `npm run catalog`, `npm run flyer` and a silent build. Result: 0 console errors, 11/11 images load, catalogue 4 pages. Steps 1.4, 1.6 and 1.8 are small edits that I did not prototype.

| Step | Commit | Verify |
|---|---|---|
| 1.1 | **Title, description, preview alt** in `src/seo.js`: <br>title `Šetajuća mehanika i lajsne za kalendare \| Boki-Edi` <br>description `Šetajuća mehanika za fascikle, lajsne za kalendare, brzovezi i uglovi za A table: metalni delovi po meri, direktno od proizvođača iz Dobanovaca (Beograd).` <br>OG alt `Boki-Edi – šetajuća mehanika za fascikle i metalni delovi po meri. Dobanovci, od 2007.` | `grep -o '<title>.*</title>' dist/index.html`; the JSON-LD description follows automatically |
| 1.2 | **h1 and hero text** in `src/data/about.js`, **plus the catalogue cover**, because the longer title doesn't fit it: <br>`headline`: `Šetajuća mehanika i metalni delovi po\u00a0meri` <br>`intro[1]`: `U našem proizvodnom programu nalaze se šetajuća mehanika za fascikle, lajsne za kalendare, brzovezi, uglovi za A\u00a0table i drugi metalni proizvodi.` <br>`scripts/catalog/catalog.css:15`: `.cover-page .band` height `128mm` → `142mm` <br>**Without that CSS change, `npm run catalog` refuses to build** ("band does not fit", exit 1). Don't add a non-breaking space after "i": it forces 3 lines on the cover | Preview at 390 and 1366 px: the hero grows about 45–60 px. `npm run catalog -- --draft` prints no "layout has problems"; look at page 1 |
| 1.3 | **Product order and alt texts** in `src/data/products.js`: Šetajuća mehanika before Brzovez; its alt `Šetajuća mehanika za fascikle – metalni mehanizam`; Lajsna's alt `Metalna lajsna za kalendare sa otvorom za kačenje` (keeps your decision to describe the product) | First card is Šetajuća mehanika; `/#fascikle` still works |
| 1.4 | **Hero link:** label in `about.js`, `<Link to="/#fascikle">` in `Hero.jsx`: `Šetajuća mehanika za fascikle` | Visible on the first screen on phone and laptop; click opens the tab |
| 1.5 | **Stop inlining, drop unused photos:** `assetsInlineLimit: 0` in **both** branches of `vite.config.js` (client only does nothing, because the HTML comes from the SSR build); exclude `…veca.webp` and the unused strip photo (#13) from both globs in `products.js` with `!` patterns | `grep -c 'data:image' dist/index.html` → 0; neither photo is left in `dist/assets`; `npm run catalog -- --draft` still works |
| 1.6 | **Schema:** `@id`, `logo` (`/android-chrome-512x512.png`), `knowsAbout`, a `WebSite` node (Appendix D, only fields without markers) in `scripts/prerender.mjs` | JSON parses; after deploy, [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Validator](https://validator.schema.org/) |
| 1.7 | **Link preview:** in `scripts/make-og-image.sh`, photo `Setajuca mehanika.webp`; headline lines `Šetajuća mehanika` and `i metalni delovi`; `-pointsize 66` → `58`. Run the script | Look at `public/og-image.jpg` (tested: it fits) |
| 1.8 | **Contrast and map language:** `ContactForm.jsx:130` `bg-cyan-700` (hover `bg-cyan-800`); `Hero.jsx:31` `from-teal-700`; `Contact.jsx:7` both `1sen` → `1ssr` | Compare by eye; map still loads, labels in Serbian |
| 1.9 | **Catalogue title and regeneration:** `make-catalog.mjs:67`; run `npm run catalog`, `npm run flyer` | Check `docs/catalog-preview/`; `pdfinfo public/katalog.pdf`; `npm run build` prints no warnings |

**Then you, in dashboards (no commit):**

- Vercel → Domains: `boki-edi.com` → `www` **308**.
- Search Console: note today's baseline **before** deploying, then resubmit the sitemap and request indexing of `/`.
- GitHub → repo settings: homepage → `https://www.boki-edi.com`.

**Verify after deploy:** `curl -I https://boki-edi.com/` → 308. Paste the link into Viber to check the preview (add `?v=2` if an old one is cached).

### Phase 2: `/setajuca-mehanika` and `/lajsne-za-kalendare`

**Needs from you:** answers to 2.1 and the `[POTVRDITI]` markers in 5.1 and 5.2. Steps 2.1–2.3 can be done before that.

| Step | Commit | Verify |
|---|---|---|
| 2.1 | **Page data and component, no content yet:** `src/data/productPages.js`, `src/pages/ProductPage.jsx`, routes in `src/App.jsx`, merge into `pages` in `src/seo.js`, `headingLevel` prop in `Product.jsx:76` | Temporary page: `dist/<slug>.html` and sitemap entry appear; 200 with JS off; one h1; no console errors |
| 2.2 | **Per-page head tags in `prerender.mjs`:** replace `page === pages["/"]` (line 91) with `page.jsonLd`; `BreadcrumbList`, `ItemPage`; per-page `og:image`; visible breadcrumb | JSON parses for each page; correct canonical on each |
| 2.3 | **Contact block on the page:** `ContactForm` gets a `product` prop for the subject; add `ContactInfo`; no map | Subject filled in; send and failure with EmailJS intercepted (no real e-mails) |
| 2.4 | **Scale the Lajsna photos** to 1435 px wide (#14); `npm run thumbnails`, catalogue, flyer | Sizes in `src/assets`; `pdfimages -list public/katalog.pdf` and the same for the flyer: x-ppi still above 300 |
| 2.5 | **`/setajuca-mehanika` content and photo rename** (5.1, 2.4) | 300–500 visible words; title and description lengths; no marker left: `grep -r POTVRDITI src/` → nothing |
| 2.6 | **`/lajsne-za-kalendare` content and photos** (5.2), including a link to the flyer | Same checks; the Lajsna photos are in the page's HTML at their new size |
| 2.7 | **Internal links** (2.6): menu with highlight on the new pages (`useActiveSection` returns null there, so use `pathname`), footer, card names, tab panels, hero link now points to the page | Every old link in Appendix B still works; mobile menu shows all entries |
| 2.8 | **PDF links:** `page` field used for photo and name in `make-catalog.mjs:139,161-164`; visible address on page 1; run `npm run catalog`, `npm run flyer` | Links with `pdftotext` and in a viewer; QR still decodes to `/#kontakt` |
| 2.9 | **`lastmod`** from an `updated` field | `dist/sitemap.xml` |

**After deploy:** `curl -I` both URLs (200). Search Console: resubmit the sitemap, request indexing of both. Check all printed links on the phone.

**Timing:** lajsne are at peak now, and Google can take weeks. The page may not rank this season, but the flyer and QR traffic benefit at once, and next August it will already be established.

### Phase 3: group pages and content

**Needs from you:** the markers in 5.3–5.5, and a decision on Opružni lim.

| Step | Commit | Verify |
|---|---|---|
| 3.1 | `/delovi-za-fascikle-i-registratore` (5.3), with Šetajuća mehanika as the first section | 200, one h1, link to `/setajuca-mehanika` |
| 3.2 | `/uglovi-za-a-table` (5.4) | Same |
| 3.3 | `/otvaraci-za-flase` (5.5) | Same |
| 3.4 | Tab panels link to their group page; breadcrumbs get the group level | `/#fascikle` etc. still open tabs; the 4 tab links appear in the no-JS HTML |
| 3.5 | Longer `fullDescription`s; fix Opružni lim; run catalogue and flyer | `npm run build` silent; alt for Završeci gets "za fascikle" |

### Phase 4: seasonal switch and measurement

**Do steps 4.1–4.2 right after Phase 1 if you want them this season.** Until the page exists, the hero block can link to `/#kalendari`.

| Step | Commit | Verify |
|---|---|---|
| 4.1 | **Switch:** `src/data/season.js`, `define` in `vite.config.js`, a log line in `prerender.mjs` (Appendix E) | Build with dates in and out of range: the block appears and disappears; no hydration errors; `<title>` and h1 identical in both builds |
| 4.2 | **Hero block** when in season; link to `/lajsne-za-kalendare` | No layout shift; hero link to šetajuća stays visible |
| 4.3 | **Document** the switch in `README.md`; add calendar reminders for 1 August and 1 January | |
| 4.4 | **Consent and GA4 loader:** `src/analytics.js`, `VITE_GA_ID` | No requests to Google before consent (Network tab); Lighthouse still ≥ 95 |
| 4.5 | **Events:** form, `tel:`, `mailto:`, downloads, with a `product` parameter | GA4 DebugView; a form test with EmailJS intercepted |
| 4.6 | **UTM on new QR codes:** split `qr.path` from a new `qr.params` in `make-flyer.mjs:79,125`, so the visible address stays short | Decode QR at 72 dpi; the printed address is unchanged; it opens the right tab or page |

---

## 5. Draft texts

Nothing here is published yet. Facts without a marker come from the repository. Numbers in brackets are character counts.

### 5.1 `/setajuca-mehanika`

**Title (53):** Šetajuća mehanika za fascikle – proizvođač | Boki-Edi

**Meta description (152):** Šetajuća mehanika za fascikle direktno od proizvođača: metalni mehanizam, izrada po porudžbini, male i velike serije. Dobanovci (Beograd). Cene na upit.

**h1:** Šetajuća mehanika za fascikle

Šetajuća mehanika je metalni mehanizam za fascikle, sličan brzovezu. Izrađujemo je po porudžbini u našoj radionici u Dobanovcima (Beograd), a sve dogovarate direktno sa proizvođačem, bez posrednika.

*Dugmad: Pošaljite upit · +381 60 3331408 · Preuzmite katalog (PDF)*

**h2: Šta je šetajuća mehanika**

Šetajuća mehanika je metalni deo koji se ugrađuje u fasciklu i [POTVRDITI: drži perforirana dokumenta, kao i brzovez]. Ugrađuje se u [POTVRDITI: koje fascikle, npr. PVC, PP ili kartonske; da li i u registratore]. [POTVRDITI: jedna ili dve rečenice o tome kako radi i zašto se zove „šetajuća“.] Izrađena je od [POTVRDITI: materijal i završna obrada].

**h2: Za koga je namenjena**

Izrađujemo je za firme: [POTVRDITI: proizvođače fascikli i registratora, štamparije i grafička preduzeća, veleprodaje kancelarijskog materijala]. Ako proizvodite ili dorađujete fascikle, dogovorićemo izradu prema potrebama vašeg proizvoda.

**h2: Izrada po porudžbini, male i velike serije**

Šetajuću mehaniku izrađujemo po porudžbini, prema potrebama vašeg proizvoda. Radimo i manje količine i veće serije. Dimenzije, količine i pakovanje dogovaramo prema potrebama kupca, a cene i uslovi su na upit.

**h2: Šetajuća mehanika i standardna iglica**

Uz šetajuću mehaniku možete da poručite i standardnu iglicu, koju isporučujemo zasebno ili zajedno sa mehanikom. Od delova za fascikle izrađujemo još i brzoveze i metalne završetke sa gumicom.

**h2: Direktno od proizvođača**

Boki-Edi proizvodi sitnu metalnu galanteriju za potrebe štamparske, grafičke i druge industrije i uspešno posluje od 2007. godine. Sve dogovarate direktno sa radionicom, pa odgovor o meri, količini ili pakovanju dobijate od onoga ko deo izrađuje.

**h2: Kako poručiti**

1. Pošaljite upit telefonom, e-mailom ili preko formulara na sajtu.
2. Dimenzije, količine, pakovanje i cenu dogovaramo direktno sa vama, prema potrebama vašeg proizvoda.
3. Delove izrađujemo po porudžbini.

**h2: Česta pitanja**

- **Šta je šetajuća mehanika?** Metalni mehanizam za fascikle, sličan brzovezu. [POTVRDITI: jedna rečenica o nameni.]
- **U koje fascikle se ugrađuje?** [POTVRDITI: vrste fascikli.]
- **Po čemu se razlikuje od brzoveza?** [POTVRDITI: razlika i kada se bira koja.]
- **Da li se isporučuje sa iglicom?** Standardnu iglicu isporučujemo zasebno ili zajedno sa šetajućom mehanikom, kako vam odgovara.
- **Koja je najmanja količina koju mogu da poručim?** Radimo i manje količine i veće serije. Količine dogovaramo prema potrebama kupca, pa nam pišite šta vam treba.
- **Koliko košta šetajuća mehanika?** Cene i uslovi su na upit. Cenu dogovaramo direktno sa vama, zajedno sa dimenzijama, količinama i pakovanjem.
- **Da li isporučujete van Beograda?** [POTVRDITI: isporuka u Srbiji i regionu.]

**Drugi nazivi (one sentence at the end):** Ovaj proizvod se traži i kao „setajuca mehanika“, „mehanika šetajuća“ i „mehanika za fascikle“, a na ćirilici kao „шетајућа механика“. *(Cyrillic: needs your decision, see 2.5.)*

**Form:** on the page, subject filled in: "Upit: Šetajuća mehanika".

### 5.2 `/lajsne-za-kalendare`

**Title (51):** Lajsne za kalendare: izrada i montiranje | Boki-Edi

**Meta description (152):** Metalne lajsne za zidne kalendare, po meri prema formatu kalendara, i montiranje na vaše kalendare. Male i velike serije. Boki-Edi, Dobanovci (Beograd).

**h1:** Lajsne za kalendare: izrada i montiranje

Izrađujemo metalne lajsne za zidne kalendare, po meri, prema formatu vašeg kalendara. Osim izrade lajsni, montiramo ih i na vaše kalendare.

**h2: Metalna lajsna za zidni kalendar**

Metalna lajsna se postavlja na vrh zidnog kalendara, povezuje listove i služi za kačenje. Izrađena je od [POTVRDITI: materijal i završna obrada].

**h2: Montiranje lajsni na vaše kalendare**

Osim izrade lajsni, montiramo ih i na vaše kalendare. [POTVRDITI: kako izgleda postupak i kako se kalendari dostavljaju.]

**h2: Za štamparije i proizvođače kalendara**

Lajsne izrađujemo po meri, u malim i velikim serijama. Dimenzije, količine i pakovanje dogovaramo prema potrebama kupca, direktno sa proizvođačem i bez posrednika. Cene i uslovi su na upit.

**h2: Pošaljite upit na vreme**

Kalendari za narednu godinu se pripremaju unapred, zato nam pošaljite upit na vreme. [POTVRDITI] *(No year here: this page stays all year. No lead times.)*

**h2: Kako poručiti:** the same 3 steps as in 5.1. Link: Preuzmite letak (PDF).

**h2: Česta pitanja**

- **Da li montirate lajsne na kalendare koje sami štampamo?** Da. Osim izrade lajsni, montiramo ih i na vaše kalendare. [POTVRDITI: kako se kalendari dostavljaju.]
- **Da li izrađujete lajsne po meri?** Da, lajsne izrađujemo po meri, prema formatu vašeg kalendara.
- **Da li radite i male serije?** Radimo i male i velike serije. Količine dogovaramo prema potrebama kupca.
- **Da li su lajsne metalne ili PVC?** Izrađujemo metalne lajsne. [POTVRDITI: da ne radite PVC.]
- **Koliko unapred treba poslati upit?** Što ranije. Rokove dogovaramo za svaku porudžbinu. [POTVRDITI]

**Photos:**

| File name | Source | Alt text |
|---|---|---|
| `lajsna-za-kalendare-montirana.webp` | `Lajsna za kalendare veca.webp`, cropped as in the catalogue so the large "2027" stays out | Metalna lajsna za kalendare montirana na zidni kalendar |
| `lajsna-za-kalendare-detalj.webp` | `Lajsna za kalendare.webp` | Detalj metalne lajsne montirane na zidni kalendar |
| `metalna-lajsna-za-kalendare.webp` (optional) | The unused strip photo (#13), renamed, which also removes the dimension from the name | Metalna lajsna za kalendare pre montiranja |

The close-up shows printed months, which is fine, but avoid a visible year on this permanent page.

### 5.3 `/delovi-za-fascikle-i-registratore`

**Title (56):** Delovi za fascikle i registratore – mehanizmi | Boki-Edi

**Meta description (154):** Metalni delovi za fascikle i registratore: šetajuća mehanika, brzovez, standardna iglica i završeci sa gumicom. Izrada po porudžbini, Boki-Edi, Dobanovci.

**h1:** Metalni delovi za fascikle i registratore

**Outline (200–400 words):**

- **Uvod:** Izrađujemo metalne delove za fascikle: šetajuću mehaniku, brzoveze, standardne iglice i metalne završetke sa gumicom, po porudžbini i prema potrebama vašeg proizvoda. [POTVRDITI: koji delovi idu i u registratore.]
- **h2 Šetajuća mehanika** (first; photo; link to its page): Metalni mehanizam za fascikle, sličan brzovezu. Sve o izradi i poručivanju: *Šetajuća mehanika za fascikle*.
- **h2 Brzovez:** Metalni mehanizam za fascikle koji drži perforirana dokumenta. [POTVRDITI: kome je namenjen.]
- **h2 Standardna iglica:** Iglica za mehanizme fascikli, isporučuje se zasebno ili zajedno sa brzovezom ili šetajućom mehanikom.
- **h2 Metalni završeci sa gumicom:** Gumica sa metalnim završecima za zatvaranje fascikli. [POTVRDITI: da li i za rokovnike.]
- **h2 Izrada po porudžbini:** male i velike serije; dimenzije, količine i pakovanje po dogovoru; cene na upit; direktno sa radionicom.
- **h2 Kako poručiti:** the 3 steps. Contact form.

**FAQ:**

- **Koje delove za fascikle izrađujete?** Šetajuću mehaniku, brzoveze, standardne iglice i metalne završetke sa gumicom.
- **Da li iglice mogu da poručim zasebno?** Da. Standardnu iglicu isporučujemo zasebno ili zajedno sa brzovezom ili šetajućom mehanikom.
- **Koja je razlika između brzoveza i šetajuće mehanike?** [POTVRDITI]
- **Da li radite manje količine?** Radimo i manje količine i veće serije.

### 5.4 `/uglovi-za-a-table`

The slug follows your example. The page also covers the klik-klak hook, which the title names.

**Title (58):** Uglovi za A table i zakačke za klik-klak ramove | Boki-Edi

**Meta description (150):** Metalni uglovi za izradu A tabli (Ugao za 25 i Ugao za 32) i zakačke za klik-klak ramove. Izrada po porudžbini, direktno od proizvođača iz Dobanovaca.

**h1:** Uglovi za A table i zakačke za klik-klak ramove

**Outline (200–400 words):**

- **Uvod:** Izrađujemo metalne delove za A table i ramove, po porudžbini i prema potrebama vašeg proizvoda.
- **h2 Metalni uglovi za A table:** Metalni uglovi koji se koriste u izradi A tabli: Ugao za 25 i Ugao za 32. [POTVRDITI: šta znače oznake 25 i 32 i kako kupac bira, u obimu koji želite da objavite.]
- **h2 Zakačka za klik-klak ramove:** Metalna zakačka koja se postavlja na poleđinu klik-klak rama i služi za kačenje na zid.
- **h2 Za koga:** proizvođači ramova [POTVRDITI: i A tabli].
- **h2 Izrada po porudžbini** and **Kako poručiti:** as in 5.3. Contact form.

**FAQ:**

- **Koje uglove za A table izrađujete?** Ugao za 25 i Ugao za 32. [POTVRDITI: razlika.]
- **Čemu služi zakačka za klik-klak ram?** Postavlja se na poleđinu klik-klak rama i služi za kačenje na zid.
- **Da li radite male serije?** Radimo i manje količine i veće serije.
- **Koliko koštaju?** Cene i uslovi su na upit.

### 5.5 `/otvaraci-za-flase`

The group's title, "Ostalo", isn't something anyone searches for, so the page is named after its products.

**Title (57):** Metalni otvarači za flaše, sa poljem za stiker | Boki-Edi

**Meta description (142):** Metalni otvarači za flaše, i sa okruglim poljem za stiker, npr. sa logotipom. Izrada po porudžbini, male i velike serije. Boki-Edi, Dobanovci.

**h1:** Metalni otvarači za flaše

**Outline (200 words is enough):**

- **Uvod:** Izrađujemo metalne otvarače za flaše, po porudžbini. [POTVRDITI: za koga, npr. promotivni pokloni.]
- **h2 Otvarač:** Metalni otvarač za flaše.
- **h2 Otvarač sa stikerom:** Otvarač za flaše sa okruglim poljem za stiker, npr. sa logotipom. Na fotografiji je prikazan bez stikera. [POTVRDITI: ko obezbeđuje stiker.]
- **h2 Izrada po porudžbini** and **Kako poručiti:** as in 5.3. Contact form.

**FAQ:**

- **Da li stavljate stiker sa našim logotipom?** [POTVRDITI]
- **Da li radite manje količine?** Radimo i manje količine i veće serije.
- **Koliko koštaju?** Cene i uslovi su na upit.

**Opružni lim:** stays only as a tab card, or hidden, until you send its use. Draft: [POTVRDITI: namena opružnog lima]. It has no marker-free text at all, so it gets no page.

### 5.6 Folder-maker flyer (entry for `src/data/flyers.js`)

```js
setajuca: {
  file: "letak-setajuca-mehanika",
  downloadName: "Boki-Edi setajuca mehanika.pdf",
  title: "Boki-Edi – šetajuća mehanika za fascikle",
  headline: "Šetajuća mehanika za fascikle",
  lead: "Metalni mehanizam za fascikle, direktno od proizvođača. Dobanovci, od 2007.",
  photos: [
    { file: "Setajuca mehanika.webp", alt: "Šetajuća mehanika za fascikle – metalni mehanizam" },
    { file: "Standardna iglica.webp", alt: "Standardna iglica za mehanizme fascikli" },
  ],
  points: [
    "Izrada po porudžbini, prema potrebama vašeg proizvoda",
    "Male i velike serije",
    "Standardna iglica zasebno ili zajedno sa mehanikom",
    "Direktan dogovor sa proizvođačem, bez posrednika",
  ],
  callToAction: "Pošaljite upit za vaše fascikle.",
  priceNote: "Cene i uslovi na upit.",
  qr: { path: "/setajuca-mehanika", caption: "Skenirajte kod i pogledajte šetajuću mehaniku na sajtu:" },
  more: {
    text: "Izrađujemo i lajsne za kalendare, uglove za A table i drugu sitnu metalnu galanteriju.",
    linkLabel: "Ceo katalog:",
    path: "/katalog.pdf",
  },
},
```

The QR code only works once the page is live. Print it after Phase 2, or point it to `/#fascikle` first.

---

## 6. Off-site checklist

**Google Search Console**

- [ ] Check that `boki-edi.com` is verified (best as a Domain property, via DNS). No verification tag is in the HTML, so it's either DNS-verified or not set up.
- [ ] Record the baseline (2.9) **before** Phase 1.
- [ ] Submit the sitemap; request indexing of `/`, then the new pages.
- [ ] Check monthly: queries with "mehanika", "lajsn", which URL ranks, and any indexing errors.

**Google Business Profile**

- [ ] Find the listing. The map embed points to a place called "Boki-EDI" (`src/sections/Contact.jsx:7`), so it exists. Claim it if it isn't yours yet.
- [ ] Use the same name, address and phone as the site, and `https://www.boki-edi.com/` as the website. No keywords in the business name: Google can suspend listings for that.
- [ ] **Products: šetajuća mehanika first**, with photo, text, and a link to `/setajuca-mehanika`; lajsne second.
- [ ] Service: montiranje lajsni na kalendare. Add working hours, then tell me them for the schema.
- [ ] Add all product photos.

**Business directories**

Use the same details everywhere: Boki-Edi, Janka Čmelika 13, 11272 Dobanovci, +381 60 3331408, bokiedi@gmail.com, https://www.boki-edi.com/. Mention šetajuća mehanika za fascikle in each description.

- [ ] 11811.rs, CompanyWall, PKS (Privredna komora Srbije): not checked. See if you're listed, and fix or add the entry.
- [ ] kompanije.net and Dun & Bradstreet: a search found both listing the business. Check their details and add the website.
- [ ] Europages: only if you want foreign buyers (see the decision on the region below).

**Links**

- [ ] Ask customers who are happy to be named, and resellers who sell the part, to link to `/setajuca-mehanika`. **This is likely the strongest off-site step.** No paid link schemes.

**Reviews**

- [ ] Ask a few real customers for a Google review, in person or on Viber. Don't pay for them or write them yourself.

**Folder-maker flyer**

- [ ] Add the entry from 5.6 and run `npm run flyer -- setajuca` after Phase 2. Send it to folder makers by e-mail.

**Short video**

- [ ] 30–60 seconds: the part up close, how it works, the part in a folder. No prices or dimensions.
- [ ] YouTube title "Šetajuća mehanika za fascikle – Boki-Edi", with the page's link in the description.
- [ ] Add it to the page later as a click-to-load video, so it doesn't slow the page.

**Decisions only you can make**

- [ ] **Region:** you mention BiH, Montenegro, Croatia and North Macedonia, while an earlier session recorded "no export". If it is Serbia only, set `areaServed` to RS and skip the ijekavian variants. If the region counts, Appendix C lists them.
- [ ] **Cyrillic:** one visible mention, or none (2.5).
- [ ] **Catalogue cover:** the new h1 also appears on the catalogue cover. It takes two lines there, so the dark band has to grow from 128 to 142 mm (tested, and it looks balanced). I recommend this, because the catalogue then leads with the main product too. The alternative is a separate field that leaves the cover as it is.
- [ ] **Flyer on the site:** the earlier decision was not to link it. I recommend linking it from the lajsne page.
- [ ] **Opružni lim:** send its use, or hide the card.
- [ ] **Public repository:** commit this report, or keep it local? (#25)
- [ ] **Analytics choice:** GA4, as in Phase 4, or another tool.

---

## Appendix A: measurements

### Build output (`dist/index.html`)

| Item | Value |
|---|---|
| Title | "Boki-Edi – radnja za proizvodnju sitne metalne galanterije" (58 characters) |
| Meta description | "Boki-Edi iz Dobanovaca (Beograd) od 2007. izrađuje metalne delove po meri: lajsne za kalendare, brzoveze, mehanike za fascikle, uglove za A table i drugo." (154) |
| Canonical | `https://www.boki-edi.com/` |
| Open Graph | type, site_name, locale `sr_RS`, url, title, description, image 1200×630, image alt |
| Twitter | `card` only (falls back to Open Graph) |
| JSON-LD present | `LocalBusiness`: name, description, url, image, telephone, email, foundingDate, address, contactPoint |
| JSON-LD missing | geo, logo, openingHours, sameAs, areaServed |
| Words | 316 in the HTML, 298 with JS off. That includes the menu twice, form labels and "Pošaljite upit" 13 times |
| Links | 25: menu and logo 7, hero 2, inquiry 11, catalogue 2, `tel:`, `mailto:`, Maps |
| Images | 11, all with alt and width/height, all `loading="lazy"`; 3 are base64 |
| HTML size | 48,336 bytes, of which 13,545 are base64 images |

**Heading outline:**

```
h1 Metalni delovi po meri
  h2 Prednosti (screen readers only)
    h3 Izrada po meri / Male i velike serije / Montiranje lajsni na kalendare / Direktan kontakt sa proizvođačem
  h2 Proizvodi
    h3 Fascikle i registratori (hidden with JS)
      h4 Brzovez / Šetajuća mehanika / Standardna iglica / Metalni završeci sa gumicom
    h3 Kalendari (hidden with JS)
      h4 Lajsna za kalendare
    h3 Ramovi i A table (hidden with JS)
      h4 Zakačka za klik-klak ramove / Ugao za 25 / Ugao za 32
    h3 Ostalo (hidden with JS)
      h4 Otvarač / Otvarač sa stikerom / Opružni lim
  h2 Kontakt
    h3 Podaci za kontakt / Pošaljite upit
```

**Where the keywords appear:**

| Place | "šetajuća mehanika" | "lajsne/lajsna za kalendare" |
|---|---|---|
| Title | ✗ | ✗ |
| Meta description | ✗ ("mehanike za fascikle") | ✓ |
| h1 | ✗ | ✗ |
| Hero paragraph | ✓ second | ✓ first |
| Benefit h3 | ✗ | Variant: "Montiranje lajsni na kalendare" |
| Product h4 | ✓ second card | ✓ in a closed tab |
| Alt text | ✓ | Variant: "lajsna za zidni kalendar" |
| OG text and image | ✗ | ✓ |
| JSON-LD | ✗ | ✓ in the description |
| Catalogue | ✓ second | ✓ first |
| Flyer | ✗ | Variant: "lajsne za zidne kalendare" |
| No-diacritics or Cyrillic form | ✗ (only the image file name has "Setajuca") | No diacritics to drop; no Cyrillic |

### Lighthouse

Lighthouse 13.6.0, run with `npx` from outside the project (nothing added to it), mobile, simulated throttling, 3 runs each. Local runs warned that this machine's CPU is slower than Lighthouse expects.

| | Live (www.boki-edi.com) | Local (`npm run preview`) |
|---|---|---|
| Performance | 99 / 100 / 99 | 100 / 100 / 99 |
| Accessibility | 100 / 100 / 100 | 100 / 100 / 100 |
| Best Practices | 100 / 100 / 100 | 100 / 100 / 100 |
| SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| LCP (median) | 1.06 s | 1.11 s |
| TBT (median) | 98 ms | 67 ms |
| CLS | 0 | 0 |
| Transfer | 205 KB in 13 requests: JS 86, images 85, HTML 18, CSS 6 | 403 KB (uncompressed) |

An SEO score of 100 only means the basics are in place; it says nothing about relevance. Accessibility 100 misses the contrast problems in #22.

### Performance

| Item | Finding |
|---|---|
| JS | 231 KB, 85.6 KB transferred; 28 KB unused. Fine |
| CSS | 25.8 KB, 6.2 KB transferred; render-blocking, but too small to matter |
| Fonts | None loaded; uses system fonts |
| LCP element | Hero paragraph (text), no image involved |
| Map | No third-party requests on load. Inserted 400 px before it's on screen (`src/components/LazyMap.jsx:24-32`) |
| Layout shift | 0 in Lighthouse and 0 in a real scroll-through at 390 and 1366 px. The animations use only opacity and transform |
| Over 150 KB | `Lajsna za kalendare veca.webp` 517 KB, `Lajsna za kalendare.webp` 362 KB (both 3024×4032). Next largest: `Otvarac 2.webp`, 72 KB. All card images are 27 KB or less |

**Recommendation:** no performance project. Do #12 and #14, and check that Phase 4's analytics doesn't lower the score.

### Live check, 2026-11-06

| URL | Result |
|---|---|
| `https://www.boki-edi.com/` | 200, 48,336 bytes, **byte-identical to the local build** |
| `/products` | 308 → `/#proizvodi` ✓ |
| `/contact` | 308 → `/#kontakt` ✓ |
| `/katalog.pdf` | 200, `application/pdf`, `inline; filename="Boki-Edi katalog.pdf"`, same SHA-256 as `public/` ✓ |
| `/letak-kalendari.pdf` | 200, `application/pdf`, `inline; filename="Boki-Edi lajsne za kalendare.pdf"`, same SHA-256 ✓ |
| `http://boki-edi.com/` | 308 → `https://boki-edi.com/` → **307** → `https://www.boki-edi.com/` ✗ |
| `http://www.boki-edi.com/` | 308 → https ✓ |
| `/nepostoji-test` | 404 ✓ |
| `/404` | 200, `noindex` (harmless) |
| `/index.html`, `/index` | 308 → `/` ✓ |
| `/assets/*` | `max-age=31536000, immutable` ✓; compressed with Brotli |
| `https://boki-edi.vercel.app/` | 200, same content, canonical → www, no `X-Robots-Tag` (#20) |

**PDF properties:**

- Catalogue: title "Boki-Edi – katalog proizvoda"; 4 pages; 0.40 MB; tagged.
- Flyer: title "Boki-Edi – lajsne za zidne kalendare"; 1 page; 0.19 MB; tagged.

Both open inline, have no `noindex`, and can be indexed.

---

## Appendix B: URL plan

| URL | Replaces | Group id | Phase |
|---|---|---|---|
| `/` | Stays, with tabs | All | 1 |
| `/setajuca-mehanika` | New | `fascikle` | 2 |
| `/lajsne-za-kalendare` | New; also serves as the `kalendari` group's page | `kalendari` | 2 |
| `/delovi-za-fascikle-i-registratore` | New | `fascikle` | 3 |
| `/uglovi-za-a-table` | New | `ramovi` | 3 |
| `/otvaraci-za-flase` | New | `ostalo` | 3 |

**How they fit with the tabs:** nothing on the home page goes away. The tabs, section ids and group ids stay. The tabs become the overview, and each panel gets one link to its page. The browser never sends hash fragments to the server, so `/#kalendari` can't and shouldn't be redirected: it keeps opening the tab, one click from the page.

**Links that must keep working (none of them is touched):** `/#proizvodi`, `/#kontakt`, `/#fascikle`, `/#kalendari`, `/#ramovi`, `/#ostalo`, `/?proizvod=<name>#kontakt`, `/katalog.pdf`, `/letak-kalendari.pdf`, `/products`, `/contact`. Product names must not change, because the printed catalogue's links contain them.

**What changes in the code:**

| File | Change |
|---|---|
| `src/data/productPages.js` (new) | One entry per page: path, title, description, h1, sections, FAQ, photos, breadcrumb, `updated`. All text lives here |
| `src/seo.js` | Merges those entries into `pages`, which already drives the HTML and sitemap |
| `src/App.jsx` | One route per entry |
| `src/pages/ProductPage.jsx` (new) | One template: no text of its own |
| `scripts/prerender.mjs` | JSON-LD per page (line 91 is home only), `og:image` per page (line 83 is a constant) |
| `src/components/NavBar.jsx` | New entries; highlight based on the path, since those pages have no sections |
| `src/components/Footer.jsx` | Product links and contact details on every page |
| `src/components/Product.jsx` | `headingLevel` prop (h4 is fixed at line 76), link to `page` if the product has one |
| `src/data/products.js` | `page` field on products with their own page |

**Already tested in a throwaway copy:**

- A new `pages` entry plus a route gave `dist/setajuca-mehanika.html` and a sitemap entry, with no change to the prerender script.
- `/setajuca-mehanika` returned 200, with the right title, h1 and canonical. `/products` still 308, unknown URLs still 404.
- Clicking from the new page to `/#kalendari` opened the Kalendari tab, scrolled correctly, restored the home title and canonical, and left no element stuck invisible by the scroll animation.
- Clicking to `/?proizvod=…#kontakt` filled in the subject and scrolled to the form.

`/setajuca-mehanika/` redirected with a 301 in the local preview (`serve-handler`); on Vercel, `trailingSlash: false` should give a 308. Check it after deploy.

**Should the other products get their own pages? No, not now.**

| | Own page per product | Group pages (recommended) |
|---|---|---|
| Content | Almost no text per product; they would be thin and similar, which is what Google tends to ignore | Enough text for one page, and each product gets a section |
| Upkeep | 9 more pages to maintain alone | 3 pages |
| Long-tail searches | Slightly better match for "brzovez" | Still covered: the name is an h2 with its text |
| Risk | Spreads a small site's strength thin | Low |

**Rule for later:** a product earns its own page when Search Console shows steady impressions for its name, and you can provide 150+ words of its own. Brzovez is the likely first candidate.

**Avoiding competition between your own pages:** only `/setajuca-mehanika` has the phrase at the start of its title and as its full h1. The home title shares it with lajsne; the group page gives it one section and links to the page with the exact phrase.

---

## Appendix C: keyword map

Hypotheses, not measured demand. Check them against Search Console. "Today" means the current site.

| Group / product | Phrases buyers may use | Today | Fix |
|---|---|---|---|
| **Home** | sitna metalna galanterija; metalni delovi po meri; proizvođač metalne galanterije; metalna galanterija Beograd. *Ijekavian:* metalni dijelovi po mjeri | ✓ h1, hero. ✗ city in h1 | Keep in the hero |
| **Šetajuća mehanika** | See 2.5 | See 2.3 | Own page |
| **Brzovez** | brzovez; brzovezi; brzovez za fascikle; metalni brzovez; mehanizam za fascikle. *Cyrillic:* брзовез | ✓ h4, alt, hero, meta | Group page section; own page later |
| **Standardna iglica** | iglica za fascikle; iglica za brzovez; iglica za mehaniku | ✗ only "Standardna iglica" and "mehanizme fascikli" | Group section; say "iglica za fascikle" |
| **Metalni završeci** | gumica za fascikle; gumica sa metalnim završecima; gumica za zatvaranje fascikle; lastiš za fascikle | ✓ card text. ✗ alt doesn't say "fascikle" | Alt: "Gumica sa metalnim završecima za fascikle" |
| **Group: fascikle** | delovi za fascikle; delovi za registratore; mehanizam za registratore; oprema za fascikle. *Ijekavian:* dijelovi za fascikle. *Cyrillic:* делови за фасцикле | ✓ tab name only | Group page. **Confirm which parts fit registratori** |
| **Lajsna** | lajsne za kalendare; lajsna za kalendare; metalne lajsne za kalendare; kalendar lajsne; lajsne za zidne kalendare; montiranje lajsni; ugradnja lajsni na kalendare. *Croatian:* letvice za kalendare. *Cyrillic:* лајсне за календаре | ✓ hero, meta, h4. ✗ title, h1; closed tab | Own page. Competitors also say "kalendar lajsne" and "letvice", so use them once |
| **Zakačka** | zakačka za klik-klak ramove; zakacka za klik klak ram; kačenje klik-klak rama; klik ram | ✓ h4, alt, card text | Group section |
| **Ugao za 25, 32** | uglovi za A table; ugao za A tablu; metalni ugao za A table; ugao za 25; ugao za 32 | ✓ card text, meta. ✗ alt is awkward: "Metalni ugao za 25 za A table" | Group page; alt "Metalni ugao za A table, Ugao za 25" |
| **Otvarači** | metalni otvarač za flaše; otvarač za flaše sa logom; otvarač za flaše sa stikerom; reklamni otvarač. *Croatian:* otvarač za boce. *Cyrillic:* отварач за флаше | ✓ h4, alt | Own group page |
| **Opružni lim** | opružni lim; pločice od opružnog lima | ✗ name and alt only | Waiting for its use |

**Competitors for lajsne:** Competitor A has "METALNE LAJSNE ZA KALENDARE" as its h1, offers mounting, and has about 70–80 words of body text. Competitors B and C (PVC) also appear in my results. This keyword has more real competition than šetajuća mehanika, so expect it to take longer.

**Ijekavian variants:** only useful if you target the region, and then only in natural sentences. "Šetajuća mehanika" and "lajsne za kalendare" are spelled the same in both.

---

## Appendix D: structured data

**Home page (`scripts/prerender.mjs`).** Fields with a marker stay out until confirmed. Never ship empty placeholders.

```json
[
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.boki-edi.com/#sajt",
    "name": "Boki-Edi",
    "url": "https://www.boki-edi.com/",
    "inLanguage": "sr"
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.boki-edi.com/#firma",
    "name": "Boki-Edi",
    "description": "<pages['/'].description>",
    "url": "https://www.boki-edi.com/",
    "logo": "https://www.boki-edi.com/android-chrome-512x512.png",
    "image": "https://www.boki-edi.com/og-image.jpg",
    "telephone": "+381603331408",
    "email": "bokiedi@gmail.com",
    "foundingDate": "2007",
    "address": { "unchanged": "see prerender.mjs:44-51" },
    "contactPoint": { "unchanged": "see prerender.mjs:52-59" },
    "knowsAbout": ["Šetajuća mehanika za fascikle", "Lajsne za kalendare", "Brzovezi", "Uglovi za A table"]
  }
]
```

| Field | Status | Value |
|---|---|---|
| `logo` | Add | `/android-chrome-512x512.png`: 512×512, dark "BE" hexagon, readable on white. Meets Google's 112 px minimum |
| `knowsAbout` | Add | As above |
| `geo` | [POTVRDITI] | 44.83695, 20.21098: the **center of the map embed** (`Contact.jsx:7`), not necessarily the door |
| `hasMap` | [POTVRDITI] | `https://maps.google.com/?cid=1682636993187272745`, derived from the embed. It redirects, but check that it opens your place |
| `areaServed` | [POTVRDITI] | `"RS"`, or more if the region counts |
| `openingHoursSpecification` | [POTVRDITI] | Not in the repository |
| `sameAs` | [POTVRDITI] | No URLs in the repository. Add `sameAs: []` to `src/data/company.js`, and output the field only when it isn't empty |
| `legalName` | Optional | A directory shows the registered name, which includes a person's name. Publish it only if you want to |

`LocalBusiness` stays as the type: no more specific subtype fits a metal workshop. Phone and e-mail are at the top level, as Google asks when `contactPoint` is used.

**Product page:**

```json
[
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Početna", "item": "https://www.boki-edi.com/" },
      { "@type": "ListItem", "position": 2, "name": "Šetajuća mehanika", "item": "https://www.boki-edi.com/setajuca-mehanika" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "url": "https://www.boki-edi.com/setajuca-mehanika",
    "name": "Šetajuća mehanika za fascikle",
    "description": "<the page's meta description>",
    "inLanguage": "sr",
    "isPartOf": { "@id": "https://www.boki-edi.com/#sajt" },
    "publisher": { "@type": "LocalBusiness", "@id": "https://www.boki-edi.com/#firma", "name": "Boki-Edi" },
    "primaryImageOfPage": "https://www.boki-edi.com/assets/<hashed file name>",
    "about": {
      "@type": "Thing",
      "name": "Šetajuća mehanika za fascikle",
      "description": "Metalni mehanizam za fascikle, sličan brzovezu."
    }
  }
]
```

After Phase 3, the breadcrumb gets a middle level: Početna › Fascikle i registratori › Šetajuća mehanika.

**FAQPage: don't add it.** Google [stopped showing FAQ rich results on 7 May 2026](https://developers.google.com/search/updates) and removed the documentation on 15 June 2026. The markup is harmless but brings nothing in Google. The visible FAQ stays.

**Product: not worth adding now.** You asked me to judge this, and I recommend against it, which matches the Session 2 decision.

- **It can't produce a result:** Google [requires](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) `review`, `aggregateRating` or `offers` for product snippets, and merchant listings need a price. You have none of these, and a made-up price is out of the question.
- **It would add noise:** I expect Search Console to flag such items as invalid, which would look like a site problem to whoever reads the report.
- **The clarity it would add comes from elsewhere:** the title, h1, first sentence and the `about` node above already explain what the page is about.

If you ever want it, it is about 10 lines: `name`, `image`, `description`, `category`, `brand`, `manufacturer` with the `#firma` id. Don't add `offers` without a real price. Revisit if you start collecting reviews.

---

## Appendix E: seasonal switch

**The rule:** nothing Google uses to judge the page changes between seasons. Only what visitors see does.

| Changes in season | Never changes |
|---|---|
| A highlighted block in the hero, with a link to `/lajsne-za-kalendare` | `<title>`, meta description, h1, canonical |
| (Optional) the default tab | URLs, sitemap, schema, menu order, tab order, group ids |

**Data (`src/data/season.js`):**

```js
// Calendar season: changes only what visitors see. Titles, h1, URLs and schema stay the same all year.
export const calendarSeason = {
  from: "08-01", // MM-DD
  to: "12-31",
  heroTitle: "Sezona kalendara: lajsne za kalendare",
  heroText: "Izrada po meri i montiranje na vaše kalendare. Pošaljite upit na vreme.",
  link: "/lajsne-za-kalendare",
  defaultTab: null, // "kalendari" also opens that tab by default
};

export function isCalendarSeason(date = new Date()) {
  const today = date.toISOString().slice(5, 10);
  return today >= calendarSeason.from && today <= calendarSeason.to;
}
```

**How it's wired:** `vite.config.js` adds `define: { __CALENDAR_SEASON__: JSON.stringify(isCalendarSeason()) }`, so both builds embed the same constant. `Hero.jsx` shows the block if it's true. `prerender.mjs` prints `calendar season: on/off`, so the state appears in every build log. There is no year in the text, so nothing needs yearly editing.

**Why at build time and not by date in the browser:** the pre-rendered HTML is fixed when it's built. A check in the browser could disagree with it, causing a hydration mismatch or a visible jump.

**How it gets switched:** by date, at build time. The state changes at the first deploy on or after the date.

| When | What you do | Redeployed |
|---|---|---|
| 1 August | Vercel → Deployments → latest → Redeploy (or push anything to `main`) | The whole site, no code change |
| 1 January | The same | The whole site |

Set two calendar reminders. If you forget, the site just stays in the previous state until the next deploy, which harms nothing. To change the dates, edit `from` and `to`. An automatic yearly trigger isn't worth building for two clicks a year.

**The default tab: I recommend leaving it off** (`defaultTab: null`), although you listed it as an option.

- Šetajuća mehanika is the main product all year. Switching the tab would take it off the default view for 5 months.
- Calendar buyers already get a one-click link from the hero block.
- The Kalendari tab has a single card, so it looks empty as a first impression on desktop.

It's one field if you want it. It has no ranking risk either way, since all groups stay in the HTML. `Products.jsx:14` would read `useState(__CALENDAR_SEASON__ && calendarSeason.defaultTab ? calendarSeason.defaultTab : productGroups[0].id)`.

**Separate yearly task, as today:** the year in the flyer (`callToAction` in `src/data/flyers.js`).

---

## Sources

**Google Search Central**

- [Latest documentation updates (FAQ rich results removed)](https://developers.google.com/search/updates)
- [Product snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Site names](https://developers.google.com/search/docs/appearance/site-names)
- [Favicon in Search](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Build a sitemap (`lastmod`)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

**Pages reviewed for the keyword research:** the reseller and competitor pages labelled in 2.2 and Appendix C.
