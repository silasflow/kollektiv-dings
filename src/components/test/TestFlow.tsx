import { useEffect, useState } from "react";
import type { Lang } from "../../data/siteContent";
import { testQuestions, type TestAnswers } from "../../data/testQuestions";
import type { PlaceSelection } from "../../types/places";

import Button from "../common/Button";
import CollectiveNameQuestion from "./CollectiveNameQuestion";
import CollectivePlacesQuestion from "./CollectivePlacesQuestion";
import GoalOptionsQuestion from "./GoalOptionsQuestion";
import RankingQuestion from "./RankingQuestion";
import ResultScreen from "./ResultScreen";
import SliderQuestion from "./SliderQuestion";
import TestIntro from "./TestIntro";

import "./TestFlow.css";
import "./QuestionGraphics.css";
import "./SliderQuestion.css";
import "./RankingQuestion.css";
import "./GoalOptionsQuestion.css";

type Props = {
  lang: Lang;
};

type SavedTestState = {
  version: 2;
  step: number;
  answers: TestAnswers;
  collectiveName: string;
  website: string;
  instagram: string;
  places: PlaceSelection[];
  noFixedBase: boolean;
  consent: boolean;
  websiteOrInstagram?: string;
  location?: string;
  region?: string;
  country?: string;
};

type TestResultPayload = {
  id: string;
  createdAt: string;
  lang: Lang;
  collectiveName: string;
  website: string;
  instagram: string;
  location: string;
  region: string;
  country: string;
  places: PlaceSelection[];
  noFixedBase: boolean;
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
      polygonSource: "slider_answers";
      fillSource: "ranking_order";
      rankingOrder: string[];
      body: "diamond";
      items: string[];
    };
  };
};

type SaveStatus = "idle" | "database_saved" | "database_failed" | "local_only";

const STORAGE_KEY = "stadt-kollektiv-test-state";
const LOCAL_RESULTS_KEY = "stadt-kollektiv-local-results";
const STATE_VERSION = 2 as const;

const PROFILE_STEP = testQuestions.length + 1;
const PLACES_STEP = testQuestions.length + 2;
const RESULT_STEP = testQuestions.length + 3;
const OLD_RESULT_STEP = testQuestions.length + 2;

const RESULTS_PAGE_HREF: Record<Lang, string> = {
  de: "/de/universe-results",
  en: "/en/universe-results",
};

const ENABLE_BACKEND = true;

export default function TestFlow({ lang }: Props) {
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TestAnswers>({});
  const [collectiveName, setCollectiveName] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [places, setPlaces] = useState<PlaceSelection[]>([]);
  const [noFixedBase, setNoFixedBase] = useState(false);
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [localResultCount, setLocalResultCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastPayload, setLastPayload] = useState<TestResultPayload | null>(
    null,
  );

  useEffect(() => {
    try {
      const savedState = window.sessionStorage.getItem(STORAGE_KEY);

      if (savedState) {
        const parsedState = JSON.parse(savedState) as Partial<SavedTestState>;
        const savedStep = parsedState.step ?? 0;
        const migratedStep =
          parsedState.version === STATE_VERSION
            ? clamp(savedStep, 0, RESULT_STEP)
            : savedStep >= OLD_RESULT_STEP
              ? RESULT_STEP
              : clamp(savedStep, 0, PROFILE_STEP);

        const legacyContact = splitLegacyContact(
          parsedState.websiteOrInstagram ?? "",
        );
        const restoredPlaces = readSavedPlaces(parsedState.places);
        const legacyPlace = createLegacyPlaceSelection(
          parsedState.location ?? "",
          parsedState.region ?? "",
          parsedState.country ?? "",
        );

        setStep(migratedStep);
        setAnswers(parsedState.answers ?? {});
        setCollectiveName(parsedState.collectiveName ?? "");
        setWebsite(parsedState.website ?? legacyContact.website);
        setInstagram(parsedState.instagram ?? legacyContact.instagram);
        setPlaces(
          restoredPlaces.length > 0
            ? restoredPlaces
            : legacyPlace
              ? [legacyPlace]
              : [],
        );
        setNoFixedBase(parsedState.noFixedBase ?? false);
        setConsent(parsedState.consent ?? false);
      }

      setLocalResultCount(getLocalResults().length);
    } catch {
      resetStateValues();
      setLocalResultCount(0);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const nextState: SavedTestState = {
      version: STATE_VERSION,
      step,
      answers,
      collectiveName,
      website,
      instagram,
      places,
      noFixedBase,
      consent,
    };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [
    isReady,
    step,
    answers,
    collectiveName,
    website,
    instagram,
    places,
    noFixedBase,
    consent,
  ]);

  const isIntro = step === 0;
  const questionIndex = step - 1;
  const currentQuestion = !isIntro ? testQuestions[questionIndex] : undefined;
  const isProfileStep = step === PROFILE_STEP;
  const isPlacesStep = step === PLACES_STEP;
  const isResultStep = step === RESULT_STEP;

  function resetStateValues() {
    setStep(0);
    setAnswers({});
    setCollectiveName("");
    setWebsite("");
    setInstagram("");
    setPlaces([]);
    setNoFixedBase(false);
    setConsent(false);
  }

  function goNext() {
    setStep((currentStep) => Math.min(currentStep + 1, RESULT_STEP));
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
    const response = await fetch("/api/test-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok || !hasSavedResult(data)) {
      throw new Error(getDatabaseErrorMessage(lang));
    }

    return data;
  }

  async function submitResult() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSaveStatus("idle");

    const payload = buildTestResultPayload({
      lang,
      collectiveName,
      website,
      instagram,
      places,
      noFixedBase,
      consent,
      answers,
    });

    setLastPayload(payload);
    saveLocalResult(payload);
    setLocalResultCount(getLocalResults().length);

    if (!ENABLE_BACKEND) {
      setSubmittedId(payload.id);
      setSaveStatus("local_only");
      setSubmitError(
        lang === "de"
          ? "Die Datenbank ist derzeit nicht verfügbar. Das Ergebnis wurde sicher im Browser gespeichert."
          : "The database is currently unavailable. The result was safely stored in the browser.",
      );
      setStep(RESULT_STEP);
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await sendPayloadToBackend(payload);
      setSubmittedId(data.result.id);
      setSaveStatus("database_saved");
      setSubmitError(null);
    } catch {
      setSubmittedId(payload.id);
      setSaveStatus("database_failed");
      setSubmitError(getDatabaseErrorMessage(lang));
    } finally {
      setStep(RESULT_STEP);
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
        website,
        instagram,
        places,
        noFixedBase,
        consent,
        answers,
      });

    setLastPayload(payload);
    setIsSubmitting(true);
    setSubmitError(null);

    if (!ENABLE_BACKEND) {
      setSaveStatus("local_only");
      setSubmitError(
        lang === "de"
          ? "Backend ist aktuell deaktiviert. Das Ergebnis bleibt als Sicherheitskopie im Browser."
          : "Backend is currently disabled. The result remains kept as a browser backup.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await sendPayloadToBackend(payload);
      setSubmittedId(data.result.id);
      setSaveStatus("database_saved");
      setSubmitError(null);
    } catch {
      setSaveStatus("database_failed");
      setSubmitError(getDatabaseErrorMessage(lang));
    } finally {
      setIsSubmitting(false);
    }
  }

  function startNewTest() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    resetStateValues();
    setSubmittedId(null);
    setSubmitError(null);
    setSaveStatus("idle");
    setLastPayload(null);
  }

  if (!isReady || isIntro) {
    return <TestIntro lang={lang} onNext={goNext} />;
  }

  if (isProfileStep) {
    return (
      <CollectiveNameQuestion
        lang={lang}
        collectiveName={collectiveName}
        website={website}
        instagram={instagram}
        onNameChange={setCollectiveName}
        onWebsiteChange={setWebsite}
        onInstagramChange={setInstagram}
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  if (isPlacesStep) {
    return (
      <CollectivePlacesQuestion
        lang={lang}
        places={places}
        noFixedBase={noFixedBase}
        consent={consent}
        isSubmitting={isSubmitting}
        onPlacesChange={setPlaces}
        onNoFixedBaseChange={setNoFixedBase}
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
            ? `${RESULTS_PAGE_HREF[lang]}?highlight=${encodeURIComponent(
                submittedId,
              )}`
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
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <p className="paragraph">
            {lang === "de"
              ? "Der gespeicherte Teststand konnte nicht eindeutig zugeordnet werden."
              : "The saved test state could not be matched."}
          </p>
          <Button
            variant="primary"
            icon="arrow-counter-clockwise"
            onClick={startNewTest}
          >
            {lang === "de" ? "Test neu starten" : "Start test again"}
          </Button>
        </div>
      </section>
    );
  }

  if (currentQuestion.type === "slider") {
    const currentValue =
      typeof answers[currentQuestion.id] === "number"
        ? (answers[currentQuestion.id] as number)
        : 50;
    const actsVirtually = getBooleanAnswerForStorage(
      answers,
      "actsVirtually",
      false,
    );

    return (
      <SliderQuestion
        lang={lang}
        question={currentQuestion}
        value={currentValue}
        answers={answers}
        isVirtualOptionVisible={currentQuestion.id === "space"}
        actsVirtually={actsVirtually}
        onVirtualChange={(value) => updateBooleanAnswer("actsVirtually", value)}
        onChange={(value) => updateSliderAnswer(currentQuestion.id, value)}
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  if (currentQuestion.type === "ranking") {
    const storedOrder = Array.isArray(answers[currentQuestion.id])
      ? (answers[currentQuestion.id] as string[])
      : [];
    const defaultOrder = currentQuestion.options.map((option) => option.id);
    const validStoredOrder = storedOrder.filter((id) =>
      defaultOrder.includes(id),
    );
    const missingIds = defaultOrder.filter(
      (id) => !validStoredOrder.includes(id),
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
        answers={answers}
        onChange={(nextOrder) =>
          updateRankingAnswer(currentQuestion.id, nextOrder)
        }
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  if (currentQuestion.type === "goal-options") {
    const selectedGoalTopics = Array.isArray(answers[currentQuestion.id])
      ? (answers[currentQuestion.id] as string[])
      : [];
    const ownAnswerKey = `${currentQuestion.id}Other`;
    const ownAnswerValue = answers[ownAnswerKey];
    const ownAnswers = Array.isArray(ownAnswerValue)
      ? ownAnswerValue.filter(
          (value): value is string => typeof value === "string",
        )
      : typeof ownAnswerValue === "string"
        ? [ownAnswerValue]
        : [];

    return (
      <GoalOptionsQuestion
        lang={lang}
        question={currentQuestion}
        selectedValues={selectedGoalTopics}
        ownAnswers={ownAnswers}
        onToggleOption={(optionId) =>
          toggleGoalTopic(currentQuestion.id, optionId)
        }
        onOwnAnswersChange={(values) =>
          updateGoalTopicOther(ownAnswerKey, values)
        }
        onBack={goBack}
        onNext={goNext}
      />
    );
  }

  return null;
}

function getDatabaseErrorMessage(lang: Lang): string {
  return lang === "de"
    ? "Die Datenbank konnte gerade nicht erreicht werden. Bitte versuche es erneut. Das Ergebnis bleibt als Sicherheitskopie im Browser erhalten."
    : "The database could not be reached. Please try again. The result remains stored as a browser backup.";
}

function buildTestResultPayload({
  lang,
  collectiveName,
  website,
  instagram,
  places,
  noFixedBase,
  consent,
  answers,
}: {
  lang: Lang;
  collectiveName: string;
  website: string;
  instagram: string;
  places: PlaceSelection[];
  noFixedBase: boolean;
  consent: boolean;
  answers: TestAnswers;
}): TestResultPayload {
  const rankingOrder = getRankingAnswerForStorage(answers, "goals", [
    "political",
    "economic",
    "creative",
    "social",
    "ecological",
  ]);
  const values = {
    formalization: getNumericAnswerForStorage(answers, "formalization", 50),
    time: getNumericAnswerForStorage(answers, "time", 50),
    identity: getNumericAnswerForStorage(answers, "identity", 50),
    space: getNumericAnswerForStorage(answers, "space", 50),
  };
  const actsVirtually = getBooleanAnswerForStorage(
    answers,
    "actsVirtually",
    false,
  );
  const selectedGoalTopics = getRankingAnswerForStorage(
    answers,
    "goalTopics",
    [],
  );
  const ownGoalTopics = getStringArrayAnswerForStorage(
    answers,
    "goalTopicsOther",
  )
    .map((value) => value.trim())
    .filter(Boolean);
  const legacyLocation = getLegacyLocationFields(places);
  const cleanedAnswers: TestAnswers = {
    ...answers,
    formalization: values.formalization,
    time: values.time,
    identity: values.identity,
    space: values.space,
    actsVirtually,
    noFixedBase,
    goals: rankingOrder,
    goalTopics: selectedGoalTopics,
    goalTopicsOther: ownGoalTopics,
  };

  return {
    id: createLocalId(),
    createdAt: new Date().toISOString(),
    lang,
    collectiveName: collectiveName.trim(),
    website: website.trim(),
    instagram: instagram.trim(),
    ...legacyLocation,
    places,
    noFixedBase,
    consentPublic: consent,
    answers: cleanedAnswers,
    result: {
      archetypeId: getArchetypeId(answers),
      values,
      selectedAnswerIds: {
        formalization: getSliderSegmentId(
          "formalization",
          values.formalization,
        ),
        time: getSliderSegmentId("time", values.time),
        identity: getSliderSegmentId("identity", values.identity),
        space: getSliderSegmentId("space", values.space),
        actsVirtually,
        primaryGoal: rankingOrder[0] ?? "political",
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
        polygonSource: "slider_answers",
        fillSource: "ranking_order",
        rankingOrder,
        body: "diamond",
        items: getGraphicItems(answers),
      },
    },
  };
}

function getLegacyLocationFields(places: PlaceSelection[]): {
  location: string;
  region: string;
  country: string;
} {
  const place =
    places.find((item) => item.role === "base" && item.isPrimary) ??
    places.find((item) => item.role === "base") ??
    places.find((item) => item.role === "project") ??
    places[0];

  return {
    location: place?.city || place?.displayName || "",
    region: place?.region || "",
    country: place?.country || "",
  };
}

function getNumericAnswerForStorage(
  answers: TestAnswers,
  key: string,
  fallback: number,
): number {
  const value = answers[key];
  return typeof value === "number" ? value : fallback;
}

function getRankingAnswerForStorage(
  answers: TestAnswers,
  key: string,
  fallback: string[],
): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : fallback;
}

function getBooleanAnswerForStorage(
  answers: TestAnswers,
  key: string,
  fallback: boolean,
): boolean {
  const value = answers[key];
  return typeof value === "boolean" ? value : fallback;
}

function getStringArrayAnswerForStorage(
  answers: TestAnswers,
  key: string,
): string[] {
  const value = answers[key];

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? [value] : [];
  }

  return [];
}

function getSliderSegmentId(questionId: string, value: number): string {
  if (questionId === "identity") {
    if (value <= 25) return "identity_social_contact";
    if (value <= 50) return "identity_shared_values";
    if (value <= 75) return "identity_stable";
    return "identity_established";
  }

  if (questionId === "space") {
    if (value <= 25) return "space_local";
    if (value <= 50) return "space_multi_local";
    if (value <= 75) return "space_translocal";
    return "space_digital";
  }

  if (value <= 33) return `${questionId}_low`;
  if (value <= 66) return `${questionId}_medium`;
  return `${questionId}_high`;
}

function getArchetypeId(answers: TestAnswers): string {
  const formalization = getNumericAnswerForStorage(
    answers,
    "formalization",
    50,
  );
  const time = getNumericAnswerForStorage(answers, "time", 50);
  const identity = getNumericAnswerForStorage(answers, "identity", 50);
  const space = getNumericAnswerForStorage(answers, "space", 50);
  const actsVirtually = getBooleanAnswerForStorage(
    answers,
    "actsVirtually",
    false,
  );
  const rankingOrder = getRankingAnswerForStorage(answers, "goals", [
    "political",
    "economic",
    "creative",
    "social",
    "ecological",
  ]);
  const primaryGoal = rankingOrder[0] ?? "political";

  if (actsVirtually && space >= 50) return "networked_collective";
  if (formalization < 35 && time < 35) return "spontaneous_collective";
  if (identity > 65 && formalization > 60) return "structured_collective";
  if (space > 65) return "decentral_collective";
  if (primaryGoal === "political") return "activist_collective";
  return "hybrid_collective";
}

function getGraphicItems(answers: TestAnswers): string[] {
  const formalization = getNumericAnswerForStorage(
    answers,
    "formalization",
    50,
  );
  const time = getNumericAnswerForStorage(answers, "time", 50);
  const identity = getNumericAnswerForStorage(answers, "identity", 50);
  const space = getNumericAnswerForStorage(answers, "space", 50);
  const actsVirtually = getBooleanAnswerForStorage(
    answers,
    "actsVirtually",
    false,
  );
  const rankingOrder = getRankingAnswerForStorage(answers, "goals", [
    "political",
    "economic",
    "creative",
    "social",
    "ecological",
  ]);
  const primaryGoal = rankingOrder[0] ?? "political";

  return [
    formalization < 35 ? "balloon" : formalization < 67 ? "cap" : "briefcase",
    time < 35 ? "spark" : time < 67 ? "watch" : "backpack",
    identity < 35 ? "sunglasses" : identity < 67 ? "scarf" : "badge",
    space < 35 ? "house" : space < 67 ? "map" : "globe",
    actsVirtually ? "wifi" : "pin",
    getGoalGraphicItem(primaryGoal),
  ];
}

function getGoalGraphicItem(goalId: string): string {
  if (goalId === "political") return "megaphone";
  if (goalId === "economic") return "coin";
  if (goalId === "creative") return "paintbrush";
  if (goalId === "social") return "heart";
  if (goalId === "ecological") return "tree";
  return "star";
}

function splitLegacyContact(value: string): {
  website: string;
  instagram: string;
} {
  const trimmed = value.trim();
  const isInstagram =
    trimmed.startsWith("@") || /instagram\.com/i.test(trimmed);

  return isInstagram
    ? { website: "", instagram: trimmed }
    : { website: trimmed, instagram: "" };
}

function createLegacyPlaceSelection(
  location: string,
  region: string,
  country: string,
): PlaceSelection | null {
  const values = [location, region, country].map((value) => value.trim());
  if (!values.some(Boolean)) return null;

  const displayName = values.filter(Boolean).join(", ");

  return {
    provider: "legacy",
    providerPlaceId: normalizeId(displayName),
    displayName,
    placeType: location ? "city" : region ? "region" : "country",
    postalCode: "",
    neighbourhood: "",
    district: "",
    city: location,
    region,
    country,
    countryCode: "",
    latitude: null,
    longitude: null,
    role: "base",
    isPrimary: true,
  };
}

function readSavedPlaces(value: unknown): PlaceSelection[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is PlaceSelection =>
      typeof item === "object" &&
      item !== null &&
      "provider" in item &&
      typeof (item as { provider?: unknown }).provider === "string" &&
      "providerPlaceId" in item &&
      typeof (item as { providerPlaceId?: unknown }).providerPlaceId ===
        "string" &&
      "role" in item &&
      ["base", "project", "activity_area"].includes(
        String((item as { role?: unknown }).role),
      ),
  );
}

function hasSavedResult(value: unknown): value is { result: { id: string } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "result" in value &&
    typeof (value as { result?: unknown }).result === "object" &&
    (value as { result: { id?: unknown } }).result !== null &&
    typeof (value as { result: { id?: unknown } }).result.id === "string"
  );
}

function normalizeId(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown"
  );
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
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
  window.localStorage.setItem(
    LOCAL_RESULTS_KEY,
    JSON.stringify([...currentResults, payload]),
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
