/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF4EC',
          100: '#FFE3CC',
          200: '#FFD0A8',
          300: '#FFB066',
          400: '#FF9233',
          500: '#FF7300',
          600: '#E86600',
          700: '#CC5200',
          800: '#A34200',
          900: '#7A3200'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      keyframes: {
        gradientMove: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        gradientMove: 'gradientMove 12s ease infinite',
        blob: 'blob 14s ease-in-out infinite',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite'
      }
    }
  },
  plugins: []
}
