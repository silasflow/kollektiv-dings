import type { Lang } from '../../data/siteContent';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  onNext: () => void;
};

const text = {
  de: {
    introTitle: 'Wie funktioniert\’s?',
    introText:
      'Diesem Kollektiv-Check visualisiert eure Arbeitsweise, Entscheidungsprozesse und prägenden Themen und hilt euch bei der Reflexion und Diskussion',
    // introSubText:
    //   'Aus euren Antworten entsteht eine gemeinsame Visualisierung und ein Kollektiv-Typ als Grundlage für Reflexion, Diskussion und Vergleich.',
    cards: [
      {
        title: 'Antworten',
        text: 'Die Positionen der Regler verschieben die vier Achsen des Netzes. ',
        type: 'slider',
      },
      {
        title: 'Visualisierung',
        text: 'Jede Position verändert die Form eurer gemeinsamen Visualisierung.',
        type: 'axis',
      },
      // {
      //   title: 'Prioritäten',
      //   text: 'Ordnet die Arbeitsweisen danach, wie wichtig sie für euer Kollektiv sind. Das Ranking beeinflusst die Farbgebung.',
      //   type: 'diamond',
      // },
      // {
      //   title: 'Themen & Ziele',
      //   text: 'Wählt beliebig viele Themen aus oder ergänzt eigene Schwerpunkte. Diese Angaben beschreiben euer Kollektiv genauer.',
      //   type: 'check',
      // },
    ],
    resultTitle: 'Euer Ergebnis',
    resultText:
      'Am Ende erhaltet ihr einen Kollektiv-Typ mit individueller Visualisierung. Die Archetypen sind keine Bewertung und geben keine Handlungsempfehlungen.',
    resultNote: 'Es gibt keine richtigen oder falschen Ergebnisse.',
  },
  en: {
    introTitle: 'How does it work?',
    introText:
      'The collective check shows how your collective works, makes decisions and which topics shape your practice.',
    // introSubText:
    //   'Your answers create a shared visualization and a collective type as a basis for reflection, discussion and comparison.',
    cards: [
      {
        title: 'Answers',
        text: 'The slider positions move the four axes of the grid.',
        type: 'slider',
      },
      {
        title: 'Visualization',
        text: 'Each position changes the shape of your shared visualization.',
        type: 'axis',
      },
      // {
      //   title: 'Priorities',
      //   text: 'Rank the working methods by how important they are for your collective. The ranking influences the colors.',
      //   type: 'diamond',
      // },
      // {
      //   title: 'Topics & goals',
      //   text: 'Select as many topics as you like or add your own focus areas. These details describe your collective more precisely.',
      //   type: 'check',
      // },
    ],
    resultTitle: 'Your result',
    resultText:
      'At the end, you receive a collective type with an individual visualization. The archetypes are not an evaluation and do not give recommendations.',
    resultNote: 'There are no right or wrong results.',
  },
} as const;

function IntroVisual({ type }: { type: string }) {
  if (type === 'slider') {
    return (
      <div className="intro-demo-slider" aria-hidden="true">
        <div className="intro-demo-slider__line" />
        <div className="intro-demo-slider__thumb">
          <i className="ph-bold ph-dots-six" />
        </div>
        <div className="intro-demo-slider__hand">
          <img src="/icons/HandPointing.svg" alt="" />
        </div>
      </div>
    );
  }

  if (type === 'axis') {
    return (
      <div className="intro-demo-axis" aria-hidden="true">
        <div className="intro-demo-axis__x" />
        <div className="intro-demo-axis__y" />
        <span className="intro-demo-axis__cross intro-demo-axis__cross--top">×</span>
        <span className="intro-demo-axis__cross intro-demo-axis__cross--right">×</span>
        <span className="intro-demo-axis__cross intro-demo-axis__cross--bottom">×</span>
        <span className="intro-demo-axis__cross intro-demo-axis__cross--left">×</span>
      </div>
    );
  }

  if (type === 'diamond') {
    return (
      <div className="intro-demo-net" aria-hidden="true">
        <div className="intro-demo-net__x" />
        <div className="intro-demo-net__y" />
        <div className="intro-demo-net__shape" />
        <span className="intro-demo-net__cross intro-demo-net__cross--top">×</span>
        <span className="intro-demo-net__cross intro-demo-net__cross--right">×</span>
        <span className="intro-demo-net__cross intro-demo-net__cross--bottom">×</span>
        <span className="intro-demo-net__cross intro-demo-net__cross--left">×</span>
      </div>
    );
  }

  return (
    <div className="intro-mini-check" aria-hidden="true">
      <span />
      <span className="is-active">
        <i className="ph-bold ph-check" />
      </span>
      <span />
    </div>
  );
}

export default function TestIntro({ lang, onNext }: Props) {
  const t = text[lang];

  return (
    <section className="test-screen test-intro-screen" aria-labelledby="intro-title">
      <div className="intro-content intro-content--full">
        <div className="intro-hero-copy">
          <h1 id="intro-title" className="intro-title heading2">
            {t.introTitle}
          </h1>

          <p className="intro-text paragraph-emphasized">{t.introText}</p>
        </div>

        <div className="intro-steps" aria-label={lang === 'de' ? 'Ablauf des Checks' : 'How the check works'}>
          {t.cards.map((card, index) => (
            <article className="intro-step-card" key={card.title}>

              <div className="intro-step-visual">
                <IntroVisual type={card.type} />
              </div>

              <p className="intro-step-text paragraph">{card.text}</p>
            </article>
          ))}
        </div>

        {/* <div className="intro-result-card">
          <div className="intro-result-polaroid" aria-hidden="true">
            <div className="intro-result-polaroid__image">
              <div className="intro-result-character intro-result-character--left" />
              <div className="intro-result-character intro-result-character--right" />
            </div>
            <div className="intro-result-polaroid__caption">KOLLEKTIV TYP</div>
          </div>

          <div className="intro-result-copy">
            <h2 className="intro-result-title">{t.resultTitle}</h2>
            <p>{t.resultText}</p>
            <p className="intro-result-note">{t.resultNote}</p>
          </div>
        </div> */}
      </div>

      <TestNavigation lang={lang} backHref={`/${lang}/`} onNext={onNext} />
    </section>
  );
}