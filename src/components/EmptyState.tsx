import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon: IoniconsName;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
  iconColor?: string;
}

export function EmptyState({ icon, title, subtitle, ctaLabel, onCta, iconColor = Colors.textSecondary }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={iconColor} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {ctaLabel && onCta && (
        <TouchableOpacity style={styles.cta} onPress={onCta} activeOpacity={0.8}>
          <Text style={styles.ctaLabel}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  icon: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  cta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  ctaLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
