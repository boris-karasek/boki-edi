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

## How Netlify differs, and what I did about it

"CDN" means measured with `curl` on public Netlify sites (netlify.com, smashingmagazine.com, kubernetes.io) on 2026-11-06. "Local" means tested with Netlify's local server. Nothing was deployed, so none of this has run on your own project yet. The Deploy Preview in the checklist is what confirms it.

| Behaviour | Vercel today | Netlify | What I did |
|---|---|---|---|
| `/products`, `/contact` | 308 | Rules can't be relied on for 308 (below) | **Edge function answers 308.** Local: 308, right `location`, query kept. |
| `/products/`, `/contact/` | 308 → 308 → target | Rules ignore a trailing slash (docs) | Same function, one hop instead of two. Same result. |
| `/index.html` | 308 to `/` | 200, a second copy of the home page (CDN) | Same function: 308 to `/`. |
| Unknown URL | 404 with `404.html` | Same, automatically (CDN, local) | Nothing needed. |
| `/nepostoji/` | 308, then 404 | 404 straight away (CDN, local) | Nothing needed: same result. |
| `/404` | 200, `noindex` | 200, `noindex` (CDN, local) | Nothing needed: the same as now. |
| `/404.html` | 308 to `/404`, then 200 | 200, `noindex` (CDN, local) | Left as it is: nothing links to it and Google is told not to index it. |
| PDF file names | Header per PDF | Header per PDF (local) | `[[headers]]` in `netlify.toml`. |
| `/assets/*` long cache | Yes | Rule matches (local); value not visible locally | `[[headers]]`. The Deploy Preview check reads the real value. |
| Other files' cache | `max-age=0, must-revalidate` | `public,max-age=0,must-revalidate` by default (CDN) | Nothing needed. |
| Bare domain → www | **307** | **301**, not configurable (CDN, docs) | Nothing possible. Better than today: 301 is permanent, 307 isn't. |
| HTTP → HTTPS | 308 | **301**, not configurable (CDN) | Nothing possible. Same meaning for browsers and Google. |
| HSTS header | 2 years | 1 year (CDN) | Left at Netlify's default. Visitors won't notice. |
| `content-disposition: inline` on all files | Yes | No | Nothing needed: browsers show these files either way. |
| `/Products`, `/KATALOG.PDF` | 404 | May work instead: Netlify ignores letter case in paths (CDN) | Left: at worst a mistyped link starts working. |

### Why 308 comes from an edge function

Netlify's own docs list 301, 302, 404 and 200 as redirect statuses, call 307 "currently unsupported", and never mention 308. The Nitro framework's source says the same and downgrades 307 and 308 for Netlify, and a forum user reported in 2021 that 307/308 rules led to a 404.

Netlify's local server doesn't settle it: it answers any 3xx in a rule, so a 308 rule would pass locally whatever the CDN does. I also didn't deploy anything to test it. Betting the links on your printed flyers on that wasn't worth it, so:

1. **`netlify/edge-functions/permanent-redirects.js` answers with 308.** An edge function sets its own status. Edge functions are billed as ordinary web requests, so it costs no more than any other request, and it only runs on these few URLs.
2. **The 301 rules in `netlify.toml` stay as a safety net.** If the function fails, it's bypassed and the rule answers. I tested this locally by making the function throw: `/products` gave 301 to `/#proizvodi`, not a 404.

**Simpler option, if you ever want it:** Google treats 301 and 308 the same way, as permanent. Deleting the edge function file leaves the plain 301 rules, with no visible change for visitors. I kept 308 because you asked for it.

### The bare domain can't return 308

Netlify redirects the bare domain to the primary domain by itself, with a 301, and has no setting for it. The merge-and-deploy checklist in `CHANGES.md` expects 308 there; on Netlify, expect **301**. That's still a real improvement on today's 307, because it tells Google the move is permanent.

One open forum report from August 2026 describes a bare domain answering 200 instead of redirecting, even though the dashboard said it would redirect. So the checks after the switch test this explicitly.
