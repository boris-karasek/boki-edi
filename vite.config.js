import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  plugins: [react()],
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
