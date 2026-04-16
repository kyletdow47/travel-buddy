import { describe, it, expect, vi, beforeEach } from 'vitest';

const VALID_CATEGORIES = [
  'Clothing',
  'Toiletries',
  'Electronics',
  'Documents',
  'Medicine',
  'Snacks',
  'Gear',
  'Other',
];

describe('packingSuggestionService', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('getPackingSuggestions — dev fallback', () => {
    it('returns fallback suggestions when API key is missing', async () => {
      vi.stubEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY', '');

      const { getPackingSuggestions } = await import('./packingSuggestionService');

      const result = await getPackingSuggestions({
        trip: {
          name: 'Beach Trip',
          start_date: '2026-06-01',
          end_date: '2026-06-07',
          country_code: 'US',
          country_flag: '🇺🇸',
        },
        stops: [{ name: 'Surfing', category: 'activity', location: 'Malibu' }],
        existingItems: [],
      });

      expect(result.length).toBeGreaterThan(0);
      for (const item of result) {
        expect(typeof item.name).toBe('string');
        expect(item.name.length).toBeGreaterThan(0);
        expect(VALID_CATEGORIES).toContain(item.category);
      }
    });

    it('filters out existing items in dev fallback', async () => {
      vi.stubEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY', '');

      const { getPackingSuggestions } = await import('./packingSuggestionService');

      const result = await getPackingSuggestions({
        trip: {
          name: 'Trip',
          start_date: null,
          end_date: null,
          country_code: null,
          country_flag: null,
        },
        stops: [],
        existingItems: [
          { name: 'Passport', category: 'Documents' },
          { name: 'Phone charger', category: 'Electronics' },
        ],
      });

      const names = result.map((s) => s.name.toLowerCase());
      expect(names).not.toContain('passport');
      expect(names).not.toContain('phone charger');
    });
  });

  describe('getPackingSuggestions — API call', () => {
    it('parses valid API response', async () => {
      vi.stubEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY', 'test-key');

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              { name: 'Hiking boots', category: 'Gear' },
              { name: 'Rain jacket', category: 'Clothing' },
              { name: 'First aid kit', category: 'Medicine' },
            ]),
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { getPackingSuggestions } = await import('./packingSuggestionService');

      const result = await getPackingSuggestions({
        trip: {
          name: 'Mountain Hike',
          start_date: '2026-07-10',
          end_date: '2026-07-15',
          country_code: 'CH',
          country_flag: '🇨🇭',
        },
        stops: [{ name: 'Matterhorn Hike', category: 'activity', location: 'Zermatt' }],
        existingItems: [],
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'Hiking boots', category: 'Gear' });
    });

    it('normalizes invalid categories to Other', async () => {
      vi.stubEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY', 'test-key');

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              { name: 'Tent', category: 'Camping' },
            ]),
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { getPackingSuggestions } = await import('./packingSuggestionService');

      const result = await getPackingSuggestions({
        trip: {
          name: 'Trip',
          start_date: null,
          end_date: null,
          country_code: null,
          country_flag: null,
        },
        stops: [],
        existingItems: [],
      });

      expect(result[0].category).toBe('Other');
    });

    it('throws on API error', async () => {
      vi.stubEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY', 'test-key');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      const { getPackingSuggestions } = await import('./packingSuggestionService');

      await expect(
        getPackingSuggestions({
          trip: {
            name: 'Trip',
            start_date: null,
            end_date: null,
            country_code: null,
            country_flag: null,
          },
          stops: [],
          existingItems: [],
        }),
      ).rejects.toThrow('Anthropic API error (401)');
    });

    it('filters duplicates from API response', async () => {
      vi.stubEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY', 'test-key');

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              { name: 'Passport', category: 'Documents' },
              { name: 'Sunscreen', category: 'Toiletries' },
            ]),
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { getPackingSuggestions } = await import('./packingSuggestionService');

      const result = await getPackingSuggestions({
        trip: {
          name: 'Trip',
          start_date: null,
          end_date: null,
          country_code: null,
          country_flag: null,
        },
        stops: [],
        existingItems: [{ name: 'Passport', category: 'Documents' }],
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sunscreen');
    });
  });
});
