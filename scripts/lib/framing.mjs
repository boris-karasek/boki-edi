// How each product photo is framed as a 4:3 image: the card images on the site
// (scripts/make-thumbnails.mjs) and the photos in the PDF catalogue (scripts/make-catalog.mjs).
//
// The photos are portrait (3:4) with the part in the middle. To fill a 4:3 box without visible
// edges, each photo is either rotated (long parts) or cropped to a 4:3 window around the part.
import sharp from "sharp";

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
//
// The PDF catalogue frames tighter: after rotate/extend it finds the part on the gray background and
// crops so the part fills about 80 % of the box (frameForCatalog). Per photo, `catalog` can change that:
//   catalog: { fill: 0.75 }                   another share of the box for the part
//   catalog: { zoom, centerX, centerY }       a fixed window instead (same meaning as above)
//   catalog: false                            the same window as the site's card (no part to find)
export const FRAMING = {
  "Brzovez.webp": { rotate: -90 },
  // Close-up of the strip mounted on a calendar: not rotated (the calendar print would be sideways);
  // the strip runs diagonally and is cut by the frame on purpose.
  "Lajsna za kalendare.webp": { centerY: 0.5, catalog: false },
  "Lajsna za kalendare veca.webp": { catalog: false }, // wider shot of the mounted strip; not used yet
  // The strip alone on gray: product photo in the PDF catalogue (scripts/make-catalog.mjs)
  "Lajsna za kalendare do 1m duzine.webp": { rotate: 90, extend: 60 }, // the strip runs almost edge to edge
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

// Pass 1: rotate and extend the photo (the 4:3 crop applies to the result)
async function prepare(input, framing) {
  const { width, height } = await sharp(input).metadata();
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
  return { buffer: await source.png().toBuffer(), srcW, srcH };
}

// Pass 2: the 4:3 window given by zoom and center
function fixedWindow(srcW, srcH, { zoom, centerX, centerY }) {
  const { w, h } = window43(srcW, srcH, zoom ?? 1);
  const left = clamp(Math.round((centerX ?? 0.5) * srcW - w / 2), 0, srcW - w);
  const top = clamp(Math.round((centerY ?? 0.5) * srcH - h / 2), 0, srcH - h);
  return { left, top, width: w, height: h };
}

// Frames the photo at `input` (file name `file`, the key in FRAMING) as a 4:3 window at full
// resolution, like the site's card. Returns a sharp pipeline (resize and encode it) and the window size.
export async function frame43(input, file) {
  const framing = FRAMING[file] ?? {};
  const { buffer, srcW, srcH } = await prepare(input, framing);
  const window = fixedWindow(srcW, srcH, framing);
  return { image: sharp(buffer).extract(window), width: window.width, height: window.height };
}

// Bounding box of the part, in pixels of the prepared photo, or null if none is found. Works on a
// small copy: fine detail (the part's edges and highlights) stands out against a blurred copy, while
// the background's slow shading and soft out-of-focus shadows do not.
async function findPart(buffer, srcW, srcH) {
  const width = 400;
  const scale = srcW / width;
  const height = Math.round(srcH / scale);
  const gray = await sharp(buffer).resize(width, height, { fit: "fill" }).greyscale().raw().toBuffer();
  const blurred = await sharp(gray, { raw: { width, height, channels: 1 } }).blur(10).extractChannel(0).raw().toBuffer();
  const margin = 3; // the blur is less reliable right at the border
  const columns = new Uint16Array(width);
  const rows = new Uint16Array(height);
  for (let y = margin; y < height - margin; y++) {
    for (let x = margin; x < width - margin; x++) {
      if (Math.abs(gray[y * width + x] - blurred[y * width + x]) > 20) {
        columns[x]++;
        rows[y]++;
      }
    }
  }
  // A column or row belongs to the part if at least 2 of its pixels differ (ignores single specks)
  const first = (counts) => counts.findIndex((count) => count >= 2);
  const last = (counts) => counts.findLastIndex((count) => count >= 2);
  const [x0, x1, y0, y1] = [first(columns), last(columns), first(rows), last(rows)];
  if (x0 < 0 || y0 < 0) return null;
  return { left: x0 * scale, top: y0 * scale, width: (x1 - x0 + 1) * scale, height: (y1 - y0 + 1) * scale };
}

// Frames the photo for the PDF catalogue: like frame43, but the part fills about 80 % of the box
// (see `catalog` in FRAMING). Returns the pipeline, the window size and the share the part fills.
export async function frameForCatalog(input, file) {
  const framing = FRAMING[file] ?? {};
  const catalog = framing.catalog ?? {};
  const { buffer, srcW, srcH } = await prepare(input, framing);

  let window;
  let part = null;
  if (catalog === false) {
    window = fixedWindow(srcW, srcH, framing);
  } else if (catalog.zoom) {
    window = fixedWindow(srcW, srcH, catalog);
  } else {
    part = await findPart(buffer, srcW, srcH);
    if (!part) throw new Error(`${file}: no part found on the background; add catalog: { zoom, centerX, centerY } in FRAMING`);
    const fill = catalog.fill ?? 0.8;
    // Smallest 4:3 window with the part at `fill` of its width or height, within the photo
    let w = Math.max(part.width / fill, ((part.height / fill) * 4) / 3);
    w = Math.min(w, srcW, (srcH * 4) / 3);
    const h = (w * 3) / 4;
    const left = clamp(part.left + part.width / 2 - w / 2, 0, srcW - w);
    const top = clamp(part.top + part.height / 2 - h / 2, 0, srcH - h);
    window = { left: Math.round(left), top: Math.round(top), width: Math.floor(w), height: Math.floor(h) };
  }
  const filled = part ? Math.max(part.width / window.width, part.height / window.height) : null;
  return { image: sharp(buffer).extract(window), width: window.width, height: window.height, filled };
}
