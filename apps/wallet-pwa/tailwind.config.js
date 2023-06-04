/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const defaultColors = require('tailwindcss/colors')
const { getTheme } = require('sparks-ui')

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/sparks-ui/**/*.{js,ts,jsx,tsx}"
  ],
  theme: getTheme({ defaultTheme, defaultColors }),
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ]
}
