'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { DOSSIER_SECTIONS } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { useCapabilities } from '@/lib/device';
import { DossierHeader } from '@/components/layout/DossierHeader';
import { SideRoute } from '@/components/layout/SideRoute';
import { Footer } from '@/components/layout/Footer';
import { Section, SectionInner } from '@/components/layout/Section';
import { useSectionTracking } from '@/lib/use-section-tracking';
import { Hero } from './Hero';
import { Probleme } from './Probleme';
import { Marque } from './Marque';
import { Marche } from './Marche';
import { Matrice } from './Matrice';
import { Simulateur } from './Simulateur';
import { WallFallback } from '@/components/three/WallFallback';

const WallCanvas = dynamic(() => import('@/components/three/wall/WallScene'), { ssr: false });
const COLORS = DOSSIER_SECTIONS.map((s) => ROUTE_COLORS[s.route]);

const S = Object.fromEntries(DOSSIER_SECTIONS.map((s) => [s.id, s]));

const TITLES: Record<string, string[]> = {
  probleme: ['Hors du rugby,', 'trois prises', 'à tenir'],
  marque: ['De No.1', 'à One'],
  marche: ['Un marché', 'en fermentation'],
  matrice: ['16 sports,', '4 gagnants'],
  escalade: ['Un seul sport :', 'l’escalade'],
  simulateur: ['Combien rapporte', 'une salle ?'],
  moments: ['Trois moments', 'déjà là'],
  poc: ['Le POC', 'en R2 Ouest'],
  indicateurs: ['Quatre chiffres', 'pour décider'],
  sources: ['Sources', 'et hypothèses'],
};

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
        {DOSSIER_SECTIONS.slice(5, 6).map((meta) => (
          <Section key={meta.id} meta={meta} title={TITLES[meta.id]}>
            <SectionInner>
              <p className="max-w-[60ch] text-dust">Contenu de la section « {meta.title} » : en construction.</p>
            </SectionInner>
          </Section>
        ))}
        <Simulateur meta={S.simulateur} />
        {DOSSIER_SECTIONS.slice(7).map((meta) => (
          <Section key={meta.id} meta={meta} title={TITLES[meta.id]}>
            <SectionInner>
              <p className="max-w-[60ch] text-dust">Contenu de la section « {meta.title} » : en construction.</p>
            </SectionInner>
          </Section>
        ))}
      </main>
      <Footer variant="dossier" />
    </>
  );
}
