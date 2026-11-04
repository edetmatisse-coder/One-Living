import type { NextConfig } from 'next';

/**
 * Site 100 % local : export statique dans `out/`, servi par `npm run start`
 * (scripts/serve.mjs) ou ouvert hors connexion. Aucune optimisation d'image
 * côté serveur, aucune ressource distante.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  devIndicators: false,
  poweredByHeader: false,
  agentRules: false,
};

export default nextConfig;
