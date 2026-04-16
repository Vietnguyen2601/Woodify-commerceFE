import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Warm Earth Tones (Wood theme)
        primary: {
          50: '#fdf8f6',
          100: '#f9ede8',
          200: '#f3d9cf',
          300: '#e8bba8',
          400: '#da9578',
          500: '#c87852',
          600: '#b5613b',
          700: '#974f31',
          800: '#7c432c',
          900: '#663a28',
          950: '#371c12',
        },
        // Neutral - Warm Gray
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Woodify Brand Colors (from Figma)
        brand: {
          wood: '#BE9C73',
          'wood-light': '#D4B896',
          accent: '#DB814C',
          'accent-hover': '#C46E3D',
          bg: '#E3DCC8',
          dark: '#6C5B50',
          footer: '#000000',
          gray: '#6D758F',
          'gray-light': '#B4B9C9',
        },
        // Semantic Colors
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        secondary: ['Inria Sans', 'sans-serif'],
        tertiary: ['Arimo', 'sans-serif'],
        'inria-sans': ['Inria Sans', 'sans-serif'],
        arimo: ['Arimo', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '28px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.15)',
        seller: '0 24px 60px -45px rgba(0, 0, 0, 0.65)',
      },
    },
  },
  plugins: [],
} satisfies Config
