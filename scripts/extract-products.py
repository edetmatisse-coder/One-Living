#!/usr/bin/env python3
"""
Prépare la gamme One Living pour la 3D, à partir des photos produits du site
oneliving.com (fond blanc, prises de face).

Pour chaque produit :
  - public/brand/produits/<id>.jpg            la photo, recadrée
  - public/brand/produits/<id>-etiquette.webp l'étiquette déroulée à plat
et pour chaque format (bouteille, canette, shot) la silhouette mesurée sur la
photo, écrite dans src/data/product-shapes.ts.

Usage (Python 3 avec Pillow et numpy) :
  python3 scripts/extract-products.py --src dossier/des/photos

Les photos attendues dans --src portent les noms de PRODUCTS ci-dessous.
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Bandes mesurées sur les photos de référence (lignes de pixels).
FORMATS = {
    # bouteille en verre 33 cl : bouchon, puis étiquette noire sur le corps
    # (le haut du « 1 » et le macaron dépassent du bord droit de l'étiquette, ligne 595 :
    # au-dessus, seul ce qui n'est pas du verre ambré reste opaque)
    'bouteille': {'ref': 'b-ginger', 'cap': (75, 238), 'label': (540, 1290), 'diecut': 597, 'base': 1450},
    # canette 25 cl : tout le corps est imprimé, bords en aluminium
    # (l'ombre portée tombe à droite : les rayons sont mesurés sur le bord gauche)
    'canette': {'ref': 'c-ginger', 'top': 134, 'label': (152, 864), 'base': 888},
    # shot 10 cl : bouchon blanc, flacon transparent, étiquette sur le corps
    'shot': {'ref': 's-energy', 'cap': (152, 292), 'label': (414, 744), 'base': 816},
}

PRODUCTS = [
    ('bouteille-gingembre', 'b-ginger', 'bouteille'),
    ('bouteille-mangue', 'b-mango', 'bouteille'),
    ('bouteille-passion', 'b-passion', 'bouteille'),
    ('bouteille-framboise', 'b-raspberry', 'bouteille'),
    ('canette-gingembre', 'c-ginger', 'canette'),
    ('canette-passion', 'c-passion', 'canette'),
    ('canette-framboise', 'c-raspberry', 'canette'),
    ('shot-tropical', 's-energy', 'shot'),
    ('shot-fraise-citron', 's-gut', 'shot'),
    ('shot-agrumes-gingembre', 's-immunity', 'shot'),
]

THETA_MAX = math.radians(76)  # au-delà, la photo est trop écrasée sur les bords
EDGE = math.radians(7)        # fondu entre la photo et le dos reconstitué


def load(src, name):
    im = np.asarray(Image.open(os.path.join(src, name + '.jpg')).convert('RGB')).astype(np.float32)
    return im


def mask_of(im):
    bg = np.median(np.concatenate([im[:12].reshape(-1, 3), im[-12:].reshape(-1, 3)]), axis=0)
    return np.abs(im - bg).max(axis=2) > 14


def row_extent(mask, y):
    xs = np.where(mask[y])[0]
    if len(xs) < 4:
        return None
    return float(xs[0]), float(xs[-1])


def bilinear(im, x, y):
    h, w, _ = im.shape
    x = np.clip(x, 0, w - 1.001)
    x0 = np.floor(x).astype(int)
    fx = (x - x0)[..., None]
    return im[y, x0] * (1 - fx) + im[y, x0 + 1] * fx


def axis_of(mask, y0, y1):
    """Axe vertical du produit : milieu médian des bords sur la bande d'étiquette."""
    mids = []
    for y in range(y0 + (y1 - y0) // 5, y1 - (y1 - y0) // 5, 4):
        e = row_extent(mask, y)
        if e:
            mids.append((e[0] + e[1]) / 2)
    return float(np.median(mids))


def unwrap(im, mask, y0, y1, diecut=None):
    """Déroule la bande [y0, y1] du cylindre sur 360°, face avant au centre."""
    rows = range(y0, y1)
    cx = axis_of(mask, y0, y1)
    lefts = np.array([row_extent(mask, y)[0] for y in rows])
    # bord gauche lissé (l'ombre portée tombe à droite, on ne s'en sert pas)
    k = 9
    lefts = np.convolve(np.pad(lefts, k, mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), mode='same')[k:-k]
    centers = np.full(len(lefts), cx)
    radii = (cx - lefts) * 0.985  # on reste un peu à l'intérieur du bord
    ext = list(rows)
    r_mean = float(np.median(radii))
    width = int(round(2 * math.pi * r_mean))
    width -= width % 2
    phis = (np.arange(width) + 0.5) / width * 2 * math.pi - math.pi  # 0 = face
    front = np.abs(phis) <= THETA_MAX

    out = np.zeros((len(ext), width, 3), np.float32)
    for i, y in enumerate(rows):
        xs = centers[i] + radii[i] * np.sin(phis[front])
        out[i, front] = bilinear(im, xs, y)

    # ombrage de la photo : on compense la baisse de lumière vers les bords
    lum = out[:, front].mean(axis=2)
    prof = np.median(lum, axis=0)
    cosv = np.cos(phis[front])
    if np.median(prof) > 45:
        sel = np.abs(phis[front]) < math.radians(66)
        A = np.stack([np.ones(sel.sum()), 1 - cosv[sel]], axis=1)
        coef, *_ = np.linalg.lstsq(A, prof[sel], rcond=None)
        p0, slope = coef
        kfall = float(np.clip(-slope / max(p0, 1), 0, 0.55))
        gain = 1 / (1 - kfall * (1 - cosv))
        out[:, front] = np.clip(out[:, front] * gain[None, :, None], 0, 255)

    # dos de l'étiquette : on relie les deux bords, rangée par rangée
    edge_n = max(3, int(EDGE / (2 * math.pi) * width))
    idx = np.where(front)[0]
    left_cols, right_cols = idx[:edge_n], idx[-edge_n:]
    left_c = out[:, left_cols].mean(axis=1)
    right_c = out[:, right_cols].mean(axis=1)
    kv = 40  # lissage vertical fort : le dos reste uni, sans rayures
    sm = lambda a: np.stack([np.convolve(np.pad(a[:, c], kv, mode='edge'), np.ones(2 * kv + 1) / (2 * kv + 1), mode='same')[kv:-kv] for c in range(3)], axis=1)
    left_c, right_c = sm(left_c), sm(right_c)
    back = ~front
    # parcours du bord droit (phi = +max) au bord gauche (phi = -max) par l'arrière
    t = ((phis[back] - THETA_MAX) % (2 * math.pi)) / (2 * math.pi - 2 * THETA_MAX)
    out[:, back] = right_c[:, None] * (1 - t[None, :, None]) + left_c[:, None] * t[None, :, None]

    # fondu doux à la jonction
    a = np.abs(phis)
    blend = np.clip((a - (THETA_MAX - EDGE)) / EDGE, 0, 1) * front
    edge_col = np.where(phis[None, :, None] > 0, right_c[:, None], left_c[:, None])
    out = out * (1 - blend[None, :, None]) + edge_col * blend[None, :, None]
    alpha = np.full(out.shape[:2], 255, np.uint8)
    if diecut is not None:
        n = diecut - y0
        top = out[:n]
        mx, mn = top.max(axis=2), top.min(axis=2)
        r, b = top[..., 0], top[..., 2]
        glass = (r > b + 22) & (r < 188) & (mx - mn > 26)
        a = np.where(glass, 0, 255).astype(np.float32)
        a[:, ~front] = 0
        # bord net mais sans escalier
        a = np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32)
        a = np.clip((a - 60) * 1.6, 0, 255)
        alpha[:n] = a.astype(np.uint8)
    rgba = np.dstack([out.astype(np.uint8), alpha])
    return rgba, r_mean


def silhouette(mask, top, base, cx, step=6):
    """Profil (rayon, hauteur) du bas vers le haut, normalisé : hauteur totale = 1."""
    pts = []
    for y in range(base, top - 1, -step):
        e = row_extent(mask, y)
        if e is None:
            continue
        pts.append((max(0.0, cx - e[0]), base - y))
    h = float(base - top)
    return [[round(r / h, 5), round(y / h, 5)] for r, y in pts], h


def sample(im, box):
    x0, y0, x1, y1 = box
    c = np.median(im[y0:y1, x0:x1].reshape(-1, 3), axis=0)
    return '#%02x%02x%02x' % tuple(int(v) for v in c)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    args = ap.parse_args()
    out_dir = os.path.join(ROOT, 'public', 'brand', 'produits')
    os.makedirs(out_dir, exist_ok=True)

    shapes = {}
    for fmt, spec in FORMATS.items():
        im = load(args.src, spec['ref'])
        m = mask_of(im)
        top = spec['cap'][0] if 'cap' in spec else spec['top']
        cx = axis_of(m, *spec['label'])
        prof, h = silhouette(m, top, spec['base'], cx)
        norm = lambda y: round((spec['base'] - y) / h, 5)
        entry = {'profile': prof, 'label': [norm(spec['label'][1]), norm(spec['label'][0])]}
        if 'cap' in spec:
            entry['cap'] = [norm(spec['cap'][1]), norm(spec['cap'][0])]
        else:
            entry['top'] = norm(spec['label'][0])
            entry['bottom'] = norm(spec['label'][1])
        shapes[fmt] = entry

    colors = {}
    for pid, name, fmt in PRODUCTS:
        spec = FORMATS[fmt]
        im = load(args.src, name)
        m = mask_of(im)
        lab, _ = unwrap(im, m, *spec['label'], diecut=spec.get('diecut'))
        img = Image.fromarray(lab, 'RGBA') if 'diecut' in spec else Image.fromarray(lab[..., :3])
        img.save(os.path.join(out_dir, pid + '-etiquette.webp'), quality=88)
        # photo recadrée sur le produit, pour les visuels fixes
        ys, xs = np.where(m)
        y0, y1 = max(0, ys.min() - 40), min(im.shape[0], ys.max() + 40)
        cx = int((xs.min() + xs.max()) / 2)
        half = int((y1 - y0) * 0.42)
        crop = Image.fromarray(im.astype(np.uint8)).crop((cx - half, y0, cx + half, y1))
        crop.thumbnail((900, 900))
        crop.save(os.path.join(out_dir, pid + '.jpg'), quality=88)
        e = row_extent(m, (spec['label'][0] + spec['label'][1]) // 2)
        cxl = int((e[0] + e[1]) / 2)
        c = {}
        if fmt == 'bouteille':
            c['cap'] = sample(im, (cxl - 40, spec['cap'][0] + 40, cxl + 40, spec['cap'][0] + 90))
            c['glass'] = sample(im, (cxl - 120, spec['label'][1] + 30, cxl - 60, spec['label'][1] + 90))
        elif fmt == 'shot':
            c['liquid'] = sample(im, (cxl - 60, spec['label'][0] - 46, cxl + 60, spec['label'][0] - 16))
        colors[pid] = c

    ts = [
        '// Fichier généré par scripts/extract-products.py : ne pas modifier à la main.',
        '// Silhouettes mesurées sur les photos produits de oneliving.com (hauteur totale = 1).',
        '',
        'export interface ProductShape {',
        '  /** points [rayon, hauteur], du bas vers le haut */',
        '  profile: [number, number][];',
        '  /** bande de l\'étiquette [bas, haut] */',
        '  label: [number, number];',
        '  cap?: [number, number];',
        '  top?: number;',
        '  bottom?: number;',
        '}',
        '',
        'export const SHAPES: Record<\'bouteille\' | \'canette\' | \'shot\', ProductShape> = ' + json.dumps(shapes) + ';',
        '',
        '/** Couleurs relevées sur les photos (bouchon, verre, liquide). */',
        'export const PHOTO_COLORS: Record<string, { cap?: string; glass?: string; liquid?: string }> = ' + json.dumps(colors) + ';',
        '',
    ]
    with open(os.path.join(ROOT, 'src', 'data', 'product-shapes.ts'), 'w') as f:
        f.write('\n'.join(ts))
    print('ok', len(PRODUCTS), 'produits')


if __name__ == '__main__':
    main()
