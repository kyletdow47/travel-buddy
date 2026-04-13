import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { CategoryIcon, getCategoryColor } from '../../src/components/CategoryIcon';
import type { Stop } from '../../src/types';

interface Coordinate {
  latitude: number;
  longitude: number;
}

function getStopsWithCoords(stops: Stop[]): Stop[] {
  return stops.filter(
    (s): s is Stop & { lat: number; lng: number } =>
      s.lat !== null && s.lng !== null
  );
}

function stopsToCoordinates(stops: Stop[]): Coordinate[] {
  return getStopsWithCoords(stops).map((s) => ({
    latitude: s.lat as number,
    longitude: s.lng as number,
  }));
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { stops, loading: stopsLoading } = useStops(selectedTripId);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Auto-select the first trip
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
      } else {
        Alert.alert(
          'Location Permission',
          'Enable location in Settings to see your position on the map.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  // Fit map to stops when they change
  useEffect(() => {
    const coords = stopsToCoordinates(stops);
    if (coords.length > 0 && mapRef.current) {
      // Small delay to ensure map is rendered
      const timeout = setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
          animated: true,
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [stops]);

  const handleCenterOnMe = useCallback(async () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission',
        'Enable location in Settings to use this feature.',
        [{ text: 'OK' }]
      );
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
        500
      );
    } catch {
      Alert.alert('Error', 'Unable to get current location.');
    }
  }, [locationPermission]);

  const stopsWithCoords = getStopsWithCoords(stops);
  const polylineCoords = stopsToCoordinates(stops);
  const isLoading = tripsLoading || stopsLoading;

  // Render loading state
  if (isLoading && trips.length === 0) {
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
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        showsCompass={true}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {stopsWithCoords.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.lat as number,
              longitude: stop.lng as number,
            }}
            title={stop.name}
            description={stop.location ?? undefined}
          >
            <CategoryIcon category={stop.category} size={32} />
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{stop.name}</Text>
                {stop.location ? (
                  <Text style={styles.calloutSubtitle}>{stop.location}</Text>
                ) : null}
                {stop.category ? (
                  <Text style={styles.calloutCategory}>{stop.category}</Text>
                ) : null}
              </View>
            </Callout>
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

      {/* Trip Selector Chips */}
      {trips.length > 0 && (
        <View style={styles.chipContainer}>
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
                  style={[styles.chip, isSelected && styles.chipSelected]}
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
      )}

      {/* Empty State Overlays */}
      {!isLoading && trips.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="airplane-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Create a trip first</Text>
          <Text style={styles.emptySubtext}>
            Head to the Home tab to add your first trip
          </Text>
        </View>
      )}

      {!isLoading && trips.length > 0 && stops.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No stops yet</Text>
          <Text style={styles.emptySubtext}>
            Add stops in the Plan tab to see them on the map
          </Text>
        </View>
      )}

      {!isLoading && stops.length > 0 && stopsWithCoords.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="navigate-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No coordinates</Text>
          <Text style={styles.emptySubtext}>
            Add coordinates to your stops to see them on the map
          </Text>
        </View>
      )}

      {/* Location Permission Denied Banner */}
      {!locationPermission && (
        <View style={styles.permissionBanner}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.permissionText}>
            Location disabled — enable in Settings
          </Text>
        </View>
      )}

      {/* Center on Me FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCenterOnMe}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={22} color={Colors.primary} />
      </TouchableOpacity>

      {/* Loading indicator for stop changes */}
      {stopsLoading && stops.length > 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
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
  },
  chipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 16,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chipScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
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
  callout: {
    minWidth: 150,
    padding: Spacing.xs,
  },
  calloutTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  calloutSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  calloutCategory: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  emptyOverlay: {
    position: 'absolute',
    top: '40%',
    left: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  permissionBanner: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.md,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  permissionText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loadingOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 70,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: Spacing.sm,
    borderRadius: Radius.full,
  },
});
