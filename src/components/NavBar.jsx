import { useState } from "react";
import { Link } from "react-router-dom";

import useActiveSection from "../hooks/useActiveSection.js";

// Menu entries point to sections of the one-page site (see src/pages/Home.jsx).
// `sections` lists the section ids that highlight the entry while they are on screen.
const navLinks = [
  { to: "/", label: "Početna", sections: ["pocetna", "prednosti"] },
  { to: "/#proizvodi", label: "Proizvodi", sections: ["proizvodi"] },
  { to: "/#kontakt", label: "Kontakt", sections: ["kontakt"] },
];
const observedSections = navLinks.flatMap((link) => link.sections);

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeSection = useActiveSection(observedSections);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  // Link classes for Desktop screen
  const linkClassesDesktop = (isActive) =>
    `px-4 py-2 text-xs md:text-base rounded-md hover:bg-stone-300 hover:text-black ${
      isActive ? "bg-stone-300 text-black" : "bg-cyan-700 text-white"
    }`;

  // Link classes for Mobile screen
  const linkClassesMobile = (isActive) =>
    `py-2 w-full text-center text-white hover:bg-cyan-700 hover:text-stone-900 rounded-md transition duration-300 ease-in-out ${
      isActive ? "bg-cyan-700" : "bg-transparent"
    }`;

  function renderLinks(classes, onClick) {
    return navLinks.map(({ to, label, sections }) => {
      const isActive = sections.includes(activeSection);
      return (
        <Link
          key={to}
          to={to}
          className={classes(isActive)}
          aria-current={isActive ? "true" : undefined}
          onClick={onClick}
        >
          {label}
        </Link>
      );
    });
  }

  return (
    <nav
      aria-label="Glavni meni"
      className="fixed top-0 left-0 w-full z-50 bg-stone-900 opacity-90 px-4 py-2 lg:px-8 lg:py-4"
    >
      <div className="h-full w-full flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-3xl font-bold text-stone-50 tracking-wide hover:text-cyan-400 transition duration-300"
        >
          BOKI-EDI
        </Link>

        {/* Hamburger Button (mobile only) */}
        <button
          type="button"
          className="text-stone-100 text-3xl lg:hidden p-2 border-2 border-cyan-700 rounded-md hover:bg-cyan-700 hover:text-stone-900 transition-all duration-300 ease-in-out"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          ☰
        </button>

        {/* Navigation Links Desktop (shown/hidden with CSS so links are always in the HTML) */}
        <div className="hidden lg:flex lg:flex-row lg:space-x-4">{renderLinks(linkClassesDesktop)}</div>
      </div>

      {/* Navigation Links Mobile */}
      <div
        id="mobile-menu"
        className={`lg:hidden transition-all overflow-hidden duration-500 ease-in-out ${
          isMenuOpen ? "max-h-60 visible" : "max-h-0 invisible"
        } flex flex-col mt-2 space-y-2`}
      >
        {renderLinks(linkClassesMobile, closeMenu)}
      </div>
    </nav>
  );
}
