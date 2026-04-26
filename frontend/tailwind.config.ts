import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        bg: '#050507',
        'surface': '#0c0c0f',
        'surface-2': '#111116',
        'surface-3': '#1a1a21',
        'text': '#f5f5f7',
        'text-2': '#a1a1aa',
        'text-3': '#52525b',
        // Brand colors
        'blue': '#1a73e8',
        'blue-bright': '#4d9fff',
        'green': '#00c896',
        'gold': '#f0a500',
        // Utility
        'border': 'rgba(255,255,255,0.06)',
        'border-2': 'rgba(255,255,255,0.12)',
      },
      borderRadius: {
        DEFAULT: '12px',
        'sm': '8px',
        'full': '100px',
      },
      spacing: {
        'r': '12px',
        'rs': '8px',
      },
      fontSize: {
        // Typography system
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.7' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['32px', { lineHeight: '1.2' }],
        '4xl': ['40px', { lineHeight: '1.1' }],
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        150: '150ms',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
