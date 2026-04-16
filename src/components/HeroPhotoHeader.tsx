import { ReactNode, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  Pressable,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing } from '../constants/theme';

// Optional LinearGradient — if expo-linear-gradient isn't installed we
// render a stacked opaque gradient stub using layered Views.
type LinearGradientComponent = React.ComponentType<{
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: readonly number[];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}>;

let LinearGradient: LinearGradientComponent | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  LinearGradient = require('expo-linear-gradient').LinearGradient ?? null;
} catch {
  LinearGradient = null;
}

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  /** Remote URL or local require for the hero photo. */
  source?: ImageSourcePropType | null;
  /** Big display title, e.g. "New York City". */
  title: string;
  /** Optional small eyebrow, e.g. "TRIP · 5 DAYS". */
  eyebrow?: string;
  /** Optional subtitle under the title, e.g. "Apr 14 – 19". */
  subtitle?: string;
  /** Height of the hero image area. Default 320. */
  height?: number;
  /** Back button handler — renders the pill-back button top-left. */
  onBack?: () => void;
  /** Optional single action icon top-right, e.g. 'share-outline'. */
  actionIcon?: IconName;
  onActionPress?: () => void;
  /** Extra content on top of the photo (chips, etc.). */
  children?: ReactNode;
  /** Fallback solid color if no photo. */
  fallbackColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * HeroPhotoHeader — full-bleed photo with bottom-darken scrim and
 * large display title, matching Tripsy's trip-detail hero.
 * Includes an optional pill back button and action icon.
 */
export function HeroPhotoHeader({
  source,
  title,
  eyebrow,
  subtitle,
  height = 320,
  onBack,
  actionIcon,
  onActionPress,
  children,
  fallbackColor = Colors.background,
  style,
}: Props) {
  const scrimColors = useMemo(
    () => Colors.gradient.hero as unknown as readonly string[],
    [],
  );

  const Content = (
    <View style={[StyleSheet.absoluteFill, styles.contentLayer]} pointerEvents="box-none">
      {/* Top control row */}
      <View style={styles.controls} pointerEvents="box-none">
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.ctrlPill,
              pressed ? { opacity: 0.8 } : null,
            ]}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
        {actionIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Action"
            onPress={onActionPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.ctrlPill,
              pressed ? { opacity: 0.8 } : null,
            ]}
          >
            <Ionicons name={actionIcon} size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Bottom title block */}
      <View style={styles.titleBlock} pointerEvents="box-none">
        {eyebrow ? (
          <Text style={[Typography.eyebrow, styles.eyebrow]} numberOfLines={1}>
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={[Typography.display, styles.title]}
          numberOfLines={2}
          allowFontScaling
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[Typography.bodyMed, styles.subtitle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );

  const Scrim = LinearGradient ? (
    <LinearGradient
      colors={scrimColors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      locations={[0, 1]}
      style={[StyleSheet.absoluteFill, { pointerEvents: 'none' as const }]}
    />
  ) : (
    // Fallback: layered solid scrim
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.fallbackScrim]} />
  );

  const body = source ? (
    <ImageBackground
      source={source}
      style={[styles.hero, { height }]}
      imageStyle={styles.heroImage}
      resizeMode="cover"
    >
      {Scrim}
      {Content}
    </ImageBackground>
  ) : (
    <View style={[styles.hero, { height, backgroundColor: fallbackColor }]}>
      {Scrim}
      {Content}
    </View>
  );

  return <View style={[styles.wrap, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  hero: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  heroImage: {
    // no rounded corners — sheets above will clip themselves.
  },
  fallbackScrim: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  contentLayer: {
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.select({ ios: 54, android: Spacing.lg, default: Spacing.lg }),
  },
  ctrlPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  titleBlock: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 2,
  },
  title: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
  },
});
