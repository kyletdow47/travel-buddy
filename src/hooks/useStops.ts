import { useState, useEffect, useCallback } from 'react';
import type { Stop } from '../types';
import { getStops } from '../services/stopsService';

interface UseStopsResult {
  stops: Stop[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStops(tripId: string | null): UseStopsResult {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tripId) {
      setStops([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
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
    refresh();
  }, [refresh]);

  return { stops, loading, error, refresh };
}
