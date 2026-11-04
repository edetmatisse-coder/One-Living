'use client';

import { DOSSIER_SECTIONS } from '@/data/sections';
import { DossierHeader } from '@/components/layout/DossierHeader';
import { SideRoute } from '@/components/layout/SideRoute';
import { Footer } from '@/components/layout/Footer';
import { Section, SectionInner } from '@/components/layout/Section';
import { useSectionTracking } from '@/lib/use-section-tracking';
import { Hero } from './Hero';
import { WallFallback } from '@/components/three/WallFallback';

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
  return (
    <>
      <WallFallback className="fixed inset-0 z-0" />
      <DossierHeader />
      <SideRoute sections={DOSSIER_SECTIONS} />
      <main id="dossier" className="relative z-10">
        <Hero meta={S.depart} />
        {DOSSIER_SECTIONS.slice(1).map((meta) => (
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
