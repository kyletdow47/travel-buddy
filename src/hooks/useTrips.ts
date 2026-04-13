import { useState, useEffect, useCallback } from 'react';
import type { Trip, TripInsert } from '../types';
import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from '../services/tripsService';

interface UseTripsReturn {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTrip: (trip: TripInsert) => Promise<Trip>;
  editTrip: (id: string, updates: Partial<TripInsert>) => Promise<Trip>;
  removeTrip: (id: string) => Promise<void>;
}

export function useTrips(): UseTripsReturn {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load trips';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addTrip = useCallback(
    async (trip: TripInsert): Promise<Trip> => {
      const newTrip = await createTrip(trip);
      setTrips((prev) => [newTrip, ...prev]);
      return newTrip;
    },
    []
  );

  const editTrip = useCallback(
    async (id: string, updates: Partial<TripInsert>): Promise<Trip> => {
      const updated = await updateTrip(id, updates);
      setTrips((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    []
  );

  const removeTrip = useCallback(async (id: string): Promise<void> => {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trips, loading, error, refresh, addTrip, editTrip, removeTrip };
}
