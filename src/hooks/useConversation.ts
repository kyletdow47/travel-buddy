import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConversation,
  upsertConversation,
  clearConversation as clearConversationApi,
} from '../services/conversationsService';
import { sendChatMessage } from '../lib/anthropic';
import type { TripContext } from '../lib/anthropic';
import type { Message } from '../services/conversationsService';

export type { Message } from '../services/conversationsService';
export type { TripContext } from '../lib/anthropic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

function toChat(msg: Message, index: number): ChatMessage {
  const ts = new Date(msg.timestamp).getTime() || Date.now();
  return {
    id: `${msg.role}-${ts}-${index}`,
    role: msg.role,
    content: msg.content,
    createdAt: ts,
  };
}

function toService(msg: ChatMessage): Message {
  return {
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.createdAt).toISOString(),
  };
}

export function useConversation(
  tripId: string | null,
  tripContext?: TripContext,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const tripIdRef = useRef(tripId);
  tripIdRef.current = tripId;

  const tripContextRef = useRef(tripContext);
  tripContextRef.current = tripContext;

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const updateMessages = useCallback((msgs: ChatMessage[]) => {
    messagesRef.current = msgs;
    setMessages(msgs);
  }, []);

  useEffect(() => {
    if (!tripId) {
      updateMessages([]);
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
        updateMessages(raw.map(toChat));
      } catch {
        if (!cancelled) updateMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [tripId, updateMessages]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const persist = useCallback(async (msgs: ChatMessage[]) => {
    const tid = tripIdRef.current;
    if (!tid) return;
    try {
      await upsertConversation(tid, msgs.map(toService));
    } catch {
      // Silently fail persistence — messages remain in local state
    }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !tripIdRef.current) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      };

      const withUser = [...messagesRef.current, userMsg];
      updateMessages(withUser);
      persist(withUser);
      setIsThinking(true);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const apiMessages = withUser.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      sendChatMessage(apiMessages, tripContextRef.current, controller.signal)
        .then((responseText) => {
          if (controller.signal.aborted) return;
          const assistantMsg: ChatMessage = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: responseText,
            createdAt: Date.now(),
          };
          const withAssistant = [...messagesRef.current, assistantMsg];
          updateMessages(withAssistant);
          persist(withAssistant);
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return;
          const errorMsg: ChatMessage = {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I had trouble connecting. Please try again.',
            createdAt: Date.now(),
          };
          const withError = [...messagesRef.current, errorMsg];
          updateMessages(withError);
          persist(withError);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsThinking(false);
          }
          if (abortRef.current === controller) {
            abortRef.current = null;
          }
        });
    },
    [persist, updateMessages],
  );

  const clearConversation = useCallback(async () => {
    const tid = tripIdRef.current;
    updateMessages([]);
    setIsThinking(false);
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
  }, [updateMessages]);

  return {
    messages,
    loading,
    isThinking,
    sendMessage,
    clearConversation,
  };
}
