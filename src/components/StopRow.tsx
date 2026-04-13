import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type StopStatus = 'upcoming' | 'current' | 'done';
type CategoryKey = 'hotel' | 'food' | 'gas' | 'activity' | 'other';

type StopRowProps = {
  stop: Stop;
  index: number;
  onPress?: () => void;
  onLongPress?: () => void;
  onStatusPress?: () => void;
};

const CATEGORY_META: Record<
  CategoryKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  hotel: { label: 'Hotel', icon: 'bed-outline', color: Colors.category.hotel },
  food: { label: 'Food', icon: 'restaurant-outline', color: Colors.category.food },
  gas: { label: 'Gas', icon: 'car-outline', color: Colors.category.gas },
  activity: { label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
  other: { label: 'Other', icon: 'ellipse-outline', color: Colors.category.other },
};

function normalizeCategory(raw: string | null | undefined): CategoryKey {
  const value = (raw ?? '').toLowerCase();
  if (value === 'hotel' || value === 'food' || value === 'gas' || value === 'activity') {
    return value;
  }
  return 'other';
}

function statusMeta(status: StopStatus) {
  switch (status) {
    case 'current':
      return { label: 'Now', icon: '▸', color: Colors.primary, bg: Colors.primaryLight };
    case 'done':
      return { label: 'Done', icon: '✓', color: Colors.textSecondary, bg: Colors.border };
    case 'upcoming':
    default:
      return { label: 'Upcoming', icon: '⬡', color: Colors.info, bg: 'rgba(59,130,246,0.12)' };
  }
}

function StopRowBase({ stop, index, onPress, onLongPress, onStatusPress }: StopRowProps) {
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const sMeta = statusMeta(status);
  const category = normalizeCategory(stop.category);
  const cMeta = CATEGORY_META[category];

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Left category-colored accent line */}
      <View style={[styles.accent, { backgroundColor: cMeta.color }]} />

      {/* Stop number circle */}
      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={cMeta.icon} size={16} color={cMeta.color} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {stop.name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {stop.location ?? 'Location TBD'}
          </Text>
          <View style={[styles.categoryTag, { backgroundColor: `${cMeta.color}1A` }]}>
            <Text style={[styles.categoryTagText, { color: cMeta.color }]}>{cMeta.label}</Text>
          </View>
        </View>
      </View>

      {/* Status chip */}
      <TouchableOpacity
        style={[styles.statusChip, { backgroundColor: sMeta.bg }]}
        activeOpacity={0.7}
        onPress={onStatusPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.statusChipText, { color: sMeta.color }]}>
          {sMeta.icon} {sMeta.label}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export const StopRow = memo(StopRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  numberText: {
    ...Typography.micro,
    color: Colors.surface,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  categoryTag: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryTagText: {
    ...Typography.micro,
  },
  statusChip: {
    minWidth: 72,
    height: 28,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  statusChipText: {
    ...Typography.micro,
    fontWeight: '700',
  },
});
