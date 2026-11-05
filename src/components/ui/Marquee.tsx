import type { ReactNode } from 'react';

/**
 * Bandeau qui défile en boucle (CSS seul). Le contenu est dupliqué pour que
 * la boucle soit continue ; en mouvement réduit, le bandeau reste immobile.
 */
export function Marquee({ children, className = '', duration = 38 }: { children: ReactNode; className?: string; duration?: number }) {
  return (
    <div className={`marquee group relative overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max" style={{ animationDuration: `${duration}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
