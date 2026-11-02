// Takes screenshots of the built site with headless Chrome, for the design brief (docs/design-brief.md).
// Uses the installed Google Chrome through the DevTools protocol (scripts/lib/chrome.mjs); no extra npm packages.
//
// Usage: npm run build, then npm run screenshots
//        (first screens and full pages -> docs/screenshots/)
//
// The script starts its own preview server (scripts/preview.mjs) on port 4179, so `npm run preview`
// can keep running. Set CHROME=/path/to/chrome if Chrome is not at /usr/bin/google-chrome.
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connect, launchChrome } from "./lib/chrome.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "docs", "screenshots");
const port = 4179;
const baseUrl = `http://localhost:${port}`;

const desktop = (width, height) => ({ width, height, mobile: false });
const phone = (width, height) => ({ width, height, mobile: true });

const shots = [
  { file: "first-screen-1920x1080.png", viewport: desktop(1920, 1080) },
  { file: "first-screen-1366x768.png", viewport: desktop(1366, 768) },
  { file: "first-screen-390x844.png", viewport: phone(390, 844) },
  { file: "full-page-1366x768.jpg", viewport: desktop(1366, 768), fullPage: true },
  { file: "full-page-390x844.jpg", viewport: phone(390, 844), fullPage: true },
];

async function startPreview() {
  const server = spawn(process.execPath, [path.join(rootDir, "scripts", "preview.mjs")], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => String(chunk).includes("Preview:") && resolve());
    server.on("exit", (code) => reject(new Error(`Preview server exited (${code})`)));
  });
  return server;
}

// --- Page preparation (runs in the page) ------------------------------------------------------

// Scrolls through the whole page so lazy images and the map load, waits for them,
// then returns to the top. The hero fades in during the first second.
const preparePage = async () => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await document.fonts.ready;
  const step = Math.round(window.innerHeight * 0.75);
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: "instant" });
    await wait(150);
  }
  const pending = [...document.images].filter((img) => !img.complete);
  await Promise.all(
    pending.map(
      (img) =>
        new Promise((resolve) => {
          img.addEventListener("load", resolve);
          img.addEventListener("error", resolve);
        })
    )
  );
  await wait(2000); // map iframe
  window.scrollTo({ top: 0, behavior: "instant" });
  await wait(1200);
  return document.documentElement.scrollHeight;
};

async function takeShot(cdp, shot) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);

  const { width, height, mobile } = shot.viewport;
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true });

  const loaded = cdp.once("Page.loadEventFired", sessionId);
  await send("Page.navigate", { url: `${baseUrl}/` });
  await loaded;

  const { result } = await send("Runtime.evaluate", {
    expression: `(${preparePage})()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const pageHeight = result.value;

  // Full pages as JPEG: as PNG they are over 1.5 MB.
  const { data } = await send("Page.captureScreenshot", {
    ...(shot.file.endsWith(".jpg") ? { format: "jpeg", quality: 90 } : { format: "png" }),
    ...(shot.fullPage
      ? { captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: pageHeight, scale: 1 } }
      : {}),
  });
  const file = path.join(outDir, shot.file);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(data, "base64"));
  await cdp.send("Target.closeTarget", { targetId });

  console.log(`${shot.file}  (${width}×${shot.fullPage ? pageHeight : height})`);
}

const server = await startPreview();
const chrome = await launchChrome();
try {
  const cdp = await connect(chrome.wsUrl);
  for (const shot of shots) await takeShot(cdp, shot);
  cdp.close();
} finally {
  server.kill();
  await chrome.close();
}
