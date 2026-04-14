import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotifications } from '../src/hooks/useNotifications';
import {
  NotificationRow,
  NotificationSeparator,
} from '../src/components/NotificationRow';
import { AnimatedEnter } from '../src/components/AnimatedEnter';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/constants/theme';
import { haptics } from '../src/lib/haptics';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    loading,
    refresh,
    markRead,
    markAllRead,
    unreadCount,
  } = useNotifications();

  const handleMarkAllRead = useCallback(async () => {
    haptics.success();
    await markAllRead();
  }, [markAllRead]);

  const handlePress = useCallback(
    async (id: string) => {
      haptics.selection();
      await markRead(id);
    },
    [markRead],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMarkAllRead}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => String(n.id)}
        renderItem={({ item, index }) => (
          <AnimatedEnter delay={index * 40}>
            <NotificationRow
              notification={item}
              onPress={() => handlePress(item.id)}
            />
          </AnimatedEnter>
        )}
        ItemSeparatorComponent={NotificationSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? null : <EmptyState />
        }
      />
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="notifications-outline" size={40} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        We will notify you about trip updates, reminders, and more.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  markAllText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primary,
  },
  headerSpacer: {
    width: 80,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
