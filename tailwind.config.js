/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        covibe: {
          pink: '#ec4899',
          purple: '#a855f7',
          cyan: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}
