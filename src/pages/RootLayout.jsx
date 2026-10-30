import { Outlet } from "react-router-dom";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import usePageMeta from "../hooks/usePageMeta.js";

export default function RootLayout() {
  usePageMeta();

  return (
    <div className="background-div">
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
