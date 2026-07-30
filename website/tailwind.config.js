/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f0f11',
          copper: '#B87333',
          copperLight: '#cd8b4a',
          copperDark: '#8a5525'
        }
      }
    },
  },
  plugins: [],
}
