/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bf-dark": "#001f13",
        "bf-card": "#002d1c",
        "bf-border": "#003d26",
        "bf-yellow": "#fcd116",
        "bf-green": "#34d399",
      },
    },
  },
  plugins: [],
};
