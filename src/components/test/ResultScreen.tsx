// src/components/test/ResultScreen.tsx

import type { Lang } from '../../data/siteContent';
import Button from '../common/Button';
import QuestionLineGraphic from './QuestionLineGraphic';

type Answers = Record<string, number | string[] | boolean>;

type Props = {
  lang: Lang;
  answers: Answers;
  collectiveName: string;
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    kicker: 'Euer Kollektiv-Typ',
    title: 'Ihr seid ein',
    body: 'Prüft das Ergebnis kurz. Mit „Ergebnis speichern“ sendet ihr es an die Datenbank. Zusätzlich wird beim Speichern immer eine lokale Sicherung im Browser angelegt.',
    submit: 'Ergebnis speichern',
    submitting: 'Speichert …',
  },
  en: {
    kicker: 'Your collective type',
    title: 'You are a',
    body: 'Quickly check the result. With “Save result”, it will be sent to the database. A local browser backup is always created as well.',
    submit: 'Save result',
    submitting: 'Saving …',
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
  isSubmitting,
  submitError,
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
          <p className="result-kicker script-heading4">{t.kicker}</p>

          <h1 className="result-title">
            <span className="heading3">{t.title}</span>
            <span className="result-type-name heading3">{collectiveType}</span>
          </h1>
        </div>

        {collectiveName.trim().length > 0 && (
          <p className="result-text paragraph">{collectiveName.trim()}</p>
        )}

        <div className="result-graphic-card" aria-hidden="true">
          <QuestionLineGraphic
            mode="ranking"
            answers={answers as Record<string, number | string[]>}
            orderedValues={orderedValues}
          />
        </div>

        <p className="result-text paragraph">{t.body}</p>

        {submitError && <p className="result-error paragraph">{submitError}</p>}
      </div>

      <div className="result-submit-actions">
        <Button
          variant="secondary"
          icon="arrow-left"
          onClick={onBack}
          disabled={isSubmitting}
        />

        <Button
          variant="primary"
          icon="arrow-up-right"
          onClick={onNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? t.submitting : t.submit}
        </Button>
      </div>
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
