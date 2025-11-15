/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        slideshow: "slideshow 40s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.8s ease-in forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        slideshow: {
          "0%": {
            opacity: 1,
            transform: "scale(1)",
          },
          "20%": {
            opacity: 0,
            transform: "scale(1.1)",
          },
          "20.1%": {
            opacity: 0,
            transform: "scale(1)",
          },
          "40%": {
            opacity: 1,
            transform: "scale(1.1)",
          },
          "60%": {
            opacity: 0,
            transform: "scale(1)",
          },
          "60.1%": {
            opacity: 0,
            transform: "scale(1.1)",
          },
          "80%": {
            opacity: 1,
            transform: "scale(1)",
          },
          "100%": {
            opacity: 0,
            transform: "scale(1.1)",
          },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": {
            opacity: 0,
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
