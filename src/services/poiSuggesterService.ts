import { ANTHROPIC_API_KEY } from '../lib/anthropic';
import type {
  PoiCategory,
  PoiSuggesterOptions,
  PoiSuggestion,
  RouteWaypoint,
} from '../types/poi';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const CLAUDE_MODEL = 'claude-opus-4-6';

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

const EARTH_RADIUS_MILES = 3958.7613;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance in miles between two lat/lng points.
 */
export function haversineMiles(a: RouteWaypoint, b: RouteWaypoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_MILES * c;
}

/**
 * Sample a route (sequence of waypoints) at roughly `intervalMiles` intervals.
 * The first and last waypoints are always preserved.
 */
export function sampleRoute(
  waypoints: RouteWaypoint[],
  intervalMiles: number
): RouteWaypoint[] {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) return [waypoints[0]];

  const interval = clamp(intervalMiles, 5, 100);
  const sampled: RouteWaypoint[] = [waypoints[0]];
  let accumulated = 0;

  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    accumulated += haversineMiles(prev, curr);
    if (accumulated >= interval || i === waypoints.length - 1) {
      sampled.push(curr);
      accumulated = 0;
    }
  }

  // Guarantee the terminal waypoint is included.
  const last = waypoints[waypoints.length - 1];
  if (sampled[sampled.length - 1] !== last) sampled.push(last);

  return sampled;
}

function findNearestWaypoint(
  point: RouteWaypoint,
  waypoints: RouteWaypoint[]
): { index: number; distanceMiles: number } {
  let nearestIndex = 0;
  let nearestDistance = Infinity;
  for (let i = 0; i < waypoints.length; i++) {
    const d = haversineMiles(point, waypoints[i]);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearestIndex = i;
    }
  }
  return { index: nearestIndex, distanceMiles: nearestDistance };
}

function normalizeCategory(raw: unknown): PoiCategory {
  if (typeof raw !== 'string') return 'other';
  const normalized = raw.toLowerCase().trim().replace(/\s+/g, '_');
  return (ALL_CATEGORIES as string[]).includes(normalized)
    ? (normalized as PoiCategory)
    : 'other';
}

function buildPrompt(
  sampled: RouteWaypoint[],
  radiusMiles: number,
  categories: PoiCategory[],
  maxResults: number,
  excludeNames: string[]
): string {
  const waypointList = sampled
    .map((w, i) => {
      const label = w.name ? ` (${w.name})` : '';
      return `  ${i + 1}. [${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}]${label}`;
    })
    .join('\n');

  const categoryList = categories.join(', ');
  const exclusionLine =
    excludeNames.length > 0
      ? `\nExclude these places (already on the itinerary): ${excludeNames.join(', ')}`
      : '';

  return `You are helping a road-trip planner find Points of Interest along a driving route.

Route waypoints (in order):
${waypointList}

Constraints:
- Suggest up to ${maxResults} real POIs that lie within ${radiusMiles} miles of the route.
- Only use these categories: ${categoryList}.
- Return a diverse mix when possible.
- Use real, verifiable places with accurate lat/lng.${exclusionLine}

Respond with ONLY a JSON array (no prose, no markdown fences). Each element must match:
{
  "name": string,
  "category": one of ${categoryList},
  "description": string (1-2 sentences, why it's worth stopping),
  "lat": number,
  "lng": number
}`;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
}

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Anthropic API error ${response.status}: ${body.slice(0, 500)}`
    );
  }

  const data = (await response.json()) as AnthropicResponse;
  const text = data.content
    ?.filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('')
    .trim();

  if (!text) throw new Error('Anthropic response contained no text content.');
  return text;
}

function extractJsonArray(raw: string): unknown {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON array.');
  }
  const slice = raw.slice(start, end + 1);
  return JSON.parse(slice);
}

interface RawPoi {
  name?: unknown;
  category?: unknown;
  description?: unknown;
  lat?: unknown;
  lng?: unknown;
}

function isRawPoiArray(value: unknown): value is RawPoi[] {
  return Array.isArray(value);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Suggest Points of Interest within `radiusMiles` of the given route.
 *
 * Calls Claude to brainstorm candidates, then filters locally by:
 * - distance from the nearest waypoint (Haversine)
 * - allowed categories
 * - excluded names (case-insensitive)
 * - duplicate names
 *
 * Results are sorted by distance from route (ascending).
 */
export async function suggestPoisAlongRoute(
  waypoints: RouteWaypoint[],
  options: PoiSuggesterOptions = {}
): Promise<PoiSuggestion[]> {
  if (waypoints.length < 2) {
    throw new Error('suggestPoisAlongRoute requires at least 2 waypoints.');
  }

  const radiusMiles = clamp(options.radiusMiles ?? 25, 0, 50);
  const maxResults = Math.min(options.maxResults ?? 10, 25);
  const sampleIntervalMiles = clamp(options.sampleIntervalMiles ?? 25, 5, 100);
  const categories =
    options.categories && options.categories.length > 0
      ? options.categories
      : ALL_CATEGORIES;
  const excludeNames = (options.excludeNames ?? []).map((n) =>
    n.toLowerCase().trim()
  );

  const sampled = sampleRoute(waypoints, sampleIntervalMiles);
  const prompt = buildPrompt(
    sampled,
    radiusMiles,
    categories,
    maxResults,
    options.excludeNames ?? []
  );

  const rawText = await callClaude(prompt);
  const parsed = extractJsonArray(rawText);
  if (!isRawPoiArray(parsed)) {
    throw new Error('Model response was not a JSON array.');
  }

  const seenNames = new Set<string>();
  const allowedCategorySet = new Set<PoiCategory>(categories);
  const suggestions: PoiSuggestion[] = [];

  for (const raw of parsed) {
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) continue;

    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;
    if (excludeNames.includes(nameKey)) continue;

    if (!isFiniteNumber(raw.lat) || !isFiniteNumber(raw.lng)) continue;

    const category = normalizeCategory(raw.category);
    if (!allowedCategorySet.has(category)) continue;

    const description =
      typeof raw.description === 'string' ? raw.description.trim() : '';

    const { index, distanceMiles } = findNearestWaypoint(
      { lat: raw.lat, lng: raw.lng },
      waypoints
    );
    if (distanceMiles > radiusMiles) continue;

    seenNames.add(nameKey);
    suggestions.push({
      name,
      category,
      description,
      lat: raw.lat,
      lng: raw.lng,
      distanceFromRouteMiles: Number(distanceMiles.toFixed(2)),
      nearestWaypointIndex: index,
    });

    if (suggestions.length >= maxResults) break;
  }

  suggestions.sort(
    (a, b) => a.distanceFromRouteMiles - b.distanceFromRouteMiles
  );
  return suggestions;
}
