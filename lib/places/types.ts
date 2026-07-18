/**
 * App-facing place shape. Field names match the Google Places response so a
 * future googleProvider is a pass-through. UI components import ONLY from
 * lib/places — no provider types may leak into components.
 */
/** A real money range, as published by Google (never inferred). */
export interface PriceRange {
  min: number;
  max: number;
  /** ISO currency code, e.g. "THB". */
  currency: string;
}

export interface Place {
  placeId: string;
  name: string;
  photoUrl: string;
  rating: number;
  /**
   * 0 (free) – 4 (splurge), Google Places convention. NULL when Google
   * publishes none — most attractions have no price level, and defaulting it
   * would show a made-up "฿" on every card.
   */
  priceLevel: 0 | 1 | 2 | 3 | 4 | null;
  /** Actual spend range when Google has one (restaurants and cafés usually do). */
  priceRange: PriceRange | null;
  address: string;
  types: string[];
}

/**
 * A place to stay. Deliberately has NO price: Google returns neither
 * priceLevel nor priceRange for lodging, and inventing one would be a lie.
 * Real nightly rates need an Agoda/Booking partner API, so until then we send
 * people to those sites via a deep link (see lib/booking-links.ts).
 */
export interface Hotel {
  placeId: string;
  name: string;
  rating: number;
  /** How many reviews the rating is based on — the honest confidence signal. */
  userRatingCount: number;
  address: string;
  /** Google Maps link for the property. */
  mapsUri: string;
}

/** What kind of stay to search for — changes the search phrase only. */
export type StayStyle = "hotel" | "villa" | "homestay";

export interface SearchPlacesOptions {
  /** Max results to return. Default 6. */
  limit?: number;
}

export interface PlacesProvider {
  searchPlaces(
    /** Free-text destination the owner set — city / province / island. */
    destination: string,
    activity: string,
    opts?: SearchPlacesOptions,
  ): Promise<Place[]>;

  searchHotels(destination: string, style: StayStyle, opts?: SearchPlacesOptions): Promise<Hotel[]>;
}
