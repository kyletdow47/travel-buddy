import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FrostedSheet } from './FrostedSheet';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { haptics } from '../lib/haptics';

type Role = 'editor' | 'viewer' | 'commenter';

const ROLES: { key: Role; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'editor', label: 'Editor', icon: 'pencil-outline' },
  { key: 'viewer', label: 'Viewer', icon: 'eye-outline' },
  { key: 'commenter', label: 'Commenter', icon: 'chatbubble-outline' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onInvite?: (email: string, role: Role) => Promise<unknown>;
};

export function InviteMemberModal({ visible, onClose, onInvite }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setEmail('');
    setRole('viewer');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    haptics.light();
    try {
      if (onInvite) {
        await onInvite(trimmed, role);
      } else {
        // Placeholder behavior
        Alert.alert('Invite Sent', `Invitation sent to ${trimmed} as ${role}.`);
      }
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [email, role, onInvite, reset, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={handleClose}
      tint="light"
      maxHeightRatio={0.65}
      accessibilityLabel="Invite member"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Invite Member</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Email input */}
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Role picker */}
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map(({ key, label, icon }) => {
              const active = role === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.selection();
                    setRole(key);
                  }}
                >
                  <Ionicons
                    name={icon}
                    size={16}
                    color={active ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="send" size={18} color={"#FFFFFF"} />
            <Text style={styles.submitText}>
              {submitting ? 'Sending...' : 'Send Invite'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  label: {
    ...Typography.micro,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.body,
    color: Colors.text,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTinted,
  },
  roleLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  roleLabelActive: {
    color: Colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
