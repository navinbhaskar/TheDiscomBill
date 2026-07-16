// scripts/minify-css.mjs — regenerate css/styles.min.css from css/styles.css.
// Conservative whitespace/comment stripper: no property rewriting, so the
// minified output is always exactly the source stylesheet, only smaller.
// Run after any styles.css edit:  node scripts/minify-css.mjs
import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

const min = src
  // strip comments (but keep "/*!" license blocks, if ever added)
  .replace(/\/\*(?!\!)[\s\S]*?\*\//g, '')
  // collapse all whitespace runs (incl. newlines) to a single space
  .replace(/\s+/g, ' ')
  // drop spaces around structural characters
  .replace(/\s*([{};,>~])\s*/g, '$1')
  // drop the space after ":" in declarations is unsafe inside strings/urls — keep it.
  // remove trailing semicolons before a closing brace
  .replace(/;}/g, '}')
  .trim();

writeFileSync(new URL('../css/styles.min.css', import.meta.url), min);
console.log(`styles.min.css written (${(min.length / 1024).toFixed(1)} KB from ${(src.length / 1024).toFixed(1)} KB)`);
