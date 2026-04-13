import { anthropic } from '../lib/anthropic';
import { appendMessage } from './conversationsService';
import type { Message } from './conversationsService';
import type { Trip, Stop, Receipt } from '../types';

/**
 * Builds a system prompt with trip context for the AI assistant.
 */
export function buildTripContext(
  trip: Trip,
  stops: Stop[],
  receipts: Receipt[]
): string {
  const dateRange =
    trip.start_date && trip.end_date
      ? `${trip.start_date} to ${trip.end_date}`
      : trip.start_date
        ? `starting ${trip.start_date}`
        : 'no dates set';

  const budget = trip.budget != null ? `$${trip.budget.toFixed(2)}` : 'not set';
  const spent = trip.spent != null ? `$${trip.spent.toFixed(2)}` : '$0.00';

  const stopsList =
    stops.length > 0
      ? stops
          .map((s) => {
            const parts = [s.name];
            if (s.category) parts.push(`(${s.category})`);
            if (s.planned_date) parts.push(`on ${s.planned_date}`);
            if (s.status) parts.push(`[${s.status}]`);
            return `  - ${parts.join(' ')}`;
          })
          .join('\n')
      : '  (no stops planned yet)';

  const receiptsList =
    receipts.length > 0
      ? receipts
          .slice(0, 10)
          .map((r) => {
            const parts: string[] = [];
            if (r.merchant) parts.push(r.merchant);
            parts.push(`$${r.amount.toFixed(2)}`);
            if (r.category) parts.push(`(${r.category})`);
            return `  - ${parts.join(' ')}`;
          })
          .join('\n')
      : '  (no receipts yet)';

  return [
    'You are a helpful travel companion assistant.',
    `Current trip: ${trip.name}`,
    `Dates: ${dateRange}`,
    `Budget: ${budget}, Spent: ${spent}`,
    '',
    'Stops:',
    stopsList,
    '',
    'Recent receipts:',
    receiptsList,
    '',
    'Help the user plan their trip, suggest activities, answer questions, and track their budget.',
    'Keep responses concise and friendly.',
  ].join('\n');
}

/**
 * Sends a user message to the Anthropic API and returns the assistant response.
 * Persists both user and assistant messages to Supabase.
 */
export async function sendMessage(
  tripId: string,
  userContent: string,
  conversationHistory: Message[],
  trip: Trip,
  stops: Stop[],
  receipts: Receipt[]
): Promise<Message> {
  const userMessage: Message = {
    role: 'user',
    content: userContent,
    timestamp: new Date().toISOString(),
  };

  // Persist user message to Supabase
  await appendMessage(tripId, userMessage);

  // Build messages array for Anthropic API (without timestamps)
  const apiMessages = [...conversationHistory, userMessage].map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  // Call Anthropic API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildTripContext(trip, stops, receipts),
    messages: apiMessages,
  });

  // Extract text from response
  const assistantContent = response.content
    .filter((block) => block.type === 'text')
    .map((block) => {
      if (block.type === 'text') {
        return block.text;
      }
      return '';
    })
    .join('');

  const assistantMessage: Message = {
    role: 'assistant',
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };

  // Persist assistant message to Supabase
  await appendMessage(tripId, assistantMessage);

  return assistantMessage;
}
