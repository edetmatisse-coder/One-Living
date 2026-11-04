'use client';

import { useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { FORMAT_BY_ID, GYMS, PRODUCT_BY_ID, type Gym } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { DotMap, type MapPoint } from '@/components/ui/DotMap';
import { Badge } from '@/components/ui/Badge';
import { BrandImage } from '@/components/ui/Brand';
import { Hold } from '@/components/ui/Hold';
import { Arrow } from '@/components/ui/Button';
import { useCapabilities } from '@/lib/device';

/** Logo B'Wall (public/brand/logo-bwall), ou le nom dessiné s'il manque. */
function BwallMark({ className = '' }: { className?: string }) {
  return (
    <BrandImage
      id="logoBwall"
      alt="B’Wall"
      className={className}
      placeholderClassName="!border-0 !inline-flex !flex-row !gap-0 !rounded-none"
      placeholder={
        <span className="font-display text-[26px] leading-none text-chalk" style={{ fontWeight: 900 }}>
          B’Wall
        </span>
      }
    />
  );
}

const ORDER: Gym['id'][] = ['quimper', 'lanester', 'vannes'];
const shortName = (g: Gym) => g.name.replace('B’Wall ', '');

/** Trouver une salle : les salles B'Wall du sud de la Bretagne, partenaire envisagé. */
export function Salles({ meta }: { meta: SectionMeta }) {
  const [active, setActive] = useState<Gym['id']>('lanester');
  // sur mobile, la carte est dessinée à la taille de l'écran : les noms restent lisibles
  const { mobile } = useCapabilities();
  const gym = GYMS.find((g) => g.id === active)!;
  const color = ROUTE_COLORS[gym.route];
  const points: MapPoint[] = GYMS.map((g) => ({
    id: g.id,
    name: shortName(g),
    lonlat: g.lonlat,
    color: ROUTE_COLORS[g.route],
    kind: 'jug',
    labelLeft: g.id === 'vannes',
  }));

  return (
    <Section
      meta={meta}
      solid
      title={['Trouver', 'une salle']}
      cardFoot="Réseau B’Wall · Bretagne sud"
      lead={<>Le frigo One Living au bar des salles B’Wall, à Quimper, Lanester et Vannes. Clique sur une prise pour voir la salle.</>}
    >
      <SectionInner>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] lg:items-start lg:gap-14">
          <div className="relative rounded-[8px] border border-chalk/10 bg-ply-900/40 p-3 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3 px-1 md:mb-4">
              <BwallMark className="h-8 w-auto" />
              <Badge kind="exemple">Partenaire envisagé</Badge>
            </div>
            <DotMap
              points={points}
              route={ORDER}
              activeId={active}
              onSelect={(id) => setActive(id as Gym['id'])}
              ariaLabel="Carte du sud de la Bretagne : salles B’Wall à Quimper, Lanester et Vannes"
              className="w-full"
              width={mobile ? 360 : 620}
              step={mobile ? 5 : 7}
            />
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
                  <p className="label-mono text-ply-500">Salle B’Wall · partenaire envisagé</p>
                  <h3 className="font-display mt-2 text-[44px] leading-[0.9]">{gym.name}</h3>
                  <p className="mt-1 text-[15px] font-semibold text-ply-500">{gym.city}</p>
                </div>
                <Hold kind="jug" color={color} size={46} />
              </div>
              <dl className="mt-6 grid gap-4 text-[15px]">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Adresse</dt>
                  <dd className="font-medium">
                    {gym.address}, {gym.city.split(',')[0]}
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Au bar</dt>
                  <dd className="font-medium">Frigo One Living (proposition)</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Au frigo</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {gym.flavors.map((id) => {
                      const p = PRODUCT_BY_ID[id];
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-ply-900/[0.06] px-2.5 py-1 text-[13px] font-medium">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROUTE_COLORS[p.route] }} />
                          {FORMAT_BY_ID[p.format].label} {p.short.toLowerCase()}
                        </span>
                      );
                    })}
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-ply-500">Voie du mois</dt>
                  <dd className="font-medium">{gym.voieDuMois}</dd>
                </div>
              </dl>
              <a
                href="https://www.b-wall.fr/"
                target="_blank"
                rel="noreferrer"
                data-cursor-label="Site de B’Wall"
                className="group mt-6 inline-flex items-center gap-2 text-[14px] font-semibold underline-offset-4 hover:underline"
              >
                Horaires et tarifs sur b-wall.fr
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  <Arrow dir="up-right" size={12} />
                </span>
              </a>
              <p className="mt-6 border-t border-ply-900/10 pt-4 text-[12.5px] text-ply-500">
                Proposition étudiante : B’Wall n’est pas engagé à ce stade. Le frigo, les boissons et la voie du mois sont des exemples.
              </p>
            </article>

            <ul className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="Les salles B’Wall">
              {ORDER.map((id) => {
                const g = GYMS.find((x) => x.id === id)!;
                return (
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
                      <span className="truncate font-semibold">{shortName(g)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
