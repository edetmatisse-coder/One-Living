import type { Metadata } from 'next';
import Link from 'next/link';
import { Hold } from '@/components/ui/Hold';
import { Arrow } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Hors voie · Après la voie',
};

/** Page 404 : la voie s'arrête ici, on redescend au départ. */
export default function NotFound() {
  return (
    <main className="plywood relative grid min-h-[100svh] place-items-center overflow-hidden px-[var(--gutter)] py-24 text-center">
      <div className="relative">
        <div className="label-mono flex items-center justify-center gap-3 text-yellow">
          <Hold kind="crimp" color="#F2B705" size={22} />
          Erreur 404
        </div>
        <h1 className="font-display mt-5 text-[clamp(84px,14vw,220px)] text-chalk">Hors voie.</h1>
        <p className="mx-auto mt-6 max-w-[40ch] text-[17px] leading-relaxed text-chalk-dim">
          Cette page n’existe pas. Redescendez au départ et reprenez la voie.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-[4px] bg-yellow px-5 py-3.5 text-[15px] font-semibold text-ply-900"
          >
            Revenir à l’accueil
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <Arrow />
            </span>
          </Link>
        </div>
        <p className="label-mono mt-16 text-[10.5px] text-dust">Projet étudiant WIN Sport School, non affilié à One Living, présentation locale</p>
      </div>
    </main>
  );
}
