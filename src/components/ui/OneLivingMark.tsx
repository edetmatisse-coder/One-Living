'use client';

import { BrandImage } from './Brand';

/** Logo One Living (public/brand/logo-one-living), ou le nom dessiné s'il manque. */
export function OneLivingMark({ className = '' }: { className?: string }) {
  return (
    <BrandImage
      id="logoOneLiving"
      alt="One Living"
      className={className || 'h-10 w-auto'}
      placeholderClassName="!border-0 !inline-flex !flex-row !gap-0"
      placeholder={
        <span className="font-display text-[22px] leading-none tracking-[0.01em] text-chalk" style={{ fontWeight: 900 }}>
          One<span className="text-route">.</span>Living
        </span>
      }
    />
  );
}
