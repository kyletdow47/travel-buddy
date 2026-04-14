export type PoiCategory =
  | 'food'
  | 'lodging'
  | 'attraction'
  | 'nature'
  | 'shopping'
  | 'gas'
  | 'rest_stop'
  | 'scenic'
  | 'other';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface PoiSuggestion {
  name: string;
  category: PoiCategory;
  description: string;
  lat: number;
  lng: number;
  distanceFromRouteMiles: number;
  nearestWaypointIndex: number;
}

export interface PoiSuggesterOptions {
  /** Radius in miles from the route within which POIs are accepted. Clamped to [0, 50]. */
  radiusMiles?: number;
  /** Categories to include. If omitted, all categories are allowed. */
  categories?: PoiCategory[];
  /** Maximum number of suggestions to return. Capped at 25. */
  maxResults?: number;
  /** Interval in miles at which to sample the polyline for the prompt. Clamped to [5, 100]. */
  sampleIntervalMiles?: number;
  /** Names to exclude (case-insensitive). Useful for filtering out existing stops. */
  excludeNames?: string[];
}
