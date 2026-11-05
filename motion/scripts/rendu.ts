/**
 * Rendu de toutes les séquences.
 *
 *   npm run rendu                 tout (horizontal + vertical, MP4 + PNG, planches contact)
 *   npm run rendu -- 01 03        seulement les séquences 01 et 03
 *   npm run rendu -- 04 --h       seulement l'horizontal (--v : seulement le vertical)
 *   npm run rendu -- --planches   refaire seulement les planches contact (depuis les MP4)
 *
 * Sortie : out/ (horizontal), out/vertical/ (vertical), out/previews/ (planches contact).
 */
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bandeaux, questions } from '../config';
import { slug } from '../src/slug';

const ICI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ICI, 'out');
const args = process.argv.slice(2);
const seulement = args.filter((a) => /^\d\d$/.test(a));
const formats = args.includes('--h') ? ['h'] : args.includes('--v') ? ['v'] : ['h', 'v'];
const planchesSeules = args.includes('--planches');
const navigateur = process.env.REMOTION_CHROME || null;
const concurrence = Math.max(1, Math.min(8, Math.round(os.cpus().length * 0.75)));

interface Travail {
  seq: string; // « 01 »
  id: string; // composition sans le suffixe -h / -v
  fichier: string; // chemin relatif dans out/ (sans extension)
  props?: Record<string, unknown>;
  png?: number; // image du PNG transparent
}

const travaux: Travail[] = [
  { seq: '01', id: 'marque', fichier: '01_marque' },
  { seq: '02', id: 'entonnoir', fichier: '02_entonnoir' },
  { seq: '03', id: 'chiffre69', fichier: '03_69' },
  ...questions.liste.map((q, i) => ({
    seq: '04',
    id: `question${i + 1}`,
    fichier: `04_questions/question${i + 1}_${slug(q)}`,
    png: 50,
  })),
  { seq: '05', id: 'carton', fichier: '05_bandeaux/carton_interview-imaginee', png: 45 },
  ...bandeaux.nom.prenoms.map((p) => ({
    seq: '05',
    id: `nom-${slug(p)}`,
    fichier: `05_bandeaux/bandeau-nom_${slug(p)}`,
    png: 60,
  })),
  { seq: '06', id: 'final', fichier: '06_final' },
  { seq: '07', id: 'titre', fichier: '07_titre' },
].filter((t) => !seulement.length || seulement.includes(t.seq));

const dejavu = ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf'].find((f) =>
  fs.existsSync(f),
);

/** Planche contact : une image toutes les 0,5 s, horodatée. */
function planche(mp4: string, sortie: string, vertical: boolean) {
  try {
    const duree = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString().trim());
    const n = Math.max(1, Math.floor(duree * 2 + 0.001));
    const cols = vertical ? Math.min(10, n) : Math.min(6, n);
    const lignes = Math.ceil(n / cols);
    const echelle = vertical ? 'scale=216:384' : 'scale=384:216';
    const texte = dejavu
      ? `,drawtext=fontfile=${dejavu}:text='%{pts\\:hms}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=4`
      : '';
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', '-i', mp4,
      '-vf', `select='not(mod(n\\,15))',${echelle}${texte},tile=${cols}x${lignes}:padding=6:margin=6:color=0x0b0b0b`,
      '-fps_mode', 'passthrough',
      '-frames:v', '1', '-q:v', '3', sortie,
    ]);
    console.log(`   planche  ${path.relative(ICI, sortie)}`);
  } catch {
    console.log('   (planche contact ignorée : ffmpeg introuvable)');
  }
}

async function main() {
  if (!travaux.length) {
    console.log('Rien à rendre : numéros de séquence de 01 à 07.');
    return;
  }
  if (planchesSeules) {
    for (const t of travaux)
      for (const f of formats) {
        const rel = f === 'v' ? path.join('vertical', t.fichier) : t.fichier;
        const mp4 = path.join(OUT, `${rel}.mp4`);
        if (fs.existsSync(mp4)) planche(mp4, path.join(OUT, 'previews', `${rel.replace(/\//g, '__')}.jpg`), f === 'v');
      }
    return;
  }
  console.log('Préparation (bundle)…');
  const serveUrl = await bundle({ entryPoint: path.join(ICI, 'src', 'index.ts'), publicDir: path.join(ICI, 'public') });
  for (const t of travaux) {
    for (const f of formats) {
      const rel = f === 'v' ? path.join('vertical', t.fichier) : t.fichier;
      const mp4 = path.join(OUT, `${rel}.mp4`);
      fs.mkdirSync(path.dirname(mp4), { recursive: true });
      const id = `${t.id}-${f}`;
      const props = t.props ?? {};
      const composition = await selectComposition({ serveUrl, id, inputProps: props, browserExecutable: navigateur });
      const debut = Date.now();
      let dernier = -1;
      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: mp4,
        inputProps: props,
        crf: 20,
        x264Preset: 'slow',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        imageFormat: 'jpeg',
        jpegQuality: 95,
        muted: true,
        concurrency: concurrence,
        browserExecutable: navigateur,
        onProgress: ({ progress }) => {
          const p = Math.floor(progress * 10);
          if (p !== dernier) {
            dernier = p;
            process.stdout.write(`\r${id.padEnd(22)} ${String(p * 10).padStart(3)} %`);
          }
        },
      });
      const taille = (fs.statSync(mp4).size / 1e6).toFixed(1);
      console.log(`\r${id.padEnd(22)} ok  ${path.relative(ICI, mp4)}  (${taille} Mo, ${((Date.now() - debut) / 1000).toFixed(0)} s)`);
      if (t.png != null) {
        const png = path.join(OUT, `${rel}.png`);
        const transparente = await selectComposition({ serveUrl, id, inputProps: { ...props, transparent: true }, browserExecutable: navigateur });
        await renderStill({
          composition: transparente,
          serveUrl,
          output: png,
          frame: Math.min(t.png, composition.durationInFrames - 1),
          imageFormat: 'png',
          inputProps: { ...props, transparent: true },
          browserExecutable: navigateur,
        });
        console.log(`   png      ${path.relative(ICI, png)}`);
      }
      planche(mp4, path.join(OUT, 'previews', `${rel.replace(/\//g, '__')}.jpg`), f === 'v');
    }
  }
  console.log('Terminé.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
