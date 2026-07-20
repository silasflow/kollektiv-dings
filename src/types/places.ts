export type PlaceRole = "base" | "project" | "activity_area";

export type PlaceType =
  | "poi"
  | "neighbourhood"
  | "district"
  | "city"
  | "region"
  | "country"
  | "continent"
  | "unknown";

export type PlaceSelection = {
  provider: string;
  providerPlaceId: string;
  displayName: string;
  placeType: PlaceType;
  postalCode: string;
  neighbourhood: string;
  district: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  role: PlaceRole;
  isPrimary: boolean;
};

export type PlaceSearchResult = Omit<PlaceSelection, "role" | "isPrimary">;

export function getPlaceIdentity(place: PlaceSelection): string {
  return `${place.provider}:${place.providerPlaceId}:${place.role}`;
}

export function getPlaceLabel(place: PlaceSelection): string {
  const localPart =
    place.neighbourhood ||
    place.district ||
    place.city ||
    place.region ||
    place.country ||
    place.displayName;

  const parts = [
    localPart,
    localPart !== place.city ? place.city : "",
    place.region,
    place.country,
  ].filter(Boolean);

  return uniqueCaseInsensitive(parts).join(", ");
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const known = new Set<string>();

  return values.filter((value) => {
    const key = value.trim().toLocaleLowerCase();
    if (!key || known.has(key)) return false;
    known.add(key);
    return true;
  });
}
