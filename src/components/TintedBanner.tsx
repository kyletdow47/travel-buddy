import { ReactNode, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Radius, Spacing, Typography, Shadows } from '../constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export type BannerTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const TONE_META: Record<BannerTone, { color: string; icon: IconName }> = {
  success: { color: Colors.success, icon: 'checkmark-circle' },
  warning: { color: Colors.warning, icon: 'alert-circle' },
  error: { color: Colors.error, icon: 'close-circle' },
  info: { color: Colors.info, icon: 'information-circle' },
  neutral: { color: Colors.textSecondary, icon: 'ellipsis-horizontal-circle' },
};

type Props = {
  title: string;
  message?: string;
  tone?: BannerTone;
  /** Override icon glyph. */
  icon?: IconName;
  /** Optional right-side action. */
  actionLabel?: string;
  onActionPress?: () => void;
  /** Optional close/dismiss affordance. */
  onDismiss?: () => void;
  /** Inline banner (static) vs. floating toast (auto-dismiss). */
  variant?: 'inline' | 'toast';
  /** Toast auto-dismiss ms. Default 3200. */
  duration?: number;
  /** Toast visible. Required for `toast` variant. */
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * TintedBanner / TintedToast — banner card with a tint of the tone
 * color (~12% alpha) and a colored icon + title + optional message.
 * As `toast`, it slides up from the top and auto-dismisses.
 */
export function TintedBanner({
  title,
  message,
  tone = 'info',
  icon,
  actionLabel,
  onActionPress,
  onDismiss,
  variant = 'inline',
  duration = 3200,
  visible = true,
  style,
}: Props) {
  const meta = TONE_META[tone];
  const translate = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const reducedMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        reducedMotion.current = !!v;
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (variant !== 'toast') return;
    if (visible) {
      if (reducedMotion.current) {
        translate.setValue(0);
        opacity.setValue(1);
      } else {
        Animated.parallel([
          Animated.spring(translate, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 220,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      }
      const t = setTimeout(() => onDismiss?.(), duration);
      return () => clearTimeout(t);
    }

    if (reducedMotion.current) {
      translate.setValue(-80);
      opacity.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(translate, {
        toValue: -80,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    return undefined;
  }, [variant, visible, duration, onDismiss, translate, opacity]);

  const resolvedIcon = icon ?? meta.icon;
  const tint = `${meta.color}1F`; // ~12% alpha
  const border = `${meta.color}40`;

  const content = (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        { backgroundColor: tint, borderColor: border },
        variant === 'toast' ? Shadows.md : null,
      ]}
    >
      <Ionicons name={resolvedIcon} size={20} color={meta.color} />
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: meta.color }]} numberOfLines={2}>
          {title}
        </Text>
        {message ? (
          <Text style={styles.message} numberOfLines={3}>
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={({ pressed }) => [
            styles.actionBtn,
            { borderColor: meta.color, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.actionText, { color: meta.color }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss && variant === 'inline' ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [
            styles.closeBtn,
            pressed ? { opacity: 0.6 } : null,
          ]}
        >
          <Ionicons name="close" size={16} color={Colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );

  if (variant !== 'toast') {
    return <View style={[styles.inlineWrap, style]}>{content}</View>;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastWrap,
        { transform: [{ translateY: translate }], opacity },
        style,
      ]}
    >
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inlineWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  toastWrap: {
    position: 'absolute',
    top: Spacing.xxl,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodyMed,
    fontWeight: '600',
  },
  message: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  actionBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  actionText: {
    ...Typography.micro,
  },
  closeBtn: {
    padding: 2,
  },
});

/** Convenience alias for the toast variant. */
export function TintedToast(props: Omit<Props, 'variant'>) {
  return <TintedBanner {...props} variant="toast" />;
}
