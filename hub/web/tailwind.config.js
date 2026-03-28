/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './property/web/src/**/*.{js,ts,jsx,tsx}',
    './hub/web/src/**/*.{js,ts,jsx,tsx}',
    './travel-app/web/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ebf8ff',
          100: '#bee3f8',
          200: '#90cdf4',
          300: '#63b3ed',
          400: '#4299e1',
          500: '#3182ce',
          600: '#2b6cb0',
          700: '#2c5282',
          800: '#2a4365',
          900: '#1a365d',
        },
        secondary: {
          50: '#faf5ff',
          100: '#e9d8fd',
          200: '#d6bcfa',
          300: '#b794f4',
          400: '#9f7aea',
          500: '#805ad5',
          600: '#6b46c1',
          700: '#553c9a',
          800: '#44337a',
          900: '#322659',
        },
        arc: {
          purple: '#764ba2',
          blue: '#667eea',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
