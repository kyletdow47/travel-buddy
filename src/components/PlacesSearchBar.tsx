import { memo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
};

/**
 * PlacesSearchBar — a frosted-background search input for finding places.
 * Styled to match the chip strip overlay in the map screen.
 */
function PlacesSearchBarBase({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search places...',
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export const PlacesSearchBar = memo(PlacesSearchBarBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
    ...Platform.select({
      ios: {},
      android: { elevation: 3 },
    }),
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    padding: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
  },
});
