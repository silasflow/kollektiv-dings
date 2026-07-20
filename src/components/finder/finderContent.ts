import type { Lang } from "../../data/siteContent";
import { testQuestions } from "../../data/testQuestions";
import type {
  FinderOption,
  ScopeCategory,
  StructureCategory,
  TimeCategory,
} from "./finderTypes";

export const finderText = {
  de: {
    titleLead: "Kollektive",
    titleHighlight: "finden",
    intro:
      "Durchsuche die bisher erfassten Kollektive nach Orten, Themen und Arbeitsweisen.",
    toUniverse: "Zum Kosmos",
    searchLabel: "Kollektive durchsuchen",
    searchPlaceholder: "Name, Thema oder Ort suchen …",
    filters: "Filter",
    showFilters: "Filter anzeigen",
    hideFilters: "Filter schließen",
    reset: "Zurücksetzen",
    themes: "Themenfelder",
    place: "Ort",
    placeHint: "Durchsucht Standorte und Projektorte gemeinsam.",
    allPlaces: "Alle Orte",
    noPlaceOptions: "Noch keine zugeordneten Ortsdaten",
    citiesGroup: "Städte und Orte",
    regionsGroup: "Regionen und Bundesländer",
    countriesGroup: "Länder",
    scope: "Räumliche Reichweite",
    scopeHint: "Lokal, an mehreren Orten oder international.",
    structure: "Organisationsform",
    time: "Zeitliche Form",
    orientation: "Handlungsorientierung",
    orientationHint: "Berücksichtigt Rang 1 und 2 des Rankings.",
    digitalOnly: "Nur digital oder virtuell aktive Kollektive",
    groupBy: "Gruppieren nach",
    groupNone: "Keine Gruppierung",
    groupCity: "Hauptstandort",
    groupScope: "Räumliche Reichweite",
    groupStructure: "Organisationsform",
    groupTime: "Zeitliche Form",
    groupOrientation: "Wichtigste Ausrichtung",
    activeFilters: "Aktive Filter",
    loading: "Kollektive werden geladen …",
    fallback:
      "Die Datenbank ist gerade nicht erreichbar. Es werden freigegebene lokale Ergebnisse aus diesem Browser angezeigt.",
    resultOne: "1 Kollektiv gefunden",
    resultMany: "{count} Kollektive gefunden",
    emptyTitle: "Keine passenden Kollektive gefunden",
    emptyText:
      "Entferne einzelne Filter oder formuliere die Suche etwas allgemeiner.",
    unnamed: "Unbenanntes Kollektiv",
    noLocation: "Ort nicht angegeben",
    noOrientation: "Keine Ausrichtung angegeben",
    profileStructure: "Organisation",
    profileTime: "Zeitliche Form",
    profileScope: "Räumliche Reichweite",
    profileOrientations: "Prägende Ausrichtungen",
    activeIn: "Aktiv in",
    morePlaces: "+{count} weitere",
    digital: "digital aktiv",
    website: "Website",
    instagram: "Instagram",
    showInUniverse: "Im Kosmos anzeigen",
    removeFilter: "Filter entfernen",
  },
  en: {
    titleLead: "Find",
    titleHighlight: "collectives",
    intro:
      "Search the collectives recorded so far by place, topic and ways of working.",
    toUniverse: "Open universe",
    searchLabel: "Search collectives",
    searchPlaceholder: "Search by name, topic or location …",
    filters: "Filters",
    showFilters: "Show filters",
    hideFilters: "Close filters",
    reset: "Reset",
    themes: "Topics",
    place: "Place",
    placeHint: "Searches bases and project locations together.",
    allPlaces: "All places",
    noPlaceOptions: "No assigned place data yet",
    citiesGroup: "Cities and places",
    regionsGroup: "Regions and states",
    countriesGroup: "Countries",
    scope: "Spatial reach",
    scopeHint: "Local, across several places or international.",
    structure: "Organisational form",
    time: "Temporal form",
    orientation: "Action orientation",
    orientationHint: "Uses positions 1 and 2 of the ranking.",
    digitalOnly: "Only digitally or virtually active collectives",
    groupBy: "Group by",
    groupNone: "No grouping",
    groupCity: "Primary base",
    groupScope: "Spatial reach",
    groupStructure: "Organisational form",
    groupTime: "Temporal form",
    groupOrientation: "Main orientation",
    activeFilters: "Active filters",
    loading: "Loading collectives …",
    fallback:
      "The database is currently unavailable. Published local results from this browser are shown.",
    resultOne: "1 collective found",
    resultMany: "{count} collectives found",
    emptyTitle: "No matching collectives found",
    emptyText: "Remove individual filters or broaden your search.",
    unnamed: "Unnamed collective",
    noLocation: "Location not provided",
    noOrientation: "No orientation provided",
    profileStructure: "Organisation",
    profileTime: "Temporal form",
    profileScope: "Spatial reach",
    profileOrientations: "Main orientations",
    activeIn: "Active in",
    morePlaces: "+{count} more",
    digital: "digitally active",
    website: "Website",
    instagram: "Instagram",
    showInUniverse: "Show in universe",
    removeFilter: "Remove filter",
  },
} as const;

export const structureLabels: Record<
  Lang,
  Record<StructureCategory, string>
> = {
  de: {
    informal: "eher informell",
    partial: "teilweise strukturiert",
    structured: "stark strukturiert",
  },
  en: {
    informal: "rather informal",
    partial: "partially structured",
    structured: "highly structured",
  },
};

export const timeLabels: Record<Lang, Record<TimeCategory, string>> = {
  de: {
    project: "spontan oder projektbezogen",
    recurring: "wiederkehrend",
    established: "langfristig verstetigt",
  },
  en: {
    project: "spontaneous or project-based",
    recurring: "recurring",
    established: "long-term established",
  },
};

export const scopeLabels: Record<Lang, Record<ScopeCategory, string>> = {
  de: {
    local: "lokal",
    translocal: "translokal",
    global: "global",
  },
  en: {
    local: "local",
    translocal: "translocal",
    global: "global",
  },
};

export function getTopicOptions(lang: Lang): FinderOption[] {
  const question = testQuestions.find((item) => item.id === "goalTopics");
  if (!question || question.type !== "goal-options") return [];

  return question.options.map((option) => ({
    id: option.id,
    label: option.label[lang],
  }));
}

export function getOrientationOptions(lang: Lang): FinderOption[] {
  const question = testQuestions.find((item) => item.id === "goals");
  if (!question || question.type !== "ranking") return [];

  return question.options.map((option) => ({
    id: option.id,
    label: option.label[lang],
  }));
}

export function getOptionLabel(
  options: FinderOption[],
  id: string,
  fallback = id,
): string {
  return options.find((option) => option.id === id)?.label ?? fallback;
}