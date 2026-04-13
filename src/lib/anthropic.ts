import type { Trip, Stop, Receipt } from '../types';
import type { Message } from '../services/conversationsService';

const anthropicApiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Add it to your .env file.'
  );
}

export const ANTHROPIC_API_KEY = anthropicApiKey;

export function buildTripContext(
  trip: Trip,
  stops: Stop[],
  receipts: Receipt[]
): string {
  const budget = trip.budget ?? 0;
  const spent = trip.spent ?? 0;

  const stopLines = stops
    .map(
      (s) =>
        `- ${s.name} (${s.category ?? 'general'}): ${s.planned_date ?? 'no date'}, status: ${s.status ?? 'upcoming'}`
    )
    .join('\n');

  const recentReceipts = receipts.slice(0, 10);
  const receiptLines = recentReceipts
    .map(
      (r) =>
        `- ${r.merchant ?? 'Unknown'}: $${r.amount.toFixed(2)} (${r.category ?? 'uncategorized'})`
    )
    .join('\n');

  return `You are a helpful travel companion. Current trip: "${trip.name}", from ${trip.start_date ?? 'TBD'} to ${trip.end_date ?? 'TBD'}. Budget: $${budget.toFixed(2)}, Spent: $${spent.toFixed(2)}, Remaining: $${(budget - spent).toFixed(2)}.

Stops:
${stopLines || 'No stops planned yet.'}

Recent receipts:
${receiptLines || 'No receipts recorded yet.'}

Help the user plan their trip, suggest activities, answer questions, and track their budget. Be concise and friendly.`;
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

export async function sendChatMessage(
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const apiMessages: AnthropicMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as AnthropicResponse;
  const textBlock = data.content.find((c) => c.type === 'text');
  return textBlock?.text ?? 'Sorry, I could not generate a response.';
}
