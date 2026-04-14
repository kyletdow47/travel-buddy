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
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from './reservationsService';
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

describe('reservationsService', () => {
  describe('getReservations', () => {
    it('returns reservations for a trip ordered by start_datetime', async () => {
      const mockData = [
        { id: 'res1', trip_id: 't1', start_datetime: '2026-03-01T10:00:00' },
        { id: 'res2', trip_id: 't1', start_datetime: '2026-03-02T10:00:00' },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getReservations('t1');

      expect(supabase.from).toHaveBeenCalledWith('reservations');
      expect(mockChain.eq).toHaveBeenCalledWith('trip_id', 't1');
      expect(mockChain.order).toHaveBeenCalledWith('start_datetime', { ascending: true });
      expect(result).toEqual(mockData);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(getReservations('t1')).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('createReservation', () => {
    it('inserts and returns the new reservation', async () => {
      const input = { trip_id: 't1', type: 'hotel', name: 'Hilton' };
      const created = { id: 'res3', ...input };
      mockChain.single.mockResolvedValueOnce({ data: created, error: null });

      const result = await createReservation(input as never);

      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('throws on insert error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(createReservation({} as never)).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('updateReservation', () => {
    it('updates a reservation by id', async () => {
      const updated = { id: 'res1', name: 'Marriott' };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updateReservation('res1', { name: 'Marriott' } as never);

      expect(mockChain.update).toHaveBeenCalledWith({ name: 'Marriott' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'res1');
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(updateReservation('res1', {} as never)).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('deleteReservation', () => {
    it('deletes a reservation by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deleteReservation('res1');

      expect(supabase.from).toHaveBeenCalledWith('reservations');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'res1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deleteReservation('res1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });
});
