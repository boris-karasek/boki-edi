import Hero from "../sections/Hero.jsx";
import Benefits from "../sections/Benefits.jsx";
import Products from "../sections/Products.jsx";
import Contact from "../sections/Contact.jsx";

// The whole site is one scrolling page. Section ids (#pocetna, #prednosti, #proizvodi, #kontakt)
// are used by the menu, the buttons and the redirects of the old /products and /contact URLs.
export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <Products />
      <Contact />
    </>
  );
}
