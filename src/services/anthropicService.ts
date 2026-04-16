const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: 'text'; text: string }>;
}

interface TripContext {
  name: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  spent: number | null;
  countryCode: string | null;
}

function buildSystemPrompt(trip: TripContext | null): string {
  const base = `You are Travel Buddy AI, a friendly and knowledgeable travel planning assistant. You help travelers plan trips, suggest activities, recommend packing lists, estimate budgets, and provide practical travel tips.

Keep your responses concise and actionable — aim for 2-4 short paragraphs max. Use bullet points for lists. Be enthusiastic but not overwhelming.

When suggesting activities, consider the destination's culture, weather, and practical logistics. For budget advice, give realistic ranges. For packing, tailor suggestions to the destination and trip duration.`;

  if (!trip) return base;

  const parts = [base, '\n--- Current Trip Context ---'];
  parts.push(`Trip: ${trip.name}`);
  if (trip.startDate) parts.push(`Dates: ${trip.startDate}${trip.endDate ? ` to ${trip.endDate}` : ''}`);
  if (trip.budget != null) {
    const spent = trip.spent ?? 0;
    parts.push(`Budget: $${trip.budget} (spent: $${spent}, remaining: $${trip.budget - spent})`);
  }
  if (trip.countryCode) parts.push(`Country: ${trip.countryCode}`);
  parts.push('\nUse this context to give personalized advice. Reference the trip by name when relevant.');

  return parts.join('\n');
}

export async function sendChatMessage(
  messages: AnthropicMessage[],
  trip: TripContext | null,
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Anthropic API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.',
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(trip),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as AnthropicResponse;
  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text content in Anthropic response');
  }

  return textBlock.text;
}
