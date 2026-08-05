import { colors, spacing, typography } from '../tokens'

export const luminaTheme = {
  colors,
  spacing,
  typography,
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
} as const

export type LuminaTheme = typeof luminaTheme
