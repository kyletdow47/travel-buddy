import { ANTHROPIC_API_KEY } from '../lib/anthropic';
import type {
  PoiCategory,
  PoiSuggestion,
  PoiSuggesterOptions,
  RouteWaypoint,
} from '../types/poi';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_VERSION = '2023-06-01';
const MODEL = 'claude-opus-4-6';

const EARTH_RADIUS_MILES = 3958.7613;

const ALL_CATEGORIES: PoiCategory[] = [
  'food',
  'lodging',
  'attraction',
  'nature',
  'shopping',
  'gas',
  'rest_stop',
  'scenic',
  'other',
];

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in miles between two lat/lng points. */
export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Sample the polyline formed by waypoints at approximately `intervalMiles`
 * miles along the route. Always includes the first and last waypoint.
 */
export function sampleRoute(
  waypoints: RouteWaypoint[],
  intervalMiles: number
): RouteWaypoint[] {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) return [waypoints[0]];
  const interval = Math.max(1, intervalMiles);
  const samples: RouteWaypoint[] = [waypoints[0]];
  let carry = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const segmentMiles = haversineMiles(from, to);
    if (segmentMiles === 0) continue;
    let traveled = carry;
    while (traveled + interval <= segmentMiles) {
      traveled += interval;
      const t = traveled / segmentMiles;
      samples.push({
        lat: from.lat + (to.lat - from.lat) * t,
        lng: from.lng + (to.lng - from.lng) * t,
      });
    }
    carry = segmentMiles - traveled;
  }
  const last = waypoints[waypoints.length - 1];
  const tail = samples[samples.length - 1];
  if (haversineMiles(last, tail) > 0.01) samples.push(last);
  return samples;
}

/** Distance in miles from a point to the nearest waypoint in the route. */
function distanceToNearestWaypoint(
  point: { lat: number; lng: number },
  waypoints: RouteWaypoint[]
): { miles: number; index: number } {
  let bestIndex = 0;
  let bestMiles = Number.POSITIVE_INFINITY;
  for (let i = 0; i < waypoints.length; i += 1) {
    const d = haversineMiles(point, waypoints[i]);
    if (d < bestMiles) {
      bestMiles = d;
      bestIndex = i;
    }
  }
  return { miles: bestMiles, index: bestIndex };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildPrompt(
  samples: RouteWaypoint[],
  radiusMiles: number,
  categories: PoiCategory[],
  maxResults: number,
  excludeNames: string[]
): string {
  const waypointLines = samples
    .map(
      (p, idx) =>
        `${idx + 1}. lat=${p.lat.toFixed(5)}, lng=${p.lng.toFixed(5)}${
          p.name ? ` (${p.name})` : ''
        }`
    )
    .join('\n');
  const exclusionBlock =
    excludeNames.length > 0
      ? `\nExclude any POIs whose name case-insensitively matches any of:\n${excludeNames
          .map((n) => `- ${n}`)
          .join('\n')}\n`
      : '';
  return `You are a travel planner helping a road trip.
A route is defined by these ordered waypoints:
${waypointLines}

Suggest up to ${maxResults} interesting Points of Interest (POIs) within ${radiusMiles} miles of the route.
Only include POIs in these categories: ${categories.join(', ')}.
Prefer real, well-known places with accurate coordinates. Avoid duplicates.${exclusionBlock}

Return ONLY a JSON array. No prose, no markdown, no code fences. Each item must be an object with these exact keys:
- "name" (string)
- "category" (one of: ${ALL_CATEGORIES.join(', ')})
- "description" (string, max 160 chars)
- "lat" (number)
- "lng" (number)

Example:
[{"name":"Mono Lake","category":"nature","description":"Saline lake with tufa towers.","lat":38.0099,"lng":-119.0109}]`;
}

interface RawPoi {
  name: unknown;
  category: unknown;
  description: unknown;
  lat: unknown;
  lng: unknown;
}

function extractJsonArray(text: string): unknown {
  const trimmed = text.trim();
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
    throw new Error('POI suggester: model response did not contain a JSON array.');
  }
  return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
}

function normalizeCategory(value: unknown): PoiCategory {
  if (typeof value !== 'string') return 'other';
  const lower = value.toLowerCase() as PoiCategory;
  return ALL_CATEGORIES.includes(lower) ? lower : 'other';
}

function validatePois(parsed: unknown): RawPoi[] {
  if (!Array.isArray(parsed)) {
    throw new Error('POI suggester: parsed JSON was not an array.');
  }
  return parsed.filter((item): item is RawPoi => {
    if (!item || typeof item !== 'object') return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.name === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.lat === 'number' &&
      typeof obj.lng === 'number' &&
      Number.isFinite(obj.lat) &&
      Number.isFinite(obj.lng)
    );
  });
}

interface AnthropicMessagesResponse {
  content?: Array<{ type?: string; text?: string }>;
}

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_API_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `POI suggester: Anthropic API ${response.status} — ${errorText}`
    );
  }
  const json = (await response.json()) as AnthropicMessagesResponse;
  const text = json.content
    ?.map((block) => (block.type === 'text' ? block.text ?? '' : ''))
    .join('')
    .trim();
  if (!text) {
    throw new Error('POI suggester: empty response from Anthropic.');
  }
  return text;
}

/**
 * Suggests Points of Interest along a route using Claude.
 *
 * The service samples the route at `sampleIntervalMiles` to give the model
 * spatial context, asks for POIs within `radiusMiles` of the route, then
 * filters + annotates the response with distance to the nearest waypoint.
 */
export async function suggestPoisAlongRoute(
  waypoints: RouteWaypoint[],
  options: PoiSuggesterOptions = {}
): Promise<PoiSuggestion[]> {
  if (waypoints.length < 2) {
    throw new Error(
      'POI suggester: at least two waypoints are required to define a route.'
    );
  }
  const radiusMiles = clamp(options.radiusMiles ?? 25, 0, 50);
  const categories =
    options.categories && options.categories.length > 0
      ? options.categories
      : ALL_CATEGORIES;
  const maxResults = clamp(options.maxResults ?? 10, 1, 25);
  const sampleIntervalMiles = clamp(
    options.sampleIntervalMiles ?? 25,
    5,
    100
  );
  const excludeNames = options.excludeNames ?? [];

  const samples = sampleRoute(waypoints, sampleIntervalMiles);
  const prompt = buildPrompt(
    samples,
    radiusMiles,
    categories,
    maxResults,
    excludeNames
  );
  const modelText = await callClaude(prompt);
  const parsed = extractJsonArray(modelText);
  const raw = validatePois(parsed);

  const excludeSet = new Set(excludeNames.map((n) => n.trim().toLowerCase()));
  const seen = new Set<string>();
  const suggestions: PoiSuggestion[] = [];

  for (const item of raw) {
    const name = (item.name as string).trim();
    if (!name) continue;
    const nameKey = name.toLowerCase();
    if (excludeSet.has(nameKey) || seen.has(nameKey)) continue;

    const lat = item.lat as number;
    const lng = item.lng as number;
    const { miles, index } = distanceToNearestWaypoint({ lat, lng }, waypoints);
    if (miles > radiusMiles) continue;

    const category = normalizeCategory(item.category);
    if (!categories.includes(category)) continue;

    seen.add(nameKey);
    suggestions.push({
      name,
      category,
      description: (item.description as string).trim(),
      lat,
      lng,
      distanceFromRouteMiles: Math.round(miles * 10) / 10,
      nearestWaypointIndex: index,
    });

    if (suggestions.length >= maxResults) break;
  }

  suggestions.sort(
    (a, b) => a.distanceFromRouteMiles - b.distanceFromRouteMiles
  );
  return suggestions;
}
