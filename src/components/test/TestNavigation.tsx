// src/components/test/TestNavigation.tsx

import type { Lang } from '../../data/siteContent';
import Button from '../common/Button';

type Props = {
  lang: Lang;
  onNext: () => void;
  onBack?: () => void;
  backHref?: string;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextIcon?: string;
};

const text = {
  de: {
    back: 'Zurück',
    next: 'Weiter',
  },
  en: {
    back: 'Back',
    next: 'Next',
  },
} as const;

export default function TestNavigation({
  lang,
  onNext,
  onBack,
  backHref,
  nextDisabled = false,
  nextLabel,
  nextIcon = 'arrow-right',
}: Props) {
  const t = text[lang];

  return (
    <nav className="test-navigation" aria-label="Testnavigation">
      {backHref ? (
        // <a className="nav-button nav-button--secondary" href={backHref}>
        //   <i className="ph-bold ph-arrow-left" aria-hidden="true" />
        //   <span className="sr-only">{t.back}</span>
        // </a>
        <Button
          variant="secondary"
          href={backHref}
          icon="arrow-left"
          onClick={onBack}
				/>
      ) : (
        // <button
        //   className="nav-button nav-button--secondary"
        //   type="button"
        //   onClick={onBack}
        //   disabled={!onBack}
        // >
        //   <i className="ph-bold ph-arrow-left" aria-hidden="true" />
        //   <span className="sr-only">{t.back}</span>
        //   </button>
        <Button
					variant="secondary"
          icon="arrow-left"
          onClick={onBack}
          disabled={!onBack}
				/>
      )}

      {/* <button
        className="nav-button nav-button--primary"
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
      >
        <span>{t.next}</span>
        <i className="ph-bold ph-arrow-right" aria-hidden="true" />
      </button> */}
      <Button
        variant="primary"
        icon={nextIcon}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel ?? t.next}
      </Button>
    </nav>
  );
}