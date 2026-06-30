// src/components/test/ResultScreen.tsx

import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';
import QuestionLineGraphic from './QuestionLineGraphic';

type Answers = Record<string, number | string[] | boolean>;

type Props = {
  lang: Lang;
  answers: Answers;
  collectiveName: string;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    kicker: 'Dein Kollektiv-Typ',
    title: 'Ihr seid ein',
    body: 'Das Ergebnis basiert auf euren Antworten. Das Rautennetz wird zusätzlich gespeichert, damit es später zusammen mit anderen Kollektiven auf der Ergebnisseite angezeigt werden kann.',
  },
  en: {
    kicker: 'Your collective type',
    title: 'You are a',
    body: 'The result is based on your answers. The diamond network is also saved so it can later be displayed together with other collectives on the results page.',
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

export default function ResultScreen({
  lang,
  answers,
  collectiveName,
  onBack,
  onNext,
}: Props) {
  const t = text[lang];

  const orderedValues = getRankingAnswer(answers, 'goals', [
    'political',
    'economic',
    'creative',
    'social',
  ]);

  const archetypeId = getArchetypeId(answers);
  const collectiveType = archetypeLabels[lang][archetypeId];

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

        {collectiveName.trim().length > 0 && (
          <p className="result-text">{collectiveName.trim()}</p>
        )}

        <div className="result-graphic-card" aria-hidden="true">
          <QuestionLineGraphic
            mode="ranking"
            answers={answers as Record<string, number | string[]>}
            orderedValues={orderedValues}
          />
        </div>

        <p className="result-text">{t.body}</p>
      </div>

      <TestNavigation lang={lang} onBack={onBack} onNext={onNext} />
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

function getRankingAnswer(
  answers: Answers,
  key: string,
  fallback: string[]
): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : fallback;
}

function getBooleanAnswer(
  answers: Answers,
  key: string,
  fallback: boolean
): boolean {
  const value = answers[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getArchetypeId(answers: Answers): keyof typeof archetypeLabels.de {
  const formalization = getNumericAnswer(answers, 'formalization', 50);
  const time = getNumericAnswer(answers, 'time', 50);
  const identity = getNumericAnswer(answers, 'identity', 50);
  const space = getNumericAnswer(answers, 'space', 50);
  const actsVirtually = getBooleanAnswer(answers, 'actsVirtually', false);
  const rankingOrder = getRankingAnswer(answers, 'goals', [
    'political',
    'economic',
    'creative',
    'social',
  ]);
  const primaryGoal = rankingOrder[0] ?? 'political';

  if (actsVirtually && space >= 50) {
    return 'networked_collective';
  }

  if (formalization < 35 && time < 35) {
    return 'spontaneous_collective';
  }

  if (identity > 65 && formalization > 60) {
    return 'structured_collective';
  }

  if (space > 65) {
    return 'decentral_collective';
  }

  if (primaryGoal === 'political') {
    return 'activist_collective';
  }

  return 'hybrid_collective';
}
