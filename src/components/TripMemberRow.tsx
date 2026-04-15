import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type Member = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

type Props = {
  member: Member;
};

function roleBadgeStyle(role: string) {
  switch (role.toLowerCase()) {
    case 'owner':
      return { color: Colors.primary, bg: Colors.primaryLight };
    case 'editor':
      return { color: Colors.info, bg: `${Colors.info}18` };
    case 'viewer':
    default:
      return { color: Colors.textOnCardSecondary, bg: Colors.cardSecondary };
  }
}

function TripMemberRowBase({ member }: Props) {
  const badge = roleBadgeStyle(member.role);

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.initials}>{member.initials}</Text>
      </View>

      {/* Name + email */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{member.name}</Text>
        <Text style={styles.email} numberOfLines={1}>{member.email}</Text>
      </View>

      {/* Role badge */}
      <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.roleText, { color: badge.color }]}>
          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
        </Text>
      </View>
    </View>
  );
}

export const TripMemberRow = memo(TripMemberRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.bodyMed,
    color: Colors.textOnCard,
    fontWeight: '600',
  },
  email: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  roleText: {
    ...Typography.micro,
    fontWeight: '700',
  },
});
