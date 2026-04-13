jest.mock('../../src/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import {
  getStops,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  updateStopStatus,
} from '../../src/services/stopsService';
import { supabase } from '../../src/lib/supabase';

const mockFrom = supabase.from as jest.Mock;

const STOP = {
  id: 's1',
  trip_id: 't1',
  name: 'Eiffel Tower',
  category: 'activity',
  status: 'upcoming',
  sort_order: 0,
  location: 'Paris, France',
  planned_date: '2026-06-03',
  notes: null,
  lat: 48.8584,
  lng: 2.2945,
  created_at: '2026-01-01T00:00:00Z',
};

afterEach(() => jest.clearAllMocks());

describe('getStops', () => {
  it('returns stops for a trip', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [STOP], error: null }),
    });

    const result = await getStops('t1');
    expect(result).toEqual([STOP]);
    expect(mockFrom).toHaveBeenCalledWith('stops');
  });

  it('throws on error', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });

    await expect(getStops('t1')).rejects.toThrow('DB error');
  });
});

describe('createStop', () => {
  it('returns the created stop', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: STOP, error: null }),
    });

    const result = await createStop({ trip_id: 't1', name: 'Eiffel Tower', sort_order: 0 });
    expect(result).toEqual(STOP);
  });

  it('throws on error', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
    });

    await expect(
      createStop({ trip_id: 't1', name: 'Eiffel Tower', sort_order: 0 })
    ).rejects.toThrow('Insert failed');
  });
});

describe('updateStop', () => {
  it('returns the updated stop', async () => {
    const updated = { ...STOP, name: 'Louvre' };
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    });

    const result = await updateStop('s1', { name: 'Louvre' });
    expect(result).toEqual(updated);
  });
});

describe('deleteStop', () => {
  it('resolves on success', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    await expect(deleteStop('s1')).resolves.toBeUndefined();
    expect(mockEq).toHaveBeenCalledWith('id', 's1');
  });

  it('throws on error', async () => {
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Delete failed') }),
      }),
    });

    await expect(deleteStop('s1')).rejects.toThrow('Delete failed');
  });
});

describe('reorderStops', () => {
  it('issues an update for each stop id', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await reorderStops(['s1', 's2', 's3']);

    expect(mockUpdate).toHaveBeenCalledTimes(3);
    expect(mockUpdate).toHaveBeenCalledWith({ sort_order: 0 });
    expect(mockUpdate).toHaveBeenCalledWith({ sort_order: 1 });
    expect(mockUpdate).toHaveBeenCalledWith({ sort_order: 2 });
  });
});

describe('updateStopStatus', () => {
  it('returns stop with new status', async () => {
    const updated = { ...STOP, status: 'current' };
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    });

    const result = await updateStopStatus('s1', 'current');
    expect(result).toEqual(updated);
    expect(result.status).toBe('current');
  });
});
