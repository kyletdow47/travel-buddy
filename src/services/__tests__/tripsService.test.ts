jest.mock('../../lib/supabase');

import { getTrips, createTrip, updateTrip, deleteTrip } from '../tripsService';
import type { Trip, TripInsert } from '../../types';

const {
  __setMockResult,
  __resetMocks,
  supabase,
} = require('../../lib/supabase') as {
  __setMockResult: (data: unknown, error?: unknown) => void;
  __resetMocks: () => void;
  supabase: { from: jest.Mock };
};

const mockTrip: Trip = {
  id: 'trip-1',
  name: 'Test Trip',
  start_date: '2026-01-01',
  end_date: '2026-01-10',
  budget: 5000,
  spent: 1500,
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('tripsService', () => {
  beforeEach(() => {
    __resetMocks();
  });

  describe('getTrips', () => {
    it('returns trips on success', async () => {
      const trips = [mockTrip, { ...mockTrip, id: 'trip-2', name: 'Trip 2' }];
      __setMockResult(trips);

      const result = await getTrips();

      expect(result).toEqual(trips);
      expect(supabase.from).toHaveBeenCalledWith('trips');
    });

    it('throws when Supabase returns an error', async () => {
      const error = { message: 'Database error' };
      __setMockResult(null, error);

      await expect(getTrips()).rejects.toEqual(error);
    });

    it('returns empty array when no trips exist', async () => {
      __setMockResult([]);

      const result = await getTrips();

      expect(result).toEqual([]);
    });
  });

  describe('createTrip', () => {
    it('creates a trip and returns it', async () => {
      __setMockResult(mockTrip);

      const input: TripInsert = { name: 'Test Trip', budget: 5000 };
      const result = await createTrip(input);

      expect(result).toEqual(mockTrip);
      expect(supabase.from).toHaveBeenCalledWith('trips');
    });

    it('throws when insert fails', async () => {
      const error = { message: 'Insert failed' };
      __setMockResult(null, error);

      await expect(createTrip({ name: 'Test' })).rejects.toEqual(error);
    });
  });

  describe('updateTrip', () => {
    it('updates a trip and returns the updated data', async () => {
      const updated = { ...mockTrip, name: 'Updated Trip' };
      __setMockResult(updated);

      const result = await updateTrip('trip-1', { name: 'Updated Trip' });

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('trips');
    });

    it('throws when update fails', async () => {
      const error = { message: 'Update failed' };
      __setMockResult(null, error);

      await expect(updateTrip('trip-1', { name: 'Updated' })).rejects.toEqual(
        error,
      );
    });
  });

  describe('deleteTrip', () => {
    it('deletes a trip without error', async () => {
      __setMockResult(null);

      await expect(deleteTrip('trip-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('trips');
    });

    it('throws when delete fails', async () => {
      const error = { message: 'Delete failed' };
      __setMockResult(null, error);

      await expect(deleteTrip('trip-1')).rejects.toEqual(error);
    });
  });
});
