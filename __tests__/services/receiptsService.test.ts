jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: { from: jest.fn() },
  },
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn((s: string) => s),
}));

import {
  getReceipt,
  getReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  uploadReceiptImage,
  syncTripSpent,
} from '../../src/services/receiptsService';
import { supabase } from '../../src/lib/supabase';
import * as FileSystem from 'expo-file-system';

const mockFrom = supabase.from as jest.Mock;
const mockStorageFrom = supabase.storage.from as jest.Mock;

const RECEIPT = {
  id: 'r1',
  trip_id: 't1',
  stop_id: null,
  merchant: 'Café de Flore',
  amount: 42.5,
  category: 'food',
  receipt_date: '2026-06-03',
  image_url: null,
  notes: null,
  lat: null,
  lng: null,
  created_at: '2026-01-01T00:00:00Z',
};

afterEach(() => jest.clearAllMocks());

describe('getReceipt', () => {
  it('returns a single receipt', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: RECEIPT, error: null }),
    });

    const result = await getReceipt('r1');
    expect(result).toEqual(RECEIPT);
  });

  it('throws on error', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    });

    await expect(getReceipt('r1')).rejects.toThrow('Not found');
  });
});

describe('getReceipts', () => {
  it('returns receipts for a trip', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [RECEIPT], error: null }),
    });

    const result = await getReceipts('t1');
    expect(result).toEqual([RECEIPT]);
    expect(mockFrom).toHaveBeenCalledWith('receipts');
  });
});

describe('createReceipt', () => {
  it('returns the created receipt', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: RECEIPT, error: null }),
    });

    const result = await createReceipt({ trip_id: 't1', merchant: 'Café de Flore', amount: 42.5 });
    expect(result).toEqual(RECEIPT);
  });
});

describe('updateReceipt', () => {
  it('returns the updated receipt', async () => {
    const updated = { ...RECEIPT, amount: 50 };
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    });

    const result = await updateReceipt('r1', { amount: 50 });
    expect(result).toEqual(updated);
  });
});

describe('deleteReceipt', () => {
  it('resolves on success', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    await expect(deleteReceipt('r1')).resolves.toBeUndefined();
    expect(mockEq).toHaveBeenCalledWith('id', 'r1');
  });
});

describe('syncTripSpent', () => {
  it('sums receipt amounts and updates trip spent', async () => {
    const receipts = [{ amount: 50 }, { amount: 30 }, { amount: 20 }];

    // First from() call: fetch receipt amounts
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: receipts, error: null }),
    });

    // Second from() call: update trip spent
    const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq });
    mockFrom.mockReturnValueOnce({ update: mockUpdate });

    await syncTripSpent('t1');

    expect(mockUpdate).toHaveBeenCalledWith({ spent: 100 });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 't1');
  });

  it('throws if the receipts fetch fails', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: new Error('Fetch failed') }),
    });

    await expect(syncTripSpent('t1')).rejects.toThrow('Fetch failed');
  });
});

describe('uploadReceiptImage', () => {
  it('uploads image and returns public URL', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

    const mockStorage = {
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest
        .fn()
        .mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/r1.jpg' } }),
    };
    mockStorageFrom.mockReturnValue(mockStorage);

    const url = await uploadReceiptImage('file:///tmp/photo.jpg', 'r1');

    expect(url).toBe('https://cdn.example.com/r1.jpg');
    expect(mockStorage.upload).toHaveBeenCalledWith(
      'r1.jpg',
      expect.anything(),
      expect.objectContaining({ contentType: 'image/jpeg', upsert: true })
    );
  });

  it('throws if storage upload fails', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');
    mockStorageFrom.mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: new Error('Upload failed') }),
      getPublicUrl: jest.fn(),
    });

    await expect(uploadReceiptImage('file:///tmp/photo.jpg', 'r1')).rejects.toThrow(
      'Upload failed'
    );
  });
});
