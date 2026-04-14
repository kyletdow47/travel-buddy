import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useTrips } from '../../src/hooks/useTrips';
import { supabase } from '../../src/lib/supabase';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';
import type { Stop } from '../../src/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Placeholder user info (replace with auth later) ──
const PLACEHOLDER_USER = {
  name: 'Traveler',
  email: 'hello@travelbuddy.app',
  initials: 'TB',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { trips, loading: tripsLoading, refresh: refreshTrips } = useTrips();

  const [stops, setStops] = useState<Stop[]>([]);
  const [stopsLoading, setStopsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const loadStops = useCallback(async () => {
    setStopsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stops')
        .select('*');
      if (error) throw error;
      setStops((data as Stop[]) ?? []);
    } catch {
      setStops([]);
    } finally {
      setStopsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshTrips(), loadStops()]);
  }, [refreshTrips, loadStops]);

  // ── Computed stats ──
  const tripsCount = trips.length;
  const stopsCount = stops.length;
  const countriesVisited = useMemo(() => {
    const codes = new Set<string>();
    trips.forEach((t) => {
      if (t.country_code) codes.add(t.country_code);
    });
    return codes.size;
  }, [trips]);

  const loading = tripsLoading || stopsLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* ── Avatar + Name Section ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{PLACEHOLDER_USER.initials}</Text>
          </View>
          <Text style={styles.userName}>{PLACEHOLDER_USER.name}</Text>
          <Text style={styles.userEmail}>{PLACEHOLDER_USER.email}</Text>
        </View>

        {/* ── Travel Stats ── */}
        <View style={styles.statsCard}>
          <StatItem icon="airplane-outline" value={tripsCount} label="Trips" />
          <View style={styles.statDivider} />
          <StatItem icon="location-outline" value={stopsCount} label="Stops" />
          <View style={styles.statDivider} />
          <StatItem icon="globe-outline" value={countriesVisited} label="Countries" />
        </View>

        {/* ── Settings Sections ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => {
                  haptics.selection();
                  setNotificationsEnabled(val);
                }}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.textTertiary}
              />
            }
          />

          <View style={styles.rowDivider} />

          <SettingRow
            icon="moon-outline"
            label="Dark Mode"
            trailing={
              <Switch
                value={darkModeEnabled}
                onValueChange={(val) => {
                  haptics.selection();
                  setDarkModeEnabled(val);
                }}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={darkModeEnabled ? Colors.primary : Colors.textTertiary}
              />
            }
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>General</Text>

          <SettingRow
            icon="information-circle-outline"
            label="About"
            onPress={() => {
              haptics.light();
              Alert.alert(
                'Travel Buddy',
                'Version 1.0.0\nBuilt with love for travelers everywhere.',
              );
            }}
          />

          <View style={styles.rowDivider} />

          <SettingRow
            icon="download-outline"
            label="Export Data"
            onPress={() => {
              haptics.light();
              Alert.alert('Export Data', 'Data export will be available in a future update.');
            }}
          />

          <View style={styles.rowDivider} />

          <SettingRow
            icon="diamond-outline"
            label="Travel Buddy Pro"
            labelColor={Colors.primary}
            onPress={() => {
              haptics.medium();
              router.push('/paywall');
            }}
          />
        </View>

        <View style={styles.sectionCard}>
          <SettingRow
            icon="log-out-outline"
            label="Sign Out"
            labelColor={Colors.error}
            iconColor={Colors.error}
            onPress={() => {
              haptics.warning();
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => {
                    // Placeholder sign-out logic
                    Alert.alert('Signed Out', 'You have been signed out.');
                  },
                },
              ]);
            }}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Travel Buddy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatItem({
  icon,
  value,
  label,
}: {
  icon: IoniconsName;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  labelColor,
  iconColor,
  trailing,
  onPress,
}: {
  icon: IoniconsName;
  label: string;
  labelColor?: string;
  iconColor?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={iconColor ?? Colors.textSecondary}
        />
        <Text style={[styles.settingLabel, labelColor ? { color: labelColor } : undefined]}>
          {label}
        </Text>
      </View>
      {trailing ?? (
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  avatarInitials: {
    ...Typography.displaySm,
    color: Colors.surface,
    fontWeight: '800',
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // Stats card
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 48,
    backgroundColor: Colors.border,
  },

  // Section card
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    ...Typography.eyebrow,
    color: Colors.textTertiary,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  // Footer
  footerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
});
