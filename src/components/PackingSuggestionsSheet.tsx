import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FrostedSheet } from './FrostedSheet';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { PackingSuggestion } from '../services/packingSuggestionService';

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

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Clothing: 'shirt-outline',
  Toiletries: 'water-outline',
  Electronics: 'laptop-outline',
  Documents: 'document-text-outline',
  Medicine: 'medkit-outline',
  Snacks: 'fast-food-outline',
  Gear: 'fitness-outline',
  Other: 'ellipsis-horizontal-outline',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  suggestions: PackingSuggestion[];
  loading: boolean;
  error: string | null;
  onAddSelected: (items: PackingSuggestion[]) => void;
};

export function PackingSuggestionsSheet({
  visible,
  onClose,
  suggestions,
  loading,
  error,
  onAddSelected,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleItem = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(suggestions.map((_, i) => i)));
  }, [suggestions]);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleAdd = useCallback(() => {
    const items = suggestions.filter((_, i) => selected.has(i));
    if (items.length > 0) {
      onAddSelected(items);
    }
    onClose();
  }, [suggestions, selected, onAddSelected, onClose]);

  const handleOpen = useCallback(() => {
    setSelected(new Set(suggestions.map((_, i) => i)));
  }, [suggestions]);

  const allSelected = selected.size === suggestions.length && suggestions.length > 0;

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="dark"
      maxHeightRatio={0.85}
      accessibilityLabel="AI packing suggestions"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIconWrap}>
            <Ionicons name="sparkles" size={18} color="#F5B63B" />
          </View>
          <Text style={styles.title}>AI Suggestions</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing your trip...</Text>
          <Text style={styles.loadingSubtext}>
            Considering weather, activities, and destination
          </Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={Colors.error} />
          <Text style={styles.errorText}>Could not generate suggestions</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <View style={styles.emptyWrap}>
          <Ionicons name="checkmark-circle-outline" size={32} color={Colors.success} />
          <Text style={styles.emptyText}>You're all set!</Text>
          <Text style={styles.emptySubtext}>
            No additional items to suggest — your list looks comprehensive.
          </Text>
        </View>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <>
          <View style={styles.toggleRow}>
            <Text style={styles.countText}>
              {selected.size} of {suggestions.length} selected
            </Text>
            <TouchableOpacity
              onPress={allSelected ? deselectAll : selectAll}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.toggleText}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            onLayout={handleOpen}
          >
            {suggestions.map((item, index) => {
              const isSelected = selected.has(index);
              const color = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other;
              const icon = CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.Other;
              return (
                <TouchableOpacity
                  key={`${item.name}-${item.category}-${index}`}
                  style={[styles.suggestionRow, isSelected && styles.suggestionRowSelected]}
                  activeOpacity={0.7}
                  onPress={() => toggleItem(index)}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textTertiary}
                  />
                  <View style={[styles.categoryDot, { backgroundColor: color + '30' }]}>
                    <Ionicons name={icon} size={14} color={color} />
                  </View>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.categoryBadgeText, { color }]}>
                      {item.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.addButton, selected.size === 0 && styles.addButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleAdd}
            disabled={selected.size === 0}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>
              Add {selected.size} Item{selected.size !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,182,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },

  loadingWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodyMed,
    color: Colors.text,
    fontWeight: '600',
  },
  loadingSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  errorWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.bodyMed,
    color: Colors.error,
    fontWeight: '600',
  },
  errorSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodyMed,
    color: Colors.success,
    fontWeight: '600',
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  countText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  toggleText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },

  listScroll: {
    maxHeight: 340,
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  suggestionRowSelected: {
    backgroundColor: 'rgba(79,140,255,0.08)',
  },
  categoryDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionName: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    ...Typography.micro,
    fontWeight: '600',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
