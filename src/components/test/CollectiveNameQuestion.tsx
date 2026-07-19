// src/components/test/CollectiveNameQuestion.tsx

import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  collectiveName: string;
  website: string;
  instagram:string;
  location: string;
  region: string;
  country: string;
  consent: boolean;
  isSubmitting?: boolean;
  onNameChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    titleStart: 'Erzählt uns mehr über euer',
    titleHighlight: 'Kollektiv',
    nameLabel: 'Kollektivname',
    namePlaceholder: 'Name eingeben',
    websiteLabel: 'Website',
    websitePlaceholder: 'https://…',
    instagramLabel: 'Instagram',
    instagramPlaceholder: '@name',
    locationLabel: 'Stadt',
    locationPlaceholder: 'z. B. Berlin, Hamburg, München',
    regionLabel: 'Region',
    regionPlaceholder: 'z. B. Uckermark, Ruhrgebiet, Altmark',
    countryLabel:'Land',
    countryPlaceholder:'Deutschland, Österreich, Schweiz',
    consent:
      'Ich stimme zu, dass Name, Standort, Website/Insta und Ergebnis öffentlich auf der Website angezeigt werden dürfen.',
  },
  en: {
    titleStart: 'Tell us more about your',
    titleHighlight: 'collective',
    nameLabel: 'Collective name',
    namePlaceholder: 'Enter name',
    websiteLabel: 'Website',
    websitePlaceholder: 'https://…',
    instagramLabel: 'Instagram',
    instagramPlaceholder: '@name',
    locationLabel: 'City',
    locationPlaceholder: 'e.g. Berlin, Potsdam, Cottbus',
    regionLabel: 'Region',
    regionPlaceholder: 'e.g. Uckermark, Ruhrgebiet, Altmark',
    countryLabel: 'Country',
    countryPlaceholder: 'e.g. Germany, Austria, Switzerland',
    consent:
      'I agree that name, location, website/Insta and result may be shown publicly on the website.',
  },
} as const;

export default function CollectiveNameQuestion({
  lang,
  collectiveName,
  website,
  instagram,
  location,
  region,
  country,
  consent,
  isSubmitting = false,
  onNameChange,
  onWebsiteChange,
  onInstagramChange,
  onLocationChange,
  onRegionChange,
  onCountryChange,
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
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
            placeholder={t.websitePlaceholder}
          />
        </label>

        <label className="name-field">
          <span className="label">{t.instagramLabel}</span> 

          <input
            type="text"
            value={instagram}
            onChange={(event) => onInstagramChange(event.target.value)}
            placeholder={t.instagramPlaceholder}
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



        <label className="name-field">
          <span className="label">{t.regionLabel}</span>

          <input
            type="text"
            value={region}
            onChange={(event) => onRegionChange(event.target.value)}
            placeholder={t.regionPlaceholder}
          />
        </label>

        <label className="name-field">
          <span className="label">{t.countryLabel}</span> 

          <input
            type="text"
            value={country}
            onChange={(event) => onCountryChange(event.target.value)}
            placeholder={t.countryPlaceholder}
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

      <TestNavigation
  lang={lang}
  onBack={onBack}
  onNext={onNext}
  nextDisabled={isSubmitting}
  nextIcon="check"
  nextLabel={
    isSubmitting
      ? lang === 'de'
        ? 'Wird gespeichert …'
        : 'Saving …'
      : lang === 'de'
        ? 'Test abschließen'
        : 'Complete test'
  }
/>
    
    </section>

    

  );
}
