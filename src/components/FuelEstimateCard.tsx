import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type Props = {
  totalMiles: number;
  mpg: number;
  gasPrice: number;
};

function FuelEstimateCardBase({ totalMiles, mpg, gasPrice }: Props) {
  const gallonsNeeded = mpg > 0 ? totalMiles / mpg : 0;
  const estimatedCost = gallonsNeeded * gasPrice;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="speedometer-outline" size={18} color={Colors.category.gas} />
        </View>
        <Text style={styles.title}>Fuel Estimate</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalMiles.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total miles</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{gallonsNeeded.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Gallons</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.costValue]}>
            ${estimatedCost.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Est. cost</Text>
        </View>
      </View>

      <View style={styles.inputsRow}>
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>MPG</Text>
          <Text style={styles.inputValue}>{mpg}</Text>
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Gas price</Text>
          <Text style={styles.inputValue}>${gasPrice.toFixed(2)}/gal</Text>
        </View>
      </View>
    </View>
  );
}

export const FuelEstimateCard = memo(FuelEstimateCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.category.gas}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text,
  },
  costValue: {
    color: Colors.category.gas,
  },
  statLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputBox: {
    flex: 1,
    backgroundColor: Colors.surfaceDim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  inputLabel: {
    ...Typography.micro,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputValue: {
    ...Typography.bodyMed,
    color: Colors.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
