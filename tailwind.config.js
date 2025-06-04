/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        surface:  { light: '#FDFDFD', dark: '#0e1014' },
        primary:  { light: '#2563eb', dark: '#22d3ee' },
        onSurface:{ light: '#1f2937', dark: '#CBD5E1' },
      },
      fontFamily: {
        sans: ['"Outfit"', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%':      { 'background-position': '100% 50%' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 6s ease infinite',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
      colors: {
        animTeal: '#2dd4bf',
        animBlue: '#0077b6',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

