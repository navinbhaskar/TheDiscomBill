// One-off: turn Google's gf.css into self-hosted woff2 + a local fonts.css.
// Keeps only the `latin` and `latin-ext` subsets (English text + the ₹ sign,
// which lives in latin-ext at U+20AD–20C0). The Devanagari/Tamil faces are handled
// separately by _localize-indic.mjs — they're only fetched when a visitor switches
// the UI to that script.
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const css = fs.readFileSync(path.join(dir, 'gf.css'), 'utf8');

// Split into blocks, each preceded by a `/* subset */` comment.
const re = /\/\* ([a-z0-9-]+) \*\/\s*@font-face \{([^}]*)\}/g;
const KEEP = new Set(['latin', 'latin-ext']);
const get = (block, prop) => (block.match(new RegExp(prop + ':\\s*([^;]+);')) || [])[1]?.trim();

// Google serves these families as VARIABLE fonts: `font-weight: 100 900` in the block, and
// one file covering the whole axis. Naming the file after a single weight (as this script
// once did) writes N @font-face rules pointing at N byte-identical copies, and a page using
// five weights then downloads the same font five times. Key the file on family+subset only,
// carry the weight RANGE through to the @font-face, and dedupe by URL.
const jobs = [];
const byUrl = new Map();
let out = '/* Self-hosted Inter / Sora / Space Grotesk — variable weight axis, latin + the ₹ sign.\n' +
  '   Generated from Google Fonts by fonts/_localize.mjs — do not hand-edit. */\n';
let m;
while ((m = re.exec(css))) {
  const [, subset, block] = m;
  if (!KEEP.has(subset)) continue;
  const family = get(block, 'font-family').replace(/['"]/g, '');
  const weight = get(block, 'font-weight');       // e.g. "100 900" for a variable axis
  const range = get(block, 'unicode-range');
  const url = (block.match(/url\(([^)]+)\)/) || [])[1];
  const slug = family.toLowerCase().replace(/\s+/g, '-');
  // latin-ext is kept only for ₹ (U+20B9), so it is named for what it is actually for.
  const sub = subset === 'latin-ext' ? 'rupee' : 'latin';
  const file = `${slug}-var-${sub}.woff2`;
  if (byUrl.has(file)) {
    if (byUrl.get(file) !== url) throw new Error(`two different URLs want ${file}`);
    continue;                                     // same face already emitted
  }
  byUrl.set(file, url);
  jobs.push({ url, file });
  out += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
    `font-display:swap;src:url(/fonts/${file}) format('woff2');unicode-range:${range}}\n`;
}
if (!/font-weight:\d+ \d+;/.test(out)) {
  console.warn('WARNING: no variable weight ranges found — gf.css may be a static-weight export,\n' +
    '         which is what caused the duplicate-download bug. Check the Google Fonts URL.');
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
  fs.writeFileSync(path.join(dir, 'fonts.css'), out, 'utf8');
  console.log(`Downloaded ${files.length} woff2 files; wrote fonts.css (${out.length} bytes)`);
}).catch(e => { console.error(e); process.exit(1); });
