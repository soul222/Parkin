// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          bg: 'var(--surface-bg)',
          card: 'var(--surface-card)',
          border: 'var(--surface-border)',
          text: 'var(--surface-text)',
          muted: 'var(--surface-muted)',
        },
        status: {
          ok: '#43A047',
          warn: '#FFB300',
          danger: '#EF4444'
        },
        brand: {
          primary: '#1565C0',
          'primary-light': '#1A56DB',
          'primary-dark': '#0D47A1',
          secondary: '#43A047',
          'secondary-light': '#66BB6A',
          accent: '#2196F3'
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        'gradient-card': 'linear-gradient(135deg, var(--surface-card) 0%, var(--surface-bg) 100%)',
        'gradient-glass': 'var(--gradient-glass)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(21,101,192,0.3)',
        'glow-green': '0 0 20px rgba(67,160,71,0.3)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}