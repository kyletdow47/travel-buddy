import { useCallback, useEffect, useState } from 'react';
import {
  getStops,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
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

  /**
   * Reorder a single day's stops while preserving the order of all other days.
   *
   * `dayKey` is the planned_date ISO string for the affected day, or null for
   * the unscheduled bucket. `orderedIdsForDay` is the new order of stop ids
   * within that day.
   *
   * The hook recomputes a global sort_order across every stop in the trip
   * (preserving each existing day's previous position) and persists it.
   */
  const reorderStopsInDay = useCallback(
    async (dayKey: string | null, orderedIdsForDay: string[]) => {
      // Optimistic local update first
      let nextStops: Stop[] = [];
      setState((s) => {
        const byId = new Map(s.stops.map((stop) => [stop.id, stop]));
        const isDayMatch = (stop: Stop) =>
          (stop.planned_date ?? null) === dayKey;

        // Walk the existing stops in their current order and replace each
        // matching-day stop with the next one from `orderedIdsForDay`.
        const queue = [...orderedIdsForDay];
        const reordered: Stop[] = s.stops.map((stop) => {
          if (!isDayMatch(stop)) return stop;
          const nextId = queue.shift();
          if (!nextId) return stop;
          return byId.get(nextId) ?? stop;
        });

        // Re-stamp sort_order so it stays a stable monotonic sequence.
        const stamped = reordered.map((stop, idx) => ({
          ...stop,
          sort_order: idx,
        }));
        nextStops = stamped;
        return { ...s, stops: stamped };
      });

      try {
        await reorderStops(nextStops.map((stop) => stop.id));
      } catch (err) {
        // Revert by reloading authoritative state from the server.
        await load();
        throw err;
      }
    },
    [load],
  );

  return {
    ...state,
    refresh: load,
    addStop,
    editStop,
    removeStop,
    cycleStatus,
    reorderStopsInDay,
  };
}
