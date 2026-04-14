import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConversation,
  upsertConversation,
  clearConversation as clearConversationApi,
} from '../services/conversationsService';
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Clean up pending simulated response timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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

  /** Send a user message and get a simulated assistant response. */
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !tripIdRef.current) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      };

      setMessages((prev) => {
        const next = [...prev, userMsg];
        // Persist after adding user message
        persist(next);
        return next;
      });

      setIsThinking(true);

      // Simulated response — swap with real AI call later
      timerRef.current = setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            'That sounds exciting. Tell me a bit more and I will sketch out an itinerary for you.',
          createdAt: Date.now(),
        };

        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          persist(next);
          return next;
        });
        setIsThinking(false);
        timerRef.current = null;
      }, 900);
    },
    [persist],
  );

  /** Clear the entire conversation for the current trip. */
  const clearConversation = useCallback(async () => {
    const tid = tripIdRef.current;
    setMessages([]);
    setIsThinking(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
