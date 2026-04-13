import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Receipt } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type CategoryKey = 'hotel' | 'food' | 'gas' | 'activity' | 'other';

const CATEGORY_META: Record<
  CategoryKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  hotel: { label: 'Hotel', icon: 'bed-outline', color: Colors.category.hotel },
  food: { label: 'Food', icon: 'restaurant-outline', color: Colors.category.food },
  gas: { label: 'Gas', icon: 'car-outline', color: Colors.category.gas },
  activity: { label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
  other: { label: 'Other', icon: 'pricetag-outline', color: Colors.category.other },
};

export function normalizeReceiptCategory(raw: string | null | undefined): CategoryKey {
  const value = (raw ?? '').toLowerCase();
  if (value === 'hotel' || value === 'food' || value === 'gas' || value === 'activity') {
    return value;
  }
  return 'other';
}

function formatShortDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type Props = {
  receipt: Receipt;
  onPress?: () => void;
  onLongPress?: () => void;
};

function ReceiptRowBase({ receipt, onPress, onLongPress }: Props) {
  const category = normalizeReceiptCategory(receipt.category);
  const meta = CATEGORY_META[category];

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}26` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.center}>
        <Text style={styles.merchant} numberOfLines={1}>
          {receipt.merchant ?? 'Unknown merchant'}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta.label}
          {receipt.receipt_date ? ` · ${formatShortDate(receipt.receipt_date)}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>${(receipt.amount ?? 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export const ReceiptRow = memo(ReceiptRowBase);

export function ReceiptSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  merchant: {
    ...Typography.bodyMed,
    fontWeight: '600',
    color: Colors.text,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 40 + Spacing.md,
  },
});
