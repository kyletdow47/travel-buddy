import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Colors } from '../constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const CATEGORY_MAP: Record<string, { icon: IoniconsName; color: string }> = {
  food: { icon: 'restaurant', color: '#F59E0B' },
  lodging: { icon: 'bed', color: '#6366F1' },
  activity: { icon: 'bicycle', color: '#10B981' },
  transport: { icon: 'car', color: '#3B82F6' },
  shopping: { icon: 'bag', color: '#EC4899' },
  sightseeing: { icon: 'camera', color: '#8B5CF6' },
  entertainment: { icon: 'musical-notes', color: '#F43F5E' },
  nature: { icon: 'leaf', color: '#22C55E' },
};

const DEFAULT_CATEGORY = { icon: 'location' as IoniconsName, color: Colors.primary };

interface CategoryIconProps {
  category: string | null;
  size?: number;
  showBackground?: boolean;
}

export function CategoryIcon({ category, size = 20, showBackground = false }: CategoryIconProps) {
  const { icon, color } = CATEGORY_MAP[category ?? ''] ?? DEFAULT_CATEGORY;

  if (showBackground) {
    return (
      <View style={[styles.background, { backgroundColor: color + '20', width: size * 1.8, height: size * 1.8, borderRadius: size * 0.9 }]}>
        <Ionicons name={icon} size={size} color={color} />
      </View>
    );
  }

  return <Ionicons name={icon} size={size} color={color} />;
}

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
