/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/index.css",
    "./src/components/NavBar.jsx",
    "./src/pages/Products.jsx",
    "./src/pages/Home.jsx",
    "./src/pages/Contact.jsx",
    "./src/pages/RootLayout.jsx",
    "./src/pages/Error.jsx",
    "./src/components/Product.jsx",
    "./src/components/ContactInfo.jsx",
    "./src/components/ContactForm.jsx",
    "./src/components/Footer.jsx"
  ],
  theme: {
    extend: {
      animation: {
        fade: 'fadeIn 1s ease-in-out',
        'slide-down': 'slideDown 1s ease-out',
        'slide-up': 'slideUp 1s ease-in',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideDown: {
          from: {
            opacity: 0,
            transform: 'translateY(-50%)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        slideUp: {
          from: {
            opacity: 1,
            transform: 'translateY(0)',
          },
          to: {
            opacity: 0,
            transform: 'translateY(-50%)',
          },
        },
      },
    },
  },
  plugins: [],
}
