/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kuupa-primary': '#B87333',
        'kuupa-hover': '#D97736',
        'kuupa-bg': '#FFF3E8',
        'kuupa-dark': '#2D1B10'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
