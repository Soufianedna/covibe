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
          pink: '#7c3aed',
          purple: '#4f46e5',
          cyan: '#818cf8',
        }
      }
    },
  },
  plugins: [],
}
