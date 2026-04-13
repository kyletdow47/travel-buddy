import Anthropic from '@anthropic-ai/sdk';
import type { Trip, Stop, Receipt } from '../types';

export const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
});

export function buildTripContext(trip: Trip, stops: Stop[], receipts: Receipt[]): string {
  const tripDates =
    trip.start_date && trip.end_date
      ? `${trip.start_date} to ${trip.end_date}`
      : 'dates not set';

  const stopsList =
    stops.length > 0
      ? stops
          .map(
            (s) =>
              `- ${s.name} (${s.category ?? 'general'}) on ${s.planned_date ?? 'TBD'} [${s.status ?? 'upcoming'}]${s.location ? ` at ${s.location}` : ''}`
          )
          .join('\n')
      : 'No stops planned yet';

  const recentReceipts = receipts.slice(0, 10);
  const receiptsList =
    recentReceipts.length > 0
      ? recentReceipts
          .map(
            (r) =>
              `- ${r.merchant ?? 'Unknown'}: $${r.amount?.toFixed(2) ?? '0.00'} (${r.category ?? 'misc'})`
          )
          .join('\n')
      : 'No receipts yet';

  return `You are a helpful travel companion assistant for the Travel Buddy app.

Current trip: ${trip.name}, ${tripDates}
Budget: $${trip.budget?.toFixed(2) ?? 'not set'}
Spent: $${trip.spent?.toFixed(2) ?? '0.00'}

Planned stops:
${stopsList}

Recent receipts:
${receiptsList}

Help the user plan their trip, suggest activities, answer questions about their destinations, and help them track their budget. Be friendly, concise, and practical.`;
}
