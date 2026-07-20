import type { Lang } from "../../data/siteContent";
import {
  getPlaceLabel,
  type PlaceRole,
  type PlaceSelection,
  type PlaceType,
} from "../../types/places";
import {
  finderText,
  getOptionLabel,
  getOrientationOptions,
  getTopicOptions,
  scopeLabels,
  structureLabels,
  timeLabels,
} from "./finderContent";
import type {
  FinderCollective,
  FinderFilterState,
  FinderGroup,
  FinderGroupBy,
  PlaceRelationFilter,
  RawTestResult,
  ScopeCategory,
  StructureCategory,
  TimeCategory,
} from "./finderTypes";

const LOCAL_RESULTS_KEY = "stadt-kollektiv-local-results";

const DEFAULT_RANKING = [
  "political",
  "economic",
  "creative",
  "social",
  "ecological",
];

const ALLOWED_PLACE_ROLES = new Set<PlaceRole>([
  "base",
  "project",
  "activity_area",
]);

const ALLOWED_PLACE_TYPES = new Set<PlaceType>([
  "poi",
  "neighbourhood",
  "district",
  "city",
  "region",
  "country",
  "continent",
  "unknown",
]);

export const EMPTY_FILTERS: FinderFilterState = {
  query: "",
  topics: [],
  placeRelation: "any",
  country: "",
  region: "",
  city: "",
  scopes: [],
  structures: [],
  times: [],
  orientations: [],
  digitalOnly: false,
};

export function normalizeTestResult(
  raw: RawTestResult,
  fallbackIndex: number,
): FinderCollective {
  const answers = raw.answers ?? {};
  const result = raw.result ?? {};
  const values = {
    formalization: firstNumber(
      answers.formalization,
      result.values?.formalization,
      result.networkShape?.formalization,
      50,
    ),
    time: firstNumber(
      answers.time,
      result.values?.time,
      result.networkShape?.time,
      50,
    ),
    identity: firstNumber(
      answers.identity,
      result.values?.identity,
      result.networkShape?.identity,
      50,
    ),
    space: firstNumber(
      answers.space,
      result.values?.space,
      result.networkShape?.space,
      50,
    ),
  };
  const ranking = firstNonEmptyArray(
    answers.goals,
    result.graphic?.rankingOrder,
    result.networkShape?.goalRanking,
    result.selectedAnswerIds?.goalRanking,
    DEFAULT_RANKING,
  );
  const topics = firstArray(
    answers.goalTopics,
    result.goalDetails?.selectedGoalTopics,
  );
  const customTopics = firstArray(
    answers.goalTopicsOther,
    result.goalDetails?.ownGoalTopics,
  )
    .map((topic) => topic.trim())
    .filter(Boolean);
  const legacyContact = splitLegacyContact(
    raw.websiteOrInstagram?.trim() ?? "",
  );
  const normalizedPlaces = normalizePlaces(raw.places);
  const legacyPlace = createLegacyPlace(raw, fallbackIndex);
  const places =
    normalizedPlaces.length > 0
      ? normalizedPlaces
      : legacyPlace
        ? [legacyPlace]
        : [];
  const primaryPlace = getPrimaryBasePlace(places) ?? places[0];

  return {
    id: raw.id?.trim() || `local-result-${fallbackIndex}`,
    createdAt: raw.createdAt ?? "",
    collectiveName: raw.collectiveName?.trim() ?? "",
    website: raw.website?.trim() || legacyContact.website || null,
    instagram: raw.instagram?.trim() || legacyContact.instagram || null,
    places,
    city: primaryPlace?.city ?? raw.location?.trim() ?? "",
    region: primaryPlace?.region ?? raw.region?.trim() ?? "",
    country: primaryPlace?.country ?? raw.country?.trim() ?? "",
    topics,
    customTopics,
    ranking,
    values,
    actsVirtually: firstBoolean(
      answers.actsVirtually,
      result.networkShape?.actsVirtually,
      result.selectedAnswerIds?.actsVirtually,
      false,
    ),
    scopeCategory: getScopeCategory(values.space),
    structure: getStructureCategory(values.formalization),
    timeCategory: getTimeCategory(values.time),
  };
}

export function readPublishedLocalResults(): RawTestResult[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_RESULTS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is RawTestResult =>
        isObject(item) && item.consentPublic === true,
    );
  } catch {
    return [];
  }
}

export function filterCollectives(
  collectives: FinderCollective[],
  filters: FinderFilterState,
  lang: Lang,
): FinderCollective[] {
  const topicOptions = getTopicOptions(lang);
  const orientationOptions = getOrientationOptions(lang);
  const queryTerms = normalizeText(filters.query).split(/\s+/).filter(Boolean);

  return collectives.filter((collective) => {
    if (
      filters.topics.length > 0 &&
      !filters.topics.some((topic) => collective.topics.includes(topic))
    ) {
      return false;
    }

    const relevantPlaces = getPlacesForRelation(
      collective.places,
      filters.placeRelation,
    );

    if (filters.country || filters.region || filters.city) {
      const hasMatchingPlace = relevantPlaces.some(
        (place) =>
          (!filters.country || sameText(place.country, filters.country)) &&
          (!filters.region || sameText(place.region, filters.region)) &&
          (!filters.city || sameText(place.city, filters.city)),
      );

      if (!hasMatchingPlace) return false;
    }

    if (
      filters.scopes.length > 0 &&
      !filters.scopes.includes(collective.scopeCategory)
    ) {
      return false;
    }

    if (
      filters.structures.length > 0 &&
      !filters.structures.includes(collective.structure)
    ) {
      return false;
    }

    if (
      filters.times.length > 0 &&
      !filters.times.includes(collective.timeCategory)
    ) {
      return false;
    }

    if (filters.orientations.length > 0) {
      const leadingOrientations = collective.ranking.slice(0, 2);
      if (
        !filters.orientations.some((orientation) =>
          leadingOrientations.includes(orientation),
        )
      ) {
        return false;
      }
    }

    if (filters.digitalOnly && !collective.actsVirtually) return false;

    if (queryTerms.length > 0) {
      const placeText = collective.places.flatMap((place) => [
        place.displayName,
        place.postalCode,
        place.neighbourhood,
        place.district,
        place.city,
        place.region,
        place.country,
      ]);
      const searchableText = normalizeText(
        [
          collective.collectiveName,
          ...placeText,
          ...collective.topics.map((topic) =>
            getOptionLabel(topicOptions, topic),
          ),
          ...collective.customTopics,
          ...collective.ranking.map((orientation) =>
            getOptionLabel(orientationOptions, orientation),
          ),
          scopeLabels[lang][collective.scopeCategory],
        ].join(" "),
      );

      if (!queryTerms.every((term) => searchableText.includes(term))) {
        return false;
      }
    }

    return true;
  });
}

export function groupCollectives(
  collectives: FinderCollective[],
  groupBy: FinderGroupBy,
  lang: Lang,
): FinderGroup[] {
  const t = finderText[lang];
  const orientationOptions = getOrientationOptions(lang);
  const sortedCollectives = sortCollectives(collectives, lang);

  if (groupBy === "none") {
    return [{ key: "all", label: "", collectives: sortedCollectives }];
  }

  const groups = new Map<string, FinderGroup>();

  sortedCollectives.forEach((collective) => {
    let key = "";
    let label = "";

    if (groupBy === "city") {
      const primaryBase = getPrimaryBasePlace(collective.places);
      const city = primaryBase?.city || collective.city;
      key = normalizeText(city) || "unknown-location";
      label = city || t.noLocation;
    } else if (groupBy === "scope") {
      key = collective.scopeCategory;
      label = scopeLabels[lang][collective.scopeCategory];
    } else if (groupBy === "structure") {
      key = collective.structure;
      label = structureLabels[lang][collective.structure];
    } else if (groupBy === "time") {
      key = collective.timeCategory;
      label = timeLabels[lang][collective.timeCategory];
    } else {
      const orientation = collective.ranking[0];
      key = orientation || "unknown-orientation";
      label = orientation
        ? getOptionLabel(orientationOptions, orientation)
        : t.noOrientation;
    }

    const group = groups.get(key) ?? { key, label, collectives: [] };
    group.collectives.push(collective);
    groups.set(key, group);
  });

  const groupList = Array.from(groups.values());

  if (groupBy === "scope") {
    return sortGroupsByOrder(groupList, ["local", "translocal", "global"]);
  }
  if (groupBy === "structure") {
    return sortGroupsByOrder(groupList, ["informal", "partial", "structured"]);
  }
  if (groupBy === "time") {
    return sortGroupsByOrder(groupList, [
      "project",
      "recurring",
      "established",
    ]);
  }
  if (groupBy === "orientation") {
    return sortGroupsByOrder(groupList, [
      ...orientationOptions.map((option) => option.id),
      "unknown-orientation",
    ]);
  }

  return groupList.sort((a, b) => a.label.localeCompare(b.label, lang));
}

export function getGeographicOptions(
  collectives: FinderCollective[],
  field: "country" | "region" | "city",
  filters: Pick<FinderFilterState, "placeRelation" | "country" | "region">,
  lang: Lang,
): string[] {
  const values = new Map<string, string>();

  collectives.forEach((collective) => {
    const places = getPlacesForRelation(
      collective.places,
      filters.placeRelation,
    );

    places.forEach((place) => {
      // Ungeprüfte Alttexte bleiben in Suche und Karten sichtbar, sollen aber
      // keine neuen, vermeintlich kanonischen Filteroptionen erzeugen.
      if (place.provider === "legacy") return;

      if (
        field !== "country" &&
        filters.country &&
        !sameText(place.country, filters.country)
      ) {
        return;
      }

      if (
        field === "city" &&
        filters.region &&
        !sameText(place.region, filters.region)
      ) {
        return;
      }

      const value = place[field].trim();
      if (!value) return;

      const key = normalizeText(value);
      if (!values.has(key)) values.set(key, value);
    });
  });

  return Array.from(values.values()).sort((a, b) => a.localeCompare(b, lang));
}

export function getPrimaryBasePlace(
  places: PlaceSelection[],
): PlaceSelection | undefined {
  return (
    places.find((place) => place.role === "base" && place.isPrimary) ??
    places.find((place) => place.role === "base")
  );
}

export function getLocationLabel(collective: FinderCollective): string {
  const place = getPrimaryBasePlace(collective.places);
  if (place) return getPlaceLabel(place);

  return uniqueCaseInsensitive([
    collective.city,
    collective.region,
    collective.country,
  ]).join(", ");
}

export function getActivityLocationLabel(
  collective: FinderCollective,
  lang: Lang,
): string {
  const labels = uniqueCaseInsensitive(
    collective.places
      .filter(
        (place) => place.role === "project" || place.role === "activity_area",
      )
      .map((place) => getPlaceLabel(place))
      .filter(Boolean),
  );

  if (labels.length <= 2) return labels.join(" · ");

  const remaining = labels.length - 2;
  return `${labels.slice(0, 2).join(" · ")} ${finderText[
    lang
  ].morePlaces.replace("{count}", String(remaining))}`;
}

export function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizeInstagramUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^instagram\.com\//i.test(trimmed)) return `https://${trimmed}`;

  const handle = trimmed.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
  return `https://instagram.com/${handle}`;
}

export function getStructureCategory(value: number): StructureCategory {
  if (value <= 33) return "informal";
  if (value <= 66) return "partial";
  return "structured";
}

export function getTimeCategory(value: number): TimeCategory {
  if (value <= 33) return "project";
  if (value <= 66) return "recurring";
  return "established";
}

export function getScopeCategory(value: number): ScopeCategory {
  if (value <= 33) return "local";
  if (value <= 66) return "translocal";
  return "global";
}

export function hasActiveFilters(filters: FinderFilterState): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.topics.length > 0 ||
    filters.placeRelation !== "any" ||
    Boolean(filters.country) ||
    Boolean(filters.region) ||
    Boolean(filters.city) ||
    filters.scopes.length > 0 ||
    filters.structures.length > 0 ||
    filters.times.length > 0 ||
    filters.orientations.length > 0 ||
    filters.digitalOnly
  );
}

export function countActiveFilters(filters: FinderFilterState): number {
  return (
    filters.topics.length +
    filters.scopes.length +
    filters.structures.length +
    filters.times.length +
    filters.orientations.length +
    Number(filters.placeRelation !== "any") +
    Number(Boolean(filters.country)) +
    Number(Boolean(filters.region)) +
    Number(Boolean(filters.city)) +
    Number(filters.digitalOnly)
  );
}

function getPlacesForRelation(
  places: PlaceSelection[],
  relation: PlaceRelationFilter,
): PlaceSelection[] {
  if (relation === "base") {
    return places.filter((place) => place.role === "base");
  }

  if (relation === "activity") {
    return places.filter(
      (place) => place.role === "project" || place.role === "activity_area",
    );
  }

  return places;
}

function normalizePlaces(value: unknown): PlaceSelection[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): PlaceSelection[] => {
    if (!isObject(item)) return [];

    const provider = textValue(item.provider);
    const providerPlaceId = textValue(item.providerPlaceId);
    const displayName = textValue(item.displayName);
    const role = ALLOWED_PLACE_ROLES.has(item.role as PlaceRole)
      ? (item.role as PlaceRole)
      : null;
    const placeType = ALLOWED_PLACE_TYPES.has(item.placeType as PlaceType)
      ? (item.placeType as PlaceType)
      : "unknown";

    if (!provider || !providerPlaceId || !displayName || !role) return [];

    return [
      {
        provider,
        providerPlaceId,
        displayName,
        placeType,
        postalCode: textValue(item.postalCode),
        neighbourhood: textValue(item.neighbourhood),
        district: textValue(item.district),
        city: textValue(item.city),
        region: textValue(item.region),
        country: textValue(item.country),
        countryCode: textValue(item.countryCode),
        latitude: numberOrNull(item.latitude, -90, 90),
        longitude: numberOrNull(item.longitude, -180, 180),
        role,
        isPrimary: item.isPrimary === true,
      },
    ];
  });
}

function createLegacyPlace(
  raw: RawTestResult,
  fallbackIndex: number,
): PlaceSelection | null {
  const city = raw.location?.trim() ?? "";
  const region = raw.region?.trim() ?? "";
  const country = raw.country?.trim() ?? "";
  const displayName = [city, region, country].filter(Boolean).join(", ");
  if (!displayName) return null;

  return {
    provider: "legacy",
    providerPlaceId: raw.id?.trim() || `legacy-${fallbackIndex}`,
    displayName,
    placeType: city ? "city" : region ? "region" : "country",
    postalCode: "",
    neighbourhood: "",
    district: "",
    city,
    region,
    country,
    countryCode: "",
    latitude: null,
    longitude: null,
    role: "base",
    isPrimary: true,
  };
}

function firstNumber(...values: unknown[]): number {
  const match = values.find(
    (value) => typeof value === "number" && Number.isFinite(value),
  );
  return typeof match === "number" ? clamp(match, 0, 100) : 50;
}

function splitLegacyContact(value: string): {
  website: string;
  instagram: string;
} {
  const trimmed = value.trim();
  const isInstagram =
    trimmed.startsWith("@") || /instagram\.com/i.test(trimmed);

  return isInstagram
    ? { website: "", instagram: trimmed }
    : { website: trimmed, instagram: "" };
}

function firstBoolean(...values: unknown[]): boolean {
  const match = values.find((value) => typeof value === "boolean");
  return typeof match === "boolean" ? match : false;
}

function firstArray(...values: unknown[]): string[] {
  const match = values.find(Array.isArray);
  return normalizeStringArray(match);
}

function firstNonEmptyArray(...values: unknown[]): string[] {
  for (const value of values) {
    const items = normalizeStringArray(value);
    if (items.length > 0) return items;
  }
  return [...DEFAULT_RANKING];
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function sortCollectives(
  collectives: FinderCollective[],
  lang: Lang,
): FinderCollective[] {
  return [...collectives].sort((a, b) =>
    (a.collectiveName || a.city).localeCompare(
      b.collectiveName || b.city,
      lang,
    ),
  );
}

function sortGroupsByOrder(
  groups: FinderGroup[],
  order: string[],
): FinderGroup[] {
  return groups.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const known = new Set<string>();

  return values.filter((value) => {
    const key = normalizeText(value);
    if (!key || known.has(key)) return false;
    known.add(key);
    return true;
  });
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();
}

function sameText(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
