import type { Lang } from '../../data/siteContent';
import {
  finderText,
  getOptionLabel,
  getOrientationOptions,
  getTopicOptions,
  structureLabels,
  timeLabels,
} from './finderContent';
import type {
  FinderCollective,
  FinderFilterState,
  FinderGroup,
  FinderGroupBy,
  RawTestResult,
  StructureCategory,
  TimeCategory,
} from './finderTypes';

const LOCAL_RESULTS_KEY = 'stadt-kollektiv-local-results';

const DEFAULT_RANKING = [
  'political',
  'economic',
  'creative',
  'social',
  'ecological',
];

export const EMPTY_FILTERS: FinderFilterState = {
  query: '',
  topics: [],
  city: '',
  region: '',
  structures: [],
  times: [],
  orientations: [],
  digitalOnly: false,
};

export function normalizeTestResult(
  raw: RawTestResult,
  fallbackIndex: number
): FinderCollective {
  const answers = raw.answers ?? {};
  const result = raw.result ?? {};

  const values = {
    formalization: firstNumber(
      answers.formalization,
      result.values?.formalization,
      result.networkShape?.formalization,
      50
    ),
    time: firstNumber(
      answers.time,
      result.values?.time,
      result.networkShape?.time,
      50
    ),
    identity: firstNumber(
      answers.identity,
      result.values?.identity,
      result.networkShape?.identity,
      50
    ),
    space: firstNumber(
      answers.space,
      result.values?.space,
      result.networkShape?.space,
      50
    ),
  };

  const ranking = firstNonEmptyArray(
    answers.goals,
    result.graphic?.rankingOrder,
    result.networkShape?.goalRanking,
    result.selectedAnswerIds?.goalRanking,
    DEFAULT_RANKING
  );

  const topics = firstArray(
    answers.goalTopics,
    result.goalDetails?.selectedGoalTopics
  );

  const customTopics = firstArray(
    answers.goalTopicsOther,
    result.goalDetails?.ownGoalTopics
  )
    .map((topic) => topic.trim())
    .filter(Boolean);

  const legacyContact = splitLegacyContact(
    raw.websiteOrInstagram?.trim() ?? ''
  );

  return {
    id: raw.id?.trim() || `local-result-${fallbackIndex}`,
    createdAt: raw.createdAt ?? '',
    collectiveName: raw.collectiveName?.trim() ?? '',
    website: raw.website?.trim() || legacyContact.website || null,
    instagram: raw.instagram?.trim() || legacyContact.instagram || null,
    city: raw.location?.trim() ?? '',
    region: raw.region?.trim() ?? '',
    country: raw.country?.trim() ?? '',
    topics,
    customTopics,
    ranking,
    values,
    actsVirtually: firstBoolean(
      answers.actsVirtually,
      result.networkShape?.actsVirtually,
      result.selectedAnswerIds?.actsVirtually,
      false
    ),
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
        isObject(item) && item.consentPublic === true
    );
  } catch {
    return [];
  }
}

export function filterCollectives(
  collectives: FinderCollective[],
  filters: FinderFilterState,
  lang: Lang
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

    if (filters.city && !sameText(collective.city, filters.city)) return false;
    if (filters.region && !sameText(collective.region, filters.region)) return false;

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
      const hasOrientation = filters.orientations.some((orientation) =>
        leadingOrientations.includes(orientation)
      );

      if (!hasOrientation) return false;
    }

    if (filters.digitalOnly && !collective.actsVirtually) return false;

    if (queryTerms.length > 0) {
      const searchableText = normalizeText(
        [
          collective.collectiveName,
          collective.city,
          collective.region,
          collective.country,
          ...collective.topics.map((topic) =>
            getOptionLabel(topicOptions, topic)
          ),
          ...collective.customTopics,
          ...collective.ranking.map((orientation) =>
            getOptionLabel(orientationOptions, orientation)
          ),
        ].join(' ')
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
  lang: Lang
): FinderGroup[] {
  const t = finderText[lang];
  const orientationOptions = getOrientationOptions(lang);
  const sortedCollectives = sortCollectives(collectives, lang);

  if (groupBy === 'none') {
    return [
      {
        key: 'all',
        label: '',
        collectives: sortedCollectives,
      },
    ];
  }

  const groups = new Map<string, FinderGroup>();

  sortedCollectives.forEach((collective) => {
    let key = '';
    let label = '';

    if (groupBy === 'city') {
      key = normalizeText(collective.city) || 'unknown-location';
      label = collective.city || t.noLocation;
    } else if (groupBy === 'structure') {
      key = collective.structure;
      label = structureLabels[lang][collective.structure];
    } else if (groupBy === 'time') {
      key = collective.timeCategory;
      label = timeLabels[lang][collective.timeCategory];
    } else {
      const orientation = collective.ranking[0];
      key = orientation || 'unknown-orientation';
      label = orientation
        ? getOptionLabel(orientationOptions, orientation)
        : t.noOrientation;
    }

    const group = groups.get(key) ?? { key, label, collectives: [] };
    group.collectives.push(collective);
    groups.set(key, group);
  });

  const groupList = Array.from(groups.values());

  if (groupBy === 'structure') {
    return sortGroupsByOrder(groupList, ['informal', 'partial', 'structured']);
  }

  if (groupBy === 'time') {
    return sortGroupsByOrder(groupList, ['project', 'recurring', 'established']);
  }

  if (groupBy === 'orientation') {
    return sortGroupsByOrder(groupList, [
      ...orientationOptions.map((option) => option.id),
      'unknown-orientation',
    ]);
  }

  return groupList.sort((a, b) => a.label.localeCompare(b.label, lang));
}

export function getPlaceOptions(
  collectives: FinderCollective[],
  field: 'city' | 'region',
  lang: Lang
): string[] {
  const values = new Map<string, string>();

  collectives.forEach((collective) => {
    const value = collective[field].trim();
    if (!value) return;

    const key = normalizeText(value);
    if (!values.has(key)) values.set(key, value);
  });

  return Array.from(values.values()).sort((a, b) => a.localeCompare(b, lang));
}

export function getLocationLabel(collective: FinderCollective): string {
  const parts = [collective.city, collective.region, collective.country]
    .map((part) => part.trim())
    .filter(Boolean);

  const unique = parts.filter(
    (part, index) =>
      parts.findIndex((candidate) => sameText(candidate, part)) === index
  );

  return unique.join(', ');
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

  const handle = trimmed.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
  return `https://instagram.com/${handle}`;
}

export function getStructureCategory(value: number): StructureCategory {
  if (value <= 33) return 'informal';
  if (value <= 66) return 'partial';
  return 'structured';
}

export function getTimeCategory(value: number): TimeCategory {
  if (value <= 33) return 'project';
  if (value <= 66) return 'recurring';
  return 'established';
}

export function hasActiveFilters(filters: FinderFilterState): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.topics.length > 0 ||
    Boolean(filters.city) ||
    Boolean(filters.region) ||
    filters.structures.length > 0 ||
    filters.times.length > 0 ||
    filters.orientations.length > 0 ||
    filters.digitalOnly
  );
}

export function countActiveFilters(filters: FinderFilterState): number {
  return (
    filters.topics.length +
    filters.structures.length +
    filters.times.length +
    filters.orientations.length +
    Number(Boolean(filters.city)) +
    Number(Boolean(filters.region)) +
    Number(filters.digitalOnly)
  );
}

function firstNumber(...values: unknown[]): number {
  const match = values.find(
    (value) => typeof value === 'number' && Number.isFinite(value)
  );

  return typeof match === 'number' ? clamp(match, 0, 100) : 50;
}

function splitLegacyContact(value: string): {
  website: string;
  instagram: string;
} {
  const trimmed = value.trim();
  const isInstagram =
    trimmed.startsWith('@') || /instagram\.com/i.test(trimmed);

  return isInstagram
    ? { website: '', instagram: trimmed }
    : { website: trimmed, instagram: '' };
}

function firstBoolean(...values: unknown[]): boolean {
  const match = values.find((value) => typeof value === 'boolean');
  return typeof match === 'boolean' ? match : false;
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
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function sortCollectives(
  collectives: FinderCollective[],
  lang: Lang
): FinderCollective[] {
  return [...collectives].sort((a, b) =>
    (a.collectiveName || a.city).localeCompare(
      b.collectiveName || b.city,
      lang
    )
  );
}

function sortGroupsByOrder(
  groups: FinderGroup[],
  order: string[]
): FinderGroup[] {
  return groups.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();
}

function sameText(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}