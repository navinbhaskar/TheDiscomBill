// scripts/split-css.mjs — build css/content.min.css: the subset of the sheet that the
// generated content pages (guides, tariffs, glossary, smart-meter-recharge, and their
// vernacular twins) actually use.
//
// Why this exists: styles.css is one sheet serving both the calculator app and 466 static
// content pages. Measured, 78% of it is tool-only — the bill renderer, the comparison tool,
// the Bill Review portal, the datepicker — none of which a guide page ever shows. Those
// pages were downloading 39 KB gzipped to use about 9 KB of it.
//
// The subset is DERIVED, not hand-listed, because a hand-list goes stale the moment someone
// adds a section. Every selector in the sheet is tested against the class/id/tag vocabulary
// of the real generated HTML, and kept if it could possibly match. The rule is deliberately
// generous — a selector survives if ANY of its class tokens appears anywhere in the corpus —
// so runtime-only state classes (.is-open, .active) ride along with their base component.
// Over-keeping costs bytes; under-keeping breaks a page. This errs at the safe end.
//
// Tool pages are untouched: they keep loading the full styles.min.css.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Which pages this sheet has to cover is not a list to maintain — it is exactly the set of
// pages that link it. Deriving the corpus from that set means a new page template can never
// drift out of the vocabulary: if it links content.min.css, its markup shaped content.min.css.
const MARKER = 'css/content.min.css';

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'graphify-out', 'supabase', 'fonts'].includes(name)) continue;
    if (name.startsWith('.')) continue;
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) walk(abs, out);
    else if (name.endsWith('.html')) out.push(path.relative(ROOT, abs).replace(/\\/g, '/'));
  }
  return out;
}

export function buildContentCss({ quiet = false } = {}) {
  const pages = walk(ROOT).filter(p => fs.readFileSync(path.join(ROOT, p), 'utf8').includes(MARKER));
  if (!pages.length) throw new Error(`split-css: no page links ${MARKER} — generate pages first`);

  // Vocabulary the content pages can possibly use. Static markup is not enough on its own:
  // the header search button (.site-search-btn) is injected at runtime by js/search.js and
  // appears in no HTML file, so deriving from HTML alone silently dropped its styles. The
  // corpus therefore also includes every JS module reachable from the one entry point these
  // pages load, resolved transitively rather than hand-listed.
  const ENTRY = 'js/main.js';
  const jsSeen = new Set();
  (function resolve(rel) {
    if (jsSeen.has(rel)) return;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    jsSeen.add(rel);
    const src = fs.readFileSync(abs, 'utf8');
    // static `from './x.js'` and dynamic `import('./x.js')`
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      resolve(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1])));
    }
  })(ENTRY);

  // Tokenise both corpora the same way: class names are word-like with hyphens.
  const vocab = new Set();
  const addTokens = (text) => {
    for (const t of text.split(/[^A-Za-z0-9_-]+/)) if (t) vocab.add(t);
  };
  // From HTML take only class/id attribute values. Tokenising the whole file would fold in
  // every word of prose, and any article that happens to contain the word "hero" or "card"
  // would then pin that component's rules into the sheet.
  for (const p of pages) {
    const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
    for (const m of html.matchAll(/\b(?:class|id)="([^"]*)"/g)) addTokens(m[1]);
    for (const m of html.matchAll(/<([a-z][a-z0-9-]*)\b/gi)) vocab.add(m[1].toLowerCase());
  }
  // From JS take only strings used in a real DOM-class context. Taking every string literal
  // instead sweeps in the i18n translation tables — thousands of words of prose, any one of
  // which may collide with a class name — and inflates the sheet by ~75 KB for nothing.
  for (const j of jsSeen) {
    const src = fs.readFileSync(path.join(ROOT, j), 'utf8');
    // class="..." / id="..." written inside a template literal of markup
    for (const m of src.matchAll(/\b(?:class|id)=["'`]([^"'`]*)["'`]/g)) addTokens(m[1]);
    // classList.add('a','b') / .toggle('x', cond) / className = 'a b' / className += ' a'
    for (const m of src.matchAll(/classList\s*\.\s*(?:add|remove|toggle|replace)\s*\(([^)]*)\)/g)) {
      for (const s of m[1].matchAll(/['"`]([^'"`]+)['"`]/g)) addTokens(s[1]);
    }
    for (const m of src.matchAll(/className\s*\+?=\s*['"`]([^'"`]*)['"`]/g)) addTokens(m[1]);
    // querySelector('.foo'), closest('.foo'), matches('.foo') — selector strings
    for (const m of src.matchAll(/(?:querySelector(?:All)?|closest|matches)\s*\(\s*['"`]([^'"`]+)['"`]/g)) {
      for (const s of m[1].matchAll(/[.#]([-\w]+)/g)) vocab.add(s[1]);
    }
  }

  const classes = vocab, ids = vocab;

  const css = fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8');

  // A selector is kept when every one of its class tokens is unknown to the corpus ONLY if
  // it has no class tokens at all (bare element/attribute selectors are always cheap to keep).
  const keepSelector = (sel) => {
    const cls = [...sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1]);
    const idl = [...sel.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1]);
    if (!cls.length && !idl.length) return true;              // :root, html, body, a, table…
    if (cls.some(c => classes.has(c))) return true;           // generous on purpose
    if (idl.some(i => ids.has(i))) return true;
    return false;
  };

  // Walk the sheet at brace depth, preserving @media/@supports wrappers. Conditional
  // at-rules can nest, so the output target is a stack of buffers: `sink()` is always the
  // innermost open block, and closing one folds it into its parent only if it kept anything.
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');            // comments never ship
  const out = [];
  const open = [];                       // [{ head, buf }] innermost last
  const sink = () => (open.length ? open[open.length - 1].buf : out);

  let i = 0, buf = '';
  while (i < src.length) {
    const ch = src[i];

    if (ch === '{') {
      const head = buf.trim(); buf = '';

      if (/^@(media|supports|layer|container)/.test(head)) {
        open.push({ head, buf: [] });          // conditional group — descend
        i++; continue;
      }
      // Everything else with a body is copied or dropped whole: find its matching brace.
      let d = 1, j = i + 1;
      while (j < src.length && d) { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; }
      const body = src.slice(i + 1, j - 1);

      if (head.startsWith('@')) {
        sink().push(`${head}{${body}}`);       // @font-face / @keyframes / @page — verbatim
      } else if (keepSelector(head)) {
        sink().push(`${head}{${body}}`);
      }
      i = j; continue;
    }

    if (ch === '}' && open.length) {
      const { head, buf: inner } = open.pop();
      if (inner.length) sink().push(`${head}{${inner.join('')}}`);
      i++; continue;
    }

    buf += ch; i++;
  }
  if (open.length) throw new Error('split-css: unbalanced at-rule ' + open[open.length - 1].head);

  let text = out.join('\n');
  // Same minification the main build applies.
  text = text.replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').replace(/\n+/g, '\n').trim();

  const dest = path.join(ROOT, 'css', 'content.min.css');
  fs.writeFileSync(dest, text, 'utf8');

  const full = fs.statSync(path.join(ROOT, 'css', 'styles.min.css')).size;
  if (!quiet) {
    console.log(`split-css: content.min.css ${(text.length / 1024).toFixed(0)} KB ` +
      `(from ${(full / 1024).toFixed(0)} KB full sheet) across ${pages.length} content pages`);
  }
  return { bytes: text.length, pages: pages.length, classes: classes.size };
}

if (import.meta.url === pathToFileURLSafe(process.argv[1])) buildContentCss();

function pathToFileURLSafe(p) {
  try { return new URL('file://' + path.resolve(p).replace(/\\/g, '/')).href; } catch { return ''; }
}
