import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { TripInsert } from '../types';

interface CreateTripModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (trip: TripInsert) => Promise<void>;
}

export function CreateTripModal({ visible, onClose, onSave }: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setBudget('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a trip name.');
      return;
    }

    const trip: TripInsert = {
      name: trimmedName,
      status: 'planning',
    };

    if (startDate.trim()) {
      trip.start_date = startDate.trim();
    }
    if (endDate.trim()) {
      trip.end_date = endDate.trim();
    }
    if (budget.trim()) {
      const parsed = parseFloat(budget.trim());
      if (!isNaN(parsed) && parsed > 0) {
        trip.budget = parsed;
      }
    }

    try {
      setSaving(true);
      await onSave(trip);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trip';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !name.trim()}
            hitSlop={8}
          >
            <Text
              style={[
                styles.saveButton,
                (!name.trim() || saving) && styles.saveButtonDisabled,
              ]}
            >
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Trip Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Summer in Italy"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />

          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />

          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
            value={endDate}
            onChangeText={setEndDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />

          <Text style={styles.label}>Budget ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  saveButtonDisabled: {
    opacity: 0.4,
  },
  form: {
    flex: 1,
    padding: Spacing.md,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
