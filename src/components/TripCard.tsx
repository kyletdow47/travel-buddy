import { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Trip, Stop } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type TripStatus = 'active' | 'planning' | 'completed';
type CategoryKey = 'hotel' | 'food' | 'gas' | 'activity' | 'other';

type TripCardProps = {
  trip: Trip;
  stops?: Stop[];
  onPress?: () => void;
  onLongPress?: () => void;
};

const CATEGORY_META: Record<CategoryKey, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
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

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return 'Dates TBD';
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

function statusBadgeStyles(status: TripStatus) {
  switch (status) {
    case 'active':
      return { dot: Colors.success, bg: 'rgba(16,185,129,0.12)', label: 'Active' };
    case 'completed':
      return { dot: Colors.textSecondary, bg: 'rgba(107,114,128,0.12)', label: 'Completed' };
    case 'planning':
    default:
      return { dot: Colors.warning, bg: 'rgba(245,158,11,0.12)', label: 'Planning' };
  }
}

function budgetBarColor(percent: number) {
  if (percent >= 0.95) return Colors.error;
  if (percent >= 0.8) return Colors.warning;
  return Colors.primary;
}

function MapThumbnail({ stops }: { stops: Stop[] }) {
  const hasCoords = stops.some((s) => s.lat != null && s.lng != null);

  if (!hasCoords) {
    return (
      <View style={[styles.mapThumb, styles.mapPlaceholder]}>
        <Ionicons name="map-outline" size={28} color={Colors.primary} />
      </View>
    );
  }

  // Render a lightweight visual: colored dots connected by a dashed line
  return (
    <View style={[styles.mapThumb, styles.mapPlaceholder]}>
      <View style={styles.mapGrid}>
        {stops.slice(0, 5).map((stop, idx) => {
          const category = normalizeCategory(stop.category);
          const color = CATEGORY_META[category].color;
          return (
            <View
              key={stop.id ?? idx}
              style={[
                styles.mapDot,
                {
                  backgroundColor: color,
                  left: 14 + idx * 16,
                  top: 20 + ((idx % 3) * 16),
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

function TripCardBase({ trip, stops = [], onPress, onLongPress }: TripCardProps) {
  const status = (trip.status as TripStatus) ?? 'planning';
  const badge = statusBadgeStyles(status);

  const categories = useMemo(() => {
    const unique = new Set<CategoryKey>();
    stops.forEach((s) => unique.add(normalizeCategory(s.category)));
    return Array.from(unique);
  }, [stops]);

  const visibleCategories = categories.slice(0, 3);
  const overflowCount = Math.max(0, categories.length - visibleCategories.length);

  const budget = trip.budget ?? 0;
  const spent = trip.spent ?? 0;
  const showBudget = budget > 0;
  const percent = showBudget ? Math.min(1, spent / budget) : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.97}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
        <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
        <Text style={[styles.statusLabel, { color: badge.dot }]}>{badge.label}</Text>
      </View>

      <View style={styles.row}>
        {/* Left column */}
        <View style={styles.left}>
          <Text style={styles.title} numberOfLines={1}>
            {trip.name}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {formatDateRange(trip.start_date, trip.end_date)}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>
              {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
            </Text>
          </View>

          {showBudget && (
            <View style={styles.budget}>
              <Text style={styles.budgetText}>
                ${spent.toLocaleString()} spent of ${budget.toLocaleString()}
              </Text>
              <View style={styles.budgetTrack}>
                <View
                  style={[
                    styles.budgetFill,
                    { width: `${percent * 100}%`, backgroundColor: budgetBarColor(percent) },
                  ]}
                />
              </View>
            </View>
          )}

          {visibleCategories.length > 0 && (
            <View style={styles.tagRow}>
              {visibleCategories.map((key) => {
                const meta = CATEGORY_META[key];
                return (
                  <View
                    key={key}
                    style={[styles.tag, { backgroundColor: `${meta.color}1A` }]}
                  >
                    <Ionicons name={meta.icon} size={11} color={meta.color} />
                    <Text style={[styles.tagText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                );
              })}
              {overflowCount > 0 && (
                <View style={[styles.tag, { backgroundColor: Colors.border }]}>
                  <Text style={[styles.tagText, { color: Colors.textSecondary }]}>
                    +{overflowCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Right column */}
        <MapThumbnail stops={stops} />
      </View>
    </TouchableOpacity>
  );
}

export const TripCard = memo(TripCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.md,
  },
  left: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginRight: 80,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metaDot: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginHorizontal: 2,
  },
  budget: {
    marginBottom: Spacing.sm,
  },
  budgetText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  budgetTrack: {
    height: 4,
    borderRadius: Radius.xs,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: Radius.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 22,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
  },
  tagText: {
    ...Typography.micro,
  },
  mapThumb: {
    width: 100,
    height: 90,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    zIndex: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  statusLabel: {
    ...Typography.micro,
  },
});
