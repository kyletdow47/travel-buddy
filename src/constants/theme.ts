import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const Colors = {
  primary: '#E86540',
  primaryLight: '#F2916E',
  primaryDark: '#C4492A',
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTinted: '#FFF5F1',
  frost: 'rgba(255,255,255,0.72)',
  overlay: 'rgba(17,24,39,0.45)',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
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
    tint: '#E0EDFF',
    onTint: '#1E3A8A',
    gradient: ['#60A5FA', '#3B82F6'] as const,
    icon: 'airplane',
    label: 'Flight',
  },
  lodging: {
    solid: '#8B5CF6',
    tint: '#EDE9FE',
    onTint: '#4C1D95',
    gradient: ['#A78BFA', '#8B5CF6'] as const,
    icon: 'bed',
    label: 'Lodging',
  },
  food: {
    solid: '#F59E0B',
    tint: '#FEF3C7',
    onTint: '#78350F',
    gradient: ['#FBBF24', '#F59E0B'] as const,
    icon: 'restaurant',
    label: 'Food',
  },
  activity: {
    solid: '#10B981',
    tint: '#D1FAE5',
    onTint: '#064E3B',
    gradient: ['#34D399', '#10B981'] as const,
    icon: 'bicycle',
    label: 'Activity',
  },
  transport: {
    solid: '#0EA5E9',
    tint: '#E0F2FE',
    onTint: '#0C4A6E',
    gradient: ['#38BDF8', '#0EA5E9'] as const,
    icon: 'car',
    label: 'Transport',
  },
  shopping: {
    solid: '#EC4899',
    tint: '#FCE7F3',
    onTint: '#831843',
    gradient: ['#F472B6', '#EC4899'] as const,
    icon: 'bag-handle',
    label: 'Shopping',
  },
  sightseeing: {
    solid: '#E86540',
    tint: '#FFF5F1',
    onTint: '#7C2D12',
    gradient: ['#F2916E', '#E86540'] as const,
    icon: 'camera',
    label: 'Sightseeing',
  },
  misc: {
    solid: '#6B7280',
    tint: '#F3F4F6',
    onTint: '#1F2937',
    gradient: ['#9CA3AF', '#6B7280'] as const,
    icon: 'ellipsis-horizontal',
    label: 'Misc',
  },
};

export function getCategoryTokens(key: string | null | undefined): CategoryTokens {
  if (key && key in Categories) {
    return Categories[key as CategoryKey];
  }
  return Categories.misc;
}

const displayFontFamily = Platform.select({ ios: 'System', default: undefined });

export const Typography = {
  displayLarge: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    fontFamily: displayFontFamily,
  },
  display: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.6,
    fontFamily: displayFontFamily,
  },
  displaySmall: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: displayFontFamily,
  },
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  caption: { fontSize: 13, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  sheet: 28,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
    },
    android: { elevation: 1 },
    default: {},
  }) as ViewStyle,
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    default: {},
  }) as ViewStyle,
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
  frosted: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 8 },
    default: {},
  }) as ViewStyle,
} as const;

export const Motion = {
  duration: {
    fast: 150,
    base: 220,
    slow: 320,
  },
  easing: {
    standard: 'ease-in-out' as const,
    emphasized: 'ease-out' as const,
  },
} as const;
