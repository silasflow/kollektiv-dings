// src/components/test/SliderQuestion.tsx

import type { Lang } from '../../data/siteContent';
import type { SliderQuestion as SliderQuestionType } from '../../data/testQuestions';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  question: SliderQuestionType;
  value: number;
  onChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
};

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

export default function SliderQuestion({
  lang,
  question,
  value,
  onChange,
  onBack,
  onNext,
}: Props) {
  const answerText = getAnswerText(question, value, lang);
  const valueLabel = getValueLabel(question, value, lang);

  return (
    <section className="test-screen question-screen">
      <div className="question-top">
        <div className="question-copy">
          <p className="question-category">{question.category[lang]}</p>

          <h1 className="question-title">{question.title[lang]}</h1>
        </div>

        <QuestionLineGraphic value={value} />
      </div>

         <QuestionMainGraphic graphic={question.graphic} value={value} />
      <p className="question-answer-text">{answerText}</p>

      <div className="slider-answer-card">
        <h2>{valueLabel}</h2>

        <div className="range-wrap">
          <input
            className="range-input"
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label={question.title[lang]}
          />

          <div
            className="range-thumb-visual"
            style={{ left: `${value}%` }}
            aria-hidden="true"
          >
            <i className="ph-bold ph-dots-six-vertical" />
          </div>
        </div>

        <div className="slider-answer-labels">
          <span>{question.minLabel[lang]}</span>
          <span>{question.maxLabel[lang]}</span>
        </div>
      </div>

      <TestNavigation lang={lang} onBack={onBack} onNext={onNext} />
    </section>
  );
}

function QuestionLineGraphic({ value }: { value: number }) {
  return (
    <div className="question-line-graphic" aria-hidden="true">
      <div className="line-graphic-axis line-graphic-axis--x" />
      <div className="line-graphic-axis line-graphic-axis--y" />

      <span className="line-graphic-dot" style={{ left: `${20 + value * 0.55}%`, top: '28%' }}>
        ×
      </span>

      <span className="line-graphic-dot" style={{ left: `${78 - value * 0.25}%`, top: '50%' }}>
        ×
      </span>
    </div>
  );
}

function QuestionMainGraphic({
  graphic,
  value,
}: {
  graphic: SliderQuestionType['graphic'];
  value: number;
}) {
  return (
    <div className={`question-main-graphic question-main-graphic--${graphic}`} aria-hidden="true">
      <div
        className="main-diamond main-diamond--outer"
        style={{
          transform: `rotate(45deg) scale(${0.75 + value / 260})`,
          opacity: 0.35 + value / 260,
        }}
      />

      <div
        className="main-diamond main-diamond--inner"
        style={{
          transform: `rotate(45deg) scale(${0.45 + value / 220})`,
        }}
      />
    </div>
  );
}