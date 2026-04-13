import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import CategoryIcon from './CategoryIcon';
import { getCategoryColor } from './CategoryIcon';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

const SNAP_POINTS = ['40%', '70%'];

interface StopDetailSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  stop: Stop | null;
  onDismiss: () => void;
}

function StatusChip({ status }: { status: string | null }) {
  const label = status ?? 'upcoming';
  const chipColor =
    label === 'done'
      ? Colors.success
      : label === 'current'
        ? Colors.primary
        : Colors.textSecondary;

  return (
    <View style={[styles.statusChip, { backgroundColor: `${chipColor}18` }]}>
      <Text style={[styles.statusChipText, { color: chipColor }]}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} style={styles.detailIcon} />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function StopDetailSheet({ sheetRef, stop, onDismiss }: StopDetailSheetProps) {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />
    ),
    [],
  );

  const handleGetDirections = useCallback(() => {
    if (!stop?.lat || !stop?.lng) {
      Alert.alert('No coordinates', 'This stop does not have GPS coordinates.');
      return;
    }
    const url = `maps://maps.apple.com/?daddr=${stop.lat},${stop.lng}&dirflg=d`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Apple Maps.');
    });
  }, [stop]);

  if (!stop) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onClose={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <CategoryIcon category={stop.category} size={36} />
          <View style={styles.headerText}>
            <Text style={styles.stopName}>{stop.name}</Text>
            <StatusChip status={stop.status} />
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          {stop.location && (
            <DetailRow icon="location-outline" label="Location" value={stop.location} />
          )}
          {stop.planned_date && (
            <DetailRow
              icon="calendar-outline"
              label="Planned Date"
              value={new Date(stop.planned_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            />
          )}
          {stop.notes && <DetailRow icon="document-text-outline" label="Notes" value={stop.notes} />}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {(stop.lat != null && stop.lng != null) && (
            <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  handleIndicator: {
    backgroundColor: Colors.border,
    width: 40,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stopName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    flexShrink: 1,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusChipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  details: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.text,
  },
  actions: {
    gap: Spacing.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  directionsButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
