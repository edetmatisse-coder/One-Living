import type { CSSProperties } from 'react';

/** Silhouettes de prises (viewBox 40×40), trou de vis inclus. */
export const HOLD_PATHS = {
  jug: 'M7.5 24.2C5.6 16.1 11.6 7.6 20.8 7.6c9.1 0 14.6 6.1 13.6 13.4-.5 3.8-3 6-6 6-3.1 0-4.2-2.7-8-2.7-3.9 0-5.1 4.6-9 4.6-2.2 0-3.4-1.6-3.9-4.7z',
  crimp: 'M4.8 22.6c.4-4.2 5.4-7.4 15.4-7.9 9.3-.5 15 1.6 15.2 5.4.2 3.2-3.9 5.4-9.6 5.9-4.3.4-7.5-.6-11.2.1-5.8 1-10.2-.6-9.8-3.5z',
  sloper: 'M5.2 27.4C4.4 17.7 11 9.4 20.4 9.2c9.6-.2 15.6 7.6 14.4 17-.4 3.3-3.5 4.6-14.7 4.6-11.4 0-14.6-.9-14.9-3.4z',
  pinch: 'M14.6 5.6c4-1.3 8.6.8 10.2 6.3 1.3 4.4.6 8.3 2.4 12.1 2 4.2.3 9.6-5.4 10.4-6 .9-10-3-9.8-8.6.1-3.8 1.4-5.7.6-9.5-1-4.9-1.4-9.5 2-10.7z',
  pocket: 'M6 20.5C6 12.4 12.1 6.4 20.3 6.4S34.4 12 34.4 20s-6 14.1-14.2 14.1S6 28.6 6 20.5zm7.4.8c.6 3 3.4 4.6 7.1 4.4 3.9-.2 6.4-2.2 6.3-5-.1-2.5-2.9-4-6.6-3.8-4.3.2-7.3 1.8-6.8 4.4z',
} as const;

export type HoldKind = keyof typeof HOLD_PATHS;

const HOLE: Record<HoldKind, [number, number]> = {
  jug: [20, 15.8],
  crimp: [20, 19.6],
  sloper: [20, 19],
  pinch: [19.8, 13.8],
  pocket: [20, 12.6],
};

interface Props {
  kind?: HoldKind;
  color?: string;
  size?: number;
  lit?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** Une prise en résine, dessinée en SVG (curseur, voie latérale, cartes). */
export function Hold({ kind = 'jug', color = '#F2B705', size = 28, lit = true, className = '', style, title }: Props) {
  const [hx, hy] = HOLE[kind];
  const gid = `hg-${kind}-${lit ? 1 : 0}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      style={{ overflow: 'visible', ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <radialGradient id={gid} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity={lit ? 0.45 : 0.12} />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </radialGradient>
      </defs>
      <path d={HOLD_PATHS[kind]} fill={lit ? color : '#3B3630'} stroke="rgba(0,0,0,.45)" strokeWidth="1" />
      <path d={HOLD_PATHS[kind]} fill={`url(#${gid})`} />
      <circle cx={hx} cy={hy} r="2.4" fill="#141210" />
      <circle cx={hx - 0.5} cy={hy - 0.6} r="0.9" fill="#6b645a" />
    </svg>
  );
}
