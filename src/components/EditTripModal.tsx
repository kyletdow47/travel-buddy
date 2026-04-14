import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Trip, TripUpdate } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import { haptics } from '../lib/haptics';

type TripStatus = 'planning' | 'active' | 'completed';
const STATUS_OPTIONS: TripStatus[] = ['planning', 'active', 'completed'];

type Props = {
  visible: boolean;
  trip: Trip | null;
  onClose: () => void;
  onSave: (update: TripUpdate) => Promise<void> | void;
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EditTripModal({ visible, trip, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TripStatus>('planning');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const [dateTarget, setDateTarget] = useState<'start' | 'end' | null>(null);
  const [pendingDate, setPendingDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!trip) return;
    setName(trip.name ?? '');
    setDescription((trip as Trip & { description?: string | null }).description ?? '');
    setStatus(((trip.status as TripStatus) ?? 'planning') as TripStatus);
    setStartDate(parseISO(trip.start_date));
    setEndDate(parseISO(trip.end_date));
    setBudget(trip.budget != null ? String(trip.budget) : '');
    setNameError(null);
    setDateError(null);
  }, [trip, visible]);

  const minEndDate = useMemo(() => startDate ?? undefined, [startDate]);

  const openDatePicker = (target: 'start' | 'end') => {
    haptics.selection();
    const initial =
      target === 'start'
        ? startDate ?? new Date()
        : endDate ?? startDate ?? new Date();
    setPendingDate(initial);
    setDateTarget(target);
  };

  const confirmDate = () => {
    if (!dateTarget) return;
    if (dateTarget === 'start') {
      setStartDate(pendingDate);
      if (endDate && pendingDate > endDate) setEndDate(pendingDate);
    } else {
      setEndDate(pendingDate);
    }
    haptics.light();
    setDateTarget(null);
  };

  const handleSave = async () => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Trip name is required');
      valid = false;
    } else {
      setNameError(null);
    }
    if (startDate && endDate && endDate < startDate) {
      setDateError('End date must be after start date');
      valid = false;
    } else {
      setDateError(null);
    }
    if (!valid) {
      haptics.error();
      return;
    }

    const update: TripUpdate = {
      name: name.trim(),
      status,
      start_date: startDate ? toISODate(startDate) : null,
      end_date: endDate ? toISODate(endDate) : null,
      budget: budget ? Number(budget) : null,
    };
    try {
      setSaving(true);
      await onSave(update);
      haptics.success();
      onClose();
    } catch {
      haptics.error();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Trip</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={10}>
              {saving ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* TRIP DETAILS */}
            <Text style={styles.sectionLabel}>Trip Details</Text>

            <Field label="Trip Name" error={nameError}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Summer in Tokyo"
                placeholderTextColor={Colors.textTertiary}
                style={[styles.input, nameError && styles.inputError]}
                autoCapitalize="words"
              />
            </Field>

            <Field label="Status">
              <View style={styles.segmented}>
                {STATUS_OPTIONS.map((opt) => {
                  const active = status === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.segment, active && styles.segmentActive]}
                      activeOpacity={0.85}
                      onPress={() => {
                        haptics.selection();
                        setStatus(opt);
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          active && styles.segmentTextActive,
                        ]}
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            <Field label="Description">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional notes about the trip..."
                placeholderTextColor={Colors.textTertiary}
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={3}
              />
            </Field>

            {/* DATES */}
            <Text style={[styles.sectionLabel, styles.sectionGap]}>Dates</Text>

            <Field label="Start Date">
              <DateRow
                value={startDate}
                placeholder="Select start date"
                onPress={() => openDatePicker('start')}
              />
            </Field>

            <Field label="End Date" error={dateError}>
              <DateRow
                value={endDate}
                placeholder="Select end date"
                onPress={() => openDatePicker('end')}
                error={!!dateError}
              />
            </Field>

            {/* BUDGET */}
            <Text style={[styles.sectionLabel, styles.sectionGap]}>Budget</Text>

            <Field label="Budget Amount">
              <View style={styles.amountWrap}>
                <Text style={styles.amountPrefix}>$</Text>
                <TextInput
                  value={budget}
                  onChangeText={(t) => setBudget(t.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.amountInput]}
                />
              </View>
            </Field>
          </ScrollView>

          {/* Inline date sheet */}
          {dateTarget !== null && (
            <DateSheet
              value={pendingDate}
              minDate={dateTarget === 'end' ? minEndDate : undefined}
              onChange={setPendingDate}
              onConfirm={confirmDate}
              onCancel={() => setDateTarget(null)}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function DateRow({
  value,
  placeholder,
  onPress,
  error,
}: {
  value: Date | null;
  placeholder: string;
  onPress: () => void;
  error?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.dateRow, error && styles.inputError]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons
        name="calendar-outline"
        size={18}
        color={Colors.textSecondary}
      />
      <Text
        style={[
          styles.dateRowText,
          !value && { color: Colors.textTertiary },
        ]}
      >
        {value ? formatDate(value) : placeholder}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

// Lightweight inline calendar date sheet (no external deps).
function DateSheet({
  value,
  minDate,
  onChange,
  onConfirm,
  onCancel,
}: {
  value: Date;
  minDate?: Date;
  onChange: (d: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [viewMonth, setViewMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1),
  );

  const translateY = useMemo(() => new Animated.Value(300), []);
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();
  }, [translateY]);

  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth(),
    1,
  ).getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  const isSelected = (d: Date) =>
    d.toDateString() === value.toDateString();
  const isDisabled = (d: Date) =>
    minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;

  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const navigate = (delta: number) => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1),
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.sheetBackdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={onCancel} hitSlop={10}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>Pick Date</Text>
          <TouchableOpacity onPress={onConfirm} hitSlop={10}>
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigate(-1)} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => navigate(1)} hitSlop={10}>
            <Ionicons name="chevron-forward" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Day-of-week row */}
        <View style={styles.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.weekCell}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((cell, i) => {
            if (!cell) return <View key={i} style={styles.cell} />;
            const selected = isSelected(cell);
            const disabled = isDisabled(cell);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cell,
                  selected && styles.cellSelected,
                  disabled && styles.cellDisabled,
                ]}
                disabled={disabled}
                activeOpacity={0.7}
                onPress={() => onChange(cell)}
              >
                <Text
                  style={[
                    styles.cellText,
                    selected && styles.cellTextSelected,
                    disabled && styles.cellTextDisabled,
                  ]}
                >
                  {cell.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    fontSize: 17,
  },
  saveText: {
    ...Typography.bodyMed,
    color: Colors.primary,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Sections
  sectionLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sectionGap: {
    marginTop: Spacing.xl,
  },

  // Field
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  fieldError: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },

  // Input
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountPrefix: {
    ...Typography.body,
    color: Colors.textSecondary,
    paddingLeft: Spacing.md,
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // Segmented
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    height: 40,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  segmentText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.surface,
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateRowText: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },

  // Date sheet
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
    ...Shadows.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.h3,
    fontSize: 17,
    color: Colors.text,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  monthLabel: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
  },
  weekCell: {
    flex: 1,
    textAlign: 'center',
    ...Typography.micro,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  cellDisabled: {
    opacity: 0.4,
  },
  cellText: {
    ...Typography.body,
    color: Colors.text,
  },
  cellTextSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  cellTextDisabled: {
    color: Colors.textTertiary,
  },
});
