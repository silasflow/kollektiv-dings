// src/components/test/questionLineGraphicUtils.ts

export type Answers = Record<string, number | string[]>;

export type AxisSide = 'top' | 'right' | 'bottom' | 'left';

export type GraphicPoint = {
  id: string;
  left: number;
  top: number;
};

export const sliderAxisConfig = {
  formalization: 'top',
  time: 'right',
  identity: 'bottom',
  space: 'left',
} as const satisfies Record<string, AxisSide>;

export function getSliderQuestionOrder() {
  return ['formalization', 'time', 'identity', 'space'] as const;
}

export function projectValueToPoint(value: number, side: AxisSide) {
  const center = 50;
  const edge = 18;
  const clampedValue = Math.max(0, Math.min(100, value));
  const t = clampedValue / 100;

  switch (side) {
    case 'top':
      return {
        left: center,
        top: center - (center - edge) * t,
      };

    case 'right':
      return {
        left: center + (center - edge) * t,
        top: center,
      };

    case 'bottom':
      return {
        left: center,
        top: center + (center - edge) * t,
      };

    case 'left':
      return {
        left: center - (center - edge) * t,
        top: center,
      };
  }
}

export function getAllSliderPoints(answers: Answers): GraphicPoint[] {
  const sliderOrder = getSliderQuestionOrder();

  return sliderOrder.map((id) => {
    const value = typeof answers[id] === 'number' ? answers[id] : 50;
    const axis = sliderAxisConfig[id];

    return {
      id,
      ...projectValueToPoint(value, axis),
    };
  });
}

export function getVisibleSliderPoints({
  answers,
  currentQuestionId,
}: {
  answers: Answers;
  currentQuestionId: string;
}): GraphicPoint[] {
  const sliderOrder = getSliderQuestionOrder();
  const currentIndex = sliderOrder.indexOf(
    currentQuestionId as (typeof sliderOrder)[number]
  );

  return sliderOrder
    .filter((id, index) => {
      if (index > currentIndex) return false;

      const value = answers[id];
      return typeof value === 'number';
    })
    .map((id) => {
      const value = answers[id] as number;
      const axis = sliderAxisConfig[id];

      return {
        id,
        ...projectValueToPoint(value, axis),
      };
    });
}

export function getPolygonPointsFromAnswers(answers: Answers) {
  return getAllSliderPoints(answers)
    .map((point) => `${point.left},${point.top}`)
    .join(' ');
}

const rankingColors: Record<string, string> = {
  social: '#B8FF4F',
  economic: '#8568E8',
  political: '#003930',
  creative: '#CAFBE4',
  ecological: '#3c0855',
};

export function getGradientStopsFromRanking(orderedValues: string[]) {
  const colors = orderedValues.map((id) => rankingColors[id] ?? '#B8FF4F');

  return [
    { offset: '0%', color: colors[0] ?? '#B8FF4F' },
    { offset: '25%', color: colors[1] ?? '#8568E8' },
    { offset: '50%', color: colors[2] ?? '#74F2C8' },
    { offset: '75%', color: colors[3] ?? '#D8FBE5' },
    { offset: '100%', color: colors[4] ?? '#3c0855' },
  ];
}

export function getGradientDirectionFromRanking(orderedValues: string[]) {
  const joined = orderedValues.join('-');

  let hash = 0;

  for (let i = 0; i < joined.length; i += 1) {
    hash += joined.charCodeAt(i) * (i + 1);
  }

  const angles = [25, 45, 70, 100, 130, 155];
  const angle = angles[hash % angles.length];

  const radians = (angle * Math.PI) / 180;

  return {
    x1: 50 - Math.cos(radians) * 50,
    y1: 50 - Math.sin(radians) * 50,
    x2: 50 + Math.cos(radians) * 50,
    y2: 50 + Math.sin(radians) * 50,
  };
}