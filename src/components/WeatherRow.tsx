import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { WeatherForecast } from '../lib/weather';
import {
  celsiusToFahrenheit,
  iconCodeToIoniconsName,
} from '../lib/weather';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type WeatherRowProps = {
  forecast: WeatherForecast | null;
  /** Render a subdued "loading…" shell when true and no forecast is ready. */
  loading?: boolean;
  /** Display fahrenheit instead of celsius. Defaults to fahrenheit. */
  unit?: 'c' | 'f';
};

function formatTemp(c: number, unit: 'c' | 'f'): string {
  const v = unit === 'f' ? celsiusToFahrenheit(c) : c;
  return `${Math.round(v)}°`;
}

function WeatherRowBase({ forecast, loading = false, unit = 'f' }: WeatherRowProps) {
  if (!forecast && loading) {
    return (
      <View
        style={styles.row}
        accessibilityRole="text"
        accessibilityLabel="Loading weather"
      >
        <View style={[styles.glyph, styles.glyphLoading]}>
          <Ionicons name="sunny" size={14} color={Colors.textTertiary} />
        </View>
        <Text style={styles.loadingText}>Loading weather…</Text>
      </View>
    );
  }

  if (!forecast) return null;

  const iconName = iconCodeToIoniconsName(forecast.iconCode);
  const precipPct = Math.round(forecast.precipProb * 100);
  const a11y = `Weather: ${forecast.description}, high ${formatTemp(
    forecast.tempMaxC,
    unit,
  )}, low ${formatTemp(forecast.tempMinC, unit)}${
    precipPct >= 20 ? `, ${precipPct}% chance of precipitation` : ''
  }`;

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={a11y}
    >
      <View style={styles.glyph}>
        <Ionicons name={iconName} size={14} color="#FFFFFF" />
      </View>
      <Text style={styles.primary}>
        {formatTemp(forecast.tempMaxC, unit)}
        <Text style={styles.separator}> / </Text>
        <Text style={styles.secondary}>{formatTemp(forecast.tempMinC, unit)}</Text>
      </Text>
      <Text style={styles.description} numberOfLines={1}>
        · {forecast.description}
      </Text>
      {precipPct >= 20 && (
        <View style={styles.precipChip}>
          <Ionicons name="water" size={10} color={Colors.info} />
          <Text style={styles.precipText}>{precipPct}%</Text>
        </View>
      )}
    </View>
  );
}

export const WeatherRow = memo(WeatherRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  glyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.category.weather,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphLoading: {
    backgroundColor: Colors.surfaceDim,
  },
  primary: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text,
  },
  separator: {
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  secondary: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  precipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.info + '1A', // ~10% alpha
  },
  precipText: {
    ...Typography.micro,
    color: Colors.info,
    fontWeight: '700',
  },
});
