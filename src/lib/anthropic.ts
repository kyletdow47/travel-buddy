const anthropicApiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Add it to your .env file.'
  );
}

export const ANTHROPIC_API_KEY = anthropicApiKey;
