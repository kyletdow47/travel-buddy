import { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type Airport = {
  code: string;
  city: string;
  country: string;
};

const POPULAR_AIRPORTS: Airport[] = [
  { code: 'JFK', city: 'New York', country: 'United States' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States' },
  { code: 'ORD', city: 'Chicago', country: 'United States' },
  { code: 'SFO', city: 'San Francisco', country: 'United States' },
  { code: 'LHR', city: 'London', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', country: 'France' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'FCO', city: 'Rome', country: 'Italy' },
];

type Props = {
  value: string;
  onSelect: (code: string) => void;
  placeholder?: string;
};

export function AirportPicker({ value, onSelect, placeholder = 'Search airports...' }: Props) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return POPULAR_AIRPORTS;
    const q = query.toLowerCase();
    return POPULAR_AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = useCallback(
    (code: string) => {
      setQuery('');
      setShowDropdown(false);
      onSelect(code);
    },
    [onSelect],
  );

  const handleFocus = useCallback(() => {
    setShowDropdown(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Small delay to allow press events on dropdown items to fire
    setTimeout(() => setShowDropdown(false), 200);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={query || value}
          onChangeText={(text) => {
            setQuery(text);
            if (!showDropdown) setShowDropdown(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="characters"
          returnKeyType="search"
        />
        {value ? (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedCode}>{value}</Text>
          </View>
        ) : null}
      </View>

      {showDropdown && filtered.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.rowCode}>{item.code}</Text>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowCity} numberOfLines={1}>{item.city}</Text>
                  <Text style={styles.rowCountry} numberOfLines={1}>{item.country}</Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.list}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    padding: 0,
  },
  selectedBadge: {
    backgroundColor: Colors.category.flight + '22',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  selectedCode: {
    ...Typography.micro,
    color: Colors.category.flight,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 240,
    ...Shadows.md,
  },
  list: {
    borderRadius: Radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowCode: {
    ...Typography.h3,
    color: Colors.text,
    width: 48,
  },
  rowMeta: {
    flex: 1,
    gap: 1,
  },
  rowCity: {
    ...Typography.bodyMed,
    color: Colors.text,
  },
  rowCountry: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
