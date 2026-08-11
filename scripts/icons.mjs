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

// favicon.ico was NOT in this list, and it drifted exactly the way the comment above predicts:
// the 2026-08-09 logo rebuild refreshed all five PNGs and the SVG, and left the .ico showing
// the previous mark. It is the one icon nothing in the build touched, and the one crawlers
// fetch by convention even though <head> never references it. Now it comes from icon.svg too.
const ICO_SIZES = [16, 24, 32, 48, 64];

// The SVG is inlined rather than loaded via <img src>: a file:// <img> is subject to Chrome's
// local-file rules, and inlining also guarantees we rasterise exactly the bytes on disk.
const page = (svg, size) => `<!doctype html><meta charset="utf-8">
<style>
  html,body { margin:0; padding:0; background:transparent; }
  svg { display:block; width:${size}px; height:${size}px; }
</style>
${svg}`;

function render(src, size, out) {
  const svg = fs.readFileSync(path.join(ROOT, src), 'utf8');
  fs.writeFileSync(TMP, page(svg, size), 'utf8');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--window-size=${size},${size}`, '--default-background-color=00000000',
    `--screenshot=${out}`, '--virtual-time-budget=4000',
    'file:///' + TMP.replace(/\\/g, '/')], { stdio: 'ignore' });
}

// An .ico is just a small directory followed by the image payloads, and since Windows Vista
// those payloads may be PNGs verbatim. So there is nothing to encode: render the PNGs Chrome
// already gives us and staple a 6-byte header plus one 16-byte entry per size in front. No
// image library, no new dependency.
function packIco(pngs) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);            // reserved
  head.writeUInt16LE(1, 2);            // 1 = icon (2 would be a cursor)
  head.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = head.length + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const at = 16 * i;
    dir.writeUInt8(size >= 256 ? 0 : size, at);      // 0 means 256
    dir.writeUInt8(size >= 256 ? 0 : size, at + 1);
    dir.writeUInt8(0, at + 2);         // palette entries — 0 for truecolour
    dir.writeUInt8(0, at + 3);         // reserved
    dir.writeUInt16LE(1, at + 4);      // colour planes
    dir.writeUInt16LE(32, at + 6);     // bits per pixel
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, dir, ...pngs.map(p => p.data)]);
}

let done = 0;
for (const job of JOBS) {
  render(job.src, job.size, path.join(ROOT, job.out));
  done++;
}

const frames = ICO_SIZES.map((size) => {
  const tmpPng = path.join(ROOT, `_ico_${size}.png`);
  render('icon.svg', size, tmpPng);
  const data = fs.readFileSync(tmpPng);
  fs.unlinkSync(tmpPng);
  return { size, data };
});
fs.writeFileSync(path.join(ROOT, 'favicon.ico'), packIco(frames));

if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
console.log(`Icons: ${done} PNG rasters + favicon.ico (${ICO_SIZES.join('/')}) `
  + `rendered from ${[...new Set(JOBS.map(j => j.src))].join(', ')}.`);
