// One-off: turn Google's gf.css into self-hosted woff2 + a local fonts.css.
// Keeps only the `latin` and `latin-ext` subsets (English text + the ₹ sign,
// which lives in latin-ext at U+20AD–20C0). Devanagari/Tamil were never loaded
// from Google Fonts — they come from system fonts — so nothing changes there.
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const css = fs.readFileSync(path.join(dir, 'gf.css'), 'utf8');

// Split into blocks, each preceded by a `/* subset */` comment.
const re = /\/\* ([a-z0-9-]+) \*\/\s*@font-face \{([^}]*)\}/g;
const KEEP = new Set(['latin', 'latin-ext']);
const get = (block, prop) => (block.match(new RegExp(prop + ':\\s*([^;]+);')) || [])[1]?.trim();

const jobs = [];
let out = '/* Self-hosted subset of Inter / Sora / Space Grotesk (latin + latin-ext).\n' +
  '   Generated from Google Fonts by fonts/_localize.mjs — do not hand-edit. */\n';
let m;
while ((m = re.exec(css))) {
  const [, subset, block] = m;
  if (!KEEP.has(subset)) continue;
  const family = get(block, 'font-family').replace(/['"]/g, '');
  const weight = get(block, 'font-weight');
  const range = get(block, 'unicode-range');
  const url = (block.match(/url\(([^)]+)\)/) || [])[1];
  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const sub = subset === 'latin-ext' ? 'latinext' : 'latin';
  const file = `${slug}-${weight}-${sub}.woff2`;
  jobs.push({ url, file });
  out += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
    `font-display:swap;src:url(/fonts/${file}) format('woff2');unicode-range:${range}}\n`;
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
