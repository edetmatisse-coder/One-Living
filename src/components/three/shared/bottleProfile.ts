import * as THREE from 'three';

/**
 * Profil d'une bouteille de 33 cl (en mètres) : corps droit, épaule douce,
 * col fin, bague. Révolution autour de l'axe y.
 */
export const BOTTLE = {
  height: 0.2,
  radius: 0.031,
  neckRadius: 0.0135,
  liquidTop: 0.158,
};

const PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.024, 0.0],
  [0.0292, 0.0022],
  [0.0308, 0.0075],
  [0.031, 0.016],
  [0.031, 0.116],
  [0.0302, 0.126],
  [0.0276, 0.136],
  [0.0232, 0.146],
  [0.0186, 0.156],
  [0.0152, 0.166],
  [0.0137, 0.176],
  [0.0135, 0.187],
  [0.0153, 0.1895],
  [0.0156, 0.196],
  [0.014, 0.2],
];

/** Points du profil, sur-échantillonnés pour une silhouette lisse. */
export function bottlePoints(subdiv = 3, scale = 1): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
  const pts = curve.getPoints(PROFILE.length * subdiv);
  // le fond reste à plat
  pts[0].set(0, 0);
  return pts.map((p) => new THREE.Vector2(Math.max(0, p.x) * scale, p.y * scale));
}

/** Géométrie du verre (surface extérieure). */
export function bottleGeometry(segments = 64, subdiv = 3, scale = 1): THREE.LatheGeometry {
  return new THREE.LatheGeometry(bottlePoints(subdiv, scale), segments);
}

/**
 * Volume intérieur rempli jusqu'à `fill` (hauteur en mètres), légèrement en
 * retrait du verre. Sert de support au shader de liquide.
 */
export function liquidGeometry(fill = BOTTLE.liquidTop, segments = 48, inset = 0.0022, scale = 1): THREE.LatheGeometry {
  const pts = bottlePoints(4)
    .filter((p) => p.y <= fill + 0.02)
    .map((p) => new THREE.Vector2(Math.max(0, p.x - inset), Math.max(0.0025, p.y)));
  pts[0].set(0, 0.0025);
  // on prolonge un peu au-dessus du niveau : le shader découpe la surface
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector2(last.x * 0.98, fill + 0.022));
  pts.push(new THREE.Vector2(0, fill + 0.022));
  return new THREE.LatheGeometry(
    pts.map((p) => new THREE.Vector2(p.x * scale, p.y * scale)),
    segments,
  );
}
