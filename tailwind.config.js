/** @type {import('tailwindcss').Config} */
import { colors, spacing, typography, shadows, animation, breakpoints, borderRadius } from './src/design-system/tokens';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      spacing,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      boxShadow: shadows,
      transitionDuration: animation.duration,
      transitionTimingFunction: animation.easing,
      screens: breakpoints,
      borderRadius,
      // Creator-specific utilities
      minHeight: {
        'touch': '44px', // Minimum touch target
        'comfortable': '48px',
        'large': '56px',
      },
      minWidth: {
        'touch': '44px',
        'comfortable': '48px', 
        'large': '56px',
      },
    },
  },
  plugins: [],
};
