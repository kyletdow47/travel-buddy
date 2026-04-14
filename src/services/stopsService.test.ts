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
  getStops,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  updateStopStatus,
} from './stopsService';
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

describe('stopsService', () => {
  describe('getStops', () => {
    it('returns stops for a trip ordered by sort_order', async () => {
      const mockStops = [
        { id: 's1', trip_id: 't1', sort_order: 0 },
        { id: 's2', trip_id: 't1', sort_order: 1 },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockStops, error: null });

      const result = await getStops('t1');

      expect(supabase.from).toHaveBeenCalledWith('stops');
      expect(mockChain.eq).toHaveBeenCalledWith('trip_id', 't1');
      expect(mockChain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toEqual(mockStops);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(getStops('t1')).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('createStop', () => {
    it('inserts a stop and returns the created row', async () => {
      const input = { trip_id: 't1', name: 'Stop 1', sort_order: 0 };
      const created = { id: 's1', ...input };
      mockChain.single.mockResolvedValueOnce({ data: created, error: null });

      const result = await createStop(input as never);

      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('throws on insert error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(createStop({} as never)).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('updateStop', () => {
    it('updates a stop by id', async () => {
      const updated = { id: 's1', name: 'Updated Stop' };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updateStop('s1', { name: 'Updated Stop' });

      expect(mockChain.update).toHaveBeenCalledWith({ name: 'Updated Stop' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 's1');
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(updateStop('s1', {})).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('deleteStop', () => {
    it('deletes a stop by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deleteStop('s1');

      expect(supabase.from).toHaveBeenCalledWith('stops');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 's1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deleteStop('s1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });

  describe('reorderStops', () => {
    it('updates sort_order for each stop id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });
      mockChain.eq.mockResolvedValueOnce({ error: null });
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await reorderStops(['s3', 's1', 's2']);

      expect(supabase.from).toHaveBeenCalledWith('stops');
      // Called 3 times for 3 ids
      expect(mockChain.update).toHaveBeenCalledWith({ sort_order: 0 });
      expect(mockChain.update).toHaveBeenCalledWith({ sort_order: 1 });
      expect(mockChain.update).toHaveBeenCalledWith({ sort_order: 2 });
    });
  });

  describe('updateStopStatus', () => {
    it('updates status and returns the stop', async () => {
      const updated = { id: 's1', status: 'current' };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updateStopStatus('s1', 'current');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'current' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 's1');
      expect(result).toEqual(updated);
    });

    it('throws on error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(updateStopStatus('s1', 'done')).rejects.toEqual({ message: 'fail' });
    });
  });
});
