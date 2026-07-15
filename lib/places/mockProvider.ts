import type { Place, PlacesProvider, SearchPlacesOptions } from "./types";

/**
 * Realistic Thai place data, keyed by region. Photo URLs are local SVG
 * placeholders so the app works fully offline.
 */

type Catalog = Record<string, Place[]>;

function place(
  placeId: string,
  name: string,
  rating: number,
  priceLevel: Place["priceLevel"],
  address: string,
  types: string[],
): Place {
  return {
    placeId,
    name,
    photoUrl: `/places/${placeId}.svg`,
    rating,
    priceLevel,
    address,
    types,
  };
}

const CATALOG: Catalog = {
  "Northern Thailand": [
    place("nt-doi-inthanon", "Doi Inthanon National Park", 4.7, 1, "Ban Luang, Chom Thong, Chiang Mai 50160", ["park", "mountain", "nature", "hiking"]),
    place("nt-nimman", "Nimmanhaemin Road", 4.4, 2, "Suthep, Mueang Chiang Mai, Chiang Mai 50200", ["neighborhood", "city", "food", "cafe"]),
    place("nt-doi-suthep", "Wat Phra That Doi Suthep", 4.6, 0, "Su Thep, Mueang Chiang Mai, Chiang Mai 50200", ["temple", "culture", "viewpoint"]),
    place("nt-pai-canyon", "Pai Canyon (Kong Lan)", 4.4, 0, "Thung Yao, Pai, Mae Hong Son 58130", ["nature", "viewpoint", "hiking"]),
    place("nt-khao-soi", "Khao Soi Khun Yai", 4.6, 0, "5 Rachaphakhinai Rd, Si Phum, Chiang Mai 50200", ["restaurant", "food", "local"]),
    place("nt-mon-jam", "Mon Jam Viewpoint", 4.5, 1, "Mae Raem, Mae Rim, Chiang Mai 50180", ["mountain", "nature", "camping"]),
    place("nt-chiang-rai-white", "Wat Rong Khun (White Temple)", 4.5, 1, "Pa O Don Chai, Mueang Chiang Rai, Chiang Rai 57000", ["temple", "culture", "art"]),
    place("nt-sunday-market", "Chiang Mai Sunday Walking Street", 4.5, 1, "Ratchadamnoen Rd, Si Phum, Chiang Mai 50200", ["market", "food", "culture", "city"]),
  ],
  Isaan: [
    place("is-phanom-rung", "Phanom Rung Historical Park", 4.6, 1, "Ta Pek, Chaloem Phra Kiat, Buri Ram 31110", ["ruins", "culture", "history"]),
    place("is-sam-phan-bok", "Sam Phan Bok (Grand Canyon of Thailand)", 4.5, 0, "Lao Ngam, Pho Sai, Ubon Ratchathani 34340", ["nature", "river", "viewpoint"]),
    place("is-khao-yai", "Khao Yai National Park", 4.7, 1, "Hin Tueng, Mueang Nakhon Nayok 26000", ["park", "nature", "mountain", "wildlife"]),
    place("is-somtam-jay-so", "Somtam Jay So", 4.5, 0, "Soi Phiphat 2, Silom — Isaan-style, Khon Kaen roots", ["restaurant", "food", "local"]),
    place("is-red-lotus", "Red Lotus Sea (Talay Bua Daeng)", 4.6, 1, "Chiang Haeo, Kumphawapi, Udon Thani 41370", ["nature", "lake", "boat"]),
    place("is-nong-khai", "Sala Kaew Ku Sculpture Park", 4.4, 0, "Wat That, Mueang Nong Khai, Nong Khai 43000", ["art", "culture", "park"]),
  ],
  "Andaman Coast": [
    place("ac-railay", "Railay Beach", 4.7, 2, "Ao Nang, Mueang Krabi, Krabi 81180", ["beach", "climbing", "nature"]),
    place("ac-phi-phi", "Ko Phi Phi Leh / Maya Bay", 4.6, 3, "Ao Nang, Mueang Krabi, Krabi 81210", ["island", "beach", "boat", "snorkeling"]),
    place("ac-similan", "Similan Islands", 4.8, 3, "Ko Phra Thong, Khura Buri, Phang-nga 82150", ["island", "diving", "beach", "nature"]),
    place("ac-old-phuket", "Phuket Old Town", 4.5, 1, "Thalang Rd, Talat Yai, Mueang Phuket, Phuket 83000", ["city", "culture", "food", "architecture"]),
    place("ac-khao-lak", "Khao Lak Beach", 4.5, 2, "Khuekkhak, Takua Pa, Phang-nga 82220", ["beach", "quiet", "sunset"]),
    place("ac-ko-lanta", "Ko Lanta Long Beach (Phra Ae)", 4.6, 2, "Sala Dan, Ko Lanta, Krabi 81150", ["beach", "island", "relaxed"]),
    place("ac-emerald-pool", "Emerald Pool (Sa Morakot)", 4.4, 1, "Khlong Thom Nuea, Khlong Thom, Krabi 81120", ["nature", "swimming", "forest"]),
  ],
  "Gulf Islands": [
    place("gi-ang-thong", "Ang Thong National Marine Park", 4.7, 2, "Ko Pha-ngan District, Surat Thani 84280", ["island", "kayak", "nature", "boat"]),
    place("gi-ko-tao", "Ko Tao — Sairee Beach", 4.6, 2, "Ko Tao, Ko Pha-ngan, Surat Thani 84360", ["beach", "diving", "island"]),
    place("gi-full-moon", "Haad Rin, Ko Pha-ngan", 4.3, 2, "Ban Tai, Ko Pha-ngan, Surat Thani 84280", ["beach", "nightlife", "island"]),
    place("gi-lamai", "Lamai Beach, Ko Samui", 4.5, 2, "Maret, Ko Samui, Surat Thani 84310", ["beach", "swimming", "food"]),
    place("gi-fisherman", "Fisherman's Village, Bophut", 4.4, 2, "Bo Put, Ko Samui, Surat Thani 84320", ["market", "food", "city", "sunset"]),
    place("gi-than-sadet", "Than Sadet Waterfall", 4.4, 0, "Ban Tai, Ko Pha-ngan, Surat Thani 84280", ["waterfall", "nature", "hiking"]),
  ],
  Central: [
    place("ce-ayutthaya", "Ayutthaya Historical Park", 4.7, 1, "Pratu Chai, Phra Nakhon Si Ayutthaya 13000", ["ruins", "culture", "history", "cycling"]),
    place("ce-chatuchak", "Chatuchak Weekend Market", 4.5, 1, "Kamphaeng Phet 2 Rd, Chatuchak, Bangkok 10900", ["market", "food", "city", "shopping"]),
    place("ce-yaowarat", "Yaowarat (Bangkok Chinatown)", 4.6, 1, "Yaowarat Rd, Samphanthawong, Bangkok 10100", ["food", "city", "street-food", "night"]),
    place("ce-amphawa", "Amphawa Floating Market", 4.4, 1, "Amphawa, Samut Songkhram 75110", ["market", "boat", "food", "culture"]),
    place("ce-erawan", "Erawan National Park", 4.7, 1, "Tha Kradan, Si Sawat, Kanchanaburi 71250", ["waterfall", "nature", "swimming", "hiking"]),
    place("ce-wat-arun", "Wat Arun Ratchawararam", 4.7, 0, "158 Wang Doem Rd, Wat Arun, Bangkok Yai, Bangkok 10600", ["temple", "culture", "river"]),
    place("ce-khao-san", "Pak Khlong Talat Flower Market", 4.4, 0, "Chakkraphet Rd, Wang Burapha Phirom, Bangkok 10200", ["market", "city", "night"]),
  ],
};

/** Activity → place types that satisfy it. */
const ACTIVITY_TYPES: Record<string, string[]> = {
  Mountains: ["mountain", "hiking", "viewpoint", "camping", "park"],
  Beach: ["beach", "island", "swimming", "snorkeling", "diving"],
  City: ["city", "market", "neighborhood", "shopping", "night", "nightlife", "architecture"],
  Food: ["food", "restaurant", "cafe", "market", "street-food", "local"],
  Nature: ["nature", "park", "waterfall", "river", "lake", "forest", "wildlife", "kayak"],
  Culture: ["culture", "temple", "ruins", "history", "art"],
};

export const mockProvider: PlacesProvider = {
  async searchPlaces(region, activity, opts?: SearchPlacesOptions) {
    const limit = opts?.limit ?? 6;
    const pool = CATALOG[region] ?? Object.values(CATALOG).flat();
    const wanted = ACTIVITY_TYPES[activity] ?? [];

    const scored = pool
      .map((p) => ({
        place: p,
        score: p.types.filter((t) => wanted.includes(t)).length,
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.place.rating - a.place.rating ||
          a.place.name.localeCompare(b.place.name),
      );

    // Prefer activity matches, but never return empty for a valid region.
    const matches = scored.filter((s) => s.score > 0);
    const chosen = (matches.length > 0 ? matches : scored).slice(0, limit);
    return chosen.map((s) => s.place);
  },
};
