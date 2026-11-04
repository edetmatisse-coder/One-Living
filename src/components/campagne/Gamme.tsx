'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SectionMeta } from '@/data/sections';
import { ROUTE_COLORS } from '@/data/routes';
import { FORMATS, FORMAT_BY_ID, PRODUCTS, productImage, type FormatId, type Product } from '@/data/campagne';
import { Section, SectionInner } from '@/components/layout/Section';
import { useCapabilities } from '@/lib/device';
import { useInView } from '@/lib/use-in-view';
import { playSfx } from '@/lib/sound';

const ProductCanvas = dynamic(() => import('@/components/three/product/ProductCanvas'), { ssr: false });

/** Photo produit de oneliving.com, posée sur un fond clair (les photos sont sur fond blanc). */
export function Packshot({ product, className = '', priority = false }: { product: Product; className?: string; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={productImage(product.id)}
      alt={`One Living ${FORMAT_BY_ID[product.format].label.toLowerCase()} ${product.name}`}
      className={`mix-blend-multiply ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );
}

export function Gamme({ meta }: { meta: SectionMeta }) {
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const product = PRODUCTS.find((p) => p.id === productId)!;
  const format = FORMAT_BY_ID[product.format];
  const siblings = PRODUCTS.filter((p) => p.format === product.format);
  const route = ROUTE_COLORS[product.route];
  const caps = useCapabilities();
  const show3D = caps.ready && caps.webgl && !caps.reducedMotion;
  const stageRef = useRef<HTMLDivElement>(null);
  const opened = useInView(stageRef, { rootMargin: '0px 0px -30% 0px' });

  // « pschitt » à l'ouverture de la gamme
  useEffect(() => {
    if (opened) playSfx('pschitt');
  }, [opened]);

  const choose = (id: string) => {
    if (id === productId) return;
    setProductId(id);
    playSfx('fizz');
  };
  const chooseFormat = (f: FormatId) => {
    if (f === product.format) return;
    choose(PRODUCTS.find((p) => p.format === f)!.id);
  };

  return (
    <div style={{ '--route': route } as CSSProperties}>
      <Section
        meta={{ ...meta, route: product.route }}
        title={['La gamme']}
        solid
        cardFoot="Bouteille · canette · shot"
        lead={<>Trois formats, un moment chacun. Choisis le tien, fais tourner la boisson.</>}
      >
        <SectionInner>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
            <div className="order-2 lg:order-1">
              {/* Formats */}
              <div role="tablist" aria-label="Formats" className="grid grid-cols-3 gap-1 rounded-[6px] border border-chalk/12 bg-ply-900/50 p-1">
                {FORMATS.map((f) => {
                  const on = f.id === product.format;
                  return (
                    <button
                      key={f.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => chooseFormat(f.id)}
                      className={`rounded-[4px] px-2 py-3 text-center transition-colors ${on ? 'bg-chalk text-ply-900' : 'text-chalk-dim hover:text-chalk'}`}
                    >
                      <span className="block text-[15px] font-semibold leading-tight">{f.label}</span>
                      <span className={`label-mono mt-1 block text-[9.5px] ${on ? 'text-ply-500' : 'text-dust'}`}>
                        {f.volume} · {f.moment}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Parfums du format */}
              <div role="tablist" aria-label="Parfums" className="mt-3 grid grid-cols-2 gap-2">
                {siblings.map((p) => {
                  const c = ROUTE_COLORS[p.route];
                  const on = p.id === product.id;
                  return (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => choose(p.id)}
                      className={`flex items-center gap-3 rounded-[5px] px-4 py-3.5 text-left transition-colors ${
                        on ? 'bg-route text-ply-900' : 'border border-chalk/12 text-chalk-dim hover:border-chalk/40 hover:text-chalk'
                      }`}
                      style={{ '--route': c } as CSSProperties}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ background: on ? '#141210' : c, boxShadow: on ? `0 0 0 3px ${c}` : 'none' }}
                      />
                      <span className="text-[14.5px] font-semibold leading-tight">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10" aria-live="polite">
                <p className="label-mono text-route">
                  {format.range} · {format.volume}
                </p>
                <h3 key={product.id} className="font-display mt-3 text-[clamp(52px,6vw,96px)] text-chalk">
                  {product.name}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {product.notes.map((n) => (
                    <li key={n} className="rounded-full border border-chalk/15 px-3 py-1.5 text-[14px] text-chalk-dim">
                      {n}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] uppercase tracking-[0.12em] text-chalk">
                  {format.mentions.map((m, i) => (
                    <span key={m} className="flex items-center gap-3">
                      {i > 0 && <span className="text-route">·</span>}
                      {m}
                    </span>
                  ))}
                </p>
                <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-dust">
                  Le moment : <span className="text-chalk-dim">{format.moment.toLowerCase()}</span>. Un produit vivant, qui se garde au frais
                  et se boit bien frais.
                </p>
              </div>
            </div>

            <div ref={stageRef} className="relative order-1 lg:order-2">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700"
                style={{ background: `radial-gradient(60% 55% at 50% 60%, ${route}33, transparent 70%)` }}
              />
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-[8px] border border-chalk/10">
                {show3D ? (
                  <ProductCanvas product={product} className="absolute inset-0" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-chalk">
                    <Packshot product={product} className="h-[88%] w-auto object-contain" />
                  </div>
                )}
                <p
                  className={`label-mono pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-[3px] px-2.5 py-1.5 text-[9.5px] ${
                    show3D ? 'bg-ply-900/70 text-dust' : 'bg-ply-900/10 text-ply-500'
                  }`}
                >
                  {show3D ? 'Glisse pour faire tourner' : `${format.label} ${format.volume}`}
                </p>
              </div>
            </div>
          </div>

          {/* Toute la gamme, en photo */}
          <div className="mt-20">
            <div className="mb-5 flex items-end justify-between gap-4">
              <p className="label-mono text-dust">Toute la gamme · {PRODUCTS.length} boissons</p>
              <p className="label-mono hidden text-[10px] text-dust/70 sm:block">Photos : oneliving.com</p>
            </div>
            <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-3 overflow-x-auto px-[var(--gutter)] pb-2 lg:mx-0 lg:grid lg:grid-cols-10 lg:overflow-visible lg:px-0">
              {PRODUCTS.map((p) => {
                const on = p.id === product.id;
                return (
                  <li key={p.id} className="w-[34vw] max-w-[150px] shrink-0 snap-start lg:w-auto lg:max-w-none">
                    <button
                      type="button"
                      onClick={() => choose(p.id)}
                      aria-pressed={on}
                      aria-label={`${FORMAT_BY_ID[p.format].label} ${p.name}`}
                      className={`group block w-full overflow-hidden rounded-[6px] bg-chalk text-left transition-[box-shadow,transform] duration-300 hover:-translate-y-1 ${
                        on ? 'shadow-[0_0_0_3px_var(--route)]' : ''
                      }`}
                      style={{ '--route': ROUTE_COLORS[p.route] } as CSSProperties}
                    >
                      <span className="block aspect-[3/4] overflow-hidden">
                        <Packshot product={p} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </span>
                      <span className="block border-t border-ply-900/10 px-2.5 py-2">
                        <span className="label-mono block text-[9px] text-ply-500">
                          {FORMAT_BY_ID[p.format].label} · {FORMAT_BY_ID[p.format].volume}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] font-semibold text-ply-900">{p.name}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </SectionInner>
      </Section>
    </div>
  );
}
