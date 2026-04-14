import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../../src/types';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { MapPhotoMarker } from '../../src/components/MapPhotoMarker';
import { StopDetailSheet } from '../../src/components/StopDetailSheet';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

export default function MapScreen() {
  const { trips, loading: tripsLoading } = useTrips();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const resolvedTripId = activeTripId ?? trips[0]?.id ?? null;
  const activeTrip = useMemo(
    () => trips.find((t) => t.id === resolvedTripId) ?? null,
    [trips, resolvedTripId],
  );

  const {
    stops,
    loading: stopsLoading,
    cycleStatus,
    removeStop,
  } = useStops(resolvedTripId);

  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const tripStops = useMemo(
    () => stops.filter((s) => s.lat != null && s.lng != null),
    [stops],
  );

  const fabScale = useMemo(() => new Animated.Value(1), []);
  const onFabPress = () => {
    haptics.light();
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, damping: 10 }),
    ]).start();
  };

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

  return (
    <View style={styles.container}>
      {/* Map surface placeholder — full-screen MapView rendered here when wired. */}
      <View style={styles.mapSurface}>
        <View style={styles.mapPlaceholderCenter}>
          <Ionicons name="map-outline" size={48} color={Colors.primary} />
          <Text style={styles.mapPlaceholderText}>
            {tripStops.length > 0
              ? `${tripStops.length} stop${tripStops.length !== 1 ? 's' : ''} ready to render`
              : stops.length > 0
                ? 'Add coordinates to stops to see them on the map'
                : 'Map renders here when stops have coordinates'}
          </Text>
        </View>
        {/* Demo cluster of markers stacked visually to showcase design */}
        {tripStops.slice(0, 3).map((stop, idx) => (
          <TouchableOpacity
            key={stop.id}
            style={[styles.markerAnchor, { top: 120 + idx * 60, left: 40 + idx * 72 }]}
            activeOpacity={0.85}
            onPress={() => {
              haptics.selection();
              setSelectedStop(stop);
            }}
          >
            <MapPhotoMarker
              stop={stop}
              isSelected={selectedStop?.id === stop.id}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Trip context header (frosted chip strip) */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <View style={styles.chipStripBg}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipStripContent}
          >
            {trips.length === 0 ? (
              <View style={styles.emptyChip}>
                <Text style={styles.emptyChipText}>
                  {tripsLoading ? 'Loading trips…' : 'No trips to display'}
                </Text>
              </View>
            ) : (
              trips.map((trip) => {
                const active = trip.id === resolvedTripId;
                return (
                  <TouchableOpacity
                    key={trip.id}
                    activeOpacity={0.85}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      haptics.selection();
                      setActiveTripId(trip.id);
                    }}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                      numberOfLines={1}
                    >
                      {trip.name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Bottom context badge */}
      {activeTrip && (
        <View style={styles.bottomBadge} pointerEvents="none">
          <Text style={styles.bottomBadgeText}>
            {activeTrip.name} · {tripStops.length}{' '}
            {tripStops.length === 1 ? 'stop' : 'stops'} on map
          </Text>
        </View>
      )}

      {/* Center-on-me FAB */}
      <Animated.View
        style={[styles.fab, { transform: [{ scale: fabScale }] }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fabButton}
          onPress={onFabPress}
        >
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Stop detail sheet */}
      <StopDetailSheet
        stop={selectedStop}
        visible={!!selectedStop}
        onClose={() => setSelectedStop(null)}
        onStatusCycle={
          selectedStop
            ? () => handleStatusCycle(selectedStop)
            : undefined
        }
        onDelete={selectedStop ? () => handleDelete(selectedStop) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E6EEF5',
  },
  mapPlaceholderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  mapPlaceholderText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  markerAnchor: {
    position: 'absolute',
  },

  // Trip chip strip overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  chipStripBg: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    marginHorizontal: Spacing.sm,
    ...Shadows.sm,
    ...Platform.select({
      ios: {},
      android: { elevation: 3 },
    }),
  },
  chipStripContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    maxWidth: 200,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  chipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.surface,
  },
  emptyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Bottom badge
  bottomBadge: {
    position: 'absolute',
    bottom: 104,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    ...Shadows.sm,
  },
  bottomBadgeText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
});
