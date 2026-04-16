import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the anthropic module before importing aiService
vi.mock('../lib/anthropic', () => ({
  ANTHROPIC_API_KEY: 'test-key-123',
}));

import { sendChatMessage } from './aiService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends messages to Claude API and returns response text', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'msg_123',
        content: [{ type: 'text', text: 'Here is your itinerary!' }],
        stop_reason: 'end_turn',
      }),
    });

    const result = await sendChatMessage(
      [{ role: 'user', content: 'Plan a trip to Tokyo' }],
      null,
    );

    expect(result).toBe('Here is your itinerary!');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.method).toBe('POST');

    const headers = options.headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('test-key-123');
    expect(headers['anthropic-version']).toBe('2023-06-01');

    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body.model).toBe('claude-sonnet-4-20250514');
    expect(body.messages).toEqual([
      { role: 'user', content: 'Plan a trip to Tokyo' },
    ]);
  });

  it('includes trip context in system prompt when trip is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'msg_456',
        content: [{ type: 'text', text: 'Budget tips for your trip!' }],
        stop_reason: 'end_turn',
      }),
    });

    const mockTrip = {
      id: 'trip-1',
      name: 'Tokyo Adventure',
      start_date: '2026-05-01',
      end_date: '2026-05-08',
      budget: 3000,
      spent: 500,
      country_code: 'JP',
      timezone: 'Asia/Tokyo',
      status: null,
      cover_photo_url: null,
      cover_photo_attribution: null,
      source: null,
      country_flag: null,
      archived_at: null,
      created_at: null,
    };

    await sendChatMessage(
      [{ role: 'user', content: 'Budget tips?' }],
      mockTrip,
    );

    const body = JSON.parse(
      (mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string,
    ) as Record<string, unknown>;
    const system = body.system as string;
    expect(system).toContain('Tokyo Adventure');
    expect(system).toContain('2026-05-01');
    expect(system).toContain('$3000');
    expect(system).toContain('JP');
  });

  it('throws on API error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: { message: 'Rate limit exceeded' },
      }),
    });

    await expect(
      sendChatMessage(
        [{ role: 'user', content: 'Hello' }],
        null,
      ),
    ).rejects.toThrow('Rate limit exceeded');
  });

  it('throws when response has no text content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'msg_789',
        content: [],
        stop_reason: 'end_turn',
      }),
    });

    await expect(
      sendChatMessage(
        [{ role: 'user', content: 'Hello' }],
        null,
      ),
    ).rejects.toThrow('No text response from AI');
  });
});
