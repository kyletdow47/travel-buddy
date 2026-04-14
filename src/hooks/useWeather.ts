import { useEffect, useMemo, useRef, useState } from 'react';
import { getForecastForLocation, type WeatherForecast } from '../lib/weather';

/**
 * Input spec for `useWeather` — one entry per itinerary day that we want a
 * forecast for. The caller is responsible for deciding which stop's
 * coordinates should "represent" the day (typically the first stop with
 * lat/lng).
 */
export type DayWeatherRequest = {
  /** Local-date key, YYYY-MM-DD. Matches `WeatherForecast.date`. */
  dayKey: string;
  lat: number;
  lng: number;
};

type WeatherMap = Record<string, WeatherForecast | null>;

// Module-level cache keyed by coarse lat/lng so flipping between trips with
// the same destination avoids redundant network calls within a session.
const cache = new Map<string, Promise<WeatherForecast[]>>();

function coordKey(lat: number, lng: number): string {
  // Round to ~11 km precision — forecast doesn't change meaningfully within
  // a fraction of a degree and this dramatically collapses cache keys when
  // stops cluster inside a city.
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

/**
 * Fetch weather forecasts for a list of (dayKey, lat, lng) requests.
 * Returns a map of dayKey → forecast (or null if that day is out of the
 * 5-day window / failed to load).
 *
 * Only re-fetches when the set of coordinates being asked for changes, so
 * scrolling between days/compact mode toggles don't re-issue API calls.
 */
export function useWeather(requests: DayWeatherRequest[]) {
  const [forecasts, setForecasts] = useState<WeatherMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable key describing the request set — coord + dayKey pairs, sorted.
  const signature = useMemo(() => {
    return [...requests]
      .map((r) => `${r.dayKey}|${coordKey(r.lat, r.lng)}`)
      .sort()
      .join(';');
  }, [requests]);

  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastSignatureRef.current === signature) return;
    lastSignatureRef.current = signature;

    if (requests.length === 0) {
      setForecasts({});
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Group dayKeys by their coordinate bucket — one network call per
        // bucket is enough since OpenWeather returns a whole 5-day window.
        const byCoord = new Map<string, { lat: number; lng: number; dayKeys: string[] }>();
        for (const r of requests) {
          const key = coordKey(r.lat, r.lng);
          const existing = byCoord.get(key);
          if (existing) existing.dayKeys.push(r.dayKey);
          else byCoord.set(key, { lat: r.lat, lng: r.lng, dayKeys: [r.dayKey] });
        }

        const entries = await Promise.all(
          [...byCoord.entries()].map(async ([key, bucket]) => {
            let pending = cache.get(key);
            if (!pending) {
              pending = getForecastForLocation(bucket.lat, bucket.lng, {
                signal: controller.signal,
              });
              cache.set(key, pending);
              // Evict on failure so a transient error doesn't poison the
              // cache for the rest of the session.
              pending.catch(() => cache.delete(key));
            }
            const forecast = await pending;
            return { dayKeys: bucket.dayKeys, forecast };
          }),
        );

        if (cancelled) return;

        const next: WeatherMap = {};
        for (const { dayKeys, forecast } of entries) {
          const byDate = new Map(forecast.map((f) => [f.date, f]));
          for (const dayKey of dayKeys) {
            next[dayKey] = byDate.get(dayKey) ?? null;
          }
        }
        setForecasts(next);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [signature, requests]);

  return { forecasts, loading, error };
}
