import type { Metadata } from 'next';
import { CampagnePage } from '@/components/campagne/CampagnePage';

export const metadata: Metadata = {
  title: 'Après la voie · Campagne One Living (maquette)',
  description: 'Maquette du site public de la campagne « Après la voie ». Projet étudiant WIN Sport School, non affilié à One Living.',
};

export default function Page() {
  return <CampagnePage />;
}
