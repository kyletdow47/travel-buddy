import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Toast, { type BaseToastProps, type ToastConfig } from 'react-native-toast-message';
import { TintedBanner, type TintedCategory } from './TintedBanner';
import { Spacing, Radius } from '../constants/theme';

/**
 * Toast variant for {@link Toast.show}. Pair with {@link showTintedToast} or
 * pass `type: 'tinted'` directly and stash the category in `props.category`.
 */
const TINTED_TOAST_TYPE = 'tinted' as const;

interface TintedToastProps extends BaseToastProps {
  props?: {
    category?: TintedCategory;
  };
}

function TintedToastRenderer({ text1, text2, props }: TintedToastProps) {
  const category = props?.category ?? 'info';
  return (
    <View style={styles.wrap}>
      <TintedBanner
        category={category}
        title={text1 ?? ''}
        subtitle={text2}
        style={styles.toast}
      />
    </View>
  );
}

/**
 * Toast config entry to register in the root `<Toast />` provider.
 *
 * @example
 *   import Toast from 'react-native-toast-message';
 *   import { tintedToastConfig } from '@/components/TintedToast';
 *   <Toast config={tintedToastConfig} />
 */
export const tintedToastConfig: ToastConfig = {
  [TINTED_TOAST_TYPE]: (props) => <TintedToastRenderer {...props} />,
};

export interface ShowTintedToastArgs {
  category: TintedCategory;
  title: string;
  subtitle?: string;
  /** Milliseconds the toast stays visible. Defaults to 3500. */
  visibilityTime?: number;
  /** 'top' | 'bottom'. Defaults to 'top'. */
  position?: 'top' | 'bottom';
  onPress?: () => void;
}

/**
 * Fire a category-tinted toast. Wrapper around `Toast.show` that picks the
 * correct custom type and stashes the category in props for the renderer.
 */
export function showTintedToast({
  category,
  title,
  subtitle,
  visibilityTime = 3500,
  position = 'top',
  onPress,
}: ShowTintedToastArgs): void {
  Toast.show({
    type: TINTED_TOAST_TYPE,
    text1: title,
    text2: subtitle,
    position,
    visibilityTime,
    onPress,
    props: { category },
  });
}

const styles = StyleSheet.create({
  wrap: {
    width: '92%',
    // Nudge below the status bar / above the home indicator; the library
    // already applies its own top/bottom offset, so only subtle padding here.
    paddingVertical: Spacing.xs,
  },
  toast: {
    // Toasts float over content — add shadow so the tinted surface reads as
    // a raised card rather than inline content.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: Radius.lg,
    ...Platform.select({
      android: { overflow: 'hidden' as const },
      default: {},
    }),
  },
});
