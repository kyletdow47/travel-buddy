import { useEffect, useState, useCallback } from 'react';
import { anthropic, buildTripContext } from '../lib/anthropic';
import {
  getConversation,
  upsertConversation,
  clearConversation,
  type Message,
} from '../services/conversationsService';
import type { Trip, Stop, Receipt } from '../types';

export function useConversation(tripId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversation = useCallback(async () => {
    if (!tripId) {
      setMessages([]);
      return;
    }
    try {
      const conv = await getConversation(tripId);
      setMessages(conv ? (conv.messages as unknown as Message[]) : []);
    } catch {
      setMessages([]);
    }
  }, [tripId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const sendMessage = useCallback(
    async (text: string, trip: Trip, stops: Stop[], receipts: Receipt[]) => {
      if (!tripId || !text.trim() || isLoading) return;

      const userMessage: Message = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        await upsertConversation(tripId, updatedMessages);

        const anthropicMessages = updatedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: buildTripContext(trip, stops, receipts),
          messages: anthropicMessages,
        });

        const assistantText =
          response.content[0]?.type === 'text' ? response.content[0].text : '';

        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantText,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        await upsertConversation(tripId, finalMessages);
      } catch (e) {
        console.error('Error sending message:', e);
        // Remove the optimistically added user message on error
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, messages, isLoading]
  );

  const clearMessages = useCallback(async () => {
    if (!tripId) return;
    try {
      await clearConversation(tripId);
      setMessages([]);
    } catch (e) {
      console.error('Error clearing conversation:', e);
    }
  }, [tripId]);

  return { messages, isLoading, sendMessage, clearMessages };
}
