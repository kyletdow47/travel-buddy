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

export const Categories = [
  'default',
  'flight',
  'lodging',
  'dining',
  'activity',
  'transit',
  'shopping',
  'nature',
] as const;

export type Category = (typeof Categories)[number];

export type GradientStops = readonly [string, string, string];

/**
 * Tripsy-inspired 3-stop gradient wash per category.
 * Each gradient runs from a vivid tint (top) → softer tint → white (bottom)
 * so content stays legible on the white base theme.
 */
export const CategoryGradients: Record<Category, GradientStops> = {
  default: ['#FFE3D6', '#FFF0E7', '#FFFFFF'],
  flight: ['#D9E6FF', '#EAF1FF', '#FFFFFF'],
  lodging: ['#E9DDFF', '#F2EBFF', '#FFFFFF'],
  dining: ['#FFE0CC', '#FFEEDE', '#FFFFFF'],
  activity: ['#D9F5E4', '#EAF9F0', '#FFFFFF'],
  transit: ['#DCEFF5', '#ECF6F9', '#FFFFFF'],
  shopping: ['#FFDCEB', '#FFE9F2', '#FFFFFF'],
  nature: ['#D6EED3', '#E8F5E6', '#FFFFFF'],
} as const;

/**
 * Solid accent hex per category — use for chips, glyphs, or tinted banners
 * that need to coexist with a matching CategoryGradient wash.
 */
export const CategoryAccents: Record<Category, string> = {
  default: Colors.primary,
  flight: '#3B7BFF',
  lodging: '#7A5AF8',
  dining: '#F2884B',
  activity: '#16A34A',
  transit: '#0EA5B7',
  shopping: '#E94C89',
  nature: '#4D9A4A',
} as const;
