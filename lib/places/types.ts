/**
 * App-facing place shape. Field names match the Google Places response so a
 * future googleProvider is a pass-through. UI components import ONLY from
 * lib/places — no provider types may leak into components.
 */
export interface Place {
  placeId: string;
  name: string;
  photoUrl: string;
  rating: number;
  /** 0 (free) – 4 (splurge), Google Places convention. */
  priceLevel: 0 | 1 | 2 | 3 | 4;
  address: string;
  types: string[];
}

export interface SearchPlacesOptions {
  /** Max results to return. Default 6. */
  limit?: number;
}

export interface PlacesProvider {
  searchPlaces(
    region: string,
    activity: string,
    opts?: SearchPlacesOptions,
  ): Promise<Place[]>;
}
