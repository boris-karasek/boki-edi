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
    <article className="flex flex-col h-full bg-stone-900 border-2 border-stone-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Product Image (click to enlarge). Fixed 4:3 box; object-contain shows the whole part. */}
      {image ? (
        <button
          type="button"
          className="relative block w-full aspect-[4/3] overflow-hidden bg-[#c4c4c4] cursor-zoom-in"
          onClick={openFullscreen}
          aria-label={`Uvećaj fotografiju: ${name}`}
        >
          <img
            className="absolute inset-0 w-full h-full p-2 object-contain"
            src={image}
            alt={alt}
            width={PHOTO_WIDTH}
            height={PHOTO_HEIGHT}
            loading="lazy"
            decoding="async"
          />
        </button>
      ) : (
        <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-teal-800 to-stone-900">
          <MdBuild className="text-5xl text-teal-300" aria-hidden="true" />
          {isService && <span className="sr-only">Usluga</span>}
        </div>
      )}

      {/* Product Name, description and inquiry button */}
      <div className="flex flex-col flex-grow px-3 pt-2 pb-3 text-white">
        <h4 className="text-sm font-semibold leading-snug">{name}</h4>
        {/* Clamped to 2 lines; the full text is in the HTML and in the photo viewer */}
        {description && (
          <p className="mt-0.5 text-xs sm:text-sm text-stone-300 leading-snug line-clamp-2">{description}</p>
        )}
        <div className="mt-auto pt-2">
          <Link
            to={`/?proizvod=${encodeURIComponent(name)}#kontakt`}
            aria-label={`Pošaljite upit za: ${name}`}
            className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-cyan-700 text-white hover:bg-stone-300 hover:text-black transition-colors"
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
              <div className="absolute bottom-10 max-w-[90%] text-center bg-black bg-opacity-60 px-4 py-2 rounded-lg">
                <p className="text-white text-xl sm:text-2xl font-semibold">{name}</p>
                {description && <p className="mt-1 text-stone-200 text-sm sm:text-base">{description}</p>}
              </div>
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
