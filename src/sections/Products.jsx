import { Link } from "react-router-dom";

import Product from "../components/Product";
import { productGroups, productNote } from "../data/products.js";

export default function Products() {
  return (
    <section id="proizvodi" className="scroll-mt-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-center font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900 text-4xl leading-tight">
        Proizvodi
      </h2>
      <p className="mt-2 text-center font-medium text-stone-700">{productNote}</p>

      {/* Shortcuts to the product groups */}
      <nav aria-label="Grupe proizvoda" className="mt-3 flex flex-wrap justify-center gap-2">
        {productGroups.map((group) => (
          <Link
            key={group.id}
            to={`/#${group.id}`}
            className="px-3 py-1 rounded-full text-sm font-medium bg-cyan-700 text-white hover:bg-stone-300 hover:text-black transition-colors"
          >
            {group.title}
          </Link>
        ))}
      </nav>

      <div className="mt-4 space-y-5 rounded-3xl p-3 sm:p-5 bg-gradient-to-r from-stone-800 via-cyan-700 to-transparent">
        {productGroups.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-naslov`} className="scroll-mt-20">
            <h3 id={`${group.id}-naslov`} className="text-lg sm:text-xl font-bold text-stone-50 drop-shadow">
              {group.title}
            </h3>
            <ul className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {group.products.map((product) => (
                <li key={product.name}>
                  <Product product={product} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
