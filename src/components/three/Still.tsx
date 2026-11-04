import type { CSSProperties } from 'react';

/**
 * Visuel fixe d'une scène 3D, rendu par `npm run fallbacks` dans public/fallback/.
 * Affiché en mouvement réduit ou sans WebGL, et pendant le chargement de la 3D.
 * `responsive` : une version large et une version mobile (moins de 768 px).
 */
export function Still({
  name,
  responsive = false,
  priority = false,
  className = '',
  style,
}: {
  name: string;
  responsive?: boolean;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <picture>
      {responsive && <source media="(max-width: 767px)" srcSet={`/fallback/${name}-mobile.webp`} type="image/webp" />}
      <img
        src={`/fallback/${responsive ? `${name}-large` : name}.webp`}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
        style={style}
      />
    </picture>
  );
}
