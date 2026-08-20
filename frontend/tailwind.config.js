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
          950: '#07090E',
          900: '#0B0E17',
          800: '#121727',
          700: '#1B233C',
          600: '#253258',
          purple: '#6366F1',
          accent: '#A855F7',
          cyan: '#06B6D4',
          glow: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.15)',
        'cyan-glow-md': '0 0 30px rgba(6, 182, 212, 0.3)',
        'purple-glow': '0 0 20px rgba(168, 85, 247, 0.15)',
        'purple-glow-md': '0 0 30px rgba(168, 85, 247, 0.3)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.2)',
        'emerald-glow-md': '0 0 30px rgba(16, 185, 129, 0.45)',
        'indigo-glow': '0 0 20px rgba(99, 102, 241, 0.25)',
      },
      animation: {
        'float-slow': 'floatAmbient 20s ease-in-out infinite',
        'float-slow-reverse': 'floatAmbientReverse 25s ease-in-out infinite',
        'orbit-slow': 'orbitClockwise 12s linear infinite',
        'orbit-fast': 'orbitClockwise 6s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        floatAmbient: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        floatAmbientReverse: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-40px, 40px) scale(0.9)' },
          '66%': { transform: 'translate(30px, -30px) scale(1.05)' },
        },
        orbitClockwise: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
