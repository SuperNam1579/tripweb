import { googleProvider } from "./googleProvider";
import type { Hotel, Place, PlacesProvider, SearchPlacesOptions, StayStyle } from "./types";

export type { Hotel, Place, PriceRange, SearchPlacesOptions, StayStyle } from "./types";

/**
 * The ONE entry point components may use. Swapping providers happens here and
 * only here — no Places types leak into components.
 *
 * There is deliberately no offline/mock fallback: a mock can't honour the
 * owner's free-text destination, so it would answer a Krabi trip with Chiang
 * Mai places. Callers must handle a throw (missing key, quota, network) and
 * say so — see the results page.
 */
const provider: PlacesProvider = googleProvider;

export function searchPlaces(
  destination: string,
  activity: string,
  opts?: SearchPlacesOptions,
): Promise<Place[]> {
  return provider.searchPlaces(destination, activity, opts);
}

export function searchHotels(
  destination: string,
  style: StayStyle,
  opts?: SearchPlacesOptions,
): Promise<Hotel[]> {
  return provider.searchHotels(destination, style, opts);
}
