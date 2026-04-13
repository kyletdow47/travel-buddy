import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import type { Trip } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

type TripStatus = 'upcoming' | 'active' | 'completed';

const STATUS_COLORS: Record<TripStatus, string> = {
  upcoming: '#6B7280',
  active: '#10B981',
  completed: '#374151',
};

const STATUS_LABELS: Record<TripStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
};

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return 'No dates set';
  const start = startDate ? format(parseISO(startDate), 'MMM d') : '?';
  const end = endDate ? format(parseISO(endDate), 'MMM d') : '?';
  if (startDate && endDate) return `${start} \u2013 ${end}`;
  if (startDate) return `From ${start}`;
  return `Until ${end}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getStatus(trip: Trip): TripStatus {
  const status = trip.status as TripStatus | null;
  if (status && status in STATUS_COLORS) return status;
  return 'upcoming';
}

export default function TripCard({ trip, onPress, onEdit, onDelete }: TripCardProps) {
  const status = getStatus(trip);
  const spent = trip.spent ?? 0;
  const budget = trip.budget ?? 0;
  const progress = budget > 0 ? Math.min(spent / budget, 1) : 0;

  const showActionSheet = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit Trip', 'Delete Trip'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onEdit();
          if (buttonIndex === 2) onDelete();
        },
      );
    } else {
      Alert.alert('Trip Options', undefined, [
        { text: 'Edit Trip', onPress: onEdit },
        { text: 'Delete Trip', onPress: onDelete, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [onEdit, onDelete]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={showActionSheet}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Top row: trip name + status badge */}
      <View style={styles.topRow}>
        <Text style={styles.tripName} numberOfLines={1}>
          {trip.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABELS[status]}</Text>
        </View>
      </View>

      {/* Middle row: date range */}
      <Text style={styles.dateRange}>
        {formatDateRange(trip.start_date, trip.end_date)}
      </Text>

      {/* Bottom row: budget progress */}
      <View style={styles.budgetSection}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.budgetText}>
          {budget > 0
            ? `${formatCurrency(spent)} / ${formatCurrency(budget)}`
            : 'No budget set'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tripName: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateRange: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  budgetSection: {
    gap: Spacing.xs,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  budgetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
