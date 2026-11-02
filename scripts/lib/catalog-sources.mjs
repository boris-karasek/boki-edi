// Fingerprint of everything the PDF catalogue is made from: the data files, the product photos, the
// catalogue script, its styles and fonts. `npm run catalog` stores it in src/data/catalog.json;
// `npm run build` compares it and warns when the catalogue (public/katalog.pdf) may be out of date.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

// Folders are read without subfolders (src/assets/thumbs/ is not used by the catalogue)
const SOURCES = [
  "src/data/products.js",
  "src/data/company.js",
  "src/data/about.js",
  "src/seo.js",
  "src/assets/",
  "scripts/make-catalog.mjs",
  "scripts/catalog/",
  "scripts/catalog/fonts/",
  "scripts/lib/framing.mjs",
  "scripts/lib/pdf-info.mjs",
];

const TEXT_FILES = /\.(js|mjs|jsx|css|json|txt|html|md)$/;
// Files that macOS and Windows add to folders by themselves (not in git)
const SYSTEM_FILES = /^(\..*|Thumbs\.db|desktop\.ini)$/i;

export async function catalogSourceHash(rootDir) {
  const files = [];
  for (const source of SOURCES) {
    if (source.endsWith("/")) {
      const entries = await fs.readdir(path.join(rootDir, source), { withFileTypes: true });
      files.push(
        ...entries
          .filter((entry) => entry.isFile() && !SYSTEM_FILES.test(entry.name))
          .map((entry) => source + entry.name)
      );
    } else {
      files.push(source);
    }
  }

  const hash = crypto.createHash("sha256");
  for (const file of files.sort()) {
    let content = await fs.readFile(path.join(rootDir, file));
    // Same fingerprint with Windows line endings (git may check text files out with CRLF)
    if (TEXT_FILES.test(file)) content = Buffer.from(content.toString("utf8").replace(/\r\n/g, "\n"));
    hash.update(`${file}\0${content.length}\0`);
    hash.update(content);
  }
  return hash.digest("hex").slice(0, 16);
}
