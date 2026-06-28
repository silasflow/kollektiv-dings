// src/components/test/TestFlow.tsx

import { useEffect, useState } from 'react';
import type { Lang } from '../../data/siteContent';
import { testQuestions } from '../../data/testQuestions';
import TestIntro from './TestIntro';
import SliderQuestion from './SliderQuestion';
import RankingQuestion from './RankingQuestion';
import './TestFlow.css';
import CollectiveNameQuestion from './CollectiveNameQuestion';
import ResultScreen from './ResultScreen';


type Props = {
  lang: Lang;
};

/*
  Slider-Fragen speichern eine Zahl von 0–100.
  Ranking-Fragen speichern eine sortierte Liste von Option-IDs.
*/
type Answers = Record<string, number | string[]>;

type SavedTestState = {
  step: number;
  answers: Answers;
  collectiveName: string;
  consent: boolean;
};

const STORAGE_KEY = 'stadt-kollektiv-test-state';

export default function TestFlow({ lang }: Props) {
  const [isReady, setIsReady] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
const [collectiveName, setCollectiveName] = useState('');
const [consent, setConsent] = useState(false);
  /*
    Wichtig:
    sessionStorage erst nach dem ersten Render lesen.
    Sonst entsteht in Astro/React ein Hydration-Fehler,
    weil Server und Browser unterschiedliche Inhalte rendern.
  */
  useEffect(() => {
    try {
      const savedState = window.sessionStorage.getItem(STORAGE_KEY);

      if (savedState) {
        const parsedState = JSON.parse(savedState) as SavedTestState;

        setStep(parsedState.step ?? 0);
        setAnswers(parsedState.answers ?? {});
      setCollectiveName(parsedState.collectiveName ?? '');
setConsent(parsedState.consent ?? false);
    }
    } catch {
      setStep(0);
      setAnswers({});
      setCollectiveName('');
      setConsent(false);
    }

    setIsReady(true);
  }, []);

  /*
    Sobald React im Browser aktiv ist, speichern wir den aktuellen Stand.
    Dadurch bleibt der Testschritt auch beim Sprachwechsel de/en erhalten.
  */
  useEffect(() => {
    if (!isReady) return;

    const nextState: SavedTestState = {
      step,
      answers,
      collectiveName,
      consent,
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [isReady, step, answers, collectiveName, consent]);

  const isIntro = step === 0;
  const questionIndex = step - 1;
  const currentQuestion = !isIntro ? testQuestions[questionIndex] : undefined;

  function goNext() {
    setStep((currentStep) =>
      Math.min(currentStep + 1, testQuestions.length + 2)
    );
  }

  function goBack() {
    setStep((currentStep) =>
      Math.max(currentStep - 1, 0)
    );
  }

  function updateSliderAnswer(questionId: string, value: number) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
  }

  function updateRankingAnswer(questionId: string, nextOrder: string[]) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: nextOrder,
    }));
  }

  if (!isReady) {
    return <TestIntro lang={lang} onNext={goNext} />;
  }

  if (isIntro) {
    return <TestIntro lang={lang} onNext={goNext} />;
  }

  const isNameStep = step === testQuestions.length + 1;
  const isResultStep = step === testQuestions.length + 2;
if (isNameStep) {
  return (
    <CollectiveNameQuestion
      lang={lang}
      collectiveName={collectiveName}
      consent={consent}
      onNameChange={setCollectiveName}
      onConsentChange={setConsent}
      onBack={goBack}
      onNext={goNext}
    />
  );
}

if (isResultStep) {
  return (
    <ResultScreen
      lang={lang}
      answers={answers}
      collectiveName={collectiveName}
      onBack={goBack}
      onNext={goNext}
    />
  );
}

if (!currentQuestion) {
  return (
    <section className="test-screen">
      <p>
        {lang === 'de'
          ? 'Der Test ist abgeschlossen.'
          : 'The test is complete.'}
      </p>
    </section>
  );
}

  if (currentQuestion.type === 'slider') {
    const currentValue =
      typeof answers[currentQuestion.id] === 'number'
        ? (answers[currentQuestion.id] as number)
        : 50;

    return (
      <SliderQuestion
        lang={lang}
        question={currentQuestion}
        value={currentValue}
        onChange={(value) => updateSliderAnswer(currentQuestion.id, value)}
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  if (currentQuestion.type === 'ranking') {
    const storedOrder = Array.isArray(answers[currentQuestion.id])
  ? (answers[currentQuestion.id] as string[])
  : [];

const defaultOrder = currentQuestion.options.map((option) => option.id);

const validStoredOrder = storedOrder.filter((id) =>
  defaultOrder.includes(id)
);

const missingIds = defaultOrder.filter((id) =>
  !validStoredOrder.includes(id)
);

const orderedValues =
  validStoredOrder.length > 0
    ? [...validStoredOrder, ...missingIds]
    : defaultOrder;

    return (
      <RankingQuestion
        lang={lang}
        question={currentQuestion}
        orderedValues={orderedValues}
        onChange={(nextOrder) =>
          updateRankingAnswer(currentQuestion.id, nextOrder)
        }
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  return null;
}