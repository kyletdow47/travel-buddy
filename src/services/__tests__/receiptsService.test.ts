jest.mock('../../lib/supabase');
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('bW9ja2Jhc2U2NA==')),
}));
jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn(() => new ArrayBuffer(8)),
}));

import {
  getReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  uploadReceiptImage,
  syncTripSpent,
} from '../receiptsService';
import type { Receipt, ReceiptInsert } from '../../types';

const {
  __setMockResult,
  __enqueueMockResult,
  __resetMocks,
  __setStorageUploadError,
  __setStoragePublicUrl,
  supabase,
} = require('../../lib/supabase') as {
  __setMockResult: (data: unknown, error?: unknown) => void;
  __enqueueMockResult: (data: unknown, error?: unknown) => void;
  __resetMocks: () => void;
  __setStorageUploadError: (error: unknown) => void;
  __setStoragePublicUrl: (url: string) => void;
  supabase: { from: jest.Mock; storage: { from: jest.Mock } };
};

const mockReceipt: Receipt = {
  id: 'receipt-1',
  trip_id: 'trip-1',
  stop_id: 'stop-1',
  merchant: 'Cafe Paris',
  amount: 42.5,
  category: 'food',
  receipt_date: '2026-01-05',
  image_url: null,
  notes: 'Lunch',
  lat: 48.8584,
  lng: 2.2945,
  created_at: '2026-01-05T12:00:00.000Z',
};

describe('receiptsService', () => {
  beforeEach(() => {
    __resetMocks();
  });

  describe('getReceipts', () => {
    it('returns receipts for a trip', async () => {
      const receipts = [mockReceipt, { ...mockReceipt, id: 'receipt-2' }];
      __setMockResult(receipts);

      const result = await getReceipts('trip-1');

      expect(result).toEqual(receipts);
      expect(supabase.from).toHaveBeenCalledWith('receipts');
    });

    it('throws when Supabase returns an error', async () => {
      const error = { message: 'Database error' };
      __setMockResult(null, error);

      await expect(getReceipts('trip-1')).rejects.toEqual(error);
    });

    it('returns empty array when no receipts exist', async () => {
      __setMockResult([]);

      const result = await getReceipts('trip-1');

      expect(result).toEqual([]);
    });
  });

  describe('createReceipt', () => {
    it('creates a receipt and returns it', async () => {
      __setMockResult(mockReceipt);

      const input: ReceiptInsert = {
        amount: 42.5,
        merchant: 'Cafe Paris',
        trip_id: 'trip-1',
      };
      const result = await createReceipt(input);

      expect(result).toEqual(mockReceipt);
      expect(supabase.from).toHaveBeenCalledWith('receipts');
    });

    it('throws when insert fails', async () => {
      const error = { message: 'Insert failed' };
      __setMockResult(null, error);

      await expect(createReceipt({ amount: 10 })).rejects.toEqual(error);
    });
  });

  describe('updateReceipt', () => {
    it('updates a receipt and returns the updated data', async () => {
      const updated = { ...mockReceipt, amount: 60 };
      __setMockResult(updated);

      const result = await updateReceipt('receipt-1', { amount: 60 });

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('receipts');
    });

    it('throws when update fails', async () => {
      const error = { message: 'Update failed' };
      __setMockResult(null, error);

      await expect(
        updateReceipt('receipt-1', { amount: 60 }),
      ).rejects.toEqual(error);
    });
  });

  describe('deleteReceipt', () => {
    it('deletes a receipt without error', async () => {
      __setMockResult(null);

      await expect(deleteReceipt('receipt-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('receipts');
    });

    it('throws when delete fails', async () => {
      const error = { message: 'Delete failed' };
      __setMockResult(null, error);

      await expect(deleteReceipt('receipt-1')).rejects.toEqual(error);
    });
  });

  describe('uploadReceiptImage', () => {
    it('uploads image and returns public URL', async () => {
      const expectedUrl = 'https://storage.example.com/receipts/receipt-1.jpg';
      __setStoragePublicUrl(expectedUrl);

      const result = await uploadReceiptImage(
        'file:///tmp/photo.jpg',
        'receipt-1',
      );

      expect(result).toBe(expectedUrl);
      expect(supabase.storage.from).toHaveBeenCalledWith('receipts');
    });

    it('throws when storage upload fails', async () => {
      const error = { message: 'Upload failed' };
      __setStorageUploadError(error);

      await expect(
        uploadReceiptImage('file:///tmp/photo.jpg', 'receipt-1'),
      ).rejects.toEqual(error);
    });
  });

  describe('syncTripSpent', () => {
    it('sums receipt amounts and updates trip spent', async () => {
      __enqueueMockResult([{ amount: 50 }, { amount: 30 }, { amount: 20 }]);
      __enqueueMockResult(null);

      await syncTripSpent('trip-1');

      expect(supabase.from).toHaveBeenCalledWith('receipts');
      expect(supabase.from).toHaveBeenCalledWith('trips');
    });

    it('sets spent to 0 when no receipts exist', async () => {
      __enqueueMockResult([]);
      __enqueueMockResult(null);

      await syncTripSpent('trip-1');

      expect(supabase.from).toHaveBeenCalledWith('receipts');
      expect(supabase.from).toHaveBeenCalledWith('trips');
    });

    it('throws when fetching receipts fails', async () => {
      const error = { message: 'Fetch failed' };
      __setMockResult(null, error);

      await expect(syncTripSpent('trip-1')).rejects.toEqual(error);
    });

    it('throws when updating trip spent fails', async () => {
      const error = { message: 'Update failed' };
      __enqueueMockResult([{ amount: 50 }]);
      __enqueueMockResult(null, error);

      await expect(syncTripSpent('trip-1')).rejects.toEqual(error);
    });

    it('handles null amounts gracefully', async () => {
      __enqueueMockResult([
        { amount: 50 },
        { amount: null },
        { amount: 25 },
      ]);
      __enqueueMockResult(null);

      await syncTripSpent('trip-1');

      expect(supabase.from).toHaveBeenCalledWith('trips');
    });
  });
});
