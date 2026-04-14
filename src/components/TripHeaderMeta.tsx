import { useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Typography, Spacing } from '../constants/theme';

type Props = {
  /** Emoji fallback flag, e.g. '🇺🇸'. */
  flag?: string | null;
  /** ISO 3166-1 alpha-2 code; used to derive flag when `flag` is missing. */
  countryCode?: string | null;
  /** ISO date (YYYY-MM-DD) or Date; trip start. */
  startDate?: string | Date | null;
  /** ISO date (YYYY-MM-DD) or Date; trip end. */
  endDate?: string | Date | null;
  /** Force render over a dark photo (the default). */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

function flagFromCode(code?: string | null): string | null {
  if (!code || code.length !== 2) return null;
  const up = code.toUpperCase();
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (up.charCodeAt(0) - 65),
    A + (up.charCodeAt(1) - 65),
  );
}

function toDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatRange(start: Date | null, end: Date | null): string {
  if (!start && !end) return '';
  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtLong = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (start && end) {
    const sameYear = start.getFullYear() === end.getFullYear();
    const thisYear = new Date().getFullYear() === end.getFullYear();
    return sameYear
      ? `${fmtShort(start)} – ${thisYear ? fmtShort(end) : fmtLong(end)}`
      : `${fmtLong(start)} – ${fmtLong(end)}`;
  }
  return fmtLong((start ?? end)!);
}

function countdownLabel(start: Date | null, end: Date | null): string | null {
  if (!start) return null;
  const now = new Date();
  const msPerDay = 86_400_000;
  const toStart = Math.ceil(
    (start.setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / msPerDay,
  );

  if (toStart > 0) {
    if (toStart === 1) return 'Tomorrow';
    if (toStart <= 14) return `In ${toStart} days`;
    if (toStart <= 60) return `In ${Math.round(toStart / 7)} weeks`;
    return `In ${Math.round(toStart / 30)} months`;
  }

  if (end) {
    const toEnd = Math.ceil(
      (end.setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / msPerDay,
    );
    if (toEnd >= 0) {
      const total = Math.round(
        (end.getTime() - start.getTime()) / msPerDay + 1,
      );
      const done = total - toEnd;
      return `Day ${Math.max(1, done)} of ${total}`;
    }
  }

  return 'Completed';
}

export function TripHeaderMeta({
  flag,
  countryCode,
  startDate,
  endDate,
  onDark = true,
  style,
}: Props) {
  const derived = useMemo(() => {
    const start = toDate(startDate);
    const end = toDate(endDate);
    return {
      flag: flag ?? flagFromCode(countryCode),
      range: formatRange(start, end),
      countdown: countdownLabel(start, end),
    };
  }, [flag, countryCode, startDate, endDate]);

  const color = onDark
    ? 'rgba(255,255,255,0.88)'
    : 'rgba(17,18,22,0.78)';
  const dotColor = onDark
    ? 'rgba(255,255,255,0.48)'
    : 'rgba(17,18,22,0.36)';

  const parts: React.ReactNode[] = [];
  if (derived.flag) {
    parts.push(
      <Text key="flag" style={styles.flag}>
        {derived.flag}
      </Text>,
    );
  }
  if (derived.range) {
    parts.push(
      <Text key="range" style={[styles.text, { color }]} numberOfLines={1}>
        {derived.range}
      </Text>,
    );
  }
  if (derived.countdown) {
    parts.push(
      <Text key="cd" style={[styles.text, { color }]} numberOfLines={1}>
        {derived.countdown}
      </Text>,
    );
  }

  if (parts.length === 0) return null;

  return (
    <View style={[styles.row, style]} accessibilityRole="text">
      {parts.map((node, i) => (
        <View key={`w-${i}`} style={styles.row}>
          {i > 0 ? (
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
          ) : null}
          {node}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  flag: {
    fontSize: 18,
    lineHeight: 22,
  },
  text: {
    ...Typography.bodyMed,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
});
