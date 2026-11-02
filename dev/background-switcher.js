// Temporary background switcher for comparing page backgrounds: open the site with ?bg=1…4
// (?bg=0 or no parameter = the current background, ?bg=img = the optional image from src/index.css).
// A small panel then appears in the bottom-left corner to switch without editing the URL.
//
// Loaded only by the dev server (plugin in vite.config.js) and by `npm run preview` (scripts/preview.mjs);
// it is not part of the production build. Delete the dev/ folder, the plugin and the preview injection
// once a background is chosen (see CHANGES.md).

const variants = [
  ["0", "Trenutna"],
  ["1", "Brušeni čelik"],
  ["2", "Čelično plava"],
  ["3", "Tehnički crtež"],
  ["4", "Svetla + traka"],
  ["img", "Slika"],
];

function apply(value) {
  const root = document.documentElement;
  if (value && value !== "0" && value !== "img") root.dataset.bg = value;
  else delete root.dataset.bg;

  // The image background is the production rule (.page-bg-image in src/index.css), switched on here
  // on the page wrapper. React never rewrites that element's class, so the change stays.
  const wrapper = document.querySelector(".background-div");
  if (wrapper) wrapper.classList.toggle("page-bg-image", value === "img");
  else if (value === "img") requestAnimationFrame(() => apply(value)); // dev: React has not rendered yet
}

function renderPanel(current) {
  const panel = document.createElement("div");
  panel.id = "bg-switcher";
  panel.style.cssText =
    "position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;flex-wrap:wrap;gap:4px;max-width:calc(100vw - 24px);" +
    "padding:6px;border-radius:8px;background:rgba(28,25,23,.85);font:12px/1.2 system-ui,sans-serif;color:#fff";

  const label = document.createElement("span");
  label.textContent = "Pozadina:";
  label.style.cssText = "align-self:center;padding:0 4px";
  panel.append(label);

  for (const [value, name] of variants) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = value === "img" ? name : `${value} ${name}`;
    button.dataset.value = value;
    button.style.cssText = "padding:4px 8px;border:0;border-radius:4px;cursor:pointer;color:inherit;background:#0e7490";
    button.addEventListener("click", () => select(value));
    panel.append(button);
  }
  document.body.append(panel);
  highlight(current);
}

function highlight(current) {
  for (const button of document.querySelectorAll("#bg-switcher button")) {
    const active = button.dataset.value === current;
    button.style.background = active ? "#d6d3d1" : "#0e7490";
    button.style.color = active ? "#000" : "#fff";
  }
}

function select(value) {
  const url = new URL(window.location.href);
  url.searchParams.set("bg", value);
  window.history.replaceState(window.history.state, "", url); // keeps React Router's history state
  apply(value);
  highlight(value);
}

const initial = new URLSearchParams(window.location.search).get("bg");
if (initial !== null) {
  apply(initial);
  renderPanel(initial);
}
