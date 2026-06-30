// src/components/test/SliderQuestion.tsx

import type { Lang } from '../../data/siteContent';
import type { SliderQuestion as SliderQuestionType } from '../../data/testQuestions';
import TestNavigation from './TestNavigation';
import QuestionLineGraphic from './QuestionLineGraphic';
import QuestionMainGraphic from './QuestionMainGraphic';

type Answers = Record<string, number | string[]>;

type Props = {
  lang: Lang;
  question: SliderQuestionType;
  value: number;
  answers: Answers;
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
  answers,
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

        <QuestionLineGraphic
  mode="slider"
  currentQuestionId={question.id}
  answers={answers}
/>
      </div>

         <QuestionMainGraphic questionId={question.id} value={value} />
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

