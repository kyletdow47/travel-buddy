import { useState, useEffect, useCallback } from 'react';
import type { Trip } from '../types';
import { getTrips } from '../services/tripsService';

interface UseTripsResult {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trips';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { trips, loading, error, refresh };
}
