const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./app/**/*.{js,ts,tsx,md,mdx}', './remix.config.js'],
  darkMode: 'media',
  theme: {
    colors,
    fontFamily: {
      ...defaultTheme,
      display: ['Dover Sans Display', ...defaultTheme.fontFamily.sans],
      sans: ['Dover Sans Text', ...defaultTheme.fontFamily.sans]
    }
  },
  variants: {
    extend: {
      
    },
  },
  plugins: [],
};