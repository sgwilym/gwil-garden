const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./app/**/*.{js,ts,tsx,md,mdx}', './remix.config.js'],
  darkMode: 'media',
  theme: {
    colors
  },
  variants: {
    extend: {
      
    },
  },
  plugins: [],
};