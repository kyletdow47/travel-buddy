import { useCallback, useEffect, useState } from 'react';
import {
  getSavedSpots,
  createSavedSpot,
  updateSavedSpot,
  deleteSavedSpot,
  importToTrip as importToTripService,
} from '../services/savedSpotsService';
import type { SavedSpot, SavedSpotInsert, SavedSpotUpdate } from '../types';

type State = {
  spots: SavedSpot[];
  loading: boolean;
  error: string | null;
};

export function useSavedSpots() {
  const [state, setState] = useState<State>({
    spots: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const spots = await getSavedSpots();
      setState({ spots, loading: false, error: null });
    } catch (err) {
      setState({ spots: [], loading: false, error: String(err) });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSpot = useCallback(async (insert: SavedSpotInsert) => {
    const spot = await createSavedSpot(insert);
    setState((s) => ({ ...s, spots: [spot, ...s.spots] }));
    return spot;
  }, []);

  const editSpot = useCallback(async (id: string, updates: SavedSpotUpdate) => {
    const spot = await updateSavedSpot(id, updates);
    setState((s) => ({
      ...s,
      spots: s.spots.map((x) => (x.id === id ? spot : x)),
    }));
    return spot;
  }, []);

  const removeSpot = useCallback(async (id: string) => {
    await deleteSavedSpot(id);
    setState((s) => ({ ...s, spots: s.spots.filter((x) => x.id !== id) }));
  }, []);

  const importToTrip = useCallback(async (spotId: string, tripId: string) => {
    const spot = await importToTripService(spotId, tripId);
    setState((s) => ({
      ...s,
      spots: s.spots.map((x) => (x.id === spotId ? spot : x)),
    }));
    return spot;
  }, []);

  return { ...state, refresh: load, addSpot, editSpot, removeSpot, importToTrip };
}
