import { useCallback, useEffect, useState } from 'react';
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../services/reservationsService';
import type { Reservation, ReservationInsert } from '../types';

type State = {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
};

export function useReservations(tripId: string | null) {
  const [state, setState] = useState<State>({
    reservations: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!tripId) {
      setState({ reservations: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const reservations = await getReservations(tripId);
      setState({ reservations, loading: false, error: null });
    } catch (err) {
      setState({ reservations: [], loading: false, error: String(err) });
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const addReservation = useCallback(
    async (insert: ReservationInsert) => {
      const reservation = await createReservation(insert);
      setState((s) => ({ ...s, reservations: [reservation, ...s.reservations] }));
      return reservation;
    },
    [],
  );

  const editReservation = useCallback(
    async (id: string, updates: Partial<ReservationInsert>) => {
      const reservation = await updateReservation(id, updates);
      setState((s) => ({
        ...s,
        reservations: s.reservations.map((x) => (x.id === id ? reservation : x)),
      }));
      return reservation;
    },
    [],
  );

  const removeReservation = useCallback(async (id: string) => {
    await deleteReservation(id);
    setState((s) => ({
      ...s,
      reservations: s.reservations.filter((x) => x.id !== id),
    }));
  }, []);

  return { ...state, refresh: load, addReservation, editReservation, removeReservation };
}
