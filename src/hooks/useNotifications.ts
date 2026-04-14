import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getNotifications,
  markRead as markReadService,
  markAllRead as markAllReadService,
  deleteNotification,
} from '../services/notificationsService';
import type { AppNotification } from '../types';

type State = {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
};

export function useNotifications() {
  const [state, setState] = useState<State>({
    notifications: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const notifications = await getNotifications();
      setState({ notifications, loading: false, error: null });
    } catch (err) {
      setState({ notifications: [], loading: false, error: String(err) });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    const updated = await markReadService(id);
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? updated : n,
      ),
    }));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllReadService();
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteNotification(id);
    setState((s) => ({
      ...s,
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  return { ...state, refresh: load, markRead, markAllRead, remove, unreadCount };
}
