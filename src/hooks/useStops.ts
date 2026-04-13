import { useEffect, useState, useCallback } from 'react';
import { getStops } from '../services/stopsService';
import type { Stop } from '../types';

export function useStops(tripId: string | null) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!tripId) {
      setStops([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getStops(tripId);
      setStops(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stops, loading, error, refetch };
}
