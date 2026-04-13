import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Stop } from '../types';

type CategoryKey =
  | 'food'
  | 'hotel'
  | 'transport'
  | 'activity'
  | 'shopping'
  | 'nature'
  | 'culture'
  | 'nightlife';

const CATEGORY_ICONS: Record<CategoryKey, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  hotel: 'bed-outline',
  transport: 'car-outline',
  activity: 'bicycle-outline',
  shopping: 'bag-outline',
  nature: 'leaf-outline',
  culture: 'library-outline',
  nightlife: 'moon-outline',
};

type StatusKey = 'upcoming' | 'current' | 'done';

const STATUS_COLORS: Record<StatusKey, string> = {
  upcoming: Colors.textSecondary,
  current: Colors.primary,
  done: Colors.success,
};

const STATUS_LABELS: Record<StatusKey, string> = {
  upcoming: 'Upcoming',
  current: 'Current',
  done: 'Done',
};

const STATUS_CYCLE: Record<StatusKey, StatusKey> = {
  upcoming: 'current',
  current: 'done',
  done: 'upcoming',
};

interface StopRowProps {
  stop: Stop;
  onEdit?: (stop: Stop) => void;
  onDelete?: (stop: Stop) => void;
  onStatusChange?: (stop: Stop, newStatus: StatusKey) => void;
  drag?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StopRow({
  stop,
  onEdit,
  onDelete,
  onStatusChange,
  drag,
}: StopRowProps) {
  const category = (stop.category as CategoryKey) ?? 'activity';
  const iconName = CATEGORY_ICONS[category] ?? 'ellipse-outline';
  const status = (stop.status as StatusKey) ?? 'upcoming';
  const statusColor = STATUS_COLORS[status] ?? Colors.textSecondary;

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
      <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
        <Ionicons name="menu-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.iconContainer, { borderColor: statusColor }]}>
        <Ionicons name={iconName} size={18} color={statusColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {stop.name}
        </Text>
        <View style={styles.detailRow}>
          {stop.planned_date ? (
            <Text style={styles.detail}>{formatDate(stop.planned_date)}</Text>
          ) : null}
          {stop.planned_date && stop.location ? (
            <Text style={styles.detail}> · </Text>
          ) : null}
          {stop.location ? (
            <Text style={styles.detail} numberOfLines={1}>
              {stop.location}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.statusChip, { backgroundColor: statusColor + '1A' }]}
        onPress={handleStatusPress}
      >
        <Text style={[styles.statusText, { color: statusColor }]}>
          {STATUS_LABELS[status]}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dragHandle: {
    paddingRight: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detail: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
});
