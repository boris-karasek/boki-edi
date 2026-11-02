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
export const FRAMING = {
  "Brzovez.webp": { rotate: -90 },
  // Close-up of the strip mounted on a calendar: not rotated (the calendar print would be sideways);
  // the strip runs diagonally and is cut by the frame on purpose.
  "Lajsna za kalendare.webp": { centerY: 0.5 },
  "Lajsna za kalendare veca.webp": {}, // wider shot of the mounted strip; not used yet
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

// Frames the photo at `input` (file name `file`, the key in FRAMING) as a 4:3 window at full
// resolution. Returns a sharp pipeline (resize and encode it) and the window size in pixels.
export async function frame43(input, file) {
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

  // Pass 2: crop the 4:3 window
  const { w, h } = window43(srcW, srcH, framing.zoom ?? 1);
  const left = clamp(Math.round((framing.centerX ?? 0.5) * srcW - w / 2), 0, srcW - w);
  const top = clamp(Math.round((framing.centerY ?? 0.5) * srcH - h / 2), 0, srcH - h);
  return { image: sharp(prepared).extract({ left, top, width: w, height: h }), width: w, height: h };
}
