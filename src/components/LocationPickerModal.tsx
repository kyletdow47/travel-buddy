import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

export interface SelectedPlace {
  description: string;
  place_id?: string;
  lat?: number;
  lng?: number;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface LocationPickerModalProps {
  visible: boolean;
  label: string;
  initialValue?: string;
  onSelect: (place: SelectedPlace) => void;
  onClose: () => void;
}

export function LocationPickerModal({
  visible,
  label,
  initialValue = '',
  onSelect,
  onClose,
}: LocationPickerModalProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setQuery(initialValue);
      setPredictions([]);
    }
  }, [visible, initialValue]);

  const search = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 2 || !API_KEY) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${API_KEY}`
      );
      const json = await res.json();
      setPredictions(json.status === 'OK' ? (json.predictions ?? []) : []);
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(text), 350);
  };

  const fetchGeo = async (placeId: string): Promise<{ lat?: number; lng?: number }> => {
    if (!API_KEY) return {};
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${API_KEY}`
      );
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      return loc ? { lat: loc.lat, lng: loc.lng } : {};
    } catch {
      return {};
    }
  };

  const handleSelect = async (item: Prediction) => {
    const geo = await fetchGeo(item.place_id);
    onSelect({ description: item.description, place_id: item.place_id, ...geo });
    reset();
    onClose();
  };

  const handleManualConfirm = () => {
    if (query.trim()) {
      onSelect({ description: query.trim() });
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const reset = () => {
    setQuery('');
    setPredictions([]);
  };

  const hasKey = !!API_KEY;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{label}</Text>
          {!hasKey && query.trim() ? (
            <TouchableOpacity onPress={handleManualConfirm} hitSlop={8}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 48 }} />
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={hasKey ? 'Search city, address, place…' : 'Type a location name…'}
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={handleChangeText}
            autoFocus
            returnKeyType={hasKey ? 'search' : 'done'}
            onSubmitEditing={hasKey ? undefined : handleManualConfirm}
          />
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(''); setPredictions([]); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {!hasKey && (
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={14} color="#92400E" />
            <Text style={styles.noticeText}>
              Add <Text style={styles.noticeCode}>EXPO_PUBLIC_GOOGLE_MAPS_API_KEY</Text> to your{' '}
              <Text style={styles.noticeCode}>.env</Text> file to enable address autocomplete.
            </Text>
          </View>
        )}

        {/* Results */}
        <FlatList
          data={predictions}
          keyExtractor={(p) => p.place_id}
          keyboardShouldPersistTaps="always"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <View style={styles.pinWrap}>
                <Ionicons name="location" size={18} color={Colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowMain} numberOfLines={1}>
                  {item.structured_formatting?.main_text ?? item.description}
                </Text>
                {item.structured_formatting?.secondary_text ? (
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {item.structured_formatting.secondary_text}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={14} color={Colors.border} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length >= 2 && !loading && hasKey ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  doneText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    padding: 0,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  noticeCode: {
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  pinWrap: {
    width: 28,
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowMain: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '500',
  },
  rowSub: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body.fontSize,
  },
});
