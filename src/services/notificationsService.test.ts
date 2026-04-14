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
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from './notificationsService';
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

describe('notificationsService', () => {
  describe('getNotifications', () => {
    it('returns notifications ordered by created_at descending', async () => {
      const mockNotifs = [
        { id: 'n1', read: false, created_at: '2026-03-02' },
        { id: 'n2', read: true, created_at: '2026-03-01' },
      ];
      mockChain.order.mockResolvedValueOnce({ data: mockNotifs, error: null });

      const result = await getNotifications();

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockNotifs);
    });

    it('throws on error', async () => {
      mockChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(getNotifications()).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('markRead', () => {
    it('marks a notification as read and returns it', async () => {
      const updated = { id: 'n1', read: true };
      mockChain.single.mockResolvedValueOnce({ data: updated, error: null });

      const result = await markRead('n1');

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockChain.update).toHaveBeenCalledWith({ read: true });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'n1');
      expect(result).toEqual(updated);
    });

    it('throws on error', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });

      await expect(markRead('n1')).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('markAllRead', () => {
    it('updates all unread notifications to read', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await markAllRead();

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockChain.update).toHaveBeenCalledWith({ read: true });
      expect(mockChain.eq).toHaveBeenCalledWith('read', false);
    });

    it('throws on error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'fail' } });

      await expect(markAllRead()).rejects.toEqual({ message: 'fail' });
    });
  });

  describe('deleteNotification', () => {
    it('deletes a notification by id', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: null });

      await deleteNotification('n1');

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'n1');
    });

    it('throws on delete error', async () => {
      mockChain.eq.mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      await expect(deleteNotification('n1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });
});
