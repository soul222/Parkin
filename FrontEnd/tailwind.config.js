// import('tailwindcss').Config
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1218',
          card: '#141a22',
          border: '#263043',
          text: '#e9eef7',
          muted: '#a7b0c0'
        },
        status: {
          ok: '#2bd67b',
          warn: '#ffcc00',
          danger: '#ff4d4f'
        },
        brand: {
          primary: '#4b8cff',
          secondary: '#7a5cff'
        }
      }
    },
  },
  plugins: [],
}