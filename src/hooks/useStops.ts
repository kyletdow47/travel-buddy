import { useState, useEffect, useCallback } from 'react';
import { getStops } from '../services/stopsService';
import type { Stop } from '../types';

export function useStops(tripId: string | null) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
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
      setError(err instanceof Error ? err.message : 'Failed to load stops');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stops, loading, error, refetch };
}
