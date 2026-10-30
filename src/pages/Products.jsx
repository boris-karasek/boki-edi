import Product from "../components/Product";
import { productGroups, productNote } from "../data/products.js";

export default function Products() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade">
      <h1 className="text-center font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900 text-5xl sm:text-7xl leading-tight">
        Proizvodi
      </h1>
      <p className="mt-4 text-center text-lg font-medium text-stone-700">{productNote}</p>

      <div className="mt-8 space-y-12 rounded-3xl py-8 px-4 sm:px-8 bg-gradient-to-r from-stone-800 via-cyan-700 to-transparent">
        {productGroups.map((group) => (
          <section key={group.id} aria-labelledby={`grupa-${group.id}`}>
            <h2
              id={`grupa-${group.id}`}
              className="text-2xl sm:text-3xl font-bold text-stone-50 drop-shadow"
            >
              {group.title}
            </h2>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.products.map((product) => (
                <li key={product.name}>
                  <Product product={product} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
