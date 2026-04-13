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
import type { StopInsert } from '../types';

const CATEGORIES = [
  { key: 'hotel', label: 'Hotel', icon: 'bed-outline' as const },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { key: 'gas', label: 'Gas', icon: 'car-outline' as const },
  { key: 'activity', label: 'Activity', icon: 'ticket-outline' as const },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

interface AddStopModalProps {
  visible: boolean;
  tripId: string;
  currentMaxSortOrder: number;
  onClose: () => void;
  onSave: (stop: StopInsert) => Promise<void>;
}

export function AddStopModal({
  visible,
  tripId,
  currentMaxSortOrder,
  onClose,
  onSave,
}: AddStopModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [category, setCategory] = useState('activity');
  const [plannedDate, setPlannedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setLocation('');
    setLat('');
    setLng('');
    setCategory('activity');
    setPlannedDate('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a stop name.');
      return;
    }

    const stop: StopInsert = {
      trip_id: tripId,
      name: trimmedName,
      sort_order: currentMaxSortOrder + 1,
      status: 'upcoming',
      category,
    };

    if (location.trim()) stop.location = location.trim();
    if (lat.trim()) {
      const parsed = parseFloat(lat.trim());
      if (!isNaN(parsed)) stop.lat = parsed;
    }
    if (lng.trim()) {
      const parsed = parseFloat(lng.trim());
      if (!isNaN(parsed)) stop.lng = parsed;
    }
    if (plannedDate.trim()) stop.planned_date = plannedDate.trim();
    if (notes.trim()) stop.notes = notes.trim();

    try {
      setSaving(true);
      await onSave(stop);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create stop';
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
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Stop</Text>
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
          <Text style={styles.label}>Stop Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Eiffel Tower"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Paris, France"
            placeholderTextColor={Colors.textSecondary}
            value={location}
            onChangeText={setLocation}
            returnKeyType="next"
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                placeholder="48.8584"
                placeholderTextColor={Colors.textSecondary}
                value={lat}
                onChangeText={setLat}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                placeholder="2.2945"
                placeholderTextColor={Colors.textSecondary}
                value={lng}
                onChangeText={setLng}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    selected && styles.categoryChipSelected,
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={18}
                    color={selected ? '#FFFFFF' : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selected && styles.categoryLabelSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Planned Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
            value={plannedDate}
            onChangeText={setPlannedDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Any notes about this stop..."
            placeholderTextColor={Colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
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
  cancelButton: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
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
  notesInput: {
    minHeight: 100,
    paddingTop: Spacing.sm + 4,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
});
