import { useId } from 'react';
import type { FinderCollective } from './finderTypes';

type Props = {
  collective: FinderCollective;
  label: string;
};

const rankingStyle: Record<string, { color: string; angle: number }> = {
  political: { color: '#DC3877', angle: 0 },
  social: { color: '#D8FBE5', angle: 45 },
  creative: { color: '#CEFE6B', angle: -60 },
  economic: { color: '#8568E8', angle: 180 },
  ecological: { color: '#00665A', angle: -30 },
};

export default function FinderNetworkPreview({ collective, label }: Props) {
  const reactId = useId();
  const gradientId = `finder-gradient-${safeId(collective.id)}-${safeId(reactId)}`;
  const { formalization, time, identity, space } = collective.values;

  const top = valueToPoint(formalization, 'top');
  const right = valueToPoint(time, 'right');
  const bottom = valueToPoint(identity, 'bottom');
  const left = valueToPoint(space, 'left');
  const points = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;

  const first = collective.ranking[0] ?? 'political';
  const second = collective.ranking[1] ?? 'economic';
  const third = collective.ranking[2] ?? 'creative';
  const direction = getGradientDirection(rankingStyle[third]?.angle ?? -60);

  return (
    <svg
      className="finder-network-preview"
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={direction.x1}
          y1={direction.y1}
          x2={direction.x2}
          y2={direction.y2}
        >
          <stop
            offset="0%"
            stopColor={rankingStyle[first]?.color ?? rankingStyle.political.color}
          />
          <stop
            offset="100%"
            stopColor={rankingStyle[second]?.color ?? rankingStyle.economic.color}
          />
        </linearGradient>
      </defs>

      <polygon className="finder-network-preview__guide" points="50,18 82,50 50,82 18,50" />
      <polygon className="finder-network-preview__guide" points="50,28 72,50 50,72 28,50" />
      <polygon
        className="finder-network-preview__shape"
        points={points}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

function valueToPoint(
  value: number,
  direction: 'top' | 'right' | 'bottom' | 'left'
) {
  const center = 50;
  const edge = 18;
  const distance = (center - edge) * (clamp(value, 0, 100) / 100);

  if (direction === 'top') return { x: center, y: center - distance };
  if (direction === 'right') return { x: center + distance, y: center };
  if (direction === 'bottom') return { x: center, y: center + distance };
  return { x: center - distance, y: center };
}

function getGradientDirection(angle: number) {
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

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
