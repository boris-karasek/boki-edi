import { Route, Routes } from "react-router-dom";

import RootLayout from "./pages/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// The site is a single page (sections in src/sections/); any other URL shows the 404 page.
// The old /products and /contact URLs are redirected in vercel.json.
export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
