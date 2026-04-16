const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export interface TripContext {
  name: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  countryFlag: string | null;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentBlock {
  type: string;
  text?: string;
}

interface ApiResponse {
  content: ContentBlock[];
}

function buildSystemPrompt(trip?: TripContext): string {
  let prompt =
    'You are Travel Buddy AI, a friendly and knowledgeable travel planning assistant. ' +
    'You help users plan trips, suggest activities, recommend packing lists, estimate budgets, ' +
    'find restaurants, and answer travel-related questions.\n\n' +
    'Be concise but helpful. Use short paragraphs. When suggesting activities or items, use bullet points. ' +
    'Keep responses focused and actionable.';

  if (trip) {
    prompt += `\n\nThe user is planning a trip called "${trip.name}".`;
    if (trip.startDate) {
      prompt += ` Dates: ${trip.startDate}`;
      if (trip.endDate) prompt += ` to ${trip.endDate}`;
      prompt += '.';
    }
    if (trip.budget != null) {
      prompt += ` Budget: $${trip.budget}.`;
    }
    if (trip.countryFlag) {
      prompt += ` Destination flag: ${trip.countryFlag}.`;
    }
    prompt += '\nTailor your suggestions to this specific trip when relevant.';
  }

  return prompt;
}

export async function sendChatMessage(
  messages: ApiMessage[],
  tripContext?: TripContext,
  signal?: AbortSignal,
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Add it to your .env file.',
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(tripContext),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Claude API error (${response.status}): ${errorBody}`);
  }

  const data: ApiResponse = await response.json();

  if (!Array.isArray(data.content) || data.content.length === 0) {
    throw new Error('Empty response from Claude API');
  }

  const textParts = data.content
    .filter((block): block is ContentBlock & { text: string } => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text);

  if (textParts.length === 0) {
    throw new Error('No text content in Claude API response');
  }

  return textParts.join('\n');
}
