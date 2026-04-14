import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Receipt } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { FrostedSheet } from './FrostedSheet';
import { QuickActionCircle } from './QuickActionCircle';
import { normalizeReceiptCategory } from './ReceiptRow';

const CATEGORY_META: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  hotel: { label: 'Hotel', icon: 'bed-outline', color: Colors.category.hotel },
  food: { label: 'Food', icon: 'restaurant-outline', color: Colors.category.food },
  gas: { label: 'Gas', icon: 'car-outline', color: Colors.category.gas },
  activity: { label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
  other: { label: 'Other', icon: 'pricetag-outline', color: Colors.category.other },
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

type Props = {
  receipt: Receipt | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ReceiptDetailSheet({
  receipt,
  visible,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!receipt) return null;

  const cat = normalizeReceiptCategory(receipt.category);
  const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
  const dateLabel = formatDate(receipt.receipt_date);

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="light"
      maxHeightRatio={0.65}
      accessibilityLabel={`Receipt details: ${receipt.merchant}`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero row — large icon + merchant + amount */}
        <View style={styles.heroRow}>
          <View style={[styles.heroGlyph, { backgroundColor: `${meta.color}18` }]}>
            <Ionicons name={meta.icon} size={32} color={meta.color} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.merchant} numberOfLines={2}>
              {receipt.merchant ?? 'Unknown merchant'}
            </Text>
            <Text style={styles.amount}>${(receipt.amount ?? 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Chips row */}
        <View style={styles.chipsRow}>
          {/* Category chip */}
          <View style={[styles.chip, { backgroundColor: `${meta.color}18` }]}>
            <Ionicons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.chipText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* Date chip */}
          {dateLabel ? (
            <View style={[styles.chip, { backgroundColor: Colors.surfaceDim }]}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
              <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                {dateLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Notes */}
        {receipt.notes ? (
          <View style={styles.notesBox}>
            <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <QuickActionCircle
            icon="create-outline"
            label="Edit"
            primary
            onPress={onEdit}
          />
          {onDelete ? (
            <QuickActionCircle
              icon="trash-outline"
              label="Delete"
              onPress={onDelete}
            />
          ) : null}
        </View>
      </ScrollView>
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xl,
  },

  // Hero
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroGlyph: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  merchant: {
    ...Typography.h2,
    color: Colors.text,
    lineHeight: 26,
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 28,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  chipText: {
    ...Typography.micro,
    fontWeight: '700',
  },

  // Notes
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  notesText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
  },
});
