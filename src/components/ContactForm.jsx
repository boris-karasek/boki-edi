import React, { useState } from "react";
import emailjs from "emailjs-com";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    emailjs
      .send("service_jj89tlg", "template_263y4a8", formData, PUBLIC_KEY)
      .then((response) => {
        console.log("SUCCESS!", response.status, response.text);
        setStatus("Poruka uspešno poslata!");
      })
      .catch((err) => {
        console.error("FAILED...", err);
        setStatus("Neuspelo slanje poruke. Molim Vas pokušajte ponovo.");
      });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setTimeout(() => {
      setStatus("");
    }, 10000);
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">
        Kontaktirajte nas!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Vaše Ime"
          required
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-cyan-400"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Vaš Email"
          required
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-cyan-400"
        />
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Tema poruke (Subject)"
          required
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-cyan-400"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Vaša poruka"
          rows="5"
          required
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-cyan-400"
        />
        <button
          type="submit"
          className="w-full py-2 text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring focus:ring-cyan-300"
        >
          Pošalji
        </button>
        {status && (
          <p className="text-center text-green-600 mt-2 font-medium">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
