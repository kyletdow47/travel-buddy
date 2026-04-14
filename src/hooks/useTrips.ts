import { useCallback, useEffect, useState } from 'react';
import { getTrips } from '../services/tripsService';
import type { Trip } from '../types';

type State = {
  trips: Trip[];
  loading: boolean;
  error: string | null;
};

export function useTrips() {
  const [state, setState] = useState<State>({
    trips: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const trips = await getTrips();
      setState({ trips, loading: false, error: null });
    } catch (err) {
      setState({ trips: [], loading: false, error: String(err) });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
