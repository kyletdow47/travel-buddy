jest.mock('../../src/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import { getTrips, createTrip, updateTrip, deleteTrip } from '../../src/services/tripsService';
import { supabase } from '../../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

const TRIP = {
  id: '1',
  name: 'Paris 2026',
  status: 'planning',
  budget: 2000,
  spent: 400,
  start_date: '2026-06-01',
  end_date: '2026-06-10',
  created_at: '2026-01-01T00:00:00Z',
};

afterEach(() => jest.clearAllMocks());

describe('getTrips', () => {
  it('returns trips array on success', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [TRIP], error: null }),
    });

    const result = await getTrips();
    expect(result).toEqual([TRIP]);
    expect(mockFrom).toHaveBeenCalledWith('trips');
  });

  it('throws when supabase returns an error', async () => {
    const dbError = new Error('DB error');
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: dbError }),
    });

    await expect(getTrips()).rejects.toThrow('DB error');
  });
});

describe('createTrip', () => {
  it('returns the created trip', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: TRIP, error: null }),
    });

    const result = await createTrip({ name: 'Paris 2026', status: 'planning' });
    expect(result).toEqual(TRIP);
    expect(mockFrom).toHaveBeenCalledWith('trips');
  });

  it('throws on insert error', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
    });

    await expect(createTrip({ name: 'Paris 2026', status: 'planning' })).rejects.toThrow(
      'Insert failed'
    );
  });
});

describe('updateTrip', () => {
  it('returns the updated trip', async () => {
    const updated = { ...TRIP, name: 'Rome 2026' };
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    });

    const result = await updateTrip('1', { name: 'Rome 2026' });
    expect(result).toEqual(updated);
  });

  it('throws on update error', async () => {
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
    });

    await expect(updateTrip('1', { name: 'Rome 2026' })).rejects.toThrow('Update failed');
  });
});

describe('deleteTrip', () => {
  it('resolves without a value on success', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    await expect(deleteTrip('1')).resolves.toBeUndefined();
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('throws on delete error', async () => {
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Delete failed') }),
      }),
    });

    await expect(deleteTrip('1')).rejects.toThrow('Delete failed');
  });
});
