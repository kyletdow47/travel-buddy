import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Stop } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type StopStatus = 'upcoming' | 'current' | 'done';

const STATUS_CYCLE: Record<StopStatus, StopStatus> = {
  upcoming: 'current',
  current: 'done',
  done: 'upcoming',
};

const STATUS_COLORS: Record<StopStatus, string> = {
  upcoming: Colors.textSecondary,
  current: Colors.primary,
  done: Colors.success,
};

const STATUS_LABELS: Record<StopStatus, string> = {
  upcoming: 'Upcoming',
  current: 'Current',
  done: 'Done',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  hotel: 'bed-outline',
  transport: 'car-outline',
  activity: 'ticket-outline',
  shopping: 'bag-outline',
  nature: 'leaf-outline',
  culture: 'library-outline',
  nightlife: 'moon-outline',
};

const DEFAULT_CATEGORY_ICON: keyof typeof Ionicons.glyphMap = 'location-outline';

function getCategoryIcon(category: string | null): keyof typeof Ionicons.glyphMap {
  if (!category) return DEFAULT_CATEGORY_ICON;
  return CATEGORY_ICONS[category.toLowerCase()] ?? DEFAULT_CATEGORY_ICON;
}

interface StopRowProps {
  stop: Stop;
  onEdit?: (stop: Stop) => void;
  onDelete?: (stop: Stop) => void;
  onStatusChange?: (stop: Stop, newStatus: StopStatus) => void;
  drag?: () => void;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function StopRow({
  stop,
  onEdit,
  onDelete,
  onStatusChange,
  drag,
}: StopRowProps) {
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const statusColor = STATUS_COLORS[status];
  const statusLabel = STATUS_LABELS[status];

  const handleStatusPress = () => {
    const nextStatus = STATUS_CYCLE[status];
    onStatusChange?.(stop, nextStatus);
  };

  const handleLongPress = () => {
    Alert.alert(stop.name, undefined, [
      { text: 'Edit', onPress: () => onEdit?.(stop) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Stop',
            `Are you sure you want to delete "${stop.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete?.(stop),
              },
            ]
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPressIn={drag}
          style={styles.dragHandle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.categoryIconContainer, { borderColor: statusColor }]}>
          <Ionicons
            name={getCategoryIcon(stop.category)}
            size={18}
            color={statusColor}
          />
        </View>
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.stopName} numberOfLines={1}>
          {stop.name}
        </Text>
        <View style={styles.detailsRow}>
          {stop.planned_date ? (
            <Text style={styles.caption}>{formatDate(stop.planned_date)}</Text>
          ) : null}
          {stop.planned_date && stop.location ? (
            <Text style={styles.captionDot}> &middot; </Text>
          ) : null}
          {stop.location ? (
            <Text style={styles.captionGray} numberOfLines={1}>
              {stop.location}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.statusChip, { backgroundColor: `${statusColor}18` }]}
        onPress={handleStatusPress}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dragHandle: {
    padding: Spacing.xs,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  centerSection: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  stopName: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  caption: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.text,
  },
  captionDot: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  captionGray: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
