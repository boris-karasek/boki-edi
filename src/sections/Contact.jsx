import ContactInfo from "../components/ContactInfo.jsx";
import ContactForm from "../components/ContactForm.jsx";
import LazyMap from "../components/LazyMap.jsx";

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1414.622236366627!2d20.21098403829024!3d44.83695443174353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475a42c6c4a2cf2b%3A0x1759ed6e28dbd829!2sBoki-EDI!5e0!3m2!1sen!2srs!4v1727441142941!5m2!1sen!2srs";

export default function Contact() {
  return (
    <section id="kontakt" className="scroll-mt-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-center font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900 text-4xl leading-tight">
        Kontakt
      </h2>

      {/* Contact details, form and map: side by side on desktop, stacked in this order on mobile */}
      <div className="mt-5 flex flex-col lg:flex-row gap-4 rounded-3xl p-3 sm:p-5 shadow-lg bg-gradient-to-r from-teal-700 via-teal-500 to-transparent">
        {/* Contact Info Section */}
        <div className="bg-white bg-opacity-90 text-gray-800 p-3 rounded-2xl shadow-md w-full lg:w-[28%] flex justify-center items-center">
          <ContactInfo />
        </div>

        {/* Contact Form Section */}
        <div className="bg-white bg-opacity-90 text-gray-800 p-3 rounded-2xl shadow-md w-full lg:w-[34%] flex justify-center items-center">
          <ContactForm />
        </div>

        {/* Google Map Section (loaded only when the section is close to the screen) */}
        <div className="bg-white bg-opacity-90 text-gray-800 p-3 rounded-2xl shadow-md w-full lg:flex-1 flex">
          <LazyMap
            src={MAP_URL}
            title="Mapa: lokacija radionice Boki-Edi u Dobanovcima"
            className="w-full h-[350px] lg:h-auto lg:min-h-[400px]"
          />
        </div>
      </div>
    </section>
  );
}
