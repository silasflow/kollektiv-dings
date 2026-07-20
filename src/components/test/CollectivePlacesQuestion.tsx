import { useState, type FormEvent, type ReactNode } from "react";
import type { Lang } from "../../data/siteContent";
import {
  getPlaceIdentity,
  getPlaceLabel,
  type PlaceRole,
  type PlaceSearchResult,
  type PlaceSelection,
} from "../../types/places";
import Button from "../common/Button";
import TestNavigation from "./TestNavigation";
import "./CollectivePlacesQuestion.css";

type Props = {
  lang: Lang;
  places: PlaceSelection[];
  noFixedBase: boolean;
  consent: boolean;
  isSubmitting?: boolean;
  onPlacesChange: (places: PlaceSelection[]) => void;
  onNoFixedBaseChange: (value: boolean) => void;
  onConsentChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    titleStart: "Wo seid ihr",
    titleHighlight: "verortet?",
    intro:
      "Füge nur die Orte hinzu, die ihr öffentlich zeigen möchtet. Stadt, Bezirk, Region und Land werden nach der Auswahl automatisch zugeordnet.",
    baseTitle: "Sitz oder fester Treffpunkt",
    baseHelp:
      "Wo ist euer Büro, Sitz oder regelmäßiger Treffpunkt? Mehrere Standorte sind möglich.",
    projectTitle: "Projekt- und Aktivitätsorte",
    projectHelp:
      "An welchen konkreten Orten finden eure Projekte oder Aktivitäten statt?",
    areaTitle: "Größeres Wirkungsgebiet",
    areaHelp:
      "Optional: Region, Bundesland, Land oder Kontinent, in dem ihr über einzelne Projektorte hinaus aktiv seid.",
    noFixedBase: "Wir haben keinen festen Standort.",
    copyBase: "Standorte als Aktivitätsorte übernehmen",
    copiedBase: "Die Standorte wurden übernommen.",
    consent:
      "Ich stimme zu, dass Name, ausgewählte Standorte und Wirkungsorte, Website, Instagram und Ergebnis öffentlich auf der Website angezeigt werden dürfen.",
    saving: "Wird gespeichert …",
    complete: "Test abschließen",
  },
  en: {
    titleStart: "Where are you",
    titleHighlight: "located?",
    intro:
      "Only add places you want to display publicly. City, district, region and country are assigned automatically after selection.",
    baseTitle: "Base or regular meeting place",
    baseHelp:
      "Where is your office, base or regular meeting place? You can add several locations.",
    projectTitle: "Project and activity locations",
    projectHelp:
      "At which specific places do your projects or activities happen?",
    areaTitle: "Wider area of activity",
    areaHelp:
      "Optional: region, state, country or continent where you are active beyond individual project locations.",
    noFixedBase: "We do not have a fixed base.",
    copyBase: "Use bases as activity locations",
    copiedBase: "The bases were added as activity locations.",
    consent:
      "I agree that name, selected bases and activity locations, website, Instagram and result may be shown publicly on the website.",
    saving: "Saving …",
    complete: "Complete test",
  },
} as const;

export default function CollectivePlacesQuestion({
  lang,
  places,
  noFixedBase,
  consent,
  isSubmitting = false,
  onPlacesChange,
  onNoFixedBaseChange,
  onConsentChange,
  onBack,
  onNext,
}: Props) {
  const t = text[lang];
  const [copyMessage, setCopyMessage] = useState("");

  const basePlaces = places.filter((place) => place.role === "base");

  function addPlace(result: PlaceSearchResult, role: PlaceRole) {
    const candidate: PlaceSelection = {
      ...result,
      role,
      isPrimary: role === "base" && basePlaces.length === 0,
    };

    if (
      places.some(
        (place) => getPlaceIdentity(place) === getPlaceIdentity(candidate),
      )
    ) {
      return;
    }

    onPlacesChange([...places, candidate]);

    if (role === "base" && noFixedBase) {
      onNoFixedBaseChange(false);
    }
  }

  function removePlace(target: PlaceSelection) {
    const remaining = places.filter(
      (place) => getPlaceIdentity(place) !== getPlaceIdentity(target),
    );

    if (target.role === "base" && target.isPrimary) {
      const firstBaseIndex = remaining.findIndex(
        (place) => place.role === "base",
      );
      if (firstBaseIndex >= 0) {
        remaining[firstBaseIndex] = {
          ...remaining[firstBaseIndex],
          isPrimary: true,
        };
      }
    }

    onPlacesChange(remaining);
  }

  function setPrimaryBase(target: PlaceSelection) {
    onPlacesChange(
      places.map((place) => ({
        ...place,
        isPrimary:
          place.role === "base" &&
          getPlaceIdentity(place) === getPlaceIdentity(target),
      })),
    );
  }

  function handleNoFixedBaseChange(value: boolean) {
    onNoFixedBaseChange(value);
    if (value) {
      onPlacesChange(places.filter((place) => place.role !== "base"));
    }
  }

  function copyBasesToProjects() {
    const additions = basePlaces
      .map((place) => ({
        ...place,
        role: "project" as const,
        isPrimary: false,
      }))
      .filter(
        (candidate) =>
          !places.some(
            (place) => getPlaceIdentity(place) === getPlaceIdentity(candidate),
          ),
      );

    if (additions.length > 0) {
      onPlacesChange([...places, ...additions]);
    }

    setCopyMessage(t.copiedBase);
    window.setTimeout(() => setCopyMessage(""), 2500);
  }

  return (
    <section className="test-screen places-screen">
      <div className="places-content">
        <header className="places-intro">
          <h1 className="places-title">
            <span className="heading3">{t.titleStart}</span>{" "}
            <span className="script-heading3">{t.titleHighlight}</span>
          </h1>
          <p className="paragraph">{t.intro}</p>
        </header>

        <PlaceSection
          lang={lang}
          title={t.baseTitle}
          help={t.baseHelp}
          icon="buildings"
          role="base"
          places={places}
          onAdd={addPlace}
          onRemove={removePlace}
          onSetPrimary={setPrimaryBase}
        />

        <label className="places-checkbox">
          <input
            type="checkbox"
            checked={noFixedBase}
            onChange={(event) => handleNoFixedBaseChange(event.target.checked)}
          />
          <span className="places-checkbox__box" aria-hidden="true">
            {noFixedBase && <i className="ph-bold ph-check" />}
          </span>
          <span className="paragraph">{t.noFixedBase}</span>
        </label>

        <PlaceSection
          lang={lang}
          title={t.projectTitle}
          help={t.projectHelp}
          icon="map-pin-area"
          role="project"
          places={places}
          onAdd={addPlace}
          onRemove={removePlace}
        >
          {basePlaces.length > 0 && (
            <div className="places-copy-action">
              <Button
                variant="tertiary"
                icon="copy"
                onClick={copyBasesToProjects}
              >
                {t.copyBase}
              </Button>
              {copyMessage && (
                <span className="paragraph" role="status">
                  {copyMessage}
                </span>
              )}
            </div>
          )}
        </PlaceSection>

        <PlaceSection
          lang={lang}
          title={t.areaTitle}
          help={t.areaHelp}
          icon="globe-hemisphere-west"
          role="activity_area"
          places={places}
          onAdd={addPlace}
          onRemove={removePlace}
        />

        <label className="consent-field places-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
          />
          <span className="consent-box" aria-hidden="true">
            {consent && <i className="ph-bold ph-check" />}
          </span>
          <span className="paragraph">{t.consent}</span>
        </label>
      </div>

      <TestNavigation
        lang={lang}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={isSubmitting}
        nextIcon="check"
        nextLabel={isSubmitting ? t.saving : t.complete}
      />
    </section>
  );
}

function PlaceSection({
  lang,
  title,
  help,
  icon,
  role,
  places,
  onAdd,
  onRemove,
  onSetPrimary,
  children,
}: {
  lang: Lang;
  title: string;
  help: string;
  icon: string;
  role: PlaceRole;
  places: PlaceSelection[];
  onAdd: (place: PlaceSearchResult, role: PlaceRole) => void;
  onRemove: (place: PlaceSelection) => void;
  onSetPrimary?: (place: PlaceSelection) => void;
  children?: ReactNode;
}) {
  const selectedPlaces = places.filter((place) => place.role === role);

  return (
    <section className="place-section">
      <div className="place-section__heading">
        <i className={`ph-bold ph-${icon}`} aria-hidden="true" />
        <div>
          <h2 className="heading4">{title}</h2>
          <p className="paragraph">{help}</p>
        </div>
      </div>

      {children}

      {selectedPlaces.length > 0 && (
        <ul className="selected-places">
          {selectedPlaces.map((place) => (
            <li key={getPlaceIdentity(place)}>
              <div className="selected-place__copy">
                <i className="ph-bold ph-map-pin" aria-hidden="true" />
                <div>
                  <strong className="paragraph">{getPlaceLabel(place)}</strong>
                  {place.postalCode && (
                    <span className="label">PLZ {place.postalCode}</span>
                  )}
                </div>
              </div>

              <div className="selected-place__actions">
                {role === "base" && onSetPrimary && (
                  <button
                    type="button"
                    className={place.isPrimary ? "is-primary" : ""}
                    onClick={() => onSetPrimary(place)}
                    aria-pressed={place.isPrimary}
                  >
                    <i className="ph-bold ph-star" aria-hidden="true" />
                    <span>
                      {lang === "de"
                        ? place.isPrimary
                          ? "Hauptstandort"
                          : "Als Hauptstandort"
                        : place.isPrimary
                          ? "Primary base"
                          : "Set as primary"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onRemove(place)}
                  aria-label={
                    lang === "de"
                      ? `${getPlaceLabel(place)} entfernen`
                      : `Remove ${getPlaceLabel(place)}`
                  }
                >
                  <i className="ph-bold ph-trash" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PlaceSearch lang={lang} role={role} onSelect={onAdd} />
    </section>
  );
}

function PlaceSearch({
  lang,
  role,
  onSelect,
}: {
  lang: Lang;
  role: PlaceRole;
  onSelect: (place: PlaceSearchResult, role: PlaceRole) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const placeholder =
    role === "activity_area"
      ? lang === "de"
        ? "Region, Land oder Kontinent suchen …"
        : "Search region, country or continent …"
      : lang === "de"
        ? "Ort, Stadt oder PLZ suchen …"
        : "Search place, city or postal code …";

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2 || isSearching) return;

    setIsSearching(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        `/api/place-search?q=${encodeURIComponent(trimmedQuery)}&lang=${lang}`,
      );
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok || !hasSearchResults(data)) {
        throw new Error(
          hasErrorMessage(data) ? data.error : "Could not search places",
        );
      }

      setResults(data.results);

      if (data.results.length === 0) {
        setError(
          lang === "de"
            ? "Kein passender Ort gefunden. Probiere einen allgemeineren Begriff."
            : "No matching place found. Try a broader search term.",
        );
      }
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : lang === "de"
            ? "Die Ortssuche ist gerade nicht erreichbar."
            : "Place search is currently unavailable.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function selectResult(place: PlaceSearchResult) {
    onSelect(place, role);
    setQuery("");
    setResults([]);
    setError("");
  }

  return (
    <div className="place-search">
      <form onSubmit={search} className="place-search__form">
        <label>
          <span className="sr-only">{placeholder}</span>
          <i className="ph-bold ph-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
          />
        </label>

        <Button
          variant="primary"
          icon="magnifying-glass"
          type="submit"
          disabled={isSearching || query.trim().length < 2}
        >
          {isSearching
            ? lang === "de"
              ? "Sucht …"
              : "Searching …"
            : lang === "de"
              ? "Ort suchen"
              : "Search place"}
        </Button>
      </form>

      {error && (
        <p className="place-search__error paragraph" role="status">
          <i className="ph-bold ph-warning" aria-hidden="true" />
          {error}
        </p>
      )}

      {results.length > 0 && (
        <ul className="place-search__results" aria-label={placeholder}>
          {results.map((place) => (
            <li key={`${place.provider}:${place.providerPlaceId}`}>
              <button type="button" onClick={() => selectResult(place)}>
                <i className="ph-bold ph-map-pin" aria-hidden="true" />
                <span className="paragraph">{place.displayName}</span>
                <i className="ph-bold ph-plus" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="place-search__attribution label">
        {lang === "de" ? "Ortsdaten" : "Place data"} ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap-Mitwirkende
        </a>
      </p>
    </div>
  );
}

function hasSearchResults(
  value: unknown,
): value is { results: PlaceSearchResult[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "results" in value &&
    Array.isArray((value as { results?: unknown }).results)
  );
}

function hasErrorMessage(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}
