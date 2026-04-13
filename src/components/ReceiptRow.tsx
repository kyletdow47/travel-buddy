import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Receipt } from '../types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_ICONS: Record<string, IoniconName> = {
  food: 'restaurant-outline',
  hotel: 'bed-outline',
  gas: 'car-outline',
  activity: 'bicycle-outline',
  other: 'receipt-outline',
};

function getCategoryIcon(category: string | null): IoniconName {
  if (!category) return 'receipt-outline';
  return CATEGORY_ICONS[category.toLowerCase()] ?? 'receipt-outline';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

interface Props {
  receipt: Receipt;
  onPress: () => void;
  onDelete: () => void;
}

export default function ReceiptRow({ receipt, onPress, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  function renderRightActions() {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  }

  const category = receipt.category
    ? receipt.category.charAt(0).toUpperCase() + receipt.category.slice(1)
    : 'Other';

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        {/* Left: thumbnail or icon */}
        <View style={styles.thumbnailWrapper}>
          {receipt.image_url ? (
            <Image
              source={{ uri: receipt.image_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons name={getCategoryIcon(receipt.category)} size={22} color={Colors.primary} />
            </View>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text style={styles.merchant} numberOfLines={1}>
            {receipt.merchant ?? 'Unknown merchant'}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {category}
            {receipt.receipt_date ? ` · ${formatDate(receipt.receipt_date)}` : ''}
          </Text>
        </View>

        {/* Right: amount */}
        <Text style={styles.amount}>{formatAmount(receipt.amount)}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  thumbnailWrapper: {
    width: 50,
    height: 50,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 50,
    height: 50,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  center: {
    flex: 1,
    gap: 2,
  },
  merchant: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  meta: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
  },
  amount: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
