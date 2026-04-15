import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FrostedSheet } from './FrostedSheet';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { haptics } from '../lib/haptics';

type SplitType = 'equal' | 'custom' | 'percentage';

const MEMBERS = ['You', 'Trip Member 1', 'Trip Member 2'];

type Props = {
  visible: boolean;
  amount: number;
  onClose: () => void;
  onApply: (splits: { name: string; amount: number }[]) => void;
};

export function ExpenseSplitSheet({ visible, amount, onClose, onApply }: Props) {
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  const equalShare = amount / MEMBERS.length;

  const getSplits = useCallback((): { name: string; amount: number }[] => {
    switch (splitType) {
      case 'equal':
        return MEMBERS.map((name) => ({ name, amount: equalShare }));
      case 'custom':
        return MEMBERS.map((name) => ({
          name,
          amount: parseFloat(customAmounts[name] ?? '0') || 0,
        }));
      case 'percentage':
        return MEMBERS.map((name) => ({
          name,
          amount: ((parseFloat(percentages[name] ?? '0') || 0) / 100) * amount,
        }));
    }
  }, [splitType, equalShare, customAmounts, percentages, amount]);

  const handleApply = useCallback(() => {
    haptics.success();
    onApply(getSplits());
  }, [onApply, getSplits]);

  const updateCustom = useCallback((name: string, value: string) => {
    setCustomAmounts((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updatePercent = useCallback((name: string, value: string) => {
    setPercentages((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <FrostedSheet visible={visible} onClose={onClose} tint="dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Split Expense</Text>

        {/* Amount display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        </View>

        {/* Split type tabs */}
        <View style={styles.tabRow}>
          {(['equal', 'custom', 'percentage'] as const).map((type) => {
            const active = splitType === type;
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.85}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => {
                  haptics.selection();
                  setSplitType(type);
                }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Members list */}
        <View style={styles.memberList}>
          {MEMBERS.map((name) => (
            <View key={name} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person-outline" size={16} color={Colors.textOnDarkSecondary} />
              </View>
              <Text style={styles.memberName}>{name}</Text>

              {splitType === 'equal' && (
                <Text style={styles.memberAmount}>${equalShare.toFixed(2)}</Text>
              )}

              {splitType === 'custom' && (
                <View style={styles.inputWrap}>
                  <Text style={styles.inputPrefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.textOnDarkTertiary}
                    value={customAmounts[name] ?? ''}
                    onChangeText={(val) => updateCustom(name, val)}
                  />
                </View>
              )}

              {splitType === 'percentage' && (
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textOnDarkTertiary}
                    value={percentages[name] ?? ''}
                    onChangeText={(val) => updatePercent(name, val)}
                  />
                  <Text style={styles.inputSuffix}>%</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Apply button */}
        <TouchableOpacity
          style={styles.applyButton}
          activeOpacity={0.85}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Apply Split</Text>
        </TouchableOpacity>
      </ScrollView>
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    color: Colors.textOnDark,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  amountLabel: {
    ...Typography.caption,
    color: Colors.textOnDarkSecondary,
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 38,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.frostedTintedOnDark,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textOnDarkSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  memberList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.frostedTintedOnDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    ...Typography.bodyMed,
    color: Colors.textOnDark,
    flex: 1,
  },
  memberAmount: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.primary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.frostedTintedOnDark,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    minWidth: 90,
  },
  inputPrefix: {
    ...Typography.bodyMed,
    color: Colors.textOnDarkSecondary,
    marginRight: 2,
  },
  inputSuffix: {
    ...Typography.bodyMed,
    color: Colors.textOnDarkSecondary,
    marginLeft: 2,
  },
  input: {
    ...Typography.bodyMed,
    color: Colors.textOnDark,
    paddingVertical: Spacing.sm,
    flex: 1,
    textAlign: 'right',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  applyButtonText: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
