import { useState, useEffect, useCallback } from 'react';
import type { Stop } from '../types';
import { getStops } from '../services/stopsService';

interface UseStopsResult {
  stops: Stop[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStops(tripId: string | null): UseStopsResult {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!tripId) {
      setStops([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getStops(tripId);
      setStops(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stops';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stops, loading, error, refetch };
}
