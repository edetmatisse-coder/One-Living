#!/usr/bin/env node
/**
 * Captures de contrôle (Playwright) à 1440 px et 390 px de large.
 *
 *   node scripts/screenshots.mjs [--url http://localhost:3000] [--out screenshots/run]
 *                                [--pages /,/campagne/] [--steps 14] [--full] [--motion reduce]
 *
 * Pour chaque page et chaque largeur : on fait défiler la page par paliers
 * (molette, comme un visiteur) et on capture la fenêtre à chaque palier.
 * Les erreurs console et les exceptions sont listées dans console.txt.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const base = opt('url', 'http://localhost:3000');
const out = opt('out', `screenshots/${new Date().toISOString().replace(/[:.]/g, '-')}`);
const pages = String(opt('pages', '/,/campagne/')).split(',');
const steps = Number(opt('steps', 14));
const full = !!opt('full', false);
const motion = opt('motion', 'full');
const widths = String(opt('widths', '1440,390')).split(',').map(Number);
const wait = Number(opt('wait', 900));
const only = opt('only', null); // ex. --only 3,5 : ne capturer que ces paliers

fs.mkdirSync(out, { recursive: true });
const log = [];

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});

for (const width of widths) {
  const height = width >= 1000 ? 900 : 844;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: width < 600,
    hasTouch: width < 600,
    reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference',
  });
  for (const p of pages) {
    const page = await context.newPage();
    const tag = `${p.replace(/\//g, '_') || '_'}-${width}`;
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') log.push(`[${tag}] ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => log.push(`[${tag}] pageerror: ${err.message}`));
    const url = base + p + (motion === 'reduce' ? (p.includes('?') ? '&' : '?') + 'motion=reduce' : '');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForTimeout(2500);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const stepPx = Math.max(400, Math.floor((total - height) / Math.max(1, steps - 1)));
    for (let i = 0; i < steps; i++) {
      const target = Math.min(total - height, i * stepPx);
      if (!only || String(only).split(',').map(Number).includes(i)) {
        await page.evaluate((y) => {
          const w = window;
          if (w.__olScrollTo) w.__olScrollTo(y);
          else window.scrollTo(0, y);
        }, target);
        await page.waitForTimeout(wait);
        await page.screenshot({ path: path.join(out, `${tag}-${String(i).padStart(2, '0')}.png`) });
      }
      if (target >= total - height) break;
    }
    if (full) {
      await page.screenshot({ path: path.join(out, `${tag}-full.png`), fullPage: true });
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(out, 'console.txt'), log.join('\n') || 'Aucune erreur ni alerte console.');
console.log(`Captures dans ${out}`);
console.log(log.length ? log.join('\n') : 'Console : aucune erreur.');
