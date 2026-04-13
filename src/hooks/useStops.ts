import { useState, useEffect, useCallback } from 'react';
import type { Stop } from '../types';
import { getStops } from '../services/stopsService';

export function useStops(tripId: string | null) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!tripId) {
      setStops([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getStops(tripId);
      setStops(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stops');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stops, loading, error, refetch: fetch };
}
