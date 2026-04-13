import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Trip } from '../types';
import type { ThemeColors } from '../hooks/useDarkColors';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
  onLongPress?: () => void;
  colors: ThemeColors;
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return '';
  const startDate = new Date(start);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (!end) return startDate.toLocaleDateString('en-US', options);
  const endDate = new Date(end);
  const endOptions: Intl.DateTimeFormatOptions =
    startDate.getFullYear() === endDate.getFullYear()
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', options)} – ${endDate.toLocaleDateString('en-US', endOptions)}, ${endDate.getFullYear()}`;
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'active': return Colors.primary;
    case 'completed': return Colors.success;
    default: return Colors.textSecondary;
  }
}

function getStatusLabel(status: string | null): string {
  switch (status) {
    case 'active': return 'Active';
    case 'completed': return 'Completed';
    default: return 'Upcoming';
  }
}

export function TripCard({ trip, onPress, onLongPress, colors }: TripCardProps) {
  const statusColor = getStatusColor(trip.status);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={[styles.stripe, { backgroundColor: statusColor }]} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {trip.name}
        </Text>
        {(trip.start_date || trip.end_date) && (
          <Text style={[styles.dates, { color: colors.textSecondary }]}>
            {formatDateRange(trip.start_date, trip.end_date)}
          </Text>
        )}
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
            <Text style={[styles.chipText, { color: statusColor }]}>
              {getStatusLabel(trip.status)}
            </Text>
          </View>
          {trip.budget != null && (
            <View style={[styles.chip, { backgroundColor: colors.border + '60', borderColor: colors.border }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                💰 ${trip.budget.toLocaleString()}
              </Text>
            </View>
          )}
          {trip.spent != null && trip.spent > 0 && (
            <View style={[styles.chip, { backgroundColor: colors.border + '60', borderColor: colors.border }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                spent ${trip.spent.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  stripe: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  name: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    marginBottom: 4,
  },
  dates: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    marginBottom: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
