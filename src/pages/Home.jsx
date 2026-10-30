import { Link } from "react-router-dom";
import { MdCheckCircle } from "react-icons/md";

const benefits = [
  {
    title: "Izrada po meri",
    text: "Delove izrađujemo po porudžbini, prema potrebama vašeg proizvoda.",
  },
  {
    title: "Male i velike serije",
    text: "Radimo i manje količine i veće serije.",
  },
  {
    title: "Montiranje lajsni na kalendare",
    text: "Osim izrade lajsni, montiramo ih i na vaše kalendare.",
  },
  {
    title: "Direktan kontakt sa proizvođačem",
    text: "Sve dogovarate direktno sa radionicom, bez posrednika.",
  },
];

export default function Home() {
  return (
    <div className="flex items-center justify-center w-full px-6 py-8 text-white animate-fade">
      <div className="text-center max-w-4xl space-y-12">
        {/* Title with decorative underline (drawn with ::after) */}
        <h1 className="relative text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-900 to-stone-900 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-5 after:w-40 after:h-2 after:rounded-full after:bg-gradient-to-r after:from-teal-400 after:to-cyan-900">
          Proizvođač metalnih delova za kalendare, fascikle i klik-ramove — Dobanovci, od 2007.
        </h1>

        {/* Content Card */}
        <div className="bg-gradient-to-l from-teal-900 via-teal-800 to-stone-900 rounded-3xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-stone-200 leading-relaxed">
            U našoj radionici u Dobanovcima izrađujemo sitnu metalnu galanteriju za štamparije,
            proizvođače fascikli, registratora, rokovnika i ramova, kao i za veleprodaje
            kancelarijskog materijala.
          </p>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2 text-left">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex gap-3">
                <MdCheckCircle className="shrink-0 mt-1 text-2xl text-teal-300" aria-hidden="true" />
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-stone-50">{benefit.title}</h2>
                  <p className="mt-1 text-stone-300">{benefit.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Call-to-Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-900 text-stone-200 font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            Kontaktirajte nas
          </Link>
          <Link
            to="/products"
            className="inline-block px-8 py-4 border-2 border-cyan-900 text-cyan-900 font-semibold text-lg rounded-lg hover:bg-cyan-900 hover:text-stone-100 transition-colors"
          >
            Pogledajte proizvode
          </Link>
        </div>
      </div>
    </div>
  );
}
