import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop, Trip } from '../../src/types';
import { StopRow } from '../../src/components/StopRow';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

// Mock data placeholder — swap for useTrips/useStops hooks when wired.
const MOCK_TRIPS: Trip[] = [];
const MOCK_STOPS: Stop[] = [];

const UNSCHEDULED_KEY = '__unscheduled__';

function formatDayHeader(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupStopsByDate(stops: Stop[]) {
  const grouped: Record<string, Stop[]> = {};
  stops.forEach((stop) => {
    const key = stop.planned_date ?? UNSCHEDULED_KEY;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(stop);
  });
  const sortedKeys = Object.keys(grouped)
    .filter((k) => k !== UNSCHEDULED_KEY)
    .sort();
  if (grouped[UNSCHEDULED_KEY]) sortedKeys.push(UNSCHEDULED_KEY);
  return { grouped, sortedKeys };
}

export default function PlanScreen() {
  const [trips] = useState<Trip[]>(MOCK_TRIPS);
  const [stops] = useState<Stop[]>(MOCK_STOPS);
  const [activeTripId, setActiveTripId] = useState<string | null>(
    trips[0]?.id ?? null,
  );

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId],
  );
  const tripStops = useMemo(
    () => (activeTripId ? stops.filter((s) => s.trip_id === activeTripId) : []),
    [stops, activeTripId],
  );
  const { grouped, sortedKeys } = useMemo(() => groupStopsByDate(tripStops), [tripStops]);

  if (trips.length === 0) {
    return <EmptyState title="No trips yet" subtitle="Create a trip to start planning its itinerary." />;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Trip selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorRow}
      >
        {trips.map((trip) => {
          const active = trip.id === activeTripId;
          return (
            <TouchableOpacity
              key={trip.id}
              activeOpacity={0.8}
              style={[styles.selectorChip, active && styles.selectorChipActive]}
              onPress={() => {
                haptics.selection();
                setActiveTripId(trip.id);
              }}
            >
              <Text
                style={[
                  styles.selectorText,
                  active && styles.selectorTextActive,
                ]}
                numberOfLines={1}
              >
                {trip.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Trip summary banner */}
      {activeTrip && (
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Ionicons name="airplane-outline" size={18} color={Colors.primary} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle} numberOfLines={1}>
              {activeTrip.name}
            </Text>
            <Text style={styles.summarySubtitle}>
              {activeTrip.start_date
                ? formatDayHeader(activeTrip.start_date)
                : 'Dates TBD'}
              {'  ·  '}
              {tripStops.length} stops
            </Text>
          </View>
        </View>
      )}

      {/* Day-grouped stop list with timeline */}
      {tripStops.length === 0 ? (
        <InlineEmpty />
      ) : (
        sortedKeys.map((key) => {
          const dayStops = grouped[key];
          const isUnscheduled = key === UNSCHEDULED_KEY;
          const dayIndex = sortedKeys.indexOf(key) + 1;

          return (
            <View key={key} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <View style={styles.dayHeaderLeft}>
                  {isUnscheduled ? (
                    <>
                      <Ionicons
                        name="help-circle-outline"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.dayHeaderTitle}>Unscheduled</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.dayHeaderTitle}>Day {dayIndex}</Text>
                      <Text style={styles.dayHeaderMeta}>· {formatDayHeader(key)}</Text>
                    </>
                  )}
                </View>
                <Text style={styles.dayHeaderCount}>
                  {dayStops.length} {dayStops.length === 1 ? 'stop' : 'stops'}
                </Text>
              </View>

              {/* Timeline + rows */}
              <View style={styles.timelineWrap}>
                {!isUnscheduled && <View style={styles.timelineLine} />}
                <View style={styles.rowsContainer}>
                  {dayStops.map((stop, idx) => (
                    <StopRow key={stop.id} stop={stop} index={idx} />
                  ))}
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function InlineEmpty() {
  return (
    <View style={styles.inlineEmpty}>
      <Ionicons name="location-outline" size={40} color={Colors.textTertiary} />
      <Text style={styles.inlineEmptyTitle}>No stops yet</Text>
      <Text style={styles.inlineEmptySubtitle}>
        Add your first stop to start planning your itinerary.
      </Text>
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
        <Ionicons name="add" size={18} color={Colors.surface} />
        <Text style={styles.ctaButtonText}>Add Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="map-outline" size={48} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // Trip selector
  selectorRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 200,
  },
  selectorChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectorText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectorTextActive: {
    color: Colors.surface,
  },

  // Trip summary
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  summarySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Day section
  daySection: {
    marginBottom: Spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dayHeaderTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  dayHeaderMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dayHeaderCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Timeline
  timelineWrap: {
    position: 'relative',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: Spacing.lg + 11,
    top: 0,
    bottom: Spacing.sm,
    width: 2,
    backgroundColor: Colors.primaryLight,
  },
  rowsContainer: {
    position: 'relative',
  },

  // Inline empty (for when trip exists but no stops)
  inlineEmpty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  inlineEmptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  inlineEmptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  ctaButtonText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },

  // Full empty state (no trips)
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.background,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
