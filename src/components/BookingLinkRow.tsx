import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { haptics } from '../lib/haptics';

type Service = {
  name: string;
  icon: string;
  type: string;
};

type Props = {
  service: Service;
};

function serviceIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type.toLowerCase()) {
    case 'hotel':
    case 'hotels':
      return 'bed-outline';
    case 'flight':
    case 'flights':
      return 'airplane-outline';
    case 'activity':
    case 'activities':
      return 'ticket-outline';
    default:
      return 'open-outline';
  }
}

function serviceColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'hotel':
    case 'hotels':
      return Colors.category.lodging;
    case 'flight':
    case 'flights':
      return Colors.category.flight;
    case 'activity':
    case 'activities':
      return Colors.category.activity;
    default:
      return Colors.textSecondary;
  }
}

function BookingLinkRowBase({ service }: Props) {
  const icon = serviceIcon(service.type);
  const color = serviceColor(service.type);

  const handlePress = useCallback(() => {
    haptics.light();
    Alert.alert(
      service.name,
      `Opening ${service.name} to search deals... (coming soon)`,
      [{ text: 'OK' }],
    );
  }, [service.name]);

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handlePress}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.subtitle}>Search deals</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export const BookingLinkRow = memo(BookingLinkRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.bodyMed,
    color: Colors.text,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
