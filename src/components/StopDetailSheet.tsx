import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { CategoryIcon } from './CategoryIcon';
import type { Stop } from '../types';

interface StopDetailSheetProps {
  stop: Stop | null;
  onClose: () => void;
}

const SHEET_HEIGHT = 220;

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function openInMaps(stop: Stop) {
  const label = encodeURIComponent(stop.name);
  const lat = stop.lat as number;
  const lng = stop.lng as number;

  const url =
    Platform.OS === 'ios'
      ? `maps://?q=${label}&ll=${lat},${lng}`
      : `geo:${lat},${lng}?q=${label}`;

  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  });
}

function statusBg(status: string): string {
  if (status === 'current') return Colors.primary;
  if (status === 'done') return Colors.success;
  return Colors.backgroundSecondary;
}

function statusFg(status: string): string {
  if (status === 'current' || status === 'done') return '#FFFFFF';
  return Colors.textSecondary;
}

export function StopDetailSheet({ stop, onClose }: StopDetailSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: stop ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [stop, translateY]);

  const hasCoords = stop?.lat != null && stop?.lng != null;
  const stopStatus = (stop?.status as string) ?? 'upcoming';

  return (
    <Animated.View
      style={[styles.sheet, { transform: [{ translateY }] }]}
      pointerEvents={stop ? 'box-none' : 'none'}
    >
      {/* Handle bar */}
      <View style={styles.handle} />

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      {stop && (
        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <CategoryIcon category={stop.category} size={20} />
            <View style={styles.titleBlock}>
              <Text style={styles.stopName} numberOfLines={1}>
                {stop.name}
              </Text>
              {stop.location ? (
                <Text style={styles.location} numberOfLines={1}>
                  {stop.location}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Details row */}
          <View style={styles.detailsRow}>
            {stop.planned_date ? (
              <View style={styles.datePill}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.datePillText}>{formatDate(stop.planned_date)}</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusBg(stopStatus), borderColor: statusBg(stopStatus) },
              ]}
            >
              <Text style={[styles.statusPillText, { color: statusFg(stopStatus) }]}>
                {stopStatus.charAt(0).toUpperCase() + stopStatus.slice(1)}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {stop.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {stop.notes}
            </Text>
          ) : null}

          {/* Navigate button */}
          {hasCoords ? (
            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={() => openInMaps(stop)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.navigateBtnText}>Navigate</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm + 4,
    right: Spacing.md,
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: 32,
  },
  titleBlock: {
    flex: 1,
  },
  stopName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  location: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    marginTop: 'auto',
  },
  navigateBtnText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
