import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import emailjs from "@emailjs/browser";

import { company } from "../data/company.js";

// EmailJS template variables: name, email, subject, message.
const EMAILJS_SERVICE_ID = "service_jj89tlg";
const EMAILJS_TEMPLATE_ID = "template_263y4a8";

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const inputClasses =
  "w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-cyan-400";

export default function ContactForm() {
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState(null); // null | { type: "sending" | "success" | "error", text }
  const [searchParams] = useSearchParams();
  const product = searchParams.get("proizvod");

  // "Pošaljite upit" on a product links to /?proizvod=<name>#kontakt; prefill the subject.
  // Done in an effect (after hydration) because the pre-rendered page has no query string.
  useEffect(() => {
    if (product) {
      setFormData((data) => ({ ...data, subject: `Upit: ${product}` }));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "sending", text: "Slanje poruke..." });

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData, {
        publicKey: import.meta.env.REACT_APP_EMAILJS_PUBLIC_KEY,
      });
      setStatus({ type: "success", text: "Poruka je uspešno poslata. Hvala!" });
      setFormData(emptyForm);
    } catch (err) {
      console.error("EmailJS error:", err);
      // Keep the typed message so the visitor can try again
      setStatus({
        type: "error",
        text: `Slanje nije uspelo. Pokušajte ponovo ili nas pozovite na ${company.phoneDisplay}.`,
      });
    }
  };

  const statusClasses = {
    sending: "text-gray-600",
    success: "text-green-700",
    error: "text-red-700",
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-700 text-center mb-4">Pošaljite upit</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label htmlFor="contact-name" className="sr-only">
          Ime i prezime
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Vaše ime"
          required
          className={inputClasses}
        />
        <label htmlFor="contact-email" className="sr-only">
          E-mail adresa
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Vaš e-mail"
          required
          className={inputClasses}
        />
        <label htmlFor="contact-subject" className="sr-only">
          Tema poruke
        </label>
        <input
          id="contact-subject"
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Tema poruke"
          required
          className={inputClasses}
        />
        <label htmlFor="contact-message" className="sr-only">
          Poruka
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Vaša poruka"
          rows="5"
          required
          className={inputClasses}
        />
        <button
          type="submit"
          disabled={status?.type === "sending"}
          className="w-full py-2 text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring focus:ring-cyan-300 disabled:opacity-60 disabled:cursor-wait"
        >
          Pošalji
        </button>
        <p role="status" className={`text-center mt-2 font-medium ${status ? statusClasses[status.type] : ""}`}>
          {status?.text}
        </p>
      </form>
    </div>
  );
}
