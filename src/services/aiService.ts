import { ANTHROPIC_API_KEY } from '../lib/anthropic';
import type { Trip } from '../types';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ApiResponse {
  id: string;
  content: Array<{ type: string; text: string }>;
  stop_reason: string;
}

interface ApiErrorResponse {
  error?: { message: string };
}

function buildSystemPrompt(trip: Trip | null): string {
  const base = [
    'You are Travel Buddy AI, a friendly and knowledgeable travel assistant.',
    'You help users plan trips, suggest activities, create packing lists, estimate budgets, and answer travel questions.',
    'Keep responses concise and practical. Use bullet points for lists.',
    'When suggesting activities, include approximate costs when relevant.',
    'Be enthusiastic but not overly verbose — aim for helpful, actionable answers.',
  ].join(' ');

  if (!trip) return base;

  const parts = [base, '\n\nCurrent trip context:'];
  parts.push(`- Trip name: ${trip.name}`);
  if (trip.start_date) parts.push(`- Start date: ${trip.start_date}`);
  if (trip.end_date) parts.push(`- End date: ${trip.end_date}`);
  if (trip.budget) parts.push(`- Budget: $${trip.budget}`);
  if (trip.spent) parts.push(`- Spent so far: $${trip.spent}`);
  if (trip.country_code) parts.push(`- Country: ${trip.country_code}`);
  if (trip.timezone) parts.push(`- Timezone: ${trip.timezone}`);
  parts.push(
    '\nUse this context to give personalised advice. Reference the trip name, dates, and budget when relevant.',
  );

  return parts.join('\n');
}

export async function sendChatMessage(
  messages: ApiMessage[],
  trip: Trip | null,
  signal?: AbortSignal,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(trip);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    const message = errorBody.error?.message ?? `API error: ${response.status}`;
    throw new Error(message);
  }

  const data = (await response.json()) as ApiResponse;
  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock) throw new Error('No text response from AI');

  return textBlock.text;
}
