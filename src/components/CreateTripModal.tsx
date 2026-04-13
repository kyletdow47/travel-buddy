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
  Switch,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { TripInsert } from '../types';

export interface LocationStop {
  name: string;
  category: string;
  sort_order: number;
}

interface CreateTripModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (trip: TripInsert, locations: LocationStop[]) => Promise<void>;
}

const TRANSPORT_MODES = [
  { id: 'car', icon: 'car-outline' as const, label: 'Car' },
  { id: 'flight', icon: 'airplane-outline' as const, label: 'Flight' },
  { id: 'train', icon: 'train-outline' as const, label: 'Train' },
  { id: 'bus', icon: 'bus-outline' as const, label: 'Bus' },
  { id: 'mixed', icon: 'git-merge-outline' as const, label: 'Mixed' },
];

function formatDisplayDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d} / ${m} / ${y}`;
}

function formatDBDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

export function CreateTripModal({ visible, onClose, onSave }: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endDateUnknown, setEndDateUnknown] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState('car');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setStartDate(null);
    setEndDate(null);
    setEndDateUnknown(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setStartLocation('');
    setEndLocation('');
    setWaypoints([]);
    setTransportMode('car');
    setNotes('');
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

    if (startDate) {
      trip.start_date = formatDBDate(startDate);
    }
    if (!endDateUnknown && endDate) {
      trip.end_date = formatDBDate(endDate);
    }

    const locations: LocationStop[] = [];
    if (startLocation.trim()) {
      locations.push({ name: startLocation.trim(), category: 'start', sort_order: 0 });
    }
    waypoints.forEach((wp, i) => {
      if (wp.trim()) {
        locations.push({ name: wp.trim(), category: 'waypoint', sort_order: i + 1 });
      }
    });
    if (endLocation.trim()) {
      locations.push({ name: endLocation.trim(), category: 'end', sort_order: 999 });
    }

    try {
      setSaving(true);
      await onSave(trip, locations);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trip';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const onStartDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(false);
    if (date) setStartDate(date);
  };

  const onEndDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(false);
    if (date) setEndDate(date);
  };

  const addWaypoint = () => {
    setWaypoints((prev) => [...prev, '']);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWaypoint = (index: number, value: string) => {
    setWaypoints((prev) => prev.map((w, i) => (i === index ? value : w)));
  };

  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Name */}
          <Text style={styles.sectionLabel}>Trip Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Summer in Italy"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />

          {/* Transport Mode */}
          <Text style={styles.sectionLabel}>How Are You Travelling?</Text>
          <View style={styles.modeRow}>
            {TRANSPORT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeChip, transportMode === mode.id && styles.modeChipActive]}
                onPress={() => setTransportMode(mode.id)}
              >
                <Ionicons
                  name={mode.icon}
                  size={18}
                  color={transportMode === mode.id ? '#FFFFFF' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.modeLabel,
                    transportMode === mode.id && styles.modeLabelActive,
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Route Section */}
          <Text style={styles.sectionLabel}>Route</Text>
          <View style={styles.routeCard}>
            {/* Start Location */}
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, styles.routeDotStart]} />
              <TextInput
                style={styles.routeInput}
                placeholder="Departure point"
                placeholderTextColor={Colors.textSecondary}
                value={startLocation}
                onChangeText={setStartLocation}
                returnKeyType="next"
              />
            </View>

            {/* Waypoints */}
            {waypoints.map((wp, index) => (
              <View key={index} style={styles.routeRow}>
                <View style={[styles.routeDot, styles.routeDotWaypoint]} />
                <TextInput
                  style={styles.routeInput}
                  placeholder={`Stop ${index + 1}`}
                  placeholderTextColor={Colors.textSecondary}
                  value={wp}
                  onChangeText={(val) => updateWaypoint(index, val)}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => removeWaypoint(index)}
                  hitSlop={8}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add waypoint button */}
            {waypoints.length < 5 && (
              <TouchableOpacity style={styles.addWaypointBtn} onPress={addWaypoint}>
                <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.addWaypointText}>Add a stop</Text>
              </TouchableOpacity>
            )}

            <View style={styles.routeDivider} />

            {/* End Location */}
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, styles.routeDotEnd]} />
              <TextInput
                style={styles.routeInput}
                placeholder="Destination"
                placeholderTextColor={Colors.textSecondary}
                value={endLocation}
                onChangeText={setEndLocation}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Dates */}
          <Text style={styles.sectionLabel}>Dates</Text>

          {/* Start Date */}
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => {
              setShowEndPicker(false);
              setShowStartPicker((v) => !v);
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <View style={styles.dateLabelContainer}>
              <Text style={styles.dateMeta}>Start Date</Text>
              <Text style={[styles.dateValue, !startDate && styles.datePlaceholder]}>
                {startDate ? formatDisplayDate(startDate) : 'Select date'}
              </Text>
            </View>
            <Ionicons
              name={showStartPicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate ?? new Date()}
              mode="date"
              display="inline"
              onChange={onStartDateChange}
              style={styles.datePicker}
              accentColor={Colors.primary}
            />
          )}

          {/* End Date */}
          <View style={styles.endDateHeader}>
            <TouchableOpacity
              style={[styles.dateRow, styles.dateRowFlex, endDateUnknown && styles.dateRowDisabled]}
              onPress={() => {
                if (!endDateUnknown) {
                  setShowStartPicker(false);
                  setShowEndPicker((v) => !v);
                }
              }}
              disabled={endDateUnknown}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={endDateUnknown ? Colors.border : Colors.textSecondary}
              />
              <View style={styles.dateLabelContainer}>
                <Text style={[styles.dateMeta, endDateUnknown && styles.dateMuted]}>End Date</Text>
                <Text
                  style={[
                    styles.dateValue,
                    (!endDate || endDateUnknown) && styles.datePlaceholder,
                    endDateUnknown && styles.dateMuted,
                  ]}
                >
                  {endDateUnknown
                    ? 'Open-ended'
                    : endDate
                    ? formatDisplayDate(endDate)
                    : 'Select date'}
                </Text>
              </View>
              {!endDateUnknown && (
                <Ionicons
                  name={showEndPicker ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textSecondary}
                />
              )}
            </TouchableOpacity>
            <View style={styles.unknownToggle}>
              <Text style={styles.unknownLabel}>Open-ended</Text>
              <Switch
                value={endDateUnknown}
                onValueChange={(val) => {
                  setEndDateUnknown(val);
                  if (val) setShowEndPicker(false);
                }}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          {showEndPicker && !endDateUnknown && (
            <DateTimePicker
              value={endDate ?? startDate ?? new Date()}
              mode="date"
              display="inline"
              minimumDate={startDate ?? undefined}
              onChange={onEndDateChange}
              style={styles.datePicker}
              accentColor={Colors.primary}
            />
          )}

          {/* Notes */}
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Anything to keep in mind for this trip..."
            placeholderTextColor={Colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            textAlignVertical="top"
          />

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, !canSave && styles.createButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}
          >
            <Ionicons name="airplane" size={18} color="#FFFFFF" />
            <Text style={styles.createButtonText}>
              {saving ? 'Creating...' : 'Create Trip'}
            </Text>
          </TouchableOpacity>
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
  form: {
    flex: 1,
  },
  formContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginTop: Spacing.lg,
  },
  input: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: {
    height: 80,
    paddingTop: Spacing.sm + 4,
  },
  // Transport mode
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  modeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  modeLabelActive: {
    color: '#FFFFFF',
  },
  // Route card
  routeCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.sm,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  routeDotStart: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  routeDotWaypoint: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  routeDotEnd: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  routeInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    paddingVertical: 4,
  },
  removeBtn: {
    padding: 2,
  },
  addWaypointBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingLeft: 18,
  },
  addWaypointText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  routeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
    marginLeft: 18,
  },
  // Date rows
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.xs,
  },
  dateRowFlex: {
    flex: 1,
    marginBottom: 0,
  },
  dateRowDisabled: {
    opacity: 0.5,
  },
  dateLabelContainer: {
    flex: 1,
  },
  dateMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 1,
  },
  dateMuted: {
    color: Colors.border,
  },
  dateValue: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '500',
  },
  datePlaceholder: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  datePicker: {
    marginBottom: Spacing.sm,
  },
  endDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  unknownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  unknownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Create button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
  },
  createButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
