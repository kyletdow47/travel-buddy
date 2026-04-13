import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Add it to your .env file.'
  );
}

// Note: Calling Anthropic directly from the client exposes the API key.
// For a personal app this is acceptable. For production, proxy through a server route.
export const anthropic = new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true,
});
