import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import { CategoryGlyph, normalizeCategory, categoryColor } from './CategoryGlyph';
import { FlightSegmentRow, type FlightSegment } from './FlightSegmentRow';

type StopStatus = 'upcoming' | 'current' | 'done';

type StopRowProps = {
  stop: Stop;
  index: number;
  /** Whether to show the vertical timeline connector below this row. */
  showConnector?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onStatusPress?: () => void;
};

function statusMeta(status: StopStatus) {
  switch (status) {
    case 'current':
      return { label: 'Now', icon: 'radio-button-on' as const, color: Colors.primary, bg: Colors.primaryLight };
    case 'done':
      return { label: 'Done', icon: 'checkmark-circle' as const, color: Colors.textOnCardSecondary, bg: Colors.borderOnCard };
    default:
      return { label: 'Upcoming', icon: 'ellipse-outline' as const, color: Colors.info, bg: 'rgba(58,164,255,0.12)' };
  }
}

/**
 * Parses stop notes / metadata for a flight stop into a FlightSegment shape.
 * Keeps it minimal — if the stop name looks like "JFK → LAX" we parse that,
 * otherwise we fall back to showing the stop name as the route.
 */
function parseFlightSegment(stop: Stop): FlightSegment {
  const arrowMatch = stop.name.match(/^([A-Z]{3})\s*[→\->\s]+\s*([A-Z]{3})$/i);
  if (arrowMatch) {
    return { from: arrowMatch[1].toUpperCase(), to: arrowMatch[2].toUpperCase() };
  }
  // Generic flight stop: show departure city in FROM, destination in TO if available
  const parts = (stop.location ?? stop.name).split(/[,→\-]/);
  const from = parts[0]?.trim().substring(0, 3).toUpperCase() ?? '???';
  const to = parts[1]?.trim().substring(0, 3).toUpperCase() ?? '???';
  return { from, to, airline: stop.name };
}

function StopRowBase({
  stop,
  index,
  showConnector = false,
  onPress,
  onLongPress,
  onStatusPress,
}: StopRowProps) {
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const sMeta = statusMeta(status);
  const cat = normalizeCategory(stop.category);
  const dotColor = categoryColor(stop.category);
  const isFlight = cat === 'flight';

  return (
    <View style={styles.wrapper}>
      {/* Timeline column */}
      <View style={styles.timelineCol}>
        <CategoryGlyph category={cat} size={28} elevated />
        {showConnector && <View style={[styles.connector, { backgroundColor: dotColor + '40' }]} />}
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        {isFlight ? (
          /* ── Flight variant — show FlightSegmentRow ── */
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <FlightSegmentRow segment={parseFlightSegment(stop)} />
          </TouchableOpacity>
        ) : (
          /* ── Standard stop card ── */
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <View style={styles.cardMain}>
              <Text style={styles.name} numberOfLines={1}>
                {stop.name}
              </Text>

              {(stop.location || stop.notes) ? (
                <View style={styles.metaRow}>
                  {stop.location ? (
                    <>
                      <Ionicons name="location-outline" size={12} color={Colors.textOnCardTertiary} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {stop.location}
                      </Text>
                    </>
                  ) : null}
                  {stop.notes ? (
                    <Text style={styles.notesPreview} numberOfLines={1}>
                      {stop.location ? '  ·  ' : ''}{stop.notes}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {stop.planned_date ? (
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.textOnCardTertiary} />
                  <Text style={styles.metaText}>
                    {new Date(stop.planned_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Status chip */}
            <TouchableOpacity
              style={[styles.statusChip, { backgroundColor: sMeta.bg }]}
              activeOpacity={0.7}
              onPress={onStatusPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={sMeta.icon} size={12} color={sMeta.color} />
              <Text style={[styles.statusText, { color: sMeta.color }]}>
                {sMeta.label}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Stop index badge (bottom-right corner for non-flight) */}
        {!isFlight && (
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export const StopRow = memo(StopRowBase);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },

  // ── Timeline column
  timelineCol: {
    width: 36,
    alignItems: 'center',
    paddingTop: 2,
    marginRight: Spacing.sm,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 24,
    borderRadius: 1,
    marginTop: Spacing.xs,
  },

  // ── Card area
  cardWrap: {
    flex: 1,
    position: 'relative',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    ...Shadows.sm,
  },
  cardMain: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.textOnCard,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
    flexShrink: 1,
  },
  notesPreview: {
    ...Typography.caption,
    color: Colors.textOnCardTertiary,
    flexShrink: 1,
    fontStyle: 'italic',
  },

  // ── Status chip
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
  statusText: {
    ...Typography.micro,
    fontWeight: '700',
  },

  // ── Index badge
  indexBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glyph,
  },
  indexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 12,
  },
});
