'use client';

import type { ReactNode } from 'react';
import type { BrandManifest } from '@/data/brand-assets';
import { BrandProvider } from '@/components/ui/Brand';
import { SmoothScroll } from './SmoothScroll';
import { Cursor } from './Cursor';
import { PageTransition } from './PageTransition';
import { SoundEngine } from './SoundEngine';

/** Couches globales, communes au Dossier et à la Campagne. */
export function Providers({ manifest, children }: { manifest: BrandManifest; children: ReactNode }) {
  return (
    <BrandProvider manifest={manifest}>
      <SmoothScroll />
      {children}
      <PageTransition />
      <SoundEngine />
      <Cursor />
      <div className="grain" aria-hidden />
    </BrandProvider>
  );
}
