import { useState, useEffect, useCallback } from 'react';
import {
  getConversation,
  upsertConversation,
  clearConversation as clearConversationService,
} from '../services/conversationsService';
import type { Message } from '../services/conversationsService';
import { getTrips } from '../services/tripsService';
import { getStops } from '../services/stopsService';
import { getReceipts } from '../services/receiptsService';
import { buildTripContext, sendChatMessage } from '../lib/anthropic';
import type { Trip, Stop, Receipt } from '../types';

interface UseConversationReturn {
  messages: Message[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  activeTrip: Trip | null;
  trips: Trip[];
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => Promise<void>;
  selectTrip: (tripId: string) => void;
}

export function useConversation(): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Load trips on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const allTrips = await getTrips();
        if (cancelled) return;
        setTrips(allTrips);
        // Select the first active trip, or the most recent one
        const active =
          allTrips.find((t) => t.status === 'active') ?? allTrips[0] ?? null;
        setActiveTrip(active);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load trips'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load conversation, stops, and receipts when active trip changes
  useEffect(() => {
    if (!activeTrip) {
      setMessages([]);
      setStops([]);
      setReceipts([]);
      setIsFetching(false);
      return;
    }

    let cancelled = false;
    setIsFetching(true);

    (async () => {
      try {
        const [conversation, tripStops, tripReceipts] = await Promise.all([
          getConversation(activeTrip.id),
          getStops(activeTrip.id),
          getReceipts(activeTrip.id),
        ]);
        if (cancelled) return;
        const msgs = (conversation?.messages ?? []) as unknown as Message[];
        setMessages(msgs);
        setStops(tripStops);
        setReceipts(tripReceipts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load conversation'
          );
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTrip]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeTrip || isLoading) return;

      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setError(null);

      try {
        // Persist user message
        await upsertConversation(activeTrip.id, updatedMessages);

        // Build context and call Anthropic
        const systemPrompt = buildTripContext(activeTrip, stops, receipts);
        const responseText = await sendChatMessage(
          systemPrompt,
          updatedMessages
        );

        const assistantMessage: Message = {
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        // Persist assistant response
        await upsertConversation(activeTrip.id, finalMessages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to send message'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeTrip, isLoading, messages, stops, receipts]
  );

  const clearConversation = useCallback(async () => {
    if (!activeTrip) return;
    try {
      await clearConversationService(activeTrip.id);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear conversation'
      );
    }
  }, [activeTrip]);

  const selectTrip = useCallback(
    (tripId: string) => {
      const trip = trips.find((t) => t.id === tripId);
      if (trip) setActiveTrip(trip);
    },
    [trips]
  );

  return {
    messages,
    isLoading,
    isFetching,
    error,
    activeTrip,
    trips,
    sendMessage,
    clearConversation,
    selectTrip,
  };
}
