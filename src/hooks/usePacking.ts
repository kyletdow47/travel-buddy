import { useCallback, useEffect, useState } from 'react';
import {
  getPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  togglePacked,
} from '../services/packingService';
import type { PackingItem, PackingItemInsert, PackingItemUpdate } from '../types';

type State = {
  items: PackingItem[];
  loading: boolean;
  error: string | null;
};

export function usePacking(tripId: string | null) {
  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!tripId) {
      setState({ items: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const items = await getPackingItems(tripId);
      setState({ items, loading: false, error: null });
    } catch (err) {
      setState({ items: [], loading: false, error: String(err) });
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = useCallback(async (insert: PackingItemInsert) => {
    const item = await createPackingItem(insert);
    setState((s) => ({ ...s, items: [...s.items, item] }));
    return item;
  }, []);

  const editItem = useCallback(
    async (id: string, updates: PackingItemUpdate) => {
      const item = await updatePackingItem(id, updates);
      setState((s) => ({
        ...s,
        items: s.items.map((x) => (x.id === id ? item : x)),
      }));
      return item;
    },
    [],
  );

  const removeItem = useCallback(async (id: string) => {
    await deletePackingItem(id);
    setState((s) => ({
      ...s,
      items: s.items.filter((x) => x.id !== id),
    }));
  }, []);

  const toggle = useCallback(async (id: string, packed: boolean) => {
    const item = await togglePacked(id, packed);
    setState((s) => ({
      ...s,
      items: s.items.map((x) => (x.id === id ? item : x)),
    }));
    return item;
  }, []);

  return { ...state, refresh: load, addItem, editItem, removeItem, toggle };
}
