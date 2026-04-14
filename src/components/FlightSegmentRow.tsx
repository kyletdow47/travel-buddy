import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

export interface FlightSegmentRowProps {
  /** IATA code for the departure airport, e.g. "SFO". Rendered uppercase. */
  departureCode: string;
  /** IATA code for the arrival airport, e.g. "JFK". Rendered uppercase. */
  arrivalCode: string;
  /** Departure time string (already formatted), e.g. "10:30 AM" or "22:15". */
  departureTime: string;
  /** Arrival time string (already formatted), e.g. "7:02 PM". */
  arrivalTime: string;
  /** Optional duration label, e.g. "5h 32m". Renders centered above the plane line. */
  duration?: string;
  /** Optional airline + flight number, e.g. "UA 123". Renders in the eyebrow row. */
  flightNumber?: string;
  /** Optional date label, e.g. "Jun 10". Renders in the eyebrow row. */
  date?: string;
  /** Optional stops label, e.g. "Nonstop" or "1 stop". Renders in the eyebrow row. */
  stops?: string;
  /**
   * Day offset for arrivals that land on a later (or earlier) calendar day.
   * Examples: 1 → "+1", -1 → "-1". Shown as a small superscript next to the arrival time.
   */
  dayOffset?: number;
  /** Optional tap handler — e.g. to open flight details. Wraps the row in a pressable. */
  onPress?: () => void;
  /** Compact variant uses smaller type + tighter padding for dense lists. */
  compact?: boolean;
}

const PLANE_LINE_HEIGHT = 1.5;

export function FlightSegmentRow({
  departureCode,
  arrivalCode,
  departureTime,
  arrivalTime,
  duration,
  flightNumber,
  date,
  stops,
  dayOffset,
  onPress,
  compact = false,
}: FlightSegmentRowProps) {
  const eyebrowParts = [date, flightNumber, stops].filter(
    (part): part is string => Boolean(part && part.length > 0),
  );

  const codeStyle = compact ? styles.codeCompact : styles.code;
  const timeStyle = compact ? styles.timeCompact : styles.time;
  const planeSize = compact ? 14 : 16;
  const padding = compact ? Spacing.sm : Spacing.md;

  const content = (
    <View style={[styles.container, { padding }]}>
      {eyebrowParts.length > 0 ? (
        <Text style={styles.eyebrow} numberOfLines={1}>
          {eyebrowParts.join(' · ').toUpperCase()}
        </Text>
      ) : null}

      <View style={styles.row}>
        <View style={styles.endpoint}>
          <Text style={codeStyle}>{departureCode.toUpperCase()}</Text>
          <Text style={timeStyle}>{departureTime}</Text>
        </View>

        <View style={styles.middle}>
          {duration ? (
            <Text style={styles.duration} numberOfLines={1}>
              {duration}
            </Text>
          ) : null}
          <View style={styles.planeLineWrap}>
            <View style={styles.planeLine} />
            <View style={styles.planeIconWrap}>
              <Ionicons
                name="airplane"
                size={planeSize}
                color={Colors.primary}
                style={styles.planeIcon}
              />
            </View>
            <View style={styles.planeLine} />
          </View>
        </View>

        <View style={[styles.endpoint, styles.endpointRight]}>
          <View style={styles.codeRow}>
            <Text style={codeStyle}>{arrivalCode.toUpperCase()}</Text>
            {dayOffset && dayOffset !== 0 ? (
              <Text style={styles.dayOffset}>
                {dayOffset > 0 ? `+${dayOffset}` : `${dayOffset}`}
              </Text>
            ) : null}
          </View>
          <Text style={timeStyle}>{arrivalTime}</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endpoint: {
    minWidth: 72,
    alignItems: 'flex-start',
  },
  endpointRight: {
    alignItems: 'flex-end',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  code: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  codeCompact: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  time: {
    marginTop: 2,
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeCompact: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dayOffset: {
    marginLeft: 2,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 14,
  },
  middle: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  planeLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  planeLine: {
    flex: 1,
    height: PLANE_LINE_HEIGHT,
    backgroundColor: Colors.border,
  },
  planeIconWrap: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeIcon: {
    transform: [{ rotate: '90deg' }],
  },
});

export default FlightSegmentRow;
