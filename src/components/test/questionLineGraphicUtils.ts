
export type Answers = Record<string, number | string[]>;

export type AxisSide = 'top' | 'right' | 'bottom' | 'left';

export type GraphicPoint = {
  id: string;
  left: number;
  top: number;
};

export type GradientDirection = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const sliderAxisConfig = {
  formalization: 'top',
  time: 'right',
  identity: 'bottom',
  space: 'left',
} as const satisfies Record<string, AxisSide>;

export const rankingStyleConfig = {
  political: {
    color: '#DC3877',
    angle: 0,
  },
  social: {
    color: '#D8FBE5',
    angle: 45,
  },
  creative: {
    color: '#CEFE6B',
    angle: -60,
  },
  economic: {
    color: '#8568E8',
    angle: 180,
  },
  ecological: {
    color: '#00665A',
    angle: -30,
  },
} as const satisfies Record<string, { color: string; angle: number }>;

const FALLBACK_RANKING = [
  'political',
  'economic',
  'creative',
  'social',
  'ecological',
] as const;

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
  return getSliderQuestionOrder().map((id) => {
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
      return typeof answers[id] === 'number';
    })
    .map((id) => ({
      id,
      ...projectValueToPoint(answers[id] as number, sliderAxisConfig[id]),
    }));
}

export function getPolygonPointsFromAnswers(answers: Answers) {
  return getAllSliderPoints(answers)
    .map((point) => `${point.left},${point.top}`)
    .join(' ');
}

function getRankingValue(orderedValues: string[], index: number): string {
  return orderedValues[index] ?? FALLBACK_RANKING[index];
}

export function getGradientStopsFromRanking(orderedValues: string[]) {
  const firstId = getRankingValue(orderedValues, 0);
  const secondId = getRankingValue(orderedValues, 1);

  const topColor =
    rankingStyleConfig[firstId as keyof typeof rankingStyleConfig]?.color ??
    rankingStyleConfig.political.color;

  const bottomColor =
    rankingStyleConfig[secondId as keyof typeof rankingStyleConfig]?.color ??
    rankingStyleConfig.economic.color;

  // Nur Rang 1 und 2 bilden den normalen Farbverlauf.
  return [
    { offset: '0%', color: topColor },
    { offset: '100%', color: bottomColor },
  ];
}

export function getGradientAngleFromRanking(orderedValues: string[]): number {
  const thirdId = getRankingValue(orderedValues, 2);

  return (
    rankingStyleConfig[thirdId as keyof typeof rankingStyleConfig]?.angle ??
    rankingStyleConfig.creative.angle
  );
}

export function getGradientDirectionFromAngle(
  angle: number
): GradientDirection {
  // 0° bedeutet: erste Farbe oben, zweite Farbe unten.
  // Positive Winkel drehen im Uhrzeigersinn.
  const radians = (angle * Math.PI) / 180;
  const radius = 50;

  const dx = Math.sin(radians) * radius;
  const dy = Math.cos(radians) * radius;

  return {
    x1: 50 - dx,
    y1: 50 - dy,
    x2: 50 + dx,
    y2: 50 + dy,
  };
}

export function getGradientDirectionFromRanking(
  orderedValues: string[]
): GradientDirection {
  return getGradientDirectionFromAngle(
    getGradientAngleFromRanking(orderedValues)
  );
}