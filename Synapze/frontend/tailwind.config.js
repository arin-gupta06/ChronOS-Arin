/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Redefined Brand Palette for Dark Theme
        brand: {
          dark: '#020204',        // Main background
          card: '#0a0a0f',        // Card background
          border: 'rgba(255,255,255,0.15)',      // Border color
          surface: '#0e0e15',     // Elevated surface
          accent: '#b6a0ff',      // Primary Brand Color
          'accent-hover': '#8f77d6',
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            muted: '#71717a',
          }
        },
        // Legacy support (mapping to new system)
        background: {
          light: '#F8FAFC',
          dark: '#020204',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0a0a0f',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          dark: '#FFFFFF',
          'dark-secondary': '#a1a1aa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(104, 156, 255, 0.12), transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(30, 30, 40, 0.5) 0%, rgba(10, 10, 15, 0.8) 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(182, 160, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
}



