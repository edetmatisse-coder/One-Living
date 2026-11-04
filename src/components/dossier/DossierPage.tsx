'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { DOSSIER_SECTIONS } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { useCapabilities } from '@/lib/device';
import { DossierHeader } from '@/components/layout/DossierHeader';
import { SideRoute } from '@/components/layout/SideRoute';
import { Footer } from '@/components/layout/Footer';
import { useSectionTracking } from '@/lib/use-section-tracking';
import { Hero } from './Hero';
import { Probleme } from './Probleme';
import { Marque } from './Marque';
import { Marche } from './Marche';
import { Matrice } from './Matrice';
import { Simulateur } from './Simulateur';
import { Escalade } from './Escalade';
import { Moments } from './Moments';
import { Poc } from './Poc';
import { Indicateurs } from './Indicateurs';
import { Sources } from './Sources';
import { WallFallback } from '@/components/three/WallFallback';

const WallCanvas = dynamic(() => import('@/components/three/wall/WallScene'), { ssr: false });
const COLORS = DOSSIER_SECTIONS.map((s) => ROUTE_COLORS[s.route]);

const S = Object.fromEntries(DOSSIER_SECTIONS.map((s) => [s.id, s]));

export function DossierPage() {
  useSectionTracking();
  const caps = useCapabilities();
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;
  const [wallReady, setWallReady] = useState(false);
  return (
    <>
      {show3D && <WallCanvas colors={COLORS} onReady={() => setWallReady(true)} />}
      <WallFallback
        className={`fixed inset-0 z-0 transition-opacity duration-1000 ${show3D && wallReady ? 'opacity-0' : 'opacity-100'}`}
      />
      <DossierHeader />
      <SideRoute sections={DOSSIER_SECTIONS} />
      <main id="dossier" className="relative z-10">
        <Hero meta={S.depart} />
        <Probleme meta={S.probleme} />
        <Marque meta={S.marque} />
        <Marche meta={S.marche} />
        <Matrice meta={S.matrice} />
        <Escalade meta={S.escalade} />
        <Simulateur meta={S.simulateur} />
        <Moments meta={S.moments} />
        <Poc meta={S.poc} />
        <Indicateurs meta={S.indicateurs} />
        <Sources meta={S.sources} />
      </main>
      <Footer variant="dossier" />
    </>
  );
}
