import type { Trip, Stop, PackingItem } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export type PackingSuggestion = {
  name: string;
  category: string;
};

type TripContext = {
  trip: Pick<Trip, 'name' | 'start_date' | 'end_date' | 'country_code' | 'country_flag'>;
  stops: Pick<Stop, 'name' | 'category' | 'location'>[];
  existingItems: Pick<PackingItem, 'name' | 'category'>[];
};

function buildPrompt(ctx: TripContext): string {
  const { trip, stops, existingItems } = ctx;

  const dateRange =
    trip.start_date && trip.end_date
      ? `${trip.start_date} to ${trip.end_date}`
      : trip.start_date ?? 'not specified';

  const destination = [trip.country_flag, trip.country_code].filter(Boolean).join(' ') || 'unknown';

  const activities =
    stops.length > 0
      ? stops
          .map((s) => `- ${s.name}${s.category ? ` (${s.category})` : ''}${s.location ? ` at ${s.location}` : ''}`)
          .join('\n')
      : 'None planned yet';

  const alreadyPacked =
    existingItems.length > 0
      ? existingItems.map((i) => i.name).join(', ')
      : 'None';

  return `You are a travel packing assistant. Suggest 15-25 packing items for this trip.

Trip: ${trip.name}
Dates: ${dateRange}
Destination: ${destination}
Planned activities:
${activities}
Already packed: ${alreadyPacked}

Consider:
- Weather and season based on the dates and destination
- Activity-specific gear (hiking boots for hikes, swimsuit for beaches, etc.)
- Essential travel documents and electronics
- Do NOT suggest items already in the packing list

Return ONLY a valid JSON array. Each element must have exactly two fields:
- "name": short item name (2-4 words max)
- "category": exactly one of "Clothing", "Toiletries", "Electronics", "Documents", "Medicine", "Snacks", "Gear", "Other"

Example: [{"name":"Rain jacket","category":"Clothing"},{"name":"Sunscreen","category":"Toiletries"}]`;
}

const DEV_SUGGESTIONS: PackingSuggestion[] = [
  { name: 'Passport', category: 'Documents' },
  { name: 'Travel insurance card', category: 'Documents' },
  { name: 'Phone charger', category: 'Electronics' },
  { name: 'Power adapter', category: 'Electronics' },
  { name: 'Portable battery', category: 'Electronics' },
  { name: 'Headphones', category: 'Electronics' },
  { name: 'T-shirts', category: 'Clothing' },
  { name: 'Comfortable pants', category: 'Clothing' },
  { name: 'Light jacket', category: 'Clothing' },
  { name: 'Underwear', category: 'Clothing' },
  { name: 'Socks', category: 'Clothing' },
  { name: 'Walking shoes', category: 'Clothing' },
  { name: 'Sunglasses', category: 'Gear' },
  { name: 'Toothbrush', category: 'Toiletries' },
  { name: 'Toothpaste', category: 'Toiletries' },
  { name: 'Deodorant', category: 'Toiletries' },
  { name: 'Sunscreen', category: 'Toiletries' },
  { name: 'Pain relievers', category: 'Medicine' },
  { name: 'Band-aids', category: 'Medicine' },
  { name: 'Granola bars', category: 'Snacks' },
  { name: 'Water bottle', category: 'Gear' },
];

const VALID_CATEGORIES = new Set([
  'Clothing',
  'Toiletries',
  'Electronics',
  'Documents',
  'Medicine',
  'Snacks',
  'Gear',
  'Other',
]);

function filterDuplicates(
  suggestions: PackingSuggestion[],
  existing: Pick<PackingItem, 'name'>[],
): PackingSuggestion[] {
  const existingNames = new Set(existing.map((i) => i.name.toLowerCase().trim()));
  return suggestions.filter((s) => !existingNames.has(s.name.toLowerCase().trim()));
}

function validateSuggestions(raw: unknown): PackingSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { name: string; category: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.category === 'string',
    )
    .map((item) => ({
      name: item.name.trim(),
      category: VALID_CATEGORIES.has(item.category) ? item.category : 'Other',
    }))
    .filter((item) => item.name.length > 0);
}

export async function getPackingSuggestions(ctx: TripContext): Promise<PackingSuggestion[]> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    const filtered = filterDuplicates(DEV_SUGGESTIONS, ctx.existingItems);
    return filtered;
  }

  const prompt = buildPrompt(ctx);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text ?? '';

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = validateSuggestions(parsed);
  return filterDuplicates(validated, ctx.existingItems);
}
