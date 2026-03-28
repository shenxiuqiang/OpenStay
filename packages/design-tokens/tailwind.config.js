const tokens = require('./dist/index.js').tokens;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: tokens.primary,
        secondary: tokens.secondary,
        arc: tokens.arc,
        semantic: tokens.semantic,
        neutral: tokens.neutral,
      },
      fontFamily: {
        sans: tokens.fontFamily.sans,
        mono: tokens.fontFamily.mono,
      },
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: tokens.zIndex,
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-in-up': 'fade-in-up 200ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
      },
    },
  },
  plugins: [
    // Custom component utilities
    function({ addComponents, theme }) {
      addComponents({
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: theme('spacing.10'),
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.lg'),
          transitionProperty: 'color, background-color, border-color, box-shadow',
          transitionDuration: theme('transitionDuration.DEFAULT'),
          '&:focus-visible': {
            outline: 'none',
            ring: '2px',
            ringOffset: '2px',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
          },
        },
        '.input': {
          width: '100%',
          minHeight: theme('spacing.11'),
          paddingLeft: theme('spacing.3.5'),
          paddingRight: theme('spacing.3.5'),
          backgroundColor: theme('colors.white'),
          borderWidth: '1px',
          borderColor: theme('colors.neutral.200'),
          borderRadius: theme('borderRadius.lg'),
          fontSize: theme('fontSize.base'),
          transitionProperty: 'border-color, box-shadow',
          transitionDuration: theme('transitionDuration.DEFAULT'),
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`,
          },
        },
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.DEFAULT'),
          overflow: 'hidden',
        },
      });
    },
  ],
};
