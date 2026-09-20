/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zenBg: "#0f172a",
        zenCard: "#1e293b",
        zenAccent: "#38bdf8",
      }
    },
  },
  plugins: [],
}