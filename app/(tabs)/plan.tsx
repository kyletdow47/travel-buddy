import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { reorderStops, updateStopStatus, deleteStop } from '../../src/services/stopsService';
import StopRow from '../../src/components/StopRow';
import type { Trip, Stop } from '../../src/types';

function getTripProgress(trip: Trip): { elapsed: number; total: number; fraction: number } {
  if (!trip.start_date || !trip.end_date) {
    return { elapsed: 0, total: 0, fraction: 0 };
  }
  const start = new Date(trip.start_date).getTime();
  const end = new Date(trip.end_date).getTime();
  const now = Date.now();
  const total = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const elapsed = Math.max(0, Math.min(total, Math.ceil((now - start) / (1000 * 60 * 60 * 24))));
  const fraction = Math.max(0, Math.min(1, elapsed / total));
  return { elapsed, total, fraction };
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return 'No dates set';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

type StatusKey = 'upcoming' | 'current' | 'done';

export default function PlanScreen() {
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { stops, loading: stopsLoading, refetch: refetchStops } = useStops(
    selectedTripId
  );

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  // Auto-select first trip when trips load
  React.useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  const handleDragEnd = useCallback(
    async ({ data }: { data: Stop[] }) => {
      const orderedIds = data.map((s) => s.id);
      try {
        await reorderStops(orderedIds);
        await refetchStops();
      } catch {
        // Refetch to restore original order on error
        await refetchStops();
      }
    },
    [refetchStops]
  );

  const handleStatusChange = useCallback(
    async (stop: Stop, newStatus: StatusKey) => {
      try {
        await updateStopStatus(stop.id, newStatus);
        await refetchStops();
      } catch {
        // Silently fail — UI will stay in sync on next refetch
      }
    },
    [refetchStops]
  );

  const handleDeleteStop = useCallback(
    async (stop: Stop) => {
      try {
        await deleteStop(stop.id);
        await refetchStops();
      } catch {
        // Silently fail
      }
    },
    [refetchStops]
  );

  const renderItem = useCallback(
    ({ item, drag }: RenderItemParams<Stop>) => (
      <StopRow
        stop={item}
        drag={drag}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteStop}
      />
    ),
    [handleStatusChange, handleDeleteStop]
  );

  const keyExtractor = useCallback((item: Stop) => item.id, []);

  if (tripsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="airplane-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a trip on the Home tab to start planning
        </Text>
      </View>
    );
  }

  const progress = selectedTrip ? getTripProgress(selectedTrip) : null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* Trip Selector Chips */}
        <View style={styles.chipSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            {trips.map((trip) => {
              const isSelected = trip.id === selectedTripId;
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedTripId(trip.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {trip.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Progress Bar */}
        {selectedTrip && (
          <View style={styles.progressSection}>
            <Text style={styles.dateRange}>
              {formatDateRange(selectedTrip.start_date, selectedTrip.end_date)}
            </Text>
            {progress && progress.total > 0 ? (
              <>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round(progress.fraction * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  Day {progress.elapsed} of {progress.total}
                </Text>
              </>
            ) : null}
          </View>
        )}

        {/* Stop List */}
        {stopsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : stops.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons
              name="location-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No stops yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to add your first stop
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={stops}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            containerStyle={styles.listContainer}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  chipSection: {
    paddingTop: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  chipScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.background,
  },
  progressSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dateRange: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
});
