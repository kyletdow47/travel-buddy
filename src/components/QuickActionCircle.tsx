import { memo, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  AccessibilityRole,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Shadows, Spacing, Typography } from '../constants/theme';

// Defensive haptics — works without the native module.
let Haptics: {
  selectionAsync?: () => Promise<void>;
  impactAsync?: (style?: unknown) => Promise<void>;
  ImpactFeedbackStyle?: { Light?: unknown; Medium?: unknown; Heavy?: unknown };
} | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

type IconName = keyof typeof Ionicons.glyphMap;

type Size = 'sm' | 'md' | 'lg';

type Props = {
  icon: IconName;
  /** Optional stacked label below the circle. */
  label?: string;
  /** Solid fill color. Default = surface (white) on light backgrounds. */
  color?: string;
  /** Icon color. Default resolves for contrast against `color`. */
  iconColor?: string;
  /** 'sm' 40 · 'md' 48 · 'lg' 56 */
  size?: Size;
  /** If true, uses filled primary treatment (orange circle + white icon). */
  primary?: boolean;
  /** If true, circle has no fill and just a 1.5pt colored border. */
  outlined?: boolean;
  /** Drop shadow under the circle. Default true. */
  elevated?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  style?: StyleProp<ViewStyle>;
  /** Disable haptic feedback. Default false (haptics on). */
  noHaptic?: boolean;
};

const SIZE_MAP: Record<Size, { circle: number; icon: number; label: number }> = {
  sm: { circle: 40, icon: 18, label: 11 },
  md: { circle: 48, icon: 22, label: 12 },
  lg: { circle: 56, icon: 26, label: 13 },
};

/**
 * QuickActionCircle — the small round tappable buttons in Tripsy's
 * action grid ("Book hotel", "Add flight", "Import", etc.).
 *
 * Tap target is always ≥44pt including padding so the 40pt 'sm' still
 * passes a11y.
 */
export const QuickActionCircle = memo(function QuickActionCircle({
  icon,
  label,
  color,
  iconColor,
  size = 'md',
  primary = false,
  outlined = false,
  elevated = true,
  onPress,
  onLongPress,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = 'button',
  style,
  noHaptic = false,
}: Props) {
  const { circle, icon: iconSize, label: labelSize } = SIZE_MAP[size];

  const fill = primary
    ? Colors.primary
    : outlined
      ? 'transparent'
      : (color ?? Colors.surface);

  const resolvedIconColor =
    iconColor ??
    (primary
      ? '#FFFFFF'
      : outlined
        ? (color ?? Colors.primary)
        : Colors.text);

  const borderColor = outlined ? (color ?? Colors.primary) : 'transparent';

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (!noHaptic && Haptics?.selectionAsync) {
        Haptics.selectionAsync().catch(() => undefined);
      }
      onPress?.(e);
    },
    [onPress, noHaptic],
  );

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={disabled ? { disabled: true } : undefined}
        disabled={disabled}
        onPress={handlePress}
        onLongPress={onLongPress}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={({ pressed }) => [
          styles.circle,
          {
            width: circle,
            height: circle,
            borderRadius: circle / 2,
            backgroundColor: fill,
            borderWidth: outlined ? 1.5 : 0,
            borderColor,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
          elevated && !outlined ? Shadows.glyph : null,
        ]}
      >
        <Ionicons name={icon} size={iconSize} color={resolvedIconColor} />
      </Pressable>
      {label ? (
        <Text
          numberOfLines={1}
          style={[styles.label, { fontSize: labelSize }]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.xs,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.caption,
    color: Colors.text,
    textAlign: 'center',
    maxWidth: 80,
  },
});
