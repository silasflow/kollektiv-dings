// src/components/test/RankingQuestion.tsx

import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useState } from 'react';

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lang } from '../../data/siteContent';
import type {
  RankingQuestion as RankingQuestionType,
  TestAnswers,
} from '../../data/testQuestions';
import TestNavigation from './TestNavigation';
import QuestionLineGraphic from './QuestionLineGraphic';


type Props = {
  lang: Lang;
  question: RankingQuestionType;
  orderedValues: string[];
  answers: TestAnswers;
  onChange: (nextOrder: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

type LineGraphicAnswers = Record<string, number | string[]>;

function getLineGraphicAnswers(answers: TestAnswers): LineGraphicAnswers {
  const graphicAnswers: LineGraphicAnswers = {};

  Object.entries(answers).forEach(([key, value]) => {
    if (typeof value === 'number' || Array.isArray(value)) {
      graphicAnswers[key] = value;
    }
  });

  return graphicAnswers;
}

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
  const [selectedItemId, setSelectedItemId] = useState(itemIds[0]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setSelectedItemId(String(active.id));

    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));

    onChange(arrayMove(itemIds, oldIndex, newIndex));
  }

  const sortedOptions = itemIds
    .map((id) => question.options.find((option) => option.id === id))
    .filter(Boolean) as RankingQuestionType['options'];
  const selectedOption = sortedOptions.find((option) => option.id === selectedItemId) ?? sortedOptions[0];

  function handleRankingItemClick(id: string) {
    setSelectedItemId(id);
  }

  return (
    <section className="test-screen question-screen ranking-screen">
      <div className="question-top">
        <div className="question-copy">
          <p className="question-category script-heading4">{question.category[lang]}</p>
          <h1 className="question-title heading3">{question.title[lang]}</h1>
        </div>

        <QuestionLineGraphic
          mode="ranking"
          answers={getLineGraphicAnswers(answers)}
          orderedValues={orderedValues}
        />
      </div>



      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ol className="ranking-list" aria-label={question.title[lang]}>
            <p className="paragraph-emphasized">
              {selectedOption?.description?.[lang]}
            </p>
            {sortedOptions.map((option, index) => (
              <SortableRankingItem
                key={option.id}
                id={option.id}
                index={index}
                label={option.label[lang]}
                onClick={() => handleRankingItemClick(option.id)}
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
  onClick,
}: {
  id: string;
  index: number;
  label: string;
  onClick: () => void;
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
      <span className="ranking-number paragraph">{index + 1}</span>

      <div
        className="ranking-card"
        {...attributes}
        {...listeners}
        onClick={onClick}
      >
        <span className="ranking-label text-button">{label}</span>

        <span
          className="ranking-handle"
          aria-hidden="true"
        >
          <i className="ph-bold ph-dots-six-vertical" />
        </span>
      </div>
    </li>
  );
}
