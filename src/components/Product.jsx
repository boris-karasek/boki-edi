import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { MdBuild } from "react-icons/md";

// Intrinsic size of the product photos (portrait 3:4); lets the browser reserve space before they load.
const PHOTO_WIDTH = 1435;
const PHOTO_HEIGHT = 1920;

export default function Product({ product }) {
  const { name, description, image, alt, isService } = product;
  const [isFullscreen, setIsFullscreen] = useState(false);

  function openFullscreen() {
    setIsFullscreen(true);
    window.history.pushState({ fullscreen: true }, ""); // Lets the Back button close the photo
  }

  function closeFullscreen() {
    setIsFullscreen(false);
    if (window.history.state?.fullscreen) {
      window.history.back(); // Remove the history entry added when opening
    }
  }

  useEffect(() => {
    if (!isFullscreen) return;

    const handlePopState = () => setIsFullscreen(false);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeFullscreen();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <article className="group flex flex-col h-full bg-stone-900 border-2 border-stone-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all ease-in-out duration-300">
      {/* Product Image (click to enlarge) */}
      {image ? (
        <button
          type="button"
          className="relative w-full h-52 overflow-hidden cursor-zoom-in"
          onClick={openFullscreen}
          aria-label={`Uvećaj fotografiju: ${name}`}
        >
          <img
            className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300"
            src={image}
            alt={alt}
            width={PHOTO_WIDTH}
            height={PHOTO_HEIGHT}
            loading="lazy"
            decoding="async"
          />
        </button>
      ) : (
        <div className="w-full h-52 flex items-center justify-center bg-gradient-to-br from-teal-800 to-stone-900">
          <MdBuild className="text-6xl text-teal-300" aria-hidden="true" />
          {isService && <span className="sr-only">Usluga</span>}
        </div>
      )}

      {/* Product Name, description and inquiry button */}
      <div className="flex flex-col flex-grow p-4 text-white">
        <h4 className="text-lg font-semibold leading-snug">{name}</h4>
        {description && <p className="mt-2 text-sm text-stone-300 leading-relaxed">{description}</p>}
        <div className="mt-auto pt-4">
          <Link
            to={`/?proizvod=${encodeURIComponent(name)}#kontakt`}
            aria-label={`Pošaljite upit za: ${name}`}
            className="inline-block px-4 py-2 text-sm font-medium rounded-md bg-cyan-700 text-white hover:bg-stone-300 hover:text-black transition-colors"
          >
            Pošaljite upit
          </Link>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-zoom-out"
            onClick={closeFullscreen}
            role="dialog"
            aria-modal="true"
            aria-label={name}
          >
            <div className="relative w-full max-w-5xl max-h-[90%] flex justify-center items-center">
              {/* Set max-width and max-height for different screen sizes */}
              <img
                className="max-w-[90%] max-h-[80vh] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[60%] object-contain rounded-lg"
                src={image}
                alt={alt}
              />
              <p className="absolute bottom-10 text-center text-white text-xl sm:text-2xl font-semibold bg-black bg-opacity-50 p-2 rounded-lg">
                {name}
              </p>
            </div>
            <button
              type="button"
              className="absolute top-4 right-4 px-3 py-1 text-3xl text-white rounded-md hover:bg-stone-700"
              onClick={(event) => {
                event.stopPropagation(); // The backdrop click handler would close (and go back) a second time
                closeFullscreen();
              }}
              aria-label="Zatvori"
            >
              ✕
            </button>
          </div>,
          document.getElementById("modal")
        )}
    </article>
  );
}
