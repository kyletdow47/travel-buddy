import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import type { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import type BottomSheet from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import CategoryIcon, { getCategoryColor } from '../../src/components/CategoryIcon';
import StopDetailSheet from '../../src/components/StopDetailSheet';
import type { Stop } from '../../src/types';

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { stops, loading: stopsLoading } = useStops(selectedTripId);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);

  // Auto-select first trip
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
      }
    })();
  }, []);

  // Stops with valid coordinates
  const mappableStops = useMemo(
    () => stops.filter((s): s is Stop & { lat: number; lng: number } => s.lat != null && s.lng != null),
    [stops],
  );

  // Route polyline coordinates sorted by sort_order
  const polylineCoords = useMemo(
    () =>
      mappableStops
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((s) => ({ latitude: s.lat, longitude: s.lng })),
    [mappableStops],
  );

  // Fit map to all pins after stops load
  useEffect(() => {
    if (mappableStops.length === 0) return;
    const coords = mappableStops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
        animated: true,
      });
    }, 300);
  }, [mappableStops]);

  const handleCenterOnMe = useCallback(async () => {
    if (!locationGranted) {
      Alert.alert('Location Access', 'Enable location in Settings to use this feature.');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    } catch {
      Alert.alert('Error', 'Could not get your current location.');
    }
  }, [locationGranted]);

  const handleMarkerPress = useCallback((stop: Stop) => {
    setSelectedStop(stop);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setSelectedStop(null);
  }, []);

  const isLoading = tripsLoading || stopsLoading;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={locationGranted}
        showsMyLocationButton={false}
      >
        {mappableStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            onPress={() => handleMarkerPress(stop)}
          >
            <CategoryIcon category={stop.category} size={32} />
          </Marker>
        ))}

        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Trip selector chips */}
      {trips.length > 0 && (
        <View style={styles.chipContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {trips.map((trip) => {
              const isActive = trip.id === selectedTripId;
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedTripId(trip.id)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {trip.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      {/* Empty state overlay */}
      {!isLoading && trips.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="map-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Trips Yet</Text>
          <Text style={styles.emptySubtitle}>Create a trip first to see stops on the map.</Text>
        </View>
      )}

      {!isLoading && trips.length > 0 && mappableStops.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Map Pins</Text>
          <Text style={styles.emptySubtitle}>
            Add coordinates to your stops to see them on the map.
          </Text>
        </View>
      )}

      {/* Location denied banner */}
      {!locationGranted && !isLoading && (
        <View style={styles.locationBanner}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.locationBannerText}>
            Enable location in Settings to see your position.
          </Text>
        </View>
      )}

      {/* Center on me FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCenterOnMe}>
        <Ionicons name="navigate" size={22} color={Colors.primary} />
      </TouchableOpacity>

      {/* Stop detail bottom sheet */}
      <StopDetailSheet sheetRef={sheetRef} stop={selectedStop} onDismiss={handleSheetDismiss} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  chipContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
  },
  chipScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: Spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emptyOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.background}E6`,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  locationBanner: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.md,
    right: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.warning}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: Spacing.sm,
  },
  locationBannerText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    flex: 1,
  },
});
