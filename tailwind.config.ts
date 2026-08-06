import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7fb',
          100: '#eceef6',
          200: '#d5daea',
          300: '#b1bad8',
          400: '#8794c0',
          500: '#6674a8',
          600: '#515d8c',
          700: '#424c72',
          800: '#39415f',
          900: '#181c2e',
          950: '#0e1120',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bdd4ff',
          300: '#92b8ff',
          400: '#6192ff',
          500: '#3d6cff',
          600: '#2949f5',
          700: '#2339e0',
          800: '#1f2fb5',
          900: '#1e2d8e',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(14,17,32,0.08), 0 4px 20px -4px rgba(14,17,32,0.06)',
        lift: '0 12px 32px -8px rgba(41,73,245,0.18)',
        glow: '0 0 0 4px rgba(61,108,255,0.12)',
        card: '0 1px 2px rgba(14,17,32,0.04), 0 8px 24px -8px rgba(14,17,32,0.10)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
