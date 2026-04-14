import { memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { haptics } from '../lib/haptics';

type Currency = {
  code: string;
  flag: string;
};

const CURRENCIES: Currency[] = [
  { code: 'USD', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'EUR', flag: '\u{1F1EA}\u{1F1FA}' },
  { code: 'GBP', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'JPY', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'CAD', flag: '\u{1F1E8}\u{1F1E6}' },
  { code: 'AUD', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: 'MXN', flag: '\u{1F1F2}\u{1F1FD}' },
  { code: 'THB', flag: '\u{1F1F9}\u{1F1ED}' },
];

type Props = {
  selectedCurrency: string;
  onSelect: (code: string) => void;
};

function CurrencyPickerBase({ selectedCurrency, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CURRENCIES.map((currency) => {
        const active = currency.code === selectedCurrency;
        return (
          <TouchableOpacity
            key={currency.code}
            activeOpacity={0.85}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => {
              haptics.selection();
              onSelect(currency.code);
            }}
          >
            <Text style={styles.flag}>{currency.flag}</Text>
            <Text style={[styles.code, active && styles.codeActive]}>
              {currency.code}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export const CurrencyPicker = memo(CurrencyPickerBase);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  flag: {
    fontSize: 16,
  },
  code: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  codeActive: {
    color: Colors.surface,
  },
});
