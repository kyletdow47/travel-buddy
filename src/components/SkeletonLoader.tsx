import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

type Props = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer, reduceMotion]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  return (
    <View
      style={[
        styles.base,
        { width, height, borderRadius },
        style,
      ]}
    >
      {!reduceMotion && (
        <Animated.View
          style={[styles.shimmer, { transform: [{ translateX }] }]}
        />
      )}
    </View>
  );
}

// Skeleton for a trip card.
export function TripCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={12} style={{ marginTop: Spacing.sm }} />
        <Skeleton width="80%" height={6} style={{ marginTop: Spacing.md }} />
        <View style={styles.tagRow}>
          <Skeleton width={60} height={22} borderRadius={Radius.full} />
          <Skeleton width={60} height={22} borderRadius={Radius.full} />
        </View>
      </View>
      <Skeleton width={100} height={90} borderRadius={Radius.md} />
    </View>
  );
}

// Skeleton for a row (stop / receipt).
export function RowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={40} height={40} borderRadius={Radius.full} />
      <View style={styles.rowCenter}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={10} style={{ marginTop: Spacing.xs }} />
      </View>
      <Skeleton width={60} height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.45)',
    opacity: 0.7,
  },

  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  rowCenter: {
    flex: 1,
  },
});
