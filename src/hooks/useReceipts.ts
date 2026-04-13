import { useState, useEffect, useCallback } from 'react';
import { getReceipts } from '../services/receiptsService';
import type { Receipt } from '../types';

export function useReceipts(tripId: string | null) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!tripId) {
      setReceipts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getReceipts(tripId);
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const total = receipts.reduce((sum, r) => sum + r.amount, 0);

  return { receipts, loading, error, refetch, total };
}
