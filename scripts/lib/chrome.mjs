// Headless Chrome for the build scripts (screenshots, PDF catalogue): starts the installed Google Chrome
// and talks to it over the DevTools protocol, so no extra npm packages are needed.
// Set CHROME=/path/to/chrome if Chrome is not at /usr/bin/google-chrome.
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME ?? "/usr/bin/google-chrome";

// --- Minimal DevTools protocol client ---------------------------------------------------------

export function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let lastId = 0;
  const pending = new Map();
  const listeners = new Set();

  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`));
      else resolve(message.result);
    } else if (message.method) {
      for (const listener of listeners) listener(message);
    }
  });

  return new Promise((resolve, reject) => {
    ws.addEventListener("error", () => reject(new Error(`Cannot connect to ${wsUrl}`)));
    ws.addEventListener("open", () =>
      resolve({
        send(method, params = {}, sessionId) {
          const id = ++lastId;
          ws.send(JSON.stringify({ id, method, params, sessionId }));
          return new Promise((res, rej) => pending.set(id, { resolve: res, reject: rej }));
        },
        once(method, sessionId) {
          return new Promise((res) => {
            const listener = (message) => {
              if (message.method === method && message.sessionId === sessionId) {
                listeners.delete(listener);
                res(message.params);
              }
            };
            listeners.add(listener);
          });
        },
        close: () => ws.close(),
      })
    );
  });
}

export async function launchChrome() {
  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), "boki-edi-chrome-"));
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
  const wsUrl = await new Promise((resolve, reject) => {
    let output = "";
    chrome.stderr.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) resolve(match[1]);
    });
    chrome.on("error", reject);
    chrome.on("exit", (code) => reject(new Error(`Chrome exited (${code}):\n${output}`)));
  });
  return {
    wsUrl,
    async close() {
      chrome.kill();
      await new Promise((resolve) => chrome.once("exit", resolve));
      // Chrome helper processes may still be writing to the profile for a moment after exit.
      await fs.rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    },
  };
}
