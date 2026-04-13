import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, borderRadius = Radius.sm, style }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={[{ width: width as DimensionValue, height, borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: Colors.border,
          opacity,
        }}
      />
    </View>
  );
}

export function SkeletonTripCard() {
  return (
    <View style={styles.tripCard}>
      <View style={styles.tripCardStripe} />
      <View style={styles.tripCardContent}>
        <SkeletonLoader width="60%" height={20} borderRadius={4} style={styles.mb8} />
        <SkeletonLoader width="40%" height={14} borderRadius={4} style={styles.mb8} />
        <View style={styles.row}>
          <SkeletonLoader width={70} height={24} borderRadius={Radius.full} style={styles.mr8} />
          <SkeletonLoader width={80} height={24} borderRadius={Radius.full} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonStopRow() {
  return (
    <View style={styles.stopRow}>
      <SkeletonLoader width={40} height={40} borderRadius={Radius.sm} style={styles.mr12} />
      <View style={styles.flex1}>
        <SkeletonLoader width="55%" height={16} borderRadius={4} style={styles.mb8} />
        <SkeletonLoader width="40%" height={13} borderRadius={4} />
      </View>
      <SkeletonLoader width={60} height={24} borderRadius={Radius.full} />
    </View>
  );
}

export function SkeletonReceiptRow() {
  return (
    <View style={styles.receiptRow}>
      <SkeletonLoader width={40} height={40} borderRadius={Radius.sm} style={styles.mr12} />
      <View style={styles.flex1}>
        <SkeletonLoader width="50%" height={16} borderRadius={4} style={styles.mb8} />
        <SkeletonLoader width="35%" height={13} borderRadius={4} />
      </View>
      <View style={styles.alignEnd}>
        <SkeletonLoader width={60} height={18} borderRadius={4} style={styles.mb8} />
        <SkeletonLoader width={40} height={13} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tripCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  tripCardStripe: {
    width: 4,
    backgroundColor: Colors.border,
  },
  tripCardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  mb8: {
    marginBottom: 8,
  },
  mr8: {
    marginRight: 8,
  },
  mr12: {
    marginRight: 12,
  },
});
