/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sereneBg: "#ecfdf5", // emerald-50 (Very light mint)
        sereneCard: "#ffffff",
        serenePrimary: "#10b981", // emerald-500
        sereneDark: "#064e3b", // emerald-900 (High contrast text)
        sereneMuted: "#6ee7b7", // emerald-300
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}