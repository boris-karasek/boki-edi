import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll reveal: elements marked with data-reveal fade in and move up slightly the first time they
// come into view (styles: "Scroll reveal" in src/index.css). Each element animates only once.
//
// The hidden starting state is switched on here, after the app has started ("reveal-ready" on <html>),
// and only for elements that are still below the screen at that moment. So nothing on the first
// screen is ever hidden, the pre-rendered HTML always shows everything (also without JavaScript),
// and hydration is not affected. With prefers-reduced-motion the CSS never hides anything.
export default function useRevealOnScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reveal = (element) => element.setAttribute("data-revealed", "");
    const elements = [...document.querySelectorAll("[data-reveal]:not([data-revealed])")];

    // Already on (or above) the screen: show without animation.
    const below = elements.filter((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        reveal(element);
        return false;
      }
      return true;
    });
    document.documentElement.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      below.forEach(reveal);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" } // start when the element is a little inside the screen
    );
    below.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
}

// Props for an element that should reveal on scroll; `index` staggers items in a row (60 ms apart).
export function revealProps(index = 0) {
  return index ? { "data-reveal": "", style: { "--reveal-delay": `${index * 60}ms` } } : { "data-reveal": "" };
}
