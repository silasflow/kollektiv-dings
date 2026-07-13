// src/components/test/TestFlow.tsx

import { useEffect, useState } from 'react';
import type { Lang } from '../../data/siteContent';
import { testQuestions, type TestAnswers } from '../../data/testQuestions';

import TestIntro from './TestIntro';
import SliderQuestion from './SliderQuestion';
import RankingQuestion from './RankingQuestion';
import GoalOptionsQuestion from './GoalOptionsQuestion';
import CollectiveNameQuestion from './CollectiveNameQuestion';
import ResultScreen from './ResultScreen';
import Button from '../common/Button';

import './TestFlow.css';
import './QuestionGraphics.css';
import './SliderQuestion.css';
import './RankingQuestion.css';
import './GoalOptionsQuestion.css';

type Props = {
  lang: Lang;
};

type SavedTestState = {
  step: number;
  answers: TestAnswers;
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
  answers: TestAnswers;
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
    goalDetails: {
  selectedGoalTopics: string[];
  ownGoalTopics: string[];
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

type SaveStatus = 'idle' | 'database_saved' | 'database_failed' | 'local_only';

const STORAGE_KEY = 'stadt-kollektiv-test-state';
const LOCAL_RESULTS_KEY = 'stadt-kollektiv-local-results';

const RESULTS_PAGE_HREF: Record<Lang, string> = {
  de: '/de/universe-results',
  en: '/en/universe-results',
};

const ENABLE_BACKEND = true;

export default function TestFlow({ lang }: Props) {
  const [isReady, setIsReady] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TestAnswers>({});
  const [collectiveName, setCollectiveName] = useState('');
  const [websiteOrInstagram, setWebsiteOrInstagram] = useState('');
  const [location, setLocation] = useState('');
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [localResultCount, setLocalResultCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastPayload, setLastPayload] = useState<TestResultPayload | null>(null);

  useEffect(() => {
    try {
      const savedState = window.sessionStorage.getItem(STORAGE_KEY);

      if (savedState) {
      const parsedState = JSON.parse(savedState) as Partial<SavedTestState>;

      const currentResultStep = testQuestions.length + 2;
      const oldDoneStep = testQuestions.length + 3;
      const savedStep = parsedState.step ?? 0;

      const migratedStep =
        savedStep === oldDoneStep
          ? currentResultStep
          : Math.min(Math.max(savedStep, 0), currentResultStep);

      setStep(migratedStep);

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
  

  function goNext() {
  setStep((currentStep) =>
    Math.min(currentStep + 1, testQuestions.length + 2)
  );
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

  function toggleGoalTopic(questionId: string, optionId: string) {
    setAnswers((currentAnswers) => {
      const currentValue = currentAnswers[questionId];
      const currentTopics = Array.isArray(currentValue) ? currentValue : [];

      const nextTopics = currentTopics.includes(optionId)
        ? currentTopics.filter((id) => id !== optionId)
        : [...currentTopics, optionId];

      return {
        ...currentAnswers,
        [questionId]: nextTopics,
      };
    });
  }

  function updateGoalTopicOther(answerKey: string, values: string[]) {
  setAnswers((currentAnswers) => ({
    ...currentAnswers,
    [answerKey]: values,
  }));
}

  async function sendPayloadToBackend(payload: TestResultPayload) {
    const response = await fetch('/api/test-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: payload.id,
        createdAt: payload.createdAt,
        lang: payload.lang,
        collectiveName: payload.collectiveName,
        websiteOrInstagram: payload.websiteOrInstagram,
        location: payload.location,
        consentPublic: payload.consentPublic,
        answers: payload.answers,
        result: payload.result,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getDatabaseErrorMessage(lang));
    }

    return data;
  }

  async function submitResult() {
  if (isSubmitting) return;

  setIsSubmitting(true);
  setSubmitError(null);
  setSaveStatus('idle');

  const payload = buildTestResultPayload({
    lang,
    collectiveName,
    websiteOrInstagram,
    location,
    consent,
    answers,
  });

  setLastPayload(payload);

  // Sicherheitskopie immer sofort lokal speichern
  saveLocalResult(payload);
  setLocalResultCount(getLocalResults().length);

  if (!ENABLE_BACKEND) {
    setSubmittedId(payload.id);
    setSaveStatus('local_only');
    setSubmitError(
      lang === 'de'
        ? 'Die Datenbank ist derzeit nicht verfügbar. Das Ergebnis wurde sicher im Browser gespeichert.'
        : 'The database is currently unavailable. The result was safely stored in the browser.'
    );

    setStep(testQuestions.length + 2);
    setIsSubmitting(false);
    return;
  }

  try {
    const data = await sendPayloadToBackend(payload);

    setSubmittedId(data.result.id);
    setSaveStatus('database_saved');
    setSubmitError(null);
  } catch {
    setSubmittedId(payload.id);
    setSaveStatus('database_failed');
    setSubmitError(getDatabaseErrorMessage(lang));
  } finally {
    setStep(testQuestions.length + 2);
    setIsSubmitting(false);
  }
}

  async function retryBackendSave() {
    if (isSubmitting) return;

    const payload =
      lastPayload ??
      buildTestResultPayload({
        lang,
        collectiveName,
        websiteOrInstagram,
        location,
        consent,
        answers,
      });

    setLastPayload(payload);
    setIsSubmitting(true);
    setSubmitError(null);

    if (!ENABLE_BACKEND) {
      setSaveStatus('local_only');
      setSubmitError(
        lang === 'de'
          ? 'Backend ist aktuell deaktiviert. Das Ergebnis bleibt als Sicherheitskopie im Browser.'
          : 'Backend is currently disabled. The result remains kept as a browser backup.'
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await sendPayloadToBackend(payload);

      setSubmittedId(data.result.id);
      setSaveStatus('database_saved');
      setSubmitError(null);
    } catch {
      setSaveStatus('database_failed');
      setSubmitError(getDatabaseErrorMessage(lang));
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
    setSaveStatus('idle');
    setLastPayload(null);
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
      isSubmitting={isSubmitting}
      onNameChange={setCollectiveName}
      onWebsiteOrInstagramChange={setWebsiteOrInstagram}
      onLocationChange={setLocation}
      onConsentChange={setConsent}
      onBack={goBack}
      onNext={submitResult}
    />
  );
}

  if (isResultStep) {
  return (
    <ResultScreen
      lang={lang}
      answers={answers}
      collectiveName={collectiveName}
      isSubmitting={isSubmitting}
      saveStatus={saveStatus}
      submitError={submitError}
      resultsPageHref={
        submittedId
          ? `${RESULTS_PAGE_HREF[lang]}?highlight=${encodeURIComponent(submittedId)}`
          : RESULTS_PAGE_HREF[lang]
      }
      onRetry={retryBackendSave}
      onRestart={startNewTest}
      onBack={goBack}
    />
  );
}

  

  if (!currentQuestion) {
  return (
    <section className="test-screen">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <p className="paragraph">
          {lang === 'de'
            ? 'Der gespeicherte Teststand konnte nicht eindeutig zugeordnet werden.'
            : 'The saved test state could not be matched.'}
        </p>

        <Button
          variant="primary"
          icon="arrow-counter-clockwise"
          onClick={startNewTest}
        >
          {lang === 'de'
            ? 'Test neu starten'
            : 'Start test again'}
        </Button>
      </div>
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

  if (currentQuestion.type === 'goal-options') {
  const selectedGoalTopics = Array.isArray(answers[currentQuestion.id])
    ? (answers[currentQuestion.id] as string[])
    : [];

  const ownAnswerKey = `${currentQuestion.id}Other`;
  const ownAnswerValue = answers[ownAnswerKey];

  const ownAnswers = Array.isArray(ownAnswerValue)
    ? ownAnswerValue.filter((value): value is string => typeof value === 'string')
    : typeof ownAnswerValue === 'string'
      ? [ownAnswerValue]
      : [];

  return (
    <GoalOptionsQuestion
      lang={lang}
      question={currentQuestion}
      selectedValues={selectedGoalTopics}
      ownAnswers={ownAnswers}
      onToggleOption={(optionId) => toggleGoalTopic(currentQuestion.id, optionId)}
      onOwnAnswersChange={(values) => updateGoalTopicOther(ownAnswerKey, values)}
      onBack={goBack}
      onNext={goNext}
    />
  );
}

  return null;
}

function getDatabaseErrorMessage(lang: Lang): string {
  return lang === 'de'
    ? 'Die Datenbank konnte gerade nicht erreicht werden. Bitte versuche es nochmal oder lade die lokale JSON-Datei als Sicherung herunter.'
    : 'The database could not be reached right now. Please try again or download the local JSON file as a backup.';
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
  answers: TestAnswers;
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

  const selectedGoalTopics = getRankingAnswerForStorage(answers, 'goalTopics', []);

const ownGoalTopics = getStringArrayAnswerForStorage(answers, 'goalTopicsOther')
  .map((value) => value.trim())
  .filter(Boolean);

const cleanedAnswers: TestAnswers = {
  ...answers,
  goalTopics: selectedGoalTopics,
  goalTopicsOther: ownGoalTopics,
};

return {
    id: createLocalId(),
    createdAt: new Date().toISOString(),
    lang,
    collectiveName: collectiveName.trim(),
    websiteOrInstagram: websiteOrInstagram.trim(),
    location: location.trim(),
    consentPublic: consent,
    answers: cleanedAnswers,
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
     goalDetails: {
  selectedGoalTopics,
  ownGoalTopics,
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
  answers: TestAnswers,
  key: string,
  fallback: number
): number {
  const value = answers[key];
  return typeof value === 'number' ? value : fallback;
}

function getRankingAnswerForStorage(
  answers: TestAnswers,
  key: string,
  fallback: string[]
): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : fallback;
}

function getBooleanAnswerForStorage(
  answers: TestAnswers,
  key: string,
  fallback: boolean
): boolean {
  const value = answers[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getTextAnswerForStorage(
  answers: TestAnswers,
  key: string,
  fallback: string
): string {
  const value = answers[key];
  return typeof value === 'string' ? value : fallback;
}

function getStringArrayAnswerForStorage(
  answers: TestAnswers,
  key: string
): string[] {
  const value = answers[key];

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return value.trim().length > 0 ? [value] : [];
  }

  return [];
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

function getArchetypeId(answers: TestAnswers): string {
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

function getGraphicItems(answers: TestAnswers): string[] {
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