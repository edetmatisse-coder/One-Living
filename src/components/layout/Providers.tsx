'use client';

import type { ReactNode } from 'react';
import type { BrandManifest } from '@/data/brand-assets';
import { BrandProvider } from '@/components/ui/Brand';
import { SmoothScroll } from './SmoothScroll';
import { Cursor } from './Cursor';
import { SoundEngine } from './SoundEngine';

/** Couches globales : visuels de marque, défilement fluide, son, curseur et grain. */
export function Providers({ manifest, children }: { manifest: BrandManifest; children: ReactNode }) {
  return (
    <BrandProvider manifest={manifest}>
      <SmoothScroll />
      {children}
      <SoundEngine />
      <Cursor />
      <div className="grain" aria-hidden />
    </BrandProvider>
  );
}
