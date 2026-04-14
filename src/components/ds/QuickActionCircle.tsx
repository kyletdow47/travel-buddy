import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Shadows, Typography } from '../../constants/theme';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export type QuickActionCircleProps = {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
  tint?: string;
};

export function QuickActionCircle({ icon, label, onPress, tint = Colors.primary }: QuickActionCircleProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.circle, Shadows.sm]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    width: 72,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.frost,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
