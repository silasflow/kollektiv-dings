// src/components/test/TestFlow.tsx

import { useEffect, useState } from 'react';
import type { Lang } from '../../data/siteContent';
import { testQuestions } from '../../data/testQuestions';
import TestIntro from './TestIntro';
import SliderQuestion from './SliderQuestion';
import RankingQuestion from './RankingQuestion';
import './TestFlow.css';
import './QuestionGraphics.css';
import './SliderQuestion.css';
import './RankingQuestion.css';
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


type SaveStatus = 'idle' | 'database_saved' | 'database_failed' | 'local_only';

const STORAGE_KEY = 'stadt-kollektiv-test-state';
const LOCAL_RESULTS_KEY = 'stadt-kollektiv-local-results';

// Passe diesen Pfad an, wenn eure spätere Gesamtergebnisseite anders heißt.
const RESULTS_PAGE_HREF: Record<Lang, string> = {
  de: '/de/case-studies',
  en: '/en/case-studies',
};

/*
  Für GitHub Pages / lokale Tests bleibt das auf false.
  Dann wird nicht an /api/test-results gesendet, sondern lokal im Browser gespeichert.
  Wenn die Website später auf dem Server läuft, kannst du auf true stellen.
*/
const ENABLE_BACKEND = true;

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastPayload, setLastPayload] = useState<TestResultPayload | null>(null);

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

    const payload = buildTestResultPayload({
      lang,
      collectiveName,
      websiteOrInstagram,
      location,
      consent,
      answers,
    });

    setLastPayload(payload);

    // Sicherheitsnetz: immer lokal sichern, bevor der Datenbank-Request passiert.
    saveLocalResult(payload);
    setLocalResultCount(getLocalResults().length);

    if (!ENABLE_BACKEND) {
      setSubmittedId(payload.id);
      setSaveStatus('local_only');
      setSubmitError(
        lang === 'de'
          ? 'Backend ist aktuell deaktiviert. Das Ergebnis wurde nur lokal gesichert.'
          : 'Backend is currently disabled. The result was saved locally only.'
      );
      goNext();
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await sendPayloadToBackend(payload);

      setSubmittedId(data.result.id);
      setSaveStatus('database_saved');
      setSubmitError(null);
    } catch (error) {
      setSubmittedId(payload.id);
      setSaveStatus('database_failed');
      setSubmitError(getDatabaseErrorMessage(lang));
    } finally {
      goNext();
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
    } catch (error) {
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
        isSubmitting={isSubmitting}
        submitError={submitError}
        onBack={goBack}
        onNext={submitResult}
      />
    );
  }

  if (isDoneStep) {
    const databaseSaved = saveStatus === 'database_saved';

    return (
      <section className="test-screen result-screen save-result-screen">
        <div className="result-content">
          <div className="result-copy">
            <p className="result-kicker script-heading4">
              {databaseSaved
                ? lang === 'de'
                  ? 'Gespeichert'
                  : 'Saved'
                : saveStatus === 'local_only'
                  ? lang === 'de'
                    ? 'Nur lokal zwischengespeichert'
                    : 'Kept locally only'
                  : lang === 'de'
                    ? 'Datenbank nicht erreicht'
                    : 'Database not reached'}
            </p>

            <h1 className="result-title heading2">
              {databaseSaved
                ? lang === 'de'
                  ? 'Das Ergebnis wurde in der Datenbank gespeichert.'
                  : 'The result was saved to the database.'
                : saveStatus === 'local_only'
                  ? lang === 'de'
                    ? 'Das Backend ist gerade deaktiviert.'
                    : 'The backend is currently disabled.'
                  : lang === 'de'
                    ? 'Die Datenbank-Speicherung hat noch nicht geklappt.'
                    : 'Saving to the database did not work yet.'}
            </h1>
          </div>

          <div
            className={`save-status-card ${databaseSaved ? 'save-status-card--success' : 'save-status-card--warning'}`}
          >
            <p className="paragraph">
              {databaseSaved
                ? lang === 'de'
                  ? 'Alles gut: Die Datenbank hat das Ergebnis gespeichert. Eine lokale Sicherheitskopie bleibt zusätzlich in diesem Browser.'
                  : 'All good: the database saved the result. A local browser backup remains as well.'
                : saveStatus === 'local_only'
                  ? lang === 'de'
                    ? 'Das Ergebnis wurde als Sicherheitskopie im Browser behalten. Du kannst die lokale JSON-Datei herunterladen und später importieren oder übertragen.'
                    : 'The result was kept as a browser backup. You can download the local JSON file and import or transfer it later.'
                  : lang === 'de'
                    ? 'Der Datenbank-Upload konnte gerade nicht abgeschlossen werden. Das Ergebnis wurde vorsorglich als Sicherheitskopie im Browser behalten.'
                    : 'The database upload could not be completed right now. The result was kept as a browser backup.'}
            </p>

            {submitError && <p className="save-status-detail paragraph">{submitError}</p>}

            <p className="save-status-detail paragraph">
              {lang === 'de'
                ? `Lokal gespeicherte Ergebnisse in diesem Browser: ${localResultCount}`
                : `Locally saved results in this browser: ${localResultCount}`}
            </p>
          </div>

          <div className="test-local-actions test-done-actions">
            {!databaseSaved && ENABLE_BACKEND && (
              <Button
                variant="primary"
                icon="upload-simple"
                onClick={retryBackendSave}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? lang === 'de'
                    ? 'Sendet …'
                    : 'Sending …'
                  : lang === 'de'
                    ? 'Erneut an Datenbank senden'
                    : 'Send to database again'}
              </Button>
            )}

            <Button
              variant="secondary"
              icon="download-simple"
              onClick={downloadLocalResults}
            >
              {lang === 'de' ? 'Lokale Ergebnisse herunterladen' : 'Download local results'}
            </Button>

            <Button variant="secondary" onClick={startNewTest}>
              {lang === 'de' ? 'Test neu starten' : 'Start new test'}
            </Button>

            <Button
              variant="primary"
              icon="arrow-right"
              href={RESULTS_PAGE_HREF[lang]}
            >
              {lang === 'de' ? 'Zur Ergebnisseite' : 'Go to results'}
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
