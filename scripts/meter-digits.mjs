// scripts/meter-digits.mjs — stamp the meter's opening screen into smart-meter/index.html
// as real seven-segment markup.
//
// Patches smart-meter-svg.js, which every language twin renders from.
// The runtime redraws the display on every press, but a visitor with JS disabled (or one
// who sees the page before the module has run) should still get a proper segment display
// rather than an empty pane. This imports the SAME segmentsFor() the runtime uses, so the
// static markup cannot drift from the live one.
//
// Run after changing the segment geometry or the first screen:  node scripts/meter-digits.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PAGE = path.join(ROOT, 'smart-meter-svg.js');   // the shared diagram source
const { segmentsFor } = await import(pathToFileURL(path.join(ROOT, 'js', 'smart-meter.js')).href);

const FIRST_SCREEN = '04912.6';   // must match SCREENS[0].value in js/smart-meter.js

const html = fs.readFileSync(PAGE, 'utf8');
const re = /(<g class="m-seg" id="mSeg">)[\s\S]*?(<\/g>)/;
if (!re.test(html)) {
  console.error('meter-digits: <g id="mSeg"> not found in smart-meter-svg.js');
  process.exit(1);
}
const out = html.replace(re, `$1${segmentsFor(FIRST_SCREEN)}$2`);
fs.writeFileSync(PAGE, out, 'utf8');
console.log(`meter-digits: stamped "${FIRST_SCREEN}" (${segmentsFor(FIRST_SCREEN).length} bytes of markup)`);
