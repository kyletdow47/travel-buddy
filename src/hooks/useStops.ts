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

  const fetchStops = useCallback(async () => {
    if (!tripId) {
      setStops([]);
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
    fetchStops();
  }, [fetchStops]);

  return { stops, loading, error, refetch: fetchStops };
}
