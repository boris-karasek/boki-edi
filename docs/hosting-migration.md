# Moving the site from Vercel to Netlify

Goal: move the hosting to Netlify's Free plan with no change visible to visitors or Google.

**Status:** prepared and checked locally on 2026-11-06. Nothing is pushed or deployed, and Vercel and DNS are untouched.

## Read this first

1. **The domain expires on 2026-12-17.** That's soon, whatever else happens. Make sure it renews before you start ([step 0](#0-before-touching-netlify)).
2. **DNS is hosted on Vercel, so the switch doesn't involve the registrar.** You add two records in Vercel's DNS panel, and undoing it means deleting them.
3. **New Netlify projects are private by default.** On Free, only you can see a private project; everyone else gets a "no access" page. It has to be made public before the domain moves, but only after a correct production deploy.
4. **Netlify may show visitors a "Powered by Netlify" badge.** Free projects created since 19 August 2026 start with it on. Turn it off, or the site visibly changes.
5. **The bare domain will answer 301, not 308,** and HTTP → HTTPS likewise. Netlify has no setting for either. See [the reasons](#the-bare-domain-cant-return-308).
6. **`/products` and `/contact` stay 308 through an edge function,** because redirect rules can't be relied on for 308. The Deploy Preview is what proves this on the real CDN.

In the steps below, `<site>` is your project's name, as in `<site>.netlify.app`. The Netlify paths are from Netlify's docs on 2026-11-06; labels may differ slightly on screen.

## Checklist

### 0. Before touching Netlify

- [ ] **Review the branch** `netlify-migration`. It isn't pushed.
- [ ] **Domain renewal.** Find where you pay for `boki-edi.com` and confirm it renews before 2026-12-17. The public data names Ascio, which is a wholesaler, so look for last year's invoice from a reseller. If you bought it through Vercel, it's under Vercel's **Domains**.
- [ ] **Back up the DNS records.** In Vercel: **Domains** > `boki-edi.com`. Take a screenshot of all records and compare them with [DNS today](#dns-today). A wildcard hides any subdomain I didn't know to ask about, so your list is the complete one.
- [ ] **Real traffic.** On the Vercel project's **Usage** page, note the last 30 days' data transfer and requests. Compare them with the [estimate](#monthly-estimate).
- [ ] **Search Console ownership.** Open **Settings > Ownership verification** and note the method. I found no Google record in DNS, and no tag or file in the site. If yours depends on something that's gone, add a new method now. A DNS `TXT` record is the simplest, since it survives a hosting move.
- [ ] **Protect the contact form:** go through [EmailJS protection](#emailjs-protection) below.

#### EmailJS protection

The form only uses the EmailJS **public** key, as a browser form must; the private key isn't used anywhere. The public key, service ID and template ID are readable in the page's JavaScript and in this repository, so anyone can send requests through your account. On the Free plan (200 requests a month), requests over the limit are dropped, and that would include real inquiries.

- [ ] **Plan and usage:** check both in the EmailJS dashboard. The plan decides the next item.
- [ ] **Recipient:** in the template, **To Email** must be a fixed address, not a `{{variable}}`. Otherwise the form could be used to send mail to anyone.
- [ ] **Domain whitelist.** **Paid plans only** (Personal, $9 a month, and up); it isn't on Free. In the dashboard: **Account > Security**. The format is `scheme://hostname[:port]`:

  | Entry | Why |
  |---|---|
  | `https://www.boki-edi.com` | **The form runs here.** Without this entry, the live form stops working. |
  | `https://boki-edi.com` | The bare domain, as you asked; it only redirects, so it's just a precaution |
  | `https://<site>.netlify.app` | Testing in step 4 |
  | `http://localhost:5173` | `npm run dev` |
  | `http://localhost:4173` | `npm run preview` |
  | `http://localhost:8888` | `npm run preview:netlify` |

  **Send a test message from the live site right after saving.** EmailJS's docs don't mention wildcards, so a Deploy Preview would need its own entry. The whitelist stops other websites from using your key, but a script that fakes its origin can still get through.
- [ ] **Rate limiting: nothing to enable.** EmailJS limits requests by IP address by itself; its API docs state 1 request per second. The browser library also has `limitRate` and `blockHeadless` options, but they need a small code change, and they only slow down people using the page, not scripts calling EmailJS directly. Tell me if you want them.
- [ ] **CAPTCHA: available (reCAPTCHA v2; the docs mention no plan restriction), but don't switch it on yet.** The site sends with `emailjs.send`, which then has to pass a CAPTCHA token. If you tick the box in the template without a code change, **no e-mail can be sent and the form stops working.** It would also add a visible checkbox and Google's script to the page, which is a visible change. I'd hold it until spam is an actual problem. If so: code change first, then the checkbox.

### 1. Check the existing Netlify project

The account and project already exist, so don't create new ones. **Leave builds stopped during this step.**

**Why the first deploy failed:** the project had no build settings and the repository had no `netlify.toml`, so Netlify published the repository itself. The browser got the source `index.html`, which links to `/src/index.jsx`, a file no browser can run, hence "disallowed MIME type". `netlify.toml` fixes this on any branch that has it. `main` won't have it until the merge, so set the dashboard too.

- [ ] **Name.** Rename the project now if you want to, under **Project configuration > General**. The `www` DNS record will point at this name.
- [ ] **Build settings:** **Project configuration > Developer settings > Continuous deployment**:

  | Section | Setting | Value |
  |---|---|---|
  | Repository | Linked repository | `boris-karasek/boki-edi` |
  | Build settings > Configure | Base directory | empty |
  | | Package directory | empty |
  | | Build command | `npm run build` |
  | | Publish directory | `dist` |
  | Branches and deploy contexts > Configure | Production branch | `main` |
  | | Branch deploys | None |
  | | Deploy Previews | Any pull request against your production branch |

- [ ] **Node version:** nothing to set. `netlify.toml` sets 24, and it overrides the dashboard.
- [ ] **Environment variable:** **Project configuration > Environment variables > Add a variable**:

  | Field | Value |
  |---|---|
  | Key | `REACT_APP_EMAILJS_PUBLIC_KEY` |
  | Value | The same as in your local `.env` |
  | Scopes | Builds is required; all is fine too |
  | Deploy contexts | All, with the same value, so previews get it too |
  | **Contains secret values** | **Leave unticked.** The key is public by design and ends up in the page's JavaScript, so secret scanning would fail the build. |

- [ ] **Badge:** **Project configuration > General > Powered by Netlify badge** > off. Netlify is rolling this out gradually, so the setting may not be there yet; look again in step 4.
- [ ] **GitHub access:** at GitHub **Settings > Applications > Netlify > Configure**, make sure `boki-edi` is in the repository access list.
- [ ] **Fork pull requests.** The repository is public, so anyone can open a pull request from a fork, and that can trigger a Deploy Preview that runs their code on your project. At **Project configuration > Environment variables > Site policies**, set the sensitive variable policy to **Require approval**. Netlify applies this by itself only when it detects sensitive variables, and yours isn't marked secret. Your own pull requests aren't held back, as long as your GitHub account is connected to your Netlify user.
- [ ] **Deploy logs.** The default for a public repository is **Public logs**: anyone with a deploy's address can read them. Choose **Private logs**, alongside the build settings. The build prints nothing secret, but nobody else needs them.
- [ ] **Don't press "Make public" yet.** The only production deploy so far is the broken one: a copy of the repository instead of the site.

### 2. Turn builds back on

- [ ] On the project's **Deploys** page, press **Activate builds**. Or: **Project configuration > Developer settings > Continuous deployment > Build settings > Configure > Build status > Active builds**.

This doesn't start a build and costs nothing. From now on, a push to `main` costs 15 credits. Pushes made while builds were stopped aren't picked up afterwards, so do this before step 3.

### 3. Test for free on a Deploy Preview

- [ ] Push the branch and open a pull request. **Don't merge yet.**

  ```bash
  git push -u origin netlify-migration
  ```

  Open the pull request from `netlify-migration` to `main` on GitHub. Vercel builds its own preview of it too; that's harmless. If Netlify doesn't start a build, push an empty commit: `git commit --allow-empty -m "Trigger Deploy Preview" && git push`.
- [ ] **Read the deploy log.** It should show Node 24, the three pre-render lines, no "may be out of date" warning, and the edge function being packaged. The summary should list 2 redirect rules and 3 header rules.
- [ ] **Make previews public,** because they're private by default and the check can't log in: **Project configuration > General > Visitor access > Project visibility**, previews only. I'd leave them public: they contain only the built site, Netlify marks them `noindex`, and their canonical link points to `www`. Leave production private for now.
- [ ] **Run the checks.** Everything must pass; NOTE lines are fine.

  ```bash
  npm run check:hosting -- https://deploy-preview-<number>--<site>.netlify.app
  ```

- [ ] **In a private browser window,** do the site checks from the merge-and-deploy checklist in `CHANGES.md`:
  - the four group links (`/#fascikle`, `/#kalendari`, `/#ramovi`, `/#ostalo`) and a product inquiry
  - **one real test message** from the form. If the EmailJS whitelist is on, add this preview's address first, or leave this test for step 4.
  - both PDFs: they open in the browser and save under the right names
  - a made-up address shows the 404 page
- [ ] **Credits:** under **Usage & billing**, production deploys haven't gone up.

**If a check fails:**

| Check says | What to do |
|---|---|
| `/products` 301, "the edge function didn't answer" | Visitors are still redirected, so it isn't urgent. Look for the edge function in the deploy log. |
| "the repository was published" | Netlify didn't read `netlify.toml`. Check that the Base directory is empty. |
| "wasn't set for this build" | The environment variable is missing for this context. Fix it, then push a new commit. |
| "This address is private" | The visibility setting above. |
| A PDF has no file name | Check that the deploy summary lists 3 header rules. If it does, this is CDN behaviour I couldn't test locally: send me the output. |

### 4. First production deploy (15 credits)

- [ ] **Merge the pull request.** Netlify makes a production deploy. Vercel redeploys as well, and the live site stays the same: I compared the builds of `main` and this branch, and the only file that differs is `letak-kalendari.pdf`, with the same pixels and a new creation date.
- [ ] **Delete the broken first deploy before going public.** **Deploys** > select it > **Options > Delete deploy**. Making the project public exposes its production deploys, and that one is a broken page at its own address. Nothing in it is secret, since the repository is public anyway, but it shouldn't stay reachable. It can be deleted now that it's no longer the published one.
- [ ] **Badge:** check again that it's off.
- [ ] **Make the project public:** **Project configuration > General > Visitor access > Project visibility**, production: Public.
- [ ] **Run the checks on the production address.** Here `x-robots-tag` and injected scripts fail instead of being notes.

  ```bash
  npm run check:hosting -- https://<site>.netlify.app
  ```

- [ ] **In a private browser window, logged out:** the site loads without a login and without a banner or badge. Repeat the site checks from step 3.

### 5. Move the domain

Choose a quiet time, such as an evening, and allow an hour. **Nothing changes at the registrar.**

**E-mail:** there's nothing to protect. The domain has no MX records, so no mail arrives at `@boki-edi.com`. The form and `bokiedi@gmail.com` don't use this domain's DNS. If your record backup from step 0 shows MX or TXT records after all, leave them alone: this step doesn't touch them.

**On Netlify:**

- [ ] **Domain management > Production domains > Add a domain:** enter `www.boki-edi.com`. Netlify adds `boki-edi.com` by itself. Check that **`www` is marked Primary** and the bare domain redirects to it.
- [ ] If Netlify offers Netlify DNS, choose **external DNS** for now. Note the exact values it shows. They should match the table below; if they differ, use Netlify's.
- [ ] From now on `<site>.netlify.app` may redirect to `www`, which is still Vercel. That's normal. To reach Netlify directly until the switch, use the deploy's own address, `https://<deploy-id>--<site>.netlify.app`.

**In Vercel's DNS panel** (**Domains** > `boki-edi.com`):

- [ ] Add these two records:

  | Name | Type | Value | TTL |
  |---|---|---|---|
  | `www` | `CNAME` | `<site>.netlify.app` | 60 |
  | (empty, the bare domain) | `ALIAS` | `apex-loadbalancer.netlify.com` | 60 |

  Vercel's built-in records can't be deleted, but records you add override them. If you can't add the `ALIAS`, use `A` with `75.2.60.5`. If the list already has a record of your own for `www` or the bare domain, delete that first. Change nothing else, and leave the domain attached to the Vercel project; "Invalid Configuration" appearing there is expected.
- [ ] Check that Vercel's nameserver gives the new answers:

  ```bash
  dig +short www.boki-edi.com @ns1.vercel-dns.com
  dig +short boki-edi.com @ns1.vercel-dns.com
  ```

**HTTPS on Netlify:**

- [ ] **Domain management > HTTPS:** press **Verify DNS configuration** if it's offered, and wait for the certificate. It's free and renews by itself. No CAA change is needed: the current records already allow `letsencrypt.org`.

**Downtime, honestly:**

- Old DNS answers stay cached for up to 30 minutes. Those visitors still reach Vercel, which keeps working, so nothing breaks.
- **The one real gap:** visitors already sent to Netlify get a certificate error until the certificate is issued, usually within minutes. Vercel's HSTS header means browsers won't let them click past it. This is why you do it at a quiet time and watch.
- If there's no certificate after about 15 minutes, [roll back](#rollback) and look into it without pressure.

### 6. Checks after the switch

- [ ] **Everything at once.** `Answered by:` must say Netlify, and every line must pass, including the Domain section:

  ```bash
  npm run check:hosting -- https://www.boki-edi.com
  ```

- [ ] **By hand with `curl`:**

  ```bash
  curl -I https://www.boki-edi.com/products             # 308, location: /#proizvodi
  curl -I https://www.boki-edi.com/contact              # 308, location: /#kontakt
  curl -I https://boki-edi.com/                         # 301 to https://www.boki-edi.com/
  curl -I https://www.boki-edi.com/nepostoji            # 404
  curl -I https://www.boki-edi.com/katalog.pdf          # 200, application/pdf, "Boki-Edi katalog.pdf"
  curl -I https://www.boki-edi.com/letak-kalendari.pdf  # 200, application/pdf, "Boki-Edi lajsne za kalendare.pdf"
  curl -I https://<site>.netlify.app/                   # redirect to https://www.boki-edi.com/
  ```

  **If the bare domain answers 200 instead of redirecting,** the site still works, but contact Netlify support and link the [forum report](https://answers.netlify.com/t/apex-domain-serves-200-instead-of-301-despite-redirects-automatically-to-primary-domain/167399). Google could otherwise index it as a second address.
- [ ] **Form:** send one real test message and check it arrives.
- [ ] **Viber or WhatsApp preview:** paste `https://www.boki-edi.com/` into a chat to yourself. It should show the title and `og-image.jpg`. If you see an old preview, it's cached; add `?v=2` once.
- [ ] **QR codes:** with a phone, scan the flyer's (opens the **Kalendari** tab) and the one on page 4 of the catalogue (opens the contact section).
- [ ] **PDFs:** on the site, click "Preuzmite katalog" in Proizvodi and in Kontakt; open both PDF links and save them, and check the names. In the flyer, click the phone, e-mail, website and "Ceo katalog" links.
- [ ] **Look at the site** on a phone and a laptop in a private window, with no badge in the bottom-right corner.
- [ ] **Search Console:**
  1. Sitemaps > resubmit `https://www.boki-edi.com/sitemap.xml`
  2. URL inspection > `https://www.boki-edi.com/` > Test live URL, then Request indexing
  3. No change-of-address request is needed, because the URLs stay the same.
  4. Over the next two weeks, watch **Pages** for new errors, and check that ownership is still verified.
- [ ] **Credits:** look at **Usage & billing** after a day or two.

### 7. When it's safe to remove Vercel

Wait **at least two weeks**, until all of these are true:

- `npm run check:hosting -- https://www.boki-edi.com` still passes
- real form messages have been arriving
- Search Console shows no new errors
- the Vercel project's **Usage** shows next to no traffic

Then, in this order:

- [ ] **Stop Vercel's deploys:** Vercel project **Settings > Git > Disconnect**. This can be undone.
- [ ] **Wait a few more days,** then **delete the Vercel project. Not the domain.** After this, rollback means rebuilding the project first, so don't rush it.
- [ ] Right after, run the check on `www` again and `dig` both names.
- [ ] **Clean up the repository** on a branch:
  - delete `vercel.json` and `syncVercelHeader` in `scripts/lib/hosting-headers.mjs`
  - make `scripts/preview.mjs` read the Netlify config or replace it; `scripts/screenshots.mjs` uses it
  - update the Vercel mentions in `README.md`, `scripts/prerender.mjs`, `src/App.jsx` and `vite.config.js`
  - update the comment in `scripts/make-catalog.mjs` next time you regenerate the catalogue: that file is fingerprinted, so editing it alone sets off the "out of date" warning

**Never delete `boki-edi.com` from Vercel's Domains page while its nameservers point to Vercel.** That removes DNS and takes the site down.

**Moving DNS off Vercel (optional, later).** DNS can stay on Vercel for free, but it keeps you tied to that account. This is the one step that happens at the registrar:

1. On Netlify: **Domain management**, next to the domain: **Options > Set up Netlify DNS**. Check that every record from your backup is there, and copy any that's missing.
2. At the place you pay for the domain, replace the two Vercel nameservers with the four Netlify shows.
3. It can take up to 48 hours. Leave everything on Vercel in place meanwhile. `dig NS boki-edi.com` shows when it's done.
4. Only then remove the domain from Vercel. If it was bought through Vercel, its docs say it can't be removed until it expires, so transfer it out instead.

Undoing a nameserver change is much slower than undoing the records in step 5, so do it separately and only once everything else is settled.

### Rollback

| Problem | What to do | Cost |
|---|---|---|
| **Domain or certificate trouble,** or Netlify as a whole isn't working | In Vercel's DNS panel, **delete the two records from step 5.** The built-in records take over and traffic returns to Vercel, within a minute or so with the 60-second TTL. | 0 |
| **A bad deploy on Netlify** | **Deploys** > an earlier deploy > **Publish deploy**. It's instant, and the next merge to `main` replaces it. | 0 |
| **Credits ran out** and the site is paused | Upgrade to Personal, or use the first row while the Vercel project exists. | $9 a month, or 0 |

To confirm a DNS rollback, run `npm run check:hosting -- https://www.boki-edi.com`: `Answered by:` says Vercel, and the only failures are the bare domain's two 307 lines, as they are today.

This works as long as the Vercel project exists and `vercel.json` is still in `main`, which is why both stay until step 7. Vercel may need a moment to renew its certificate if the site was away from it for a long time.

## Reference

### What Vercel does for the site today

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

#### DNS today

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

### The Netlify config

**Everything is in `netlify.toml`,** not in `public/_redirects` and `public/_headers`:

- The build command, publish folder and Node version have to be in `netlify.toml` anyway, so one file holds everything, as `vercel.json` does now.
- Everything in `public/` is copied to `dist/`. With `_headers` and `_redirects` there, Vercel would serve those two files on the live site until the switch. With `netlify.toml`, `dist/` doesn't change.
- The one thing `_headers` would do better is being simpler for a script to edit. The flyer script only has to touch one short block, so that isn't worth a second file.

**Node version:** `NODE_VERSION = "24"`, the version the site is built and tested with here. Node 20, the old minimum, reached end of life in April 2026.

**New flyers still need only a config entry.** `npm run flyer` now adds or updates the flyer's header in both `vercel.json` and `netlify.toml`, and prints what it changed. The code moved from `make-flyer.mjs` to `scripts/lib/hosting-headers.mjs`.

**The build warning still works.** `make-flyer.mjs` is part of the flyers' fingerprint, so editing it makes `npm run build` warn that the flyers may be out of date.

- The flyer was regenerated once to refresh the fingerprint. The page is pixel-identical at 150 dpi, the JPG and page image are byte-identical, and the PDF has the same size with a new creation date.
- `hosting-headers.mjs` is deliberately left out of the fingerprint, so hosting changes won't mark printed flyers as stale. That includes removing `vercel.json` later.

### How Netlify differs, and what I did about it

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

#### Why 308 comes from an edge function

Netlify's own docs list 301, 302, 404 and 200 as redirect statuses, call 307 "currently unsupported", and never mention 308. The Nitro framework's source says the same and downgrades 307 and 308 for Netlify, and a forum user reported in 2021 that 307/308 rules led to a 404.

Netlify's local server doesn't settle it: it answers any 3xx in a rule, so a 308 rule would pass locally whatever the CDN does. I also didn't deploy anything to test it. Betting the links on your printed flyers on that wasn't worth it, so:

1. **`netlify/edge-functions/permanent-redirects.js` answers with 308.** An edge function sets its own status. Edge functions are billed as ordinary web requests, so it costs no more than any other request, and it only runs on these few URLs.
2. **The 301 rules in `netlify.toml` stay as a safety net.** If the function fails, it's bypassed and the rule answers. I tested this locally by making the function throw: `/products` gave 301 to `/#proizvodi`, not a 404.

**Simpler option, if you ever want it:** Google treats 301 and 308 the same way, as permanent. Deleting the edge function file leaves the plain 301 rules, with no visible change for visitors. I kept 308 because you asked for it.

#### The bare domain can't return 308

Netlify redirects the bare domain to the primary domain by itself, with a 301, and has no setting for it. The merge-and-deploy checklist in `CHANGES.md` expects 308 there; on Netlify, expect **301**. That's still a real improvement on today's 307, because it tells Google the move is permanent.

One open forum report from August 2026 describes a bare domain answering 200 instead of redirecting, even though the dashboard said it would redirect. So the checks after the switch test this explicitly.

### Checking the config

`npm run preview` stays as it is: quick, based on `vercel.json`, and used by `npm run screenshots`. It's my own imitation of a host, so it can't prove anything about Netlify. Two new commands use Netlify's real tools instead:

| Command | What it does |
|---|---|
| `npm run check:hosting` | Builds and serves the site with `netlify serve`, runs every check below, and stops the server. |
| `npm run check:hosting -- <url>` | Runs the same checks on any address: a Deploy Preview, `*.netlify.app`, or the live site. |
| `npm run preview:netlify` | Builds and serves with `netlify serve` at http://localhost:8888, to look around. Ctrl+C stops it. |

**Why `netlify serve`:** it's the most faithful local option. It runs Netlify's own build, including packaging the edge function, then its config parser and edge function runtime. `netlify dev` skips the build. The results here were identical.

**Why not plain `npx netlify-cli`:** I tried it, and npm's lock aborted the install of this 940-package tool, leaving a broken cache that made every later run exit silently. So the script installs the CLI once under `~/.cache/boki-edi/` (about 290 MB) and runs it from there. It isn't in `package.json`, so Netlify's own builds don't spend time installing it. It needs Node 22.13 or newer.

**Stop `npm run preview` first:** `netlify serve` rebuilds `dist/`, and the NTFS drive refuses that while files are in use.

#### Results on 2026-11-06

`npm run check:hosting`: **34 passed, 0 failed, 1 skipped.** The same result came from a fresh clone of this branch.

| Check | Result |
|---|---|
| `/products` | 308, `location: /#proizvodi` |
| `/contact` | 308, `location: /#kontakt` |
| `/products/`, `/contact/` | 308 to the same targets |
| `/products?a=1` | 308, `location: /?a=1#proizvodi` |
| `/index.html` | 308, `location: /` |
| `/nepostoji-provera`, with a trailing slash, and a deep `.html` path | 404, the page "Stranica nije pronađena", `noindex` |
| `/katalog.pdf` | 200, `application/pdf`, `inline; filename="Boki-Edi katalog.pdf"` |
| `/letak-kalendari.pdf` | 200, `application/pdf`, `inline; filename="Boki-Edi lajsne za kalendare.pdf"` |
| Script and stylesheet | `application/javascript` and `text/css`: the MIME error from the first deploy is gone |
| Repository files (`/package.json`, `/src/index.jsx`, `/CHANGES.md`, `/netlify.toml`) | 404 |
| `/assets/*` long cache | **Skipped locally.** The rule matches (a test header came through), but the local server overwrites `Cache-Control`. |

**The checks match today's site.** Run against the live Vercel site, the same script gave 38 passed and 2 failed. Both failures are real: the bare domain's 307.

**The checks do fail when something is wrong:**

| Deliberately broken | What the check reported |
|---|---|
| Publishing the repository root, like the first deploy | 20 failures, starting with "the repository was published, not dist/" |
| Edge function throwing an error, or missing | `/products` 301, "the edge function didn't answer". The safety net still redirected. |
| Built without the EmailJS key | "REACT_APP_EMAILJS_PUBLIC_KEY wasn't set for this build" |
| A flyer's header missing from `netlify.toml` | That PDF fails, with no file name in the response |
| A private project answering 401 | Stops and points to the visibility setting |

#### What only the real deployment can prove

The local server isn't Netlify's CDN. These are checked by running the script against the Deploy Preview, then the live site:

- that the edge function really answers 308 on the CDN
- the `/assets/*` long cache
- the PDFs' headers as the CDN sends them
- nothing injected into the page (the Powered by Netlify badge)
- the bare-domain and HTTP redirects, and the certificate (live site only)

### Credit budget

**Rates,** confirmed on Netlify's pricing page and credit docs on 2026-11-06:

| Item | Credits |
|---|---|
| Successful production deploy | 15 each |
| Bandwidth | 20 per GB |
| Web requests (edge function calls count as these) | 2 per 10,000 |
| Deploy Previews, branch deploys, failed deploys, rolling back to an earlier deploy | 0 |
| **Free plan limit** | **300 a month.** At zero, the site shows "Site not available" until the next month, and you can't buy more on Free. |

#### What one visit costs

Measured in headless Chrome on the built site: a first-time visitor, all images loading, whole page scrolled, at 1366×768 and 390×844.

| Part | Requests | Transfer | Note |
|---|---|---|---|
| Page, script, styles, images, icons | 14 | 210 KB | Laptop; 13 and 195 KB on a phone. Text compressed with gzip. |
| Catalogue (390 KB) | 0.25 | 98 KB | **Assumes** 1 visit in 4 opens it |
| Flyer (182 KB) | 0.05 | 9 KB | **Assumes** 1 visit in 20 opens it |
| Large photo in the viewer | 0.3 | 30 KB | **Assumes** 3 visits in 10 open a photo of about 100 KB |
| Crawlers, bots and everything else | 4 | 100 KB | **Assumes** 30% on top |
| **Total used below** | **about 20** | **about 450 KB** | |

The Google map doesn't count: it loads from Google. EmailJS doesn't either. Returning visitors cost less than this, because `/assets/*` stays in their browser's cache, and I didn't subtract that.

#### Monthly estimate

So one visit costs about 0.013 credits.

| Visits a month | Bandwidth | Requests | Traffic credits | With 4 production deploys (60) | Share of 300 |
|---|---|---|---|---|---|
| 1,000 | 0.45 GB | 20,000 | 13 | **73** | 24% |
| 3,000 | 1.35 GB | 60,000 | 39 | **99** | 33% |
| 10,000 | 4.5 GB | 200,000 | 130 | **190** | 63% |

With 4 deploys a month, the limit is reached at about **18,000 visits**, or about 12 GB of traffic. For a site that's mainly a link you send to customers, deploys are likely to be the bigger cost, not visitors.

**Check this against real numbers:** the Vercel dashboard's **Usage** page shows the last 30 days' data transfer and requests. Do this before moving, because that history stays behind on Vercel.

#### Deploy workflow

Target: **at most 4 production deploys a month, in reviewed batches.**

1. Work on a branch and push it. Nothing is charged.
2. Open a pull request to `main`. Netlify builds a Deploy Preview: **0 credits**, as many as you like.
3. Check the preview: `npm run check:hosting -- https://deploy-preview-<number>--<site>.netlify.app`, then look at it in the browser. The check itself uses a negligible amount of credits.
4. Keep collecting finished work, then merge to `main` in a batch. **Only this costs 15 credits.**

**To save credits:**

- **Merges that only touch docs:** put `[skip netlify]` in the commit message so no production deploy starts. Netlify's docs say the marker has to be on the most recent commit of the push, and don't explicitly cover merge commits. So the first time, check on the **Deploys** page that nothing was deployed.
- **Avoid "Retry deploy" and "Clear cache and deploy" when nothing is broken.** Each successful one is a production deploy.
- **To undo a bad deploy,** use **Publish deploy** on an earlier one. It's instant and costs nothing. A new commit costs 15.

#### Only `main` is a production deploy

This is a dashboard setting; `netlify.toml` can't set it. At **Project configuration > Developer settings > Continuous deployment > Branches and deploy contexts > Configure**:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Branch deploys | None |
| Deploy Previews | Any pull request against your production branch |

#### Watching the credits

All under **Usage & billing** in the team's dashboard:

- **The top of the page:** credits still available
- **Credit usage breakdown:** credits by feature
- **Account usage insights > Credits:** a daily graph split into production deploys, bandwidth and web requests

Netlify also sends an e-mail and an in-app notice at **50%, 75% and 100%** of the monthly credits.

**If credits run low:**

- At 75%, stop deploying until the month resets.
- If a bot is the cause, it shows up as a jump in bandwidth or web requests. The Free plan includes firewall traffic rules and basic rate limiting.
- If the site gets paused, upgrading to Personal ($9 a month, 1,000 credits) is the quickest fix. While the Vercel project still exists, the [rollback](#rollback) works too.
