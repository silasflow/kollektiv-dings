// src/components/test/ResultScreen.tsx

import { useEffect, useState } from 'react';
import type { Lang } from '../../data/siteContent';
import type { TestAnswers } from '../../data/testQuestions';
import Button from '../common/Button';
import QuestionLineGraphic from './QuestionLineGraphic';
import './ResultScreen.css';

type SaveStatus =
  | 'idle'
  | 'database_saved'
  | 'database_failed'
  | 'local_only';

type Props = {
  lang: Lang;
  answers: TestAnswers;
  collectiveName: string;
  isSubmitting: boolean;
  saveStatus: SaveStatus;
  submitError: string | null;
  resultsPageHref: string;
  onBack: () => void;
  onRetry: () => void;
  onRestart: () => void;
};

type LineGraphicAnswers = Record<string, number | string[]>;

type ResultAnswer = {
  label: string;
  text: string;
};



const text = {
  de: {
    kicker: 'Euer Kollektiv',
    fallbackName: 'Euer Kollektiv',
    intro: 'Euer Kollektiv zeichnet sich durch Folgendes aus:',
    saved: 'Ergebnis gespeichert',
    locallySaved: 'Ergebnis lokal gesichert',
    restart: 'Test neu starten',
    universe: 'Zum Ergebnis-Kosmos',
    errorKicker: 'Speichern nicht möglich',
    errorTitle: 'Die Datenbank konnte nicht erreicht werden',
    errorBody:
      'Euer Ergebnis wurde sicherheitshalber in diesem Browser gespeichert. Ihr könnt den Versand erneut versuchen.',
    retry: 'Erneut senden',
    retrying: 'Wird gesendet …',
  },
  en: {
    kicker: 'Your collective',
    fallbackName: 'Your collective',
    intro: 'Your collective is characterised by the following:',
    saved: 'Result saved',
    locallySaved: 'Result saved locally',
    restart: 'Start new test',
    universe: 'View result universe',
    errorKicker: 'Saving failed',
    errorTitle: 'The database could not be reached',
    errorBody:
      'Your result was safely stored in this browser. You can try sending it again.',
    retry: 'Send again',
    retrying: 'Sending …',
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
  },
  en: {
    political_topic: 'Political',
    encounter: 'Encounter',
    climate: 'Climate',
    sport: 'Sport',
    equality: 'Equality',
    health: 'Health',
  },
} as const;

export default function ResultScreen({
  lang,
  answers,
  collectiveName,
  isSubmitting,
  saveStatus,
  submitError,
  resultsPageHref,
  onBack,
  onRetry,
  onRestart,
}: Props) {
  const t = text[lang];

  const hasSaveError =
    saveStatus === 'database_failed' ||
    saveStatus === 'local_only';

  const [isErrorModalOpen, setIsErrorModalOpen] =
    useState(hasSaveError);

  useEffect(() => {
    if (hasSaveError) {
      setIsErrorModalOpen(true);
    }
  }, [hasSaveError]);

  const orderedValues = getStringArrayAnswer(answers, 'goals', [
    'political',
    'economic',
    'creative',
    'social',
  ]);

  const resultAnswers = getResultAnswers(lang, answers);
  const goalTopics = getGoalTopics(lang, answers);

  
  return (
    <section className="test-screen result-screen result-screen--scrollable">
      <div className="result-page">
        <header className="result-page__header">
          <p className="result-kicker script-heading4">{t.kicker}</p>
        </header>

        <div className="result-page__hero">
          <h1 className="result-collective-name heading3">
            {collectiveName.trim() || t.fallbackName}
          </h1>

          <div className="result-graphic-card" aria-hidden="true">
            <QuestionLineGraphic
              mode="ranking"
              answers={getLineGraphicAnswers(answers)}
              orderedValues={orderedValues}
            />
          </div>
        </div>

        <section className="result-page__details">
          <p className="result-intro paragraph">{t.intro}</p>

          {goalTopics.length > 0 && (
            <div
              className="result-goal-tags"
              aria-label={
                lang === 'de'
                  ? 'Handlungsfelder und Ziele'
                  : 'Fields of action and goals'
              }
            >
              {goalTopics.map((goal) => (
                <span className="result-goal-tag paragraph" key={goal}>
                  {goal}
                </span>
              ))}
            </div>
          )}

          <div className="result-answer-list">
            {resultAnswers.map((answer, index) => (
              <article className="result-answer" key={`${answer.label}-${index}`}>
                <p className="result-answer__label label">{answer.label}</p>
                <p className="result-answer__text paragraph">{answer.text}</p>
              </article>
            ))}
          </div>
        </section>

        {saveStatus === 'database_saved' && (
          <p className="result-save-note paragraph" role="status">
            <i className="ph-bold ph-check" aria-hidden="true" />
            {t.saved}
          </p>
        )}

        {saveStatus === 'local_only' && (
          <p className="result-save-note paragraph" role="status">
            <i className="ph-bold ph-warning" aria-hidden="true" />
            {t.locallySaved}
          </p>
        )}

        <footer className="result-submit-actions">
          <Button
            variant="secondary"
            icon="arrow-left"
            onClick={onBack}
            disabled={isSubmitting}
          />

          <Button
            variant="secondary"
            icon="arrow-counter-clockwise"
            onClick={onRestart}
            disabled={isSubmitting}
          >
            {t.restart}
          </Button>

          <Button
            variant="primary"
            icon="arrow-up-right"
            href={resultsPageHref}
          >
            {t.universe}
          </Button>
        </footer>
      </div>

      {hasSaveError && isErrorModalOpen && (
        <div
          className="save-error-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-error-title"
        >
          <div className="save-error-modal__backdrop" aria-hidden="true" />

          <div className="save-error-modal__content">
            <button
  type="button"
  className="save-error-modal__close"
  onClick={() => setIsErrorModalOpen(false)}
  aria-label={
    lang === 'de'
      ? 'Hinweis schließen'
      : 'Close notice'
  }
>
  <i className="ph-bold ph-x" aria-hidden="true" />
</button>
            <p className="save-error-modal__kicker script-heading4">
              {t.errorKicker}
            </p>

            <h2 id="save-error-title" className="heading4">
              {t.errorTitle}
            </h2>

            <p className="paragraph">
              {submitError || t.errorBody}
            </p>

            <div className="save-error-modal__actions">
  <Button
    variant="secondary"
    onClick={() => setIsErrorModalOpen(false)}
  >
    {lang === 'de'
      ? 'Trotzdem Ergebnis ansehen'
      : 'View result anyway'}
  </Button>

  <Button
    variant="primary"
    icon="upload-simple"
    onClick={onRetry}
    disabled={isSubmitting}
  >
    {isSubmitting ? t.retrying : t.retry}
  </Button>
</div>
          </div>
        </div>
      )}
    </section>
  );
}

function getLineGraphicAnswers(
  answers: TestAnswers
): LineGraphicAnswers {
  const graphicAnswers: LineGraphicAnswers = {};

  Object.entries(answers).forEach(([key, value]) => {
    if (typeof value === 'number' || Array.isArray(value)) {
      graphicAnswers[key] = value;
    }
  });

  return graphicAnswers;
}

function getResultAnswers(
  lang: Lang,
  answers: TestAnswers
): ResultAnswer[] {
  const formalization = getNumericAnswer(
    answers,
    'formalization',
    50
  );
  const time = getNumericAnswer(answers, 'time', 50);
  const identity = getNumericAnswer(answers, 'identity', 50);
  const space = getNumericAnswer(answers, 'space', 50);
  const actsVirtually = getBooleanAnswer(
    answers,
    'actsVirtually',
    false
  );

  if (lang === 'de') {
    return [
      getFormalizationAnswerDe(formalization),
      getTimeAnswerDe(time),
      getIdentityAnswerDe(identity),
      getSpaceAnswerDe(space, actsVirtually),
    ];
  }

  return [
    getFormalizationAnswerEn(formalization),
    getTimeAnswerEn(time),
    getIdentityAnswerEn(identity),
    getSpaceAnswerEn(space, actsVirtually),
  ];
}

function getFormalizationAnswerDe(value: number): ResultAnswer {
  if (value <= 33) {
    return {
      label: 'Informell',
      text:
        'Ihr organisiert euch flexibel und ohne viele feste Regeln. Entscheidungen entstehen vor allem im direkten Austausch.',
    };
  }

  if (value <= 66) {
    return {
      label: 'Teilweise organisiert',
      text:
        'Ihr verbindet informelle Zusammenarbeit mit ersten festen Strukturen, Rollen oder Absprachen.',
    };
  }

  return {
    label: 'Formal organisiert',
    text:
      'Ihr arbeitet mit klaren Zuständigkeiten, geregelten Abläufen und verbindlichen Strukturen.',
  };
}

function getTimeAnswerDe(value: number): ResultAnswer {
  if (value <= 33) {
    return {
      label: 'Spontan',
      text:
        'Ihr kommt anlassbezogen zusammen und könnt euch nach einer Aktion oder einem Projekt schnell wieder auflösen.',
    };
  }

  if (value <= 66) {
    return {
      label: 'Projektbezogen',
      text:
        'Ihr arbeitet über einen längeren Zeitraum zusammen, häufig entlang konkreter Projekte oder gemeinsamer Vorhaben.',
    };
  }

  return {
    label: 'Langfristig',
    text:
      'Euer Kollektiv ist auf Dauer angelegt und entwickelt sich kontinuierlich über längere Zeiträume weiter.',
  };
}

function getIdentityAnswerDe(value: number): ResultAnswer {
  if (value <= 25) {
    return {
      label: 'Über Begegnung verbunden',
      text:
        'Euer Zusammenhalt entsteht vor allem durch persönliche Kontakte und gemeinsame Situationen.',
    };
  }

  if (value <= 50) {
    return {
      label: 'Durch gemeinsame Werte verbunden',
      text:
        'Gemeinsame Überzeugungen, Ziele und Haltungen bilden den Kern eures Kollektivs.',
    };
  }

  if (value <= 75) {
    return {
      label: 'Stabile Gemeinschaft',
      text:
        'Ihr versteht euch als feste Gruppe mit einer gewachsenen gemeinsamen Identität.',
    };
  }

  return {
    label: 'Etabliertes Kollektiv',
    text:
      'Euer Kollektiv besitzt eine klar erkennbare Identität, die auch nach außen sichtbar und etabliert ist.',
  };
}

function getSpaceAnswerDe(
  value: number,
  actsVirtually: boolean
): ResultAnswer {
  if (actsVirtually) {
    return {
      label: 'Digital und vernetzt',
      text:
        'Ihr arbeitet auch digital und seid nicht vollständig an einen gemeinsamen physischen Ort gebunden.',
    };
  }

  if (value <= 25) {
    return {
      label: 'Lokal',
      text:
        'Eure Aktivitäten konzentrieren sich auf einen konkreten Ort, ein Quartier oder eine direkte Nachbarschaft.',
    };
  }

  if (value <= 50) {
    return {
      label: 'An mehreren Orten',
      text:
        'Ihr seid an mehreren Orten aktiv, bleibt aber räumlich in einer Region oder Stadt verankert.',
    };
  }

  if (value <= 75) {
    return {
      label: 'Überregional',
      text:
        'Euer Kollektiv verbindet verschiedene Orte und arbeitet über lokale Grenzen hinweg.',
    };
  }

  return {
    label: 'Dezentral',
    text:
      'Ihr seid räumlich verteilt organisiert und nicht an einen festen gemeinsamen Ort gebunden.',
  };
}

function getFormalizationAnswerEn(value: number): ResultAnswer {
  if (value <= 33) {
    return {
      label: 'Informal',
      text:
        'You organise flexibly without many fixed rules. Decisions mainly emerge through direct exchange.',
    };
  }

  if (value <= 66) {
    return {
      label: 'Partly organised',
      text:
        'You combine informal collaboration with some fixed structures, roles or agreements.',
    };
  }

  return {
    label: 'Formally organised',
    text:
      'You work with clear responsibilities, defined processes and binding structures.',
  };
}

function getTimeAnswerEn(value: number): ResultAnswer {
  if (value <= 33) {
    return {
      label: 'Spontaneous',
      text:
        'You come together around a particular occasion and may dissolve again after an action or project.',
    };
  }

  if (value <= 66) {
    return {
      label: 'Project-based',
      text:
        'You collaborate over a longer period, often around specific projects or shared plans.',
    };
  }

  return {
    label: 'Long-term',
    text:
      'Your collective is designed to last and develops continuously over longer periods.',
  };
}

function getIdentityAnswerEn(value: number): ResultAnswer {
  if (value <= 25) {
    return {
      label: 'Connected through encounters',
      text:
        'Your connection is primarily created through personal contact and shared situations.',
    };
  }

  if (value <= 50) {
    return {
      label: 'Connected through shared values',
      text:
        'Shared beliefs, goals and attitudes form the core of your collective.',
    };
  }

  if (value <= 75) {
    return {
      label: 'Stable community',
      text:
        'You see yourselves as an established group with a shared identity.',
    };
  }

  return {
    label: 'Established collective',
    text:
      'Your collective has a clearly recognisable identity that is also visible externally.',
  };
}

function getSpaceAnswerEn(
  value: number,
  actsVirtually: boolean
): ResultAnswer {
  if (actsVirtually) {
    return {
      label: 'Digital and connected',
      text:
        'You also work digitally and are not fully tied to one shared physical location.',
    };
  }

  if (value <= 25) {
    return {
      label: 'Local',
      text:
        'Your activities focus on a specific place, neighbourhood or local area.',
    };
  }

  if (value <= 50) {
    return {
      label: 'Multi-local',
      text:
        'You are active in several places while remaining rooted in one region or city.',
    };
  }

  if (value <= 75) {
    return {
      label: 'Translocal',
      text:
        'Your collective connects different places and works beyond local boundaries.',
    };
  }

  return {
    label: 'Decentralised',
    text:
      'You are spatially distributed and are not tied to one permanent shared location.',
  };
}

function getGoalTopics(
  lang: Lang,
  answers: TestAnswers
): string[] {
  const selected = getStringArrayAnswer(
    answers,
    'goalTopics',
    []
  );

  const own = getStringArrayAnswer(
    answers,
    'goalTopicsOther',
    []
  )
    .map((value) => value.trim())
    .filter(Boolean);

  const labels = goalLabels[lang] as Record<string, string>;

  return [
    ...selected.map((id) => labels[id] ?? id),
    ...own,
  ];
}

function getNumericAnswer(
  answers: TestAnswers,
  key: string,
  fallback: number
): number {
  const value = answers[key];
  return typeof value === 'number' ? value : fallback;
}

function getBooleanAnswer(
  answers: TestAnswers,
  key: string,
  fallback: boolean
): boolean {
  const value = answers[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getStringArrayAnswer(
  answers: TestAnswers,
  key: string,
  fallback: string[]
): string[] {
  const value = answers[key];

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string'
    );
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return fallback;
}