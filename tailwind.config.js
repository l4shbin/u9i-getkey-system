/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: '#D4AF37',
          light: '#F3E5AB',
          dark: '#AA7C11',
          bg: '#07070A',
          panel: '#12121A'
        }
      }
    },
  },
  plugins: [],
}
