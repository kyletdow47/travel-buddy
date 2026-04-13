import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Stop } from '../types';
import type { ThemeColors } from '../hooks/useDarkColors';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface StopRowProps {
  stop: Stop;
  onEdit?: (stop: Stop) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'upcoming' | 'current' | 'done') => void;
  colors: ThemeColors;
}

function getCategoryIcon(category: string | null): IoniconsName {
  switch (category) {
    case 'food': return 'restaurant';
    case 'hotel': return 'bed';
    case 'transport': return 'car';
    case 'activity': return 'flag';
    case 'shopping': return 'bag';
    case 'nature': return 'leaf';
    case 'culture': return 'school';
    case 'nightlife': return 'wine';
    default: return 'location';
  }
}

function getNextStatus(current: string | null): 'upcoming' | 'current' | 'done' {
  if (current === 'upcoming') return 'current';
  if (current === 'current') return 'done';
  return 'upcoming';
}

function getStatusColors(status: string | null, colors: ThemeColors): { bg: string; text: string; label: string } {
  switch (status) {
    case 'current': return { bg: Colors.primary + '20', text: Colors.primary, label: 'Current' };
    case 'done': return { bg: Colors.success + '20', text: Colors.success, label: 'Done' };
    default: return { bg: colors.border + '60', text: colors.textSecondary, label: 'Upcoming' };
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function StopRow({ stop, onEdit, onDelete, onStatusChange, colors }: StopRowProps) {
  const statusInfo = getStatusColors(stop.status, colors);

  function handleLongPress() {
    Alert.alert(stop.name, '', [
      { text: 'Edit', onPress: () => onEdit?.(stop) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Stop', `Delete "${stop.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(stop.id) },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleStatusPress() {
    const next = getNextStatus(stop.status);
    onStatusChange?.(stop.id, next);
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { borderColor: colors.border }]}>
        <Ionicons name={getCategoryIcon(stop.category)} size={20} color={Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {stop.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {[formatDate(stop.planned_date), stop.location].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.statusChip, { backgroundColor: statusInfo.bg }]}
        onPress={handleStatusPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  meta: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
