import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { haptics } from '../lib/haptics';
import type { PackingItem } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Clothing: '#3AA4FF',
  Toiletries: '#E94A8B',
  Electronics: '#F5B63B',
  Documents: '#8E8E93',
  Medicine: '#22C55E',
  Snacks: '#F2994A',
  Gear: '#5E7891',
  Other: '#C94FBF',
};

type Props = {
  item: PackingItem;
  onToggle: (id: string, packed: boolean) => Promise<unknown>;
  onLongPress?: (item: PackingItem) => void;
};

export function PackingItemRow({ item, onToggle, onLongPress }: Props) {
  const handleToggle = useCallback(() => {
    haptics.selection();
    onToggle(item.id, !item.packed);
  }, [item.id, item.packed, onToggle]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      haptics.medium();
      onLongPress(item);
    }
  }, [item, onLongPress]);

  const categoryColor =
    CATEGORY_COLORS[item.category ?? 'Other'] ?? Colors.textTertiary;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={handleToggle}
      onLongPress={handleLongPress}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          item.packed && styles.checkboxChecked,
        ]}
      >
        {item.packed && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.name, item.packed && styles.namePacked]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <View style={styles.meta}>
          {item.category && (
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: categoryColor + '18' },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {item.category}
              </Text>
            </View>
          )}

          {item.assigned_to && (
            <View style={styles.assignedBadge}>
              <Ionicons
                name="person-outline"
                size={10}
                color={Colors.textOnCardSecondary}
              />
              <Text style={styles.assignedText}>{item.assigned_to}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function PackingItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.card,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.borderOnCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.body,
    color: Colors.textOnCard,
  },
  namePacked: {
    textDecorationLine: 'line-through',
    color: Colors.textOnCardTertiary,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryText: {
    ...Typography.micro,
    fontWeight: '600',
  },

  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardSecondary,
  },
  assignedText: {
    ...Typography.micro,
    color: Colors.textOnCardSecondary,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderOnCard,
    marginLeft: Spacing.lg + 24 + Spacing.md,
  },
});
