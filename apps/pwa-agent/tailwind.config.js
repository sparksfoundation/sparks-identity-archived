/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'sparks-purple': {
          '50': '#ededfd',
          '100': '#e1dffb',
          '200': '#d2d1fa',
          '300': '#b7b1f6',
          '400': '#968af0',
          '500': '#7e68e8',
          '600': '#6744da',
          '700': '#5a3abb',
          '800': '#4b309c',
          '900': '#3f297f',
          '950': '#251854',
        },
        'red': {
          '50': '#fdf2f2',
          '100': '#fce3e3',
          '200': '#fbcbcb',
          '300': '#f8abab',
          '400': '#f17979',
          '500': '#e44e4e',
          '600': '#d03535',
          '700': '#b02727',
          '800': '#8f2424',
          '900': '#792525',
          '950': '#3f0d0d',
        },
        'orange': {
          '50': '#fcf2ed',
          '100': '#fae6db',
          '200': '#f3cab4',
          '300': '#eba884',
          '400': '#e28455',
          '500': '#db6e33',
          '600': '#ca632b',
          '700': '#a65126',
          '800': '#864928',
          '900': '#6b3c24',
          '950': '#3c2011',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        '1/4': '25%',
        '1/3': '33.333%',
        '5/12': '41.666%',
        '1/2': '50%',
        '7/12': '58.333%',
        '2/3': '66.666%',
        '3/4': '75%',
      },
      maxHeight: {
        '1/4': '25%',
        '1/3': '33.333%',
        '5/12': '41.666%',
        '1/2': '50%',
        '7/12': '58.333%',
        '2/3': '66.666%',
        '3/4': '75%',
      },
      screens: {
        '800': '800px',
        '500': '500px',
      },
      opacity: {
        '1': '0.01',
        '2': '0.02',
        '4': '0.04',
        '6': '0.06',
        '8': '0.08',
      },
      backdropBlur: {
        '2xs': '1px',
        xs: '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
