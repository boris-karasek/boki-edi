import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

const container = document.getElementById("root");
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Production pages are pre-rendered (scripts/prerender.mjs), so React attaches to the existing HTML.
// In development the container is empty and the app is rendered from scratch.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
