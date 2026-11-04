/**
 * Visuels attendus dans `public/brand/` (les produits sont dans
 * `public/brand/produits/`, voir scripts/extract-products.py).
 * Le site vérifie leur présence au build (et à chaque requête en dev) :
 * s'ils manquent, un emplacement propre s'affiche à la place.
 */
export const BRAND_EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg'] as const;

export const BRAND_ASSETS = [
  { id: 'logoOneLiving', file: 'logo-one-living', label: 'Logo One Living', usage: 'En-tête' },
  { id: 'logoWin', file: 'logo-win', label: 'Logo WIN Sport School', usage: 'Pied de page' },
  { id: 'photoSalle', file: 'photo-salle', label: 'Photo de la bouteille dans une salle d’escalade', usage: 'Haut de page' },
  { id: 'logoBwall', file: 'logo-bwall', label: 'Logo B’Wall', usage: 'Trouver une salle' },
] as const;

export type BrandAssetId = (typeof BRAND_ASSETS)[number]['id'];

/** Chemin public de chaque visuel trouvé, ou null s'il manque. */
export type BrandManifest = Record<BrandAssetId, string | null>;

export function emptyManifest(): BrandManifest {
  return Object.fromEntries(BRAND_ASSETS.map((a) => [a.id, null])) as BrandManifest;
}

export function brandAssetMeta(id: BrandAssetId) {
  return BRAND_ASSETS.find((a) => a.id === id)!;
}
