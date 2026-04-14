import { useCallback, useEffect, useState } from 'react';
import {
  getReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
} from '../services/receiptsService';
import type { Receipt, ReceiptInsert } from '../types';

type State = {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
};

export function useReceipts(tripId: string | null) {
  const [state, setState] = useState<State>({
    receipts: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!tripId) {
      setState({ receipts: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const receipts = await getReceipts(tripId);
      setState({ receipts, loading: false, error: null });
    } catch (err) {
      setState({ receipts: [], loading: false, error: String(err) });
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const addReceipt = useCallback(
    async (insert: ReceiptInsert) => {
      const receipt = await createReceipt(insert);
      setState((s) => ({ ...s, receipts: [receipt, ...s.receipts] }));
      return receipt;
    },
    [],
  );

  const editReceipt = useCallback(
    async (id: string, updates: Partial<ReceiptInsert>) => {
      const receipt = await updateReceipt(id, updates);
      setState((s) => ({
        ...s,
        receipts: s.receipts.map((x) => (x.id === id ? receipt : x)),
      }));
      return receipt;
    },
    [],
  );

  const removeReceipt = useCallback(async (id: string) => {
    await deleteReceipt(id);
    setState((s) => ({
      ...s,
      receipts: s.receipts.filter((x) => x.id !== id),
    }));
  }, []);

  return { ...state, refresh: load, addReceipt, editReceipt, removeReceipt };
}
