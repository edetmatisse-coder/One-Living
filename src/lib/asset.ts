/**
 * Préfixe des fichiers de public/ : vide en local, « /One-Living » pour la
 * version en ligne sur GitHub Pages (variable fixée au build par le workflow).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Vrai pour la version en ligne (GitHub Pages). */
export const ONLINE = BASE_PATH !== '';

export const asset = (path: string) => `${BASE_PATH}${path}`;
