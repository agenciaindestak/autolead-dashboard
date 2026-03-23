/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#a100c2',
        'primary-light': '#cf60ea',
        secondary: '#6dc200',
      },
    },
  },
  plugins: [],
}