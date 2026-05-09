/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary: '#2563EB',
        secondary: '#0F172A',
        accent: '#22C55E',
        background: '#F1F5F9',
        dark: {
          bg: '#0B1120',
          surface: '#111827',
          card: '#1A2235',
          text: '#F1F5F9',
          muted: '#94A3B8',
          border: '#1E2D45',
        },
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem', '3xl': '1.5rem' },
      boxShadow: {
        premium: '0 4px 24px -2px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)',
        glow: '0 0 0 1px rgba(37,99,235,0.2), 0 8px 32px rgba(37,99,235,0.15)',
        card: '0 2px 8px rgba(15,23,42,0.05)',
      },
    },
  },
  plugins: [],
};
