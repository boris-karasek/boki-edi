import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { SITE_URL, getPageMeta } from "../seo.js";

function upsertHeadElement(selector, tagName, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tagName);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

// Keeps <title>, description and canonical URL in sync when navigating inside the app.
// The initial values come from the pre-rendered HTML; this only matters after client-side navigation.
export default function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = meta.title;
    upsertHeadElement('meta[name="description"]', "meta", { name: "description", content: meta.description });
    if (meta.noindex) {
      document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      upsertHeadElement('link[rel="canonical"]', "link", { rel: "canonical", href: SITE_URL + pathname });
    }
  }, [pathname]);
}
