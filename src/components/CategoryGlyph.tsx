import { memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Shadows } from '../constants/theme';

// Canonical category keys used across the app. The token set is expanded
// beyond the legacy (hotel/food/gas/activity/other) to match Tripsy.
export type CategoryKey =
  | 'flight'
  | 'lodging'
  | 'food'
  | 'activity'
  | 'places'
  | 'shopping'
  | 'culture'
  | 'transport'
  | 'weather'
  | 'note'
  | 'gas'
  | 'other'
  // legacy alias — existing data may still contain 'hotel'
  | 'hotel';

type IconName = keyof typeof Ionicons.glyphMap;

const META: Record<CategoryKey, { icon: IconName; color: string }> = {
  flight: { icon: 'airplane', color: Colors.category.flight },
  lodging: { icon: 'bed', color: Colors.category.lodging },
  hotel: { icon: 'bed', color: Colors.category.lodging },
  food: { icon: 'restaurant', color: Colors.category.food },
  activity: { icon: 'bicycle', color: Colors.category.activity },
  places: { icon: 'location', color: Colors.category.places },
  shopping: { icon: 'bag-handle', color: Colors.category.shopping },
  culture: { icon: 'business', color: Colors.category.culture },
  transport: { icon: 'car', color: Colors.category.transport },
  weather: { icon: 'sunny', color: Colors.category.weather },
  note: { icon: 'document-text', color: Colors.category.note },
  gas: { icon: 'car-sport', color: Colors.category.gas },
  other: { icon: 'ellipse', color: Colors.category.other },
};

export function normalizeCategory(raw: string | null | undefined): CategoryKey {
  const value = (raw ?? '').toLowerCase().trim();
  if (value in META) return value as CategoryKey;
  // Aliases / synonyms
  switch (value) {
    case 'plane':
    case 'flights':
      return 'flight';
    case 'hotel':
    case 'lodgings':
    case 'stay':
      return 'lodging';
    case 'restaurant':
    case 'dining':
      return 'food';
    case 'museum':
    case 'gallery':
      return 'culture';
    case 'shop':
    case 'shops':
      return 'shopping';
    case 'drive':
    case 'train':
    case 'bus':
    case 'taxi':
      return 'transport';
    default:
      return 'other';
  }
}

export function categoryColor(raw: string | null | undefined): string {
  return META[normalizeCategory(raw)].color;
}

export function categoryIconName(raw: string | null | undefined): IconName {
  return META[normalizeCategory(raw)].icon;
}

type Size = 28 | 36 | 44;

type Props = {
  category: CategoryKey | string | null | undefined;
  size?: Size;
  /** Override icon — otherwise derived from category. */
  icon?: IconName;
  /** Override fill color — otherwise category.color. */
  color?: string;
  /** Render the filled circle with a subtle drop shadow. Default true. */
  elevated?: boolean;
  /** Outline (transparent) variant — circle becomes color @ 18% with colored icon. */
  variant?: 'filled' | 'tinted' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

/**
 * CategoryGlyph — the signature Tripsy "filled circle + white icon" used
 * across every reservation row, timeline item, and marker label.
 *
 *   size 28 → inline list rows
 *   size 36 → day header + place markers
 *   size 44 → quick-action rows, large markers
 */
export const CategoryGlyph = memo(function CategoryGlyph({
  category,
  size = 28,
  icon,
  color,
  elevated = true,
  variant = 'filled',
  style,
}: Props) {
  const key = typeof category === 'string' ? normalizeCategory(category) : 'other';
  const meta = META[key];
  const resolvedColor = color ?? meta.color;
  const resolvedIcon = icon ?? meta.icon;

  const iconSize = size === 28 ? 16 : size === 36 ? 20 : 24;

  const fill =
    variant === 'filled'
      ? resolvedColor
      : variant === 'tinted'
        ? `${resolvedColor}2E` // ~18% alpha
        : 'transparent';

  const iconColor =
    variant === 'filled' ? '#FFFFFF' : resolvedColor;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: variant === 'ghost' ? resolvedColor : 'transparent',
        },
        elevated && variant === 'filled' ? Shadows.glyph : null,
        style,
      ]}
    >
      <Ionicons name={resolvedIcon} size={iconSize} color={iconColor} />
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
