/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      space: '#0B0C10',
      panel: '#1F2833',
      cyan: '#66FCF1',
      neonRed: '#FF003C'
    }
    },
  },
  plugins: [],
}

