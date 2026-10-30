import { MdLocationOn, MdEmail, MdPhone } from "react-icons/md";

import { company } from "../data/company.js";

export default function ContactInfo() {
  return (
    <div className="flex flex-col bg-white gap-4 p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-700">Podaci za kontakt</h2>
      <address className="not-italic flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="text-cyan-500 text-3xl" aria-hidden="true">
            <MdLocationOn />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-medium text-gray-800">Adresa:</p>
            <p className="text-gray-600">
              {company.streetAddress}, {company.locality} {company.postalCode} {company.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-cyan-500 text-3xl" aria-hidden="true">
            <MdPhone />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-medium text-gray-800">Telefon:</p>
            <a href={`tel:${company.phone}`} className="text-gray-600 hover:text-cyan-700 hover:underline">
              {company.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-cyan-500 text-3xl" aria-hidden="true">
            <MdEmail />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-medium text-gray-800">E-mail:</p>
            <a href={`mailto:${company.email}`} className="text-gray-600 hover:text-cyan-700 hover:underline break-all">
              {company.email}
            </a>
          </div>
        </div>
      </address>
    </div>
  );
}
