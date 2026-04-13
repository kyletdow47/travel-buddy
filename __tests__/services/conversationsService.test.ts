jest.mock('../../src/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import {
  getConversation,
  upsertConversation,
  appendMessage,
  clearConversation,
} from '../../src/services/conversationsService';
import type { Message } from '../../src/services/conversationsService';
import { supabase } from '../../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

const MSG_USER: Message = { role: 'user', content: 'Hello', timestamp: '2026-01-01T00:00:00Z' };
const MSG_AI: Message = {
  role: 'assistant',
  content: 'Hi there!',
  timestamp: '2026-01-01T00:00:01Z',
};

const CONVERSATION = {
  id: 'c1',
  trip_id: 't1',
  messages: [MSG_USER, MSG_AI],
  updated_at: '2026-01-01T00:00:01Z',
};

afterEach(() => jest.clearAllMocks());

describe('getConversation', () => {
  it('returns conversation when found', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: CONVERSATION, error: null }),
    });

    const result = await getConversation('t1');
    expect(result).toEqual(CONVERSATION);
    expect(mockFrom).toHaveBeenCalledWith('conversations');
  });

  it('returns null when no conversation exists', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getConversation('t1');
    expect(result).toBeNull();
  });

  it('throws on error', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });

    await expect(getConversation('t1')).rejects.toThrow('DB error');
  });
});

describe('upsertConversation', () => {
  it('upserts and returns the conversation', async () => {
    mockFrom.mockReturnValue({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CONVERSATION, error: null }),
    });

    const result = await upsertConversation('t1', [MSG_USER, MSG_AI]);
    expect(result).toEqual(CONVERSATION);
  });

  it('throws on upsert error', async () => {
    mockFrom.mockReturnValue({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Upsert failed') }),
    });

    await expect(upsertConversation('t1', [])).rejects.toThrow('Upsert failed');
  });
});

describe('appendMessage', () => {
  it('accumulates messages: existing + new', async () => {
    const existingConversation = { ...CONVERSATION, messages: [MSG_USER] };
    const expectedMessages = [MSG_USER, MSG_AI];

    // First call: getConversation
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: existingConversation, error: null }),
    });

    // Second call: upsertConversation
    const updatedConversation = { ...CONVERSATION, messages: expectedMessages };
    const mockSingle = jest.fn().mockResolvedValue({ data: updatedConversation, error: null });
    mockFrom.mockReturnValueOnce({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: mockSingle,
    });

    const result = await appendMessage('t1', MSG_AI);

    expect(result).toEqual(updatedConversation);
    // Verify the upsert received the accumulated messages
    const upsertArg = (mockFrom.mock.results[1].value.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertArg.messages).toEqual(expectedMessages);
  });

  it('starts fresh when no existing conversation', async () => {
    // getConversation returns null
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    const newConversation = { ...CONVERSATION, messages: [MSG_USER] };
    mockFrom.mockReturnValueOnce({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: newConversation, error: null }),
    });

    const result = await appendMessage('t1', MSG_USER);
    expect(result).toEqual(newConversation);

    const upsertArg = (mockFrom.mock.results[1].value.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertArg.messages).toEqual([MSG_USER]);
  });
});

describe('clearConversation', () => {
  it('updates messages to empty array', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await clearConversation('t1');

    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.messages).toEqual([]);
    expect(mockEq).toHaveBeenCalledWith('trip_id', 't1');
  });
});
