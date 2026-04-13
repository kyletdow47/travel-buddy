jest.mock('../../lib/supabase');

import {
  getConversation,
  upsertConversation,
  appendMessage,
  clearConversation,
} from '../conversationsService';
import type { Message } from '../conversationsService';
import type { Conversation } from '../../types';

const {
  __setMockResult,
  __enqueueMockResult,
  __resetMocks,
  supabase,
} = require('../../lib/supabase') as {
  __setMockResult: (data: unknown, error?: unknown) => void;
  __enqueueMockResult: (data: unknown, error?: unknown) => void;
  __resetMocks: () => void;
  supabase: { from: jest.Mock };
};

const mockMessage: Message = {
  role: 'user',
  content: 'Hello, help me plan my trip!',
  timestamp: '2026-01-01T12:00:00.000Z',
};

const mockAssistantMessage: Message = {
  role: 'assistant',
  content: "I'd love to help! Where are you headed?",
  timestamp: '2026-01-01T12:00:01.000Z',
};

const mockConversation: Conversation = {
  id: 'conv-1',
  trip_id: 'trip-1',
  messages: [mockMessage] as unknown as Conversation['messages'],
  updated_at: '2026-01-01T12:00:00.000Z',
};

describe('conversationsService', () => {
  beforeEach(() => {
    __resetMocks();
  });

  describe('getConversation', () => {
    it('returns a conversation for a trip', async () => {
      __setMockResult(mockConversation);

      const result = await getConversation('trip-1');

      expect(result).toEqual(mockConversation);
      expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('returns null when no conversation exists', async () => {
      __setMockResult(null);

      const result = await getConversation('trip-1');

      expect(result).toBeNull();
    });

    it('throws when Supabase returns an error', async () => {
      const error = { message: 'Database error' };
      __setMockResult(null, error);

      await expect(getConversation('trip-1')).rejects.toEqual(error);
    });
  });

  describe('upsertConversation', () => {
    it('upserts a conversation with messages', async () => {
      __setMockResult(mockConversation);

      const result = await upsertConversation('trip-1', [mockMessage]);

      expect(result).toEqual(mockConversation);
      expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('throws when upsert fails', async () => {
      const error = { message: 'Upsert failed' };
      __setMockResult(null, error);

      await expect(
        upsertConversation('trip-1', [mockMessage]),
      ).rejects.toEqual(error);
    });
  });

  describe('appendMessage', () => {
    it('appends a message to an existing conversation', async () => {
      const updatedConversation: Conversation = {
        ...mockConversation,
        messages: [
          mockMessage,
          mockAssistantMessage,
        ] as unknown as Conversation['messages'],
      };

      // First call: getConversation returns existing
      __enqueueMockResult(mockConversation);
      // Second call: upsertConversation returns updated
      __enqueueMockResult(updatedConversation);

      const result = await appendMessage('trip-1', mockAssistantMessage);

      expect(result).toEqual(updatedConversation);
      expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('creates a new conversation when none exists', async () => {
      const newConversation: Conversation = {
        id: 'conv-new',
        trip_id: 'trip-1',
        messages: [mockMessage] as unknown as Conversation['messages'],
        updated_at: '2026-01-01T12:00:00.000Z',
      };

      // First call: getConversation returns null (no existing conversation)
      __enqueueMockResult(null);
      // Second call: upsertConversation creates and returns new
      __enqueueMockResult(newConversation);

      const result = await appendMessage('trip-1', mockMessage);

      expect(result).toEqual(newConversation);
    });

    it('throws when getConversation fails', async () => {
      const error = { message: 'Fetch failed' };
      __setMockResult(null, error);

      await expect(appendMessage('trip-1', mockMessage)).rejects.toEqual(
        error,
      );
    });
  });

  describe('clearConversation', () => {
    it('clears messages without error', async () => {
      __setMockResult(null);

      await expect(clearConversation('trip-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('throws when clear fails', async () => {
      const error = { message: 'Update failed' };
      __setMockResult(null, error);

      await expect(clearConversation('trip-1')).rejects.toEqual(error);
    });
  });
});
