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

const mockStorageChain = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    storage: {
      from: vi.fn(() => mockStorageChain),
    },
  },
}));

vi.mock('expo-file-system', () => ({
  readAsStringAsync: vi.fn().mockResolvedValue('base64data'),
}));

vi.mock('base64-arraybuffer', () => ({
  decode: vi.fn().mockReturnValue(new ArrayBuffer(8)),
}));

import {
  getReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  uploadReceiptImage,
  syncTripSpent,
} from './receiptsService';
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

describe('receiptsService', () => {
  describe('getReceipts', () => {
    it('returns receipts for a trip ordered by receipt_date descending', async () => {
      const mockReceipts = [
        { id: 'r1', trip_id: 't1', amount: 50 },
        { id: 'r2', trip_id: 't1', amount: 30 },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockReceipts, error: null });

      const result = await getReceipts('t1');

      expect(supabase.from).toHaveBeenCalledWith('receipts');
      expect(mockChain.eq).toHaveBeenCalledWith('trip_id', 't1');
      expect(mockChain.order).toHaveBeenCalledWith('receipt_date', { ascending: false });
      expect(result).toEqual(mockReceipts);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(getReceipts('t1')).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('createReceipt', () => {
    it('inserts and returns the new receipt', async () => {
      const input = { trip_id: 't1', amount: 25, description: 'Lunch' };
      const created = { id: 'r3', ...input };
      mockChain.single.mockResolvedValueOnce({ data: created, error: null });

      const result = await createReceipt(input as never);

      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it('throws on insert error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(createReceipt({} as never)).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('updateReceipt', () => {
    it('updates a receipt by id', async () => {
      const updated = { id: 'r1', amount: 100 };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await updateReceipt('r1', { amount: 100 } as never);

      expect(mockChain.update).toHaveBeenCalledWith({ amount: 100 });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'r1');
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(updateReceipt('r1', {} as never)).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('deleteReceipt', () => {
    it('deletes a receipt by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deleteReceipt('r1');

      expect(supabase.from).toHaveBeenCalledWith('receipts');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'r1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deleteReceipt('r1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });

  describe('uploadReceiptImage', () => {
    it('uploads image and returns public URL', async () => {
      mockStorageChain.upload.mockResolvedValueOnce({ error: null });
      mockStorageChain.getPublicUrl.mockReturnValueOnce({
        data: { publicUrl: 'https://example.com/r1.jpg' },
      });

      const result = await uploadReceiptImage('file:///photo.jpg', 'r1');

      expect(supabase.storage.from).toHaveBeenCalledWith('receipts');
      expect(mockStorageChain.upload).toHaveBeenCalledWith(
        'r1.jpg',
        expect.any(ArrayBuffer),
        { contentType: 'image/jpeg', upsert: true }
      );
      expect(result).toBe('https://example.com/r1.jpg');
    });

    it('throws on upload error', async () => {
      mockStorageChain.upload.mockResolvedValueOnce({ error: { message: 'Upload failed' } });

      await expect(uploadReceiptImage('file:///photo.jpg', 'r1')).rejects.toEqual({
        message: 'Upload failed',
      });
    });
  });

  describe('syncTripSpent', () => {
    it('sums receipt amounts and updates the trip spent field', async () => {
      const receipts = [{ amount: 10 }, { amount: 20 }, { amount: 30 }];
      // First call: select receipts
      mockChain.eq.mockResolvedValueOnce({ data: receipts, error: null });
      // Second call: update trip
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await syncTripSpent('t1');

      expect(supabase.from).toHaveBeenCalledWith('receipts');
      expect(supabase.from).toHaveBeenCalledWith('trips');
      expect(mockChain.update).toHaveBeenCalledWith({ spent: 60 });
    });

    it('throws if fetching receipts fails', async () => {
      mockChain.eq.mockResolvedValueOnce({ data: null, error: { message: 'fetch fail' } });

      await expect(syncTripSpent('t1')).rejects.toEqual({ message: 'fetch fail' });
    });
  });
});
