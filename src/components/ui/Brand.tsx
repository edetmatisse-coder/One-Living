'use client';

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { brandAssetMeta, emptyManifest, type BrandAssetId, type BrandManifest } from '@/data/brand-assets';

const BrandContext = createContext<BrandManifest>(emptyManifest());

export function BrandProvider({ manifest, children }: { manifest: BrandManifest; children: ReactNode }) {
  return <BrandContext.Provider value={manifest}>{children}</BrandContext.Provider>;
}

export function useBrandAsset(id: BrandAssetId): string | null {
  return useContext(BrandContext)[id];
}

interface ImageProps {
  id: BrandAssetId;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Texte de remplacement dans l'emplacement vide. */
  placeholder?: ReactNode;
  placeholderClassName?: string;
}

/**
 * Affiche un visuel de public/brand/ s'il existe, sinon un emplacement
 * propre qui indique le fichier attendu.
 */
export function BrandImage({ id, alt, className = '', style, placeholder, placeholderClassName = '' }: ImageProps) {
  const src = useBrandAsset(id);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={style} draggable={false} />;
  }
  const meta = brandAssetMeta(id);
  return (
    <span
      className={`relative inline-flex flex-col items-center justify-center gap-1 rounded-[4px] border border-dashed border-chalk/25 text-center ${className} ${placeholderClassName}`}
      style={style}
      role="img"
      aria-label={`${meta.label} (emplacement)`}
      title={`Emplacement : public/brand/${meta.file}.svg ou .png`}
    >
      {placeholder ?? (
        <>
          <span className="font-display text-[15px] leading-none tracking-[0.02em] text-chalk/70" style={{ fontWeight: 800 }}>
            {meta.label}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-dust/70">brand/{meta.file}</span>
        </>
      )}
    </span>
  );
}
