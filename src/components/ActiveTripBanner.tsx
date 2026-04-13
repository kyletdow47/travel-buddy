import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Trip } from '../types';

interface ActiveTripBannerProps {
  trip: Trip;
}

function getDaysRemaining(endDate: string | null): string {
  if (!endDate) return 'No end date set';
  const now = new Date();
  const end = new Date(endDate);
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Trip has ended';
  if (diffDays === 0) return 'Last day!';
  return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
}

export function ActiveTripBanner({ trip }: ActiveTripBannerProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/plan');
  };

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Active trip: ${trip.name}. ${getDaysRemaining(trip.end_date)}. Tap to open.`}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="airplane" size={22} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.tripName} numberOfLines={1}>
          {trip.name}
        </Text>
        <Text style={styles.daysText}>{getDaysRemaining(trip.end_date)}</Text>
      </View>
      <View style={styles.openChip}>
        <Text style={styles.openChipText}>Open →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  tripName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daysText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  openChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  openChipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
