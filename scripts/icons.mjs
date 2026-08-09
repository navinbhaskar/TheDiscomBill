/**
 * Rasterise the icon SVGs into the PNG sizes the manifest and <head> reference.
 *
 * These five PNGs used to be produced by hand, so they drifted from icon.svg the moment the
 * SVG was edited — the tab icon and the installed-app icon could disagree about the size of
 * the bolt and nothing would catch it. This renders them all from the one source, the same
 * way scripts/og-images.mjs renders social cards: headless Chrome, exact window size, a
 * transparent default background so the tile's rounded corners stay rounded.
 *
 *   node scripts/icons.mjs          (or: npm run icons)
 *
 * Set CHROME_PATH if Chrome is not at the Windows default location.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CHROME = process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TMP = path.join(ROOT, '_icon_tmp.html');

// Every raster and the SVG it mirrors. apple-touch-icon stays on the rounded tile rather than
// the maskable square because that is what it has always been; iOS will round it a second
// time, which is worth revisiting separately but is not a size change.
const JOBS = [
  { out: 'favicon-48.png',      src: 'icon.svg', size: 48 },
  { out: 'favicon-96.png',      src: 'icon.svg', size: 96 },
  { out: 'apple-touch-icon.png', src: 'icon.svg', size: 180 },
  { out: 'icon-192.png',        src: 'icon.svg', size: 192 },
  { out: 'icon-512.png',        src: 'icon.svg', size: 512 },
];

// The SVG is inlined rather than loaded via <img src>: a file:// <img> is subject to Chrome's
// local-file rules, and inlining also guarantees we rasterise exactly the bytes on disk.
const page = (svg, size) => `<!doctype html><meta charset="utf-8">
<style>
  html,body { margin:0; padding:0; background:transparent; }
  svg { display:block; width:${size}px; height:${size}px; }
</style>
${svg}`;

let done = 0;
for (const job of JOBS) {
  const svg = fs.readFileSync(path.join(ROOT, job.src), 'utf8');
  fs.writeFileSync(TMP, page(svg, job.size), 'utf8');
  const out = path.join(ROOT, job.out);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--window-size=${job.size},${job.size}`, '--default-background-color=00000000',
    `--screenshot=${out}`, '--virtual-time-budget=4000',
    'file:///' + TMP.replace(/\\/g, '/')], { stdio: 'ignore' });
  done++;
}
if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
console.log(`Icons: ${done} PNG rasters rendered from ${[...new Set(JOBS.map(j => j.src))].join(', ')}.`);
