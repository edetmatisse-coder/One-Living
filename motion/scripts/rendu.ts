/**
 * Rendu de toutes les séquences.
 *
 *   npm run rendu                 tout (horizontal + vertical, MP4/MOV + PNG, planches contact)
 *   npm run rendu -- 01 03        seulement les séquences 01 et 03
 *   npm run rendu -- 04 --h       seulement l'horizontal (--v : seulement le vertical)
 *   npm run rendu -- --planches   refaire seulement les planches contact (depuis les vidéos)
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
import { IMAGES_PAR_SECONDE as FPS, bandeaux, questions } from '../config';
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
  /** prores : ProRes 4444 avec couche alpha (.mov) ; sinon H.264 (.mp4) */
  codec?: 'h264' | 'prores';
  /** planche contact : une image toutes les `pas` secondes (0,5 par défaut) */
  pas?: number;
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
  { seq: '08', id: 'intro', fichier: '08_intro_interview', props: { fond: 'plein' }, pas: 0.25 },
  { seq: '08', id: 'intro', fichier: '08_intro_interview_alpha', props: { fond: 'transparent' }, codec: 'prores' as const, pas: 0.25 },
  { seq: '08', id: 'intro', fichier: '08_intro_interview_vert', props: { fond: 'vert' }, pas: 0.25 },
].filter((t) => !seulement.length || seulement.includes(t.seq));

const extension = (t: Travail) => (t.codec === 'prores' ? '.mov' : '.mp4');

const dejavu = ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf'].find((f) =>
  fs.existsSync(f),
);

/**
 * Planche contact : une image toutes les `pas` secondes, horodatée.
 * Une vidéo avec transparence (.mov) est posée sur un damier, pour voir ce qui est transparent.
 */
function planche(video: string, sortie: string, vertical: boolean, pas = 0.5) {
  try {
    const duree = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString().trim());
    const n = Math.max(1, Math.floor(duree / pas + 0.001));
    const images = Array.from({ length: n }, (_, k) => Math.round(k * pas * FPS));
    const choix = `select='${images.map((i) => `eq(n\\,${i})`).join('+')}'`;
    const cols = vertical ? Math.min(pas < 0.5 ? 8 : 10, n) : Math.min(pas < 0.5 ? 4 : 6, n);
    const lignes = Math.ceil(n / cols);
    const echelle = vertical ? 'scale=216:384' : 'scale=384:216';
    const texte = dejavu
      ? `,drawtext=fontfile=${dejavu}:text='%{pts\\:hms}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=4`
      : '';
    const fin = `${echelle}${texte},tile=${cols}x${lignes}:padding=6:margin=6:color=0x0b0b0b`;
    fs.mkdirSync(path.dirname(sortie), { recursive: true });
    const [w, h] = vertical ? [1080, 1920] : [1920, 1080];
    const entree = video.endsWith('.mov')
      ? [
          '-f', 'lavfi', '-i', `nullsrc=s=${w}x${h}:r=${FPS},format=gray,geq=lum='if(mod(floor(X/48)+floor(Y/48)\\,2)\\,185\\,125)'`,
          '-i', video,
          '-filter_complex', `[0:v][1:v]overlay=shortest=1,${choix},${fin}`,
        ]
      : ['-i', video, '-vf', `${choix},${fin}`];
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...entree, '-fps_mode', 'passthrough', '-frames:v', '1', '-q:v', '3', sortie]);
    console.log(`   planche  ${path.relative(ICI, sortie)}`);
  } catch {
    console.log('   (planche contact ignorée : ffmpeg introuvable)');
  }
}

async function main() {
  if (!travaux.length) {
    console.log('Rien à rendre : numéros de séquence de 01 à 08.');
    return;
  }
  const apercu = (rel: string) => path.join(OUT, 'previews', `${rel.replace(/\//g, '__')}.jpg`);
  if (planchesSeules) {
    for (const t of travaux)
      for (const f of formats) {
        const rel = f === 'v' ? path.join('vertical', t.fichier) : t.fichier;
        const video = path.join(OUT, `${rel}${extension(t)}`);
        if (fs.existsSync(video)) planche(video, apercu(rel), f === 'v', t.pas);
      }
    return;
  }
  console.log('Préparation (bundle)…');
  const serveUrl = await bundle({ entryPoint: path.join(ICI, 'src', 'index.ts'), publicDir: path.join(ICI, 'public') });
  for (const t of travaux) {
    for (const f of formats) {
      const rel = f === 'v' ? path.join('vertical', t.fichier) : t.fichier;
      const video = path.join(OUT, `${rel}${extension(t)}`);
      fs.mkdirSync(path.dirname(video), { recursive: true });
      const id = `${t.id}-${f}`;
      const props = t.props ?? {};
      const composition = await selectComposition({ serveUrl, id, inputProps: props, browserExecutable: navigateur });
      const debut = Date.now();
      let dernier = -1;
      const commun = {
        composition,
        serveUrl,
        outputLocation: video,
        inputProps: props,
        muted: true,
        concurrency: concurrence,
        browserExecutable: navigateur,
        onProgress: ({ progress }: { progress: number }) => {
          const p = Math.floor(progress * 10);
          if (p !== dernier) {
            dernier = p;
            process.stdout.write(`\r${id.padEnd(22)} ${String(p * 10).padStart(3)} %`);
          }
        },
      };
      if (t.codec === 'prores') {
        // ProRes 4444 avec couche alpha : les zones transparentes le restent dans CapCut
        // quantificateur 6 et alpha 8 bits : qualité intacte, ~30 Mo au lieu de ~180 Mo pour 4 s
        await renderMedia({
          ...commun,
          codec: 'prores',
          proResProfile: '4444',
          pixelFormat: 'yuva444p10le',
          imageFormat: 'png',
          ffmpegOverride: ({ args }) =>
            args.includes('prores_ks') ? [...args.slice(0, -1), '-qscale:v', '6', '-alpha_bits', '8', args[args.length - 1]] : args,
        });
      } else {
        await renderMedia({
          ...commun,
          codec: 'h264',
          crf: 20,
          x264Preset: 'slow',
          pixelFormat: 'yuv420p',
          colorSpace: 'bt709',
          imageFormat: 'jpeg',
          jpegQuality: 95,
        });
      }
      const taille = (fs.statSync(video).size / 1e6).toFixed(1);
      console.log(`\r${id.padEnd(22)} ok  ${path.relative(ICI, video)}  (${taille} Mo, ${((Date.now() - debut) / 1000).toFixed(0)} s)`);
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
      planche(video, apercu(rel), f === 'v', t.pas);
    }
  }
  console.log('Terminé.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
