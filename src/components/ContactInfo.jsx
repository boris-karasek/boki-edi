import { MdLocationOn, MdEmail, MdPhone, MdPictureAsPdf } from "react-icons/md";

import { company } from "../data/company.js";
import catalog from "../data/catalog.json";

export default function ContactInfo() {
  return (
    <div className="flex flex-col bg-white gap-4 p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-700">Podaci za kontakt</h3>
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
      {/* PDF catalogue (made with `npm run catalog`) */}
      <div className="flex items-center gap-4">
        <div className="text-cyan-500 text-3xl" aria-hidden="true">
          <MdPictureAsPdf />
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-medium text-gray-800">Katalog proizvoda:</p>
          <a
            href={catalog.file}
            download={catalog.downloadName}
            type="application/pdf"
            className="text-gray-600 hover:text-cyan-700 hover:underline"
          >
            Preuzmite katalog <span className="whitespace-nowrap">({catalog.sizeLabel})</span>
          </a>
        </div>
      </div>
    </div>
  );
}
