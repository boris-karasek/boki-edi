import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

import "../index.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function RootLayout() {
  return (
    <div className="background-div">
      {/* Meta data */}
      <Helmet>
        <title>Boki-Edi - radionica za izradu sitne metalne galanterije</title>
        <meta
          name="description"
          content="Radionica za izradu sitne metalne galanterije. Istrazite nase proizvode vec danas!"
        />
        <meta
          name="keywords"
          content="setajuca mehanika, metal, sitna metalna galanterija, ats mehanizam, brzovez, iglice, standardna iglica, zakacka, zakacka za klik klak, lajsna, lajsna za kalendare, metalni zavrseci, zavrsetak, otvarac, ugao za 25, ugao za 32, radionica, radionica za metal, dobanovci"
        />
      </Helmet>

      {/* Navigation bar */}
      <NavBar />

      {/* Rendering page */}
      <main className="flex-grow flex items-center justify-center w-full pt-20 mt-5">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
