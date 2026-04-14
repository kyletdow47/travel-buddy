import { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import { Colors, Radius, Shadows } from '../constants/theme';

type CategoryKey = 'hotel' | 'food' | 'gas' | 'activity' | 'other';

const CATEGORY_META: Record<
  CategoryKey,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  hotel: { icon: 'bed', color: Colors.category.hotel },
  food: { icon: 'restaurant', color: Colors.category.food },
  gas: { icon: 'car', color: Colors.category.gas },
  activity: { icon: 'bicycle', color: Colors.category.activity },
  other: { icon: 'ellipse', color: Colors.category.other },
};

function normalizeCategory(raw: string | null | undefined): CategoryKey {
  const value = (raw ?? '').toLowerCase();
  if (value === 'hotel' || value === 'food' || value === 'gas' || value === 'activity') {
    return value;
  }
  return 'other';
}

type Props = {
  stop: Stop;
  isSelected?: boolean;
  photoUrl?: string | null;
};

function MapPhotoMarkerBase({ stop, isSelected = false, photoUrl }: Props) {
  const category = normalizeCategory(stop.category);
  const meta = CATEGORY_META[category];

  const boxSize = isSelected ? 66 : 60;
  const imgSize = isSelected ? 58 : 52;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
            borderTopColor: meta.color,
            borderColor: isSelected ? Colors.primary : Colors.surface,
          },
          isSelected ? Shadows.lg : Shadows.md,
        ]}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: imgSize, height: imgSize, borderRadius: Radius.sm }}
          />
        ) : (
          <View
            style={[
              styles.iconFallback,
              { width: imgSize, height: imgSize, backgroundColor: `${meta.color}22` },
            ]}
          >
            <Ionicons name={meta.icon} size={24} color={meta.color} />
          </View>
        )}
      </View>
      {/* Triangle pointer */}
      <View
        style={[
          styles.pointer,
          { borderTopColor: isSelected ? Colors.primary : Colors.surface },
        ]}
      />
    </View>
  );
}

export const MapPhotoMarker = memo(MapPhotoMarkerBase);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  box: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderTopWidth: 3,
  },
  iconFallback: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
