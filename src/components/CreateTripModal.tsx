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
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { LocationPickerModal, type SelectedPlace } from './LocationPickerModal';
import type { TripInsert } from '../types';

export interface LocationStop {
  name: string;
  category: string;
  sort_order: number;
  lat?: number;
  lng?: number;
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

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDB(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type DateTarget = 'start' | 'end';
type LocationTarget = 'start' | 'end' | number;

export function CreateTripModal({ visible, onClose, onSave }: CreateTripModalProps) {
  // Core fields
  const [name, setName] = useState('');
  const [transportMode, setTransportMode] = useState('car');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Locations
  const [startPlace, setStartPlace] = useState<SelectedPlace | null>(null);
  const [endPlace, setEndPlace] = useState<SelectedPlace | null>(null);
  const [waypoints, setWaypoints] = useState<Array<SelectedPlace | null>>([]);

  // Location picker modal
  const [locPickerVisible, setLocPickerVisible] = useState(false);
  const [locPickerTarget, setLocPickerTarget] = useState<LocationTarget>('start');
  const [locPickerLabel, setLocPickerLabel] = useState('');
  const [locPickerInitial, setLocPickerInitial] = useState('');

  // Dates
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endDateUnknown, setEndDateUnknown] = useState(false);

  // Date bottom sheet
  const [dateTarget, setDateTarget] = useState<DateTarget | null>(null);
  const [pendingDate, setPendingDate] = useState(new Date());

  // ─── Helpers ──────────────────────────────────────────────────────────

  const openLocPicker = (target: LocationTarget, label: string, initial = '') => {
    setLocPickerTarget(target);
    setLocPickerLabel(label);
    setLocPickerInitial(initial);
    setLocPickerVisible(true);
  };

  const handleLocSelect = (place: SelectedPlace) => {
    if (locPickerTarget === 'start') {
      setStartPlace(place);
    } else if (locPickerTarget === 'end') {
      setEndPlace(place);
    } else {
      const idx = locPickerTarget as number;
      setWaypoints((prev) => prev.map((w, i) => (i === idx ? place : w)));
    }
    setLocPickerVisible(false);
  };

  const addWaypoint = () => setWaypoints((p) => [...p, null]);
  const removeWaypoint = (i: number) => setWaypoints((p) => p.filter((_, j) => j !== i));

  const openDateSheet = (target: DateTarget) => {
    setPendingDate(
      target === 'start'
        ? (startDate ?? new Date())
        : (endDate ?? startDate ?? new Date())
    );
    setDateTarget(target);
  };

  const confirmDate = () => {
    if (dateTarget === 'start') setStartDate(pendingDate);
    else if (dateTarget === 'end') setEndDate(pendingDate);
    setDateTarget(null);
  };

  const onDatePickerChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setPendingDate(date);
  };

  // ─── Save ─────────────────────────────────────────────────────────────

  const resetForm = () => {
    setName('');
    setTransportMode('car');
    setNotes('');
    setStartPlace(null);
    setEndPlace(null);
    setWaypoints([]);
    setStartDate(null);
    setEndDate(null);
    setEndDateUnknown(false);
    setDateTarget(null);
    setLocPickerVisible(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter a trip name.');
      return;
    }

    const trip: TripInsert = {
      name: trimmed,
      status: 'planning',
    };
    if (startDate) trip.start_date = formatDB(startDate);
    if (!endDateUnknown && endDate) trip.end_date = formatDB(endDate);

    const locations: LocationStop[] = [];
    if (startPlace?.description) {
      locations.push({
        name: startPlace.description,
        category: 'start',
        sort_order: 0,
        lat: startPlace.lat,
        lng: startPlace.lng,
      });
    }
    waypoints.forEach((wp, i) => {
      if (wp?.description) {
        locations.push({
          name: wp.description,
          category: 'waypoint',
          sort_order: i + 1,
          lat: wp.lat,
          lng: wp.lng,
        });
      }
    });
    if (endPlace?.description) {
      locations.push({
        name: endPlace.description,
        category: 'end',
        sort_order: 999,
        lat: endPlace.lat,
        lng: endPlace.lng,
      });
    }

    try {
      setSaving(true);
      await onSave(trip, locations);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────

  const canSave = name.trim().length > 0 && !saving;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Trip</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Trip Name ── */}
            <Text style={styles.label}>Trip Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Summer in Italy"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
            />

            {/* ── Transport Mode ── */}
            <Text style={styles.label}>How Are You Travelling?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modeRow}
            >
              {TRANSPORT_MODES.map((mode) => {
                const active = transportMode === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    onPress={() => setTransportMode(mode.id)}
                  >
                    <Ionicons
                      name={mode.icon}
                      size={16}
                      color={active ? '#FFF' : Colors.textSecondary}
                    />
                    <Text style={[styles.modeText, active && styles.modeTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ── Route ── */}
            <Text style={styles.label}>Route</Text>
            <View style={styles.routeCard}>
              {/* Start */}
              <TouchableOpacity
                style={styles.locationRow}
                onPress={() => openLocPicker('start', 'Departure', startPlace?.description)}
              >
                <View style={[styles.dot, styles.dotStart]} />
                <Text
                  style={[styles.locationText, !startPlace && styles.locationPlaceholder]}
                  numberOfLines={1}
                >
                  {startPlace?.description ?? 'Departure point'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.border} />
              </TouchableOpacity>

              {/* Connector line + waypoints */}
              {waypoints.map((wp, i) => (
                <View key={i}>
                  <View style={styles.connector} />
                  <View style={styles.waypointRow}>
                    <View style={[styles.dot, styles.dotWaypoint]} />
                    <TouchableOpacity
                      style={styles.waypointInputTap}
                      onPress={() => openLocPicker(i, `Stop ${i + 1}`, wp?.description)}
                    >
                      <Text
                        style={[styles.locationText, !wp && styles.locationPlaceholder]}
                        numberOfLines={1}
                      >
                        {wp?.description ?? `Stop ${i + 1}`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeWaypoint(i)} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={14} color={Colors.border} />
                  </View>
                </View>
              ))}

              {waypoints.length < 5 && (
                <View>
                  <View style={styles.connector} />
                  <TouchableOpacity style={styles.addStopRow} onPress={addWaypoint}>
                    <Ionicons name="add-circle-outline" size={14} color={Colors.primary} />
                    <Text style={styles.addStopText}>Add a stop</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.connector} />

              {/* End */}
              <TouchableOpacity
                style={styles.locationRow}
                onPress={() => openLocPicker('end', 'Destination', endPlace?.description)}
              >
                <View style={[styles.dot, styles.dotEnd]} />
                <Text
                  style={[styles.locationText, !endPlace && styles.locationPlaceholder]}
                  numberOfLines={1}
                >
                  {endPlace?.description ?? 'Destination'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.border} />
              </TouchableOpacity>
            </View>

            {/* ── Dates ── */}
            <Text style={styles.label}>Dates</Text>
            <View style={styles.datesRow}>
              {/* Start date */}
              <TouchableOpacity
                style={styles.dateChip}
                onPress={() => openDateSheet('start')}
              >
                <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                <View>
                  <Text style={styles.dateMeta}>Start</Text>
                  <Text style={[styles.dateVal, !startDate && styles.datePlaceholder]}>
                    {startDate ? formatDisplay(startDate) : 'Pick date'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* End date */}
              <TouchableOpacity
                style={[styles.dateChip, endDateUnknown && styles.dateChipMuted]}
                onPress={() => !endDateUnknown && openDateSheet('end')}
                disabled={endDateUnknown}
              >
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={endDateUnknown ? Colors.border : Colors.primary}
                />
                <View>
                  <Text style={[styles.dateMeta, endDateUnknown && styles.textMuted]}>End</Text>
                  <Text style={[styles.dateVal, styles.datePlaceholder, endDateUnknown && styles.textMuted]}>
                    {endDateUnknown ? 'Open-ended' : endDate ? formatDisplay(endDate) : 'Pick date'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Open-ended toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>End date unknown (open-ended)</Text>
              <Switch
                value={endDateUnknown}
                onValueChange={(v) => {
                  setEndDateUnknown(v);
                  if (v) setDateTarget(null);
                }}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>

            {/* ── Notes ── */}
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="Anything to keep in mind…"
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />

            {/* ── Create Button ── */}
            <TouchableOpacity
              style={[styles.createBtn, !canSave && styles.createBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.85}
            >
              <Ionicons name="airplane" size={18} color="#FFF" />
              <Text style={styles.createBtnText}>
                {saving ? 'Creating…' : 'Create Trip'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Date bottom sheet ── */}
      <Modal
        visible={dateTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDateTarget(null)}
      >
        <TouchableWithoutFeedback onPress={() => setDateTarget(null)}>
          <View style={styles.sheetOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={() => setDateTarget(null)} hitSlop={8}>
              <Text style={styles.sheetCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>
              {dateTarget === 'start' ? 'Start Date' : 'End Date'}
            </Text>
            <TouchableOpacity onPress={confirmDate} hitSlop={8}>
              <Text style={styles.sheetDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={pendingDate}
            mode="date"
            display="inline"
            minimumDate={dateTarget === 'end' && startDate ? startDate : undefined}
            onChange={onDatePickerChange}
            accentColor={Colors.primary}
            style={styles.datePicker}
          />
        </View>
      </Modal>

      {/* ── Location picker ── */}
      <LocationPickerModal
        visible={locPickerVisible}
        label={locPickerLabel}
        initialValue={locPickerInitial}
        onSelect={handleLocSelect}
        onClose={() => setLocPickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },

  // Labels
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: Spacing.md,
  },

  // Text input
  textInput: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: {
    height: 72,
    paddingTop: 11,
  },

  // Transport mode
  modeRow: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  modeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  modeTextActive: { color: '#FFF' },

  // Route card
  routeCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    gap: Spacing.sm,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  waypointInputTap: { flex: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotStart: { backgroundColor: Colors.primary },
  dotWaypoint: { backgroundColor: Colors.warning },
  dotEnd: { backgroundColor: Colors.text },
  locationText: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '500',
  },
  locationPlaceholder: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  connector: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 4, // align with dot center
  },
  addStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  addStopText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Dates
  datesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 10,
  },
  dateChipMuted: {
    opacity: 0.55,
  },
  dateMeta: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateVal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 1,
  },
  datePlaceholder: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  textMuted: { color: Colors.border },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs + 2,
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Create button
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: 15,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.2,
  },

  // Date bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetCancel: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  sheetTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  sheetDone: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  datePicker: {
    alignSelf: 'center',
  },
});
