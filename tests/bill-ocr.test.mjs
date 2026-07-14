// tests/bill-ocr.test.mjs — dependency-free regression tests for the bill OCR parser.
// Run with:  node tests/bill-ocr.test.mjs
//
// Fixtures are SYNTHETIC — hand-written to reproduce the OCR fusion artefacts seen on real UPPCL
// e-bills (no real consumer names, account numbers, or bill PDFs live in the repo). Each string
// mimics the flattened OCR text (Tesseract output), not the visual bill.

import { parseBillText } from '../js/bill-ocr.js';

let passed = 0, failed = 0;
function check(name, got, want) {
  if (got === want) { passed++; }
  else { failed++; console.error(`  ✗ ${name}\n      expected: ${JSON.stringify(want)}\n      got:      ${JSON.stringify(got)}`); }
}
function group(title, fn) { console.log(`\n• ${title}`); fn(); }

// ── Supply type: the bold ":" fuses into the schedule number ──────────────────
group('supply type — fused-colon leading digit', () => {
  // "Supply Type : 17" → OCR glues the colon as a 0 or 1 → "017" / "117"
  check('colon read as 0 ("017" → 17)', parseBillText('Supply Type 017').supplyType, '17');
  check('colon read as 1 ("117" → 17)', parseBillText('Supply Type 117').supplyType, '17');
  check('clean two-digit untouched',    parseBillText('Supply Type : 20').supplyType, '20');
  check('clean single-digit untouched', parseBillText('Supply Type : 8').supplyType, '8');
  check('fused "010" → 10',             parseBillText('Supply Type 010').supplyType, '10');
});

// ── Category: OCR reads the "1" in LMV1 as the letter I/l ──────────────────────
group('category — LMVI / label anchoring', () => {
  // Real bill: "Category : LMVI MV Residential / Domestic" with a stray "ST 8" elsewhere.
  const txt = 'Category : LMVI MV Residential / Domestic\nsome ST 8 footnote text';
  check('LMVI resolves to LMV-1 (not stray ST-8)', parseBillText(txt).category, 'LMV-1');
  check('clean LMV-2 near label', parseBillText('Category : LMV2 Commercial').category, 'LMV-2');
  check('LMVl (lowercase L) → LMV-1', parseBillText('Category : LMVl Domestic').category, 'LMV-1');
});

// ── Billed demand: footnote ¹ + eaten colon fuses a junk leading digit ─────────
group('billed demand — footnote fusion peel', () => {
  // "Billed Demand (Load)¹ : 0.78 KW" → OCR "20.78"; sanctioned load 1 kW anchors the peel.
  const txt = 'Sanction Load 1KW\nBilled Demand (Load)! 20.78 KW';
  check('20.78 peels to 0.78', parseBillText(txt).maxDemand, 0.78);
  // A plausible demand at/under 3× sanctioned load is left alone.
  check('clean 2.5 untouched', parseBillText('Sanction Load 1KW\nBilled Demand : 2.5 KW').maxDemand, 2.5);
});

console.log(failed ? `\n✗ FAILURES — ${passed} passed, ${failed} failed`
                   : `\n✓ ALL PASSED — ${passed} passed, 0 failed`);
process.exit(failed ? 1 : 0);
