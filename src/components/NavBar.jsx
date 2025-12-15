import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize(); // Check screen size initially
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Functions for Navigation bar buttons
  function goToHome() {
    navigate("/");
  }

  function goToProducts() {
    navigate("/products");
  }

  function goToContact() {
    navigate("/contact");
  }

  // Button classes for Desktop screen
  const buttonClassesDesktop =
    "px-4 py-2 text-xs md:text-base rounded-md bg-cyan-700 text-white hover:bg-stone-300 hover:text-black";

  // Button classes for Mobile screen
  const buttonClassesMobile =
    "bg-transparent py-2 w-full text-center text-white hover:bg-cyan-700 hover:text-stone-900 rounded-md transition duration-300 ease-in-out transform";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-stone-900 opacity-90 px-4 py-2 lg:px-8 lg:py-4">
      <div className="h-full w-full flex justify-between items-center">
        {/* Logo */}
        <span
          className="text-3xl font-bold text-stone-50 tracking-wide hover:text-cyan-400 transition duration-300 cursor-pointer"
          onClick={goToHome}
        >
          BOKI-EDI
        </span>

        {/* Hamburger Button (Always visible on mobile) */}
        <button
          className="text-stone-100 text-3xl lg:hidden p-2 border-2 border-cyan-700 rounded-md hover:bg-cyan-700 hover:text-stone-900 transition-all duration-300 ease-in-out"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          ☰
        </button>

        {/* Navigation Buttons Desktop */}
        {isLargeScreen && (
          <div className="flex-col lg:flex lg:flex-row lg:space-y-0 lg:space-x-4">
            <button className={buttonClassesDesktop} onClick={goToHome}>
              Naslovna
            </button>

            <button className={buttonClassesDesktop} onClick={goToProducts}>
              Proizvodi
            </button>

            <button className={buttonClassesDesktop} onClick={goToContact}>
              Kontakt
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons Mobile */}
      {!isLargeScreen && (
        <div
          className={`transition-all overflow-hidden duration-500 ease-in-out ${
            isMenuOpen ? "max-h-60" : "max-h-0"
          } flex flex-col mt-2 space-y-2`}
        >
          <button
            className={buttonClassesMobile}
            onClick={() => {
              goToHome();
              setIsMenuOpen(false);
            }}
          >
            Naslovna
          </button>
          <button
            className={buttonClassesMobile}
            onClick={() => {
              goToProducts();
              setIsMenuOpen(false);
            }}
          >
            Proizvodi
          </button>
          <button
            className={buttonClassesMobile}
            onClick={() => {
              goToContact();
              setIsMenuOpen(false);
            }}
          >
            Kontakt
          </button>
        </div>
      )}
    </nav>
  );
}
