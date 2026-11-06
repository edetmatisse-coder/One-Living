/**
 * Feuille de bruitages : à quelle seconde placer quel son dans CapCut.
 * Calculée depuis config.ts (les mêmes moments que les animations).
 *
 *   npm run bruitages   ->  out/bruitages.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMAGES_PAR_SECONDE as FPS, bandeaux, questions } from '../config';
import { type Bruit, type Son, tCarton, tEntonnoir, tFinal, tIntro, tMarque, tNom, tQuestion, tSoixanteNeuf, tTitre } from '../src/timelines';

const ICI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const SONS: Record<Son, { nom: string; chercher: string }> = {
  whoosh: { nom: 'Whoosh', chercher: '« whoosh », « swoosh »' },
  pop: { nom: 'Pop', chercher: '« pop », « bubble pop »' },
  tampon: { nom: 'Tampon', chercher: '« stamp », « tampon »' },
  bouteille: { nom: 'Ouverture de bouteille', chercher: '« bottle open », « soda open »' },
  impact: { nom: 'Impact', chercher: '« impact », « hit », « boom »' },
  compteur: { nom: 'Compteur qui défile', chercher: '« counter », « ticking »' },
  feutre: { nom: 'Feutre', chercher: '« marker », « scribble »' },
  souffle: { nom: 'Souffle', chercher: '« air », « breath », « powder »' },
  clic: { nom: 'Clics rapides', chercher: '« typewriter », « click »' },
  tic: { nom: 'Tic rapide', chercher: '« tick », « clock tick »' },
};

/** 3.27 -> « 3,27 s » */
const secondes = (t: number) => `${t.toFixed(2).replace('.', ',')} s`;
/** 3.27 -> « 00:03:08 » (minutes:secondes:images, à 30 images par seconde) */
const repere = (t: number) => {
  const i = Math.round(t * FPS);
  const s = Math.floor(i / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(i % FPS)}`;
};

const tableau = (bruits: Bruit[]) =>
  [
    '| Moment | Repère CapCut | Son | Sur quoi |',
    '| --- | --- | --- | --- |',
    ...[...bruits]
      .sort((a, b) => a.t - b.t)
      .map((b) => `| ${secondes(b.t)}${b.fin != null ? ` à ${secondes(b.fin)}` : ''} | ${repere(b.t)} | ${SONS[b.son].nom} | ${b.quoi} |`),
  ].join('\n');

export function feuille() {
  const parties: string[] = [];
  parties.push('### 01_marque.mp4', tableau(tMarque().bruits));
  parties.push('### 02_entonnoir.mp4', tableau(tEntonnoir().bruits));
  parties.push('### 03_69.mp4', tableau(tSoixanteNeuf().bruits));
  parties.push(
    `### 04_questions (les ${questions.liste.length} questions, mêmes moments)`,
    tableau(tQuestion().bruits),
  );
  parties.push('### 05_bandeaux : carton « Interview imaginée »', tableau(tCarton().bruits));
  parties.push(`### 05_bandeaux : bandeau nominatif (${bandeaux.nom.prenoms.join(', ')})`, tableau(tNom().bruits));
  parties.push('### 06_final.mp4', tableau(tFinal().bruits));
  parties.push('### 07_titre.mp4', tableau(tTitre().bruits));
  parties.push('### 08_intro_interview (les trois versions : plein, alpha, vert)', tableau(tIntro().bruits));
  const sons = Object.values(SONS)
    .map((s) => `- **${s.nom}** : chercher ${s.chercher}`)
    .join('\n');
  return [
    '## Feuille de bruitages',
    '',
    'Les moments sont comptés depuis le début de chaque fichier. Dans CapCut, si le clip ne commence pas à 0, ajoute sa position dans la timeline. Le repère se lit minutes:secondes:images (30 images par seconde).',
    '',
    'Sons à chercher dans la bibliothèque de CapCut (Audio → Effets sonores) :',
    '',
    sons,
    '',
    'Conseil : baisser les whoosh et les clics à 40-60 % du volume de la voix off, garder les impacts et les tampons un peu plus forts.',
    '',
    parties.join('\n\n'),
    '',
  ].join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const sortie = path.join(ICI, 'out', 'bruitages.md');
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, `# Après la voie · bruitages\n\n${feuille()}`, 'utf8');
  console.log('Feuille de bruitages ->', path.relative(ICI, sortie));
  // et la même feuille dans le README, entre les deux repères
  const readme = path.join(ICI, 'README.md');
  const r = fs.readFileSync(readme, 'utf8');
  const debut = r.indexOf('<!-- debut bruitages');
  const fin = r.indexOf('<!-- fin bruitages -->');
  if (debut >= 0 && fin > debut) {
    const ligneDebut = r.indexOf('\n', debut) + 1;
    fs.writeFileSync(readme, `${r.slice(0, ligneDebut)}${feuille()}${r.slice(fin)}`, 'utf8');
    console.log('README.md mis à jour');
  }
}
