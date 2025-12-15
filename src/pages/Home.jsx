import { useNavigate } from "react-router-dom";

export default function Home({ handleClickContact }) {
  const navigate = useNavigate();

  function goToContact() {
    navigate("/contact");
  }

  return (
    <div className="relative flex items-center justify-center w-full px-6 text-white animate-fade overflow-hidden">
      {/* Large Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full blur-3xl opacity-30 top-10 left-10"></div>
        <div className="absolute w-72 h-72 bg-gradient-to-br from-blue-500 to-teal-700 rounded-full blur-3xl opacity-30 bottom-10 right-10"></div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 text-center max-w-4xl space-y-12">
        {/* Title with Decorative Accent */}
        <div className="relative">
          <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-teal-900 to-stone-900 md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md">
            Dobrodošli na našu stranicu!
          </h1>
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-3 w-40 h-2 bg-gradient-to-r from-teal-400 to-cyan-900 rounded-full"></div>
        </div>

        {/* Content Card */}
        <div className="relative bg-gradient-to-l from-transparent via-teal-800 to-stone-900 bg-opacity-10 rounded-3xl p-8 shadow-2xl max-w-xl mx-auto">
          <p className="text-xl text-stone-200 md:text-2xl leading-relaxed mb-6">
            Firma je nastala 2007. godine i od tada vršimo usluge proizvodnje
            razne sitne metalne galanterije, kao što su:
          </p>
          <ul className="mt-4 space-y-4 list-disc pl-8 text-left text-stone-200 md:text-lg">
            <li>Metalne lajsne za kalendare</li>
            <li>Uglovi za rokovnike</li>
            <li>Metalni držači za fascikle</li>
            <li>Usluge montiranja lajsni na kalendare</li>
            <li>Druga sitna metalna galanterija po porudžbini</li>
          </ul>
        </div>

        {/* Call-to-Action */}

        <button
          onClick={goToContact}
          className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-900 text-stone-200 font-semibold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
        >
          Kontaktirajte nas
        </button>
      </div>
    </div>
  );
}
