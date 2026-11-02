import { MdCheckCircle } from "react-icons/md";

import { revealProps } from "../hooks/useRevealOnScroll.js";

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

export default function Benefits() {
  return (
    <section id="prednosti" aria-labelledby="prednosti-naslov" className="scroll-mt-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Section title for screen readers and search engines only (not shown on screen) */}
      <h2 id="prednosti-naslov" className="sr-only">
        Prednosti
      </h2>
      {/* One row on desktop, 2×2 on smaller screens */}
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 rounded-3xl p-4 sm:p-6 shadow-2xl bg-gradient-to-l from-teal-900 via-teal-800 to-stone-900">
        {benefits.map((benefit, index) => (
          <li key={benefit.title} {...revealProps(index)} className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-2 sm:gap-3">
            <MdCheckCircle className="shrink-0 sm:mt-0.5 text-2xl text-teal-300" aria-hidden="true" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-stone-50 leading-snug">{benefit.title}</h3>
              <p className="mt-1 text-xs sm:text-sm text-stone-300 leading-snug">{benefit.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
