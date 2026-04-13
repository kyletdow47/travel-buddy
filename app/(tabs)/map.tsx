import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { CategoryIcon } from '../../src/components/CategoryIcon';
import { StopDetailSheet } from '../../src/components/StopDetailSheet';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import type { Stop, Trip } from '../../src/types';

type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const EDGE_PADDING = { top: 80, right: 40, bottom: 200, left: 40 };

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { stops, loading: stopsLoading } = useStops(selectedTripId);

  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>('undetermined');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  // Auto-select first trip when trips load
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted' ? 'granted' : 'denied');
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  // Filter stops that have coordinates
  const mappableStops = useMemo(
    () => stops.filter((s): s is Stop & { lat: number; lng: number } => s.lat != null && s.lng != null),
    [stops]
  );

  // Polyline coordinates (only when 2+ stops)
  const polylineCoords = useMemo(
    () =>
      mappableStops.length >= 2
        ? mappableStops.map((s) => ({ latitude: s.lat, longitude: s.lng }))
        : [],
    [mappableStops]
  );

  // Fit map to stop coordinates
  useEffect(() => {
    if (mappableStops.length === 0) return;
    const coords = mappableStops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, { edgePadding: EDGE_PADDING, animated: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [mappableStops]);

  const handleMarkerPress = useCallback((stop: Stop) => {
    setSelectedStop(stop);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleDismissSheet = useCallback(() => {
    setSelectedStop(null);
  }, []);

  const handleCenterOnMe = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      {
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [userLocation]);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const handleSelectTrip = useCallback((tripId: string) => {
    setSelectedTripId(tripId);
    setSelectedStop(null);
    bottomSheetRef.current?.close();
  }, []);

  const isLoading = tripsLoading || stopsLoading;

  // --- EDGE CASE: Loading state ---
  if (isLoading && trips.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // --- EDGE CASE: No trips ---
  if (!tripsLoading && trips.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="airplane-outline" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>No Trips Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a trip first to see your stops on the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={locationPermission === 'granted'}
        showsMyLocationButton={false}
        showsCompass
      >
        {mappableStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={stop.name}
            description={stop.location ?? undefined}
            onPress={() => handleMarkerPress(stop)}
          >
            <View style={styles.markerContainer}>
              <CategoryIcon category={stop.category} size={18} />
            </View>
          </Marker>
        ))}

        {polylineCoords.length >= 2 ? (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        ) : null}
      </MapView>

      {/* Trip selector chips */}
      <View style={[styles.tripSelectorContainer, { top: insets.top + Spacing.sm }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripSelectorContent}>
          {trips.map((trip: Trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripChip,
                selectedTripId === trip.id && styles.tripChipActive,
              ]}
              onPress={() => handleSelectTrip(trip.id)}
            >
              <Text
                style={[
                  styles.tripChipText,
                  selectedTripId === trip.id && styles.tripChipTextActive,
                ]}
                numberOfLines={1}
              >
                {trip.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- EDGE CASE: Location permission denied banner --- */}
      {locationPermission === 'denied' ? (
        <TouchableOpacity
          style={[styles.permissionBanner, { top: insets.top + 52 }]}
          onPress={handleOpenSettings}
        >
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.permissionBannerText}>
            Location access denied.{' '}
            <Text style={styles.permissionBannerLink}>Enable in Settings</Text>
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* --- EDGE CASE: No stops with coordinates --- */}
      {!stopsLoading && mappableStops.length === 0 && selectedTripId ? (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyOverlayCard}>
            <Ionicons name="map-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.emptyOverlayTitle}>
              {stops.length === 0
                ? 'No Stops Yet'
                : 'No Coordinates'}
            </Text>
            <Text style={styles.emptyOverlaySubtitle}>
              {stops.length === 0
                ? 'Add stops to your trip to see them on the map.'
                : 'Add coordinates to your stops to see them on the map.'}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Loading indicator for stops */}
      {stopsLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : null}

      {/* Center-on-me FAB */}
      {locationPermission === 'granted' ? (
        <TouchableOpacity
          style={[styles.centerFab, { bottom: insets.bottom + 100 }]}
          onPress={handleCenterOnMe}
        >
          <Ionicons name="compass-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      ) : null}

      {/* Stop detail bottom sheet */}
      <StopDetailSheet
        ref={bottomSheetRef}
        stop={selectedStop}
        onDismiss={handleDismissSheet}
      />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  // Trip selector
  tripSelectorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tripSelectorContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tripChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tripChipActive: {
    backgroundColor: Colors.primary,
  },
  tripChipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  tripChipTextActive: {
    color: Colors.background,
  },
  // Permission banner
  permissionBanner: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  permissionBannerText: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    color: Colors.text,
  },
  permissionBannerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Empty state overlay
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  emptyOverlayCard: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emptyOverlayTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyOverlaySubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
  },
  // Center-on-me FAB
  centerFab: {
    position: 'absolute',
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
  // Marker
  markerContainer: {
    backgroundColor: Colors.background,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
