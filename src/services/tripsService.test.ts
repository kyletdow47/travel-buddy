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

import { getTrips, createTrip, updateTrip, deleteTrip } from './tripsService';
import { supabase } from '../lib/supabase';

beforeEach(() => {
  vi.clearAllMocks();
  // Reset chain methods to return this
  mockChain.select.mockReturnThis();
  mockChain.insert.mockReturnThis();
  mockChain.update.mockReturnThis();
  mockChain.delete.mockReturnThis();
  mockChain.eq.mockReturnThis();
  mockChain.order.mockReturnThis();
  mockChain.single.mockReturnThis();
});

describe('tripsService', () => {
  describe('getTrips', () => {
    it('returns trips ordered by created_at descending', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip A', created_at: '2026-01-02' },
        { id: '2', name: 'Trip B', created_at: '2026-01-01' },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockTrips, error: null });

      const result = await getTrips();

      expect(supabase.from).toHaveBeenCalledWith('trips');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockTrips);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

      await expect(getTrips()).rejects.toEqual({ message: 'DB error' });
    });
  });

  describe('createTrip', () => {
    it('inserts a trip and returns the created row', async () => {
      const input = { name: 'New Trip', start_date: '2026-03-01' };
      const created = { id: '3', ...input, created_at: '2026-03-01' };
      mockChain.single.mockResolvedValueOnce({ data: created, error: null });

      const result = await createTrip(input as never);

      expect(supabase.from).toHaveBeenCalledWith('trips');
      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('throws on insert error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(createTrip({ name: 'Bad' } as never)).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('updateTrip', () => {
    it('updates a trip by id and returns updated row', async () => {
      const updates = { name: 'Updated Trip' };
      const updated = { id: '1', name: 'Updated Trip', created_at: '2026-01-01' };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updateTrip('1', updates);

      expect(supabase.from).toHaveBeenCalledWith('trips');
      expect(mockChain.update).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      await expect(updateTrip('999', { name: 'X' })).rejects.toEqual({ message: 'Not found' });
    });
  });

  describe('deleteTrip', () => {
    it('deletes a trip by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deleteTrip('1');

      expect(supabase.from).toHaveBeenCalledWith('trips');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deleteTrip('1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });
});
