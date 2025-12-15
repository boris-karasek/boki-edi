import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { productsLoader } from './util/productsLoader.js';

import Products from './pages/Products.jsx';
import Home from './pages/Home.jsx';
import Contact from './pages/Contact.jsx';
import ErrorPage from './pages/Error.jsx';

import favicon from './assets/favicon.ico';
import RootLayout from './pages/RootLayout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage/>,
    loader: productsLoader,
    id: "root",
    children: [
      { index: true, element: <Home /> },
      { path: "/products", element: <Products /> },
      { path: "/contact", element: <Contact /> },
    ],
  },
]);


function App() {
  
  // Add favicon 
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = favicon;
    document.head.appendChild(link);
  }, []);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;