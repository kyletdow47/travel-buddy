import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { TripMemberRow } from '../../src/components/TripMemberRow';
import { InviteMemberModal } from '../../src/components/InviteMemberModal';
import { haptics } from '../../src/lib/haptics';

type Member = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

const OWNER: Member = {
  name: 'You',
  email: 'you@example.com',
  role: 'owner',
  initials: 'YO',
};

const SAMPLE_MEMBERS: Member[] = [
  { name: 'Alex Rivera', email: 'alex@example.com', role: 'editor', initials: 'AR' },
  { name: 'Sam Chen', email: 'sam@example.com', role: 'viewer', initials: 'SC' },
  { name: 'Jordan Lee', email: 'jordan@example.com', role: 'viewer', initials: 'JL' },
];

export default function MembersScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const [members] = useState<Member[]>(SAMPLE_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleCopyLink = useCallback(() => {
    haptics.light();
    Alert.alert('Link Copied', 'Shareable invite link copied to clipboard.');
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Trip Members',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: Typography.h3,
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Owner section */}
        <Text style={styles.sectionTitle}>Owner</Text>
        <View style={styles.cardWrapper}>
          <TripMemberRow member={OWNER} />
        </View>

        {/* Members section */}
        <Text style={styles.sectionTitle}>Members</Text>
        {members.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No members yet. Invite someone to collaborate!</Text>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.email} style={styles.cardWrapper}>
              <TripMemberRow member={member} />
            </View>
          ))
        )}

        {/* Share link section */}
        <View style={styles.shareLinkSection}>
          <View style={styles.shareLinkHeader}>
            <Ionicons name="link-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.shareLinkTitle}>Share Link</Text>
          </View>
          <Text style={styles.shareLinkDesc}>
            Anyone with this link can request access to your trip.
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            activeOpacity={0.85}
            onPress={handleCopyLink}
          >
            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
            <Text style={styles.copyButtonText}>Copy Invite Link</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Invite FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          haptics.light();
          setInviteOpen(true);
        }}
      >
        <Ionicons name="person-add" size={20} color={Colors.surface} />
        <Text style={styles.fabText}>Invite</Text>
      </TouchableOpacity>

      <InviteMemberModal
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Typography.eyebrow,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cardWrapper: {
    marginBottom: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  shareLinkSection: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  shareLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  shareLinkTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  shareLinkDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm + 2,
  },
  copyButtonText: {
    ...Typography.bodyMed,
    color: Colors.primary,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadows.md,
  },
  fabText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },
});
