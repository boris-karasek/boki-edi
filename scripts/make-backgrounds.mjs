// Makes the four background files used by .page-bg-image (src/index.css) from an AI-generated image.
//
// Usage: npm run backgrounds -- <desktop image> [<mobile image>]
//   desktop image: wide, ideally 21:9 and at least 3840 px wide (it is cropped to 8:3)
//   mobile image:  tall, 9:16, at least 900×1600; without it the mobile files are cut from the
//                  middle of the desktop image
// Output: public/backgrounds/top-desktop.webp (+@2x) and top-mobile.webp (+@2x), each under 200 KB.
// Then switch the image on in src/pages/RootLayout.jsx (see docs/design-brief.md).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "public", "backgrounds");
const MAX_BYTES = 200 * 1024;

const [desktopSource, mobileSource = desktopSource] = process.argv.slice(2);
if (!desktopSource) {
  console.error("Usage: npm run backgrounds -- <desktop image> [<mobile image>]");
  process.exit(1);
}

const targets = [
  { file: "top-desktop.webp", width: 1920, height: 720, source: desktopSource },
  { file: "top-desktop@2x.webp", width: 3840, height: 1440, source: desktopSource },
  { file: "top-mobile.webp", width: 450, height: 800, source: mobileSource },
  { file: "top-mobile@2x.webp", width: 900, height: 1600, source: mobileSource },
];

await fs.mkdir(outDir, { recursive: true });
for (const { file, width, height, source } of targets) {
  const meta = await sharp(source).metadata();
  const resized = sharp(source).rotate().resize(width, height, { fit: "cover", position: "centre" });

  // Lower the quality step by step (82 down to 40) until the file fits the size budget.
  const encode = (q) => resized.clone().webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer();
  let quality = 82;
  let output = await encode(quality);
  while (output.length > MAX_BYTES && quality > 40) {
    quality -= 6;
    output = await encode(quality);
  }
  await fs.writeFile(path.join(outDir, file), output);

  const notes = [];
  if (output.length > MAX_BYTES) notes.push("still over 200 KB: use a calmer image");
  if (meta.width < width || meta.height < height) notes.push(`source is only ${meta.width}×${meta.height}: upscaled`);
  console.log(
    `${file.padEnd(20)} ${width}×${height}  ${Math.round(output.length / 1024)} KB  q${quality}` +
      (notes.length ? `  (${notes.join("; ")})` : "")
  );
}
