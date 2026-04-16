import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  coords: LocationCoords | null;
  loading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
};

/**
 * Hook for managing device location — permissions, one-shot fetch, and continuous watching.
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  /** Request foreground permission (idempotent — returns cached status if already granted). */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setState((s) => ({ ...s, permissionStatus: status }));
    return status === Location.PermissionStatus.GRANTED;
  }, []);

  /** Fetch current location once. Requests permission if not yet granted. */
  const locate = useCallback(async (): Promise<LocationCoords | null> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const granted = await requestPermission();
    if (!granted) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Location permission denied',
      }));
      return null;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setState((s) => ({ ...s, coords, loading: false, error: null }));
      return coords;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, loading: false, error: message }));
      return null;
    }
  }, [requestPermission]);

  /** Start watching location in the background. Automatically requests permission. */
  const startWatching = useCallback(async () => {
    if (watchRef.current) return; // already watching

    const granted = await requestPermission();
    if (!granted) {
      setState((s) => ({
        ...s,
        error: 'Location permission denied',
      }));
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10, // metres between updates
      },
      (position) => {
        setState((s) => ({
          ...s,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
        }));
      },
    );
  }, [requestPermission]);

  /** Stop watching location. */
  const stopWatching = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  return {
    ...state,
    locate,
    startWatching,
    stopWatching,
  };
}
