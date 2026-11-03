export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4 mt-5">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          {/* The year is written into the HTML at build time and refreshed in the browser,
              so it stays current even if the site is not rebuilt after New Year. */}
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> BOKI-EDI. Sva prava
          zadržana.
        </p>
      </div>
    </footer>
  );
}
