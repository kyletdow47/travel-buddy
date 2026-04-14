import { useCallback, useEffect, useState } from 'react';
import {
  getStops,
  createStop,
  updateStop,
  deleteStop,
  updateStopStatus,
} from '../services/stopsService';
import type { Stop, StopInsert } from '../types';

type State = {
  stops: Stop[];
  loading: boolean;
  error: string | null;
};

export function useStops(tripId: string | null) {
  const [state, setState] = useState<State>({
    stops: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!tripId) {
      setState({ stops: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const stops = await getStops(tripId);
      setState({ stops, loading: false, error: null });
    } catch (err) {
      setState({ stops: [], loading: false, error: String(err) });
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const addStop = useCallback(
    async (insert: StopInsert) => {
      const stop = await createStop(insert);
      setState((s) => ({ ...s, stops: [...s.stops, stop] }));
      return stop;
    },
    [],
  );

  const editStop = useCallback(
    async (id: string, updates: Partial<StopInsert>) => {
      const stop = await updateStop(id, updates);
      setState((s) => ({
        ...s,
        stops: s.stops.map((x) => (x.id === id ? stop : x)),
      }));
      return stop;
    },
    [],
  );

  const removeStop = useCallback(async (id: string) => {
    await deleteStop(id);
    setState((s) => ({ ...s, stops: s.stops.filter((x) => x.id !== id) }));
  }, []);

  const cycleStatus = useCallback(
    async (id: string, current: string | null) => {
      const next =
        current === 'upcoming' ? 'current' : current === 'current' ? 'done' : 'upcoming';
      const stop = await updateStopStatus(id, next as 'upcoming' | 'current' | 'done');
      setState((s) => ({
        ...s,
        stops: s.stops.map((x) => (x.id === id ? stop : x)),
      }));
      return stop;
    },
    [],
  );

  return { ...state, refresh: load, addStop, editStop, removeStop, cycleStatus };
}
