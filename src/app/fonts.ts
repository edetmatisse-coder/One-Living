import localFont from 'next/font/local';

/**
 * Polices embarquées en local (woff2 copiés depuis @fontsource, licence OFL).
 * Aucune requête réseau : le site fonctionne hors connexion.
 */
export const fontDisplay = localFont({
  src: [
    { path: './fonts/big-shoulders-display-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/big-shoulders-display-latin-800-normal.woff2', weight: '800', style: 'normal' },
    { path: './fonts/big-shoulders-display-latin-900-normal.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-big-shoulders',
  display: 'swap',
  preload: true,
  fallback: ['Impact', 'Arial Narrow', 'sans-serif'],
});

export const fontSans = localFont({
  src: [
    { path: './fonts/instrument-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/instrument-sans-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/instrument-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/instrument-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-instrument',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const fontMono = localFont({
  src: [
    { path: './fonts/jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/jetbrains-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
});
