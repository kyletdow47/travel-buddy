const anthropicApiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

if (__DEV__ && !anthropicApiKey) {
  console.warn(
    'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. AI assistant will not work. Add it to your .env file.',
  );
}

export const ANTHROPIC_API_KEY = anthropicApiKey;
