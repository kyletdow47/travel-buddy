import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

// Static destination photos for the inspiration strip
const DESTINATION_PHOTOS = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop', label: 'Bali' },
  { id: '2', uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop', label: 'Paris' },
  { id: '3', uri: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=300&h=200&fit=crop', label: 'Italy' },
  { id: '4', uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop', label: 'Kyoto' },
  { id: '5', uri: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=300&h=200&fit=crop', label: 'Santorini' },
  { id: '6', uri: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop', label: 'New York' },
];

const FILTER_OPTIONS = ['All', 'Active', 'Planning', 'Completed'] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function HomeScreen() {
  const router = useRouter();
  const orbAnim = useRef(new Animated.Value(1)).current;
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [orbAnim]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Let's plan your{'\n'}next adventure!</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
        </View>

        {/* Destination Photo Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoStripContent}
          style={styles.photoStrip}
        >
          {DESTINATION_PHOTOS.map((photo) => (
            <View key={photo.id} style={styles.photoTile}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <Text style={styles.photoLabel}>{photo.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* AI Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => router.push('/assistant')}
        >
          <Animated.View style={[styles.orb, { opacity: orbAnim }]} />
          <Text style={styles.searchPlaceholder}>Ask me anything...</Text>
          <Ionicons name="mic-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Just type your dream destination. we'll handle the plan
        </Text>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Trips</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterChip,
                  activeFilter === option && styles.filterChipActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(option)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === option && styles.filterChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="airplane-outline" size={48} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>
            Your adventures will show up here once you create your first trip.
          </Text>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={Colors.surface} />
            <Text style={styles.ctaButtonText}>Create your first trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 36,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },

  // Photo Strip
  photoStrip: {
    marginTop: Spacing.lg,
  },
  photoStripContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  photoTile: {
    width: 110,
    height: 90,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoLabel: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.sm,
    ...Typography.micro,
    color: Colors.surface,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    ...Shadows.md,
  },
  orb: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    ...Typography.body,
    color: Colors.textTertiary,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  ctaButtonText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '600',
  },
});
