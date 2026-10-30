import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-xl mx-4 my-auto px-6 py-12 rounded-3xl shadow-2xl bg-gray-900 text-gray-200 animate-fade">
      <p className="text-8xl md:text-9xl font-bold text-red-500" aria-hidden="true">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-semibold mt-4">Stranica nije pronađena</h1>
      <p className="text-lg mt-3 text-gray-300">
        Stranica koju tražite ne postoji ili je premeštena.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-cyan-600 text-white text-lg rounded hover:bg-cyan-800 transition"
      >
        Nazad na naslovnu
      </Link>
    </div>
  );
}
