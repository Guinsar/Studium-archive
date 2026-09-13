/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--couleur-ink) / <alpha-value>)",
        parchment: "rgb(var(--couleur-parchment) / <alpha-value>)",
        wine: "rgb(var(--couleur-wine) / <alpha-value>)",
        charcoal: "rgb(var(--couleur-charcoal) / <alpha-value>)",
        sage: "rgb(var(--couleur-sage) / <alpha-value>)",
        gold: "rgb(var(--couleur-gold) / <alpha-value>)",
        rule: "rgb(var(--couleur-rule) / <alpha-value>)",
        surface: "rgb(var(--couleur-surface) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "72ch",
      },
      keyframes: {
        apparition: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flotter: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(-2deg)" },
        },
        scintiller: {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        confetti: {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(70px) rotate(360deg)", opacity: "0" },
        },
        surgir: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "60%": { opacity: "1", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        apparition: "apparition 0.35s ease-out both",
        flotter: "flotter 6s ease-in-out infinite",
        scintiller: "scintiller 2.4s ease-in-out infinite",
        confetti: "confetti 1.1s ease-out forwards",
        surgir: "surgir 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
