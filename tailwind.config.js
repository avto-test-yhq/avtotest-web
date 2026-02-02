/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. MUHIM: Tungi/Kunduzgi rejim (Dark Mode) ishlashi uchun bu qator shart
  darkMode: 'class', 

  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Agar Next.js fontlarini (next/font) ishlatsangiz, bu yerga 'var(--font-inter)' deb yozish kerak bo'ladi
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        night: {
          950: '#020617', // Eng to'q fon
          900: '#0F172A', // Panel foni
          800: '#1E293B', // Borderlar
        },
        brand: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          accent: '#f43f5e',
          green: '#22c55e', // 2. QO'SHILDI: Kodda ishlatilgan yashil rang (to'g'ri javoblar uchun)
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #1e293b 0deg, #0f172a 180deg, #1e293b 360deg)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}