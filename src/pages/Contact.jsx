import ContactInfo from "../components/ContactInfo.jsx";
import ContactForm from "../components/ContactForm.jsx";

export default function Contact() {
  return (
    <div className="mx-auto animate-fade">
      <div className="relative flex flex-col lg:flex-row mx-auto w-full max-w-10xl px-6 lg:px-16 py-8 rounded-xl shadow-lg gap-4 bg-gradient-to-r from-teal-700 via-teal-500 to-transparent">
        {/* Google Map Section */}
        <div className="bg-white bg-opacity-90 text-gray-800 p-4 rounded-2xl shadow-md w-full lg:w-2/4 flex justify-center items-center">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1414.622236366627!2d20.21098403829024!3d44.83695443174353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475a42c6c4a2cf2b%3A0x1759ed6e28dbd829!2sBoki-EDI!5e0!3m2!1sen!2srs!4v1727441142941!5m2!1sen!2srs"
            title="Location Map"
            className="w-full h-[400px] md:h-[450px] lg:h-[450px] rounded-xl shadow-lg border-0 transition-transform transform"
            allowFullScreen
          />
        </div>

        {/* Contact Info Section */}
        <div className="bg-white bg-opacity-90 text-gray-800 p-4 rounded-2xl shadow-md w-full lg:w-1/4 flex justify-center items-center">
          <ContactInfo />
        </div>

        {/* Contact Form Section */}
        <div className="bg-white bg-opacity-90 text-gray-800 p-4 rounded-2xl shadow-md w-full lg:w-1/4 flex justify-center items-center">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
