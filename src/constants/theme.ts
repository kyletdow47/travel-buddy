export const Colors = {
  primary: '#E86540',
  primaryLight: '#F2916E',
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  dark: {
    background: '#111827',
    backgroundSecondary: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
  },
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/**
 * Travel Buddy categories — used for map glyphs, chips, and per-category gradients.
 * Keep this list in sync with any server-side category enums.
 */
export const Categories = [
  'flight',
  'hotel',
  'food',
  'activity',
  'transport',
  'shopping',
  'nature',
  'default',
] as const;

export type Category = (typeof Categories)[number];

/**
 * Per-category gradient stops used by <GradientScreen /> and tinted surfaces.
 * Three stops give a soft Tripsy-style top-to-bottom wash: vivid → muted → near-white.
 */
export const CategoryGradients: Record<Category, readonly [string, string, string]> = {
  flight: ['#DCEBFF', '#EEF4FF', '#FFFFFF'],
  hotel: ['#ECE4FF', '#F3EEFF', '#FFFFFF'],
  food: ['#FFE1D6', '#FFEEE4', '#FFFFFF'],
  activity: ['#DCF5E3', '#ECF8EF', '#FFFFFF'],
  transport: ['#FFE5CC', '#FFF1E0', '#FFFFFF'],
  shopping: ['#FFE1EC', '#FFECF3', '#FFFFFF'],
  nature: ['#D5F0EE', '#E6F5F3', '#FFFFFF'],
  default: ['#FFE5DA', '#FFF1EA', '#FFFFFF'],
} as const;

/**
 * Accent color per category — used for icons, chips, CategoryGlyph fills.
 */
export const CategoryAccents: Record<Category, string> = {
  flight: '#3B82F6',
  hotel: '#8B5CF6',
  food: '#EF5A3C',
  activity: '#10B981',
  transport: '#E86540',
  shopping: '#EC4899',
  nature: '#14B8A6',
  default: '#E86540',
} as const;
