/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          green:   "#004d31",
          dark:    "#0a0f0d",
          surface: "#0d1a12",
          border:  "#1a2e1f",
          gold:    "#fcd116",
          red:     "#e8112d",
        }
      }
    }
  },
  plugins: []
};
