// src/components/test/RankingQuestion.tsx

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Lang } from '../../data/siteContent';
import type { RankingQuestion as RankingQuestionType } from '../../data/testQuestions';
import TestNavigation from './TestNavigation';
import QuestionLineGraphic from './QuestionLineGraphic';

type Answers = Record<string, number | string[] | boolean>;

type Props = {
  lang: Lang;
  question: RankingQuestionType;
  orderedValues: string[];
  answers: Answers;
  onChange: (nextOrder: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function RankingQuestion({
  lang,
  question,
  orderedValues,
  answers,
  onChange,
  onBack,
  onNext,
}: Props) {
  const itemIds =
    orderedValues.length > 0
      ? orderedValues
      : question.options.map((option) => option.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));

    onChange(arrayMove(itemIds, oldIndex, newIndex));
  }

  const sortedOptions = itemIds
    .map((id) => question.options.find((option) => option.id === id))
    .filter(Boolean) as RankingQuestionType['options'];

  return (
    <section className="test-screen question-screen ranking-screen">
      <div className="question-top">
        <div className="question-copy">
          <p className="question-category">{question.category[lang]}</p>
          <h1 className="question-title">{question.title[lang]}</h1>
        </div>

        <QuestionLineGraphic
          mode="ranking"
          answers={answers as Record<string, number | string[]>}
          orderedValues={orderedValues}
        />
      </div>

      <p className="question-answer-text">{question.description[lang]}</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ol className="ranking-list" aria-label={question.title[lang]}>
            {sortedOptions.map((option, index) => (
              <SortableRankingItem
                key={option.id}
                id={option.id}
                index={index}
                label={option.label[lang]}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <TestNavigation lang={lang} onBack={onBack} onNext={onNext} />
    </section>
  );
}

function SortableRankingItem({
  id,
  index,
  label,
}: {
  id: string;
  index: number;
  label: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`ranking-item ${isDragging ? 'ranking-item--dragging' : ''}`}
    >
      <span className="ranking-number">{index + 1}</span>

      <div className="ranking-card">
        <span className="ranking-label">{label}</span>

        <button
          className="ranking-handle"
          type="button"
          aria-label={`${label} verschieben`}
          {...attributes}
          {...listeners}
        >
          <i className="ph-bold ph-dots-six-vertical" />
        </button>
      </div>
    </li>
  );
}
