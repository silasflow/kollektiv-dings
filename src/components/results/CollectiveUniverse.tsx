import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '../../data/siteContent';
import './CollectiveUniverse.css';

type CollectiveUniverseProps = {
  lang: Lang;
};

type ResultValues = {
  formalization?: number;
  time?: number;
  identity?: number;
  space?: number;
};

type TestResult = {
  id: string;
  createdAt: string;
  lang: Lang;
  collectiveName: string | null;
  websiteOrInstagram: string | null;
  location: string | null;
  answers: Record<string, unknown>;
  result: {
    values?: ResultValues;
    networkShape?: ResultValues & {
      actsVirtually?: boolean;
      goalRanking?: string[];
    };
    goalDetails?: {
      selectedGoalTopics?: string[];
      ownGoalTopics?: string[];
    };
    selectedAnswerIds?: {
      goalRanking?: string[];
    };
  };
};

type PositionedResult = TestResult & {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  isHighlighted: boolean;
};

const text = {
  de: {
    loading: 'Ergebnisse werden geladen …',
    error: 'Die Ergebnisse konnten gerade nicht geladen werden.',
    title: 'Ergebnis-Kosmos',
    subtitle:
      'Jedes Netz steht für ein Kollektiv. Bewege dich durch die Ergebnisse und klicke auf ein Netz, um mehr zu erfahren.',
    ownResult: 'Dein Ergebnis',
    collective: 'Kollektiv',
    location: 'Standort',
    contact: 'Kontakt',
    fields: 'Handlungsfelder & Ziele',
    noName: 'Unbenanntes Kollektiv',
    noData: 'Keine Angabe',
    close: 'Schließen',
  },
  en: {
    loading: 'Loading results …',
    error: 'The results could not be loaded right now.',
    title: 'Result universe',
    subtitle:
      'Each network represents one collective. Move through the results and click a network to learn more.',
    ownResult: 'Your result',
    collective: 'Collective',
    location: 'Location',
    contact: 'Contact',
    fields: 'Fields of action & goals',
    noName: 'Unnamed collective',
    noData: 'No information',
    close: 'Close',
  },
} as const;

const goalLabels = {
  de: {
    climate: 'Klima',
    meeting: 'Begegnung',
    sport: 'Sport',
    political: 'Politisch',
    equality: 'Gleichberechtigung',
    health: 'Gesundheit',
    economic: 'Ökonomisch',
    creative: 'Kreativ',
    social: 'Sozial',
    ecological: 'Ökologisch',
    conflict: 'Konfliktorientiert',
  },
  en: {
    climate: 'Climate',
    meeting: 'Encounter',
    sport: 'Sport',
    political: 'Political',
    equality: 'Equality',
    health: 'Health',
    economic: 'Economic',
    creative: 'Creative',
    social: 'Social',
    ecological: 'Ecological',
    conflict: 'Conflict-oriented',
  },
} as const;

export default function CollectiveUniverse({ lang }: CollectiveUniverseProps) {
  const t = text[lang];

  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHighlightId(params.get('highlight'));
  }, []);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch('/api/test-results');

        if (!response.ok) {
          throw new Error('Could not load results');
        }

        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, []);

  const positionedResults = useMemo<PositionedResult[]>(() => {
    return results.map((result, index) => {
      const angle = index * 137.508;
      const radius = 18 + ((index * 11) % 34);

      const x = 50 + Math.cos((angle * Math.PI) / 180) * radius;
      const y = 52 + Math.sin((angle * Math.PI) / 180) * radius;

      return {
        ...result,
        x: clamp(x, 8, 92),
        y: clamp(y, 14, 88),
        size: 7 + ((index * 3) % 7),
        delay: (index % 8) * -0.7,
        duration: 7 + (index % 5),
        isHighlighted: Boolean(highlightId && result.id === highlightId),
      };
    });
  }, [results, highlightId]);

  if (isLoading) {
    return (
      <main className="collective-universe">
        <div className="universe-status paragraph">{t.loading}</div>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="collective-universe">
        <div className="universe-status paragraph">{t.error}</div>
      </main>
    );
  }

  return (
    <main className="collective-universe">
      <div className="universe-stars" aria-hidden="true" />

      <section className="universe-intro">
        <p className="script-heading4">{t.title}</p>
        <h1 className="heading2">Kollektive im Raum</h1>
        <p className="paragraph">{t.subtitle}</p>
      </section>

      <section className="universe-field" aria-label={t.title}>
        {positionedResults.map((result) => (
          <button
            key={result.id}
            className={`universe-network ${result.isHighlighted ? 'is-highlighted' : ''}`}
            type="button"
            style={{
              left: `${result.x}%`,
              top: `${result.y}%`,
              width: `${result.size}rem`,
              height: `${result.size}rem`,
              animationDelay: `${result.delay}s`,
              animationDuration: `${result.duration}s`,
            }}
            onClick={() => setSelectedResult(result)}
            aria-label={result.collectiveName ?? t.noName}
          >
            <NetworkSvg result={result} />
          </button>
        ))}
      </section>

      {selectedResult && (
        <ResultPopup
          lang={lang}
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </main>
  );
}

function NetworkSvg({ result }: { result: TestResult }) {
  const values = result.result.networkShape ?? result.result.values ?? {};

  const top = valueToPoint(values.time ?? 50, 'top');
  const right = valueToPoint(values.space ?? 50, 'right');
  const bottom = valueToPoint(values.identity ?? 50, 'bottom');
  const left = valueToPoint(values.formalization ?? 50, 'left');

  const points = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;

  return (
    <svg viewBox="0 0 100 100" className="network-svg" aria-hidden="true">
      <line x1="50" y1="8" x2="50" y2="92" className="network-axis" />
      <line x1="8" y1="50" x2="92" y2="50" className="network-axis" />

      <polygon points={points} className="network-shape" />

      <NetworkCross x={top.x} y={top.y} />
      <NetworkCross x={right.x} y={right.y} />
      <NetworkCross x={bottom.x} y={bottom.y} />
      <NetworkCross x={left.x} y={left.y} />
    </svg>
  );
}

function NetworkCross({ x, y }: { x: number; y: number }) {
  return (
    <g className="network-cross" transform={`translate(${x} ${y})`}>
      <line x1="-5" y1="-5" x2="5" y2="5" />
      <line x1="-5" y1="5" x2="5" y2="-5" />
    </g>
  );
}

function ResultPopup({
  lang,
  result,
  onClose,
}: {
  lang: Lang;
  result: TestResult;
  onClose: () => void;
}) {
  const t = text[lang];

  const fields = getGoalFields(lang, result);

  return (
    <aside className="result-popup" role="dialog" aria-modal="true">
      <button className="result-popup__close" type="button" onClick={onClose}>
        <span className="sr-only">{t.close}</span>
        <i className="ph-bold ph-x" aria-hidden="true" />
      </button>

      <div className="result-popup__graphic">
        <NetworkSvg result={result} />
      </div>

      <div className="result-popup__content">
        <p className="result-popup__kicker script-heading4">{t.collective}</p>

        <h2 className="heading4">
          {result.collectiveName?.trim() || t.noName}
        </h2>

        <dl className="result-popup__meta">
          <div>
            <dt className="label">{t.location}</dt>
            <dd>{result.location?.trim() || t.noData}</dd>
          </div>

          <div>
            <dt className="label">{t.contact}</dt>
            <dd>
              {result.websiteOrInstagram?.trim() ? (
                <a href={normalizeUrl(result.websiteOrInstagram)} target="_blank" rel="noreferrer">
                  {result.websiteOrInstagram}
                </a>
              ) : (
                t.noData
              )}
            </dd>
          </div>
        </dl>

        <div className="result-popup__fields">
          <h3>{t.fields}</h3>

          {fields.length > 0 ? (
            <ul>
              {fields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : (
            <p>{t.noData}</p>
          )}
        </div>
      </div>
    </aside>
  );
}

function getGoalFields(lang: Lang, result: TestResult): string[] {
  const selected =
    result.result.goalDetails?.selectedGoalTopics ??
    getStringArray(result.answers.goalTopics);

  const own =
    result.result.goalDetails?.ownGoalTopics ??
    getStringArray(result.answers.goalTopicsOther);

  const labels = goalLabels[lang] as Record<string, string>;

  return [
    ...selected.map((id) => labels[id] ?? id),
    ...own,
  ].filter(Boolean);
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function valueToPoint(value: number, direction: 'top' | 'right' | 'bottom' | 'left') {
  const normalized = clamp(value, 0, 100) / 100;
  const min = 18;
  const max = 43;
  const distance = min + normalized * (max - min);

  if (direction === 'top') return { x: 50, y: 50 - distance };
  if (direction === 'right') return { x: 50 + distance, y: 50 };
  if (direction === 'bottom') return { x: 50, y: 50 + distance };
  return { x: 50 - distance, y: 50 };
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('@')) {
    return `https://instagram.com/${trimmed.slice(1)}`;
  }

  return `https://${trimmed}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}