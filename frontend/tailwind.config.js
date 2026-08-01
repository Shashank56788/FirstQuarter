/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0B0E17',
          800: '#111625',
          700: '#1A2138',
          600: '#263152',
          purple: '#6366F1',
          accent: '#A855F7',
          cyan: '#06B6D4',
          glow: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
