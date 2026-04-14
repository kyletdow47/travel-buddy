import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { AppNotification } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type NotificationType = 'reminder' | 'alert' | 'update' | 'social';

const TYPE_META: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  reminder: { icon: 'notifications-outline', color: Colors.info },
  alert: { icon: 'warning-outline', color: Colors.warning },
  update: { icon: 'refresh-outline', color: Colors.success },
  social: { icon: 'people-outline', color: Colors.category.culture },
};

function normalizeType(raw: string | null | undefined): NotificationType {
  const value = (raw ?? '').toLowerCase();
  if (value === 'reminder' || value === 'alert' || value === 'update' || value === 'social') {
    return value;
  }
  return 'reminder';
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type Props = {
  notification: AppNotification;
  onPress?: () => void;
};

function NotificationRowBase({ notification, onPress }: Props) {
  const type = normalizeType(notification.type);
  const meta = TYPE_META[type];
  const unread = !notification.read;

  return (
    <TouchableOpacity
      style={[styles.row, unread && styles.rowUnread]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}20` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.center}>
        <Text
          style={[styles.title, unread && styles.titleUnread]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        {notification.body ? (
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        ) : null}
        <Text style={styles.time}>
          {formatRelativeTime(notification.created_at)}
        </Text>
      </View>

      {unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export const NotificationRow = memo(NotificationRowBase);

export function NotificationSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  rowUnread: {
    backgroundColor: Colors.primaryLight + '30',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  title: {
    ...Typography.bodyMed,
    color: Colors.text,
  },
  titleUnread: {
    fontWeight: '700',
  },
  body: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  time: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.info,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 40 + Spacing.md,
  },
});
