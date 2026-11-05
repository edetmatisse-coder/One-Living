'use client';

import { useState } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { FORMAT_BY_ID, GYM_HOURS, GYMS, PRODUCT_BY_ID, type Gym } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { DotMap, type MapPoint } from '@/components/ui/DotMap';
import { Badge } from '@/components/ui/Badge';
import { BwallMark } from '@/components/ui/BwallMark';
import { Arrow } from '@/components/ui/Button';
import { useCapabilities } from '@/lib/device';
import { asset } from '@/lib/asset';

const BWALL = '#149ca4';
const BWALL_SUN = '#fcd46c';
const ORDER: Gym['id'][] = ['quimper', 'lanester', 'vannes'];
const shortName = (g: Gym) => g.name.replace('B’Wall ', '');

/**
 * Trouver une salle : les trois salles B'Wall, aux couleurs de B'Wall.
 * Adresses, horaires, chiffres et photos viennent de b-wall.fr ; le frigo,
 * les boissons et la voie du mois sont des exemples.
 */
export function Salles({ meta }: { meta: SectionMeta }) {
  const [active, setActive] = useState<Gym['id']>('vannes');
  // sur mobile, la carte est dessinée à la taille de l'écran : les noms restent lisibles
  const { mobile } = useCapabilities();
  const gym = GYMS.find((g) => g.id === active)!;
  const points: MapPoint[] = GYMS.map((g) => ({
    id: g.id,
    name: shortName(g),
    lonlat: g.lonlat,
    color: g.id === active ? BWALL_SUN : BWALL,
    kind: 'jug',
    // Lorient et Vannes sont proches : leurs noms passent tous deux à gauche
    labelLeft: g.id === 'vannes' || g.id === 'lanester',
  }));

  return (
    <Section
      meta={meta}
      color={BWALL}
      solid
      title={['Trouver', 'une salle']}
      cardFoot="One Living × B’Wall · Bretagne sud"
      lead={<>Le frigo One Living au bar des trois salles B’Wall : Quimper, Lorient et Vannes. Clique sur une prise pour voir la salle.</>}
    >
      <SectionInner>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)]">
            <div className="relative rounded-[8px] border border-bwall/30 bg-bwall-deep/20 p-3 md:p-6">
              <div className="mb-3 flex items-center justify-between gap-3 px-1 md:mb-4">
                <BwallMark className="h-9 w-auto" />
                <Badge kind="exemple" className="!border-bwall-sun/60 !text-bwall-sun">
                  Partenaire envisagé
                </Badge>
              </div>
              <DotMap
                points={points}
                route={ORDER}
                activeId={active}
                onSelect={(id) => setActive(id as Gym['id'])}
                ariaLabel="Carte du sud de la Bretagne : salles B’Wall à Quimper, Lorient et Vannes"
                className="w-full"
                width={mobile ? 360 : 620}
                step={mobile ? 5 : 7}
              />
            </div>

            <ul className="mt-4 grid grid-cols-3 gap-2" aria-label="Les salles B’Wall">
              {ORDER.map((id) => {
                const g = GYMS.find((x) => x.id === id)!;
                const on = g.id === active;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setActive(g.id)}
                      aria-pressed={on}
                      className={`flex w-full items-center justify-center gap-2 rounded-[5px] px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                        on ? 'bg-bwall text-ply-900' : 'border border-bwall/30 text-chalk-dim hover:border-bwall hover:text-chalk'
                      }`}
                    >
                      {shortName(g)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <article
            key={gym.id}
            className="relative overflow-hidden rounded-[8px] bg-chalk text-ply-900 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]"
            aria-live="polite"
          >
            <figure className="relative aspect-[16/10] overflow-hidden bg-bwall-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gym.photo} alt={gym.photoLabel} className="h-full w-full object-cover" loading="lazy" decoding="async" draggable={false} />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,92,100,0)_45%,rgba(12,92,100,.85)_100%)]" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <span className="label-mono text-[10px] text-chalk/90">{gym.photoLabel}</span>
                <span className="label-mono shrink-0 text-[9px] text-chalk/70">Photo b-wall.fr</span>
              </figcaption>
            </figure>

            <div className="p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-mono text-bwall-deep">Salle B’Wall · partenaire envisagé</p>
                  <h3 className="font-display mt-2 text-[44px] leading-[0.9]">{gym.name}</h3>
                  <p className="mt-1 text-[15px] font-semibold text-ply-500">{gym.city}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset('/brand/bwall/isotype.png')} alt="" aria-hidden className="h-12 w-auto" draggable={false} />
              </div>

              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Chiffres clés">
                {gym.facts.map((f) => (
                  <li key={f} className="rounded-full bg-bwall/12 px-2.5 py-1 text-[13px] font-semibold text-bwall-deep">
                    {f}
                  </li>
                ))}
              </ul>

              <dl className="mt-6 grid gap-4 text-[15px]">
                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <dt className="text-ply-500">Adresse</dt>
                  <dd className="font-medium">{gym.address}</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <dt className="text-ply-500">Horaires</dt>
                  <dd className="font-medium">{GYM_HOURS}</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <dt className="text-ply-500">Accès</dt>
                  <dd className="font-medium">Libre, sans réservation. Entrée gratuite pour les accompagnants.</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-3 border-t border-ply-900/10 pt-4">
                  <dt className="text-ply-500">Au bar</dt>
                  <dd className="font-medium">Le frigo One Living</dd>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-3">
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
                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <dt className="text-ply-500">Voie du mois</dt>
                  <dd className="font-medium">{gym.voieDuMois}</dd>
                </div>
              </dl>

              <a
                href={gym.url}
                target="_blank"
                rel="noreferrer"
                data-cursor-label="Site de B’Wall"
                className="group mt-6 inline-flex items-center gap-2 rounded-[4px] bg-bwall px-4 py-2.5 text-[14px] font-semibold text-ply-900"
              >
                La salle sur b-wall.fr
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  <Arrow dir="up-right" size={12} />
                </span>
              </a>
              <p className="mt-6 border-t border-ply-900/10 pt-4 text-[12.5px] text-ply-500">
                Partenariat imaginé pour un projet étudiant : B’Wall n’est pas engagé. Adresses, horaires, chiffres et photos viennent de
                b-wall.fr ; le frigo, les boissons et la voie du mois sont des exemples.
              </p>
            </div>
          </article>
        </div>
      </SectionInner>
    </Section>
  );
}
