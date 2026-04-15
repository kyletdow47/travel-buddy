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
import type { ReservationInsert } from '../types';

type ReservationType = 'flight' | 'lodging' | 'car' | 'train' | 'activity';

const TYPES: {
  key: ReservationType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { key: 'flight', label: 'Flight', icon: 'airplane-outline', color: Colors.category.flight },
  { key: 'lodging', label: 'Lodging', icon: 'bed-outline', color: Colors.category.lodging },
  { key: 'car', label: 'Car', icon: 'car-outline', color: Colors.category.gas },
  { key: 'train', label: 'Train', icon: 'train-outline', color: Colors.category.transport },
  { key: 'activity', label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
];

type Props = {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onAdd: (reservation: ReservationInsert) => Promise<unknown>;
};

export function AddReservationModal({ visible, tripId, onClose, onAdd }: Props) {
  const [type, setType] = useState<ReservationType>('flight');
  const [provider, setProvider] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setType('flight');
    setProvider('');
    setConfirmationCode('');
    setStartDatetime('');
    setEndDatetime('');
    setLocation('');
    setNotes('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmedProvider = provider.trim();
    if (!trimmedProvider) {
      Alert.alert('Provider required', 'Please enter a provider name.');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        trip_id: tripId,
        type,
        provider: trimmedProvider,
        confirmation_code: confirmationCode.trim() || null,
        start_datetime: startDatetime.trim() || null,
        end_datetime: endDatetime.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        status: 'pending',
      });
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSubmitting(false);
    }
  }, [provider, confirmationCode, startDatetime, endDatetime, location, notes, type, tripId, onAdd, reset, onClose]);

  return (
    <FrostedSheet
      visible={visible}
      onClose={handleClose}
      tint="light"
      maxHeightRatio={0.92}
      accessibilityLabel="Add reservation"
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
            <Text style={styles.title}>Add Reservation</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Type picker */}
          <Text style={styles.label}>Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeRow}
          >
            {TYPES.map(({ key, label, icon, color }) => {
              const active = type === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setType(key)}
                >
                  <View
                    style={[
                      styles.typeIcon,
                      {
                        backgroundColor: active ? `${color}26` : Colors.surfaceDim,
                      },
                    ]}
                  >
                    <Ionicons name={icon} size={20} color={active ? color : Colors.textTertiary} />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      active && styles.typeLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Provider */}
          <Text style={styles.label}>Provider *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Delta Airlines, Marriott"
            placeholderTextColor={Colors.textTertiary}
            value={provider}
            onChangeText={setProvider}
            returnKeyType="next"
            autoCapitalize="words"
          />

          {/* Confirmation Code */}
          <Text style={styles.label}>Confirmation Code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ABC123"
            placeholderTextColor={Colors.textTertiary}
            value={confirmationCode}
            onChangeText={setConfirmationCode}
            returnKeyType="next"
            autoCapitalize="characters"
          />

          {/* Start Datetime */}
          <Text style={styles.label}>Start Date & Time</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
            placeholderTextColor={Colors.textTertiary}
            value={startDatetime}
            onChangeText={setStartDatetime}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            maxLength={16}
          />

          {/* End Datetime */}
          <Text style={styles.label}>End Date & Time</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
            placeholderTextColor={Colors.textTertiary}
            value={endDatetime}
            onChangeText={setEndDatetime}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            maxLength={16}
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

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            placeholder="Gate info, check-in details, special requests..."
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
            <Ionicons name="add-circle" size={20} color={"#FFFFFF"} />
            <Text style={styles.submitText}>
              {submitting ? 'Adding...' : 'Add Reservation'}
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

  // Type picker
  typeRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.sm,
  },
  typeChip: {
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
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTinted,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  typeLabelActive: {
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
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
