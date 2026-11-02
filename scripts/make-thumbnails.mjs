// Creates the 4:3 card images shown in the product grid (src/assets/thumbs/<photo>.webp, 640×480)
// from the product photos in src/assets/. The originals are not changed; the photo viewer uses them.
//
// Run after adding or replacing a product photo:  npm run thumbnails
// Then commit the new/changed files in src/assets/thumbs/.
//
// The photos are portrait (3:4) with the part in the middle. To fill a 4:3 card without visible
// edges, each photo is either rotated (long parts) or cropped to a 4:3 window around the part.
// Photos are only scaled down, never up.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(rootDir, "src/assets");
const thumbsDir = path.join(assetsDir, "thumbs");

const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 480;

// Framing per photo:
//   rotate: 90 | -90  turn the photo sideways (for long parts that run the full height of the photo)
//   zoom: number      4:3 window of (photo width / zoom); 1 = full width, 2 = half width (part looks bigger)
//   centerX/centerY   center of the window as a fraction of the (rotated) photo (default 0.5 = middle)
//   extend: px        add px of the photo's own edge on the left/right (3/4 of it on top/bottom) before
//                     cropping, for parts that run almost to the photo's edges (plain gray background)
// The cards zoom images to 1.05 on hover, which hides about 2.4 % on each side: keep at least ~20 px
// (of 640) of background around each part.
// Photos not listed get a full-width 4:3 window from the middle; check the result and add an entry if
// the part is cut off or too small.
const FRAMING = {
  "Brzovez.webp": { rotate: -90 },
  "Lajsna za kalendare.webp": { rotate: 90, extend: 60 }, // the strip runs almost edge to edge
  "Setajuca mehanika.webp": { rotate: 90, zoom: 1.05, centerY: 0.53 }, // keeps most of an edge shadow out
  "Standardna iglica.webp": { rotate: 90, zoom: 1.05, centerY: 0.55 }, // keeps most of an edge shadow out
  "Metalni zavrseci sa gumicom.webp": { rotate: 90 },
  "Otvarac 1.webp": { zoom: 1, centerY: 0.53 },
  "Otvarac 2.webp": { zoom: 1, centerY: 0.53 },
  "Opruzni lim.webp": { zoom: 1.5, centerX: 0.48, centerY: 0.51 },
  "Ugao za 25.webp": { zoom: 1.45, centerX: 0.52, centerY: 0.46 },
  "Ugao za 32.webp": { zoom: 1.6, centerX: 0.49, centerY: 0.52 },
  "Zakacka za klik klak ramove.webp": { zoom: 1.8, centerX: 0.5, centerY: 0.52 },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Largest 4:3 window that fits into width×height, divided by zoom
function window43(width, height, zoom = 1) {
  let w = Math.min(width, Math.floor((height * 4) / 3));
  w = Math.round(w / zoom);
  return { w, h: Math.round((w * 3) / 4) };
}

async function makeThumbnail(file) {
  const input = path.join(assetsDir, file);
  const framing = FRAMING[file] ?? {};
  const { width, height } = await sharp(input).metadata();

  // Pass 1: rotate and extend (the crop in pass 2 applies to the result)
  let source = sharp(input);
  let srcW = width;
  let srcH = height;
  if (framing.rotate) {
    source = source.rotate(framing.rotate);
    [srcW, srcH] = [height, width];
  }
  if (framing.extend) {
    const x = framing.extend;
    const y = Math.round(framing.extend * 0.75);
    source = source.extend({ left: x, right: x, top: y, bottom: y, extendWith: "copy" });
    srcW += 2 * x;
    srcH += 2 * y;
  }
  const prepared = await source.png().toBuffer();

  const { w, h } = window43(srcW, srcH, framing.zoom ?? 1);
  const left = clamp(Math.round((framing.centerX ?? 0.5) * srcW - w / 2), 0, srcW - w);
  const top = clamp(Math.round((framing.centerY ?? 0.5) * srcH - h / 2), 0, srcH - h);

  if (w < THUMB_WIDTH) {
    console.warn(`  ! ${file}: window ${w}px is smaller than ${THUMB_WIDTH}px (would be upscaled) — lower its zoom`);
  }

  const output = path.join(thumbsDir, file);
  // Pass 2: crop the 4:3 window and scale it down
  await sharp(prepared)
    .extract({ left, top, width: w, height: h })
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
