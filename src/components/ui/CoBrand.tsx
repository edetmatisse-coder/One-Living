'use client';

import { OneLivingMark } from './OneLivingMark';
import { BwallMark } from './BwallMark';

const SIZES = {
  sm: { ol: 'h-9', bw: 'h-7', text: 'text-[22px]', x: 'text-[18px]' },
  md: { ol: 'h-12', bw: 'h-9', text: 'text-[28px]', x: 'text-[22px]' },
  lg: { ol: 'h-16', bw: 'h-12', text: 'text-[38px]', x: 'text-[28px]' },
} as const;

/** Double signature de la campagne : One Living × B'Wall. */
export function CoBrand({ size = 'sm', className = '' }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="One Living × B’Wall">
      <OneLivingMark className={`${s.ol} w-auto`} />
      <span aria-hidden className={`font-display leading-none text-dust ${s.x}`} style={{ fontWeight: 700 }}>
        ×
      </span>
      <BwallMark className={`${s.bw} w-auto`} textClassName={s.text} />
    </span>
  );
}
