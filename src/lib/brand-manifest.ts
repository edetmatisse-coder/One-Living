import fs from 'node:fs';
import path from 'node:path';
import { BRAND_ASSETS, BRAND_EXTENSIONS, type BrandManifest } from '@/data/brand-assets';
import { asset } from '@/lib/asset';

/**
 * Lu côté serveur uniquement (au build pour l'export statique, à chaque
 * requête en dev) : quels visuels de marque sont présents dans public/brand/ ?
 */
export function getBrandManifest(): BrandManifest {
  const dir = path.join(process.cwd(), 'public', 'brand');
  const out = {} as BrandManifest;
  for (const item of BRAND_ASSETS) {
    let found: string | null = null;
    for (const ext of BRAND_EXTENSIONS) {
      const file = `${item.file}.${ext}`;
      try {
        if (fs.existsSync(path.join(dir, file))) {
          found = asset(`/brand/${file}`);
          break;
        }
      } catch {
        // dossier absent : on garde null
      }
    }
    out[item.id] = found;
  }
  return out;
}
