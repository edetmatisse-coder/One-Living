#!/usr/bin/env python3
"""
Textures des séquences (générées, aucune image externe) :
  public/textures/grain-0..5.png  grain argentique (tuiles qui changent à chaque image)
  public/textures/encre.png       usure d'un tampon encreur (masque alpha)
  public/textures/craie.png       grain de la magnésie pour le trait final (masque alpha)

Usage, depuis le dossier motion/ : python3 scripts/textures.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter

ICI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ICI, 'public', 'textures')
rng = np.random.default_rng(2026)


def champ(n, sigma):
    """Bruit lissé, tuilable (flou circulaire via FFT), normalisé 0..1."""
    z = rng.standard_normal((n, n))
    f = np.fft.fft2(z)
    k = np.fft.fftfreq(n)
    kx, ky = np.meshgrid(k, k)
    f *= np.exp(-(kx ** 2 + ky ** 2) * (2 * np.pi * sigma) ** 2 / 2)
    v = np.real(np.fft.ifft2(f))
    return (v - v.min()) / (v.max() - v.min())


def main():
    os.makedirs(OUT, exist_ok=True)
    # grain : bruit fin + un peu de grain plus gros, centré sur le gris moyen
    for i in range(6):
        g = rng.standard_normal((256, 256)) * 0.75 + (champ(256, 1.2) - 0.5) * 2.2
        g = np.clip(128 + g * 34, 0, 255).astype(np.uint8)
        Image.fromarray(g, 'L').save(os.path.join(OUT, f'grain-{i}.png'), optimize=True)

    # encre : taches et manques d'un tampon (blanc = encre)
    n = 512
    gros = champ(n, 9)
    moyen = champ(n, 3)
    fin = rng.random((n, n))
    encre = (gros * 0.55 + moyen * 0.45)
    a = np.clip((encre - 0.30) / 0.10, 0, 1)            # manques irréguliers
    a *= np.where(fin < 0.035, 0.0, 1.0)                 # petits trous
    a = np.clip(a * 0.85 + 0.15 * (moyen > 0.42), 0, 1)  # bords d'encre plus denses
    img = np.dstack([np.full((n, n), 255), np.full((n, n), 255), np.full((n, n), 255), a * 255]).astype(np.uint8)
    Image.fromarray(img, 'RGBA').filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(OUT, 'encre.png'), optimize=True)

    # craie : poudre irrégulière, beaucoup de petits manques
    poudre = champ(n, 1.4) * 0.6 + rng.random((n, n)) * 0.4
    a = np.clip((poudre - 0.36) / 0.16, 0, 1)
    img = np.dstack([np.full((n, n), 255), np.full((n, n), 255), np.full((n, n), 255), a * 255]).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(os.path.join(OUT, 'craie.png'), optimize=True)
    print('textures ->', os.path.relpath(OUT, ICI))


if __name__ == '__main__':
    main()
