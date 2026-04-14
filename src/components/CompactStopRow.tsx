import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Stop } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import { CategoryGlyph, normalizeCategory, categoryColor } from './CategoryGlyph';

type StopStatus = 'upcoming' | 'current' | 'done';

type CompactStopRowProps = {
  stop: Stop;
  index: number;
  /** Whether to show the vertical timeline connector below this row. */
  showConnector?: boolean;
  onPress?: () => void;
  onStatusPress?: () => void;
};

function statusDot(status: StopStatus) {
  switch (status) {
    case 'current':
      return Colors.primary;
    case 'done':
      return Colors.success;
    default:
      return Colors.info;
  }
}

function formatTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function CompactStopRowBase({
  stop,
  index,
  showConnector = false,
  onPress,
  onStatusPress,
}: CompactStopRowProps) {
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const cat = normalizeCategory(stop.category);
  const dotColor = categoryColor(stop.category);
  const statusColor = statusDot(status);
  const dateLabel = formatTime(stop.planned_date);

  return (
    <View style={styles.wrapper}>
      {/* Timeline column */}
      <View style={styles.timelineCol}>
        <CategoryGlyph category={cat} size={28} elevated />
        {showConnector && (
          <View style={[styles.connector, { backgroundColor: dotColor + '40' }]} />
        )}
      </View>

      {/* Compact single-line row */}
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={onPress}
      >
        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>
          {stop.name}
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Date label */}
        {dateLabel ? (
          <Text style={styles.dateText}>{dateLabel}</Text>
        ) : null}

        {/* Status dot */}
        <TouchableOpacity
          onPress={onStatusPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          style={styles.statusWrap}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

export const CompactStopRow = memo(CompactStopRowBase);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    alignItems: 'flex-start',
  },

  // Timeline column
  timelineCol: {
    width: 36,
    alignItems: 'center',
    paddingTop: 2,
    marginRight: Spacing.sm,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 12,
    borderRadius: 1,
    marginTop: 2,
  },

  // Row
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    minHeight: 36,
    ...Shadows.sm,
  },

  name: {
    ...Typography.bodyMed,
    fontWeight: '600',
    color: Colors.text,
    flexShrink: 1,
  },

  spacer: {
    flex: 1,
    minWidth: Spacing.sm,
  },

  dateText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginRight: Spacing.sm,
  },

  statusWrap: {
    padding: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
