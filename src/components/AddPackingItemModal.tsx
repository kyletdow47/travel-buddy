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
import type { PackingItemInsert } from '../types';

type PackingCategory =
  | 'Clothing'
  | 'Toiletries'
  | 'Electronics'
  | 'Documents'
  | 'Medicine'
  | 'Snacks'
  | 'Gear'
  | 'Other';

const CATEGORIES: { key: PackingCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Clothing', icon: 'shirt-outline' },
  { key: 'Toiletries', icon: 'water-outline' },
  { key: 'Electronics', icon: 'laptop-outline' },
  { key: 'Documents', icon: 'document-text-outline' },
  { key: 'Medicine', icon: 'medkit-outline' },
  { key: 'Snacks', icon: 'fast-food-outline' },
  { key: 'Gear', icon: 'fitness-outline' },
  { key: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const CATEGORY_COLORS: Record<PackingCategory, string> = {
  Clothing: '#3AA4FF',
  Toiletries: '#E94A8B',
  Electronics: '#F5B63B',
  Documents: '#8E8E93',
  Medicine: '#22C55E',
  Snacks: '#F2994A',
  Gear: '#5E7891',
  Other: '#C94FBF',
};

type Props = {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onAdd: (item: PackingItemInsert) => Promise<unknown>;
};

export function AddPackingItemModal({ visible, tripId, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PackingCategory>('Clothing');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setCategory('Clothing');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter an item name.');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        trip_id: tripId,
        name: trimmed,
        category,
        packed: false,
        assigned_to: null,
      });
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [name, category, tripId, onAdd, reset, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={handleClose}
      tint="light"
      maxHeightRatio={0.72}
      accessibilityLabel="Add packing item"
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
            <Text style={styles.title}>Add Item</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Passport, Charger, Sunscreen"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            autoCapitalize="words"
            autoFocus
          />

          {/* Category picker */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(({ key, icon }) => {
              const active = category === key;
              const color = CATEGORY_COLORS[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryChip,
                    active && { borderColor: color, backgroundColor: color + '18' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(key)}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={active ? color : Colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      active && { color },
                    ]}
                  >
                    {key}
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
            <Ionicons name="add-circle" size={20} color={"#FFFFFF"} />
            <Text style={styles.submitText}>
              {submitting ? 'Adding...' : 'Add Item'}
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

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
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
