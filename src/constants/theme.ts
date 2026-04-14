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

// Category palette — each category has a solid tint, a soft washed tint,
// and a gradient pair used by GradientScreen and other tinted primitives.
export type CategoryKey =
  | 'default'
  | 'flight'
  | 'lodging'
  | 'dining'
  | 'activity'
  | 'transit'
  | 'shopping'
  | 'sightseeing';

export interface CategoryPalette {
  tint: string;
  soft: string;
  gradient: readonly [string, string, string];
}

export const CategoryColors: Record<CategoryKey, CategoryPalette> = {
  default: {
    tint: '#E86540',
    soft: '#FDECE4',
    gradient: ['#FFF5EE', '#FDE4D4', '#FFFFFF'],
  },
  flight: {
    tint: '#3B82F6',
    soft: '#E0ECFF',
    gradient: ['#EAF2FF', '#D7E6FF', '#FFFFFF'],
  },
  lodging: {
    tint: '#8B5CF6',
    soft: '#EDE4FF',
    gradient: ['#F3ECFF', '#E3D4FF', '#FFFFFF'],
  },
  dining: {
    tint: '#EF4444',
    soft: '#FDE2E2',
    gradient: ['#FFE8E8', '#FFD4D4', '#FFFFFF'],
  },
  activity: {
    tint: '#10B981',
    soft: '#DEF5EC',
    gradient: ['#E6F7EF', '#CDEFDE', '#FFFFFF'],
  },
  transit: {
    tint: '#14B8A6',
    soft: '#D8F2EF',
    gradient: ['#E3F5F2', '#C8ECE6', '#FFFFFF'],
  },
  shopping: {
    tint: '#EC4899',
    soft: '#FBDCEA',
    gradient: ['#FDE5F0', '#FBCEDF', '#FFFFFF'],
  },
  sightseeing: {
    tint: '#F59E0B',
    soft: '#FBEACB',
    gradient: ['#FEF3DA', '#FDE1A8', '#FFFFFF'],
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
