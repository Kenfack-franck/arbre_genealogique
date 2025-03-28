// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary-color))',
        secondary: 'rgb(var(--secondary-color))',
      },
    },
  },
  plugins: [],
}