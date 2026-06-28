import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  onNext: () => void;
};

const text = {
  de: {
    introTitle: 'Wie geht das?',
    introText: 'Bewege den Regler von links nach rechts, um eine Antwort auszuwählen.',
    sliderStart: 'Von A',
    sliderEnd: 'Bis B',
    back: 'Zurück',
    next: 'Weiter',
  },
  en: {
    introTitle: 'How does it work?',
    introText: 'Move the slider from left to right to select an answer.',
    sliderStart: 'From A',
    sliderEnd: 'To B',
    back: 'Back',
    next: 'Next',
  },
} as const;

export default function TestIntro({ lang, onNext }: Props) {
  const t = text[lang];

  return (
    <section className="test-screen" aria-labelledby="intro-title">

      <div className="intro-content">
        <div>
          <h1 id="intro-title" className="intro-title">
            {t.introTitle}
          </h1>

          <p className="intro-text">
            {t.introText}
          </p>
        </div>

        <div className="slider-demo" aria-hidden="true">
          <div className="slider-line" />

          <div className="slider-card">
            <div className="slider-labels">
              <span>{t.sliderStart}</span>
              <span>{t.sliderEnd}</span>
            </div>
          </div>

          <div className="slider-thumb">
            <i className="ph-bold ph-dots-six-vertical" />
          </div>

          <div className="hand">
            <i className="ph-bold ph-hand-tap" />
          </div>
        </div>
      </div>

      <TestNavigation
  lang={lang}
  backHref={`/${lang}/`}
  onNext={onNext}
/>
    </section>
  );
}