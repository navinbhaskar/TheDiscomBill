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

// ── BSES (Delhi) scan layout — table-only units, "Bill Amount Payable", CA No ──
group('BSES layout — TOTAL units, Rs-anchored payable, CA No, word category', () => {
  const txt = [
    'BSES Rajdhani Power Ltd.',
    'Sanctioned Load :1.00 (kW)',
    'CA No. Contract Demand Energisation Date', // column-scrambled header pair
    'Tariff Category :Domestic [Residential ]',
    'Net Amount Payable',
    '1069.49', // decoy: net-of-subsidy figure that used to win
    'TOTAL -> 248 799.50 133.44',
    'Bill Amount Payable Rs. 230.00',
    'payable to BRPL CA No. 111122223',
  ].join('\n');
  const f = parseBillText(txt);
  check('units from TOTAL -> row', f.units, 248);
  check('Rs-anchored Bill Amount Payable beats decoy', f.billAmount, 230);
  check('CA No accepted as account label', f.accountNo, '111122223');
  check('word category captured', f.category, 'DOMESTIC');
});

// ── MSEDCL (Mahavitaran) scan layout — Pay Rs box, standalone bill-for month ──
group('MSEDCL layout — Pay Rs amount, DEC - 16 month, multi-word category', () => {
  const txt = [
    'MAHAVITARAN\nMaharashtra State Electricity Distribution Co. Ltd.',
    'Bill For:\nDEC - 16\nBill Date:\n18-JAN-17',
    'Bill period:\n30-NOV-16 to 14-JAN-17',
    'Category\nLT | Res 1-\nPhase',
    'Pay Rs. 1830',
  ].join('\n');
  const f = parseBillText(txt);
  check('Pay Rs. box read as amount', f.billAmount, 1830);
  check('standalone DEC - 16 month', f.billMonth, 12);
  check('two-digit year expanded', f.billYear, 2016);
  check('month inside 18-JAN-17 not mistaken', f.billMonth !== 1, true);
  check('multi-word category captured', f.category, 'LT RES');
  check('period from dates', f.toDate && f.toDate.iso, '2017-01-14');
});

// ── Sanctioned/connected load — abbreviated labels, leading-decimal values ────
group('load — Sanct./Conn. abbreviations and ".5 KW" values', () => {
  check('Sanct. Load .5 KW', parseBillText('Sanct.\nLoad\n.5 KW').sanctionedLoad, 0.5);
  check('Conn. Load .5 KW', parseBillText('Conn. Load .5 KW').sanctionedLoad, 0.5);
  check('value-anchored "Load ... 2 KW"', parseBillText('Load\n2 KW').sanctionedLoad, 2);
  check('UPPCL "Sanction Load 1KW" untouched', parseBillText('Sanction Load 1KW').sanctionedLoad, 1);
  check('kW in label parentheses', parseBillText('Sanctioned Load :1.00 (kW)').sanctionedLoad, 1);
  check('MDI label read as demand', parseBillText('Sanction Load 5KW\nMDI : 2.4').maxDemand, 2.4);
  check('zero MDI left empty', parseBillText('Sanction Load 5KW\nMDI : .00').maxDemand, undefined);
});

// ── Tata Power-DDL (Delhi) — columnar summary strip with blank cells ──────────
group('Tata Power-DDL — summary strip with empty columns', () => {
  // "Your Electricity Bill Summary" prints labels over values; Adjustments and
  // LPSC are blank on this bill, which used to shift every value one column left
  // and report the ₹8.51 arrears figure as the amount payable.
  const txt = [
    'TATA POWER DELHI DISTRIBUTION LIMITED',
    'Name : MR. KUMAR',
    'Sanctioned Load (KW/KVA): 2.00',
    'MDI Reading : 2.10KW',
    'CA NO.    : 60001234567',
    'Tariff Category : Domestic Lighting-DL',
    'Arrears / Refund   Adjustments   Current Demand   Subsidy   LPSC   Net Amount Payable',
    '8.51                             2028.97          -844.06          1193.42',
    'Meter No. Current Meter Reading Previous Meter Reading Reading Difference',
    'Single Phase Meter Ok KWH KW 17/07/2015 9350 2.10 16/06/2015 9000 350 350',
  ].join('\n');
  const f = parseBillText(txt);
  check('payable comes from its own column', f.billAmount, 1193.42);
  check('arrears not mistaken for the total', f.arrears, 8.51);
  check('blank LPSC cell stays empty', f.lpsc, undefined);
  check('subsidy captured as a positive', f.subsidy, 844.06);
  check('DISCOM detected', f.discom && f.discom.id, 'tpddl');
  check('sanctioned load past "(KW/KVA)"', f.sanctionedLoad, 2);
  check('unlabelled reading pair — previous', f.prevRead, 9000);
  check('unlabelled reading pair — current', f.currRead, 9350);
  check('later date wins as current read', f.toDate && f.toDate.iso, '2015-07-17');
});

// A date+reading pair that is not a billing cycle must not be read as meter reads.
group('reading pairs — implausible spans rejected', () => {
  const same = 'Issued 01/01/2015 4000 Printed 03/01/2015 4200';
  check('2-day span ignored', parseBillText(same).prevRead, undefined);
  const backwards = 'Reading 17/07/2015 9000 and 16/06/2015 9350';
  check('meter running backwards ignored', parseBillText(backwards).prevRead, undefined);
});

console.log(failed ? `\n✗ FAILURES — ${passed} passed, ${failed} failed`
                   : `\n✓ ALL PASSED — ${passed} passed, 0 failed`);
process.exit(failed ? 1 : 0);
