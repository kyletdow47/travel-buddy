import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, Region, type MapViewProps } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import type { Stop, Trip } from '../../src/types';
import { StopDetailSheet } from '../../src/components/StopDetailSheet';

// ─── helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  hotel:    '#6366F1',
  food:     '#F59E0B',
  gas:      '#10B981',
  activity: '#E86540',
  other:    '#6B7280',
};

function pinColor(category: string | null): string {
  return (category && CATEGORY_COLORS[category.toLowerCase()]) ?? '#6B7280';
}

function stopsWithCoords(stops: Stop[]): Stop[] {
  return stops.filter((s) => s.lat != null && s.lng != null);
}

function regionForStops(stops: Stop[]): Region | null {
  const pts = stopsWithCoords(stops);
  if (pts.length === 0) return null;

  const lats = pts.map((s) => s.lat as number);
  const lngs = pts.map((s) => s.lng as number);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = Math.max(0.05, (maxLat - minLat) * 1.4);
  const lngDelta = Math.max(0.05, (maxLng - minLng) * 1.4);

  return {
    latitude:  (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta:  latDelta,
    longitudeDelta: lngDelta,
  };
}

// ─── component ───────────────────────────────────────────────────────────────

export default function MapScreen() {
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { stops, loading: stopsLoading } = useStops(selectedTripId);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const mapRef = useRef<MapView>(null);

  // Auto-select first trip
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Request location permission and watch position
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission('denied');
        return;
      }
      setLocationPermission('granted');

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Animate map when stops change
  useEffect(() => {
    const region = regionForStops(stops);
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 600);
    }
  }, [stops]);

  const handleCenterOnMe = useCallback(() => {
    if (!userLocation) {
      Alert.alert(
        'Location unavailable',
        locationPermission === 'denied'
          ? 'Location permission was denied. Enable it in Settings to use this feature.'
          : 'Waiting for your location…'
      );
      return;
    }
    mapRef.current?.animateToRegion(
      {
        latitude:  userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta:  0.01,
        longitudeDelta: 0.01,
      },
      400
    );
  }, [userLocation, locationPermission]);

  const handleMarkerPress = useCallback((stop: Stop) => {
    setSelectedStop(stop);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedStop(null);
  }, []);

  // ── render loading ──
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
        <Text style={styles.emptySubtitle}>Create a trip on the Home tab first</Text>
      </View>
    );
  }

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;
  const mappableStops = stopsWithCoords(stops);
  const polylineCoords = mappableStops.map((s) => ({
    latitude:  s.lat as number,
    longitude: s.lng as number,
  }));

  const defaultRegion: Region = {
    latitude:  37.7749,
    longitude: -122.4194,
    latitudeDelta:  0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.root}>
      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={regionForStops(stops) ?? defaultRegion}
        showsUserLocation={locationPermission === 'granted'}
        showsMyLocationButton={false}
      >
        {/* Route polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={Colors.primary}
            strokeWidth={2.5}
            lineDashPattern={[6, 4]}
          />
        )}

        {/* Stop pins */}
        {mappableStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat as number, longitude: stop.lng as number }}
            title={stop.name}
            description={stop.location ?? undefined}
            pinColor={pinColor(stop.category)}
            onPress={() => handleMarkerPress(stop)}
          />
        ))}
      </MapView>

      {/* ── Trip selector chips ── */}
      <View style={styles.chipBar} pointerEvents="box-none">
        <View style={styles.chipScroll}>
          {trips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            return (
              <TouchableOpacity
                key={trip.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedTripId(trip.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextSelected]}
                  numberOfLines={1}
                >
                  {trip.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Stops count badge ── */}
      {!stopsLoading && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>
            {mappableStops.length === 0
              ? 'No stops with coordinates'
              : `${mappableStops.length} stop${mappableStops.length !== 1 ? 's' : ''} on map`}
          </Text>
        </View>
      )}

      {/* ── Center-on-me FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCenterOnMe}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ── Stop detail sheet ── */}
      <StopDetailSheet stop={selectedStop} onClose={handleCloseSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
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
    textAlign: 'center',
  },
  chipBar: {
    position: 'absolute',
    top: Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
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
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    bottom: 104,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Typography.caption.fontSize,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
