import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Typography, Spacing, Radius } from '../constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type TintedCategory = 'hotel' | 'food' | 'gas' | 'activity' | 'flight' | 'info' | 'success' | 'warning' | 'error' | 'other';

interface TintedPalette {
  tint: string;
  icon: IoniconsName;
  background: string;
  border: string;
  text: string;
  subtle: string;
}

// Tripsy-style category tints. Each entry pairs a saturated tint color with a
// soft background wash (~10% alpha) and a slightly darker text color so copy
// stays readable on the tinted surface.
export const CATEGORY_TINTS: Record<TintedCategory, TintedPalette> = {
  hotel:    { tint: '#6366F1', icon: 'bed',            background: 'rgba(99, 102, 241, 0.12)',  border: 'rgba(99, 102, 241, 0.25)',  text: '#3730A3', subtle: '#4F46E5' },
  food:     { tint: '#F59E0B', icon: 'restaurant',     background: 'rgba(245, 158, 11, 0.14)',  border: 'rgba(245, 158, 11, 0.28)',  text: '#92400E', subtle: '#B45309' },
  gas:      { tint: '#10B981', icon: 'car',            background: 'rgba(16, 185, 129, 0.12)',  border: 'rgba(16, 185, 129, 0.25)',  text: '#065F46', subtle: '#047857' },
  activity: { tint: '#E86540', icon: 'flag',           background: 'rgba(232, 101, 64, 0.12)',  border: 'rgba(232, 101, 64, 0.28)',  text: '#9A3412', subtle: '#C2410C' },
  flight:   { tint: '#0EA5E9', icon: 'airplane',       background: 'rgba(14, 165, 233, 0.12)',  border: 'rgba(14, 165, 233, 0.25)',  text: '#075985', subtle: '#0369A1' },
  info:     { tint: '#3B82F6', icon: 'information-circle', background: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.25)', text: '#1E3A8A', subtle: '#1D4ED8' },
  success:  { tint: '#10B981', icon: 'checkmark-circle',   background: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', text: '#065F46', subtle: '#047857' },
  warning:  { tint: '#F59E0B', icon: 'warning',            background: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.28)', text: '#92400E', subtle: '#B45309' },
  error:    { tint: '#EF4444', icon: 'alert-circle',       background: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.25)',  text: '#7F1D1D', subtle: '#B91C1C' },
  other:    { tint: '#6B7280', icon: 'ellipse',            background: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.25)', text: '#1F2937', subtle: '#374151' },
};

export interface TintedBannerProps {
  category: TintedCategory;
  title: string;
  subtitle?: string;
  /** Override the category's default icon. */
  icon?: IoniconsName;
  /** Right-hand slot (e.g. a close button or action chip). */
  trailing?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Compact variant with reduced padding and smaller icon. */
  compact?: boolean;
  accessibilityLabel?: string;
}

export function TintedBanner({
  category,
  title,
  subtitle,
  icon,
  trailing,
  onPress,
  style,
  compact = false,
  accessibilityLabel,
}: TintedBannerProps) {
  const palette = CATEGORY_TINTS[category];
  const iconName = icon ?? palette.icon;
  const iconSize = compact ? 18 : 22;
  const circleSize = compact ? 32 : 40;

  const content = (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          paddingVertical: compact ? Spacing.sm : Spacing.md,
          paddingHorizontal: compact ? Spacing.sm + 2 : Spacing.md,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: palette.tint,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      >
        <Ionicons name={iconName} size={iconSize} color="#FFFFFF" />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: palette.subtle }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${title}${subtitle ? `. ${subtitle}` : ''}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View accessibilityRole="text" accessibilityLabel={accessibilityLabel ?? `${title}${subtitle ? `. ${subtitle}` : ''}`}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 18,
  },
  trailing: {
    marginLeft: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
