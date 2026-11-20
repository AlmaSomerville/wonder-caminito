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
        peach: "#FFF1EB",
      },
      fontFamily: {
        // Plus Jakarta Sans: everything you read. Bodoni Moda: big headlines only (her brand voice).
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
