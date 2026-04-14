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
  getPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  togglePacked,
} from './packingService';
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

describe('packingService', () => {
  describe('getPackingItems', () => {
    it('returns packing items for a trip ordered by created_at', async () => {
      const mockItems = [
        { id: 'p1', trip_id: 't1', name: 'Shirt', packed: false },
        { id: 'p2', trip_id: 't1', name: 'Shoes', packed: true },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockItems, error: null });

      const result = await getPackingItems('t1');

      expect(supabase.from).toHaveBeenCalledWith('packing_items');
      expect(mockChain.eq).toHaveBeenCalledWith('trip_id', 't1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockItems);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(getPackingItems('t1')).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('createPackingItem', () => {
    it('inserts and returns the new packing item', async () => {
      const input = { trip_id: 't1', name: 'Jacket', packed: false };
      const created = { id: 'p3', ...input };
      mockChain.single.mockResolvedValueOnce({ data: created, error: null });

      const result = await createPackingItem(input as never);

      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('throws on insert error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(createPackingItem({} as never)).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('updatePackingItem', () => {
    it('updates a packing item by id', async () => {
      const updated = { id: 'p1', name: 'T-Shirt' };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updatePackingItem('p1', { name: 'T-Shirt' } as never);

      expect(mockChain.update).toHaveBeenCalledWith({ name: 'T-Shirt' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'p1');
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(updatePackingItem('p1', {} as never)).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('deletePackingItem', () => {
    it('deletes a packing item by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deletePackingItem('p1');

      expect(supabase.from).toHaveBeenCalledWith('packing_items');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'p1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deletePackingItem('p1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });

  describe('togglePacked', () => {
    it('sets packed to true and returns updated item', async () => {
      const updated = { id: 'p1', name: 'Shirt', packed: true };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await togglePacked('p1', true);

      expect(mockChain.update).toHaveBeenCalledWith({ packed: true });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'p1');
      expect(result).toEqual(updated);
    });

    it('sets packed to false and returns updated item', async () => {
      const updated = { id: 'p1', name: 'Shirt', packed: false };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await togglePacked('p1', false);

      expect(mockChain.update).toHaveBeenCalledWith({ packed: false });
      expect(result).toEqual(updated);
    });

    it('throws on error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(togglePacked('p1', true)).rejects.toEqual({ message: 'fail' });
    });
  });
});
