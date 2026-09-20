/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9f6',
          100: '#d6f0ea',
          200: '#ade1d6',
          300: '#7cccbc',
          400: '#48b09d',
          500: '#279b85',
          600: '#157f6d',
          700: '#116657',
          800: '#0f5347',
          900: '#0d453c',
          950: '#062b25',
        },
        sand: {
          50: '#fdf9f0',
          100: '#faf0da',
          200: '#f4ddab',
          300: '#edc678',
          400: '#e5ab45',
          500: '#d99420',
          600: '#b87616',
          700: '#935a15',
          800: '#784818',
          900: '#653c18',
        },
        ink: {
          50: '#f6f7f7',
          100: '#e2e5e4',
          200: '#c5cbc9',
          300: '#a0aaa7',
          400: '#7c8885',
          500: '#616d6a',
          600: '#4c5755',
          700: '#3f4846',
          800: '#353c3b',
          900: '#2e3433',
          950: '#181c1b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24,28,27,0.04), 0 4px 16px rgba(24,28,27,0.06)',
        lift: '0 2px 4px rgba(24,28,27,0.06), 0 12px 32px rgba(24,28,27,0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
