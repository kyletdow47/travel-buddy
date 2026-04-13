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
import { Colors, Typography, Spacing } from '../constants/theme';
import { CategoryIcon } from './CategoryIcon';

type StopStatus = 'upcoming' | 'current' | 'done';

const STATUS_CYCLE: Record<StopStatus, StopStatus> = {
  upcoming: 'current',
  current: 'done',
  done: 'upcoming',
};

const STATUS_STYLES: Record<StopStatus, { bg: string; text: string }> = {
  upcoming: { bg: Colors.backgroundSecondary, text: Colors.textSecondary },
  current:  { bg: Colors.primary,             text: '#FFFFFF' },
  done:     { bg: Colors.success,             text: '#FFFFFF' },
};

const STATUS_LABELS: Record<StopStatus, string> = {
  upcoming: 'Upcoming',
  current: 'Current',
  done: 'Done',
};

interface StopRowProps {
  stop: Stop;
  onEdit?: (stop: Stop) => void;
  onDelete?: (stop: Stop) => void;
  onStatusChange?: (stop: Stop, newStatus: StopStatus) => void;
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
}: StopRowProps) {
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const statusStyle = STATUS_STYLES[status];
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
        <CategoryIcon category={stop.category} size={18} />
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
        style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}
        onPress={handleStatusPress}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
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
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
