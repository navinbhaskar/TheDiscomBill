// tests/engine.test.mjs — dependency-free regression tests for the bill engine.
// Run with:  node tests/engine.test.mjs   (or: npm test)
//
// These pin down the calculation logic so a future tariff edit or refactor can't silently change
// results (this suite would have caught the resolveDatedTariff whitelist bug that dropped
// demandUnit / excessDemand before they reached the engine). Cases use real tariffs from the data
// files; if a rate genuinely changes, update the expectation here in the same commit.

import { calculateBill, calculateEnergySlabs, resolveFixedCharge } from '../js/engine.js';

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
  check('fixed (tiered ≤5kW)', r.fixedCharge, 420);
  check('energy', r.totalEnergy, 2131);
  check('ED 16% of energy', r.extraCharges.find(c => /Duty/.test(c.name)).amount, 340.96);
  check('net', r.currentNet, 2892);              // 420 + 2131 + 340.96 → 2891.96 → round
});

group('FPPA modes', () => {
  const pct = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 350, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 10, facMode: 'percent', lpscApplicable: false });
  check('percent FPPA = 10% of fixed+energy', pct.facAmount, 255.10);   // 10% × (420+2131)

  const pu = calculateBill({ discomId: 'adani_mumbai', categoryId: 'domestic',
    units: 350, connectedLoadKw: 5, billingPeriodDays: 30, billingDate: DATE,
    facRate: 0.5, facMode: 'per_unit', lpscApplicable: false });
  check('per_unit FPPA = ₹/unit × units', pu.facAmount, 175);          // 350 × 0.50
});

// ── kVA Maximum Demand + billing-demand floor (Adani HT-I, per_kva 472) ───────
group('kVA demand + floor', () => {
  // MD above floor → bills on MD
  const above = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 90, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('demandUnit kVA', above.demandUnit, 'kVA');
  check('energyUnit kVAh', above.energyUnit, 'kVAh');
  check('billingDemand = MD', above.billingDemand, 90);
  check('demand charge 472×90', above.fixedCharge, 42480);

  // MD below 75% floor → bills on 75% of contract demand
  const below = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 50, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('floor applied', below.demandFloorApplied, true);
  check('billingDemand = 75% CD', below.billingDemand, 75);
  check('demand charge 472×75', below.fixedCharge, 35400);
});

// ── kVAh apparent energy billed directly (no ÷PF conversion) ──────────────────
group('kVAh direct energy', () => {
  const r = calculateBill({ discomId: 'adani_mumbai', categoryId: 'ht_industrial',
    units: 1000, connectedLoadKw: 100, billedDemandKw: 90, billingBasis: 'kvah',
    billingPeriodDays: 30, billingDate: DATE, facRate: 0, lpscApplicable: false });
  check('energy on entered units (1000 × 6.73)', r.totalEnergy, 6730);
  check('ED 9.3% of kVAh energy', r.extraCharges.find(c => /Duty/.test(c.name)).amount, 625.89);
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
  check('excess rate 1.5 × 472', r.excessDemandRate, 708);
  check('penalty 20 × 708', r.excessDemandPenalty, 14160);
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
  // energy on 200 units (telescopic): 100×3.35 + 100×6.58 = 335 + 658 = 993
  check('energy on net units', net.totalEnergy, 993);

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

console.log(`\n${failed === 0 ? '✓ ALL PASSED' : '✗ FAILURES'} — ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
