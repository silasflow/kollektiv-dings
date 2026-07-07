// src/components/test/SliderQuestion.tsx

import type { Lang } from '../../data/siteContent';
import type {
  SliderQuestion as SliderQuestionType,
  TestAnswers,
} from '../../data/testQuestions';
import TestNavigation from './TestNavigation';
import QuestionLineGraphic from './QuestionLineGraphic';
import QuestionMainGraphic from './QuestionMainGraphic';

type LineGraphicAnswers = Record<string, number | string[]>;

type Props = {
  lang: Lang;
  question: SliderQuestionType;
  value: number;
  answers: TestAnswers;
  isVirtualOptionVisible?: boolean;
  actsVirtually?: boolean;
  onVirtualChange?: (value: boolean) => void;
  onChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
};

function getLineGraphicAnswers(answers: TestAnswers): LineGraphicAnswers {
  const graphicAnswers: LineGraphicAnswers = {};

  Object.entries(answers).forEach(([key, value]) => {
    if (typeof value === 'number' || Array.isArray(value)) {
      graphicAnswers[key] = value;
    }
  });

  return graphicAnswers;
}

function getAnswerText(question: SliderQuestionType, value: number, lang: Lang) {
  const match =
    question.answerTexts.find((answer) => value >= answer.min && value <= answer.max) ??
    question.answerTexts[0];

  return match.text[lang];
}

function getValueLabel(question: SliderQuestionType, value: number, lang: Lang) {
  const match =
    question.valueLabels.find((item) => value >= item.min && value <= item.max) ??
    question.valueLabels[0];

  return match.label[lang];
}

function getValueRange(question: SliderQuestionType, value: number) {
  return (
    question.valueLabels.find((item) => value >= item.min && value <= item.max) ??
    question.valueLabels[0]
  );
}

function getThresholds(question: SliderQuestionType) {
  return question.valueLabels
    .map((item) => item.max)
    .filter((max) => max > 0 && max < 100);
}

const virtualText = {
  de: 'Wir agieren zusätzlich auch virtuell/digital.',
  en: 'We also operate virtually/digitally.',
} as const;

export default function SliderQuestion({
  lang,
  question,
  value,
  answers,
  isVirtualOptionVisible = false,
  actsVirtually = false,
  onVirtualChange,
  onChange,
  onBack,
  onNext,
}: Props) {
  const answerText = getAnswerText(question, value, lang);
  const valueLabel = getValueLabel(question, value, lang);
  const thresholds = getThresholds(question);

  return (
    <section className="test-screen question-screen">
      <div className="question-top">
        <div className="question-copy">
          <p className="question-category script-heading4">{question.category[lang]}</p>

          <h1 className="question-title heading3">{question.title[lang]}</h1>
        </div>

        <QuestionLineGraphic
  mode="slider"
  currentQuestionId={question.id}
  answers={getLineGraphicAnswers(answers)}
/>
      </div>

      <QuestionMainGraphic
        questionId={question.id}
        value={value}
        actsVirtually={actsVirtually}
      />

      <div className="question-container">
        <p className="question-answer-text paragraph-emphasised">{answerText}</p>

        <div className="slider-answer-card">
          <h2 className="heading3">{valueLabel}</h2>

          <div className="range-wrap">
           <input
  className="range-input"
  type="range"
  min="0"
  max="100"
  step="1"
  value={value}
  onChange={(event) => onChange(Number(event.target.value))}
  onKeyDown={(event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(0, value - 1));
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(100, value + 1));
    }
  }}
  aria-label={question.title[lang]}
/>

            <div
              className="range-thumb-visual"
              style={{ left: `${value}%` }}
              aria-hidden="true"
            >
              <i className="ph-bold ph-dots-six" />
            </div>
            <div className="range-thresholds" aria-hidden="true">
              {thresholds.map((threshold) => (
                <span
                  key={threshold}
                  className="range-threshold"
                  style={{ left: `${threshold}%` }}
                />
              ))}
            </div>
          </div>

          <div className="slider-answer-labels label">
            <span>{question.minLabel[lang]}</span>
            <span>{question.maxLabel[lang]}</span>
          </div>
        </div>

        {isVirtualOptionVisible && (
          <label className="consent-field">
            <input
              type="checkbox"
              checked={actsVirtually}
              onChange={(event) => onVirtualChange?.(event.target.checked)}
            />

            <span className="consent-box" aria-hidden="true">
              {actsVirtually && <i className="ph-bold ph-check" />}
            </span>

            <span>{virtualText[lang]}</span>
          </label>
        )}

        <TestNavigation lang={lang} onBack={onBack} onNext={onNext} />
      </div>
    </section>
  );
}
