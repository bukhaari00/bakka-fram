/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2f9f3',
          100: '#e1f2e5',
          200: '#c5e5cc',
          300: '#99d2a6',
          400: '#67b779',
          500: '#429b56',
          600: '#327d43',
          700: '#296337',
          800: '#244f2e',
          900: '#1f4127',
          950: '#0c2313',
        },
        earth: {
          50: '#fbf8f5',
          100: '#f6f0eb',
          200: '#ecdfd4',
          300: '#dec6b4',
          400: '#cba78f',
          500: '#bc8f73',
          600: '#ae7b61',
          700: '#91634f',
          800: '#755143',
          900: '#604439',
        }
      },
    },
  },
  plugins: [],
}
