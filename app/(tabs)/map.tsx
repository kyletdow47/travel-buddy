import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { CategoryIcon, getCategoryColor } from '../../src/components/CategoryIcon';
import type { Stop } from '../../src/types';
import type { Region } from 'react-native-maps';

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const EDGE_PADDING = { top: 80, right: 40, bottom: 200, left: 40 };

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { stops, loading: stopsLoading } = useStops(selectedTripId);
  const [locationGranted, setLocationGranted] = useState(false);

  // Select first trip by default when trips load
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Enable location in Settings to see your position on the map.',
          [{ text: 'OK' }]
        );
      } else {
        setLocationGranted(true);
      }
    })();
  }, []);

  // Fit map to stop coordinates when stops change
  const stopsWithCoords = stops.filter(
    (s): s is Stop & { lat: number; lng: number } => s.lat !== null && s.lng !== null
  );

  const fitToStops = useCallback(() => {
    if (stopsWithCoords.length === 0 || !mapRef.current) return;

    const coords = stopsWithCoords.map((s) => ({
      latitude: s.lat,
      longitude: s.lng,
    }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: EDGE_PADDING,
      animated: true,
    });
  }, [stopsWithCoords]);

  useEffect(() => {
    if (stopsWithCoords.length > 0) {
      // Small delay to allow map to render before fitting
      const timer = setTimeout(fitToStops, 300);
      return () => clearTimeout(timer);
    }
  }, [stopsWithCoords.length, fitToStops]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  // Trip selector chips
  const renderTripSelector = () => {
    if (tripsLoading) return null;
    if (trips.length === 0) return null;

    return (
      <View style={styles.tripSelectorContainer}>
        {trips.map((trip) => (
          <Text
            key={trip.id}
            style={[
              styles.tripChip,
              trip.id === selectedTripId && styles.tripChipActive,
            ]}
            onPress={() => setSelectedTripId(trip.id)}
          >
            {trip.name}
          </Text>
        ))}
      </View>
    );
  };

  // Loading state
  if (tripsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
        showsUserLocation={locationGranted}
        showsMyLocationButton={false}
        showsCompass
        showsScale
      >
        {stopsWithCoords.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.lat,
              longitude: stop.lng,
            }}
            title={stop.name}
            description={stop.location ?? undefined}
          >
            <CategoryIcon category={stop.category} size={16} />
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{stop.name}</Text>
                {stop.location && (
                  <Text style={styles.calloutSubtitle}>{stop.location}</Text>
                )}
                {stop.category && (
                  <View style={styles.calloutCategoryRow}>
                    <View
                      style={[
                        styles.calloutCategoryDot,
                        { backgroundColor: getCategoryColor(stop.category) },
                      ]}
                    />
                    <Text style={styles.calloutCategory}>{stop.category}</Text>
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {renderTripSelector()}

      {/* Loading overlay for stops */}
      {stopsLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      {/* Empty state when no stops have coordinates */}
      {!stopsLoading && selectedTripId && stopsWithCoords.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>
            {stops.length === 0
              ? 'No stops yet — add stops in the Plan tab'
              : 'Add coordinates to your stops to see them on the map'}
          </Text>
        </View>
      )}

      {/* No trips state */}
      {!tripsLoading && trips.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>Create a trip first to see stops on the map</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  tripSelectorContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tripChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
    overflow: 'hidden',
  },
  tripChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  callout: {
    minWidth: 150,
    maxWidth: 250,
    padding: Spacing.sm,
  },
  calloutTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  calloutSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calloutCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  calloutCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  calloutCategory: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emptyOverlay: {
    position: 'absolute',
    top: '45%',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
