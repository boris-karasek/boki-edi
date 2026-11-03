import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Returns the id of the section currently in the middle of the screen (for highlighting the menu),
// or null when none of the sections are on the page (e.g. the 404 page).
export default function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(null);
  const { pathname } = useLocation();
  const idsKey = sectionIds.join(",");

  useEffect(() => {
    const sections = idsKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (sections.length === 0) {
      setActiveId(null);
      return;
    }

    // A thin band across the screen, 40–45% from the top: the section crossing it is "active".
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [idsKey, pathname]);

  return activeId;
}
