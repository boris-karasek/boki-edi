import { useEffect, useRef, useState } from "react";
import { MdLocationOn } from "react-icons/md";

import { company } from "../data/company.js";

// Google Maps search link for the workshop (opens the Maps app on phones).
export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${company.name}, ${company.streetAddress}, ${company.locality}`
)}`;

// Embedded Google Map that is inserted only when it comes within ~400 px of the screen.
// (loading="lazy" alone is not enough: Chrome starts loading lazy iframes thousands of pixels early.)
// Until then — and without JavaScript — a link to Google Maps is shown in its place.
export default function LazyMap({ src, title, className }) {
  const containerRef = useRef(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (isNear) return;
    if (!("IntersectionObserver" in window)) {
      setIsNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isNear]);

  return (
    <div ref={containerRef} className={className}>
      {isNear ? (
        <iframe
          src={src}
          title={title}
          className="w-full h-full rounded-xl shadow-lg border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl bg-stone-200 text-cyan-800 hover:underline"
        >
          <MdLocationOn className="text-4xl" aria-hidden="true" />
          Otvori lokaciju u Google mapama
        </a>
      )}
    </div>
  );
}
