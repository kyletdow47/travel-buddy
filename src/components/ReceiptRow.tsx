import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Receipt } from '../types';
import type { ThemeColors } from '../hooks/useDarkColors';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface ReceiptRowProps {
  receipt: Receipt;
  onDelete?: (id: string) => void;
  colors: ThemeColors;
}

function getCategoryIcon(category: string | null): IoniconsName {
  switch (category) {
    case 'food': return 'restaurant';
    case 'transport': return 'car';
    case 'accommodation': return 'bed';
    case 'activity': return 'flag';
    case 'shopping': return 'bag';
    case 'health': return 'medical';
    default: return 'receipt';
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ReceiptRow({ receipt, onDelete, colors }: ReceiptRowProps) {
  function handleLongPress() {
    Alert.alert(receipt.merchant ?? 'Receipt', '', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Receipt', 'Delete this receipt?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(receipt.id) },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { borderColor: colors.border }]}>
        <Ionicons name={getCategoryIcon(receipt.category)} size={20} color={Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.merchant, { color: colors.text }]} numberOfLines={1}>
          {receipt.merchant ?? 'Unknown merchant'}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {[receipt.category, formatDate(receipt.receipt_date)].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>
          ${receipt.amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  merchant: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  meta: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
});
