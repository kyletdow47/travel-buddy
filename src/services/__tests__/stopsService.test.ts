jest.mock('../../lib/supabase');

import {
  getStops,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  updateStopStatus,
} from '../stopsService';
import type { Stop, StopInsert } from '../../types';

const {
  __setMockResult,
  __resetMocks,
  supabase,
} = require('../../lib/supabase') as {
  __setMockResult: (data: unknown, error?: unknown) => void;
  __resetMocks: () => void;
  supabase: { from: jest.Mock };
};

const mockStop: Stop = {
  id: 'stop-1',
  trip_id: 'trip-1',
  name: 'Eiffel Tower',
  location: 'Paris, France',
  lat: 48.8584,
  lng: 2.2945,
  category: 'attraction',
  planned_date: '2026-01-05',
  status: 'upcoming',
  notes: 'Must see!',
  sort_order: 0,
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('stopsService', () => {
  beforeEach(() => {
    __resetMocks();
  });

  describe('getStops', () => {
    it('returns stops for a trip', async () => {
      const stops = [mockStop, { ...mockStop, id: 'stop-2', sort_order: 1 }];
      __setMockResult(stops);

      const result = await getStops('trip-1');

      expect(result).toEqual(stops);
      expect(supabase.from).toHaveBeenCalledWith('stops');
    });

    it('throws when Supabase returns an error', async () => {
      const error = { message: 'Database error' };
      __setMockResult(null, error);

      await expect(getStops('trip-1')).rejects.toEqual(error);
    });

    it('returns empty array when no stops exist', async () => {
      __setMockResult([]);

      const result = await getStops('trip-1');

      expect(result).toEqual([]);
    });
  });

  describe('createStop', () => {
    it('creates a stop and returns it', async () => {
      __setMockResult(mockStop);

      const input: StopInsert = { name: 'Eiffel Tower', trip_id: 'trip-1' };
      const result = await createStop(input);

      expect(result).toEqual(mockStop);
      expect(supabase.from).toHaveBeenCalledWith('stops');
    });

    it('throws when insert fails', async () => {
      const error = { message: 'Insert failed' };
      __setMockResult(null, error);

      await expect(createStop({ name: 'Stop' })).rejects.toEqual(error);
    });
  });

  describe('updateStop', () => {
    it('updates a stop and returns the updated data', async () => {
      const updated = { ...mockStop, name: 'Updated Stop' };
      __setMockResult(updated);

      const result = await updateStop('stop-1', { name: 'Updated Stop' });

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('stops');
    });

    it('throws when update fails', async () => {
      const error = { message: 'Update failed' };
      __setMockResult(null, error);

      await expect(updateStop('stop-1', { name: 'Updated' })).rejects.toEqual(
        error,
      );
    });
  });

  describe('deleteStop', () => {
    it('deletes a stop without error', async () => {
      __setMockResult(null);

      await expect(deleteStop('stop-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('stops');
    });

    it('throws when delete fails', async () => {
      const error = { message: 'Delete failed' };
      __setMockResult(null, error);

      await expect(deleteStop('stop-1')).rejects.toEqual(error);
    });
  });

  describe('reorderStops', () => {
    it('updates sort_order for each stop ID', async () => {
      await reorderStops(['stop-3', 'stop-1', 'stop-2']);

      expect(supabase.from).toHaveBeenCalledTimes(3);
      expect(supabase.from).toHaveBeenCalledWith('stops');
    });

    it('handles empty array without calling Supabase', async () => {
      await reorderStops([]);

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('updateStopStatus', () => {
    it('updates status and returns the stop', async () => {
      const updated = { ...mockStop, status: 'done' };
      __setMockResult(updated);

      const result = await updateStopStatus('stop-1', 'done');

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('stops');
    });

    it('throws when update fails', async () => {
      const error = { message: 'Update failed' };
      __setMockResult(null, error);

      await expect(updateStopStatus('stop-1', 'current')).rejects.toEqual(
        error,
      );
    });
  });
});
