import { useEffect, useState, useCallback } from 'react';
import { getTrips } from '../services/tripsService';
import type { Trip } from '../types';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { trips, loading, error, refetch };
}
