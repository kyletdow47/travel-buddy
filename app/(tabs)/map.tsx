import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Trip, Stop } from '../../src/types';
import { MapPhotoMarker } from '../../src/components/MapPhotoMarker';
import { StopDetailSheet } from '../../src/components/StopDetailSheet';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

// Placeholder data — swap for useTrips/useStops hooks when wired.
const MOCK_TRIPS: Trip[] = [];
const MOCK_STOPS: Stop[] = [];

export default function MapScreen() {
  const [trips] = useState<Trip[]>(MOCK_TRIPS);
  const [stops] = useState<Stop[]>(MOCK_STOPS);
  const [activeTripId, setActiveTripId] = useState<string | null>(
    trips[0]?.id ?? null,
  );
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId],
  );
  const tripStops = useMemo(
    () =>
      activeTripId
        ? stops.filter((s) => s.trip_id === activeTripId && s.lat != null && s.lng != null)
        : [],
    [stops, activeTripId],
  );

  const fabScale = useMemo(() => new Animated.Value(1), []);
  const onFabPress = () => {
    haptics.light();
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, damping: 10 }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Map surface placeholder — full-screen MapView rendered here when wired. */}
      <View style={styles.mapSurface}>
        <View style={styles.mapPlaceholderCenter}>
          <Ionicons name="map-outline" size={48} color={Colors.primary} />
          <Text style={styles.mapPlaceholderText}>
            {tripStops.length > 0
              ? `${tripStops.length} stops ready to render`
              : 'Map renders here when stops have coordinates'}
          </Text>
        </View>
        {/* Demo cluster of markers stacked visually to showcase design */}
        {tripStops.slice(0, 3).map((stop, idx) => (
          <View
            key={stop.id ?? idx}
            style={[styles.markerAnchor, { top: 120 + idx * 60, left: 40 + idx * 72 }]}
          >
            <MapPhotoMarker
              stop={stop}
              isSelected={selectedStop?.id === stop.id}
            />
          </View>
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
                <Text style={styles.emptyChipText}>No trips to display</Text>
              </View>
            ) : (
              trips.map((trip) => {
                const active = trip.id === activeTripId;
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
    borderWidth: 1,
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
