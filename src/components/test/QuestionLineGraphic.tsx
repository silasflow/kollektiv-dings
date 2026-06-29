// src/components/test/QuestionLineGraphic.tsx

import {
  getGradientDirectionFromRanking,
  getGradientStopsFromRanking,
  getPolygonPointsFromAnswers,
  getVisibleSliderPoints,
  getAllSliderPoints,
  type Answers,
} from './questionLineGraphicUtils';

type Props =
  | {
      mode: 'slider';
      currentQuestionId: string;
      answers: Answers;
    }
  | {
      mode: 'ranking';
      answers: Answers;
      orderedValues: string[];
    };

export default function QuestionLineGraphic(props: Props) {
  const points =
    props.mode === 'slider'
      ? getVisibleSliderPoints({
          answers: props.answers,
          currentQuestionId: props.currentQuestionId,
        })
      : getAllSliderPoints(props.answers);

  const polygonPoints =
    props.mode === 'ranking'
      ? getPolygonPointsFromAnswers(props.answers)
      : null;

  const gradientStops =
    props.mode === 'ranking'
      ? getGradientStopsFromRanking(props.orderedValues)
      : [];

  const gradientDirection =
    props.mode === 'ranking'
      ? getGradientDirectionFromRanking(props.orderedValues)
      : null;

  const gradientId =
    props.mode === 'ranking'
      ? `ranking-gradient-${props.orderedValues.join('-')}`
      : undefined;

  return (
    <div className="question-line-graphic" aria-hidden="true">
      <div className="line-graphic-axis line-graphic-axis--x" />
      <div className="line-graphic-axis line-graphic-axis--y" />

      {polygonPoints && gradientDirection && gradientId && (
        <svg
          className="line-graphic-fill"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1={gradientDirection.x1}
              y1={gradientDirection.y1}
              x2={gradientDirection.x2}
              y2={gradientDirection.y2}
            >
              {gradientStops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          </defs>

          <polygon
            points={polygonPoints}
            fill={`url(#${gradientId})`}
            className="line-graphic-polygon"
          />
        </svg>
      )}

      {points.map((point) => (
        <span
          key={point.id}
          className="line-graphic-dot"
          style={{
            left: `${point.left}%`,
            top: `${point.top}%`,
          }}
        >
          ×
        </span>
      ))}
    </div>
  );
}