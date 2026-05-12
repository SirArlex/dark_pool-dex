export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Zama palette — yellow on black
        zama: {
          yellow:    "#FFD208",
          yellowDim: "#E5BC07",
          gold:      "#C99F00",
          black:     "#000000",
          coal:      "#0A0A0A",
          ink:       "#121212",
          slate:     "#1A1A1A",
          ash:       "#262626",
        },
        // semantic
        success: "#00D26A",
        danger:  "#FF3B5C",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      keyframes: {
        glow: {
          "0%":   { boxShadow: "0 0 0px rgba(255,210,8,0.4)" },
          "100%": { boxShadow: "0 0 24px rgba(255,210,8,0.6)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: 0.4 },
          "50%":      { opacity: 1 },
        },
      },
      animation: {
        glow:       "glow 2s ease-in-out infinite alternate",
        pulseSlow:  "pulseSlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
