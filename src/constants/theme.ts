import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Colors — orange primary + Tripsy-inspired category palette
// ---------------------------------------------------------------------------

export const Colors = {
  primary: '#E86540',
  primaryLight: '#F2916E',
  primaryDark: '#C4492A',
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTinted: '#FFF5F1',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  overlay: 'rgba(17, 24, 39, 0.45)',
  frost: 'rgba(255, 255, 255, 0.72)',
  dark: {
    background: '#111827',
    backgroundSecondary: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
  },
} as const;

// ---------------------------------------------------------------------------
// Category palette — every travel category has a tint, solid, gradient, icon
// ---------------------------------------------------------------------------

export type CategoryKey =
  | 'flight'
  | 'lodging'
  | 'food'
  | 'activity'
  | 'transport'
  | 'shopping'
  | 'sightseeing'
  | 'misc';

export type CategoryTokens = {
  solid: string;
  tint: string;
  onTint: string;
  gradient: readonly [string, string];
  icon: string;
  label: string;
};

export const Categories: Record<CategoryKey, CategoryTokens> = {
  flight: {
    solid: '#3B82F6',
    tint: '#EAF2FF',
    onTint: '#1D4ED8',
    gradient: ['#60A5FA', '#3B82F6'] as const,
    icon: 'airplane',
    label: 'Flight',
  },
  lodging: {
    solid: '#8B5CF6',
    tint: '#F3EEFF',
    onTint: '#6D28D9',
    gradient: ['#A78BFA', '#8B5CF6'] as const,
    icon: 'bed',
    label: 'Lodging',
  },
  food: {
    solid: '#F59E0B',
    tint: '#FFF4DF',
    onTint: '#B45309',
    gradient: ['#FBBF24', '#F59E0B'] as const,
    icon: 'restaurant',
    label: 'Food',
  },
  activity: {
    solid: '#10B981',
    tint: '#E2F8F0',
    onTint: '#047857',
    gradient: ['#34D399', '#10B981'] as const,
    icon: 'sparkles',
    label: 'Activity',
  },
  transport: {
    solid: '#0EA5E9',
    tint: '#E2F4FD',
    onTint: '#0369A1',
    gradient: ['#38BDF8', '#0EA5E9'] as const,
    icon: 'car',
    label: 'Transport',
  },
  shopping: {
    solid: '#EC4899',
    tint: '#FDEBF4',
    onTint: '#BE185D',
    gradient: ['#F472B6', '#EC4899'] as const,
    icon: 'bag-handle',
    label: 'Shopping',
  },
  sightseeing: {
    solid: '#E86540',
    tint: '#FFEDE4',
    onTint: '#B34A2B',
    gradient: ['#F2916E', '#E86540'] as const,
    icon: 'camera',
    label: 'Sightseeing',
  },
  misc: {
    solid: '#6B7280',
    tint: '#F1F2F4',
    onTint: '#374151',
    gradient: ['#9CA3AF', '#6B7280'] as const,
    icon: 'ellipsis-horizontal-circle',
    label: 'Other',
  },
} as const;

export function getCategoryTokens(key: string | null | undefined): CategoryTokens {
  if (key && key in Categories) {
    return Categories[key as CategoryKey];
  }
  return Categories.misc;
}

// ---------------------------------------------------------------------------
// Typography — adds display variant (SF Pro Rounded 800, 32–40pt)
// ---------------------------------------------------------------------------

const displayFontFamily = Platform.select({
  ios: 'SF Pro Rounded',
  android: 'sans-serif-medium',
  default: 'System',
});

export const Typography = {
  display: {
    fontFamily: displayFontFamily,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  displayLarge: {
    fontFamily: displayFontFamily,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  displaySmall: {
    fontFamily: displayFontFamily,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.4 },
} as const satisfies Record<string, TextStyle>;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ---------------------------------------------------------------------------
// Radius — adds frosted sheet / card sizes
// ---------------------------------------------------------------------------

export const Radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  sheet: 28,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows — elevation presets + frosted card/sheet shadow
// ---------------------------------------------------------------------------

export const Shadows = {
  none: Platform.select({
    ios: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
    android: { elevation: 0 },
    default: {},
  }) as ViewStyle,
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 8 },
    default: {},
  }) as ViewStyle,
  frosted: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 10 },
    default: {},
  }) as ViewStyle,
} as const;

// ---------------------------------------------------------------------------
// Motion — standard durations/easings used across micro-interactions
// ---------------------------------------------------------------------------

export const Motion = {
  duration: {
    fast: 120,
    base: 200,
    slow: 320,
  },
  easing: {
    standard: 'ease-out' as const,
    emphasized: 'ease-in-out' as const,
  },
} as const;
