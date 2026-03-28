// ============================================
// OpenStay Design Tokens
// ============================================

// Primary Brand Colors - OpenStay Blue
export const primary = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49',
} as const;

// Secondary Colors
export const secondary = {
  50: '#fdf4ff',
  100: '#fae8ff',
  200: '#f0abfc',
  300: '#e879f9',
  400: '#d946ef',
  500: '#c026d3',
  600: '#a21caf',
  700: '#86198f',
  800: '#701a75',
  900: '#4a044e',
} as const;

// ArcAlbum Specific Colors
export const arc = {
  purple: '#764ba2',
  blue: '#667eea',
  gradient: {
    start: '#667eea',
    end: '#764ba2',
  },
} as const;

// Semantic Colors
export const semantic = {
  success: {
    light: '#dcfce7',
    DEFAULT: '#10b981',
    dark: '#047857',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#b45309',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1d4ed8',
  },
} as const;

// Neutral Colors
export const neutral = {
  white: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
  black: '#000000',
} as const;

// ============================================
// Typography
// ============================================

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
} as const;

export const fontSize = {
  'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
  'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
  'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.03em' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.04em' }],
  '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
} as const;

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// ============================================
// Spacing (8px base grid)
// ============================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
} as const;

// ============================================
// Border Radius
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================
// Shadows
// ============================================

export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// Elevation for React Native
export const elevation = {
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 6,
  5: 8,
} as const;

// ============================================
// Transitions
// ============================================

export const transition = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================
// Z-Index
// ============================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================
// Breakpoints
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// Component Tokens
// ============================================

export const components = {
  button: {
    minHeight: '2.5rem', // 40px
    paddingX: '1rem',    // 16px
    borderRadius: borderRadius.lg,
  },
  input: {
    minHeight: '2.75rem', // 44px
    paddingX: '0.875rem', // 14px
    borderRadius: borderRadius.lg,
  },
  card: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
  },
} as const;

// ============================================
// Export all tokens
// ============================================

export const tokens = {
  primary,
  secondary,
  arc,
  semantic,
  neutral,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  boxShadow,
  elevation,
  transition,
  zIndex,
  breakpoints,
  components,
} as const;

export default tokens;
