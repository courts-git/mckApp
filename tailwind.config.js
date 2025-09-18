/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text-primary': '#2E3A59',
        'text-secondary': '#5a6b8a',
        'primary-red': '#C42A2D',
        'accent-red': '#9D2224',
        'accent-gold': '#ECE0D0',
      }
    },
  },
  plugins: [],
}
