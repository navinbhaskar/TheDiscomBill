// scripts/split-css.mjs — build the trimmed stylesheets: the subset of styles.css that a
// given family of pages actually uses.
//
// Why this exists: styles.css is one sheet serving the calculator app AND 543 static content
// pages. Measured, 78% of it is tool-only — the bill renderer, the comparison tool, the Bill
// Review portal, the datepicker — none of which a guide page ever shows. Those pages were
// downloading 39 KB gzipped to use about 9 KB of it.
//
// Two sheets are built from the same machinery:
//
//   content.min.css  — guides, tariffs, glossary, smart-meter-recharge + vernacular twins
//   home.min.css     — the homepage, and only the homepage
//
// The homepage got its own sheet because it is the highest-traffic page on the site and the
// one whose Core Web Vitals were worst. Measured on the full sheet: 49,148 of 58,633
// transferred bytes went unused — 84%. Everything the page needs finished downloading at
// ~750 ms while LCP landed at 2,177 ms, and that 1.4 s gap is not network. It is the browser
// parsing 335 KB of CSS and matching its selectors against 1,347 elements on a throttled
// phone. Cutting rule count is the lever; cutting transfer size barely matters here.
//
// The homepage is deliberately ALONE on its sheet rather than sharing one with the other 22
// tool pages. The corpus is a union: the more pages share a sheet, the closer its vocabulary
// creeps back to the full sheet, and those 22 pages between them use nearly all of it. One
// page, one narrow vocabulary. The other tool pages keep loading the full styles.min.css.
//
// The subset is DERIVED, not hand-listed, because a hand-list goes stale the moment someone
// adds a section. Every selector in the sheet is tested against the class/id/tag vocabulary
// of the real generated HTML, and kept if it could possibly match. The rule is deliberately
// generous — a selector survives if ANY of its class tokens appears anywhere in the corpus —
// so runtime-only state classes (.is-open, .active) ride along with their base component.
// Over-keeping costs bytes; under-keeping breaks a page. This errs at the safe end.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Which pages a sheet has to cover is not a list to maintain — it is exactly the set of
// pages that link it. Deriving the corpus from that set means a new page template can never
// drift out of the vocabulary: if it links the sheet, its markup shaped the sheet. It also
// means the marker IS the configuration; adding a third sheet is a call, not a code change.

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

export function buildSubsetCss({ marker, dest, label, quiet = false }) {
  const pages = walk(ROOT).filter(p => fs.readFileSync(path.join(ROOT, p), 'utf8').includes(marker));
  if (!pages.length) throw new Error(`split-css: no page links ${marker} — generate pages first`);

  // Vocabulary the content pages can possibly use. Static markup is not enough on its own:
  // the header search button (.site-search-btn) is injected at runtime by js/search.js and
  // appears in no HTML file, so deriving from HTML alone silently dropped its styles. The
  // corpus therefore also includes every JS module reachable from the entry points these
  // pages load, resolved transitively rather than hand-listed.
  //
  // The entry points are READ FROM THE PAGES, not hardcoded. This used to assume js/main.js
  // was the only one, which held while every page on the slim sheet was a generated content
  // page. The moment a page with its own module joined - /services/ loads bill-check.js,
  // new-connection.js and complaint.js - everything those modules inject at runtime became
  // invisible to this scan, and their styles were dropped. The page then rendered with
  // .billcheck-card stripped of its background, padding and border. Deriving the entry list
  // from the same page set that defines the corpus makes that impossible by construction.
  const jsSeen = new Set();
  const resolve = (rel) => {
    if (jsSeen.has(rel)) return;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    jsSeen.add(rel);
    const src = fs.readFileSync(abs, 'utf8');
    // static `from './x.js'` and dynamic `import('./x.js')`
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      resolve(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1])));
    }
  };
  for (const page of pages) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    for (const m of html.matchAll(/<script[^>]*\bsrc="([^"]+\.m?js)"/g)) {
      const href = m[1];
      if (/^https?:/.test(href)) continue;                    // gtag and friends
      const rel = href.startsWith('/')
        ? href.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(page), href));
      resolve(rel);
    }
  }

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

  // Split a selector LIST on its top-level commas. Commas also appear inside :is(), :not(),
  // :where() and attribute values, where they do not separate selectors, so this tracks
  // bracket depth rather than calling sel.split(',').
  const splitSelectorList = (sel) => {
    const parts = [];
    let depth = 0, start = 0, quote = null;
    for (let k = 0; k < sel.length; k++) {
      const c = sel[k];
      if (quote) { if (c === quote && sel[k - 1] !== '\\') quote = null; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      else if (c === ',' && depth === 0) { parts.push(sel.slice(start, k)); start = k + 1; }
    }
    parts.push(sel.slice(start));
    return parts.map(x => x.trim()).filter(Boolean);
  };

  // One selector - not a list. Kept if it names no class/id at all (bare element, :root,
  // attribute selectors: always cheap), or if any class/id it names is in the corpus.
  const keepOne = (sel) => {
    const cls = [...sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1]);
    const idl = [...sel.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)].map(m => m[1]);
    if (!cls.length && !idl.length) return true;              // :root, html, body, a, table…
    if (cls.some(c => classes.has(c))) return true;           // generous on purpose
    if (idl.some(i => ids.has(i))) return true;
    return false;
  };

  // Judge each part of the list on its own, and rebuild the rule from the survivors.
  //
  // This used to test the whole list as one string, which quietly dropped rules that grouped
  // a bare element selector with a class the content pages happen not to use. The real case:
  // `table, .stat-number, time { font-variant-numeric: tabular-nums }` was thrown away in its
  // entirety because .stat-number is tool-only - so every rate table on every tariff and
  // guide page lost its tabular figures, and the digit columns stopped lining up. Nothing
  // looked broken enough to notice; the numbers were just very slightly ragged.
  const keepSelector = (sel) => {
    const kept = splitSelectorList(sel).filter(keepOne);
    return kept.length === 0 ? null : kept.join(',');
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
      } else {
        const kept = keepSelector(head);
        if (kept) sink().push(`${kept}{${body}}`);
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

  const destAbs = path.join(ROOT, 'css', dest);
  // Windows intermittently fails this write with UNKNOWN while something else holds the
  // handle for a moment — a running preview server is enough. Retrying beats losing the run.
  for (let attempt = 0; ; attempt++) {
    try { fs.writeFileSync(destAbs, text, 'utf8'); break; }
    catch (err) {
      if (attempt === 14 || !['UNKNOWN', 'EBUSY', 'EPERM'].includes(err.code)) throw err;
      const until = Date.now() + 40 * (attempt + 1);
      while (Date.now() < until) { /* short synchronous backoff */ }
    }
  }

  const full = fs.statSync(path.join(ROOT, 'css', 'styles.min.css')).size;
  if (!quiet) {
    console.log(`split-css: ${dest} ${(text.length / 1024).toFixed(0)} KB ` +
      `(from ${(full / 1024).toFixed(0)} KB full sheet) across ${pages.length} ${label} pages`);
  }
  return { bytes: text.length, pages: pages.length, classes: classes.size };
}

export const buildContentCss = (o = {}) =>
  buildSubsetCss({ marker: 'css/content.min.css', dest: 'content.min.css', label: 'content', ...o });

// The homepage links this with a root-relative href; the marker matches either spelling.
export const buildHomeCss = (o = {}) =>
  buildSubsetCss({ marker: 'css/home.min.css', dest: 'home.min.css', label: 'homepage', ...o });

if (import.meta.url === pathToFileURLSafe(process.argv[1])) { buildContentCss(); buildHomeCss(); }

function pathToFileURLSafe(p) {
  try { return new URL('file://' + path.resolve(p).replace(/\\/g, '/')).href; } catch { return ''; }
}
