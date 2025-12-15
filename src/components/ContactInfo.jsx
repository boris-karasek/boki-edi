import { MdLocationOn, MdEmail, MdPhone } from "react-icons/md";

export default function ContactInfo() {
  return (
    <div
      className="flex flex-col bg-white gap-4 p-6 rounded-xl shadow-lg border border-gray-200"
    >
      <div className="flex items-center gap-4">
        <div className="text-cyan-500 text-3xl">
          <MdLocationOn />
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-medium text-gray-800">Adresa:</p>
          <p className="text-gray-600">
            Janka Čmelika 13, Dobanovci 11272 Beograd
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-cyan-500 text-3xl">
          <MdPhone />
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-medium text-gray-800">Telefon:</p>
          <p className="text-gray-600">+381 60 3331408</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-cyan-500 text-3xl">
          <MdEmail />
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-medium text-gray-800">Email:</p>
          <p className="text-gray-600">bokiedi@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
