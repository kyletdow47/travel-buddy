import { ReactNode } from 'react';
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
import { Colors, Spacing, Typography } from '../constants/theme';

type HeroPhotoHeaderProps = {
  /** Remote URI string or local `require()` image source. */
  source: ImageSourcePropType | string;
  /** Big headline rendered near the bottom of the header. */
  title?: string;
  /** Optional small-caps eyebrow that sits above the title. */
  eyebrow?: string;
  /** Optional descriptor rendered under the title. */
  subtitle?: string;
  /** Total header height. Defaults to 320. */
  height?: number;
  /**
   * If true, the safe-area top inset is added to the height so the photo
   * extends under the status bar. Defaults to true.
   */
  extendUnderStatusBar?: boolean;
  /** Top-right content (e.g. settings icon). */
  trailing?: ReactNode;
  /** Top-left content (e.g. back button). */
  leading?: ReactNode;
  /** Content rendered inside the header, below the title block. */
  children?: ReactNode;
  /** Additional container style overrides. */
  style?: ViewStyle;
};

/**
 * Full-bleed hero photo with a top→bottom gradient wash that keeps overlaid
 * text legible. Design-system primitive; see EPIC 1 — Design System v2.
 */
export function HeroPhotoHeader({
  source,
  title,
  eyebrow,
  subtitle,
  height = 320,
  extendUnderStatusBar = true,
  trailing,
  leading,
  children,
  style,
}: HeroPhotoHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = extendUnderStatusBar ? insets.top : 0;
  const imageSource =
    typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, { height: height + topInset }, style]}>
      <ImageBackground
        source={imageSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.25)',
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.55)',
          ]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={[styles.topBar, { paddingTop: topInset + Spacing.sm }]}>
        <View style={styles.topBarSide}>{leading}</View>
        <View style={[styles.topBarSide, styles.topBarTrailing]}>
          {trailing}
        </View>
      </View>

      <View style={styles.bottomBlock}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'flex-end',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  topBarSide: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },
  topBarTrailing: {
    justifyContent: 'flex-end',
  },
  bottomBlock: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  eyebrow: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
  },
});

export default HeroPhotoHeader;
