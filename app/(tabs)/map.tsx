import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import type { Stop } from '../../src/types';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { MapPhotoMarker } from '../../src/components/MapPhotoMarker';
import { EditStopModal } from '../../src/components/EditStopModal';
import { StopDetailSheet } from '../../src/components/StopDetailSheet';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

const DEFAULT_REGION: Region = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

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
    editStop,
  } = useStops(resolvedTripId);

  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [locating, setLocating] = useState(false);

  const tripStops = useMemo(
    () => stops.filter((s) => s.lat != null && s.lng != null),
    [stops],
  );

  const mapRef = useRef<MapView>(null);
  const fabScale = useMemo(() => new Animated.Value(1), []);

  const initialRegion = useMemo((): Region => {
    if (tripStops.length === 0) return DEFAULT_REGION;
    const lats = tripStops.map((s) => s.lat!);
    const lngs = tripStops.map((s) => s.lng!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.02),
      longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.02),
    };
  }, [tripStops]);

  useEffect(() => {
    if (tripStops.length === 0) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        tripStops.map((s) => ({ latitude: s.lat!, longitude: s.lng! })),
        { edgePadding: { top: 120, right: 60, bottom: 160, left: 60 }, animated: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [resolvedTripId, tripStops]);

  const onFabPress = useCallback(async () => {
    haptics.light();
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, damping: 10 }),
    ]).start();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Enable location access in Settings to center the map on your position.',
        );
        return;
      }

      setLocating(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600,
      );
    } catch {
      Alert.alert('Location Error', 'Unable to determine your location. Please try again.');
    } finally {
      setLocating(false);
    }
  }, [fabScale]);

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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
        onPress={() => setSelectedStop(null)}
      >
        {tripStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat!, longitude: stop.lng! }}
            onPress={() => {
              haptics.selection();
              setSelectedStop(stop);
            }}
          >
            <MapPhotoMarker
              stop={stop}
              isSelected={selectedStop?.id === stop.id}
            />
          </Marker>
        ))}
      </MapView>

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
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="locate" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Edit Stop Modal */}
      <EditStopModal
        visible={editingStop !== null}
        stop={editingStop}
        onClose={() => setEditingStop(null)}
        onSave={editStop}
      />

      {/* Stop detail sheet */}
      <StopDetailSheet
        stop={selectedStop}
        visible={!!selectedStop}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Trip chip strip overlay
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  chipStripBg: {
    backgroundColor: Colors.frostedDark,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    marginHorizontal: Spacing.sm,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
    ...Shadows.md,
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
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
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
    color: '#FFFFFF',
  },
  emptyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyChipText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // Bottom badge
  bottomBadge: {
    position: 'absolute',
    bottom: 104,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.frostedDarkStrong,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  bottomBadgeText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
});
