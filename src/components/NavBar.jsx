import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Naslovna" },
  { to: "/products", label: "Proizvodi" },
  { to: "/contact", label: "Kontakt" },
];

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  // Link classes for Desktop screen
  const linkClassesDesktop = ({ isActive }) =>
    `px-4 py-2 text-xs md:text-base rounded-md hover:bg-stone-300 hover:text-black ${
      isActive ? "bg-stone-300 text-black" : "bg-cyan-700 text-white"
    }`;

  // Link classes for Mobile screen
  const linkClassesMobile = ({ isActive }) =>
    `py-2 w-full text-center text-white hover:bg-cyan-700 hover:text-stone-900 rounded-md transition duration-300 ease-in-out ${
      isActive ? "bg-cyan-700" : "bg-transparent"
    }`;

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
        <div className="hidden lg:flex lg:flex-row lg:space-x-4">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end className={linkClassesDesktop}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Navigation Links Mobile */}
      <div
        id="mobile-menu"
        className={`lg:hidden transition-all overflow-hidden duration-500 ease-in-out ${
          isMenuOpen ? "max-h-60 visible" : "max-h-0 invisible"
        } flex flex-col mt-2 space-y-2`}
      >
        {navLinks.map(({ to, label }) => (
          <NavLink key={to} to={to} end className={linkClassesMobile} onClick={closeMenu}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
