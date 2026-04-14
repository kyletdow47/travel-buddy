import React, { ReactNode } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '../constants/theme';

export type HeroPhotoSource = ImageSourcePropType | string;

export interface HeroPhotoHeaderProps {
  source: HeroPhotoSource;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  /** Element rendered on the leading (top-left) corner — e.g. back button. */
  leading?: ReactNode;
  /** Element rendered on the trailing (top-right) corner — e.g. action menu. */
  trailing?: ReactNode;
  /** Children rendered below the title block (still on top of the photo). */
  children?: ReactNode;
  /** Total visible height of the header (excluding the safe-area inset). */
  height?: number;
  /**
   * When true (default), the header extends behind the status bar and adds the
   * safe-area top inset to its height, so chrome (back button / title) is
   * positioned below the notch / dynamic island.
   */
  extendUnderStatusBar?: boolean;
  style?: ViewStyle;
}

const DEFAULT_HEIGHT = 320;

/**
 * HeroPhotoHeader — full-bleed photo with a top→bottom gradient wash so
 * overlaid text stays legible on any image. Used as the visual anchor for
 * Trip Detail, Home, and other "destination" surfaces.
 */
export function HeroPhotoHeader({
  source,
  title,
  eyebrow,
  subtitle,
  leading,
  trailing,
  children,
  height = DEFAULT_HEIGHT,
  extendUnderStatusBar = true,
  style,
}: HeroPhotoHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = extendUnderStatusBar ? insets.top : 0;
  const totalHeight = height + topInset;

  const imageSource: ImageSourcePropType =
    typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, { height: totalHeight }, style]}>
      <ImageBackground
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.25)',
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.55)',
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {(leading || trailing) && (
          <View style={[styles.chromeRow, { paddingTop: topInset + Spacing.sm }]}>
            <View style={styles.chromeSlot}>{leading}</View>
            <View style={[styles.chromeSlot, styles.chromeSlotEnd]}>
              {trailing}
            </View>
          </View>
        )}

        <View style={styles.contentBlock}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chromeRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  chromeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chromeSlotEnd: {
    justifyContent: 'flex-end',
  },
  contentBlock: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    lineHeight: 38,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
});

export default HeroPhotoHeader;
