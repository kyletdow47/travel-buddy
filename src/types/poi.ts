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
  /** Search radius from the route in miles. Clamped to [0, 50]. Default 25. */
  radiusMiles?: number;
  /** Restrict suggestions to these categories. Default: all. */
  categories?: PoiCategory[];
  /** Max number of POIs to return. Default 10, capped at 25. */
  maxResults?: number;
  /** Interval in miles at which to sample the route for POI search. Default 25. */
  sampleIntervalMiles?: number;
  /** Names to exclude (e.g. existing stops) — case-insensitive match. */
  excludeNames?: string[];
}
