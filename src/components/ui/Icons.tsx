/** Icônes au trait, dessinées pour la DA (pas de police d'icônes). */
type P = { size?: number; className?: string };

export function IconSound({ on, size = 16, className }: P & { on: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
      {on ? (
        <>
          <path d="M10.5 5.5c1 .7 1.5 1.5 1.5 2.5s-.5 1.8-1.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12.3 3.6C13.9 4.8 14.6 6.3 14.6 8s-.7 3.2-2.3 4.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      ) : (
        <path d="m10.5 6 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  );
}

export function IconSlides({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="1.5" y="2.5" width="13" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 11.5V14M5 14h6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconPlay({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M4.5 2.8v10.4L13 8z" fill="currentColor" />
    </svg>
  );
}

export function IconPause({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
    </svg>
  );
}

export function IconClose({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconRec({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="1.5" y="3.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.5 7 4-2.5v7l-4-2.5z" fill="currentColor" />
    </svg>
  );
}

export function IconCheck({ size = 14, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="m3 8.5 3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function IconCross({ size = 14, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function IconExternal({ size = 12, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M6 3H3v10h10v-3M9 2.5h4.5V7M13.5 2.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
