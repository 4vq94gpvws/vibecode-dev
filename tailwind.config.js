/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vsc': {
          'bg': '#1e1e1e',
          'surface': '#252526',
          'overlay': '#2d2d30',
          'input': '#3c3c3c',
          'border': '#3e3e42',
          'text': '#cccccc',
          'bright': '#e7e7e7',
          'muted': '#858585',
          'accent': '#007acc',
          'hover': '#2a2d2e',
          'active': '#37373d',
          'selection': '#264f78',
        }
      }
    },
  },
  plugins: [],
};
