import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import type { SavedSpot } from '../types';

type Platform = 'instagram' | 'tiktok' | 'google' | 'manual';

const PLATFORM_META: Record<Platform, { label: string; gradient: string[]; icon: keyof typeof Ionicons.glyphMap; badgeBg: string }> = {
  instagram: {
    label: 'Instagram',
    gradient: ['#F58529', '#DD2A7B'],
    icon: 'logo-instagram',
    badgeBg: '#DD2A7B',
  },
  tiktok: {
    label: 'TikTok',
    gradient: ['#25F4EE', '#FE2C55'],
    icon: 'musical-notes',
    badgeBg: '#111216',
  },
  google: {
    label: 'Google',
    gradient: ['#4285F4', '#34A853'],
    icon: 'logo-google',
    badgeBg: '#4285F4',
  },
  manual: {
    label: 'Manual',
    gradient: [Colors.textTertiary, Colors.textSecondary],
    icon: 'bookmark',
    badgeBg: Colors.textSecondary,
  },
};

function normalizePlatform(raw: string | null | undefined): Platform {
  const value = (raw ?? '').toLowerCase();
  if (value === 'instagram' || value === 'tiktok' || value === 'google') return value;
  return 'manual';
}

type Props = {
  spot: SavedSpot;
  onImport: () => void;
  onDelete: () => void;
};

function SavedSpotCardBase({ spot, onImport, onDelete }: Props) {
  const platform = normalizePlatform(spot.source_platform);
  const meta = PLATFORM_META[platform];

  return (
    <View style={styles.card}>
      {/* Image placeholder — gradient based on source platform */}
      <View style={[styles.imagePlaceholder, { backgroundColor: meta.gradient[0] }]}>
        <View style={[styles.gradientOverlay, { backgroundColor: meta.gradient[1], opacity: 0.5 }]} />
        <Ionicons name={meta.icon} size={28} color="rgba(255,255,255,0.8)" />

        {/* Source badge */}
        <View style={[styles.badge, { backgroundColor: meta.badgeBg }]}>
          <Ionicons name={meta.icon} size={10} color="#FFFFFF" />
          <Text style={styles.badgeText}>{meta.label}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {spot.name}
        </Text>
        {spot.location && (
          <Text style={styles.location} numberOfLines={1}>
            {spot.location}
          </Text>
        )}

        {/* Actions row */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.importButton}
            activeOpacity={0.85}
            onPress={onImport}
          >
            <Ionicons name="add-circle" size={14} color="#FFFFFF" />
            <Text style={styles.importText}>Add to Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.textOnCardTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const SavedSpotCard = memo(SavedSpotCardBase);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imagePlaceholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.micro,
    color: '#FFFFFF',
  },
  content: {
    padding: Spacing.sm,
  },
  name: {
    ...Typography.bodyMed,
    color: Colors.textOnCard,
  },
  location: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  importText: {
    ...Typography.micro,
    color: '#FFFFFF',
  },
});
