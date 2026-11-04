/**
 * Visuels de marque attendus dans `public/brand/`.
 * Le site vérifie leur présence au build (et à chaque requête en dev) :
 * s'ils manquent, un emplacement propre s'affiche à la place.
 */
export const BRAND_EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg'] as const;

export const BRAND_ASSETS = [
  { id: 'logoOneLiving', file: 'logo-one-living', label: 'Logo One Living', usage: 'En-tête du Dossier, en-tête de la Campagne, étiquette de la bouteille 3D' },
  { id: 'logoWin', file: 'logo-win', label: 'Logo WIN Sport School', usage: 'Pied de page des deux parties' },
  { id: 'bouteilleGingembre', file: 'bouteille-gingembre-curcuma', label: 'Visuel produit gingembre-curcuma', usage: 'Gamme (Campagne), fiche parfum' },
  { id: 'bouteilleFramboise', file: 'bouteille-framboise-grenade', label: 'Visuel produit framboise-grenade', usage: 'Gamme (Campagne), fiche parfum' },
  { id: 'bouteillePassion', file: 'bouteille-passion-goji', label: 'Visuel produit passion-goji', usage: 'Gamme (Campagne), fiche parfum' },
  { id: 'bouteilleMangue', file: 'bouteille-mangue-citron-vert', label: 'Visuel produit mangue-citron vert', usage: 'Gamme (Campagne), fiche parfum' },
  { id: 'etiquetteGingembre', file: 'etiquette-gingembre-curcuma', label: 'Étiquette à plat gingembre-curcuma', usage: 'Texture de l’étiquette de la bouteille 3D' },
  { id: 'etiquetteFramboise', file: 'etiquette-framboise-grenade', label: 'Étiquette à plat framboise-grenade', usage: 'Texture de l’étiquette de la bouteille 3D' },
  { id: 'etiquettePassion', file: 'etiquette-passion-goji', label: 'Étiquette à plat passion-goji', usage: 'Texture de l’étiquette de la bouteille 3D' },
  { id: 'etiquetteMangue', file: 'etiquette-mangue-citron-vert', label: 'Étiquette à plat mangue-citron vert', usage: 'Texture de l’étiquette de la bouteille 3D' },
  { id: 'shots', file: 'shots', label: 'Visuel des 3 shots', usage: 'Bloc « Les shots » de la Campagne' },
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
