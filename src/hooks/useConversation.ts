import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConversation,
  upsertConversation,
  clearConversation as clearConversationApi,
} from '../services/conversationsService';
import { sendChatMessage } from '../services/aiService';
import type { Message } from '../services/conversationsService';
import type { Trip } from '../types';

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

export function useConversation(tripId: string | null, trip?: Trip | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Track tripId to avoid stale writes
  const tripIdRef = useRef(tripId);
  tripIdRef.current = tripId;

  const tripRef = useRef(trip ?? null);
  tripRef.current = trip ?? null;

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

  // Clean up pending request on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
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

  /** Send a user message and get a real AI response. */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !tripIdRef.current) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      };

      let updatedMessages: ChatMessage[] = [];
      setMessages((prev) => {
        updatedMessages = [...prev, userMsg];
        persist(updatedMessages);
        return updatedMessages;
      });

      setIsThinking(true);

      // Abort any previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const responseText = await sendChatMessage(
          apiMessages,
          tripRef.current,
          controller.signal,
        );

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          createdAt: Date.now(),
        };

        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          persist(next);
          return next;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get response';
        setError(errorMessage);

        // Add error message as assistant response so user sees what went wrong
        const errorMsg: ChatMessage = {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I couldn\u2019t process that request. ${errorMessage}`,
          createdAt: Date.now(),
        };

        setMessages((prev) => {
          const next = [...prev, errorMsg];
          persist(next);
          return next;
        });
      } finally {
        setIsThinking(false);
        abortRef.current = null;
      }
    },
    [persist],
  );

  /** Clear the entire conversation for the current trip. */
  const clearConversation = useCallback(async () => {
    const tid = tripIdRef.current;
    setMessages([]);
    setIsThinking(false);
    setError(null);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
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
    error,
    sendMessage,
    clearConversation,
  };
}
