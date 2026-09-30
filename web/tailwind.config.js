/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B2A5B",
        royal: "#1F4FBF",
        ice: "#E8EFFC",
        high: "#1B7F4B",
        exploratory: "#B7791F",
        contested: "#C62828",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(11, 42, 91, 0.08)",
      },
    },
  },
  plugins: [],
};
