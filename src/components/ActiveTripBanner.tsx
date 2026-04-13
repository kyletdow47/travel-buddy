import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { differenceInDays, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Trip } from '../types';

interface ActiveTripBannerProps {
  trip: Trip;
}

function getDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  return differenceInDays(parseISO(endDate), new Date());
}

function formatDaysLabel(days: number | null): string {
  if (days === null) return 'No end date set';
  if (days < 0) return 'Trip has ended';
  if (days === 0) return 'Last day!';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}

export default function ActiveTripBanner({ trip }: ActiveTripBannerProps) {
  const router = useRouter();
  const daysRemaining = getDaysRemaining(trip.end_date);

  const handlePress = () => {
    router.push('/plan');
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Active trip: ${trip.name}. ${formatDaysLabel(daysRemaining)}. Tap to open.`}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="airplane" size={24} color="#FFFFFF" />
      </View>

      <View style={styles.content}>
        <Text style={styles.tripName} numberOfLines={1}>
          {trip.name}
        </Text>
        <Text style={styles.daysLabel}>
          {formatDaysLabel(daysRemaining)}
        </Text>
      </View>

      <View style={styles.openButton}>
        <Text style={styles.openButtonText}>Open &rarr;</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.9,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  tripName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: '#FFFFFF',
  },
  daysLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  openButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  openButtonText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
