import type { Lang } from "../../data/siteContent";
import TestNavigation from "./TestNavigation";

type Props = {
  lang: Lang;
  collectiveName: string;
  website: string;
  instagram: string;
  onNameChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    titleStart: "Erzählt uns mehr über euer",
    titleHighlight: "Kollektiv",
    nameLabel: "Kollektivname",
    namePlaceholder: "Name eingeben",
    websiteLabel: "Website",
    websitePlaceholder: "z. B. https://euer-kollektiv.de",
    instagramLabel: "Instagram",
    instagramPlaceholder: "z. B. @euerkollektiv",
    next: "Weiter zu den Orten",
  },
  en: {
    titleStart: "Tell us more about your",
    titleHighlight: "collective",
    nameLabel: "Collective name",
    namePlaceholder: "Enter name",
    websiteLabel: "Website",
    websitePlaceholder: "e.g. https://your-collective.org",
    instagramLabel: "Instagram",
    instagramPlaceholder: "e.g. @yourcollective",
    next: "Continue to locations",
  },
} as const;

export default function CollectiveNameQuestion({
  lang,
  collectiveName,
  website,
  instagram,
  onNameChange,
  onWebsiteChange,
  onInstagramChange,
  onBack,
  onNext,
}: Props) {
  const t = text[lang];

  return (
    <section className="test-screen name-screen">
      <div className="name-content">
        <h1 className="name-title">
          <span className="heading3">{t.titleStart}</span>{" "}
          <span className="script-heading3">{t.titleHighlight}</span>
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
            inputMode="url"
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
      </div>

      <TestNavigation
        lang={lang}
        onBack={onBack}
        onNext={onNext}
        nextIcon="arrow-right"
        nextLabel={t.next}
      />
    </section>
  );
}
