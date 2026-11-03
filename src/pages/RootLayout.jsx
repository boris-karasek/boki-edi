import { Outlet } from "react-router-dom";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import usePageMeta from "../hooks/usePageMeta.js";
import useScrollOnNavigate from "../hooks/useScrollOnNavigate.js";
import useRevealOnScroll from "../hooks/useRevealOnScroll.js";

export default function RootLayout() {
  usePageMeta();
  useScrollOnNavigate();
  useRevealOnScroll();

  return (
    <div className="background-div">
      {/* Navigation bar */}
      <NavBar />

      {/* Rendering page */}
      <main className="flex-grow flex flex-col items-center w-full pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
