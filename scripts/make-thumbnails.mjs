// Creates the 4:3 card images shown in the product grid (src/assets/thumbs/<photo>.webp, 640×480)
// from the product photos in src/assets/. The originals are not changed; the photo viewer uses them.
//
// Run after adding or replacing a product photo:  npm run thumbnails
// Then commit the new/changed files in src/assets/thumbs/.
//
// How each photo is framed (rotated or cropped) is set in FRAMING in scripts/lib/framing.mjs; the PDF
// catalogue uses the same framing. Photos are only scaled down, never up.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FRAMING, frame43 } from "./lib/framing.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(rootDir, "src/assets");
const thumbsDir = path.join(assetsDir, "thumbs");

const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 480;

async function makeThumbnail(file) {
  const { image, width } = await frame43(path.join(assetsDir, file), file);
  if (width < THUMB_WIDTH) {
    console.warn(`  ! ${file}: window ${width}px is smaller than ${THUMB_WIDTH}px (would be upscaled) — lower its zoom`);
  }

  const output = path.join(thumbsDir, file);
  await image
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(output);

  const { size } = await fs.stat(output);
  const note = FRAMING[file] ? "" : "  (no FRAMING entry — default crop, please check)";
  console.log(`  ${file.padEnd(40)} ${String(Math.round(size / 1024)).padStart(3)} KB${note}`);
}

await fs.mkdir(thumbsDir, { recursive: true });
const photos = (await fs.readdir(assetsDir)).filter((file) => file.endsWith(".webp")).sort();
console.log(`Card images -> ${path.relative(rootDir, thumbsDir)}/`);
for (const file of photos) {
  await makeThumbnail(file);
}
