import type { APIRoute } from "astro";
import type { PlaceSearchResult, PlaceType } from "../../types/places";

export const prerender = false;

const GEOCODING_BASE_URL =
  import.meta.env.GEOCODING_BASE_URL ?? "https://nominatim.openstreetmap.org";

const GEOCODING_USER_AGENT =
  import.meta.env.GEOCODING_USER_AGENT ??
  "Kollektiv-Check/1.0 (https://kollektiv-check.de)";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const cache = new Map<
  string,
  { expiresAt: number; results: PlaceSearchResult[] }
>();
let lastProviderRequestAt = 0;
let providerRequestGate = Promise.resolve();

type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  name?: string;
  display_name?: string;
  category?: string;
  type?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string | undefined>;
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const lang = url.searchParams.get("lang") === "en" ? "en" : "de";

  if (query.length < 2) {
    return json(
      {
        ok: false,
        error:
          lang === "de"
            ? "Bitte gib mindestens zwei Zeichen ein."
            : "Please enter at least two characters.",
        results: [],
      },
      400,
    );
  }

  if (query.length > 160) {
    return json({ ok: false, error: "Query is too long", results: [] }, 400);
  }

  const cacheKey = `${lang}:${query.toLocaleLowerCase()}`;
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return json({ ok: true, results: cached.results, source: "cache" });
  }

  try {
    await respectPublicRateLimit();

    const providerUrl = new URL("/search", GEOCODING_BASE_URL);
    providerUrl.searchParams.set("q", query);
    providerUrl.searchParams.set("format", "jsonv2");
    providerUrl.searchParams.set("addressdetails", "1");
    providerUrl.searchParams.set("namedetails", "1");
    providerUrl.searchParams.set("limit", "6");
    providerUrl.searchParams.set("accept-language", lang);

    const response = await fetch(providerUrl, {
      headers: {
        Accept: "application/json",
        "Accept-Language": lang,
        "User-Agent": GEOCODING_USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding provider returned ${response.status}`);
    }

    const rawResults = (await response.json()) as NominatimResult[];
    const results = rawResults
      .map(normalizeNominatimResult)
      .filter((item): item is PlaceSearchResult => item !== null);

    removeExpiredCacheEntries();
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (typeof oldestKey === "string") cache.delete(oldestKey);
    }

    cache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_DURATION_MS,
      results,
    });

    return json({ ok: true, results, source: "provider" });
  } catch (error) {
    console.error("[api/place-search] search failed", error);

    return json(
      {
        ok: false,
        error:
          lang === "de"
            ? "Die Ortssuche ist gerade nicht erreichbar. Du kannst den Test trotzdem ohne Ortsangabe abschließen."
            : "Place search is currently unavailable. You can still complete the test without a location.",
        results: [],
      },
      502,
    );
  }
};

function normalizeNominatimResult(
  item: NominatimResult,
): PlaceSearchResult | null {
  const providerPlaceId =
    item.osm_type && item.osm_id
      ? `${item.osm_type}:${item.osm_id}`
      : item.place_id
        ? `place:${item.place_id}`
        : "";

  if (!providerPlaceId || !item.display_name) return null;

  const address = item.address ?? {};
  const latitude = toCoordinate(item.lat, -90, 90);
  const longitude = toCoordinate(item.lon, -180, 180);
  const rawType = item.type ?? "";

  const city = firstText(
    address.city,
    address.town,
    address.village,
    address.municipality,
    isCityType(rawType) ? item.name : undefined,
  );

  return {
    provider: "nominatim",
    providerPlaceId,
    displayName: item.display_name,
    placeType: inferPlaceType(item),
    postalCode: firstText(address.postcode),
    neighbourhood: firstText(
      address.neighbourhood,
      address.quarter,
      address.suburb,
    ),
    district: firstText(address.city_district, address.borough, address.county),
    city,
    region: firstText(address.state, address.region, address.state_district),
    country: firstText(address.country),
    countryCode: firstText(address.country_code).toUpperCase(),
    latitude,
    longitude,
  };
}

function inferPlaceType(item: NominatimResult): PlaceType {
  const type = (item.type ?? "").toLocaleLowerCase();
  const category = (item.category ?? "").toLocaleLowerCase();
  const address = item.address ?? {};
  const hasCity = Boolean(
    firstText(
      address.city,
      address.town,
      address.village,
      address.municipality,
    ),
  );
  const hasRegion = Boolean(
    firstText(address.state, address.region, address.state_district),
  );

  if (type === "continent") return "continent";
  if (type === "country") return "country";
  if (["state", "province", "region"].includes(type)) return "region";
  if (isCityType(type)) return "city";
  if (["city_district", "borough", "county"].includes(type)) return "district";
  if (["neighbourhood", "quarter", "suburb"].includes(type)) {
    return "neighbourhood";
  }
  if (type === "administrative" && category === "boundary") {
    if (hasCity) return "city";
    if (hasRegion) return "region";
    if (address.country) return "country";
  }
  if (
    ["amenity", "office", "building", "tourism", "leisure"].includes(category)
  ) {
    return "poi";
  }

  return "unknown";
}

function isCityType(value: string): boolean {
  return ["city", "town", "village", "municipality", "hamlet"].includes(
    value.toLocaleLowerCase(),
  );
}

function firstText(...values: Array<string | undefined>): string {
  return values.find((value) => value?.trim())?.trim() ?? "";
}

function toCoordinate(
  value: string | undefined,
  min: number,
  max: number,
): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null;
}

async function respectPublicRateLimit(): Promise<void> {
  providerRequestGate = providerRequestGate.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, 1050 - (now - lastProviderRequestAt));

    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    lastProviderRequestAt = Date.now();
  });

  await providerRequestGate;
}

function removeExpiredCacheEntries(): void {
  const now = Date.now();
  for (const [key, value] of cache) {
    if (value.expiresAt <= now) cache.delete(key);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": status === 200 ? "private, max-age=300" : "no-store",
    },
  });
}
