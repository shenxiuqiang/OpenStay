// Root Tailwind config using design tokens
const designTokens = require('./packages/design-tokens/dist/index.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './property/web/src/**/*.{js,ts,jsx,tsx}',
    './hub/web/src/**/*.{js,ts,jsx,tsx}',
    './travel-app/web/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  presets: [require('./packages/design-tokens/tailwind.config.js')],
  theme: {
    extend: {},
  },
  plugins: [],
};
