import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section id="pocetna" className="scroll-mt-20 w-full px-6 pt-10 pb-8 text-center animate-fade">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title with decorative underline (drawn with ::after) */}
        <h1 className="relative text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-900 to-stone-900 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-5 after:w-40 after:h-2 after:rounded-full after:bg-gradient-to-r after:from-teal-400 after:to-cyan-900">
          Proizvođač metalnih delova za kalendare, fascikle i klik-ramove — Dobanovci, od 2007.
        </h1>

        <p className="text-lg md:text-xl text-stone-700 leading-relaxed">
          U našoj radionici u Dobanovcima izrađujemo sitnu metalnu galanteriju za štamparije,
          proizvođače fascikli, registratora, rokovnika i ramova, kao i za veleprodaje kancelarijskog
          materijala.
        </p>

        {/* Call-to-Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/#proizvodi"
            className="inline-block px-8 py-4 border-2 border-cyan-900 text-cyan-900 font-semibold text-lg rounded-lg hover:bg-cyan-900 hover:text-stone-100 transition-colors"
          >
            Pogledajte proizvode
          </Link>
          <Link
            to="/#kontakt"
            className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-900 text-stone-200 font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            Pošaljite upit
          </Link>
        </div>
      </div>
    </section>
  );
}
