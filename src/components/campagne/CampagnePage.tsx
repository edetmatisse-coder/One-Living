'use client';

import { CAMPAGNE_SECTIONS } from '@/data/sections';
import { Footer } from '@/components/layout/Footer';
import { Section, SectionInner } from '@/components/layout/Section';
import { CampagneHeader } from './CampagneHeader';

const TITLES: Record<string, string[]> = {
  'apres-la-voie': ['Après', 'la voie.'],
  concept: ['Trois temps,', 'un rituel'],
  gamme: ['La gamme'],
  histoire: ['De No.1', 'à One'],
  salles: ['Trouver', 'une salle'],
  'voie-du-mois': ['La voie', 'du mois'],
  'one-giving': ['One Giving'],
  grimpeurs: ['Les grimpeurs'],
  'pour-les-salles': ['Votre bar,', 'une recette en plus.'],
  faq: ['Questions', 'fréquentes'],
};

export function CampagnePage() {
  return (
    <>
      <CampagneHeader />
      <main id="campagne" className="relative z-10">
        {CAMPAGNE_SECTIONS.map((meta) => (
          <Section key={meta.id} meta={meta} title={TITLES[meta.id]} solid>
            <SectionInner>
              <p className="max-w-[60ch] text-dust">Bloc « {meta.title} » : en construction.</p>
            </SectionInner>
          </Section>
        ))}
      </main>
      <Footer variant="campagne" />
    </>
  );
}
