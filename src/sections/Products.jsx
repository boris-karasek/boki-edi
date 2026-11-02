import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Product from "../components/Product";
import { productGroups, productNote } from "../data/products.js";

// Product groups as tabs (WAI-ARIA tabs pattern). All groups are rendered — also in the pre-rendered
// HTML, for search engines — and stacked in one place; only the active one is visible (see "Product
// tabs" in src/index.css). Without JavaScript the tab row is hidden and all groups are listed.
export default function Products() {
  const [activeId, setActiveId] = useState(productGroups[0].id);
  const tabRefs = useRef({});
  const { hash, key } = useLocation();

  // Deep links: /#kalendari opens the "Kalendari" tab (the page scrolls to it via its id).
  // Runs after hydration, so the first render matches the pre-rendered HTML (first group open).
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1));
    if (productGroups.some((group) => group.id === id)) {
      setActiveId(id);
    }
  }, [hash, key]);

  // On narrow screens the tab row scrolls sideways: bring the active tab to the middle of the row.
  // Only the row scrolls (scrollTo on the row), never the page.
  useEffect(() => {
    const tab = tabRefs.current[activeId];
    const row = tab?.closest(".product-tabs");
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({
      left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeId]);

  // Arrow keys move between tabs (and wrap around), Home/End jump to the first/last tab.
  function handleTabKeyDown(event, index) {
    const last = productGroups.length - 1;
    const targets = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const target = productGroups[(targets[event.key] + productGroups.length) % productGroups.length];
    setActiveId(target.id);
    tabRefs.current[target.id]?.focus();
  }

  return (
    <section id="proizvodi" className="scroll-mt-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-center font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900 text-4xl leading-tight">
        Proizvodi
      </h2>

      {/* Tab row: one line; scrolls sideways on narrow screens */}
      <div className="product-tabs relative mt-4 overflow-x-auto">
        <div role="tablist" aria-label="Grupe proizvoda" className="flex w-max mx-auto gap-2 p-1.5">
          {productGroups.map((group, index) => {
            const isActive = group.id === activeId;
            return (
              <button
                key={group.id}
                ref={(element) => {
                  tabRefs.current[group.id] = element;
                }}
                type="button"
                role="tab"
                id={`tab-${group.id}`}
                aria-selected={isActive}
                aria-controls={group.id}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(group.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-900 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-stone-300 text-black shadow-inner"
                    : "bg-cyan-700 text-white hover:bg-stone-300 hover:text-black"
                }`}
              >
                {group.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="product-panels mt-3 rounded-3xl p-3 sm:p-5 bg-gradient-to-r from-stone-800 via-cyan-700 to-transparent">
        {productGroups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            role="tabpanel"
            aria-labelledby={`tab-${group.id}`}
            data-active={group.id === activeId}
            // Deep links scroll here; the margin keeps the header and the tab row visible
            className="product-panel scroll-mt-40"
          >
            <h3 className="product-panel-title text-lg sm:text-xl font-bold text-stone-50 drop-shadow mb-2">
              {group.title}
            </h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {group.products.map((product) => (
                <li key={product.name}>
                  <Product product={product} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-3 text-center font-medium text-stone-700">{productNote}</p>
    </section>
  );
}
