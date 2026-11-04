#!/usr/bin/env node
/**
 * Rend des images fixes des scènes 3D dans public/fallback/.
 * Elles remplacent la 3D en mouvement réduit (prefers-reduced-motion) ou sans
 * WebGL, et servent de fond pendant le chargement de la 3D.
 *
 * Usage, avec le site lancé (npm run dev, ou npm run build && npm run start) :
 *   npm run fallbacks
 *   npm run fallbacks -- --url http://127.0.0.1:4173 --only bouteille
 *
 * À relancer après l'ajout des visuels de marque dans public/brand/ :
 * l'étiquette et le logo de la bouteille 3D en dépendent.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const BASE = arg('--url', 'http://localhost:3000').replace(/\/$/, '');
const ONLY = arg('--only', '');
const OUT = path.resolve('public/fallback');
const QUALITY = 0.84;

/** Tout est masqué sauf la scène visée : ni texte, ni grain, ni curseur. */
const HIDE = `
  html, body { background: #141210 !important; }
  body * { visibility: hidden !important; }
  [data-still-target], [data-still-target] * { visibility: visible !important; }
`;

const FLAVORS = ['gingembre-curcuma', 'framboise-grenade', 'passion-goji', 'mangue-citron-vert'];

const log = (...m) => console.log('·', ...m);

async function newPage(browser, width, height, scale) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: 'no-preference' });
  await context.addInitScript(() => {
    window.__olStill = { bottleRot: -0.08 };
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('  erreur de page :', e.message));
  return page;
}

/** Marque le canvas WebGL visé (dans `scope`, ou celui fixé en fond) et masque le reste. */
async function isolate(page, scope) {
  const ok = await page.evaluate((sel) => {
    const list = [...document.querySelectorAll(sel ? `${sel} canvas[data-engine]` : 'canvas[data-engine]')];
    const el = sel ? list[0] : list.find((c) => getComputedStyle(c.parentElement.parentElement).position === 'fixed');
    if (!el) return false;
    el.setAttribute('data-still-target', '');
    return true;
  }, scope);
  if (!ok) throw new Error(`aucun canvas 3D trouvé pour ${scope || 'la paroi'}`);
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Capture PNG du canvas marqué, encodée en WebP par Chromium (aucune dépendance). */
async function capture(page, name) {
  const png = await page.locator('[data-still-target]').screenshot({ type: 'png', timeout: 120000 });
  const webp = await page.evaluate(
    async ({ b64, q }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q).split(',')[1];
    },
    { b64: png.toString('base64'), q: QUALITY },
  );
  const file = path.join(OUT, `${name}.webp`);
  await writeFile(file, Buffer.from(webp, 'base64'));
  log(`${name}.webp`, `${Math.round(Buffer.from(webp, 'base64').length / 1024)} ko`);
}

/** Centre l'élément dans la fenêtre (la 3D ne tourne que lorsqu'elle est visible). */
async function center(page, selector) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 120000 });
  await page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    const y = Math.max(0, r.top + window.scrollY - (window.innerHeight - r.height) / 2);
    window.__olScrollTo?.(y);
    window.scrollTo(0, y);
  }, selector);
}

/** La paroi du Dossier, cadrée comme au chargement. */
async function paroi(browser, width, height, suffix) {
  const page = await newPage(browser, width, height, width < 768 ? 2 : 1.5);
  await page.goto(`${BASE}/?motion=full&quality=high`, { waitUntil: 'load' });
  // le fond SVG s'efface quand la 3D a peint ses premières images
  await page.waitForFunction(() => document.querySelector('.plywood.fixed')?.classList.contains('opacity-0'), null, { timeout: 180000 });
  await page.waitForTimeout(4000);
  await isolate(page, '');
  await capture(page, `paroi-${suffix}`);
  await page.context().close();
}

/** La salle du simulateur, pleine au bout d'un an (salle type). */
async function salle(browser) {
  const page = await newPage(browser, 1440, 900, 2);
  await page.goto(`${BASE}/?motion=full&quality=high`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await center(page, '#simulateur canvas[data-engine]');
  // l'année défile mois par mois, puis les bouteilles se posent
  await page.waitForFunction(() => document.querySelector('#simulateur')?.textContent?.includes('Déc.'), null, { timeout: 120000 });
  await page.waitForTimeout(6000);
  await isolate(page, '#simulateur');
  await capture(page, 'salle');
  await page.context().close();
}

/** La bouteille 3D, un visuel par parfum. */
async function bouteilles(browser) {
  const page = await newPage(browser, 1440, 900, 2);
  await page.goto(`${BASE}/campagne/?motion=full&quality=high`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await center(page, '#gamme canvas[data-engine]');
  await page.waitForTimeout(5000);
  const tabs = page.locator('#gamme [role="tab"]');
  for (let i = 0; i < FLAVORS.length; i++) {
    await tabs.nth(i).click();
    // étiquette redessinée, couleur des caustiques stabilisée
    await page.waitForTimeout(4500);
    await isolate(page, '#gamme');
    await capture(page, `bouteille-${FLAVORS[i]}`);
    await page.evaluate(() => {
      document.querySelector('[data-still-target]')?.removeAttribute('data-still-target');
      document.querySelectorAll('style').forEach((s) => s.textContent.includes('data-still-target') && s.remove());
    });
  }
  await page.context().close();
}

/** La voie du mini-jeu de la Campagne, grimpeur au départ. */
async function voie(browser, width, height, suffix) {
  const page = await newPage(browser, width, height, width < 768 ? 2 : 1.5);
  await page.goto(`${BASE}/campagne/?motion=full&quality=high`, { waitUntil: 'load' });
  await page.waitForSelector('#apres-la-voie canvas[data-engine]', { timeout: 120000 });
  await page.waitForTimeout(7000);
  await isolate(page, '#apres-la-voie');
  await capture(page, `voie-${suffix}`);
  await page.context().close();
}

const JOBS = {
  paroi: async (b) => {
    await paroi(b, 1440, 900, 'large');
    await paroi(b, 390, 844, 'mobile');
  },
  salle,
  bouteille: bouteilles,
  voie: async (b) => {
    await voie(b, 1440, 900, 'large');
    await voie(b, 390, 844, 'mobile');
  },
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  for (const [name, job] of Object.entries(JOBS)) {
    if (ONLY && !ONLY.split(',').includes(name)) continue;
    log(`rendu : ${name}`);
    await job(browser);
  }
} finally {
  await browser.close();
}
log(`visuels écrits dans ${path.relative(process.cwd(), OUT)}/`);
