// Server entry used only at build time by scripts/prerender.mjs to render each page to HTML.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

import App from "./App.jsx";

export { SITE_URL, pages, notFoundPage } from "./seo.js";

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
