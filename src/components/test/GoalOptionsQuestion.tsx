// src/components/test/GoalOptionsQuestion.tsx

import type { Lang } from '../../data/siteContent';
import type { GoalOptionsQuestion as GoalOptionsQuestionType } from '../../data/testQuestions';
import Button from '../common/Button';
import TestNavigation from './TestNavigation';

type Props = {
  lang: Lang;
  question: GoalOptionsQuestionType;
  selectedValues: string[];
  ownAnswers: string[];
  onToggleOption: (optionId: string) => void;
  onOwnAnswersChange: (values: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

const text = {
  de: {
    addOwnAnswer: 'Weiteres Ziel hinzufügen',
    removeOwnAnswer: 'Entfernen',
  },
  en: {
    addOwnAnswer: 'Add another goal',
    removeOwnAnswer: 'Remove',
  },
} as const;

export default function GoalOptionsQuestion({
  lang,
  question,
  selectedValues,
  ownAnswers,
  onToggleOption,
  onOwnAnswersChange,
  onBack,
  onNext,
}: Props) {
  const visibleOwnAnswers = ownAnswers.length > 0 ? ownAnswers : [''];

  function updateOwnAnswer(index: number, value: string) {
    const baseAnswers = ownAnswers.length > 0 ? ownAnswers : [''];
    const nextAnswers = baseAnswers.map((answer, answerIndex) =>
      answerIndex === index ? value : answer
    );

    onOwnAnswersChange(nextAnswers);
  }

  function addOwnAnswer() {
    onOwnAnswersChange([...ownAnswers, '']);
  }

  function removeOwnAnswer(index: number) {
    const baseAnswers = ownAnswers.length > 0 ? ownAnswers : [''];
    const nextAnswers = baseAnswers.filter((_, answerIndex) => answerIndex !== index);

    onOwnAnswersChange(nextAnswers);
  }

  return (
    <section className="test-screen question-screen goal-options-screen">
      <div className="goal-options-content">
        <div className="question-copy goal-options-copy">
          <p className="question-category script-heading4">{question.category[lang]}</p>

          <h1 className="question-title heading3">{question.title[lang]}</h1>

          {/* <p className="paragraph-emphasized goal-options-description">
            {question.description[lang]}
          </p> */}
        </div>

        <div className="goal-options-scroll-area">
          <div className="goal-options-list" aria-label={question.title[lang]}>
            {question.options.map((option) => {
              const isChecked = selectedValues.includes(option.id);

              return (
                <label key={option.id} className="goal-option-field">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleOption(option.id)}
                  />

                  <span className="consent-box" aria-hidden="true">
                    {isChecked && <i className="ph-bold ph-check" />}
                  </span>

                  <span className="goal-option-label paragraph">
                    {option.label[lang]}
                  </span>
                </label>
              );
            })}

            <div className="goal-own-answer-group">
              <p className="goal-own-answer-title label">
                {question.ownAnswerLabel[lang]}
              </p>

              {visibleOwnAnswers.map((answer, index) => (
                <label
                  key={index}
                  className="goal-option-field goal-option-field--own"
                >
                  {/* <span
                    className="consent-box goal-option-box--empty"
                    aria-hidden="true"
                  /> */}

                  <span className="goal-own-answer">
                    <input
                      type="text"
                      value={answer}
                      onChange={(event) => updateOwnAnswer(index, event.target.value)}
                      placeholder={question.ownAnswerPlaceholder[lang]}
                    />

                    {(visibleOwnAnswers.length > 1 || answer.trim().length > 0) && (
                      <Button
                        variant="tertiary"
                        icon="x"
                        onClick={() => removeOwnAnswer(index)}
                      />
                    )}
                  </span>
                </label>
              ))}

              <Button
                variant="tertiary"
                icon="plus"
                onClick={addOwnAnswer}
              >
                {text[lang].addOwnAnswer}
              </Button>
              {/*               
              <button
                type="button"
                className="goal-own-add-button label"
                onClick={addOwnAnswer}
              >
                <i className="ph-bold ph-plus" aria-hidden="true" />
                <span>{text[lang].addOwnAnswer}</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <TestNavigation lang={lang} onBack={onBack} onNext={onNext} />
    </section>
  );
}