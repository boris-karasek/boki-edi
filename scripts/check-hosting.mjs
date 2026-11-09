// Checks that a host serves the site the way Vercel does today: every redirect, the real 404, the PDFs'
// file names, the cache headers and that it is the built site and not the repository.
//
// Usage: npm run check:hosting                 builds with Netlify's tools, serves the result and checks it
//        npm run check:hosting -- <url>        checks a deployed address, e.g. a Deploy Preview
//        npm run preview:netlify               builds and serves it, to look at the site
//
// The local server is `netlify serve`: Netlify's own build and config parser. The 290 MB CLI is installed
// once under ~/.cache/boki-edi, not with the site: Netlify's build would install it too, and `npx` proved
// unreliable for a package this size (npm's lock aborted the install and left a broken cache).
// It is not Netlify's CDN, though: it may treat a redirect's #fragment differently, for example, and it
// overwrites Cache-Control. So also run this script against the Deploy Preview. See docs/hosting-migration.md.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadSiteData } from "./lib/print.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NETLIFY_CLI = "netlify-cli@27.16.2"; // needs Node 22.13 or newer
const CLI_DIR = path.join(os.homedir(), ".cache", "boki-edi", NETLIFY_CLI);
const LOCAL_URL = "http://localhost:8888"; // the default port of `netlify serve`
const SERVER_TIMEOUT_MS = 5 * 60 * 1000; // includes the build
const SITE_HOST = "www.boki-edi.com";
const BARE_HOST = "boki-edi.com";

// --- Results ----------------------------------------------------------------------------------

const count = { PASS: 0, FAIL: 0, SKIP: 0, NOTE: 0 };

function report(kind, label, detail = "") {
  count[kind]++;
  console.log(`  ${kind}  ${label.padEnd(34)} ${detail}`);
}
const check = (ok, label, detail) => report(ok ? "PASS" : "FAIL", label, detail);
const section = (title) => console.log(`\n${title}`);

// --- Requests ---------------------------------------------------------------------------------

const request = (url, method = "GET") => fetch(url, { method, redirect: "manual" });

// Follows redirects by hand. A location with a #fragment is where the browser ends up, so it stops there.
async function followRedirects(startUrl, method = "GET") {
  const statuses = [];
  let url = startUrl;
  let location = null;
  let response = await request(url, method);
  while (response.status >= 300 && response.status < 400 && statuses.length < 5) {
    statuses.push(response.status);
    location = response.headers.get("location");
    if (location?.includes("#")) break;
    url = new URL(location, url).href;
    response = await request(url, method);
  }
  return { statuses, location, response };
}

// 301 on Netlify (netlify.toml), 308 on Vercel (vercel.json): Google treats them the same
const isPermanent = (status) => status === 301 || status === 308;
const titleOf = (html) => html.match(/<title>(.*?)<\/title>/s)?.[1];
const hasNoindex = (html) => /<meta name="robots" content="noindex"/.test(html);

// --- Checks -----------------------------------------------------------------------------------

async function checkRedirects(base) {
  section("Old URLs: permanent redirect with the right location");
  const cases = [
    ["/products", "/#proizvodi"],
    ["/contact", "/#kontakt"],
    ["/products/", "/#proizvodi"],
    ["/contact/", "/#kontakt"],
    ["/products?a=1", "/?a=1#proizvodi"],
  ];
  for (const [from, to] of cases) {
    const { statuses, location } = await followRedirects(base + from);
    const ok = statuses.length > 0 && statuses.every(isPermanent) && location === to;
    check(ok, from, `${statuses.join(" → ") || "no redirect"} → ${location ?? "-"}`);
  }
  // `curl -I` sends HEAD
  for (const [from, to] of cases.slice(0, 2)) {
    const { statuses, location } = await followRedirects(base + from, "HEAD");
    check(statuses.length === 1 && isPermanent(statuses[0]) && location === to, `HEAD ${from}`, `${statuses.join(" → ")} → ${location}`);
  }
  // Vercel redirects /index.html to /. Netlify serves the same page, whose canonical link points to /
  const { statuses, response } = await followRedirects(`${base}/index.html`);
  const hasCanonical = (await response.text()).includes(`<link rel="canonical" href="https://${SITE_HOST}/"`);
  check(response.status === 200 && statuses.every(isPermanent) && hasCanonical, "/index.html", `${[...statuses, response.status].join(" → ")}, ${hasCanonical ? "canonical /" : "no canonical"}`);
}

async function checkHome(base, home, html, { isPreview }) {
  const builtHtml = await fs.readFile(path.join(rootDir, "dist", "index.html"), "utf8").catch(() => "");

  section("Home page: the built site, not the repository");
  check(home.status === 200 && home.headers.get("content-type")?.includes("text/html"), "/", `${home.status}, ${home.headers.get("content-type")}`);
  check(!html.includes("/src/index.jsx"), "no link to /src/index.jsx", html.includes("/src/index.jsx") ? "the repository was published, not dist/" : "");
  check(html.includes(`<link rel="canonical" href="https://${SITE_HOST}/"`), "canonical", `https://${SITE_HOST}/`);
  check(titleOf(html) === titleOf(builtHtml), "title as in dist/index.html", titleOf(html));

  const noindex = home.headers.get("x-robots-tag")?.includes("noindex");
  if (isPreview) report("NOTE", "x-robots-tag", noindex ? "noindex: expected on a preview" : "none");
  else check(!noindex, "no x-robots-tag: noindex", home.headers.get("x-robots-tag") ?? "none");

  const hasNetlifyScript = /netlify/i.test(html);
  if (isPreview && hasNetlifyScript) report("NOTE", "Netlify script in the page", "fine on a preview; must not be there on production");
  else check(!hasNetlifyScript, "nothing injected by Netlify", hasNetlifyScript ? "turn off the Powered by Netlify badge" : "");

  section("Built files");
  const script = html.match(/<script[^>]+src="(\/assets\/[^"]+\.js)"/)?.[1];
  const style = html.match(/<link[^>]+href="(\/assets\/[^"]+\.css)"/)?.[1];
  if (!script || !style) {
    check(false, "script and stylesheet", "not found in the page");
    return;
  }
  const scriptResponse = await request(base + script);
  const scriptType = scriptResponse.headers.get("content-type") ?? "";
  check(scriptResponse.status === 200 && scriptType.includes("javascript"), "script's MIME type", `${scriptResponse.status}, ${scriptType}`);
  const styleResponse = await request(base + style);
  check(styleResponse.status === 200 && styleResponse.headers.get("content-type")?.includes("text/css"), "stylesheet's MIME type", `${styleResponse.status}, ${styleResponse.headers.get("content-type")}`);

  const images = [...new Set([...html.matchAll(/\/assets\/[^"<>]+?\.(?:webp|jpg|png)/g)].map(([file]) => file))];
  const broken = [];
  for (const image of images) {
    const response = await request(base + encodeURI(image), "HEAD");
    if (response.status !== 200 || !response.headers.get("content-type")?.startsWith("image/")) broken.push(`${image} (${response.status})`);
  }
  check(images.length > 0 && broken.length === 0, "images, some with spaces in names", broken.join(", ") || `${images.length} files: 200, image/*`);

  // The value is never printed
  const code = await scriptResponse.text();
  check(/publicKey:\s*"[^"]{6,}"/.test(code), "contact form has its EmailJS key", /publicKey:\s*"/.test(code) ? "" : "REACT_APP_EMAILJS_PUBLIC_KEY wasn't set for this build");

  section("Cache headers");
  const assetCache = scriptResponse.headers.get("cache-control") ?? "";
  if (base === LOCAL_URL) report("SKIP", "/assets/*: long cache", "the local server overwrites Cache-Control; checked on a deployed address");
  else check(assetCache.includes("max-age=31536000") && assetCache.includes("immutable"), "/assets/*: long cache", assetCache);
  const homeCache = home.headers.get("cache-control") ?? "";
  check(/max-age=0/.test(homeCache), "/: browser asks again each time", homeCache);
}

async function checkNotFound(base) {
  section("Unknown URLs: real 404 with the 404 page");
  const page = await fs.readFile(path.join(rootDir, "dist", "404.html"), "utf8").catch(() => "");
  for (const url of ["/nepostoji-provera", "/nepostoji-provera/", "/nepostoji/duboko/stranica.html"]) {
    const { statuses, response } = await followRedirects(base + url);
    const html = await response.text();
    const ok = response.status === 404 && titleOf(html) === titleOf(page) && hasNoindex(html);
    check(ok, url, `${[...statuses, response.status].join(" → ")}, "${titleOf(html)}", ${hasNoindex(html) ? "noindex" : "no noindex"}`);
  }
  // Nothing links to these two. Vercel answers /404 with 200 too; what matters is that Google is told not to index them.
  for (const url of ["/404", "/404.html"]) {
    const { statuses, response } = await followRedirects(base + url);
    const html = await response.text();
    check(hasNoindex(html), `${url} (not linked anywhere)`, `${[...statuses, response.status].join(" → ")}, ${hasNoindex(html) ? "noindex" : "no noindex"}`);
  }
  section("The repository isn't published");
  for (const url of ["/package.json", "/src/index.jsx", "/CHANGES.md", "/netlify.toml"]) {
    const response = await request(base + url, "HEAD");
    check(response.status === 404, url, String(response.status));
  }
}

async function checkPdfs(base) {
  section("PDFs: application/pdf with the right file name");
  const { flyers } = await loadSiteData(rootDir, ["/src/data/flyers.js"]);
  const pdfs = [
    ["/katalog.pdf", "Boki-Edi katalog.pdf"], // DOWNLOAD_NAME in scripts/make-catalog.mjs
    ...Object.values(flyers).map((flyer) => [`/${flyer.file}.pdf`, flyer.downloadName]),
  ];
  for (const [url, name] of pdfs) {
    const response = await request(base + url);
    const body = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get("content-type");
    const disposition = response.headers.get("content-disposition");
    const ok = response.status === 200 && type === "application/pdf" && disposition === `inline; filename="${name}"` && body.subarray(0, 5).toString() === "%PDF-";
    check(ok, url, `${response.status}, ${type}, ${disposition}`);
  }
}

async function checkOtherFiles(base) {
  section("Other files");
  const files = [
    ["/robots.txt", "text/plain"],
    ["/sitemap.xml", "xml", `<loc>https://${SITE_HOST}/</loc>`],
    ["/og-image.jpg", "image/jpeg"],
    ["/favicon.ico", "image/"],
    ["/site.webmanifest", ""],
  ];
  for (const [url, type, content] of files) {
    const response = await request(base + url);
    const actualType = response.headers.get("content-type") ?? "";
    const ok = response.status === 200 && actualType.includes(type) && (!content || (await response.text()).includes(content));
    check(ok, url, `${response.status}, ${actualType}`);
  }
}

// Only when checking the real domain
async function checkDomain() {
  section("Domain");
  const cases = [
    [`https://${BARE_HOST}/`, `https://${SITE_HOST}/`],
    [`https://${BARE_HOST}/katalog.pdf`, `https://${SITE_HOST}/katalog.pdf`],
    [`http://${SITE_HOST}/`, `https://${SITE_HOST}/`],
  ];
  for (const [from, to] of cases) {
    const response = await request(from);
    const location = response.headers.get("location");
    check(isPermanent(response.status) && location === to, from, `${response.status} → ${location ?? "-"}`);
  }
  // Two hops on Vercel (HTTPS, then www), one or two on Netlify
  const { statuses, response } = await followRedirects(`http://${BARE_HOST}/`);
  check(statuses.length > 0 && response.status === 200 && new URL(response.url).host === SITE_HOST, `http://${BARE_HOST}/`, `${statuses.join(" → ")} → ${response.url}`);
}

async function runChecks(base) {
  console.log(`Checking ${base}`);
  const url = new URL(base);
  const isLocal = base === LOCAL_URL;
  // Deploy Previews and deploy permalinks: https://deploy-preview-12--site.netlify.app, https://<id>--site.netlify.app
  const isPreview = isLocal || /^(deploy-preview-\d+|[0-9a-f]{24})--/.test(url.host);

  const home = await request(`${base}/`);
  console.log(`Answered by: ${home.headers.get("server") ?? "?"}`);
  const redirectsToLogin = home.status >= 300 && home.status < 400 && /netlify\.com/.test(home.headers.get("location") ?? "");
  if (home.status === 401 || home.status === 403 || redirectsToLogin) {
    console.error(
      `\nThis address is private (${home.status}), so it can't be checked without logging in. In Netlify:\n` +
        "Project configuration > General > Visitor access > Project visibility. See docs/hosting-migration.md."
    );
    return 2;
  }
  const html = await home.text();

  await checkRedirects(base);
  await checkHome(base, home, html, { isPreview });
  await checkNotFound(base);
  await checkPdfs(base);
  await checkOtherFiles(base);
  if (url.host === SITE_HOST) await checkDomain();

  console.log(`\n${count.PASS} passed, ${count.FAIL} failed, ${count.SKIP} skipped`);
  if (isLocal) {
    console.log(
      "This was Netlify's local server, not its CDN. Also check the Deploy Preview:\n" +
        "  npm run check:hosting -- https://deploy-preview-<number>--<site>.netlify.app"
    );
  }
  return count.FAIL ? 1 : 0;
}

// --- Local server -----------------------------------------------------------------------------

const isWindows = process.platform === "win32";

// Returns the path of the CLI. The marker file is written last, so an interrupted install is repeated.
async function installNetlifyCli() {
  const marker = path.join(CLI_DIR, ".installed");
  if (!existsSync(marker)) {
    console.log(`Installing ${NETLIFY_CLI} into ${CLI_DIR} (about 290 MB, only once)...`);
    await fs.mkdir(CLI_DIR, { recursive: true });
    const args = ["install", "--prefix", CLI_DIR, "--no-audit", "--no-fund", "--loglevel=error", NETLIFY_CLI];
    const code = await new Promise((resolve, reject) => {
      const install = spawn("npm", args, { cwd: CLI_DIR, stdio: "inherit", shell: isWindows });
      install.on("error", reject);
      install.on("exit", resolve);
    });
    if (code !== 0) throw new Error(`Installing ${NETLIFY_CLI} failed (exit code ${code}).`);
    await fs.writeFile(marker, "");
  }
  return path.join(CLI_DIR, "node_modules", ".bin", isWindows ? "netlify.cmd" : "netlify");
}

async function startNetlifyServe() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 13)) throw new Error(`${NETLIFY_CLI} needs Node 22.13 or newer (this is ${process.version}).`);

  const cli = await installNetlifyCli();
  console.log("Building and starting netlify serve...");
  const server = spawn(cli, ["serve", "--offline"], {
    cwd: rootDir,
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: isWindows,
    detached: !isWindows, // so stop() also ends the processes it starts
  });
  const stop = () => {
    if (server.exitCode !== null) return;
    if (isWindows) server.kill();
    else process.kill(-server.pid);
  };
  let log = "";
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`netlify serve didn't start in time:\n${log}`)), SERVER_TIMEOUT_MS);
    const onOutput = (chunk) => {
      log += chunk;
      if (log.includes("Local dev server ready")) {
        clearTimeout(timer);
        resolve();
      }
    };
    server.stdout.on("data", onOutput);
    server.stderr.on("data", onOutput);
    server.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`netlify serve exited (${code}):\n${log}`));
    });
  });
  return stop;
}

// --- Main -------------------------------------------------------------------------------------

const args = process.argv.slice(2);
const serveOnly = args.includes("--serve");
const target = args.find((arg) => !arg.startsWith("--"));

try {
  if (target) {
    process.exitCode = await runChecks(target.replace(/\/+$/, ""));
  } else {
    const stop = await startNetlifyServe();
    if (serveOnly) {
      console.log(`Preview with the Netlify rules: ${LOCAL_URL} (Ctrl+C to stop)`);
      process.on("SIGINT", () => {
        stop();
        process.exit(0);
      });
      await new Promise(() => {});
    }
    try {
      process.exitCode = await runChecks(LOCAL_URL);
    } finally {
      stop();
    }
  }
} catch (error) {
  console.error(error.message ?? error);
  process.exitCode = 1;
}
