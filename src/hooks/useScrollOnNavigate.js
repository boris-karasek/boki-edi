import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Client-side navigation keeps the previous scroll position by default. Scroll to the top of the new
// page, or to the element named in the URL hash (e.g. /contact?proizvod=...#upit scrolls to the form).
export default function useScrollOnNavigate() {
  const { pathname, search, hash } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On the initial page load the browser handles scrolling (including #anchors) itself.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, hash]);
}
