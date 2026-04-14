import { useState, useCallback, useEffect } from 'react';
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
import { CategoryGlyph, normalizeCategory, type CategoryKey } from './CategoryGlyph';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Stop, StopInsert } from '../types';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'flight', label: 'Flight' },
  { key: 'lodging', label: 'Lodging' },
  { key: 'food', label: 'Food' },
  { key: 'activity', label: 'Activity' },
  { key: 'places', label: 'Places' },
  { key: 'transport', label: 'Transport' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'culture', label: 'Culture' },
  { key: 'gas', label: 'Gas' },
  { key: 'note', label: 'Note' },
  { key: 'other', label: 'Other' },
];

type Props = {
  visible: boolean;
  stop: Stop | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<StopInsert>) => Promise<unknown>;
};

export function EditStopModal({ visible, stop, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<CategoryKey>('activity');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!stop) return;
    setName(stop.name);
    setLocation(stop.location ?? '');
    setCategory(normalizeCategory(stop.category));
    setNotes(stop.notes ?? '');
    setDate(stop.planned_date ?? '');
  }, [stop, visible]);

  const handleSubmit = useCallback(async () => {
    if (!stop) return;
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a stop name.');
      return;
    }
    setSubmitting(true);
    try {
      await onSave(stop.id, {
        name: trimmed,
        location: location.trim() || null,
        category,
        notes: notes.trim() || null,
        planned_date: date.trim() || null,
      });
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [stop, name, location, category, notes, date, onSave, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="light"
      maxHeightRatio={0.92}
      accessibilityLabel="Edit stop"
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
            <Text style={styles.title}>Edit Stop</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Category picker */}
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map(({ key, label }) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(key)}
                >
                  <CategoryGlyph
                    category={key}
                    size={28}
                    variant={active ? 'filled' : 'tinted'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      active && styles.categoryLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Name */}
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Eiffel Tower, Check-in at Marriott"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            autoCapitalize="words"
          />

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Address or place name"
            placeholderTextColor={Colors.textTertiary}
            value={location}
            onChangeText={setLocation}
            returnKeyType="next"
          />

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            maxLength={10}
          />

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            placeholder="Confirmation codes, opening hours, tips…"
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.surface} />
            <Text style={styles.submitText}>
              {submitting ? 'Saving…' : 'Save Changes'}
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

  // Category picker
  categoryRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.sm,
  },
  categoryChip: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 64,
  },
  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
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
    minHeight: 80,
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
    color: Colors.surface,
    fontWeight: '700',
  },
});
