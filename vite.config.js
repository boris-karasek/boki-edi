import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Temporary: adds the background switcher from dev/ (?bg=1…4) to the page, in the dev server only
// (apply: "serve"), so it never reaches the production build. Remove with the dev/ folder once a
// background is chosen (see CHANGES.md).
const backgroundSwitcher = {
  name: "background-switcher",
  apply: "serve",
  transformIndexHtml: () => [
    { tag: "link", attrs: { rel: "stylesheet", href: "/dev/background-variants.css" }, injectTo: "head" },
    { tag: "script", attrs: { type: "module", src: "/dev/background-switcher.js" }, injectTo: "body" },
  ],
};

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  plugins: [react(), backgroundSwitcher],
  // Only variables with these prefixes are exposed to the browser via import.meta.env.
  // REACT_APP_ is kept so the existing Vercel variable REACT_APP_EMAILJS_PUBLIC_KEY keeps working.
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    host: true,
  },
  // The server bundle (dist-ssr/) is only used by scripts/prerender.mjs at build time;
  // the .mjs extension lets Node load it as an ES module.
  build: ssrBuild
    ? { rollupOptions: { output: { entryFileNames: "[name].mjs", chunkFileNames: "[name]-[hash].mjs" } } }
    : {},
}));
