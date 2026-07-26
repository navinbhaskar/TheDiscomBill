// One-off: turn Google's gf-indic.css into self-hosted woff2 + one CSS file per script.
// Companion to _localize.mjs (which handles the Latin faces). The Indic families are
// only needed when a visitor switches the UI to Hindi/Marathi (Devanagari) or Tamil,
// so each script gets its OWN stylesheet — js/i18n.js injects just the one it needs
// (see ensureLangFont), and English visitors download neither.
//
// Only the devanagari/tamil subsets are kept: Latin glyphs in those pages still come
// from Inter, which is already loaded.
//
// Refresh with:
//   curl -A "Mozilla/5.0 … Chrome/120.0 …" \
//     "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap" \
//     -o fonts/gf-indic.css && node fonts/_localize-indic.mjs
// The Chrome UA matters — without it Google serves ttf instead of woff2.
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const css = fs.readFileSync(path.join(dir, 'gf-indic.css'), 'utf8');

const re = /\/\* ([a-z0-9-]+) \*\/\s*@font-face \{([^}]*)\}/g;
// subset → the stylesheet it lands in (also the /fonts/<name>.css filename)
const KEEP = { devanagari: 'noto-devanagari', tamil: 'noto-tamil' };
const get = (block, prop) => (block.match(new RegExp(prop + ':\\s*([^;]+);')) || [])[1]?.trim();

// Google serves ONE variable woff2 per family+subset and repeats it across the four
// weight declarations (all four files come back byte-identical). So dedupe by URL and
// emit a single variable face per script with a `font-weight` range — one 121 KB
// Devanagari download instead of four.
const faces = new Map();   // url → { sheet, family, range, weights:Set, file }
let m;
while ((m = re.exec(css))) {
  const [, subset, block] = m;
  const sheet = KEEP[subset];
  if (!sheet) continue;
  const family = get(block, 'font-family').replace(/['"]/g, '');
  const url = (block.match(/url\(([^)]+)\)/) || [])[1];
  const face = faces.get(url) || {
    sheet, family, range: get(block, 'unicode-range'), weights: new Set(),
    file: `${family.toLowerCase().replace(/\s+/g, '-')}.woff2`,
  };
  face.weights.add(Number(get(block, 'font-weight')));
  faces.set(url, face);
}

const jobs = [];
const sheets = {};
for (const [url, f] of faces) {
  jobs.push({ url, file: f.file });
  const w = [...f.weights].sort((a, b) => a - b);
  const weight = w.length > 1 ? `${w[0]} ${w[w.length - 1]}` : String(w[0]);
  sheets[f.sheet] = (sheets[f.sheet] || '') +
    `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${weight};` +
    `font-display:swap;src:url(/fonts/${f.file}) format('woff2');unicode-range:${f.range}}\n`;
}

function download({ url, file }) {
  return new Promise((res, rej) => {
    https.get(url, r => {
      if (r.statusCode !== 200) return rej(new Error(url + ' -> ' + r.statusCode));
      const ws = fs.createWriteStream(path.join(dir, file));
      r.pipe(ws); ws.on('finish', () => ws.close(() => res(file)));
    }).on('error', rej);
  });
}

const seen = new Set();
const unique = jobs.filter(j => !seen.has(j.file) && seen.add(j.file));
Promise.all(unique.map(download)).then(files => {
  for (const [name, body] of Object.entries(sheets)) {
    fs.writeFileSync(path.join(dir, name + '.css'),
      `/* Self-hosted Noto Sans ${name.replace('noto-', '').replace(/^./, c => c.toUpperCase())}` +
      ` (variable weight) — loaded on demand by\n` +
      `   js/i18n.js when that script's UI language is activated.\n` +
      `   Generated from Google Fonts by fonts/_localize-indic.mjs — do not hand-edit. */\n` + body,
      'utf8');
  }
  console.log(`Downloaded ${files.length} woff2 files; wrote ${Object.keys(sheets).join('.css, ')}.css`);
}).catch(e => { console.error(e); process.exit(1); });
