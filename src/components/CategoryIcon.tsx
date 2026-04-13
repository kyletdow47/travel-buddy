import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  hotel:    { name: 'bed-outline',          color: '#6366F1' },
  food:     { name: 'restaurant-outline',   color: '#F59E0B' },
  gas:      { name: 'car-outline',          color: '#10B981' },
  activity: { name: 'flag-outline',         color: '#E86540' },
  other:    { name: 'location-outline',     color: '#6B7280' },
};

const DEFAULT = { name: 'location-outline' as keyof typeof Ionicons.glyphMap, color: '#6B7280' };

interface CategoryIconProps {
  category: string | null;
  size?: number;
}

export function CategoryIcon({ category, size = 18 }: CategoryIconProps) {
  const { name, color } = (category ? ICONS[category.toLowerCase()] : null) ?? DEFAULT;
  return (
    <View style={[styles.circle, { borderColor: color, width: size * 2, height: size * 2, borderRadius: size }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
