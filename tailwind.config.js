/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
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
