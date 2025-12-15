import { useRouteLoaderData } from 'react-router-dom';
import Product from '../components/Product';

export default function Products() {
  const { products } = useRouteLoaderData("root");
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-r from-stone-800 via-cyan-700 to-transparent animate-fade">
      <div className="flex justify-center mb-6">
        <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900 text-6xl sm:text-7xl leading-tight shadow-md">
          PROIZVODI
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {products.map((product, index) => (
          <div
            key={index}
            className="group relative bg-dark-900 rounded-lg overflow-hidden shadow-md transition-transform duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <Product name={product.name} src={product.src} />
          </div>
        ))}
      </div>
    </div>
  );
}