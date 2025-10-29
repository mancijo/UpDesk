#!/usr/bin/env node
// scripts/sync-wwwroot.js
// Sincroniza alterações de UpDesk-desktop/wwwroot -> UpDesk.api/UpDesk.api.Web/wwwroot
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const chokidar = require('chokidar');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'wwwroot');
const target = path.resolve(root, '..', 'UpDesk.api', 'UpDesk.api.Web', 'wwwroot');

function log(...args) { console.log('[sync-wwwroot]', ...args); }

if (!fs.existsSync(src)) {
  console.error(`[sync-wwwroot] Fonte não encontrada: ${src}`);
  process.exit(1);
}

if (!fs.existsSync(target)) {
  log(`Diretório alvo não existe, criando: ${target}`);
  fse.mkdirpSync(target);
}

// Faz uma cópia inicial (sobrescreve)
async function initialCopy() {
  log('Cópia inicial em andamento...');
  try {
    await fse.copy(src, target, { overwrite: true, errorOnExist: false });
    log('Cópia inicial concluída.');
  } catch (err) {
    console.error('[sync-wwwroot] Erro na cópia inicial:', err);
  }
}

initialCopy().then(() => {
  // Observador
  const watcher = chokidar.watch(src, {
    ignoreInitial: true,
    persistent: true,
    ignored: /(^|[\/\\])\../ // ignore dotfiles
  });

  watcher
    .on('add', async (p) => {
      const rel = path.relative(src, p);
      const dest = path.join(target, rel);
      await fse.mkdirp(path.dirname(dest));
      await fse.copy(p, dest, { overwrite: true });
      log('added', rel);
    })
    .on('change', async (p) => {
      const rel = path.relative(src, p);
      const dest = path.join(target, rel);
      await fse.copy(p, dest, { overwrite: true });
      log('changed', rel);
    })
    .on('unlink', async (p) => {
      const rel = path.relative(src, p);
      const dest = path.join(target, rel);
      try { await fse.remove(dest); log('removed', rel); } catch (e) { console.warn('remove failed', rel, e); }
    })
    .on('addDir', async (p) => { log('addedDir', path.relative(src, p)); })
    .on('unlinkDir', async (p) => { log('removedDir', path.relative(src, p)); })
    .on('error', (error) => console.error('[sync-wwwroot] watcher error', error));

  log(`Watching ${src} -> ${target}`);
});
