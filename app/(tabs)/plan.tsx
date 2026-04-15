import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { StopRow } from '../../src/components/StopRow';
import { CompactStopRow } from '../../src/components/CompactStopRow';
import { AddStopModal } from '../../src/components/AddStopModal';
import { EditStopModal } from '../../src/components/EditStopModal';
import { StopDetailSheet } from '../../src/components/StopDetailSheet';
import { AnimatedEnter } from '../../src/components/AnimatedEnter';
import { Skeleton } from '../../src/components/SkeletonLoader';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';
import type { Stop } from '../../src/types';

const UNSCHEDULED_KEY = '__unscheduled__';

function formatDayHeader(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
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
  const { trips, loading: tripsLoading, refresh: refreshTrips } = useTrips();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  // Resolve active trip — default to first trip after load
  const resolvedTripId = activeTripId ?? trips[0]?.id ?? null;
  const activeTrip = useMemo(
    () => trips.find((t) => t.id === resolvedTripId) ?? null,
    [trips, resolvedTripId],
  );

  const {
    stops,
    loading: stopsLoading,
    refresh: refreshStops,
    addStop,
    cycleStatus,
    removeStop,
    editStop,
  } = useStops(resolvedTripId);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [compactView, setCompactView] = useState(false);

  const { grouped, sortedKeys } = useMemo(() => groupStopsByDate(stops), [stops]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshTrips(), refreshStops()]);
  }, [refreshTrips, refreshStops]);

  const handleStatusCycle = useCallback(
    async (stop: Stop) => {
      haptics.selection();
      await cycleStatus(stop.id, stop.status);
    },
    [cycleStatus],
  );

  const handleDelete = useCallback(
    (stop: Stop) => {
      Alert.alert('Delete stop', `Remove "${stop.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            setSelectedStop(null);
            await removeStop(stop.id);
          },
        },
      ]);
    },
    [removeStop],
  );

  const handleChangeDate = useCallback(
    async (newDate: string | null) => {
      if (!selectedStop) return;
      haptics.selection();
      await editStop(selectedStop.id, { planned_date: newDate });
      // Update the selected stop in local state so the sheet reflects the change
      setSelectedStop((prev) =>
        prev ? { ...prev, planned_date: newDate } : null,
      );
    },
    [selectedStop, editStop],
  );

  const loading = tripsLoading || stopsLoading;

  // ── Empty: no trips at all
  if (!tripsLoading && trips.length === 0) {
    return (
      <SafeAreaView style={styles.fill} edges={['top']}>
        <FullEmpty />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      {/* Trip selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorRow}
        style={styles.selectorScroll}
      >
        {trips.map((trip) => {
          const active = trip.id === resolvedTripId;
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
                style={[styles.selectorText, active && styles.selectorTextActive]}
                numberOfLines={1}
              >
                {trip.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Trip meta banner */}
      {activeTrip && (
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {activeTrip.name}
            </Text>
            <Text style={styles.bannerMeta}>
              {activeTrip.start_date
                ? formatDayHeader(activeTrip.start_date)
                : 'Dates TBD'}
              {stops.length > 0 ? `  ·  ${stops.length} stop${stops.length !== 1 ? 's' : ''}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewToggle}
            activeOpacity={0.8}
            onPress={() => {
              haptics.selection();
              setCompactView((v) => !v);
            }}
          >
            <Ionicons
              name={compactView ? 'list' : 'reorder-three'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addFAB}
            activeOpacity={0.85}
            onPress={() => {
              haptics.medium();
              setAddModalOpen(true);
            }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Stop list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading && stops.length === 0 ? (
          <StopsSkeleton />
        ) : stops.length === 0 ? (
          <InlineEmpty onAdd={() => setAddModalOpen(true)} />
        ) : (
          sortedKeys.map((key, sectionIdx) => {
            const dayStops = grouped[key];
            const isUnscheduled = key === UNSCHEDULED_KEY;
            const dayNumber = sortedKeys.filter((k) => k !== UNSCHEDULED_KEY).indexOf(key) + 1;

            return (
              <AnimatedEnter key={key} delay={sectionIdx * 60}>
                <View style={styles.daySection}>
                  {/* Day header */}
                  <View style={styles.dayHeader}>
                    <View style={styles.dayHeaderLeft}>
                      {isUnscheduled ? (
                        <>
                          <Ionicons
                            name="help-circle-outline"
                            size={16}
                            color={Colors.textTertiary}
                          />
                          <Text style={styles.dayHeaderTitle}>Unscheduled</Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.dayBadge}>
                            <Text style={styles.dayBadgeText}>{dayNumber}</Text>
                          </View>
                          <Text style={styles.dayHeaderTitle}>
                            {formatDayHeader(key)}
                          </Text>
                        </>
                      )}
                    </View>
                    <Text style={styles.dayCount}>
                      {dayStops.length} {dayStops.length === 1 ? 'stop' : 'stops'}
                    </Text>
                  </View>

                  {/* Stops */}
                  {dayStops.map((stop, idx) =>
                    compactView ? (
                      <CompactStopRow
                        key={stop.id}
                        stop={stop}
                        index={idx}
                        showConnector={idx < dayStops.length - 1}
                        onPress={() => {
                          haptics.selection();
                          setSelectedStop(stop);
                        }}
                        onStatusPress={() => handleStatusCycle(stop)}
                      />
                    ) : (
                      <StopRow
                        key={stop.id}
                        stop={stop}
                        index={idx}
                        showConnector={idx < dayStops.length - 1}
                        onPress={() => {
                          haptics.selection();
                          setSelectedStop(stop);
                        }}
                        onStatusPress={() => handleStatusCycle(stop)}
                      />
                    ),
                  )}
                </View>
              </AnimatedEnter>
            );
          })
        )}
      </ScrollView>

      {/* Add Stop Modal */}
      {resolvedTripId && (
        <AddStopModal
          visible={addModalOpen}
          tripId={resolvedTripId}
          onClose={() => setAddModalOpen(false)}
          onAdd={addStop}
        />
      )}

      {/* Edit Stop Modal */}
      <EditStopModal
        visible={editingStop !== null}
        stop={editingStop}
        onClose={() => setEditingStop(null)}
        onSave={editStop}
      />

      {/* Stop Detail Sheet */}
      <StopDetailSheet
        stop={selectedStop}
        visible={selectedStop !== null}
        onClose={() => setSelectedStop(null)}
        onEdit={() => {
          setEditingStop(selectedStop);
          setSelectedStop(null);
        }}
        onStatusCycle={
          selectedStop
            ? () => handleStatusCycle(selectedStop)
            : undefined
        }
        onDelete={selectedStop ? () => handleDelete(selectedStop) : undefined}
        onChangeDate={handleChangeDate}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StopsSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} width="100%" height={72} borderRadius={16} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

function InlineEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.inlineEmpty}>
      <Ionicons name="location-outline" size={44} color={Colors.textOnCardTertiary} />
      <Text style={styles.inlineEmptyTitle}>No stops yet</Text>
      <Text style={styles.inlineEmptySubtitle}>
        Add flights, hotels, activities and more to build your itinerary.
      </Text>
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onAdd}>
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.ctaText}>Add First Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

function FullEmpty() {
  return (
    <View style={styles.fullEmpty}>
      <Ionicons name="map-outline" size={56} color={Colors.textTertiary} />
      <Text style={styles.fullEmptyTitle}>No trips yet</Text>
      <Text style={styles.fullEmptySubtitle}>
        Create a trip from the Home tab to start planning your itinerary.
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Trip selector
  selectorScroll: {
    flexGrow: 0,
  },
  selectorRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
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
    color: '#FFFFFF',
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  bannerLeft: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  bannerMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  addFAB: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Day section
  daySection: {
    marginBottom: Spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    ...Typography.micro,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayHeaderTitle: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.text,
  },
  dayCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // Skeletons
  skeletonWrap: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  skeletonRow: {
    marginBottom: 0,
  },

  // Inline empty
  inlineEmpty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  inlineEmptyTitle: {
    ...Typography.h3,
    color: Colors.textOnCard,
    marginTop: Spacing.xs,
  },
  inlineEmptySubtitle: {
    ...Typography.body,
    color: Colors.textOnCardSecondary,
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
  ctaText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Full empty (no trips)
  fullEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  fullEmptyTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  fullEmptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
