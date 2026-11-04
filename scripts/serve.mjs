#!/usr/bin/env node
/**
 * Serveur statique local pour la présentation, sans dépendance ni connexion.
 * Sert le dossier `out/` produit par `npm run build`.
 *
 *   node scripts/serve.mjs [--port 4173] [--dir out] [--open]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};

const root = path.resolve(process.cwd(), value('dir', 'out'));
const port = Number(value('port', process.env.PORT || 4173));
const host = '127.0.0.1';

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`\n  Aucun export trouvé dans ${root}.\n  Lancez d'abord : npm run build\n`);
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.glb': 'model/gltf-binary',
  '.hdr': 'application/octet-stream',
};

function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  p = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(root, p);
  if (!file.startsWith(root)) return null;
  try {
    const st = fs.statSync(file);
    if (st.isDirectory()) file = path.join(file, 'index.html');
  } catch {
    // essai avec .html (liens sans barre finale)
    if (fs.existsSync(file + '.html')) file = file + '.html';
  }
  return fs.existsSync(file) ? file : null;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  // /campagne -> /campagne/ (export avec barre finale)
  if (!path.extname(url.split('?')[0]) && !url.split('?')[0].endsWith('/')) {
    const dir = path.join(root, url.split('?')[0]);
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      res.writeHead(301, { Location: url.split('?')[0] + '/' + (url.includes('?') ? '?' + url.split('?')[1] : '') });
      res.end();
      return;
    }
  }
  const file = resolveFile(url);
  if (!file) {
    const notFound = path.join(root, '404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Page introuvable');
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const immutable = file.includes(`${path.sep}_next${path.sep}static${path.sep}`);
  res.writeHead(200, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  const url = `http://localhost:${port}/`;
  console.log(`\n  One Living × Escalade : présentation locale`);
  console.log(`  Dossier   ${url}`);
  console.log(`  Campagne  ${url}campagne/`);
  console.log(`\n  Fonctionne sans connexion. Ctrl+C pour arrêter.\n`);
  if (flag('open')) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(`${cmd} ${url}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Le port ${port} est déjà utilisé. Essayez : npm run start -- --port ${port + 1}\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
