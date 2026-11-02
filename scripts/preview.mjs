// Serves the built site the way Vercel does, using the settings from vercel.json: clean URLs,
// no trailing slash, the redirects (e.g. /products -> /#proizvodi) and 404.html for unknown URLs.
// Usage: npm run preview            (serves dist/)
//        npm run preview -- <folder>
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vercel = JSON.parse(await fs.readFile(path.join(rootDir, "vercel.json"), "utf8"));
const publicDir = path.resolve(rootDir, process.argv[2] ?? "dist");
const port = Number(process.env.PORT ?? 4173);

const config = {
  public: publicDir,
  cleanUrls: vercel.cleanUrls,
  trailingSlash: vercel.trailingSlash,
  // Vercel: "permanent": true -> 308, false -> 307
  redirects: (vercel.redirects ?? []).map(({ source, destination, permanent }) => ({
    source,
    destination,
    type: permanent ? 308 : 307,
  })),
};

// Temporary: the background switcher from dev/ (?bg=1…4) is added to the home page here, so the
// variants can be compared on the built site. Only this local server does it; the files in dist/
// stay unchanged and Vercel never sees them. Remove with the dev/ folder once a background is chosen.
const devDir = path.join(rootDir, "dev");
const devFiles = {
  "/dev/background-variants.css": "text/css; charset=utf-8",
  "/dev/background-switcher.js": "text/javascript; charset=utf-8",
};

async function serveWithBackgroundSwitcher(request, response) {
  const { pathname } = new URL(request.url, "http://localhost");
  if (devFiles[pathname]) {
    response.writeHead(200, { "Content-Type": devFiles[pathname], "Cache-Control": "no-store" });
    response.end(await fs.readFile(path.join(devDir, path.basename(pathname))));
    return;
  }
  if (pathname === "/") {
    const html = (await fs.readFile(path.join(publicDir, "index.html"), "utf8"))
      .replace("</head>", '<link rel="stylesheet" href="/dev/background-variants.css" /></head>')
      .replace("</body>", '<script type="module" src="/dev/background-switcher.js"></script></body>');
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(html);
    return;
  }
  return handler(request, response, config);
}

http
  .createServer(serveWithBackgroundSwitcher)
  .listen(port, () => console.log(`Preview: http://localhost:${port} (serving ${publicDir})`));
