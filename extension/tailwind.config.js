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
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
