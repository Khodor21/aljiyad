/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ─── Add these to your tailwind.config.ts ────────────────────────────────────
      // Inside theme.extend:

      colors: {
        primary: {
          DEFAULT: "#1f3c4e",
          light: "#2a5066",
          dark: "#152b38",
        },
        gold: {
          DEFAULT: "#9c6114",
          light: "#c47d1a",
          dark: "#7a4c10",
        },
      },

      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 4px rgba(156,97,20,0.12)" },
          "50%": { boxShadow: "0 0 0 8px rgba(156,97,20,0.04)" },
        },
        "ping-soft": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },

      animation: {
        "fade-in-up": "fade-in-up 0.3s ease forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "ping-soft": "ping-soft 1.4s ease-in-out infinite",
      },
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
