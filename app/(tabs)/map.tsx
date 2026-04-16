import { useCallback, useMemo, useRef, useState } from 'react';
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
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../../src/types';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { useLocation } from '../../src/hooks/useLocation';
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

const CATEGORY_COLORS: Record<string, string> = {
  hotel: Colors.category.hotel,
  lodging: Colors.category.lodging,
  food: Colors.category.food,
  gas: Colors.category.gas,
  activity: Colors.category.activity,
  other: Colors.category.other,
};

function getCategoryColor(category: string | null | undefined): string {
  return CATEGORY_COLORS[(category ?? '').toLowerCase()] ?? Colors.category.other;
}

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

  const tripStops = useMemo(
    () => stops.filter((s) => s.lat != null && s.lng != null),
    [stops],
  );

  const mapRef = useRef<MapView>(null);
  const { location, loading: locationLoading, requestLocation } = useLocation();

  const initialRegion = useMemo(() => {
    if (tripStops.length > 0) {
      const lats = tripStops.map((s) => s.lat!);
      const lngs = tripStops.map((s) => s.lng!);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const padding = 0.02;
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat + padding, 0.01),
        longitudeDelta: Math.max(maxLng - minLng + padding, 0.01),
      };
    }
    return DEFAULT_REGION;
  }, [tripStops]);

  const fabScale = useMemo(() => new Animated.Value(1), []);
  const onFabPress = useCallback(async () => {
    haptics.light();
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, damping: 10 }),
    ]).start();

    const coords = await requestLocation();
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600,
      );
    }
  }, [fabScale, requestLocation]);

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

  const handleMarkerPress = useCallback((stop: Stop) => {
    haptics.selection();
    setSelectedStop(stop);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        customMapStyle={DARK_MAP_STYLE}
      >
        {tripStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat!, longitude: stop.lng! }}
            title={stop.name}
            description={stop.location ?? undefined}
            pinColor={getCategoryColor(stop.category)}
            onPress={() => handleMarkerPress(stop)}
          />
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
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
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

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
