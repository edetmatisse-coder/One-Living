'use client';

import { useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { GYMS, PRODUCT_BY_ID } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { WestMap, type MapPoint } from '@/components/ui/WestMap';
import { Badge } from '@/components/ui/Badge';
import { Hold } from '@/components/ui/Hold';


/** Trouver une salle : carte stylisée de l'Ouest, fiches fictives au clic. */
export function Salles({ meta }: { meta: SectionMeta }) {
  const [active, setActive] = useState<string>(GYMS[0].id);
  const gym = GYMS.find((g) => g.id === active)!;
  const color = ROUTE_COLORS[gym.route];
  const points: MapPoint[] = GYMS.map((g) => ({
    id: g.id,
    name: g.city,
    lonlat: g.lonlat,
    color: ROUTE_COLORS[g.route],
    kind: 'jug',
    labelLeft: g.city === 'Rennes' || g.city === 'Vannes' || g.city === 'Saint-Malo',
  }));

  return (
    <Section
      meta={meta}
      solid
      title={['Trouver', 'une salle']}
      cardFoot="Salles partenaires · exemples"
      lead={<>Le frigo One Living est au bar des salles partenaires. Clique sur une prise pour voir la salle.</>}
    >
      <SectionInner>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] lg:items-start lg:gap-14">
          <div className="relative rounded-[8px] border border-chalk/10 bg-ply-900/40 p-3 md:p-6">
            <WestMap
              points={points}
              activeId={active}
              onSelect={setActive}
              ariaLabel="Carte des salles partenaires (exemples) dans l’Ouest"
              className="w-full"
              width={620}
              step={8}
            />
            <div className="absolute left-5 top-5">
              <Badge kind="exemple">Salles partenaires (exemple)</Badge>
            </div>
          </div>

          <div>
            <article
              key={gym.id}
              className="relative overflow-hidden rounded-[8px] bg-chalk p-7 text-ply-900 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]"
              style={{ '--route': color } as CSSProperties}
              aria-live="polite"
            >
              <span className="tape -top-2 left-8 rotate-[-4deg]" aria-hidden />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-mono text-ply-500">Salle partenaire (exemple)</p>
                  <h3 className="font-display mt-2 text-[44px] leading-[0.9]">{gym.name}</h3>
                  <p className="mt-1 text-[15px] font-semibold text-ply-500">{gym.city}</p>
                </div>
                <Hold kind="jug" color={color} size={46} />
              </div>
              <dl className="mt-6 grid gap-4 text-[15px]">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Horaires</dt>
                  <dd className="font-medium">{gym.hours}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Au bar</dt>
                  <dd className="font-medium">Frigo One Living, bouteilles à 3,50 €</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Au frigo</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {gym.flavors.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-ply-900/[0.06] px-2.5 py-1 text-[13px] font-medium">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROUTE_COLORS[PRODUCT_BY_ID[id].route] }} />
                        {PRODUCT_BY_ID[id].short}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Voie du mois</dt>
                  <dd className="font-medium">{gym.voieDuMois}</dd>
                </div>
              </dl>
              <p className="mt-6 border-t border-ply-900/10 pt-4 text-[12.5px] text-ply-500">
                Fiche fictive pour la maquette : nom, adresse et horaires sont inventés.
              </p>
            </article>

            <ul className="mt-6 grid grid-cols-2 gap-2" aria-label="Liste des salles (exemples)">
              {GYMS.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => setActive(g.id)}
                    aria-pressed={g.id === active}
                    className={`flex w-full items-center gap-2.5 rounded-[5px] px-3 py-2.5 text-left text-[14px] transition-colors ${
                      g.id === active ? 'bg-chalk/[0.1] text-chalk' : 'text-chalk-dim hover:bg-chalk/[0.05] hover:text-chalk'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ROUTE_COLORS[g.route] }} />
                    <span className="truncate">
                      <span className="font-semibold">{g.city}</span> · {g.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
