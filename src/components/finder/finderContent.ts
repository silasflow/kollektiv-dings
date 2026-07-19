import type { Lang } from '../../data/siteContent';
import { testQuestions } from '../../data/testQuestions';
import type {
  FinderOption,
  StructureCategory,
  TimeCategory,
} from './finderTypes';

export const finderText = {
  de: {
    titleLead: 'Kollektive',
    titleHighlight: 'finden',
    intro:
      'Durchsuche die bisher erfassten Kollektive nach Themen, Orten und Arbeitsweisen. Die Filter helfen bei der gezielten Suche; im Kosmos kannst du die Ergebnisse anschließend wieder spielerisch erkunden.',
    toUniverse: 'Zum Kosmos',
    searchLabel: 'Kollektive durchsuchen',
    searchPlaceholder: 'Name, Thema oder Ort suchen …',
    filters: 'Filter',
    showFilters: 'Filter anzeigen',
    hideFilters: 'Filter schließen',
    reset: 'Alles zurücksetzen',
    themes: 'Themenfelder',
    city: 'Stadt oder Ort',
    allCities: 'Alle Städte und Orte',
    region: 'Region',
    allRegions: 'Alle Regionen',
    structure: 'Organisationsform',
    time: 'Zeitliche Form',
    orientation: 'Handlungsorientierung',
    orientationHint: 'Berücksichtigt Rang 1 und 2 des Rankings.',
    digitalOnly: 'Nur digital oder virtuell aktive Kollektive',
    groupBy: 'Gruppieren nach',
    groupNone: 'Keine Gruppierung',
    groupCity: 'Stadt oder Ort',
    groupStructure: 'Organisationsform',
    groupTime: 'Zeitliche Form',
    groupOrientation: 'Wichtigste Ausrichtung',
    activeFilters: 'Aktive Filter',
    loading: 'Kollektive werden geladen …',
    fallback:
      'Die Datenbank ist gerade nicht erreichbar. Es werden freigegebene lokale Ergebnisse aus diesem Browser angezeigt.',
    resultOne: '1 Kollektiv gefunden',
    resultMany: '{count} Kollektive gefunden',
    emptyTitle: 'Keine passenden Kollektive gefunden',
    emptyText:
      'Entferne einzelne Filter oder formuliere die Suche etwas allgemeiner.',
    unnamed: 'Unbenanntes Kollektiv',
    noLocation: 'Ort nicht angegeben',
    noOrientation: 'Keine Ausrichtung angegeben',
    profileStructure: 'Organisation',
    profileTime: 'Zeitliche Form',
    profileOrientations: 'Prägende Ausrichtungen',
    digital: 'digital aktiv',
    website: 'Website',
    instagram: 'Instagram',
    showInUniverse: 'Im Kosmos anzeigen',
    removeFilter: 'Filter entfernen',
  },
  en: {
    titleLead: 'Find',
    titleHighlight: 'collectives',
    intro:
      'Search the collectives recorded so far by topics, locations and ways of working. Filters support a targeted search; the universe offers a playful way to explore the results.',
    toUniverse: 'Open universe',
    searchLabel: 'Search collectives',
    searchPlaceholder: 'Search by name, topic or location …',
    filters: 'Filters',
    showFilters: 'Show filters',
    hideFilters: 'Close filters',
    reset: 'Reset all',
    themes: 'Topics',
    city: 'City or place',
    allCities: 'All cities and places',
    region: 'Region',
    allRegions: 'All regions',
    structure: 'Organisational form',
    time: 'Temporal form',
    orientation: 'Action orientation',
    orientationHint: 'Uses positions 1 and 2 of the ranking.',
    digitalOnly: 'Only digitally or virtually active collectives',
    groupBy: 'Group by',
    groupNone: 'No grouping',
    groupCity: 'City or place',
    groupStructure: 'Organisational form',
    groupTime: 'Temporal form',
    groupOrientation: 'Main orientation',
    activeFilters: 'Active filters',
    loading: 'Loading collectives …',
    fallback:
      'The database is currently unavailable. Published local results from this browser are shown.',
    resultOne: '1 collective found',
    resultMany: '{count} collectives found',
    emptyTitle: 'No matching collectives found',
    emptyText: 'Remove individual filters or broaden your search.',
    unnamed: 'Unnamed collective',
    noLocation: 'Location not provided',
    noOrientation: 'No orientation provided',
    profileStructure: 'Organisation',
    profileTime: 'Temporal form',
    profileOrientations: 'Main orientations',
    digital: 'digitally active',
    website: 'Website',
    instagram: 'Instagram',
    showInUniverse: 'Show in universe',
    removeFilter: 'Remove filter',
  },
} as const;

export const structureLabels: Record<
  Lang,
  Record<StructureCategory, string>
> = {
  de: {
    informal: 'eher informell',
    partial: 'teilweise strukturiert',
    structured: 'stark strukturiert',
  },
  en: {
    informal: 'rather informal',
    partial: 'partially structured',
    structured: 'highly structured',
  },
};

export const timeLabels: Record<Lang, Record<TimeCategory, string>> = {
  de: {
    project: 'spontan oder projektbezogen',
    recurring: 'wiederkehrend',
    established: 'langfristig verstetigt',
  },
  en: {
    project: 'spontaneous or project-based',
    recurring: 'recurring',
    established: 'long-term established',
  },
};

export function getTopicOptions(lang: Lang): FinderOption[] {
  const question = testQuestions.find((item) => item.id === 'goalTopics');

  if (!question || question.type !== 'goal-options') return [];

  return question.options.map((option) => ({
    id: option.id,
    label: option.label[lang],
  }));
}

export function getOrientationOptions(lang: Lang): FinderOption[] {
  const question = testQuestions.find((item) => item.id === 'goals');

  if (!question || question.type !== 'ranking') return [];

  return question.options.map((option) => ({
    id: option.id,
    label: option.label[lang],
  }));
}

export function getOptionLabel(
  options: FinderOption[],
  id: string,
  fallback = id
): string {
  return options.find((option) => option.id === id)?.label ?? fallback;
}