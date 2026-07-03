/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0E14',
        card: '#141922',
        cardBorder: '#232A38',
        amber: '#FFB020',
        green: '#3DDC84',
        yellowc: '#FFC53D',
        redc: '#FF5C5C',
        muted: '#8A94A6',
      },
    },
  },
  plugins: [],
}
