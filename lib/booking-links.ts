/**
 * Deep links out to the booking sites, with the trip's dates and party size
 * pre-filled.
 *
 * Why links and not an API: Agoda and Booking.com only expose real nightly
 * rates to approved partners (Agoda has no self-serve signup; Booking has
 * paused API applications). Plain search links need no partnership, so the
 * group can still check real prices — we just can't read them back to filter
 * by budget. Swap these for a real rates API if partner access ever lands.
 *
 * Note: these earn no affiliate commission. If TripSync is ever accepted into
 * a program, add the partner id here and nowhere else.
 */

export interface StayLinkParams {
  /** Free-text destination, e.g. "เชียงใหม่". */
  destination: string;
  /** Date key (YYYY-MM-DD) — the first day of the trip. */
  checkIn: string;
  /** Date key (YYYY-MM-DD) — the last day, i.e. checkout morning. */
  checkOut: string;
  /** How many people are coming. */
  adults: number;
}

export function agodaSearchUrl({ destination, checkIn, checkOut, adults }: StayLinkParams): string {
  // Agoda keys its search off `text` for free-text queries.
  const q = new URLSearchParams({
    text: destination,
    checkIn,
    checkOut,
    adults: String(Math.max(1, adults)),
  });
  return `https://www.agoda.com/search?${q.toString()}`;
}

export function bookingSearchUrl({ destination, checkIn, checkOut, adults }: StayLinkParams): string {
  const q = new URLSearchParams({
    ss: destination,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(Math.max(1, adults)),
    no_rooms: "1",
  });
  return `https://www.booking.com/searchresults.html?${q.toString()}`;
}
