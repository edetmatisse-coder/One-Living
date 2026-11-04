import type { Metadata, Viewport } from 'next';
import { fontDisplay, fontMono, fontSans } from './fonts';
import { getBrandManifest } from '@/lib/brand-manifest';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Après la voie · One Living × B’Wall',
  description:
    'Maquette du site de la campagne « Après la voie » : One Living dans les salles d’escalade. Projet étudiant WIN Sport School, non affilié à One Living.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#1B1916',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const manifest = getBrandManifest();
  return (
    <html lang="fr" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers manifest={manifest}>{children}</Providers>
      </body>
    </html>
  );
}
