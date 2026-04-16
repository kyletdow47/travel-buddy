export const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export function isAnthropicConfigured(): boolean {
  return ANTHROPIC_API_KEY.length > 0;
}
