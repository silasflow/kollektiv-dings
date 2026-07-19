import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '../../data/siteContent';
import Button from '../common/Button';
import '../common/TagList.css';
import FinderCollectiveCard from './FinderCollectiveCard';
import {
  finderText,
  getOptionLabel,
  getOrientationOptions,
  getTopicOptions,
  structureLabels,
  timeLabels,
} from './finderContent';
import FinderFilters from './FinderFilters';
import type {
  FinderFilterState,
  FinderGroupBy,
  FinderOption,
  RawTestResult,
} from './finderTypes';
import {
  countActiveFilters,
  EMPTY_FILTERS,
  filterCollectives,
  getPlaceOptions,
  groupCollectives,
  hasActiveFilters,
  normalizeTestResult,
  readPublishedLocalResults,
} from './finderUtils';
import './FinderExperience.css';

type Props = {
  lang: Lang;
};

type ActiveChip = {
  key: string;
  label: string;
  remove: () => void;
};

export default function FinderExperience({ lang }: Props) {
  const t = finderText[lang];
  const [collectives, setCollectives] = useState(
    [] as ReturnType<typeof normalizeTestResult>[]
  );
  const [filters, setFilters] = useState<FinderFilterState>({ ...EMPTY_FILTERS });
  const [groupBy, setGroupBy] = useState<FinderGroupBy>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [usesLocalFallback, setUsesLocalFallback] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const topicOptions = useMemo(() => getTopicOptions(lang), [lang]);
  const orientationOptions = useMemo(
    () => getOrientationOptions(lang),
    [lang]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadCollectives() {
      try {
        const response = await fetch('/api/test-results', {
          signal: controller.signal,
        });
        const data: unknown = await response.json().catch(() => null);

        if (!response.ok || !hasResultArray(data)) {
          throw new Error('Could not load database results');
        }

        setCollectives(
          data.results.map((result, index) => normalizeTestResult(result, index))
        );
        setUsesLocalFallback(false);
      } catch (error) {
        if (controller.signal.aborted) return;

        const localResults = readPublishedLocalResults();
        setCollectives(
          localResults.map((result, index) => normalizeTestResult(result, index))
        );
        setUsesLocalFallback(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadCollectives();

    return () => controller.abort();
  }, []);

  const cityOptions = useMemo(
    () => getPlaceOptions(collectives, 'city', lang),
    [collectives, lang]
  );

  const regionOptions = useMemo(
    () => getPlaceOptions(collectives, 'region', lang),
    [collectives, lang]
  );

  const filteredCollectives = useMemo(
    () => filterCollectives(collectives, filters, lang),
    [collectives, filters, lang]
  );

  const groups = useMemo(
    () => groupCollectives(filteredCollectives, groupBy, lang),
    [filteredCollectives, groupBy, lang]
  );

  const activeChips = createActiveChips(
    filters,
    lang,
    topicOptions,
    orientationOptions,
    setFilters
  );

  const activeFilterCount = countActiveFilters(filters);
  const resultCountText =
    filteredCollectives.length === 1
      ? t.resultOne
      : t.resultMany.replace('{count}', String(filteredCollectives.length));

  function resetFinder() {
    setFilters({ ...EMPTY_FILTERS });
    setGroupBy('none');
  }

  return (
    <main className="finder-page">
      <div className="finder-page__map" aria-hidden="true" />

      <div className="finder-page__inner">
        <section className="finder-intro">
          <div className="finder-intro__copy">
            <h1 className="finder-title">
              <span className="heading2">{t.titleLead}</span>
              <span className="script-heading2">{t.titleHighlight}</span>
            </h1>
            <p className="finder-intro__text paragraph-emphasized">{t.intro}</p>
          </div>

          <Button
            variant="secondary"
            href={`/${lang}/universe-results/`}
            icon="shooting-star"
          >
            {t.toUniverse}
          </Button>
        </section>

        <section className="finder-workspace" aria-label={t.searchLabel}>
          <div className="finder-toolbar">
            <label className="finder-search">
              <span className="sr-only">{t.searchLabel}</span>
              <i className="ph-bold ph-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={filters.query}
                placeholder={t.searchPlaceholder}
                onChange={(event) =>
                  setFilters({ ...filters, query: event.target.value })
                }
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, query: '' })}
                  aria-label={t.removeFilter}
                >
                  <i className="ph-bold ph-x" aria-hidden="true" />
                </button>
              )}
            </label>

            <label className="finder-group-select">
              <span className="label">
                <i className="ph-bold ph-stack" aria-hidden="true" />
                {t.groupBy}
              </span>
              <select
                value={groupBy}
                onChange={(event) =>
                  setGroupBy(event.target.value as FinderGroupBy)
                }
              >
                <option value="none">{t.groupNone}</option>
                <option value="city">{t.groupCity}</option>
                <option value="structure">{t.groupStructure}</option>
                <option value="time">{t.groupTime}</option>
                <option value="orientation">{t.groupOrientation}</option>
              </select>
            </label>

            <div className="finder-mobile-filter-button">
              <Button
                variant="primary"
                icon={isFilterOpen ? 'x' : 'faders'}
                onClick={() => setIsFilterOpen((value) => !value)}
              >
                {isFilterOpen ? t.hideFilters : t.showFilters}
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
            </div>
          </div>

          {(activeChips.length > 0 || filters.query) && (
            <div className="finder-active-filters">
              <p className="label">{t.activeFilters}</p>
              <div className="finder-active-filters__chips">
                {activeChips.map((chip) => (
                  <button type="button" key={chip.key} onClick={chip.remove}>
                    <span>{chip.label}</span>
                    <i className="ph-bold ph-x" aria-hidden="true" />
                    <span className="sr-only">{t.removeFilter}</span>
                  </button>
                ))}

                <Button
                  variant="tertiary"
                  icon="arrow-counter-clockwise"
                  onClick={resetFinder}
                >
                  {t.reset}
                </Button>
              </div>
            </div>
          )}

          <div className="finder-layout">
            <aside
              className={`finder-filter-panel ${isFilterOpen ? 'is-open' : ''}`}
            >
              <FinderFilters
                lang={lang}
                filters={filters}
                topicOptions={topicOptions}
                orientationOptions={orientationOptions}
                cityOptions={cityOptions}
                regionOptions={regionOptions}
                onChange={setFilters}
                onReset={resetFinder}
              />
            </aside>

            <section className="finder-results" aria-live="polite">
              <div className="finder-results__header">
                <h2 className="heading4">{resultCountText}</h2>
                {usesLocalFallback && (
                  <p className="finder-fallback paragraph">
                    <i className="ph-bold ph-warning" aria-hidden="true" />
                    {t.fallback}
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="finder-status paragraph">
                  <i className="ph-bold ph-circle-notch" aria-hidden="true" />
                  {t.loading}
                </div>
              ) : filteredCollectives.length === 0 ? (
                <div className="finder-empty">
                  <i className="ph-bold ph-magnifying-glass" aria-hidden="true" />
                  <h3 className="heading4">{t.emptyTitle}</h3>
                  <p className="paragraph">{t.emptyText}</p>
                  {hasActiveFilters(filters) && (
                    <Button
                      variant="primary"
                      icon="arrow-counter-clockwise"
                      onClick={resetFinder}
                    >
                      {t.reset}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="finder-groups">
                  {groups.map((group) => (
                    <section className="finder-group" key={group.key}>
                      {group.label && (
                        <div className="finder-group__header">
                          <h3 className="heading4">{group.label}</h3>
                          <span className="label">{group.collectives.length}</span>
                        </div>
                      )}

                      <div className="finder-card-grid">
                        {group.collectives.map((collective) => (
                          <FinderCollectiveCard
                            key={collective.id}
                            lang={lang}
                            collective={collective}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function createActiveChips(
  filters: FinderFilterState,
  lang: Lang,
  topicOptions: FinderOption[],
  orientationOptions: FinderOption[],
  setFilters: (filters: FinderFilterState) => void
): ActiveChip[] {
  const t = finderText[lang];
  const chips: ActiveChip[] = [];

  filters.topics.forEach((topic) => {
    chips.push({
      key: `topic-${topic}`,
      label: getOptionLabel(topicOptions, topic),
      remove: () =>
        setFilters({
          ...filters,
          topics: filters.topics.filter((item) => item !== topic),
        }),
    });
  });

  if (filters.city) {
    chips.push({
      key: 'city',
      label: filters.city,
      remove: () => setFilters({ ...filters, city: '' }),
    });
  }

  if (filters.region) {
    chips.push({
      key: 'region',
      label: filters.region,
      remove: () => setFilters({ ...filters, region: '' }),
    });
  }

  filters.structures.forEach((structure) => {
    chips.push({
      key: `structure-${structure}`,
      label: structureLabels[lang][structure],
      remove: () =>
        setFilters({
          ...filters,
          structures: filters.structures.filter((item) => item !== structure),
        }),
    });
  });

  filters.times.forEach((time) => {
    chips.push({
      key: `time-${time}`,
      label: timeLabels[lang][time],
      remove: () =>
        setFilters({
          ...filters,
          times: filters.times.filter((item) => item !== time),
        }),
    });
  });

  filters.orientations.forEach((orientation) => {
    chips.push({
      key: `orientation-${orientation}`,
      label: getOptionLabel(orientationOptions, orientation),
      remove: () =>
        setFilters({
          ...filters,
          orientations: filters.orientations.filter(
            (item) => item !== orientation
          ),
        }),
    });
  });

  if (filters.digitalOnly) {
    chips.push({
      key: 'digital',
      label: t.digital,
      remove: () => setFilters({ ...filters, digitalOnly: false }),
    });
  }

  return chips;
}

function hasResultArray(
  value: unknown
): value is { results: RawTestResult[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'results' in value &&
    Array.isArray((value as { results?: unknown }).results)
  );
}
