// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenWeather integration — per-day forecast for itinerary stops.
//
// Uses the free 5-day / 3-hour `/data/2.5/forecast` endpoint, which returns
// ~40 forecast entries at 3-hour resolution. We bucket those into local-day
// highs/lows so the Plan tab can render one "sun-glyph row" per day.
//
// Graceful fallback: when EXPO_PUBLIC_OPENWEATHER_API_KEY is missing, the
// helpers return deterministic, pleasant-looking synthetic data tagged with
// `source: 'dev-fallback'`, so the UI still renders in development.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type WeatherForecast = {
  /** Local-date key in YYYY-MM-DD form. */
  date: string;
  /** Daily high in Celsius. */
  tempMaxC: number;
  /** Daily low in Celsius. */
  tempMinC: number;
  /** OpenWeather icon code (e.g. "01d", "10n"). */
  iconCode: string;
  /** Short human description (e.g. "Partly cloudy"). */
  description: string;
  /** Probability of precipitation during the day, 0–1. */
  precipProb: number;
  /** Origin of the data — helpful for debugging / showing "preview" UI. */
  source: 'openweather' | 'dev-fallback';
};

type OpenWeatherForecastListItem = {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  pop?: number;
  dt_txt?: string;
};

type OpenWeatherForecastResponse = {
  list: OpenWeatherForecastListItem[];
  city?: { timezone?: number };
};

const FORECAST_ENDPOINT = 'https://api.openweathermap.org/data/2.5/forecast';

export function getOpenWeatherApiKey(): string | null {
  return process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? null;
}

/**
 * Convert a Unix timestamp (seconds, UTC) plus an optional timezone offset
 * (seconds from UTC, as returned by OpenWeather's `city.timezone`) into a
 * local-date key of the form YYYY-MM-DD. This is what we use to bucket
 * 3-hour forecast entries into days.
 */
export function localDateKey(unixSeconds: number, tzOffsetSeconds = 0): string {
  const shifted = new Date((unixSeconds + tzOffsetSeconds) * 1000);
  // Pull the UTC components of the shifted instant — this gives the
  // calendar day in the city's local timezone.
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Aggregate a flat list of 3-hour forecast entries into one record per local
 * calendar day. The representative icon/description for a day is taken from
 * the entry closest to local noon.
 */
export function aggregateToDaily(
  list: OpenWeatherForecastListItem[],
  tzOffsetSeconds = 0,
): WeatherForecast[] {
  const byDay = new Map<string, OpenWeatherForecastListItem[]>();
  for (const entry of list) {
    const key = localDateKey(entry.dt, tzOffsetSeconds);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(entry);
    else byDay.set(key, [entry]);
  }

  const days: WeatherForecast[] = [];
  for (const [date, entries] of byDay) {
    let max = -Infinity;
    let min = Infinity;
    let maxPop = 0;
    let repr: OpenWeatherForecastListItem = entries[0];
    let reprDelta = Infinity;

    for (const e of entries) {
      if (e.main.temp_max > max) max = e.main.temp_max;
      if (e.main.temp_min < min) min = e.main.temp_min;
      if ((e.pop ?? 0) > maxPop) maxPop = e.pop ?? 0;

      // Pick the entry closest to 12:00 local as the day's "representative"
      // condition (matches what a user would see looking out the window at
      // lunch time).
      const localHour = new Date((e.dt + tzOffsetSeconds) * 1000).getUTCHours();
      const delta = Math.abs(localHour - 12);
      if (delta < reprDelta) {
        reprDelta = delta;
        repr = e;
      }
    }

    const w = repr.weather[0] ?? {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    };

    days.push({
      date,
      tempMaxC: Math.round(max * 10) / 10,
      tempMinC: Math.round(min * 10) / 10,
      iconCode: w.icon,
      description: titleCase(w.description),
      precipProb: Math.round(maxPop * 100) / 100,
      source: 'openweather',
    });
  }

  // Return ordered by date so callers can slice confidently.
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

function titleCase(s: string): string {
  return s
    .split(' ')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Celsius → Fahrenheit. */
export function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32;
}

/**
 * Map an OpenWeather 3-char icon code (e.g. "10d") to an Ionicons glyph name.
 * Used when we'd rather render an @expo/vector-icons icon than an emoji.
 */
export function iconCodeToIoniconsName(
  code: string,
): 'sunny' | 'partly-sunny' | 'cloudy' | 'rainy' | 'thunderstorm' | 'snow' {
  // Codes: https://openweathermap.org/weather-conditions
  const prefix = code.slice(0, 2);
  switch (prefix) {
    case '01':
      return 'sunny';
    case '02':
      return 'partly-sunny';
    case '03':
    case '04':
      return 'cloudy';
    case '09':
    case '10':
      return 'rainy';
    case '11':
      return 'thunderstorm';
    case '13':
      return 'snow';
    case '50':
      return 'cloudy';
    default:
      return 'sunny';
  }
}

/**
 * Fetch up to 5 days of forecast for a location. Returns daily aggregates or
 * the dev fallback if no API key is configured.
 */
export async function getForecastForLocation(
  lat: number,
  lng: number,
  opts: { signal?: AbortSignal } = {},
): Promise<WeatherForecast[]> {
  const key = getOpenWeatherApiKey();
  if (!key) {
    return devFallbackForecast(lat, lng);
  }

  const url = `${FORECAST_ENDPOINT}?lat=${lat}&lon=${lng}&units=metric&appid=${encodeURIComponent(
    key,
  )}`;
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) {
    throw new Error(`OpenWeather: ${res.status} ${res.statusText}`);
  }
  const payload = (await res.json()) as OpenWeatherForecastResponse;
  const tz = payload.city?.timezone ?? 0;
  return aggregateToDaily(payload.list, tz);
}

/**
 * Deterministic stubbed forecast keyed off lat/lng so dev UI looks stable.
 * Seven days of synthetic "looks plausible" data anchored on today.
 */
export function devFallbackForecast(lat: number, lng: number): WeatherForecast[] {
  // Simple deterministic hash from coordinates → temperature seed.
  const seed = Math.abs(Math.round(lat * 17 + lng * 13));
  const baseHigh = 16 + (seed % 14); // 16–29 °C
  const baseLow = baseHigh - (6 + (seed % 4)); // 6–9 °C spread
  const icons = ['01d', '02d', '03d', '10d', '01d', '02d', '04d'];
  const descriptions = [
    'Clear Sky',
    'Few Clouds',
    'Scattered Clouds',
    'Light Rain',
    'Clear Sky',
    'Few Clouds',
    'Overcast',
  ];

  const today = new Date();
  const out: WeatherForecast[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const drift = ((seed + i) % 5) - 2; // -2..+2
    out.push({
      date: `${yyyy}-${mm}-${dd}`,
      tempMaxC: baseHigh + drift,
      tempMinC: baseLow + drift,
      iconCode: icons[i % icons.length],
      description: descriptions[i % descriptions.length],
      precipProb: ((seed + i * 7) % 40) / 100, // 0–0.39
      source: 'dev-fallback',
    });
  }
  return out;
}
