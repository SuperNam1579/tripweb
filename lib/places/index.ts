import { mockProvider } from "./mockProvider";
import type { Place, PlacesProvider, SearchPlacesOptions } from "./types";

export type { Place, SearchPlacesOptions } from "./types";

/**
 * The ONE entry point components may use. Swapping in googleProvider later
 * happens here and only here — zero changes in any UI component.
 */
const provider: PlacesProvider = mockProvider;
// Later: process.env.GOOGLE_PLACES_API_KEY ? googleProvider : mockProvider

export function searchPlaces(
  region: string,
  activity: string,
  opts?: SearchPlacesOptions,
): Promise<Place[]> {
  return provider.searchPlaces(region, activity, opts);
}

/**
 * Rough per-person THB cost for a day around a place, by Google price level.
 * Used only to attach a budget tier badge — never shown as a price.
 */
export const PRICE_LEVEL_THB: Record<Place["priceLevel"], number> = {
  0: 300,
  1: 800,
  2: 1800,
  3: 3500,
  4: 7000,
};
