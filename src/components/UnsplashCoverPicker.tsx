import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FrostedSheet } from './FrostedSheet';
import {
  searchUnsplash,
  attributionFromPhoto,
  type UnsplashPhoto,
  type PhotoAttribution,
} from '../lib/unsplash';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (url: string, attribution: PhotoAttribution) => void;
  /** Initial query to seed the picker with (e.g. trip destination). */
  initialQuery?: string;
};

const SEARCH_DEBOUNCE_MS = 350;

export function UnsplashCoverPicker({
  visible,
  onClose,
  onSelect,
  initialQuery = '',
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    if (!visible) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchUnsplash(query, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setPhotos(results);
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Search failed');
        setPhotos([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, visible]);

  useEffect(() => {
    if (visible) setQuery(initialQuery);
  }, [visible, initialQuery]);

  const handleSelect = useCallback(
    (p: UnsplashPhoto) => {
      onSelect(p.urls.regular, attributionFromPhoto(p));
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="dark"
      maxHeightRatio={0.88}
      accessibilityLabel="Choose a cover photo"
    >
      <Text style={styles.title}>Choose a cover photo</Text>
      <Text style={styles.subtitle}>Powered by Unsplash</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textOnDarkTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search destinations, moods, scenes…"
          placeholderTextColor={Colors.textOnDarkTertiary}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textOnDarkSecondary} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Ionicons name="cloud-offline-outline" size={22} color={Colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelect(item)}
            style={({ pressed }) => [
              styles.tile,
              pressed ? { opacity: 0.85, transform: [{ scale: 0.98 }] } : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Use photo by ${item.author.name}`}
          >
            <Image source={{ uri: item.urls.small }} style={styles.tileImage} />
            <Pressable
              onPress={() => Linking.openURL(item.author.link).catch(() => undefined)}
              hitSlop={6}
              style={styles.credit}
            >
              <Text style={styles.creditText} numberOfLines={1}>
                {item.author.name}
              </Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyBlock}>
              <Ionicons name="images-outline" size={28} color={Colors.textOnDarkTertiary} />
              <Text style={styles.emptyText}>No results — try a different search.</Text>
            </View>
          )
        }
      />
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    color: Colors.textOnDark,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textOnDarkSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.textOnDark,
    ...Typography.body,
    padding: 0,
  },
  grid: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  tile: {
    flex: 1,
    aspectRatio: 1.1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  credit: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  creditText: {
    ...Typography.micro,
    color: '#FFFFFF',
  },
  errorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.warning,
    flex: 1,
  },
  loadingBlock: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textOnDarkSecondary,
  },
});
