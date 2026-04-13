import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const CATEGORY_CONFIG: Record<string, { icon: IoniconsName; color: string }> = {
  food: { icon: 'restaurant', color: '#F59E0B' },
  hotel: { icon: 'bed', color: '#6366F1' },
  transport: { icon: 'car', color: '#3B82F6' },
  activity: { icon: 'walk', color: '#10B981' },
  shopping: { icon: 'bag', color: '#EC4899' },
  sightseeing: { icon: 'camera', color: '#8B5CF6' },
  nightlife: { icon: 'moon', color: '#6366F1' },
  nature: { icon: 'leaf', color: '#059669' },
  culture: { icon: 'library', color: '#B45309' },
  default: { icon: 'location', color: '#E86540' },
};

interface CategoryIconProps {
  category: string | null;
  size?: number;
}

export function CategoryIcon({ category, size = 20 }: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category ?? 'default'] ?? CATEGORY_CONFIG.default;

  return (
    <View style={[styles.container, { backgroundColor: config.color, width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]}>
      <Ionicons name={config.icon} size={size} color="#FFFFFF" />
    </View>
  );
}

export function getCategoryColor(category: string | null): string {
  const config = CATEGORY_CONFIG[category ?? 'default'] ?? CATEGORY_CONFIG.default;
  return config.color;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
