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
import type { ReceiptInsert } from '../types';

type ReceiptCategoryKey = 'food' | 'hotel' | 'gas' | 'activity' | 'other';

const CATEGORIES: { key: ReceiptCategoryKey; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'food', label: 'Food', icon: 'restaurant-outline', color: Colors.category.food },
  { key: 'hotel', label: 'Hotel', icon: 'bed-outline', color: Colors.category.hotel },
  { key: 'gas', label: 'Gas', icon: 'car-outline', color: Colors.category.gas },
  { key: 'activity', label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
  { key: 'other', label: 'Other', icon: 'pricetag-outline', color: Colors.category.other },
];

type Props = {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onAdd: (receipt: ReceiptInsert) => Promise<unknown>;
};

export function AddReceiptModal({ visible, tripId, onClose, onAdd }: Props) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ReceiptCategoryKey>('food');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setMerchant('');
    setAmount('');
    setCategory('food');
    setDate('');
    setNotes('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmedMerchant = merchant.trim();
    const parsedAmount = parseFloat(amount);
    if (!trimmedMerchant) {
      Alert.alert('Merchant required', 'Please enter a merchant name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Amount required', 'Please enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        trip_id: tripId,
        merchant: trimmedMerchant,
        amount: parsedAmount,
        category,
        receipt_date: date.trim() || null,
        notes: notes.trim() || null,
      });
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [merchant, amount, category, date, notes, tripId, onAdd, reset, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={handleClose}
      tint="light"
      maxHeightRatio={0.88}
      accessibilityLabel="Add receipt"
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
            <Text style={styles.title}>Add Receipt</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
            {CATEGORIES.map(({ key, label, icon, color }) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryChip, active && { borderColor: color, backgroundColor: `${color}18` }]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(key)}
                >
                  <Ionicons name={icon} size={22} color={active ? color : Colors.textTertiary} />
                  <Text
                    style={[
                      styles.categoryLabel,
                      active && { color },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Merchant */}
          <Text style={styles.label}>Merchant *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Starbucks, Hilton, Shell"
            placeholderTextColor={Colors.textTertiary}
            value={merchant}
            onChangeText={setMerchant}
            returnKeyType="next"
            autoCapitalize="words"
          />

          {/* Amount */}
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          </View>

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
            placeholder="Receipt details, payment method…"
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
            <Ionicons name="receipt" size={20} color={Colors.surface} />
            <Text style={styles.submitText}>
              {submitting ? 'Adding…' : 'Add Receipt'}
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
    minWidth: 72,
  },
  categoryLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    ...Typography.h2,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
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
