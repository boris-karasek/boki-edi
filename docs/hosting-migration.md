# Moving the site from Vercel to Netlify

Goal: move the hosting to Netlify's Free plan with no change visible to visitors or Google.

## What Vercel does for the site today

From `vercel.json` and `CHANGES.md`, and measured on the live site with `curl` on 2026-11-06. The Vercel dashboard itself wasn't visible to me, so the build settings are as `CHANGES.md` records them.

| What | Where it's set | What the live site does |
|---|---|---|
| **Build** | Dashboard (Vite preset) | `npm run build`, output `dist`, Node 20 or newer. A push to `main` deploys production. |
| **Old URLs** | `vercel.json` `redirects` | `/products` → **308**, `location: /#proizvodi`<br>`/contact` → **308**, `location: /#kontakt`<br>The query is kept: `/products?a=1` → `/?a=1#proizvodi` |
| **Clean URLs** | `cleanUrls: true` | `/index.html` → 308 `/`<br>`/404.html` → 308 `/404`<br>`/404` → 200, the "not found" page, which has `noindex` |
| **No trailing slash** | `trailingSlash: false` | `/products/` → 308 `/products`<br>`/nepostoji/` → 308 `/nepostoji` |
| **Real 404** | `dist/404.html` | `/nepostoji` → **404** with the 404 page (4,107 bytes, `noindex`) |
| **Catalogue PDF** | `vercel.json` `headers` | `/katalog.pdf` → 200, `application/pdf`, `content-disposition: inline; filename="Boki-Edi katalog.pdf"` |
| **Flyer PDF** | `vercel.json` `headers`, kept in step by `npm run flyer` | `/letak-kalendari.pdf` → 200, `application/pdf`, `content-disposition: inline; filename="Boki-Edi lajsne za kalendare.pdf"` |
| **Long cache for built files** | `vercel.json` `headers` | `/assets/*` → `cache-control: public, max-age=31536000, immutable` |
| **Short cache for the rest** | Vercel default | `cache-control: public, max-age=0, must-revalidate` |
| **Other default headers** | Vercel default | `strict-transport-security: max-age=63072000` on HTTPS<br>`content-disposition: inline` on every file. Browsers behave the same without it. |
| **Bare domain → www** | Dashboard, Domains | `https://boki-edi.com/…` → **307** to `https://www.boki-edi.com/…`, keeping the path. It's still 307: the change to 308 in `CHANGES.md` was never made. |
| **HTTP → HTTPS** | Vercel default | **308** on both domains |
| **HTTPS certificate** | Vercel default | Automatic |
| **Environment variable** | Dashboard | `REACT_APP_EMAILJS_PUBLIC_KEY`: Vite writes it into the JavaScript at build time. The contact form can't send without it. |
| **DNS** | Vercel's nameservers | See [DNS today](#dns-today) below. |

**Not used:** functions, rewrites, Vercel Analytics and Vercel image optimisation. `package.json` has no `@vercel/*` package and the site is plain static files.

**Letter case:** `/Products` and `/KATALOG.PDF` give 404 on Vercel.

### DNS today

From `dig` and the public registration data (RDAP), 2026-11-06:

| What | Value |
|---|---|
| **Nameservers** | `ns1.vercel-dns.com`, `ns2.vercel-dns.com`: **DNS is hosted on Vercel** |
| **Registrar** | Ascio Technologies. It's a wholesaler, so you probably pay a reseller; the data doesn't name one. |
| **Domain expires** | **2026-12-17** |
| **DNSSEC** | Off, so there's nothing to undo |
| **`boki-edi.com`** | `A` 64.29.17.1, 64.29.17.65 (TTL 1800) |
| **`www.boki-edi.com`** | `A` 216.198.79.1, 216.198.79.65 (TTL 1800) |
| **Any other name** | Vercel's addresses too (a wildcard): `mail`, `webmail` and made-up names all answer |
| **CAA** | Allows `letsencrypt.org`, `pki.goog`, `sectigo.com` |
| **MX** | **None.** No mail can be received at `@boki-edi.com`. |
| **TXT (SPF, DKIM, DMARC, Google)** | **None** on the names I checked |

## The Netlify config

**Everything is in `netlify.toml`,** not in `public/_redirects` and `public/_headers`:

- The build command, publish folder and Node version have to be in `netlify.toml` anyway, so one file holds everything, as `vercel.json` does now.
- Everything in `public/` is copied to `dist/`. With `_headers` and `_redirects` there, Vercel would serve those two files on the live site until the switch. With `netlify.toml`, `dist/` doesn't change.
- The one thing `_headers` would do better is being simpler for a script to edit. The flyer script only has to touch one short block, so that isn't worth a second file.

**Node version:** `NODE_VERSION = "24"`, the version the site is built and tested with here. Node 20, the old minimum, reached end of life in April 2026.

**New flyers still need only a config entry.** `npm run flyer` now adds or updates the flyer's header in both `vercel.json` and `netlify.toml`, and prints what it changed. The code moved from `make-flyer.mjs` to `scripts/lib/hosting-headers.mjs`.

**The build warning still works.** `make-flyer.mjs` is part of the flyers' fingerprint, so editing it makes `npm run build` warn that the flyers may be out of date.

- The flyer was regenerated once to refresh the fingerprint. The page is pixel-identical at 150 dpi, the JPG and page image are byte-identical, and the PDF has the same size with a new creation date.
- `hosting-headers.mjs` is deliberately left out of the fingerprint, so hosting changes won't mark printed flyers as stale. That includes removing `vercel.json` later.
