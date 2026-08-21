// tests/engine.test.mjs — dependency-free regression tests for the bill engine.
// Run with:  node tests/engine.test.mjs   (or: npm test)
//
// These pin down the calculation logic so a future tariff edit or refactor can't silently change
// results (this suite would have caught the resolveDatedTariff whitelist bug that dropped
// demandUnit / excessDemand before they reached the engine). Cases use real tariffs from the data
// files; if a rate genuinely changes, update the expectation here in the same commit.

import { calculateBill, calculateEnergySlabs, resolveFixedCharge } from '../js/engine.js';
import { getCategory, ensureAll } from '../js/tariffs/registry.js';

// The registry loads state tariff tables on demand now, so the whole corpus has to be pulled
// in before any of these assertions run. Node evaluates this top-level await before the rest
// of the module body, which is exactly the ordering the tests need.
await ensureAll();

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

  // tiered + perKw — the band picks the RATE and the whole load is billed at it. UERC's
  // RTS-1: 75/85/100 per kW. A 3 kW connection pays 3 × 85 = 255. Contrast slab_per_kw,
  // whose bands are marginal and would give 1×75 + 2×85 = 245 for the same load.
  const banded = { type: 'tiered', perKw: true, slabs: [
    { maxLoad: 1, rate: 75 }, { maxLoad: 4, rate: 85 }, { maxLoad: Infinity, rate: 100 } ] };
  check('tiered perKw low',  resolveFixedCharge(banded, 1), 75);
  check('tiered perKw mid',  resolveFixedCharge(banded, 3), 255);
  check('tiered perKw high', resolveFixedCharge(banded, 6), 600);
  const marginal = { type: 'slab_per_kw', slabs: [
    { maxLoad: 1, rate: 75 }, { maxLoad: 4, rate: 85 }, { maxLoad: Infinity, rate: 100 } ] };
  check('slab_per_kw differs from tiered perKw', resolveFixedCharge(marginal, 3), 245);
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
// Uses APSPDCL, which does NOT ship a wheeling charge, so the "inert by default" baseline
// holds — MSEDCL now declares a real wheelingCharge of its own.
// The percent_energy duty this block asserts against is INJECTED rather than borrowed from
// the tariff: no shipped tariff carries a percent_energy charge any more, because each
// rebuilt schedule either excludes duty (the SERC notifies it separately) or levies it
// per-unit. Injecting keeps the primitive under test regardless of what the data does.
group('wheeling charge', () => {
  const base = { discomId: 'apspdcl', categoryId: 'domestic',
    units: 100, connectedLoadKw: 1, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0, facMode: 'per_unit', lpscApplicable: false };

  const cat = getCategory('apspdcl', 'domestic');
  const savedCharges = cat.additionalCharges;
  cat.additionalCharges = [{ name: 'Electricity Duty', type: 'percent_energy', rate: 6 }];

  // Inert unless the tariff declares wheelingCharge: the bill is unchanged.
  const off = calculateBill(base);
  check('no wheelingCharge → 0', off.wheelingCharge, 0);
  const baseGross = off.currentGross;
  const baseED = off.extraCharges.find(c => /Duty/.test(c.name)).amount;

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
    delete cat.wheelingCharge;        // don't leak into other tests
    cat.additionalCharges = savedCharges;
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


// ── by_consumption tariffs have no per-kW demand rate ────────────────────────
// Two defects lived in one line. resolveFixedCharge() was called without `units`, which
// defaults to 0, so every by_consumption tariff resolved into its LOWEST consumption band.
// And the result was then divided by the sanctioned load and treated as a demand rate — but
// these charges are banded by units, not load, so that number means nothing. Kerala LT-I
// reported a ₹142.50 "demand charge" alongside a ₹50 excess-demand penalty: two incompatible
// readings of the same field.
group('by_consumption — no fake demand rate', () => {
  // Kerala LT-I: banded by units, no perKw flag, so no demand rate and no multiplier penalty.
  const kl = calculateBill({ discomId: 'kseb', categoryId: 'domestic',
    units: 500, connectedLoadKw: 2, billedDemandKw: 3, billingPeriodDays: 30,
    billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('kerala fixed charge is the 500-unit band', kl.fixedCharge, 285);
  check('kerala has no per-kW demand rate', kl.excessDemandRate, 0);
  check('so no excess-demand penalty', kl.excessDemandPenalty, 0);

  // Telangana LT-I IS perKw: the band picks a RATE and the load scales it, so a demand rate
  // genuinely exists — and must come from the band the consumption actually falls in.
  const tsLow = calculateBill({ discomId: 'tsspdcl', categoryId: 'domestic',
    units: 500, connectedLoadKw: 2, billedDemandKw: 3, billingPeriodDays: 30,
    billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('telangana ≤800 units → ₹10/kW', tsLow.fixedCharge, 20);
  check('excess rate is 2× that', tsLow.excessDemandRate, 20);

  const tsHigh = calculateBill({ discomId: 'tsspdcl', categoryId: 'domestic',
    units: 1000, connectedLoadKw: 2, billedDemandKw: 3, billingPeriodDays: 30,
    billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('telangana >800 units → ₹50/kW', tsHigh.fixedCharge, 100);
  // The old code passed units=0 and always landed in the lowest band, so this read 20.
  check('excess rate follows the right band', tsHigh.excessDemandRate, 100);
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

group('resolveFixedCharge — by_consumption with a consumption-derived load', () => {
  // MPERC LV-1.2 urban: flat 81 up to 50 units, 134 up to 150, then 30 per 0.1 kW where every
  // 15 units (or part) counts as 0.1 kW. The sanctioned load is irrelevant in the top band.
  const fc = { type: 'by_consumption', slabs: [
    { maxUnits: 50, rate: 81 },
    { maxUnits: 150, rate: 134 },
    { maxUnits: Infinity, unitsPerStep: 15, rate: 30 },
  ] };
  check('flat band, low', resolveFixedCharge(fc, 2, 40), 81);
  check('flat band, edge', resolveFixedCharge(fc, 2, 50), 81);
  check('flat band, mid', resolveFixedCharge(fc, 2, 150), 134);
  // The order's own worked example: 155 units -> 1.1 kW -> 11 steps x 30.
  check("MPERC's 155-unit example", resolveFixedCharge(fc, 2, 155), 330);
  // Rounds UP, so one unit past the boundary already buys a whole step.
  check('151 units rounds up to 11 steps', resolveFixedCharge(fc, 2, 151), 330);
  // The order's second example: 350 units -> 2.4 kW.
  check("MPERC's 350-unit example", resolveFixedCharge(fc, 2, 350), 720);
  // Derived load ignores the sanctioned load entirely.
  check('sanctioned load does not change it', resolveFixedCharge(fc, 25, 155), 330);
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

import { resolveFppaForDiscom } from '../js/tariffs/fppa-resolve.js';

// Rajasthan — Tariff for Supply of Electricity-2025 (RERC 2303-2305/2025, from 01-10-2025).
// Every expected figure below is hand-computed from the order, not copied from engine output.
group('Rajasthan DS/LT-1 — from the 2025 RERC schedule', () => {
  const fppa = resolveFppaForDiscom('jvvnl', '2026-07-15');
  const bill = (discomId, units, kw, categoryId = 'domestic', supplyTypeId = null) => calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: kw,
    billingPeriodDays: 30, billingDate: '2026-07-15',
    facRate: fppa.rate, facMode: fppa.mode });

  // The Regulatory Surcharge IS the fuel surcharge here, capped at Rs 1.00/unit.
  check('surcharge is per-unit', fppa.mode, 'per_unit');
  check('surcharge is the Rs 1.00 ceiling', fppa.rate, 1.00);

  // 50x4.75 + 100x6.00 + 100x7.00 = 1537.50
  check('250u energy is telescopic', bill('jvvnl', 250, 2).totalEnergy, 1537.50);
  // 250 units lands in the "up to 300" band: Rs 300. NOT load-based.
  check('250u fixed is consumption-banded', bill('jvvnl', 250, 2).fixedCharge, 300);
  // Sanctioned load must not move the fixed charge - that was the old modelling error.
  check('fixed ignores connected load', bill('jvvnl', 250, 10).fixedCharge, 300);
  check('600u crosses into the Rs 800 band', bill('jvvnl', 600, 2).fixedCharge, 800);
  check('50u sits in the lowest band', bill('jvvnl', 50, 2).fixedCharge, 150);

  // 237.50 + 600 + 2450 + 750 = 4037.50 across all four slabs.
  check('600u energy uses the top slab', bill('jvvnl', 600, 2).totalEnergy, 4037.50);

  // ED is 5% of fixed + energy + surcharge: (300 + 1537.50 + 250) x 0.05 = 104.38
  check('250u total incl. surcharge and ED', bill('jvvnl', 250, 2).totalPayable, 2192);

  // One RERC tariff serves all three discoms.
  const totals = ['jvvnl', 'avvnl', 'jdvvnl'].map(d => bill(d, 250, 2).totalPayable);
  check('all three discoms agree', new Set(totals).size, 1);

  // NDS: 100x7.00 + 200x8.50 = 2400; 300 units sits in the Rs 450 band.
  const nds = bill('jvvnl', 300, 4, 'commercial', 'upto5kw');
  check('NDS <=5kW energy', nds.totalEnergy, 2400);
  check('NDS <=5kW consumption-banded fixed', nds.fixedCharge, 450);
  // Above 5 kW the fixed charge IS per kW: 160 x 10.
  check('NDS >5kW fixed is per kW', bill('jvvnl', 800, 10, 'commercial', 'above5kw').fixedCharge, 1600);

  // In force but set in FY2025-26, so it reads as one year behind, not verified.
  check('Rajasthan is one FY behind', bill('jvvnl', 250, 2).tariffYearsBehind, 1);
  check('Rajasthan is not bill-verified', bill('jvvnl', 250, 2).tariffVerified, false);
});

// West Bengal WBSEDCL — WBERC tariff order FY2025-26, effective 01-04-2025.
// WBSEDCL publishes QUARTERLY slabs (102/78/120/300/300/above 900 kWh); they are stored as
// monthly equivalents and the engine scales them back up for longer billing periods.
group('WBSEDCL — quarterly slabs stored monthly', () => {
  const bill = (supplyTypeId, units, kw, days = 30) => calculateBill({
    discomId: 'wbsedcl', categoryId: 'domestic', supplyTypeId, units,
    connectedLoadKw: kw, billingPeriodDays: days, billingDate: '2026-07-15' });

  // 34x5.04 + 26x6.33 + 40x7.12 + 100x7.52 + 50x7.69 = 1757.24
  check('urban 250u telescopic', bill('urban', 250, 2).totalEnergy, 1757.24);
  // Rural is a separate, slightly cheaper schedule.
  check('rural 250u is cheaper', bill('rural', 250, 2).totalEnergy, 1732.34);

  // The fixed charge is Rs 30 per kVA per month, not a flat amount - so it MUST move
  // with sanctioned load. The previous data had a flat Rs 35.
  check('fixed at 2 kVA', bill('urban', 250, 2).fixedCharge, 60);
  check('fixed at 5 kVA', bill('urban', 250, 5).fixedCharge, 150);

  // The whole point of the monthly-equivalent convention: over a full quarter the limits
  // scale back to the published bands, so 102 units sits entirely in the first slab.
  check('102u over a quarter stays in slab 1', bill('urban', 102, 2, 91).totalEnergy, 514.08);
  // One month later it would have spilled into three slabs instead.
  check('102u in one month spills', bill('urban', 102, 2, 30).totalEnergy > 514.08, true);

  // Lifeline is 368 paise gross before the State subsidy zeroes it.
  check('lifeline gross rate', bill('lifeline', 25, 1).totalEnergy, 92);
  check('lifeline fixed is Rs 10/kVA', bill('lifeline', 25, 1).fixedCharge, 10);

  // All three WB licensees now sit on their own FY2025-26 WBERC order, each of which says
  // the rates continue "till further order" — so they read one FY behind, not stale. If any
  // of these ever reads 2+, a newer order has issued and the file was not updated.
  const behind = (discomId) => calculateBill({ discomId, categoryId: 'domestic', units: 250,
    connectedLoadKw: 2, billingPeriodDays: 30, billingDate: '2026-07-15' }).tariffYearsBehind;
  check('WBSEDCL reads as one FY behind', bill('urban', 250, 2).tariffYearsBehind, 1);
  check('CESC reads as one FY behind', behind('cesc_kolkata'), 1);
  check('erstwhile DPL reads as one FY behind', behind('dpl'), 1);
});

// CESC — WBERC order dt. 25-03-2025, and the erstwhile-DPL schedule WBERC froze at its
// 31-12-2018 level. Both are published as MONTHLY bands, unlike WBSEDCL's quarterly ones.
group('CESC and erstwhile-DPL — monthly bands', () => {
  const bill = (discomId, categoryId, supplyTypeId, units, kva) => calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: kva,
    billingPeriodDays: 30, billingDate: '2026-07-15' });

  // 100 units: 25×5.18 + 35×5.69 + 40×6.70 — telescopic across the first three bands.
  check('CESC 100u telescopic', bill('cesc_kolkata', 'domestic', 'urban', 100, 2).totalEnergy, 596.65);
  // 300 units crosses into the two 762-paise bands, which are published separately.
  check('CESC 300u', bill('cesc_kolkata', 'domestic', 'urban', 300, 2).totalEnergy, 2112.15);
  check('CESC fixed is Rs 15/kVA', bill('cesc_kolkata', 'domestic', 'urban', 300, 2).fixedCharge, 30);

  // The frozen 2018 schedule is materially cheaper at the same consumption.
  check('erstwhile DPL 300u', bill('dpl', 'domestic', 'normal', 300, 2).totalEnergy, 1361.75);
  // Prepaid is a single rate on all units, which beats the ladder above ~100 units.
  check('erstwhile DPL prepaid 300u', bill('dpl', 'domestic', 'prepaid', 300, 2).totalEnergy, 1254);
});

// Telangana — TGERC retail schedule, retained for FY2026-27 by the order of 30-03-2026.
// The defining feature: consumption picks a whole LADDER, and crossing a threshold re-rates
// the bill from the first unit. Every figure below is hand-computed from the schedule.
group('Telangana LT-I — consumption-selected slab ladders', () => {
  const bill = (units, kw = 2, categoryId = 'domestic') => calculateBill({
    discomId: 'tsspdcl', categoryId, units, connectedLoadKw: kw,
    billingPeriodDays: 30, billingDate: '2026-07-15' });

  // Ladder A (<=100): 50x1.95 + 50x3.10 = 252.50
  check('100u uses ladder A', bill(100).totalEnergy, 252.50);
  // Ladder B(i) (101-200): 100x3.40 + 1x4.80 = 344.80 - NOT ladder A plus a slab.
  check('101u jumps to ladder B(i)', bill(101).totalEnergy, 344.80);
  // The cliff is real and intended: one more unit costs ~Rs 97 more overall.
  check('crossing 100 units costs more in total', bill(101).totalPayable > bill(100).totalPayable, true);

  // Ladder B(ii) (>200): 200x5.10 + 50x7.70 = 1405
  check('250u uses ladder B(ii)', bill(250).totalEnergy, 1405);
  // Full ladder: 1020 + 770 + 900 + 3800 + 1000 = 7490
  check('900u walks every slab', bill(900).totalEnergy, 7490);

  // Fixed charge is per kW AND banded by consumption: Rs 10/kW to 800 units, Rs 50/kW above.
  check('fixed is per kW', bill(250, 2).fixedCharge, 20);
  check('fixed scales with load', bill(250, 5).fixedCharge, 50);
  check('fixed steps above 800 units', bill(900, 2).fixedCharge, 100);

  // Domestic has no customer charge; commercial does.
  check('250u total', bill(250).totalPayable, 1509);

  // LT-II: crossing 50 units swaps Rs 7.00 flat for the Rs 8.50 ladder.
  check('50u commercial', bill(50, 3, 'commercial').totalEnergy, 350);
  check('51u commercial re-rates', bill(51, 3, 'commercial').totalEnergy, 433.50);
  check('commercial fixed steps too', bill(51, 3, 'commercial').fixedCharge, 210);

  // One TGERC schedule serves both discoms.
  const both = ['tsspdcl', 'tsnpdcl'].map(d => calculateBill({ discomId: d,
    categoryId: 'domestic', units: 250, connectedLoadKw: 2, billingPeriodDays: 30,
    billingDate: '2026-07-15' }).totalPayable);
  check('both discoms agree', new Set(both).size, 1);

  // The Tariff Details panel must show the ladder that was BILLED, not the raw fallback.
  check('resolved ladder is reported', bill(100).tariffRates.energySlabs[0].rate, 1.95);
  check('resolved ladder differs by usage', bill(250).tariffRates.energySlabs[0].rate, 5.10);

  check('Telangana reads as current', bill(250).tariffYearsBehind, 0);
  check('Telangana is not bill-verified', bill(250).tariffVerified, false);
});

console.log(`\n${failed === 0 ? '✓ ALL PASSED' : '✗ FAILURES'} — ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
