import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { updateTrip } from '../services/tripsService';
import type { Trip } from '../types';

type TripStatus = 'upcoming' | 'active' | 'completed';

const STATUS_OPTIONS: { value: TripStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function parseDateString(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  return parseISO(dateStr);
}

function toTripStatus(status: string | null): TripStatus {
  if (status === 'active' || status === 'completed') return status;
  return 'upcoming';
}

interface EditTripModalProps {
  visible: boolean;
  trip: Trip | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditTripModal({
  visible,
  trip,
  onClose,
  onUpdated,
}: EditTripModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState<TripStatus>('upcoming');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setStartDate(parseDateString(trip.start_date));
      setEndDate(parseDateString(trip.end_date));
      setBudget(trip.budget != null ? String(trip.budget) : '');
      setStatus(toTripStatus(trip.status));
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
  }, [trip]);

  const handleClose = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    onClose();
  };

  const handleStartDateChange = (
    _event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (selected) {
      setStartDate(selected);
    }
  };

  const handleEndDateChange = (
    _event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (selected) {
      setEndDate(selected);
    }
  };

  const handleSubmit = async () => {
    if (!trip) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Trip name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedBudget = budget ? parseFloat(budget) : null;
      await updateTrip(trip.id, {
        name: trimmedName,
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        budget:
          parsedBudget !== null && !isNaN(parsedBudget) ? parsedBudget : null,
        status,
      });
      onUpdated();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit Trip</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            hitSlop={8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trip Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Trip Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Summer in Italy"
              placeholderTextColor={Colors.textSecondary}
              returnKeyType="next"
            />
          </View>

          {/* Start Date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Start Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => {
                setShowStartPicker(!showStartPicker);
                setShowEndPicker(false);
              }}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  !startDate && styles.placeholderText,
                ]}
              >
                {startDate ? format(startDate, 'MMMM d, yyyy') : 'Select date'}
              </Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={startDate ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleStartDateChange}
                style={styles.datePicker}
              />
            )}
          </View>

          {/* End Date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>End Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => {
                setShowEndPicker(!showEndPicker);
                setShowStartPicker(false);
              }}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  !endDate && styles.placeholderText,
                ]}
              >
                {endDate ? format(endDate, 'MMMM d, yyyy') : 'Select date'}
              </Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={endDate ?? startDate ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={startDate ?? undefined}
                onChange={handleEndDateChange}
                style={styles.datePicker}
              />
            )}
          </View>

          {/* Budget */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Budget ($)</Text>
            <TextInput
              style={styles.textInput}
              value={budget}
              onChangeText={setBudget}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Status */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.statusChip,
                    status === option.value && styles.statusChipActive,
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      status === option.value && styles.statusChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  cancelButton: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  saveButton: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  textInput: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  dateButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  dateButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  datePicker: {
    marginTop: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusChip: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusChipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
});
