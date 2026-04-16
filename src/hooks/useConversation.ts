import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConversation,
  upsertConversation,
  clearConversation as clearConversationApi,
} from '../services/conversationsService';
import { sendChatMessage } from '../services/anthropicService';
import { useTrips } from './useTrips';
import type { Message } from '../services/conversationsService';

export type { Message } from '../services/conversationsService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

/** Convert service Message (timestamp string) to ChatMessage (numeric id + createdAt). */
function toChat(msg: Message, index: number): ChatMessage {
  const ts = new Date(msg.timestamp).getTime() || Date.now();
  return {
    id: `${msg.role}-${ts}-${index}`,
    role: msg.role,
    content: msg.content,
    createdAt: ts,
  };
}

/** Convert ChatMessage back to service Message for persistence. */
function toService(msg: ChatMessage): Message {
  return {
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.createdAt).toISOString(),
  };
}

export function useConversation(tripId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { trips } = useTrips();

  // Track tripId to avoid stale writes
  const tripIdRef = useRef(tripId);
  tripIdRef.current = tripId;

  // Load conversation on mount / tripId change
  useEffect(() => {
    if (!tripId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const convo = await getConversation(tripId);
        if (cancelled) return;
        const raw = (convo?.messages ?? []) as unknown as Message[];
        setMessages(raw.map(toChat));
      } catch {
        // If we fail to load, start fresh
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  // Abort pending API call on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /** Persist current messages array to Supabase. */
  const persist = useCallback(
    async (msgs: ChatMessage[]) => {
      const tid = tripIdRef.current;
      if (!tid) return;
      try {
        await upsertConversation(tid, msgs.map(toService));
      } catch {
        // Silently fail persistence — messages remain in local state
      }
    },
    [],
  );

  /** Send a user message and get a real AI response via the Anthropic API. */
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !tripIdRef.current) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      };

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMessages((prev) => {
        const next = [...prev, userMsg];
        persist(next);

        // Build trip context for the system prompt
        const trip = trips.find((t) => t.id === tripIdRef.current) ?? null;
        const tripContext = trip
          ? {
              name: trip.name,
              startDate: trip.start_date,
              endDate: trip.end_date,
              budget: trip.budget,
              spent: trip.spent,
              countryCode: trip.country_code,
            }
          : null;

        // Build message history for the API (only role + content)
        const apiMessages = next.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        setIsThinking(true);

        sendChatMessage(apiMessages, tripContext, controller.signal)
          .then((responseText) => {
            if (controller.signal.aborted) return;

            const assistantMsg: ChatMessage = {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: responseText,
              createdAt: Date.now(),
            };

            setMessages((prev2) => {
              const updated = [...prev2, assistantMsg];
              persist(updated);
              return updated;
            });
          })
          .catch((err: Error) => {
            if (controller.signal.aborted) return;

            const errorMsg: ChatMessage = {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: err.message.includes('API key')
                ? 'I need an API key to respond. Please add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.'
                : 'Sorry, I had trouble connecting. Please try again in a moment.',
              createdAt: Date.now(),
            };

            setMessages((prev2) => {
              const updated = [...prev2, errorMsg];
              persist(updated);
              return updated;
            });
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              setIsThinking(false);
            }
          });

        return next;
      });
    },
    [persist, trips],
  );

  /** Clear the entire conversation for the current trip. */
  const clearConversation = useCallback(async () => {
    const tid = tripIdRef.current;
    setMessages([]);
    setIsThinking(false);
    abortRef.current?.abort();
    abortRef.current = null;
    if (tid) {
      try {
        await clearConversationApi(tid);
      } catch {
        // Best-effort clear
      }
    }
  }, []);

  return {
    messages,
    loading,
    isThinking,
    sendMessage,
    clearConversation,
  };
}
