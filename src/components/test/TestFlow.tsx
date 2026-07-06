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
import Button from '../common/Button';

type Props = {
  lang: Lang;
};

type Answers = Record<string, number | string[] | boolean>;

type SavedTestState = {
  step: number;
  answers: Answers;
  collectiveName: string;
  websiteOrInstagram: string;
  location: string;
  consent: boolean;
};

type TestResultPayload = {
  id: string;
  createdAt: string;
  lang: Lang;
  collectiveName: string;
  websiteOrInstagram: string;
  location: string;
  consentPublic: boolean;
  answers: Answers;
  result: {
    archetypeId: string;
    values: {
      formalization: number;
      time: number;
      identity: number;
      space: number;
    };
    selectedAnswerIds: {
      formalization: string;
      time: string;
      identity: string;
      space: string;
      actsVirtually: boolean;
      primaryGoal: string;
      goalRanking: string[];
    };
    networkShape: {
      formalization: number;
      time: number;
      identity: number;
      space: number;
      actsVirtually: boolean;
      goalRanking: string[];
    };
    graphic: {
      polygonSource: 'slider_answers';
      fillSource: 'ranking_order';
      rankingOrder: string[];
      body: 'diamond';
      items: string[];
    };
  };
};

const STORAGE_KEY = 'stadt-kollektiv-test-state';
const LOCAL_RESULTS_KEY = 'stadt-kollektiv-local-results';

/*
  Für GitHub Pages / lokale Tests bleibt das auf false.
  Dann wird nicht an /api/test-results gesendet, sondern lokal im Browser gespeichert.
  Wenn die Website später auf dem Server läuft, kannst du auf true stellen.
*/
const ENABLE_BACKEND = false;

export default function TestFlow({ lang }: Props) {
  const [isReady, setIsReady] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [collectiveName, setCollectiveName] = useState('');
  const [websiteOrInstagram, setWebsiteOrInstagram] = useState('');
  const [location, setLocation] = useState('');
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [localResultCount, setLocalResultCount] = useState(0);

  useEffect(() => {
    try {
      const savedState = window.sessionStorage.getItem(STORAGE_KEY);

      if (savedState) {
        const parsedState = JSON.parse(savedState) as Partial<SavedTestState>;

        setStep(parsedState.step ?? 0);
        setAnswers(parsedState.answers ?? {});
        setCollectiveName(parsedState.collectiveName ?? '');
        setWebsiteOrInstagram(parsedState.websiteOrInstagram ?? '');
        setLocation(parsedState.location ?? '');
        setConsent(parsedState.consent ?? false);
      }

      setLocalResultCount(getLocalResults().length);
    } catch {
      setStep(0);
      setAnswers({});
      setCollectiveName('');
      setWebsiteOrInstagram('');
      setLocation('');
      setConsent(false);
      setLocalResultCount(0);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const nextState: SavedTestState = {
      step,
      answers,
      collectiveName,
      websiteOrInstagram,
      location,
      consent,
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [isReady, step, answers, collectiveName, websiteOrInstagram, location, consent]);

  const isIntro = step === 0;
  const questionIndex = step - 1;
  const currentQuestion = !isIntro ? testQuestions[questionIndex] : undefined;

  const isProfileStep = step === testQuestions.length + 1;
  const isResultStep = step === testQuestions.length + 2;
  const isDoneStep = step === testQuestions.length + 3;

  function goNext() {
    setStep((currentStep) => Math.min(currentStep + 1, testQuestions.length + 3));
  }

  function goBack() {
    setStep((currentStep) => Math.max(currentStep - 1, 0));
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

  function updateBooleanAnswer(questionId: string, value: boolean) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
  }

  async function submitResult() {
    if (isSubmitting) return;

    if (submittedId) {
      goNext();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = buildTestResultPayload({
      lang,
      collectiveName,
      websiteOrInstagram,
      location,
      consent,
      answers,
    });

    if (!ENABLE_BACKEND) {
      saveLocalResult(payload);
      setSubmittedId(payload.id);
      setLocalResultCount(getLocalResults().length);
      goNext();
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang: payload.lang,
          collectiveName: payload.collectiveName,
          websiteOrInstagram: payload.websiteOrInstagram,
          location: payload.location,
          consentPublic: payload.consentPublic,
          answers: payload.answers,
          result: payload.result,
        }),
      });

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen');
      }

      const data = await response.json();

      setSubmittedId(data.result.id);
      goNext();
    } catch {
      setSubmitError(
        lang === 'de'
          ? 'Das Ergebnis konnte nicht gespeichert werden.'
          : 'The result could not be saved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startNewTest() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setStep(0);
    setAnswers({});
    setCollectiveName('');
    setWebsiteOrInstagram('');
    setLocation('');
    setConsent(false);
    setSubmittedId(null);
    setSubmitError(null);
  }

  function downloadLocalResults() {
    const localResults = getLocalResults();
    const exportData = {
      exportedAt: new Date().toISOString(),
      source: 'stadt-kollektiv-github-pages-local-export',
      count: localResults.length,
      results: localResults,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `stadt-kollektiv-results-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (!isReady) {
    return <TestIntro lang={lang} onNext={goNext} />;
  }

  if (isIntro) {
    return <TestIntro lang={lang} onNext={goNext} />;
  }

  if (isProfileStep) {
    return (
      <CollectiveNameQuestion
        lang={lang}
        collectiveName={collectiveName}
        websiteOrInstagram={websiteOrInstagram}
        location={location}
        consent={consent}
        onNameChange={setCollectiveName}
        onWebsiteOrInstagramChange={setWebsiteOrInstagram}
        onLocationChange={setLocation}
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
        onNext={submitResult}
      />
    );
  }

  if (isDoneStep) {
    return (
      <section className="test-screen result-screen">
        <div className="result-content">
          <div className="result-copy">
            <p className="result-kicker script-heading4">
              {lang === 'de' ? 'Gespeichert' : 'Saved'}
            </p>

            <h1 className="result-title heading2">
              {lang === 'de'
                ? 'Das Ergebnis wurde lokal gespeichert.'
                : 'The result was saved locally.'}
            </h1>
          </div>

          <p className="result-text paragraph">
            {lang === 'de'
              ? `In diesem Browser sind aktuell ${localResultCount} Ergebnis(se) gespeichert. Lade die JSON-Datei am Ende des Interviewtages herunter, damit nichts verloren geht.`
              : `${localResultCount} result(s) are currently saved in this browser. Download the JSON file at the end of the interview day so nothing gets lost.`}
          </p>

          {submitError && <p className="result-text">{submitError}</p>}

          <div className="test-local-actions">
            {/* <button type="button" className="test-nav-button text-button" onClick={downloadLocalResults}>
              {lang === 'de' ? 'Lokale Ergebnisse herunterladen' : 'Download local results'}
              <i className="ph-bold ph-download-simple" />
            </button> */}
            <Button
              variant="secondary"
              icon="download-simple"
              onClick={downloadLocalResults}
            >
              {lang === 'de' ? 'Lokale Ergebnisse herunterladen' : 'Download local results'}
            </Button>

            {/* <button type="button" className="test-nav-button text-button" onClick={startNewTest}>
              {lang === 'de' ? 'Neuen Test starten' : 'Start new test'}
            </button> */}
            <Button
              variant="secondary"
              onClick={startNewTest}
            >
              {lang === 'de' ? 'Neuen Test starten' : 'Start new test'}
            </Button>
          </div>
        </div>
      </section>
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

    const actsVirtually = getBooleanAnswerForStorage(answers, 'actsVirtually', false);

    return (
      <SliderQuestion
        lang={lang}
        question={currentQuestion}
        value={currentValue}
        answers={answers}
        isVirtualOptionVisible={currentQuestion.id === 'space'}
        actsVirtually={actsVirtually}
        onVirtualChange={(value) => updateBooleanAnswer('actsVirtually', value)}
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

    const validStoredOrder = storedOrder.filter((id) => defaultOrder.includes(id));
    const missingIds = defaultOrder.filter((id) => !validStoredOrder.includes(id));

    const orderedValues =
      validStoredOrder.length > 0
        ? [...validStoredOrder, ...missingIds]
        : defaultOrder;

    return (
      <RankingQuestion
        lang={lang}
        question={currentQuestion}
        orderedValues={orderedValues}
        answers={answers}
        onChange={(nextOrder) => updateRankingAnswer(currentQuestion.id, nextOrder)}
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  return null;
}

function buildTestResultPayload({
  lang,
  collectiveName,
  websiteOrInstagram,
  location,
  consent,
  answers,
}: {
  lang: Lang;
  collectiveName: string;
  websiteOrInstagram: string;
  location: string;
  consent: boolean;
  answers: Answers;
}): TestResultPayload {
  const rankingOrder = getRankingAnswerForStorage(answers, 'goals', [
    'political',
    'economic',
    'creative',
    'social',
  ]);

  const values = {
    formalization: getNumericAnswerForStorage(answers, 'formalization', 50),
    time: getNumericAnswerForStorage(answers, 'time', 50),
    identity: getNumericAnswerForStorage(answers, 'identity', 50),
    space: getNumericAnswerForStorage(answers, 'space', 50),
  };

  const actsVirtually = getBooleanAnswerForStorage(answers, 'actsVirtually', false);

  return {
    id: createLocalId(),
    createdAt: new Date().toISOString(),
    lang,
    collectiveName: collectiveName.trim(),
    websiteOrInstagram: websiteOrInstagram.trim(),
    location: location.trim(),
    consentPublic: consent,
    answers,
    result: {
      archetypeId: getArchetypeId(answers),
      values,
      selectedAnswerIds: {
        formalization: getSliderSegmentId('formalization', values.formalization),
        time: getSliderSegmentId('time', values.time),
        identity: getSliderSegmentId('identity', values.identity),
        space: getSliderSegmentId('space', values.space),
        actsVirtually,
        primaryGoal: rankingOrder[0] ?? 'political',
        goalRanking: rankingOrder,
      },
      networkShape: {
        ...values,
        actsVirtually,
        goalRanking: rankingOrder,
      },
      graphic: {
        polygonSource: 'slider_answers',
        fillSource: 'ranking_order',
        rankingOrder,
        body: 'diamond',
        items: getGraphicItems(answers),
      },
    },
  };
}

function getNumericAnswerForStorage(
  answers: Answers,
  key: string,
  fallback: number
): number {
  const value = answers[key];
  return typeof value === 'number' ? value : fallback;
}

function getRankingAnswerForStorage(
  answers: Answers,
  key: string,
  fallback: string[]
): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : fallback;
}

function getBooleanAnswerForStorage(
  answers: Answers,
  key: string,
  fallback: boolean
): boolean {
  const value = answers[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getSliderSegmentId(questionId: string, value: number): string {
  if (questionId === 'identity') {
    if (value <= 25) return 'identity_social_contact';
    if (value <= 50) return 'identity_shared_values';
    if (value <= 75) return 'identity_stable';
    return 'identity_established';
  }

  if (questionId === 'space') {
    if (value <= 25) return 'space_local';
    if (value <= 50) return 'space_multi_local';
    if (value <= 75) return 'space_translocal';
    return 'space_digital';
  }

  if (value <= 33) return `${questionId}_low`;
  if (value <= 66) return `${questionId}_medium`;
  return `${questionId}_high`;
}

function getArchetypeId(answers: Answers): string {
  const formalization = getNumericAnswerForStorage(answers, 'formalization', 50);
  const time = getNumericAnswerForStorage(answers, 'time', 50);
  const identity = getNumericAnswerForStorage(answers, 'identity', 50);
  const space = getNumericAnswerForStorage(answers, 'space', 50);
  const actsVirtually = getBooleanAnswerForStorage(answers, 'actsVirtually', false);
  const rankingOrder = getRankingAnswerForStorage(answers, 'goals', [
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

function getGraphicItems(answers: Answers): string[] {
  const formalization = getNumericAnswerForStorage(answers, 'formalization', 50);
  const time = getNumericAnswerForStorage(answers, 'time', 50);
  const identity = getNumericAnswerForStorage(answers, 'identity', 50);
  const space = getNumericAnswerForStorage(answers, 'space', 50);
  const actsVirtually = getBooleanAnswerForStorage(answers, 'actsVirtually', false);
  const rankingOrder = getRankingAnswerForStorage(answers, 'goals', [
    'political',
    'economic',
    'creative',
    'social',
  ]);
  const primaryGoal = rankingOrder[0] ?? 'political';

  return [
    formalization < 35 ? 'balloon' : formalization < 67 ? 'cap' : 'briefcase',
    time < 35 ? 'spark' : time < 67 ? 'watch' : 'backpack',
    identity < 35 ? 'sunglasses' : identity < 67 ? 'scarf' : 'badge',
    space < 35 ? 'house' : space < 67 ? 'map' : 'globe',
    actsVirtually ? 'wifi' : 'pin',
    getGoalGraphicItem(primaryGoal),
  ];
}

function getGoalGraphicItem(goalId: string): string {
  if (goalId === 'political') return 'megaphone';
  if (goalId === 'economic') return 'coin';
  if (goalId === 'creative') return 'paintbrush';
  if (goalId === 'social') return 'heart';
  return 'star';
}

function createLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getLocalResults(): TestResultPayload[] {
  try {
    const rawResults = window.localStorage.getItem(LOCAL_RESULTS_KEY);
    return rawResults ? (JSON.parse(rawResults) as TestResultPayload[]) : [];
  } catch {
    return [];
  }
}

function saveLocalResult(payload: TestResultPayload) {
  const currentResults = getLocalResults();
  const nextResults = [...currentResults, payload];
  window.localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(nextResults));
}
