'use client';

import { CAMPAGNE_SECTIONS } from '@/data/sections';
import { Footer } from '@/components/layout/Footer';
import { useSectionTracking } from '@/lib/use-section-tracking';
import { CampagneHeader } from './CampagneHeader';
import { CampagneHero } from './CampagneHero';
import { Concept } from './Concept';
import { Gamme } from './Gamme';
import { Histoire } from './Histoire';
import { Salles } from './Salles';
import { VoieDuMois } from './VoieDuMois';
import { Grimpeurs } from './Grimpeurs';
import { PourLesSalles } from './PourLesSalles';
import { Faq } from './Faq';

const S = Object.fromEntries(CAMPAGNE_SECTIONS.map((s) => [s.id, s]));

/** La maquette du site public de la campagne « Après la voie ». */
export function CampagnePage() {
  useSectionTracking();
  return (
    <>
      <CampagneHeader />
      <main id="campagne" className="relative z-10">
        <CampagneHero meta={S['apres-la-voie']} />
        <Concept meta={S.concept} />
        <Gamme meta={S.gamme} />
        <Histoire meta={S.histoire} />
        <Salles meta={S.salles} />
        <VoieDuMois meta={S['voie-du-mois']} />
        <Grimpeurs meta={S.grimpeurs} />
        <PourLesSalles meta={S['pour-les-salles']} />
        <Faq meta={S.faq} />
      </main>
      <Footer />
    </>
  );
}
