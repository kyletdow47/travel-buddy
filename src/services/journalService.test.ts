import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
} from './journalService';
import { supabase } from '../lib/supabase';

beforeEach(() => {
  vi.clearAllMocks();
  mockChain.select.mockReturnThis();
  mockChain.insert.mockReturnThis();
  mockChain.update.mockReturnThis();
  mockChain.delete.mockReturnThis();
  mockChain.eq.mockReturnThis();
  mockChain.order.mockReturnThis();
  mockChain.single.mockReturnThis();
});

describe('journalService', () => {
  describe('getEntries', () => {
    it('returns journal entries for a trip ordered by created_at descending', async () => {
      const mockEntries = [
        { id: 'j1', trip_id: 't1', body: 'Day 2', created_at: '2026-03-02' },
        { id: 'j2', trip_id: 't1', body: 'Day 1', created_at: '2026-03-01' },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockEntries, error: null });

      const result = await getEntries('t1');

      expect(supabase.from).toHaveBeenCalledWith('journal_entries');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('trip_id', 't1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockEntries);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(getEntries('t1')).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('createEntry', () => {
    it('inserts and returns the new journal entry', async () => {
      const input = { trip_id: 't1', body: 'Great day!' };
      const created = { id: 'j3', ...input, created_at: '2026-03-03' };
      mockChain.single.mockResolvedValueOnce({ data: created, error: null });

      const result = await createEntry(input as never);

      expect(supabase.from).toHaveBeenCalledWith('journal_entries');
      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('throws on insert error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(createEntry({} as never)).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('updateEntry', () => {
    it('updates a journal entry by id', async () => {
      const updated = { id: 'j1', body: 'Updated text' };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updateEntry('j1', { body: 'Updated text' } as never);

      expect(supabase.from).toHaveBeenCalledWith('journal_entries');
      expect(mockChain.update).toHaveBeenCalledWith({ body: 'Updated text' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'j1');
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(updateEntry('j1', {} as never)).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('deleteEntry', () => {
    it('deletes a journal entry by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deleteEntry('j1');

      expect(supabase.from).toHaveBeenCalledWith('journal_entries');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'j1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deleteEntry('j1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });
});
