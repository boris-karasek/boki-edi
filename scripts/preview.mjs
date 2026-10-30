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

http
  .createServer((request, response) => handler(request, response, config))
  .listen(port, () => console.log(`Preview: http://localhost:${port} (serving ${publicDir})`));
