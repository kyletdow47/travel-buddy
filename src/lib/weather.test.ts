import { describe, it, expect } from 'vitest';
import {
  aggregateToDaily,
  celsiusToFahrenheit,
  devFallbackForecast,
  iconCodeToIoniconsName,
  localDateKey,
} from './weather';

describe('weather helpers', () => {
  describe('celsiusToFahrenheit', () => {
    it('converts 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });
    it('converts 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });
    it('converts -40°C to -40°F', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });
  });

  describe('localDateKey', () => {
    it('renders a UTC midnight instant as its own day', () => {
      // 2026-06-01 00:00:00 UTC
      const utc = Date.UTC(2026, 5, 1, 0, 0, 0) / 1000;
      expect(localDateKey(utc, 0)).toBe('2026-06-01');
    });

    it('shifts to the next day when tz offset pushes past midnight', () => {
      // 2026-06-01 22:00 UTC + 4h offset = 2026-06-02 02:00 local
      const utc = Date.UTC(2026, 5, 1, 22, 0, 0) / 1000;
      expect(localDateKey(utc, 4 * 3600)).toBe('2026-06-02');
    });

    it('shifts back a day for negative offsets', () => {
      // 2026-06-01 02:00 UTC − 5h offset = 2026-05-31 21:00 local
      const utc = Date.UTC(2026, 5, 1, 2, 0, 0) / 1000;
      expect(localDateKey(utc, -5 * 3600)).toBe('2026-05-31');
    });
  });

  describe('iconCodeToIoniconsName', () => {
    it('maps clear codes to sunny', () => {
      expect(iconCodeToIoniconsName('01d')).toBe('sunny');
      expect(iconCodeToIoniconsName('01n')).toBe('sunny');
    });
    it('maps rain codes to rainy', () => {
      expect(iconCodeToIoniconsName('10d')).toBe('rainy');
      expect(iconCodeToIoniconsName('09n')).toBe('rainy');
    });
    it('maps thunderstorm codes to thunderstorm', () => {
      expect(iconCodeToIoniconsName('11d')).toBe('thunderstorm');
    });
    it('maps snow codes to snow', () => {
      expect(iconCodeToIoniconsName('13d')).toBe('snow');
    });
    it('falls back to sunny for unknown codes', () => {
      expect(iconCodeToIoniconsName('99x')).toBe('sunny');
    });
  });

  describe('aggregateToDaily', () => {
    const day1Noon = Date.UTC(2026, 5, 1, 12, 0, 0) / 1000;
    const day1Evening = Date.UTC(2026, 5, 1, 18, 0, 0) / 1000;
    const day2Morning = Date.UTC(2026, 5, 2, 9, 0, 0) / 1000;

    it('groups entries into daily buckets with max/min temps', () => {
      const result = aggregateToDaily(
        [
          {
            dt: day1Noon,
            main: { temp: 22, temp_min: 18, temp_max: 25 },
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
            pop: 0.1,
          },
          {
            dt: day1Evening,
            main: { temp: 20, temp_min: 17, temp_max: 21 },
            weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02n' }],
            pop: 0.2,
          },
          {
            dt: day2Morning,
            main: { temp: 15, temp_min: 12, temp_max: 19 },
            weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
            pop: 0.6,
          },
        ],
        0,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: '2026-06-01',
        tempMaxC: 25,
        tempMinC: 17,
        iconCode: '01d', // noon entry wins as representative
        source: 'openweather',
      });
      expect(result[0].precipProb).toBeCloseTo(0.2, 5);
      expect(result[1]).toMatchObject({
        date: '2026-06-02',
        tempMaxC: 19,
        tempMinC: 12,
        iconCode: '10d',
      });
    });

    it('title-cases the description', () => {
      const result = aggregateToDaily(
        [
          {
            dt: day1Noon,
            main: { temp: 22, temp_min: 18, temp_max: 25 },
            weather: [{ id: 801, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
            pop: 0,
          },
        ],
        0,
      );
      expect(result[0].description).toBe('Scattered Clouds');
    });

    it('respects timezone offsets when bucketing', () => {
      // 2026-06-01 22:00 UTC should land in 2026-06-02 under +4h offset.
      const dt = Date.UTC(2026, 5, 1, 22, 0, 0) / 1000;
      const result = aggregateToDaily(
        [
          {
            dt,
            main: { temp: 20, temp_min: 18, temp_max: 24 },
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01n' }],
            pop: 0,
          },
        ],
        4 * 3600,
      );
      expect(result[0].date).toBe('2026-06-02');
    });

    it('produces sorted output', () => {
      const result = aggregateToDaily(
        [
          {
            dt: day2Morning,
            main: { temp: 20, temp_min: 15, temp_max: 22 },
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
            pop: 0,
          },
          {
            dt: day1Noon,
            main: { temp: 20, temp_min: 15, temp_max: 22 },
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
            pop: 0,
          },
        ],
        0,
      );
      expect(result.map((d) => d.date)).toEqual(['2026-06-01', '2026-06-02']);
    });
  });

  describe('devFallbackForecast', () => {
    it('returns 7 consecutive days starting today', () => {
      const f = devFallbackForecast(40.7, -74);
      expect(f).toHaveLength(7);
      for (const day of f) {
        expect(day.source).toBe('dev-fallback');
        expect(day.tempMaxC).toBeGreaterThan(day.tempMinC);
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      // Sorted ascending
      const sorted = [...f].sort((a, b) => a.date.localeCompare(b.date));
      expect(f).toEqual(sorted);
    });

    it('is deterministic for identical coords', () => {
      const a = devFallbackForecast(48.85, 2.35);
      const b = devFallbackForecast(48.85, 2.35);
      expect(a).toEqual(b);
    });
  });
});
