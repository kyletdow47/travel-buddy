import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface CategoryConfig {
  color: string;
  icon: IoniconsName;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  food: { color: '#EF4444', icon: 'restaurant' },
  hotel: { color: '#8B5CF6', icon: 'bed' },
  transport: { color: '#3B82F6', icon: 'car' },
  activity: { color: '#10B981', icon: 'bicycle' },
  shopping: { color: '#F59E0B', icon: 'cart' },
  sightseeing: { color: '#EC4899', icon: 'camera' },
  nightlife: { color: '#6366F1', icon: 'moon' },
  nature: { color: '#22C55E', icon: 'leaf' },
  culture: { color: '#D97706', icon: 'library' },
};

const DEFAULT_CONFIG: CategoryConfig = { color: '#6B7280', icon: 'location' };

export function getCategoryColor(category: string | null): string {
  if (!category) return DEFAULT_CONFIG.color;
  return (CATEGORY_MAP[category.toLowerCase()] ?? DEFAULT_CONFIG).color;
}

interface CategoryIconProps {
  category: string | null;
  size?: number;
}

export function CategoryIcon({ category, size = 28 }: CategoryIconProps) {
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
