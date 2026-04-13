import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface StopDetailSheetProps {
  stop: Stop | null;
  onDismiss: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: Colors.warning },
  current: { label: 'Current', color: Colors.primary },
  done: { label: 'Done', color: Colors.success },
};

export const StopDetailSheet = forwardRef<BottomSheet, StopDetailSheetProps>(
  ({ stop, onDismiss }, ref) => {
    const snapPoints = useMemo(() => ['40%', '70%'], []);

    const handleGetDirections = useCallback(() => {
      if (!stop?.lat || !stop?.lng) return;
      const url = Platform.select({
        ios: `maps://maps.apple.com/?daddr=${stop.lat},${stop.lng}&dirflg=d`,
        default: `https://maps.google.com/?daddr=${stop.lat},${stop.lng}`,
      });
      Linking.openURL(url);
    }, [stop]);

    if (!stop) return null;

    const statusInfo = STATUS_LABELS[stop.status ?? 'upcoming'] ?? STATUS_LABELS.upcoming;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onDismiss}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.header}>
            <CategoryIcon category={stop.category} size={24} showBackground />
            <View style={styles.headerText}>
              <Text style={styles.stopName}>{stop.name}</Text>
              <View style={[styles.statusChip, { backgroundColor: statusInfo.color + '20' }]}>
                <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {stop.location ? (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{stop.location}</Text>
            </View>
          ) : null}

          {stop.planned_date ? (
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{stop.planned_date}</Text>
            </View>
          ) : null}

          {stop.notes ? (
            <View style={styles.row}>
              <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{stop.notes}</Text>
            </View>
          ) : null}

          {stop.lat != null && stop.lng != null ? (
            <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
              <Ionicons name="navigate" size={20} color={Colors.background} />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          ) : null}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

StopDetailSheet.displayName = 'StopDetailSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: Colors.border,
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  stopName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  rowText: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  directionsButtonText: {
    color: Colors.background,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
});
