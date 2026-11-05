'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useInView } from '@/lib/use-in-view';
import type { SectionMeta } from '@/data/sections';
import { SALLE_TYPE as SALLE } from '@/data/campagne';
import { margeAnnuelle, margeUnitaire } from '@/lib/salle';
import { fmtEuro, fmtNumber } from '@/lib/format';
import { Section, SectionInner } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { Hold } from '@/components/ui/Hold';
import { Button } from '@/components/ui/Button';
import { asset } from '@/lib/asset';

const BENEFITS = [
  { kind: 'jug' as const, title: 'Frigo prêté', text: 'Prêté par One Living et installé au bar, aux couleurs de la campagne.' },
  { kind: 'sloper' as const, title: 'Dotation de lancement', text: 'Les premières bouteilles et la PLV de la voie du mois, pour lancer le frigo.' },
];

/** Repères posés sur la photo du bar de B'Wall Vannes (positions en % de l'image). */
const PINS = [
  { x: 43, y: 31, title: 'Le frigo One Living', text: 'Prêté et installé derrière le comptoir.' },
  { x: 71, y: 21, title: 'L’ardoise', text: 'La boisson du moment, à côté des cafés.' },
  { x: 29, y: 55, title: 'Le comptoir', text: 'Bouteille, canette ou shot, servis bien frais.' },
];

/** Le bar de B'Wall Vannes, annoté : où se glisse One Living. */
function AnnotatedBar() {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { rootMargin: '0px 0px -20% 0px' });
  return (
    <figure ref={ref} className="relative mb-14" data-reveal>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-ply-800 shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)] md:aspect-[16/8]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset('/brand/bwall/vannes.jpg')}
          alt="Le bar de B’Wall Vannes"
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-[50%_40%]"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,14,12,.15),rgba(16,14,12,.05)_45%,rgba(16,14,12,.75))]" />
        {PINS.map((p, i) => (
          <div
            key={p.title}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-700"
            style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: on ? 1 : 0, transitionDelay: on ? `${300 + i * 220}ms` : '0ms' }}
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-route font-display text-[18px] text-ply-900 ring-[6px] ring-route/25">
              {i + 1}
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-route/40 [animation-duration:2.4s]" />
            </span>
            <span className="absolute left-12 top-1/2 hidden w-max max-w-[220px] -translate-y-1/2 rounded-[5px] bg-ply-900/90 px-3.5 py-2.5 md:block">
              <span className="block text-[14px] font-semibold text-chalk">{p.title}</span>
              <span className="block text-[12.5px] leading-snug text-dust">{p.text}</span>
            </span>
          </div>
        ))}
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 md:p-7">
          <span>
            <span className="label-mono block text-[10px] text-route">Exemple · B’Wall Vannes</span>
            <span className="font-display mt-1 block text-[clamp(30px,3.6vw,52px)] leading-[0.9] text-chalk">Le bar, avec One Living</span>
          </span>
          <span className="label-mono text-[9px] text-chalk/60">Photo b-wall.fr</span>
        </figcaption>
      </div>
      <ol className="mt-4 grid gap-2 md:hidden">
        {PINS.map((p, i) => (
          <li key={p.title} className="flex gap-3 text-[14px]">
            <span className="font-display text-[20px] leading-none text-route">{i + 1}</span>
            <span>
              <span className="font-semibold text-chalk">{p.title}</span> <span className="text-dust">{p.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

const FIELDS = [
  { id: 'salle', label: 'Nom de la salle', type: 'text', autoComplete: 'organization' },
  { id: 'ville', label: 'Ville', type: 'text', autoComplete: 'address-level2' },
  { id: 'passages', label: 'Passages par jour (environ)', type: 'number', autoComplete: 'off' },
  { id: 'email', label: 'E-mail professionnel', type: 'email', autoComplete: 'email' },
];

/** Le discours aux salles : la recette du bar, et un formulaire de démo. */
export function PourLesSalles({ meta }: { meta: SectionMeta }) {
  const [sent, setSent] = useState(false);
  const unit = margeUnitaire(SALLE);
  const year = margeAnnuelle(SALLE);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault(); // démo : rien ne part
    setSent(true);
  };

  return (
    <Section
      meta={meta}
      solid
      title={['Votre bar,', 'une recette en plus.']}
      cardFoot="Frigo prêté · dotation · marge"
      lead={<>Vos grimpeurs boivent déjà un verre après la séance. Comme les salles B’Wall, donnez-leur un kombucha vivant, bio, bien frais.</>}
    >
      <SectionInner>
        <AnnotatedBar />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div key={b.title} className="rounded-[8px] border border-chalk/10 bg-ply-900/40 p-6">
                  <Hold kind={b.kind} color="#F2B705" size={40} />
                  <h3 className="font-display mt-5 text-[34px] text-chalk">{b.title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-chalk-dim">{b.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[8px] bg-route p-7 text-ply-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="label-mono text-ply-900/70">Votre marge</p>
                <Badge kind="neutral" className="!border-ply-900/30 !text-ply-900">
                  Hypothèse
                </Badge>
              </div>
              <p className="font-display mt-3 text-[clamp(64px,7vw,104px)] leading-[0.85]">
                <span className="text-[0.42em]">environ </span>
                {fmtNumber(unit, 2)}&nbsp;€
              </p>
              <p className="mt-2 text-[17px] font-medium">de marge par bouteille, revendue {fmtNumber(SALLE.revente, 2)} € au bar.</p>
              <p className="mt-4 text-[14px] text-ply-900/75">
                Pour une salle de {SALLE.passages} passages par jour, environ {fmtEuro(Math.round(year / 100) * 100)} de marge sur l’année.
                Valeurs de travail, à confirmer avec One Living.
              </p>
            </div>
          </div>

          <div className="rounded-[10px] border border-chalk/12 bg-ply-900/50 p-7 md:p-9">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-[38px] text-chalk">Devenir salle partenaire</h3>
              <Badge kind="demo">Formulaire de démo</Badge>
            </div>
            {sent ? (
              <div className="mt-8 rounded-[6px] border border-route/50 bg-route/10 p-6" role="status" aria-live="polite">
                <p className="text-[18px] font-semibold text-chalk">Démo : aucune donnée n’est envoyée.</p>
                <p className="mt-2 text-[14.5px] text-chalk-dim">Ce formulaire illustre la campagne. Rien n’a quitté votre navigateur.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-4 text-[14px] font-semibold text-route underline underline-offset-4">
                  Revenir au formulaire
                </button>
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
                {FIELDS.map((f) => (
                  <div key={f.id}>
                    <label htmlFor={`f-${f.id}`} className="block text-[14px] font-semibold text-chalk">
                      {f.label}
                    </label>
                    <input
                      id={`f-${f.id}`}
                      name={f.id}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      inputMode={f.type === 'number' ? 'numeric' : undefined}
                      className="mt-2 w-full rounded-[5px] border border-chalk/15 bg-ply-950/60 px-4 py-3 text-[16px] text-chalk placeholder:text-dust/50 focus:border-route focus:outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="f-message" className="block text-[14px] font-semibold text-chalk">
                    Un mot sur votre bar
                  </label>
                  <textarea
                    id="f-message"
                    name="message"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-[5px] border border-chalk/15 bg-ply-950/60 px-4 py-3 text-[16px] text-chalk focus:border-route focus:outline-none"
                  />
                </div>
                <Button type="submit" className="w-full justify-center">
                  Envoyer la demande
                </Button>
                <p className="text-center text-[12.5px] text-dust">Démo : rien n’est envoyé, rien n’est enregistré.</p>
              </form>
            )}
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
