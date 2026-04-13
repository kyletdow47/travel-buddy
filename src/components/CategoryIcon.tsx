import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface CategoryConfig {
  icon: IoniconsName;
  color: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  food: { icon: 'restaurant', color: '#F59E0B' },
  hotel: { icon: 'bed', color: '#6366F1' },
  transport: { icon: 'car', color: '#3B82F6' },
  activity: { icon: 'bicycle', color: '#10B981' },
  shopping: { icon: 'bag-handle', color: '#EC4899' },
  sightseeing: { icon: 'camera', color: '#8B5CF6' },
  nightlife: { icon: 'moon', color: '#7C3AED' },
  nature: { icon: 'leaf', color: '#059669' },
  culture: { icon: 'library', color: '#DC2626' },
};

const DEFAULT_CONFIG: CategoryConfig = { icon: 'location', color: '#6B7280' };

export function getCategoryColor(category: string | null): string {
  if (!category) return DEFAULT_CONFIG.color;
  return (CATEGORY_MAP[category.toLowerCase()] ?? DEFAULT_CONFIG).color;
}

export function getCategoryIcon(category: string | null): IoniconsName {
  if (!category) return DEFAULT_CONFIG.icon;
  return (CATEGORY_MAP[category.toLowerCase()] ?? DEFAULT_CONFIG).icon;
}

interface CategoryIconProps {
  category: string | null;
  size?: number;
}

export default function CategoryIcon({ category, size = 28 }: CategoryIconProps) {
  const config = category
    ? CATEGORY_MAP[category.toLowerCase()] ?? DEFAULT_CONFIG
    : DEFAULT_CONFIG;

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: config.color }]}>
      <Ionicons name={config.icon} size={size * 0.55} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
