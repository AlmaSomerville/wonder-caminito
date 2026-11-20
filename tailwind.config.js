/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rock: "#2D3A3A",
        sand: "#F5F1E8",
        cream: "#FFFEFB",
        turquoise: "#3AA99E",
        terracotta: "#D96C3E",
        peach: "#FFE8D6",
      },
      fontFamily: {
        serif: ['"Bodoni Moda"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
