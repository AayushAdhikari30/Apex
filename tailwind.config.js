/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#05070f', 2: '#08091a', 3: '#0c0f1f' },
        surface: { DEFAULT: '#0f1326', 2: '#141930' },
        border: { DEFAULT: '#1a2035', 2: '#222845' },
        accent: { DEFAULT: '#4f6ef7', 2: '#7390fa', 3: '#a8bafc' },
        safe: '#10b981',
        growth: '#4f6ef7',
        spec: '#f97316',
        cash: '#64748b',
        gold: { DEFAULT: '#f0b429', 2: '#fcd34d' },
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-up': 'fadeUp 0.25s ease',
        'pulse-dot': 'pulseDot 2s infinite',
        'slide-in': 'slideIn 0.3s ease',
      },
    },
  },
  plugins: [],
}
