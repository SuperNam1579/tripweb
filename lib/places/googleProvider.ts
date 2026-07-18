import "server-only";
import type { Hotel, Place, PlacesProvider, PriceRange, SearchPlacesOptions, StayStyle } from "./types";

/**
 * Real Google Places (New) implementation, via Text Search. This is the only
 * provider — see lib/places/index.ts for why there's no mock fallback.
 *
 * Field notes, verified against the live API (2026-07):
 *  - `priceRange` comes back in real THB for restaurants/cafés — that's what we
 *    show. `priceLevel` is often absent, so it stays null rather than defaulting.
 *  - Lodging returns NO price of any kind, which is why Hotel has no price
 *    field. Real rates need an Agoda/Booking partner API.
 *  - `photos` is a separate paid SKU; with no billing Google omits it entirely
 *    and we fall back to placeholder art.
 */

/**
 * `includedType: "lodging"` is dropped for villa/homestay — Google's type
 * taxonomy has no "pool villa" category, so the text query alone has to do
 * the work, and forcing `lodging` filtered out results that only carried a
 * more specific type like `vacation_home` or `guest_house`.
 */
const STAY_QUERY: Record<StayStyle, { phrase: string; includedType?: string }> = {
  hotel: { phrase: "hotels", includedType: "lodging" },
  villa: { phrase: "private pool villa rentals" },
  homestay: { phrase: "homestays and guesthouses" },
};

const ACTIVITY_QUERY: Record<string, string> = {
  Mountains: "mountain viewpoints and national parks",
  Beach: "beaches and islands",
  City: "city neighborhoods and markets",
  Food: "restaurants and street food",
  Nature: "nature parks and waterfalls",
  Culture: "temples and cultural landmarks",
};

const PRICE_LEVEL_MAP: Record<string, Place["priceLevel"]> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

interface GoogleMoney {
  currencyCode?: string;
  units?: string;
}

interface GooglePlaceResult {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  priceRange?: { startPrice?: GoogleMoney; endPrice?: GoogleMoney };
  types?: string[];
  photos?: { name: string }[];
  googleMapsUri?: string;
}

interface SearchTextResponse {
  places?: GooglePlaceResult[];
}

async function searchText(
  textQuery: string,
  fieldMask: string,
  maxResultCount: number,
  extraBody: Record<string, unknown> = {},
): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is not set");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({ textQuery, maxResultCount: Math.min(maxResultCount, 20), ...extraBody }),
    // Results for a given query barely change minute to minute — cache briefly
    // so repeat page views don't re-bill the same search.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Places search failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as SearchTextResponse;
  return data.places ?? [];
}

function resolvePhotoUrl(photo: { name: string } | undefined): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!photo || !apiKey) return "/places/placeholder.svg";
  return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${apiKey}`;
}

function toPriceRange(range: GooglePlaceResult["priceRange"]): PriceRange | null {
  const min = Number(range?.startPrice?.units);
  const max = Number(range?.endPrice?.units);
  const currency = range?.startPrice?.currencyCode ?? range?.endPrice?.currencyCode;
  if (!currency || !Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max, currency };
}

export const googleProvider: PlacesProvider = {
  async searchPlaces(destination, activity, opts?: SearchPlacesOptions) {
    const limit = opts?.limit ?? 6;
    const activityPhrase = ACTIVITY_QUERY[activity] ?? activity;
    const results = await searchText(
      `${activityPhrase} in ${destination}, Thailand`,
      "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.priceRange,places.types,places.photos",
      limit,
    );

    return results.slice(0, limit).map(
      (p): Place => ({
        placeId: p.id,
        name: p.displayName?.text ?? "Unnamed place",
        photoUrl: resolvePhotoUrl(p.photos?.[0]),
        rating: p.rating ?? 0,
        priceLevel: PRICE_LEVEL_MAP[p.priceLevel ?? ""] ?? null,
        priceRange: toPriceRange(p.priceRange),
        address: p.formattedAddress ?? "",
        types: p.types ?? [],
      }),
    );
  },

  async searchHotels(destination, style, opts?: SearchPlacesOptions) {
    const limit = opts?.limit ?? 6;
    const { phrase, includedType } = STAY_QUERY[style] ?? STAY_QUERY.hotel;
    const results = await searchText(
      `${phrase} in ${destination}, Thailand`,
      "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri",
      limit,
      includedType ? { includedType } : {},
    );

    return results
      .slice(0, limit)
      .map(
        (p): Hotel => ({
          placeId: p.id,
          name: p.displayName?.text ?? "Unnamed hotel",
          rating: p.rating ?? 0,
          userRatingCount: p.userRatingCount ?? 0,
          address: p.formattedAddress ?? "",
          mapsUri: p.googleMapsUri ?? "",
        }),
      )
      // Best-reviewed first: rating alone lets a 1-review 5.0 outrank a 4.6
      // with 4,000 reviews, which is not what a group wants to book.
      .sort((a, b) => b.rating * Math.log10(b.userRatingCount + 10) - a.rating * Math.log10(a.userRatingCount + 10));
  },
};
