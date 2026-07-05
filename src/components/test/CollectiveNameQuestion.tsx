// src/components/test/CollectiveNameQuestion.tsx

import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  collectiveName: string;
  websiteOrInstagram: string;
  location: string;
  consent: boolean;
  onNameChange: (value: string) => void;
  onWebsiteOrInstagramChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    titleStart: 'Erzählt uns kurz, wer euer',
    titleHighlight: 'Kollektiv',
    titleEnd: 'ist',
    nameLabel: 'Kollektivname',
    namePlaceholder: 'Name eingeben',
    websiteLabel: 'Website oder Instagram',
    websitePlaceholder: 'https://… oder @name',
    locationLabel: 'Standort',
    locationPlaceholder: 'z. B. Berlin-Neukölln, Potsdam, Brandenburg',
    consent:
      'Ich stimme zu, dass Name, Standort, Website/Insta und Ergebnis öffentlich auf der Website angezeigt werden dürfen.',
  },
  en: {
    titleStart: 'Tell us briefly who your',
    titleHighlight: 'collective',
    titleEnd: 'is',
    nameLabel: 'Collective name',
    namePlaceholder: 'Enter name',
    websiteLabel: 'Website or Instagram',
    websitePlaceholder: 'https://… or @name',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g. Berlin-Neukölln, Potsdam, Brandenburg',
    consent:
      'I agree that name, location, website/Insta and result may be shown publicly on the website.',
  },
} as const;

export default function CollectiveNameQuestion({
  lang,
  collectiveName,
  websiteOrInstagram,
  location,
  consent,
  onNameChange,
  onWebsiteOrInstagramChange,
  onLocationChange,
  onConsentChange,
  onBack,
  onNext,
}: Props) {
  const t = text[lang];

  return (
    <section className="test-screen name-screen">
      <div className="name-content">
        <h1 className="name-title">
          <span className="heading3">{t.titleStart}</span>{' '}
          <span className="script-heading3">{t.titleHighlight}</span>{' '}
          <span className="heading3">{t.titleEnd}</span>
        </h1>

        <label className="name-field">
          <span className="label">{t.nameLabel}</span>

          <input
            type="text"
            value={collectiveName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={t.namePlaceholder}
          />
        </label>

        <label className="name-field">
          <span className="label">{t.websiteLabel}</span>

          <input
            type="text"
            value={websiteOrInstagram}
            onChange={(event) => onWebsiteOrInstagramChange(event.target.value)}
            placeholder={t.websitePlaceholder}
          />
        </label>

        <label className="name-field">
          <span className="label">{t.locationLabel}</span>

          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder={t.locationPlaceholder}
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

          <span className='paragraph'>{t.consent}</span>
        </label>
      </div>

      <TestNavigation lang={lang} onBack={onBack} onNext={onNext} />
    </section>
  );
}
