/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bf-dark":   "#0a0f0d",
        "bf-card":   "#0d1a12",
        "bf-border": "#1a2e1f",
        "bf-gold":   "#fcd116",
        "bf-red":    "#e8112d",
        "bf-green":  "#004d31",
      }
    }
  },
  plugins: []
};
