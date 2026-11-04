'use client';

import { BrandImage } from './Brand';

/** Logo B'Wall (public/brand/logo-bwall), ou le nom dessiné s'il manque. */
export function BwallMark({ className = '', textClassName = 'text-[26px]' }: { className?: string; textClassName?: string }) {
  return (
    <BrandImage
      id="logoBwall"
      alt="B’Wall"
      className={className}
      placeholderClassName="!border-0 !inline-flex !flex-row !gap-0 !rounded-none"
      placeholder={
        <span className={`font-display leading-none text-chalk ${textClassName}`} style={{ fontWeight: 900 }}>
          B’Wall
        </span>
      }
    />
  );
}
