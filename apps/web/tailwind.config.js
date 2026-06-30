/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        accent: {
          DEFAULT: "#3b9eff",
          muted: "#1a3a5c",
          glow: "#60b4ff",
        },
        enter: "#34d399",
        exit: "#fb923c",
      },
      boxShadow: {
        glow: "0 0 40px rgba(59, 158, 255, 0.08)",
      },
      keyframes: {
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
