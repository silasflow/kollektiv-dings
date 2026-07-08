import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Lang } from '../../data/siteContent';
import './UniverseResultsExperience.css';

type Props = {
  lang: Lang;
};

type NetworkValues = {
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
  consentPublic?: boolean;
  answers: Record<string, unknown>;
  result: {
    archetypeId?: string;
    values?: NetworkValues;
    networkShape?: NetworkValues & {
      actsVirtually?: boolean;
      goalRanking?: string[];
    };
    selectedAnswerIds?: {
      goalRanking?: string[];
      primaryGoal?: string;
    };
    goalDetails?: {
      selectedGoalTopics?: string[];
      ownGoalTopics?: string[];
    };
    graphic?: {
      rankingOrder?: string[];
      fillSource?: string;
      polygonSource?: string;
    };
  };
};

type PositionedResult = TestResult & {
  x: number;
  y: number;
  size: number;
  rotation: number;
  floatDelay: number;
  appearDelay: number;
  isOwn: boolean;
};

const LOCAL_RESULTS_KEY = 'stadt-kollektiv-local-results';

const text = {
  de: {
    loading: 'Ergebnisse werden geladen …',
    empty: 'Noch keine Ergebnisse gefunden.',
    fallback:
      'Keine Datenbankverbindung. Es werden lokale Ergebnisse aus diesem Browser angezeigt.',
    title: 'Ergebnis-Kosmos',
    headline: 'Kollektive im Raum',
    subtitle:
      'Jedes Netz steht für ein Kollektiv. Klicke ein Netz an, um Details zu sehen.',
    own: 'Dein Ergebnis',
    collective: 'Kollektiv',
    type: 'Typ',
    location: 'Standort',
    contact: 'Kontakt',
    fields: 'Handlungsfelder & Ziele',
    ranking: 'Methoden',
    noName: 'Unbenanntes Kollektiv',
    noData: 'Keine Angabe',
    close: 'Schließen',
  },
  en: {
    loading: 'Loading results …',
    empty: 'No results found yet.',
    fallback:
      'No database connection. Local results from this browser are shown.',
    title: 'Result universe',
    headline: 'Collectives in space',
    subtitle:
      'Each network represents one collective. Click a network to see details.',
    own: 'Your result',
    collective: 'Collective',
    type: 'Type',
    location: 'Location',
    contact: 'Contact',
    fields: 'Fields of action & goals',
    ranking: 'Methods',
    noName: 'Unnamed collective',
    noData: 'No information',
    close: 'Close',
  },
} as const;

const archetypeLabels = {
  de: {
    spontaneous_collective: 'spontanes Kollektiv',
    structured_collective: 'strukturiertes Kollektiv',
    decentral_collective: 'dezentrales Kollektiv',
    networked_collective: 'vernetztes Kollektiv',
    activist_collective: 'aktivistisches Kollektiv',
    hybrid_collective: 'hybrides Kollektiv',
  },
  en: {
    spontaneous_collective: 'spontaneous collective',
    structured_collective: 'structured collective',
    decentral_collective: 'decentral collective',
    networked_collective: 'networked collective',
    activist_collective: 'activist collective',
    hybrid_collective: 'hybrid collective',
  },
} as const;

const goalLabels = {
  de: {
  political_topic: 'Politisch',
  encounter: 'Begegnung',
  climate: 'Klima',
  sport: 'Sport',
  equality: 'Gleichberechtigung',
  health: 'Gesundheit',

  political: 'Politisch',
  economic: 'Ökonomisch',
  creative: 'Kreativ',
  social: 'Sozial',
  ecological: 'Ökologisch',
  conflict: 'Konfliktorientiert',
},
en: {
  political_topic: 'Political',
  encounter: 'Encounter',
  climate: 'Climate',
  sport: 'Sport',
  equality: 'Equality',
  health: 'Health',

  political: 'Political',
  economic: 'Economic',
  creative: 'Creative',
  social: 'Social',
  ecological: 'Ecological',
  conflict: 'Conflict-oriented',
},
} as const;

const rankingColors: Record<string, string> = {
  political: '#7F63E6',
  economic: '#CAFBE4',
  creative: '#CBFF68',
  social: '#FFB6D5',
  ecological: '#75D49B',
  climate: '#CBFF68',
  meeting: '#CAFBE4',
  sport: '#9AE7FF',
  equality: '#FFB6D5',
  health: '#A7F0BA',
};


export default function UniverseResultsExperience({ lang }: Props) {
  const t = text[lang];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
const [pan, setPan] = useState({ x: 0, y: 0 });
const [isPanning, setIsPanning] = useState(false);
const panStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usesLocalFallback, setUsesLocalFallback] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHighlightId(params.get('highlight'));
  }, []);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch('/api/test-results');
        const data = await response.json().catch(() => null);

        if (!response.ok || !Array.isArray(data?.results)) {
          throw new Error('No database results');
        }

        setResults(data.results);
        setUsesLocalFallback(false);
      } catch {
        const localResults = readLocalResults();
        setResults(localResults);
        setUsesLocalFallback(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, []);

  const positionedResults = useMemo<PositionedResult[]>(() => {
  const positioned: PositionedResult[] = [];

  results.forEach((result, index) => {
    const hash = hashString(result.id || `${index}`);
    let angle = (hash % 360) * (Math.PI / 180);
    let ring = 16 + (hash % 38);

    const isOwn =
      Boolean(highlightId && result.id === highlightId) ||
      (!highlightId && index === 0);

    let x = 50 + Math.cos(angle) * ring;
    let y = 51 + Math.sin(angle) * ring;

    for (let attempt = 0; attempt < 24; attempt += 1) {
      const tooClose = positioned.some((item) => {
        const dx = item.x - x;
        const dy = item.y - y;

        return Math.hypot(dx, dy) < 8;
      });

      if (!tooClose) break;

      angle += 0.7;
      ring += 2.2;

      x = 50 + Math.cos(angle) * ring;
      y = 51 + Math.sin(angle) * ring;
    }

    positioned.push({
      ...result,
      x: clamp(x, 7, 93),
      y: clamp(y, 12, 88),
      size: isOwn ? 8.8 : 5.2,
      rotation: 0,
      floatDelay: -((hash % 100) / 20),
      appearDelay: isOwn ? 0 : 1.6 + (index % 24) * 0.045,
      isOwn,
    });
  });

  return positioned;
}, [results, highlightId]);

  useUniverseCanvas(canvasRef, positionedResults);

  if (isLoading) {
    return (
      <main className="universe-results-experience">
        <canvas ref={canvasRef} className="universe-canvas" aria-hidden="true" />
        <div className="universe-loading paragraph">{t.loading}</div>
      </main>
    );
  }

  return (
    <main className="universe-results-experience">
      <canvas ref={canvasRef} className="universe-canvas" aria-hidden="true" />

      <div className="universe-nebula universe-nebula--one" aria-hidden="true" />
      <div className="universe-nebula universe-nebula--two" aria-hidden="true" />

      <section className="universe-copy">
        <p className="script-heading4">{t.title}</p>
        <h1 className="heading2">{t.headline}</h1>
        <p className="paragraph">{t.subtitle}</p>

        {usesLocalFallback && (
          <p className="universe-fallback-note paragraph">{t.fallback}</p>
        )}

        {results.length === 0 && (
          <p className="universe-fallback-note paragraph">{t.empty}</p>
        )}
      </section>

      <section
  className={`universe-stage ${isPanning ? 'is-panning' : ''}`}
  aria-label={t.title}
  onWheel={(event) => {
    event.preventDefault();

    const zoomDirection = event.deltaY > 0 ? -0.12 : 0.12;
    setZoom((value) => clamp(value + zoomDirection, 0.7, 3.5));
  }}
  onPointerDown={(event) => {
    if ((event.target as HTMLElement).closest('.universe-node')) return;

    setIsPanning(true);
    panStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }}
  onPointerMove={(event) => {
    if (!isPanning) return;

    const deltaX = event.clientX - panStartRef.current.pointerX;
    const deltaY = event.clientY - panStartRef.current.pointerY;

    setPan({
      x: panStartRef.current.panX + deltaX,
      y: panStartRef.current.panY + deltaY,
    });
  }}
  onPointerUp={(event) => {
    setIsPanning(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }}
  onPointerCancel={() => {
    setIsPanning(false);
  }}
>
  <div
    className="universe-camera"
    style={
      {
        '--universe-zoom': zoom,
        '--universe-pan-x': `${pan.x}px`,
        '--universe-pan-y': `${pan.y}px`,
      } as CSSProperties
    }
  >
    {positionedResults.map((result) => (
      <button
        key={result.id}
        className={`universe-node ${result.isOwn ? 'is-own' : ''} ${
  selectedResult?.id === result.id ? 'is-selected' : ''
}`}
        type="button"
        style={
          {
            '--x': `${result.x}%`,
            '--y': `${result.y}%`,
            '--size': `${result.size}vmin`,
            '--rotation': `${result.rotation}deg`,
            '--float-delay': `${result.floatDelay}s`,
            '--appear-delay': `${result.appearDelay}s`,
          } as CSSProperties
        }
        onClick={() => setSelectedResult(result)}
        aria-label={result.collectiveName?.trim() || t.noName}
      >
        <NetworkSvg result={result} variant={result.isOwn ? 'own' : 'normal'} />
      </button>
    ))}
  </div>
</section>

<div className="universe-zoom-control" aria-label="Zoom">
  <button
    type="button"
    onClick={() => setZoom((value) => clamp(value - 0.2, 0.7, 3.5))}
  >
    −
  </button>

  <input
    type="range"
    min="0.7"
    max="3.5"
    step="0.1"
    value={zoom}
    onChange={(event) => setZoom(Number(event.target.value))}
    aria-label="Zoom"
  />

  <button
    type="button"
    onClick={() => setZoom((value) => clamp(value + 0.2, 0.7, 3.5))}
  >
    +
  </button>

  <button
    type="button"
    onClick={() => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }}
  >
    Reset
  </button>
</div>

      {selectedResult && (
        <ResultInspector
          lang={lang}
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </main>
  );
}

function NetworkSvg({
  result,
  variant = 'normal',
}: {
  result: TestResult;
  variant?: 'normal' | 'own';
}) {
  const values = getNetworkValues(result);
  const ranking = getRankingOrder(result);
  const gradientId = `network-gradient-${safeId(result.id)}`;

  const top = valueToPoint(values.time ?? 50, 'top');
  const right = valueToPoint(values.space ?? 50, 'right');
  const bottom = valueToPoint(values.identity ?? 50, 'bottom');
  const left = valueToPoint(values.formalization ?? 50, 'left');

  const points = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;
  const colors = getGradientColors(ranking);

  return (
    <svg className="universe-network-svg" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="12%" y1="8%" x2="88%" y2="92%">
          {colors.map((color, index) => (
            <stop
              key={`${color}-${index}`}
              offset={`${(index / Math.max(colors.length - 1, 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>

      <line className="universe-network-axis" x1="50" y1="7" x2="50" y2="93" />
      <line className="universe-network-axis" x1="7" y1="50" x2="93" y2="50" />

      <polygon
        className={`universe-network-shape ${
          variant === 'own' ? 'universe-network-shape--own' : ''
        }`}
        points={points}
        fill={`url(#${gradientId})`}
      />

      <NetworkCross x={top.x} y={top.y} />
      <NetworkCross x={right.x} y={right.y} />
      <NetworkCross x={bottom.x} y={bottom.y} />
      <NetworkCross x={left.x} y={left.y} />
    </svg>
  );
}

function NetworkCross({ x, y }: { x: number; y: number }) {
  return (
    <g className="universe-network-cross" transform={`translate(${x} ${y})`}>
      <line x1="-5" y1="-5" x2="5" y2="5" />
      <line x1="-5" y1="5" x2="5" y2="-5" />
    </g>
  );
}

function ResultInspector({
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
  const ranking = getRankingOrder(result);
  const archetype = getArchetypeLabel(lang, result.result.archetypeId);

  return (
    <aside className="universe-inspector" role="dialog" aria-modal="true">
      <button className="universe-inspector__close" type="button" onClick={onClose}>
        <span className="sr-only">{t.close}</span>
        <i className="ph-bold ph-x" aria-hidden="true" />
      </button>

      <div className="universe-inspector__graphic">
        <NetworkSvg result={result} variant="own" />
      </div>

      <div className="universe-inspector__content">
        <p className="script-heading4">{t.collective}</p>

        <h2>{result.collectiveName?.trim() || t.noName}</h2>

        <dl>
          <div>
            <dt>{t.type}</dt>
            <dd>{archetype || t.noData}</dd>
          </div>

          <div>
            <dt>{t.location}</dt>
            <dd>{result.location?.trim() || t.noData}</dd>
          </div>

          <div>
            <dt>{t.contact}</dt>
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

        <div className="universe-inspector__section">
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

<div className="universe-inspector__section universe-inspector__section--methods">
  <h3>{t.ranking}</h3>
  {ranking.length > 0 ? (
    <ol className="universe-method-list">
      {ranking.map((method, index) => (
        <li key={method}>
          <span>{index + 1}</span>
          <strong>{getGoalLabel(lang, method)}</strong>
        </li>
      ))}
    </ol>
  ) : (
    <p>{t.noData}</p>
  )}
</div>
      </div>
    </aside>
  );
}

function useUniverseCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  results: PositionedResult[]
) {
  useEffect(() => {
    const canvasElement = canvasRef.current;
if (canvasElement === null) return;

const renderingContext = canvasElement.getContext('2d');
if (renderingContext === null) return;

const canvas = canvasElement;
const context = renderingContext;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let currentDevicePixelRatio = window.devicePixelRatio || 1;

    const stars = Array.from({ length: 180 }, (_, index) => ({
      x: pseudoRandom(index + 1),
      y: pseudoRandom(index + 300),
      r: 0.5 + pseudoRandom(index + 700) * 1.4,
      speed: 0.04 + pseudoRandom(index + 1000) * 0.08,
      alpha: 0.25 + pseudoRandom(index + 1300) * 0.65,
    }));

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      currentDevicePixelRatio = window.devicePixelRatio || 1;

      canvas.width = width * currentDevicePixelRatio;
      canvas.height = height * currentDevicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        currentDevicePixelRatio,
        0,
        0,
        currentDevicePixelRatio,
        0,
        0
      );
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height);

      context.fillStyle = '#26103C';
      context.fillRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        width * 0.52,
        height * 0.52,
        0,
        width * 0.52,
        height * 0.52,
        Math.max(width, height) * 0.7
      );

      gradient.addColorStop(0, 'rgba(126, 91, 222, 0.22)');
      gradient.addColorStop(0.38, 'rgba(38, 16, 60, 0.7)');
      gradient.addColorStop(1, 'rgba(10, 7, 24, 1)');

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        const drift = (time * star.speed * 0.001) % 1;
        const x = ((star.x + drift * 0.035) % 1) * width;
        const y = ((star.y + drift * 0.02) % 1) * height;

        context.beginPath();
        context.arc(x, y, star.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(202, 251, 228, ${star.alpha})`;
        context.fill();
      });

      const visibleResults = results.slice(0, 80);

      context.strokeStyle = 'rgba(202, 251, 228, 0.08)';
      context.lineWidth = 1;

      for (let i = 0; i < visibleResults.length; i += 1) {
        for (let j = i + 1; j < visibleResults.length; j += 1) {
          const a = visibleResults[i];
          const b = visibleResults[j];

          const ax = (a.x / 100) * width;
          const ay = (a.y / 100) * height;
          const bx = (b.x / 100) * width;
          const by = (b.y / 100) * height;

          const distance = Math.hypot(ax - bx, ay - by);

          if (distance < 155) {
            context.globalAlpha = 1 - distance / 155;
            context.beginPath();
            context.moveTo(ax, ay);
            context.lineTo(bx, by);
            context.stroke();
          }
        }
      }

      context.globalAlpha = 1;
      animationFrame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [canvasRef, results]);
}

function getNetworkValues(result: TestResult): Required<NetworkValues> {
  const source = result.result.networkShape ?? result.result.values ?? {};

  return {
    formalization: safeNumber(source.formalization, 50),
    time: safeNumber(source.time, 50),
    identity: safeNumber(source.identity, 50),
    space: safeNumber(source.space, 50),
  };
}

function getRankingOrder(result: TestResult): string[] {
  const ranking =
    result.result.graphic?.rankingOrder ??
    result.result.networkShape?.goalRanking ??
    result.result.selectedAnswerIds?.goalRanking ??
    getStringArray(result.answers.goals);

  return ranking.length > 0 ? ranking : ['political', 'economic', 'creative', 'social'];
}

function getGradientColors(ranking: string[]) {
  const colors = ranking.map((goal) => rankingColors[goal]).filter(Boolean);

  if (colors.length === 0) {
    return ['#7F63E6', '#CBFF68'];
  }

  if (colors.length === 1) {
    return [colors[0], colors[0]];
  }

  return colors;
}

function valueToPoint(
  value: number,
  direction: 'top' | 'right' | 'bottom' | 'left'
) {
  const normalized = clamp(value, 0, 100) / 100;
  const minDistance = 13;
  const maxDistance = 42;
  const distance = minDistance + normalized * (maxDistance - minDistance);

  if (direction === 'top') return { x: 50, y: 50 - distance };
  if (direction === 'right') return { x: 50 + distance, y: 50 };
  if (direction === 'bottom') return { x: 50, y: 50 + distance };
  return { x: 50 - distance, y: 50 };
}

function getGoalFields(lang: Lang, result: TestResult): string[] {
  const selected =
    result.result.goalDetails?.selectedGoalTopics ??
    getStringArray(result.answers.goalTopics);

  const own =
    result.result.goalDetails?.ownGoalTopics ??
    getStringArray(result.answers.goalTopicsOther);

  return [
    ...selected.map((id) => getGoalLabel(lang, id)),
    ...own,
  ].filter(Boolean);
}

function getGoalLabel(lang: Lang, id: string) {
  const labels = goalLabels[lang] as Record<string, string>;
  return labels[id] ?? id;
}

function getArchetypeLabel(lang: Lang, id?: string) {
  if (!id) return null;

  const labels = archetypeLabels[lang] as Record<string, string>;
  return labels[id] ?? id;
}

function readLocalResults(): TestResult[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_RESULTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}