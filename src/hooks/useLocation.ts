import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

interface Coords {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  location: Coords | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean | null;
  requestLocation: () => Promise<Coords | null>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const requestLocation = useCallback(async (): Promise<Coords | null> => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current) return null;

      const granted = status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        setError('Location permission denied');
        setLoading(false);
        return null;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!mounted.current) return null;

      const coords: Coords = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };
      setLocation(coords);
      setLoading(false);
      return coords;
    } catch (e) {
      if (!mounted.current) return null;
      const message = e instanceof Error ? e.message : 'Failed to get location';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  return { location, loading, error, permissionGranted, requestLocation };
}
