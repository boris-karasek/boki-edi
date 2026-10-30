import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Scrolls after every in-app navigation: to the element named in the URL hash
// (e.g. "/#proizvodi", "/?proizvod=Brzovez#kontakt"), or to the top of the page.
// Smooth scrolling comes from `scroll-behavior: smooth` in index.css.
export default function useScrollOnNavigate() {
  const { key, hash } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On the initial page load the browser handles scrolling (including #anchors) itself.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // History entries not created by the router (the photo lightbox adds one) have the key
    // "default"; going back/forward to them must not move the page.
    if (key === "default") return;

    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    // Every navigation gets a new key, so clicking the same menu link twice scrolls again.
  }, [key]);
}
