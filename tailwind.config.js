/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1F3C4E",
        "primary-light": "#2A5066",
        "primary-dark": "#152B38",
        gold: "#9C6114",
        "gold-light": "#C47D1A",
        "gold-dark": "#7A4C10",
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
