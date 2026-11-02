import { Link } from "react-router-dom";

import { headline, intro } from "../data/about.js";

export default function Hero() {
  return (
    <section
      id="pocetna"
      className="scroll-mt-20 w-full px-6 pt-12 pb-6 md:pt-16 text-center"
    >
      <div className="max-w-3xl mx-auto">
        {/* Title with decorative underline (drawn with ::after) */}
        <h1 className="relative text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-900 to-stone-900 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-4 after:w-40 after:h-2 after:rounded-full after:bg-gradient-to-r after:from-teal-400 after:to-cyan-900">
          {headline}
        </h1>

        <p className="mt-10 text-lg md:text-xl text-stone-700 leading-relaxed">
          {intro.join(" ")}
        </p>

        {/* Call-to-Action */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/#proizvodi"
            className="inline-block px-8 py-3 border-2 border-cyan-900 text-cyan-900 font-semibold text-lg rounded-lg hover:bg-cyan-900 hover:text-stone-100 transition-colors"
          >
            Pogledajte proizvode
          </Link>
          <Link
            to="/#kontakt"
            className="inline-block px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-900 text-stone-100 font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            Pošaljite upit
          </Link>
        </div>
      </div>
    </section>
  );
}
