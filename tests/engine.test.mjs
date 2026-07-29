// tests/engine.test.mjs — dependency-free regression tests for the bill engine.
// Run with:  node tests/engine.test.mjs   (or: npm test)
//
// These pin down the calculation logic so a future tariff edit or refactor can't silently change
// results (this suite would have caught the resolveDatedTariff whitelist bug that dropped
// demandUnit / excessDemand before they reached the engine). Cases use real tariffs from the data
// files; if a rate genuinely changes, update the expectation here in the same commit.

import { calculateBill, calculateEnergySlabs, resolveFixedCharge } from '../js/engine.js';
import { getCategory } from '../js/tariffs/registry.js';

let passed = 0, failed = 0;
const fmt = n => (typeof n === 'number' ? n.toFixed(2) : String(n));

function check(name, got, want) {
  const ok = (typeof want === 'number' && typeof got === 'number')
    ? Math.abs(got - want) < 0.01
    : got === want;
  if (ok) { passed++; }
  else { failed++; console.error(`  ✗ ${name}\n      expected: ${fmt(want)}\n      got:      ${fmt(got)}`); }
}
function group(title, fn) { console.log(`\n• ${title}`); fn(); }

// A recent date so dated-tariff resolution picks the current rate set.
const DATE = '2025-06-15';

// ── Pure helpers ─────────────────────────────────────────────────────────────
group('resolveFixedCharge', () => {
  check('plain number', resolveFixedCharge(90, 5), 90);
  check('flat',   resolveFixedCharge({ type: 'flat', rate: 110 }, 5), 110);
  check('per_kw', resolveFixedCharge({ type: 'per_kw', rate: 50 }, 4), 200);
  check('per_kva (same math)', resolveFixedCharge({ type: 'per_kva', rate: 472 }, 90), 42480);
  const tiered = { type: 'tiered', slabs: [
    { maxLoad: 2, rate: 90 }, { maxLoad: 5, rate: 130 }, { maxLoad: Infinity, rate: 190 } ] };
  check('tiered low',  resolveFixedCharge(tiered, 1.5), 90);
  check('tiered mid',  resolveFixedCharge(tiered, 5), 130);
  check('tiered high', resolveFixedCharge(tiered, 9), 190);
});

group('calculateEnergySlabs — telescopic', () => {
  const slabs = [ { limit: 100, rate: 3.35 }, { limit: 300, rate: 6.58 },
                  { limit: 500, rate: 9.6 }, { limit: Infinity, rate: 10.57 } ];
  const b = calculateEnergySlabs(slabs, 350, 1);
  check('slab count', b.length, 3);
  check('slab1 amount', b[0].amount, 335);       // 100 × 3.35
  check('slab2 amount', b[1].amount, 1316);      // 200 × 6.58
  check('slab3 amount', b[2].amount, 480);       // 50  × 9.60
  check('total', b.reduce((s, r) => s + r.amount, 0), 2131);

  // Multi-month: limits scale ×2, so 350 units lands differently
  const b2 = calculateEnergySlabs(slabs, 350, 2);
  check('2-month slab1', b2[0].amount, 670);     // first 200 (100×2) × 3.35
  check('2-month slab2', b2[1].amount, 987);     // next 150 × 6.58
  check('2-month total', b2.reduce((s, r) => s + r.amount, 0), 1657);
});

// ── Whole-bill: active energy (kWh), Adani Mumbai LT-1 domestic ───────────────
group('kWh domestic bill (Adani LT-1)', () => {
  const r = calculateBill({
    discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 350, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: false,
  });
  check('demandUnit', r.demandUnit, 'kW');
  check('billingBasis defaults kwh', r.billingBasis, 'kwh');
  // FY 2025-26 Adani (MERC Case 211/2024): fixed by consumption slab (350 u → ₹135),
  // energy 100×3.45 + 200×6.70 + 50×8.10 = 2090, wheeling 350×2.93 = 1025.50, ED 16% of energy.
  check('fixed (by consumption ≤500u)', r.fixedCharge, 135);
  check('energy', r.totalEnergy, 2090);
  check('ED 16% of energy', r.extraCharges.find(c => /Duty/.test(c.name)).amount, 334.40);
  check('net', r.currentNet, 3585);              // 135 + 2090 + 1025.50 + 334.40 → 3584.90 → round
});

group('FPPA modes', () => {
  const pct = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 350, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 10, facMode: 'percent', lpscApplicable: false });
  check('percent FPPA = 10% of fixed+energy', pct.facAmount, 222.50);   // 10% × (135+2090)

  const pu = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 350, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0.5, facMode: 'per_unit', lpscApplicable: false });
  check('per_unit FPPA = ₹/unit × units', pu.facAmount, 175);          // 350 × 0.50
});

// ── Minimum charge (consumption guarantee) — opt-in `minCharge` primitive ─────
group('minimum charge top-up', () => {
  const base = { discomId: 'dvvnl', categoryId: 'commercial', supplyTypeId: '20',
    units: 50, connectedLoadKw: 3, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: false };

  // Inert unless the tariff declares minCharge: a low-consumption LMV-2 bill is unchanged.
  const off = calculateBill(base);
  check('no minCharge → topUp 0', off.minChargeTopUp, 0);
  check('no minCharge → floor 0', off.minChargeFloor, 0);
  check('baseline net (990 fixed + 375 energy + 7.5% ED)', off.currentNet, 1467);

  // Declare a per-kW minimum on the resolved tariff, then compute: fixed 990 + energy 375 = 1365
  // is below the 600×3 = 1800 floor, so a 435 top-up is added and 7.5% ED applies on 1800.
  // Mutate the live supply-type object so the value survives into the engine's resolved tariff.
  const st = getCategory('dvvnl', 'commercial').supplyTypes.find(s => s.id === '20');
  st.minCharge = { type: 'per_kw', rate: 600 };
  try {
    const on = calculateBill(base);
    check('floor = 600 × 3kW', on.minChargeFloor, 1800);
    check('top-up = 1800 − 1365', on.minChargeTopUp, 435);
    check('ED base includes top-up (7.5% × 1800)',
      on.extraCharges.find(c => /Duty/.test(c.name)).amount, 135);
    check('gross = 990+375+435+135', on.currentGross, 1935);

    // When charges already clear the floor, no top-up is levied.
    const high = calculateBill({ ...base, units: 500 });   // energy 300×7.50 + 200×8.40 = 3930
    check('above floor → topUp 0', high.minChargeTopUp, 0);

    // Flat ₹/month form, prorated by whole billing months.
    st.minCharge = 2000;
    const flat = calculateBill({ ...base, billingPeriodDays: 60 });
    check('flat floor × 2 months', flat.minChargeFloor, 4000);
  } finally {
    delete st.minCharge;   // don't leak into other tests
  }
});

// ── Wheeling charge — opt-in `wheelingCharge` primitive (MSEDCL-style) ────────
// Uses APSPDCL (a percent_energy-duty tariff that does NOT ship a wheeling charge) so the
// "inert by default" baseline holds — MSEDCL now declares a real wheelingCharge of its own.
group('wheeling charge', () => {
  const base = { discomId: 'apspdcl', categoryId: 'domestic',
    units: 100, connectedLoadKw: 1, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: false };

  // Inert unless the tariff declares wheelingCharge: the bill is unchanged.
  const off = calculateBill(base);
  check('no wheelingCharge → 0', off.wheelingCharge, 0);
  const baseGross = off.currentGross;
  const baseED = off.extraCharges.find(c => /Duty/.test(c.name)).amount;

  const cat = getCategory('apspdcl', 'domestic');
  try {
    // per_unit form: 100 units × ₹1.28 = ₹128 added to gross.
    cat.wheelingCharge = { type: 'per_unit', rate: 1.28, label: 'Wheeling Charges' };
    const on = calculateBill(base);
    check('per_unit = 100 × 1.28', on.wheelingCharge, 128);
    check('gross += wheeling', on.currentGross, +(baseGross + 128).toFixed(2));
    // ED here is percent_energy (on energy only) — wheeling must NOT inflate it.
    check('percent_energy ED unchanged by wheeling',
      on.extraCharges.find(c => /Duty/.test(c.name)).amount, baseED);

    // Bare-number shorthand is treated as ₹/unit.
    cat.wheelingCharge = 1.5;
    check('flat number → per_unit', calculateBill(base).wheelingCharge, 150);

    // per_kw form is monthly, prorated by whole billing months.
    cat.wheelingCharge = { type: 'per_kw', rate: 50 };
    check('per_kw × 1kW × 1mo', calculateBill(base).wheelingCharge, 50);
    check('per_kw prorated × 2mo', calculateBill({ ...base, billingPeriodDays: 60 }).wheelingCharge, 100);
  } finally {
    delete cat.wheelingCharge;   // don't leak into other tests
  }

  // MSEDCL ships a real wheeling charge from the MERC MYT order — regression guard for the wired
  // data AND for date-versioned wheeling: DATE is in FY2025-26, whose rate (₹1.24) differs from
  // the current FY2026-27 rate (₹1.20), so this only passes if rateHistory swaps wheelingCharge.
  const msedcl = calculateBill({ discomId: 'msedcl', categoryId: 'domestic',
    units: 100, connectedLoadKw: 1, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: false });
  check('MSEDCL domestic wheeling wired FY2025-26 (100 × 1.24)', msedcl.wheelingCharge, 124);
});

// ── kVA Maximum Demand + billing-demand floor (Adani HT-I, per_kva 400) ───────
group('kVA demand + floor', () => {
  // MD above floor → bills on MD
  const above = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 90, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('demandUnit kVA', above.demandUnit, 'kVA');
  check('energyUnit kVAh', above.energyUnit, 'kVAh');
  check('billingDemand = MD', above.billingDemand, 90);
  check('demand charge 400×90', above.fixedCharge, 36000);

  // MD below 75% floor → bills on 75% of contract demand
  const below = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 50, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('floor applied', below.demandFloorApplied, true);
  check('billingDemand = 75% CD', below.billingDemand, 75);
  check('demand charge 400×75', below.fixedCharge, 30000);
});

// ── kVAh apparent energy billed directly (no ÷PF conversion) ──────────────────
group('kVAh direct energy', () => {
  const r = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 90, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('energy on entered units (1000 × 6.13)', r.totalEnergy, 6130);
  check('ED 9.3% of kVAh energy', r.extraCharges.find(c => /Duty/.test(c.name)).amount, 570.09);
});

// ── Regression: kVA config survives resolveDatedTariff (the whitelist bug) ─────
group('regression: kVA tariff auto-detected', () => {
  const r = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 90,   // no billingBasis → must auto-detect
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('auto basis = kvah for kVA tariff', r.billingBasis, 'kvah');
  check('auto demandUnit = kVA', r.demandUnit, 'kVA');
});

// ── Excess-demand penalty (state-level 1.5× multiplier, Maharashtra) ──────────
group('excess demand penalty', () => {
  const r = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 120, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('excess kVA', r.excessDemand, 20);                  // 120 − 100
  check('excess rate 1.5 × 400', r.excessDemandRate, 600);
  check('penalty 20 × 600', r.excessDemandPenalty, 12000);
});

// ── Net metering (rooftop solar) ─────────────────────────────────────────────
group('net metering', () => {
  // import 400, export 150, opening credit 50 → net 200 billed; no surplus
  const net = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 400, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, lpscApplicable: false,
    netMetering: true, exportUnits: 150, openingCreditUnits: 50 });
  check('net billed units', net.netUnits, 200);
  check('no surplus credit', net.closingCredit, 0);
  // energy on 200 units (telescopic, FY 2025-26): 100×3.45 + 100×6.70 = 345 + 670 = 1015
  check('energy on net units', net.totalEnergy, 1015);

  // export exceeds import → zero energy + banked surplus carried forward
  const surplus = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 100, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, lpscApplicable: false,
    netMetering: true, exportUnits: 260, openingCreditUnits: 0 });
  check('zero net units', surplus.netUnits, 0);
  check('energy zero', surplus.totalEnergy, 0);
  check('credit carried forward', surplus.closingCredit, 160);   // 260 − 100
  check('fixed charge still applies', surplus.fixedCharge > 0, true);
});

// ── Error objects (Issue #14): engine returns { error, message } not null ──────
group('error objects', () => {
  const bad1 = calculateBill({ discomId: 'nonexistent_discom', categoryId: 'domestic',
    units: 100, connectedLoadKw: 1 });
  check('unknown discom → error', bad1.error, true);
  check('error has message', typeof bad1.message, 'string');
  check('message mentions discom', bad1.message.includes('nonexistent_discom'), true);

  const bad2 = calculateBill({ discomId: 'adani_mumbai', categoryId: 'nonexistent_cat',
    units: 100, connectedLoadKw: 1, billingDate: DATE });
  check('unknown category → error', bad2.error, true);
  check('category error message', bad2.message.includes('nonexistent_cat'), true);
});

// ── LPSC (Late Payment Surcharge) ────────────────────────────────────────────
group('LPSC calculation', () => {
  const r = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 350, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: true,
    arrears: 5000, arrearLpsc: 100, lpscRate: 1.5, currentLpscMonths: 2 });
  check('arrears preserved', r.arrears, 5000);
  check('arrear LPSC preserved', r.arrearLpsc, 100);
  check('LPSC rate stored', r.lpscRate, 1.5);
  // currentLpsc = currentNet × lpscRate / 100 × months  = ~2892 × 0.015 × 2 = ~86.76
  check('current LPSC > 0', r.currentLpsc > 0, true);
  check('totalPayable includes arrears', r.totalPayable > r.currentNet, true);
});

// ── Multi-month slab scaling ─────────────────────────────────────────────────
group('multi-month slab scaling', () => {
  const slabs = [
    { limit: 100, rate: 3.00 },
    { limit: 300, rate: 6.00 },
    { limit: Infinity, rate: 9.00 }
  ];
  const b3 = calculateEnergySlabs(slabs, 500, 3);
  // 3-month: limits become 300, 900, ∞. 500 units → 300 @ 3 + 200 @ 6
  check('3-month slab1 units', b3[0].units, 300);
  check('3-month slab1 amount', b3[0].amount, 900);    // 300 × 3
  check('3-month slab2 units', b3[1].units, 200);
  check('3-month slab2 amount', b3[1].amount, 1200);   // 200 × 6
  check('3-month total', b3.reduce((s, r) => s + r.amount, 0), 2100);
});

// ── Shared utils module ──────────────────────────────────────────────────────
import { round2, escHtml, displayDate } from '../js/utils.js';
group('shared utils', () => {
  check('round2(1.456)', round2(1.456), 1.46);
  check('round2(2.345)', round2(2.345), 2.35);
  check('round2(0)', round2(0), 0);
  check('escHtml <>&"', escHtml('<b>"A&B"</b>'), '&lt;b&gt;&quot;A&amp;B&quot;&lt;/b&gt;');
  check('escHtml null', escHtml(null), '');
  check('displayDate ISO', displayDate('2025-06-15'), '15-06-2025');
  check('displayDate empty', displayDate(''), '');
  check('displayDate null', displayDate(null), '');
});

// ── UP DVVNL domestic bill (popular test case) ───────────────────────────────
group('UP DVVNL domestic bill', () => {
  const r = calculateBill({ discomId: 'dvvnl', categoryId: 'domestic', supplyTypeId: '10B',
    units: 350, connectedLoadKw: 3, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: false });
  check('result not error', r.error, undefined);
  check('discom id', r.discom.id, 'dvvnl');
  check('category id', r.category.id, 'domestic');
  check('units', r.units, 350);
  check('fixed > 0', r.fixedCharge > 0, true);
  check('energy > 0', r.totalEnergy > 0, true);
  check('net > 0', r.currentNet > 0, true);
});

// ── Form defaults (Simple mode pre-fill) ─────────────────────────────────────
// These back the "state + units and nothing else" path: if a default ever resolves to a
// means-tested or ineligible tariff, the visitor sees a wrong number without being asked.
import { getStates, getDiscoms, getCategories, getDefaultCategory, getDefaultSupplyType }
  from '../js/tariffs/registry.js';
group('form defaults', () => {
  const allDiscoms = getStates().flatMap(s => getDiscoms(s));
  check('65 DISCOMs in registry', allDiscoms.length, 65);

  // Every DISCOM must resolve to a genuinely domestic category — "Non-Domestic" must not match.
  const badDomestic = allDiscoms.filter(d => {
    const c = getDefaultCategory(d.id);
    return !c || !/domestic|residential|lmv-?1\b/i.test(c.name)
             || /commercial|non-?domestic|non-?residential/i.test(c.name);
  }).map(d => d.id);
  check('every DISCOM has a domestic default', badDomestic.join(',') || 'none', 'none');

  // A default supply type must never be the means-tested / unmetered variant.
  const badSupply = [];
  for (const d of allDiscoms) {
    for (const c of getCategories(d.id)) {
      const st = getDefaultSupplyType(d.id, c.id);
      if (st && /life\s*-?\s*line|\bbpl\b|unmetered|un-?metered/i.test(`${st.id} ${st.name}`)) {
        badSupply.push(`${d.id}/${c.id}=${st.id}`);
      }
    }
  }
  check('no default lands on a life-line/BPL tariff', badSupply.join(',') || 'none', 'none');

  // The two lists whose tariff-order sequence opens with a subsidised variant.
  check('UP LMV-1 defaults to 10B not 10A', getDefaultSupplyType('mvvnl', 'domestic').id, '10B');
  check('Bihar DS defaults to urban not Kutir Jyoti', getDefaultSupplyType('nbpdcl', 'domestic').id, 'ds2');
  // Odisha's list already leads with the right one — the ranking must not reorder it.
  check('Odisha keeps its general default', getDefaultSupplyType('tpcodl', 'domestic').id, 'general');

  // KSEB is the only DISCOM that splits domestic, and lists the sub-500W band first.
  check('KSEB skips the sub-500W band', getDefaultCategory('kseb').id, 'domestic');

  check('commercial lookup finds LMV-2', getDefaultCategory('mvvnl', 'commercial').id, 'commercial');
  check('no supply types → null', getDefaultSupplyType('mvvnl', 'nosuch'), null);
  check('unknown DISCOM → null', getDefaultCategory('nosuch'), null);
});

import { tariffAge } from '../js/tariffs/registry.js';

// Freshness disclosure. onDate is injected everywhere so these do not start failing in April.
group('tariffAge — how far behind the current FY', () => {
  // Indian FY starts 1 April.
  check('July 2026 is FY 2026-27', tariffAge('2026-27', '2026-07-29').currentFy, '2026-27');
  check('March 2026 still belongs to FY 2025-26', tariffAge('2025-26', '2026-03-31').currentFy, '2025-26');
  check('1 April flips the FY', tariffAge('2026-27', '2026-04-01').currentFy, '2026-27');
  check('short year is zero-padded', tariffAge('2009-10', '2009-06-01').currentFy, '2009-10');

  check('current-year data is 0 behind', tariffAge('2026-27', '2026-07-29').yearsBehind, 0);
  check('one year behind', tariffAge('2025-26', '2026-07-29').yearsBehind, 1);
  check('two years behind — the stale threshold', tariffAge('2024-25', '2026-07-29').yearsBehind, 2);

  // A 2024 bill computed on 2024-25 rates is current FOR THAT BILL, not stale.
  check('historical bill is not stale', tariffAge('2024-25', '2024-06-15').yearsBehind, 0);

  // Missing or unparseable years must not read as fresh — callers branch on >= 2, and a
  // silent 0 would suppress the warning on exactly the data we know least about.
  check('missing year -> null', tariffAge(null, '2026-07-29').yearsBehind, null);
  check('unparseable year -> null', tariffAge('unknown', '2026-07-29').yearsBehind, null);
});

group('resolveFixedCharge — slab_per_kw (marginal bands)', () => {
  // GERC Non-RGP: 50/kW on the first 10 kW, 85/kW on the next 30.
  const fc = { type: 'slab_per_kw', slabs: [{ maxLoad: 10, rate: 50 }, { maxLoad: 40, rate: 85 }] };
  check('inside the first band', resolveFixedCharge(fc, 5), 250);
  check('exactly at the band edge', resolveFixedCharge(fc, 10), 500);
  // The whole point: 15 kW is 10x50 + 5x85, NOT 15x85 (which `tiered` would give).
  check('straddles two bands', resolveFixedCharge(fc, 15), 925);
  check('fills both bands', resolveFixedCharge(fc, 40), 3050);
  // Above the top band the last rate keeps applying rather than the charge flat-lining.
  check('beyond the top band', resolveFixedCharge(fc, 50), 3900);
  check('zero load costs nothing', resolveFixedCharge(fc, 0), 0);
  check('fractional load prorates', resolveFixedCharge(fc, 2.5), 125);
});

// Gujarat — GERC orders dt. 25-03-2026, all four GUVNL discoms on one schedule.
// Hand-computed from the order: 50x3.05 + 50x3.50 + 150x4.15 = 950 energy; 2 kW sits in the
// first fixed band (15); ED is percent_energy so 20% of 950 = 190. Total 1155.
group('Gujarat RGP — from the FY2026-27 GERC order', () => {
  const bill = (discomId, supplyTypeId, units, kw) => calculateBill({
    discomId, categoryId: 'domestic', supplyTypeId, units, connectedLoadKw: kw,
    billingPeriodDays: 30, billingDate: '2026-07-15' });
  const urban = bill('ugvcl', 'urban', 250, 2);
  check('RGP urban 250u energy', urban.totalEnergy, 950);
  check('RGP urban fixed at 2 kW', urban.fixedCharge, 15);
  check('RGP urban total', urban.totalPayable, 1155);

  // Rural is a genuinely cheaper schedule, not a discount on the urban one.
  check('RGP rural 250u energy', bill('ugvcl', 'rural', 250, 2).totalEnergy, 850);

  // Fixed-charge bands are flat per band, not per kW: 5 kW pays 45, not 5x45.
  check('RGP fixed in the 4-6 kW band', bill('ugvcl', 'urban', 250, 5).fixedCharge, 45);
  check('RGP fixed above 6 kW', bill('ugvcl', 'urban', 250, 8).fixedCharge, 70);

  // All four discoms share one schedule — a divergence means an order was misread.
  const totals = ['ugvcl', 'mgvcl', 'pgvcl', 'dgvcl'].map(d => bill(d, 'urban', 250, 2).totalPayable);
  check('all four GUVNL discoms agree', new Set(totals).size, 1);

  // Non-RGP is non-telescopic and branches on contracted load.
  const comm = (supplyTypeId, units, kw) => calculateBill({ discomId: 'dgvcl',
    categoryId: 'commercial', supplyTypeId, units, connectedLoadKw: kw,
    billingPeriodDays: 30, billingDate: '2026-07-15' });
  check('Non-RGP <=10kW energy', comm('upto10kw', 800, 5).totalEnergy, 3480);
  check('Non-RGP <=10kW fixed', comm('upto10kw', 800, 5).fixedCharge, 250);
  check('Non-RGP >10kW energy', comm('above10kw', 1000, 15).totalEnergy, 4650);
  check('Non-RGP >10kW marginal fixed', comm('above10kw', 1000, 15).fixedCharge, 925);

  // Freshness: Gujarat is now current, and must NOT claim bill-verification.
  check('Gujarat reads as current', urban.tariffYearsBehind, 0);
  check('Gujarat is not bill-verified', urban.tariffVerified, false);
});

console.log(`\n${failed === 0 ? '✓ ALL PASSED' : '✗ FAILURES'} — ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
