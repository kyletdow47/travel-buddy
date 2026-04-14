import { memo } from 'react';
import { ScrollView, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { QuickActionCircle } from './QuickActionCircle';
import { Colors, Spacing } from '../constants/theme';
import type { CategoryKey } from './CategoryGlyph';

export type TripQuickAction =
  | 'activity'
  | 'flight'
  | 'lodging'
  | 'places'
  | 'transport'
  | 'note'
  | 'food'
  | 'shopping';

type ActionMeta = {
  label: string;
  icon: Parameters<typeof QuickActionCircle>[0]['icon'];
  category: CategoryKey;
};

const ACTION_META: Record<TripQuickAction, ActionMeta> = {
  activity: { label: 'Activity', icon: 'bicycle', category: 'activity' },
  flight: { label: 'Flights', icon: 'airplane', category: 'flight' },
  lodging: { label: 'Lodging', icon: 'bed', category: 'lodging' },
  places: { label: 'Places', icon: 'location', category: 'places' },
  transport: { label: 'Transport', icon: 'car', category: 'transport' },
  note: { label: 'Notes', icon: 'document-text', category: 'note' },
  food: { label: 'Food', icon: 'restaurant', category: 'food' },
  shopping: { label: 'Shopping', icon: 'bag-handle', category: 'shopping' },
};

// Default visible ordering on the Trip Home — matches Tripsy's row.
const DEFAULT_ACTIONS: TripQuickAction[] = [
  'activity',
  'flight',
  'lodging',
  'places',
  'transport',
  'note',
];

type Props = {
  /** Which actions to render, and in what order. Defaults to DEFAULT_ACTIONS. */
  actions?: TripQuickAction[];
  onAction?: (action: TripQuickAction) => void;
  /** Rendered on a dark backdrop (frosted sheet) if true. */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const TripQuickActionRow = memo(function TripQuickActionRow({
  actions = DEFAULT_ACTIONS,
  onAction,
  onDark = false,
  style,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={[styles.scroll, style]}
    >
      {actions.map((a) => {
        const meta = ACTION_META[a];
        return (
          <View key={a} style={styles.slot}>
            <QuickActionCircle
              icon={meta.icon}
              label={meta.label}
              color={
                onDark ? 'rgba(255,255,255,0.10)' : Colors.surface
              }
              iconColor={Colors.category[meta.category]}
              elevated={!onDark}
              onPress={() => onAction?.(a)}
              accessibilityLabel={`Add ${meta.label}`}
            />
          </View>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  slot: {
    alignItems: 'center',
    width: 72,
  },
});
