// Keeps the hosting configs in step with the flyers. A flyer's PDF opens in the browser and is saved as
// `downloadName` because the host sends that name in a Content-Disposition header, set per PDF in
// vercel.json and netlify.toml. Adds the header for a flyer if it is missing, or updates the name; other
// entries stay as they are.
//
// This file is not part of the flyers' fingerprint (scripts/lib/source-hash.mjs): changing how the host is
// configured doesn't change a printed page.
import fs from "node:fs/promises";
import path from "node:path";

import { BuildError } from "./print.mjs";

const NETLIFY_FLYERS_MARKER = "# Flyers: `npm run flyer` adds or updates the entries below this line.";

// Each returns "added", "updated" or null.
async function syncVercelHeader(rootDir, source, value) {
  const vercelFile = path.join(rootDir, "vercel.json");
  let text = await fs.readFile(vercelFile, "utf8");
  const entry = JSON.parse(text).headers?.find((header) => header.source === source);
  const current = entry?.headers.find((header) => header.key === "Content-Disposition")?.value;
  if (current === value) return null;

  if (current !== undefined) {
    text = text.replace(JSON.stringify(current), JSON.stringify(value));
  } else {
    const block =
      `    {\n      "source": ${JSON.stringify(source)},\n` +
      `      "headers": [{ "key": "Content-Disposition", "value": ${JSON.stringify(value)} }]\n    },\n`;
    if (!/"headers": \[\n/.test(text)) throw new BuildError(`vercel.json: no "headers" list to add ${source} to`);
    text = text.replace(/"headers": \[\n/, (match) => match + block);
  }
  const check = JSON.parse(text).headers.find((header) => header.source === source);
  if (check?.headers[0]?.value !== value) throw new BuildError(`vercel.json: could not set the header for ${source}`);
  await fs.writeFile(vercelFile, text);
  return current === undefined ? "added" : "updated";
}

async function syncNetlifyHeader(rootDir, source, value) {
  const netlifyFile = path.join(rootDir, "netlify.toml");
  let text = await fs.readFile(netlifyFile, "utf8");
  // A JSON string is a valid TOML string for the plain ASCII that make-flyer.mjs allows in downloadName
  const line = `Content-Disposition = ${JSON.stringify(value)}`;
  const entry = new RegExp(
    `for = ${JSON.stringify(source).replaceAll(".", "\\.")}\\s*\\[headers\\.values\\]\\s*Content-Disposition = [^\\r\\n]*`
  );
  const current = text.match(entry)?.[0];
  if (current?.endsWith(line)) return null;

  if (current !== undefined) {
    text = text.replace(entry, (match) => match.replace(/Content-Disposition = .*/, () => line));
  } else {
    if (!text.includes(NETLIFY_FLYERS_MARKER)) {
      throw new BuildError(`netlify.toml: the line "${NETLIFY_FLYERS_MARKER}" is missing, so ${source} can't be added`);
    }
    const block = `[[headers]]\n  for = ${JSON.stringify(source)}\n  [headers.values]\n    ${line}\n`;
    text = text.replace(NETLIFY_FLYERS_MARKER, () => `${NETLIFY_FLYERS_MARKER}\n${block}`);
  }
  if (!text.match(entry)?.[0].endsWith(line)) throw new BuildError(`netlify.toml: could not set the header for ${source}`);
  await fs.writeFile(netlifyFile, text);
  return current === undefined ? "added" : "updated";
}

// Returns what changed, e.g. [["netlify.toml", "added"]]
export async function syncHostingHeaders(rootDir, file, downloadName) {
  const source = `/${file}.pdf`;
  const value = `inline; filename="${downloadName}"`;
  const changes = [
    ["vercel.json", await syncVercelHeader(rootDir, source, value)],
    ["netlify.toml", await syncNetlifyHeader(rootDir, source, value)],
  ];
  return changes.filter(([, change]) => change);
}
