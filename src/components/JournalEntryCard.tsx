import { memo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { JournalEntry } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

const MOOD_MAP: Record<string, { emoji: string; label: string }> = {
  happy: { emoji: '😊', label: 'Happy' },
  relaxed: { emoji: '😌', label: 'Relaxed' },
  adventurous: { emoji: '🤠', label: 'Adventurous' },
  tired: { emoji: '😴', label: 'Tired' },
  amazed: { emoji: '🤩', label: 'Amazed' },
};

type Props = {
  entry: JournalEntry;
  onPress?: () => void;
  onLongPress?: () => void;
};

function JournalEntryCardBase({ entry, onPress, onLongPress }: Props) {
  const photos = Array.isArray(entry.photo_urls)
    ? (entry.photo_urls as string[])
    : [];
  const mood = entry.mood ? MOOD_MAP[entry.mood] : null;
  const dateStr = entry.created_at
    ? new Date(entry.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Photo strip or mood placeholder */}
      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoStrip}
        >
          {photos.map((url, i) => (
            <Image
              key={`${url}-${i}`}
              source={{ uri: url }}
              style={styles.thumbnail}
            />
          ))}
        </ScrollView>
      ) : mood ? (
        <View style={styles.moodPlaceholder}>
          <Text style={styles.moodPlaceholderEmoji}>{mood.emoji}</Text>
        </View>
      ) : null}

      {/* Title + date */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {entry.title || 'Untitled'}
        </Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      {/* Body */}
      {entry.body ? (
        <Text style={styles.body} numberOfLines={3}>
          {entry.body}
        </Text>
      ) : null}

      {/* Mood badge */}
      {mood ? (
        <View style={styles.moodBadge}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodLabel}>{mood.label}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export const JournalEntryCard = memo(JournalEntryCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },

  // Photo strip
  photoStrip: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardSecondary,
  },

  // Mood placeholder (when no photos)
  moodPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  moodPlaceholderEmoji: {
    fontSize: 32,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.textOnCard,
    flex: 1,
    marginRight: Spacing.sm,
  },
  date: {
    ...Typography.caption,
    color: Colors.textOnCardTertiary,
  },

  // Body
  body: {
    ...Typography.body,
    color: Colors.textOnCardSecondary,
    marginBottom: Spacing.sm,
  },

  // Mood badge
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodLabel: {
    ...Typography.micro,
    color: Colors.primary,
  },
});
