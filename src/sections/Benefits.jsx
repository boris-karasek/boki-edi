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

export default function Benefits() {
  return (
    <section id="prednosti" aria-labelledby="prednosti-naslov" className="scroll-mt-20 w-full px-6 py-8">
      {/* Section title for screen readers and search engines only; the benefits speak for themselves visually */}
      <h2 id="prednosti-naslov" className="sr-only">
        Prednosti
      </h2>
      <div className="bg-gradient-to-l from-teal-900 via-teal-800 to-stone-900 rounded-3xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
        <ul className="grid gap-6 sm:grid-cols-2 text-left">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex gap-3">
              <MdCheckCircle className="shrink-0 mt-1 text-2xl text-teal-300" aria-hidden="true" />
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-stone-50">{benefit.title}</h3>
                <p className="mt-1 text-stone-300">{benefit.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
