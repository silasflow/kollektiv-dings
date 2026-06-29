import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';
import QuestionLineGraphic from './QuestionLineGraphic';

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
  
const orderedValues = getRankingAnswer(answers, 'goals', [
  'political',
  'economic',
  'creative',
  'social',
]);


  const collectiveType = getCollectiveType({
    lang,
    answers,
    collectiveName,
  });

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
  <QuestionLineGraphic
    mode="ranking"
    answers={answers}
    orderedValues={orderedValues}
  />
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
function getRankingAnswer(
  answers: Answers,
  key: string,
  fallback: string[]
): string[] {
  const value = answers[key];

  return Array.isArray(value) ? value : fallback;
}