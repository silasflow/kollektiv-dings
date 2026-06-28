// src/components/test/CollectiveNameQuestion.tsx

import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  collectiveName: string;
  consent: boolean;
  onNameChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    titleStart: 'Wie heißt euer',
    titleHighlight: 'Kollektiv',
    titleEnd: '?',
    label: 'Kollektiv Name',
    placeholder: 'Name eingeben',
    consent:
      'Ich stimme zu, dass mein Ergebnis auf der Startseite angezeigt werden darf.',
  },
  en: {
    titleStart: 'What is your',
    titleHighlight: 'collective',
    titleEnd: ' called?',
    label: 'Collective name',
    placeholder: 'Enter name',
    consent:
      'I agree that my result may be displayed on the homepage.',
  },
} as const;

export default function CollectiveNameQuestion({
  lang,
  collectiveName,
  consent,
  onNameChange,
  onConsentChange,
  onBack,
  onNext,
}: Props) {
  const t = text[lang];

  return (
    <section className="test-screen name-screen">
      <div className="name-content">
        <h1 className="name-title">
          <span>{t.titleStart}</span>{' '}
          <span className="name-title-highlight">{t.titleHighlight}</span>
          <span>{t.titleEnd}</span>
        </h1>

        <label className="name-field">
          <span>{t.label}</span>

          <input
            type="text"
            value={collectiveName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={t.placeholder}
          />
        </label>

        <label className="consent-field">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
          />

          <span className="consent-box" aria-hidden="true">
            {consent && <i className="ph-bold ph-check" />}
          </span>

          <span>{t.consent}</span>
        </label>
      </div>

      <TestNavigation
        lang={lang}
        onBack={onBack}
        onNext={onNext}
      />
    </section>
  );
}