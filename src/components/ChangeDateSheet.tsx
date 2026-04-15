import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import { FrostedSheet } from './FrostedSheet';

type Props = {
  visible: boolean;
  currentDate: string | null;
  stopName: string;
  onClose: () => void;
  onSave: (newDate: string | null) => void;
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(str: string): boolean {
  if (!DATE_REGEX.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime());
}

export function ChangeDateSheet({
  visible,
  currentDate,
  stopName,
  onClose,
  onSave,
}: Props) {
  const [value, setValue] = useState(currentDate ?? '');
  const [error, setError] = useState<string | null>(null);

  // Reset state when sheet opens
  const handleShow = useCallback(() => {
    setValue(currentDate ?? '');
    setError(null);
  }, [currentDate]);

  const handleSave = useCallback(() => {
    const trimmed = value.trim();

    // Allow clearing the date (move to unscheduled)
    if (trimmed === '') {
      onSave(null);
      onClose();
      return;
    }

    if (!isValidDate(trimmed)) {
      setError('Enter a valid date: YYYY-MM-DD');
      return;
    }

    onSave(trimmed);
    onClose();
  }, [value, onSave, onClose]);

  // Ensure state resets when visible toggles to true
  if (visible && value !== (currentDate ?? '') && error === null) {
    // intentionally left for the FrostedSheet onShow — but as a fallback
    // we just rely on the parent re-mounting or the initial state
  }

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="light"
      maxHeightRatio={0.45}
      accessibilityLabel={`Change date for ${stopName}`}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={22} color={Colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Change Date</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {stopName}
            </Text>
          </View>
        </View>

        {/* Current date label */}
        {currentDate ? (
          <View style={styles.currentRow}>
            <Text style={styles.currentLabel}>Current:</Text>
            <Text style={styles.currentValue}>
              {new Date(currentDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        ) : (
          <View style={styles.currentRow}>
            <Text style={styles.currentLabel}>Currently:</Text>
            <Text style={[styles.currentValue, { color: Colors.textTertiary }]}>
              Unscheduled
            </Text>
          </View>
        )}

        {/* Date input */}
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (error) setError(null);
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numbers-and-punctuation"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.hintText}>
              Leave empty to unschedule
            </Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={18} color={"#FFFFFF"} />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Current date
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceDim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  currentLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  currentValue: {
    ...Typography.bodyMed,
    color: Colors.text,
    flex: 1,
  },

  // Input
  inputWrap: {
    gap: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    paddingLeft: Spacing.xs,
  },
  hintText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    paddingLeft: Spacing.xs,
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceDim,
  },
  cancelText: {
    ...Typography.bodyMed,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  saveText: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
