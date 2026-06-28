import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';

type Answers = Record<string, number | string[]>;

type Props = {
  lang: Lang;
  answers: Answers;
  collectiveName: string;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    kicker: 'Dein Kollektiv Typ',
    title: 'Du bist in einem',
    fallbackName: 'Kollektiv',
    body: 'In tempor duis do commodo id ea ullamco cupidatat occaecat mollit do velit. Minim aute consequat nulla amet.',
  },
  en: {
    kicker: 'Your collective type',
    title: 'You are in a',
    fallbackName: 'collective',
    body: 'In tempor duis do commodo id ea ullamco cupidatat occaecat mollit do velit. Minim aute consequat nulla amet.',
  },
} as const;

export default function ResultScreen({
  lang,
  answers,
  collectiveName,
  onBack,
  onNext,
}: Props) {
  const t = text[lang];

  const top = getNumericAnswer(answers, 'formalization', 62);
  const right = getNumericAnswer(answers, 'space', 68);
  const bottom = getNumericAnswer(answers, 'identity', 54);
  const left = getNumericAnswer(answers, 'time', 46);

  const collectiveType = getCollectiveType({
    lang,
    answers,
    collectiveName,
  });

  const polygonPoints = buildDiamondPoints({ top, right, bottom, left });

  return (
    <section className="test-screen result-screen">
      <div className="result-content">
        <div className="result-copy">
          <p className="result-kicker">{t.kicker}</p>

          <h1 className="result-title">
            <span>{t.title}</span>
            <span className="result-type-name">{collectiveType}</span>
          </h1>
        </div>

        <div className="result-graphic-card" aria-hidden="true">
          <svg
  className="result-graphic"
  viewBox="0 0 220 220"
  role="img"
  aria-label="Kollektiv-Profil"
>
  <defs>
    <linearGradient id="resultGradient" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="#d47f4a" />
      <stop offset="100%" stopColor="#d7ef71" />
    </linearGradient>
  </defs>

  <line x1="110" y1="22" x2="110" y2="198" className="result-axis" />
  <line x1="22" y1="110" x2="198" y2="110" className="result-axis" />

  <polygon
    points={polygonPoints}
    className="result-shape"
  />
</svg>
        </div>

        <p className="result-text">{t.body}</p>
      </div>

      <TestNavigation
        lang={lang}
        onBack={onBack}
        onNext={onNext}
      />
    </section>
  );
}

function getNumericAnswer(
  answers: Answers,
  key: string,
  fallback: number
): number {
  const value = answers[key];
  return typeof value === 'number' ? value : fallback;
}

function buildDiamondPoints({
  top,
  right,
  bottom,
  left,
}: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}) {
  const center = 110;
  const minRadius = 18;
  const maxRadius = 82;

  const scale = (value: number) =>
    minRadius + ((Math.max(0, Math.min(100, value)) / 100) * (maxRadius - minRadius));

  const topY = center - scale(top);
  const rightX = center + scale(right);
  const bottomY = center + scale(bottom);
  const leftX = center - scale(left);

  return `
    ${center},${topY}
    ${rightX},${center}
    ${center},${bottomY}
    ${leftX},${center}
  `;
}

function getCollectiveType({
  lang,
  answers,
  collectiveName,
}: {
  lang: Lang;
  answers: Answers;
  collectiveName: string;
}) {
  const formalization = getNumericAnswer(answers, 'formalization', 50);
  const time = getNumericAnswer(answers, 'time', 50);
  const identity = getNumericAnswer(answers, 'identity', 50);
  const space = getNumericAnswer(answers, 'space', 50);

  if (collectiveName.trim().length > 0) {
    return collectiveName.trim();
  }

  if (formalization < 35 && time < 35) {
    return lang === 'de' ? 'spontanen Kollektiv' : 'spontaneous collective';
  }

  if (identity > 65 && formalization > 60) {
    return lang === 'de' ? 'strukturierten Kollektiv' : 'structured collective';
  }

  if (space > 65) {
    return lang === 'de' ? 'dezentralen Kollektiv' : 'decentral collective';
  }

  return lang === 'de' ? 'hybriden Kollektiv' : 'hybrid collective';
}