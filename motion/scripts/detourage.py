#!/usr/bin/env python3
"""
Détoure les bouteilles et les shots One Living pour les séquences motion,
et agrandit le logo avec des bords nets.

Les photos produits de oneliving.com sont prises de face, sur fond blanc :
chaque contenant est symétrique, on mesure donc son bord gauche ligne par
ligne (l'ombre portée tombe à droite) et on en déduit une silhouette nette.
Le col transparent des shots redevient transparent.

Usage (Python 3 avec Pillow et numpy), depuis le dossier motion/ :
  python3 scripts/detourage.py
  python3 scripts/detourage.py --src dossier/photos-hd   (photos plus grandes, noms d'origine)

Sortie : public/produits/<id>.webp et public/logo-one-living.png
"""
import argparse
import os

import numpy as np
from PIL import Image, ImageFilter

ICI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.dirname(ICI)

# id du site -> nom de la photo d'origine (oneliving.com)
PRODUITS = {
    'bouteille-gingembre': 'b-ginger',
    'bouteille-framboise': 'b-raspberry',
    'bouteille-passion': 'b-passion',
    'bouteille-mangue': 'b-mango',
    'shot-tropical': 's-energy',
    'shot-fraise-citron': 's-gut',
    'shot-agrumes-gingembre': 's-immunity',
}


def charger(src, ident):
    """Photo HD si --src est donné et qu'elle existe, sinon la photo du site."""
    if src:
        for nom in (PRODUITS[ident], ident):
            p = os.path.join(src, nom + '.jpg')
            if os.path.exists(p):
                return np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    p = os.path.join(SITE, 'public', 'brand', 'produits', ident + '.jpg')
    return np.asarray(Image.open(p).convert('RGB')).astype(np.float32)


def lisser(v, k=5):
    """Médiane glissante (supprime les pixels isolés du profil)."""
    out = v.copy()
    r = k // 2
    for i in range(len(v)):
        a, b = max(0, i - r), min(len(v), i + r + 1)
        seg = v[a:b]
        seg = seg[~np.isnan(seg)]
        out[i] = np.median(seg) if len(seg) else np.nan
    return out


def detourer(im, shot):
    h, w, _ = im.shape
    fond = np.median(np.concatenate([im[:10].reshape(-1, 3), im[-10:].reshape(-1, 3), im[:, :10].reshape(-1, 3)]), axis=0)
    ecart = np.abs(im - fond).max(axis=2)
    masque = ecart > 14
    fort = ecart > 55

    lignes = np.where(masque.sum(axis=1) >= 4)[0]
    haut = int(lignes[0])
    # le pied : dernière ligne nettement contrastée (l'ombre douce est en dessous)
    bas = int(np.where(fort.sum(axis=1) >= max(12, w // 60))[0][-1])

    # axe : milieu médian des bords sur la moitié centrale de l'objet
    mids = []
    for y in range(haut + (bas - haut) // 4, bas - (bas - haut) // 4, 3):
        xs = np.where(masque[y])[0]
        if len(xs) >= 4:
            mids.append((xs[0] + xs[-1]) / 2)
    cx = float(np.median(mids))

    # rayon ligne par ligne, mesuré sur le bord gauche, avec précision sous-pixel
    rayons = np.full(h, np.nan)
    for y in range(haut, bas + 1):
        xs = np.where(masque[y, : int(cx)])[0]
        if len(xs) == 0:
            continue
        x0 = xs[0]
        # sous-pixel : part du pixel de bord réellement couverte
        frac = np.clip(ecart[y, max(0, x0 - 1)] / max(ecart[y, min(w - 1, x0 + 2)], 1), 0, 1)
        rayons[y] = cx - x0 + frac
    rayons = lisser(rayons, 5)

    # alpha : silhouette symétrique, bord anticrénelé, légèrement rentré (pas de liseré blanc)
    xx = np.arange(w)[None, :]
    r = np.nan_to_num(rayons, nan=-10)[:, None] - 0.9
    alpha = np.clip(r + 0.5 - np.abs(xx - cx + 0.5), 0, 1)
    alpha[: haut] = 0
    alpha[bas + 1:] = 0
    # pied arrondi sur deux lignes
    alpha[bas] *= 0.5

    # couleur des bords : on reprend le pixel 3 px vers l'intérieur (décontamination)
    rgb = im.copy()
    bord = (alpha > 0) & (alpha < 1)
    ys, xs = np.where(bord | ((alpha == 1) & (np.abs(xx - cx) > (np.nan_to_num(rayons, nan=0)[:, None] - 3))))
    vers = np.where(xs < cx, 1, -1)
    rgb[ys, xs] = im[ys, np.clip(xs + 3 * vers, 0, w - 1)]

    if shot:
        # col transparent : entre le bouchon et le liquide, le blanc du fond traverse
        # le plastique. On le rend transparent (on garde reflets et contours).
        hauteur = bas - haut
        bouchon_bas = haut + int(0.215 * hauteur)
        sat = (im.max(axis=2) - im.min(axis=2))
        y = bouchon_bas
        while y < bas and np.median(sat[y, int(cx - 20): int(cx + 20)]) < 60:
            y += 1
        liquide = y
        zone = np.zeros_like(alpha, dtype=bool)
        zone[bouchon_bas:liquide] = True
        clair = zone & (alpha > 0)
        transp = np.clip((ecart - 6) / 70.0, 0.06, 1.0)
        alpha = np.where(clair, alpha * transp, alpha)
        # le plastique clair garde une teinte froide, pas de gris sale
        rgb = np.where(clair[..., None], np.clip(rgb * 0.92 + 18, 0, 255), rgb)

    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    ys, xs = np.where(alpha > 0.01)
    y0, y1 = max(0, ys.min() - 6), min(h, ys.max() + 7)
    x0, x1 = max(0, xs.min() - 6), min(w, xs.max() + 7)
    return Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')


def logo(sortie):
    """Logo One Living (343 px) agrandi ×4 : alpha bicubique puis seuil doux, couleurs aplaties."""
    src = Image.open(os.path.join(SITE, 'public', 'brand', 'logo-one-living.png')).convert('RGBA')
    k = 4
    W, H = src.width * k, src.height * k
    a = np.asarray(src).astype(np.float32) / 255
    alpha = a[..., 3]
    prem = a[..., :3] * alpha[..., None]
    big = lambda ch: np.asarray(Image.fromarray((ch * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
    A = big(alpha)
    P = np.dstack([big(prem[..., i]) for i in range(3)])
    coul = P / np.maximum(A[..., None], 1e-3)
    # couleurs dominantes (pixels bien opaques de la source)
    opaques = a[alpha > 0.9][:, :3]
    centres = opaques[np.random.default_rng(1).choice(len(opaques), 6, replace=False)]
    for _ in range(20):
        d = ((opaques[:, None] - centres[None]) ** 2).sum(-1)
        lab = d.argmin(1)
        centres = np.array([opaques[lab == i].mean(0) if (lab == i).any() else centres[i] for i in range(len(centres))])
    d = ((coul[..., None, :] - centres[None, None]) ** 2).sum(-1)
    plat = centres[d.argmin(-1)]
    t = np.clip((A - 0.4) / 0.2, 0, 1)
    A2 = t * t * (3 - 2 * t)
    out = np.dstack([plat * 255, A2 * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(sortie, optimize=True)
    print('logo', W, 'x', H, '->', os.path.relpath(sortie, ICI))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=None, help='dossier des photos produits HD (facultatif)')
    args = ap.parse_args()
    dossier = os.path.join(ICI, 'public', 'produits')
    os.makedirs(dossier, exist_ok=True)
    tailles = {}
    for ident in PRODUITS:
        im = detourer(charger(args.src, ident), ident.startswith('shot'))
        p = os.path.join(dossier, ident + '.webp')
        im.save(p, 'WEBP', quality=94, method=6, alpha_quality=100)
        tailles[ident] = im.size
        print(ident, im.size, '->', os.path.relpath(p, ICI))
    with open(os.path.join(ICI, 'src', 'tailles.ts'), 'w', encoding='utf-8') as f:
        f.write('// Fichier généré par scripts/detourage.py : ne pas modifier à la main.\n')
        f.write('// Taille (px) des produits détourés, pour garder leurs proportions.\n')
        f.write('export const TAILLES: Record<string, [number, number]> = {\n')
        for ident, (w, h) in tailles.items():
            f.write(f"  '{ident}': [{w}, {h}],\n")
        f.write('};\n')
    logo(os.path.join(ICI, 'public', 'logo-one-living.png'))


if __name__ == '__main__':
    main()
