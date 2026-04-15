import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type Props = {
  spent: number;
  budget: number;
};

function barColor(percent: number): string {
  if (percent > 0.9) return Colors.error;
  if (percent > 0.7) return Colors.warning;
  return Colors.success;
}

function BudgetProgressBarBase({ spent, budget }: Props) {
  const percent = budget > 0 ? Math.min(1, spent / budget) : 0;
  const displayPercent = Math.round(percent * 100);
  const color = barColor(percent);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          ${spent.toFixed(2)} / ${budget.toLocaleString()} spent
        </Text>
        <Text style={[styles.percent, { color }]}>{displayPercent}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percent * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export const BudgetProgressBar = memo(BudgetProgressBarBase);

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
  },
  percent: {
    ...Typography.caption,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderOnCard,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
