import type { NextConfig } from 'next';

/**
 * Export statique dans `out/`, servi en local par `npm run start`
 * (scripts/serve.mjs). Pour GitHub Pages, le workflow fixe
 * NEXT_PUBLIC_BASE_PATH=/One-Living : le site vit alors dans ce sous-dossier.
 * Aucune optimisation d'image côté serveur, aucune ressource distante.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  devIndicators: false,
  poweredByHeader: false,
  agentRules: false,
};

export default nextConfig;
