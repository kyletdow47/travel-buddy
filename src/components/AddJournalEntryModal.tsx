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
import type { JournalEntryInsert } from '../types';

const MOODS: { key: string; emoji: string; label: string }[] = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'relaxed', emoji: '😌', label: 'Relaxed' },
  { key: 'adventurous', emoji: '🤠', label: 'Adventurous' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'amazed', emoji: '🤩', label: 'Amazed' },
];

type Props = {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onAdd: (entry: JournalEntryInsert) => Promise<unknown>;
};

export function AddJournalEntryModal({ visible, tripId, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setTitle('');
    setBody('');
    setMood(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle && !trimmedBody) {
      Alert.alert('Content required', 'Please enter a title or body text.');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        trip_id: tripId,
        title: trimmedTitle || null,
        body: trimmedBody || null,
        mood,
        photo_urls: [],
        stop_id: null,
      });
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [title, body, mood, tripId, onAdd, reset, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={handleClose}
      tint="light"
      maxHeightRatio={0.92}
      accessibilityLabel="Add journal entry"
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
            <Text style={styles.headerTitle}>New Journal Entry</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What happened today?"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            autoCapitalize="sentences"
          />

          {/* Body */}
          <Text style={styles.label}>Entry</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            placeholder="Write about your experience..."
            placeholderTextColor={Colors.textTertiary}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={5}
            returnKeyType="done"
            textAlignVertical="top"
          />

          {/* Mood picker */}
          <Text style={styles.label}>Mood</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodRow}
          >
            {MOODS.map(({ key, emoji, label }) => {
              const active = mood === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.moodChip, active && styles.moodChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setMood(active ? null : key)}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      active && styles.moodLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="pencil" size={20} color={"#FFFFFF"} />
            <Text style={styles.submitText}>
              {submitting ? 'Saving...' : 'Save Entry'}
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
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },

  // Mood picker
  moodRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.sm,
  },
  moodChip: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 72,
  },
  moodChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTinted,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  moodLabelActive: {
    color: Colors.primary,
  },

  // Form fields
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
  inputMulti: {
    minHeight: 120,
    paddingTop: Spacing.sm + 2,
  },

  // Submit
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
