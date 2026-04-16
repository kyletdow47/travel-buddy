import { useCallback, useState } from 'react';
import {
  getPackingSuggestions,
  type PackingSuggestion,
} from '../services/packingSuggestionService';
import type { Trip, Stop, PackingItem } from '../types';

type SuggestionState = {
  suggestions: PackingSuggestion[];
  loading: boolean;
  error: string | null;
};

export function usePackingSuggestions() {
  const [state, setState] = useState<SuggestionState>({
    suggestions: [],
    loading: false,
    error: null,
  });

  const fetchSuggestions = useCallback(
    async (
      trip: Pick<Trip, 'name' | 'start_date' | 'end_date' | 'country_code' | 'country_flag'>,
      stops: Pick<Stop, 'name' | 'category' | 'location'>[],
      existingItems: Pick<PackingItem, 'name' | 'category'>[],
    ) => {
      setState({ suggestions: [], loading: true, error: null });
      try {
        const suggestions = await getPackingSuggestions({
          trip,
          stops,
          existingItems,
        });
        setState({ suggestions, loading: false, error: null });
      } catch (err) {
        setState({ suggestions: [], loading: false, error: String(err) });
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setState({ suggestions: [], loading: false, error: null });
  }, []);

  return { ...state, fetchSuggestions, clear };
}
