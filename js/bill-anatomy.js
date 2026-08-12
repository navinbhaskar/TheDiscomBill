// bill-anatomy.js — turns an engine result into the rows, formulas and markup that
// /understand-your-bill/ displays.
//
// Imported by BOTH generate-seo.js (to render the default scenario into the served HTML) and
// js/understand-bill.js (to re-render when the reader changes an input). That is the whole
// reason it exists as its own module: if the build-time markup and the runtime markup came
// from two implementations they would drift, and the drift would show up as the page visibly
// rewriting itself on load. One function, two callers, identical output.
//
// The formulas here are read off js/engine.js, not written from memory — the percent-of-total
// duty base, the excess-demand threshold and the three penalty variants all mirror what the
// engine actually does. If the engine changes, these have to change with it; a formula that
// does not reproduce the number beside it is worse than no formula at all.

import { resolveFppaForDiscom } from './tariffs/fppa-resolve.js';
import { billT } from './bill-strings.js';
import { DOMESTIC_SUBSIDY } from './tariffs/subsidy.js';

/**
 * The scenarios the DISCOM selector offers — structure only; their labels and notes live in
 * understand-bill-content.js, which is a build-time module and never reaches the browser.
 *
 * Chosen for STRUCTURAL variety, not popularity. Between them they exercise every shape the
 * bill can take, which is the whole point of letting the reader switch:
 *   uppcl-domestic   two slabs, percent-of-total duty, and a POSITIVE monthly FPPAS
 *   msedcl-domestic  a separate wheeling line, and duty levied on energy only
 *   kseb-domestic    five narrow slabs and no additional charges at all
 *   delhi-domestic   a percent PPAC and a real state subsidy on the same bill
 *   uppcl-commercial demand-billed, an excess-demand penalty, and a NEGATIVE FPPAS (a credit)
 *
 * `period` is not decoration. FPPA/FPPAS/PPAC is notified per month, so the month decides the
 * rate — and the two UPPCL scenarios deliberately sit in different months to show the same
 * DISCOM charging +10% in one and refunding 4.43% in the next. Both figures are the verified
 * ones in js/tariffs/fppa.js; none of this is invented.
 *
 * `md` is the maximum demand the meter recorded. On the domestic scenarios it is deliberately
 * BELOW the sanctioned load: those categories bill the fixed charge on sanctioned load and the
 * engine would otherwise raise a penalty, which is not what a normal domestic bill shows.
 */
export const SCENARIOS = [
  {
    id: 'uppcl-domestic',
    guide: '/guides/how-to-read-uppcl-bill/', tariffPage: '/tariffs/uttar-pradesh/mvvnl/',
    discomId: 'mvvnl', categoryId: 'domestic', supplyTypeId: '10B',
    units: 250, connectedLoadKw: 2, md: 1.62,
    period: { from: '01-06-2026', to: '30-06-2026', month: 'JUN-2026', end: '2026-06-30', bill: '05-07-2026', due: '20-07-2026' },
    consumerNo: '1234 5678 9012', meterNo: 'MV 4471 2208', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'msedcl-domestic',
    guide: '/guides/how-to-read-msedcl-bill/', tariffPage: '/tariffs/maharashtra/msedcl/',
    discomId: 'msedcl', categoryId: 'domestic', supplyTypeId: '',
    units: 250, connectedLoadKw: 2, md: 1.74,
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '0210 4455 6677', meterNo: 'MS 9032 5514', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'kseb-domestic',
    guide: null, tariffPage: '/tariffs/kerala/kseb/',
    discomId: 'kseb', categoryId: 'domestic', supplyTypeId: 'single_phase',
    units: 250, connectedLoadKw: 2, md: 1.48,
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '1195 3320 8841', meterNo: 'KS 2210 7743', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'delhi-domestic',
    guide: '/guides/how-to-read-bses-delhi-bill/', tariffPage: '/tariffs/delhi/brpl/',
    discomId: 'brpl', categoryId: 'domestic', supplyTypeId: '',
    units: 320, connectedLoadKw: 3, md: 2.42, subsidyState: 'Delhi',
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '1002 3345 7781', meterNo: 'BR 5590 3312', phase: 'Single phase', status: 'OK',
  },
  {
    // The only scenario carrying a prompt-payment rebate, because Odisha is the one DISCOM in
    // this set whose own schedule documents a figure (10 paise/unit, OERC RST order — see the
    // category notes in js/tariffs/odisha.js). There is no generic rate to fall back on, and
    // putting an invented discount on the page would be worse than omitting the line.
    id: 'odisha-domestic',
    guide: '/guides/how-to-read-tpcodl-odisha-bill/', tariffPage: '/tariffs/odisha/tpcodl/',
    discomId: 'tpcodl', categoryId: 'domestic', supplyTypeId: 'general',
    units: 250, connectedLoadKw: 2, md: 1.55,
    rebate: {
      type: 'per_unit', rate: 0.10,
      label: 'Odisha allows a prompt-payment rebate of 10 paise per unit (OERC retail supply tariff order).',
    },
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '2140 8876 5503', meterNo: 'OD 3312 9987', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'uppcl-commercial',
    guide: '/guides/how-to-read-uppcl-bill/', tariffPage: '/tariffs/uttar-pradesh/mvvnl/',
    discomId: 'mvvnl', categoryId: 'commercial', supplyTypeId: '20HV',
    units: 800, connectedLoadKw: 8, md: 9,
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '5566 1234 8890', meterNo: 'MV 7781 0043', phase: 'Three phase', status: 'OK',
  },
];

/** The scenario rendered into the served HTML, before any JS runs. */
export const DEFAULT_SCENARIO = 'uppcl-domestic';

// Whole rupees print bare, paise print as two digits — never one. A bill showing "₹15.5"
// reads as a typo, which is exactly the impression this page cannot afford to give.
const money = (n) => {
  const v = Number(n);
  const frac = Number.isInteger(v) ? 0 : 2;
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: frac, maximumFractionDigits: frac });
};
const rate2 = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n, d = 0) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: d });
const pct = (n) => num(n, 2) + '%';
/** "+ a + b − c" → "a + b − c": drops the leading sign off a built-up sum. */
const join = (parts) => parts.join(' ').replace(/^\+ /, '');
/** Mirrors T() in generate-seo.js, for the few { en, hi, mr, ta } nodes carried on scenarios. */
const T = (lang, m) => (m && typeof m === 'object') ? (m[lang] != null ? m[lang] : m.en) : m;

/** The present reading. Previous is back-computed from it, so the subtraction checks out. */
const PRESENT_READING = 14820;

/** The arrears/LPSC/payment overlay the "messy bill" toggle adds. */
export const MESSY = { arrears: 1240, lpscRate: 1.25, payment: 500 };

/** Inputs for calculateBill() for a scenario, with the reader's overrides applied. */
export function billInput(scenario, { units, connectedLoadKw, md, messy } = {}) {
  const load = connectedLoadKw != null ? connectedLoadKw : scenario.connectedLoadKw;
  const input = {
    discomId: scenario.discomId,
    categoryId: scenario.categoryId,
    supplyTypeId: scenario.supplyTypeId || undefined,
    units: units != null ? units : scenario.units,
    connectedLoadKw: load,
    billingPeriodDays: 30,
    // The END of the billing period, not the bill date: FPPA windows and tariff revisions are
    // keyed to the month the power was consumed, not the month the bill was printed.
    billingDate: scenario.period.end,
  };
  // An explicit MD from the reader wins outright. Left blank, the scenario's own recorded MD is
  // carried as an OFFSET from its default load, so dragging the load slider keeps any overshoot
  // — otherwise raising the load would silently make the penalty vanish, which is the one thing
  // the commercial scenario exists to demonstrate.
  input.billedDemandKw = (md != null && Number.isFinite(md) && md > 0)
    ? +Number(md).toFixed(2)
    : +(load + (scenario.md - scenario.connectedLoadKw)).toFixed(2);

  // FPPA and subsidy come from the verified tables, resolved for this scenario's month. If a
  // state has no notified figure for that window the line simply does not appear — which is
  // the correct outcome, and better than inventing a rate to make the page look complete.
  const fppa = resolveFppaForDiscom(scenario.discomId, scenario.period.end);
  if (fppa) { input.facRate = fppa.rate; input.facMode = fppa.mode; }
  if (scenario.subsidyState && DOMESTIC_SUBSIDY[scenario.subsidyState]) {
    input.subsidy = DOMESTIC_SUBSIDY[scenario.subsidyState];
  }

  if (messy) {
    input.arrears = MESSY.arrears;
    input.lpscRate = MESSY.lpscRate;
    input.arrearLpsc = +(MESSY.arrears * MESSY.lpscRate / 100).toFixed(2);
    input.payments = [{ label: 'Part payment', amount: MESSY.payment }];
  }
  return input;
}

/** The notified FPPA entry behind a scenario, for the label and the source note. */
export function fppaFor(scenario) {
  return resolveFppaForDiscom(scenario.discomId, scenario.period.end);
}

/** The one extra charge that gets its own annotated row; everything else rides along generically. */
const isDuty = (c) => /duty/i.test(c.name || '');

/**
 * @param {Object} b       result of calculateBill()
 * @param {Object} scenario entry from SCENARIOS
 * @returns {{account:Array, reading:Array, slabs:Array, charges:Array, totals:Array, live:Object, source:Object}}
 *   `live` is keyed by the `live` field of LINES. Each entry is { formula?, calc?, result?, note? }
 *   rather than a sentence, so the page can show the rule AND the arithmetic that produced the
 *   figure beside it. A key that is absent means the line is not on this bill.
 */
export function readout(b, scenario, lang = 'en') {
  const live = {};
  const duty = (b.extraCharges || []).find(isDuty);
  const otherExtras = (b.extraCharges || []).filter(c => !isDuty(c));

  const dUnit = b.demandUnit || 'kW';
  const eUnit = b.energyUnit || 'kWh';
  const lastRate = b.slabBreakdown && b.slabBreakdown.length
    ? b.slabBreakdown[b.slabBreakdown.length - 1].rate : 0;
  const avgRate = b.units > 0 ? b.totalEnergy / b.units : 0;
  const fixedBasis = b.isDemandBilled ? b.billingDemand : b.connectedLoadKw;
  const fixedRate = fixedBasis > 0 ? b.fixedCharge / fixedBasis : 0;
  const previous = +(PRESENT_READING - b.units).toFixed(0);

  // Every user-visible word comes from billT(lang); nothing below is an English literal.
  // `c` is the context the note functions interpolate — already formatted, so a translation
  // can reorder a sentence without touching any arithmetic.
  const S = billT(lang);
  const P = scenario.period;
  const c = {
    dUnit, eUnit,
    load: num(b.connectedLoadKw, 2),
    md: num(b.billedDemandKw, 2),
    threshold: '', excess: num(b.excessDemand, 2),
    units: num(b.units, 2),
    days: b.billingPeriodDays || 30,
    perDay: num(b.units / (b.billingPeriodDays || 30), 1),
    energy: money(b.totalEnergy),
    lastRate: rate2(lastRate),
    avgRate: rate2(avgRate),
    net: money(b.currentNet),
    allIn: rate2(b.units > 0 ? b.currentNet / b.units : 0),
    payable: money(b.totalPayable),
    due: P.due, month: P.month, from: P.from, to: P.to,
    tariffLabel: '',
  };

  // ── account block ─────────────────────────────────────────────────────────
  const catName = b.category ? b.category.name : '';
  c.tariffLabel = b.supplyTypeName ? `${catName} · ${b.supplyTypeName}` : catName;

  live.tariffCategory = { note: S.nTariffCategory(c) };
  live.sanctionedLoad = b.isDemandBilled
    ? { note: S.nLoadDemandBilled(c) }
    : {
        formula: S.fFixedLoad(c),
        calc: [`${rate2(fixedRate)} × ${c.load} ${dUnit}`],
        result: money(b.fixedCharge),
        note: S.nLoadFixed(c),
      };

  const account = [
    { k: S.consumerNo, v: scenario.consumerNo, mark: 'consumer-no' },
    { k: S.consumerName, v: S.sampleName },
    { k: S.tariffCategory, v: c.tariffLabel, mark: 'tariff-category' },
    { k: S.sanctionedLoad, v: `${c.load} ${dUnit}`, mark: 'sanctioned-load' },
    { k: S.meterNo, v: `${scenario.meterNo} · ${scenario.phase === 'Three phase' ? S.threePhase : S.singlePhase}`, mark: 'meter-number' },
  ];

  // ── billing period ────────────────────────────────────────────────────────
  const period = [
    { k: S.billMonth, v: P.month, mark: 'bill-month' },
    { k: S.readingPeriod, v: `${P.from} – ${P.to}` },
    { k: S.billDate, v: P.bill },
    { k: S.dueDate, v: P.due, mark: 'due-date' },
  ];
  live.billMonth = { note: S.nBillMonth(c) };
  live.dueDate = { note: S.nDueDate(c) };

  // ── meter reading ─────────────────────────────────────────────────────────
  const reading = [
    { k: S.prevReading, v: num(previous) },
    { k: S.presReading, v: num(PRESENT_READING), mark: 'present-reading', live: true },
    { k: S.unitsConsumed, v: `${c.units} ${eUnit}`, mark: 'units-consumed' },
    { k: S.maxDemand, v: `${c.md} ${dUnit}`, mark: 'md' },
    { k: S.readingStatus, v: scenario.status, mark: 'reading-status' },
  ];
  live.meterNumber = { result: scenario.meterNo, note: S.nMeterNumber(c) };
  live.presentReading = {
    result: `${num(PRESENT_READING)} ${eUnit}`,
    note: S.nPresentReading(c),
  };

  // What the meter beside the bill displays. Two registers, because those are the two the
  // bill quotes: the cumulative energy reading and the recorded maximum demand. Values are
  // zero-padded to seven cells, which is what the glass on a real meter holds.
  const meter = {
    serial: scenario.meterNo,
    screens: [
      {
        key: 'present-reading', code: '1.8.0', unit: eUnit,
        value: `${PRESENT_READING}.0`, title: S.mScreenReading,
      },
      {
        key: 'md', code: '1.6.0', unit: dUnit,
        value: Number(b.billedDemandKw).toFixed(2).padStart(7, '0'), title: S.mScreenMd,
      },
    ],
  };

  live.unitsConsumed = {
    formula: S.fUnits,
    calc: [`(${num(PRESENT_READING)} − ${num(previous)}) × 1`],
    result: `${c.units} ${eUnit}`,
    note: S.nUnits(c),
  };
  // MD is on every bill, but it only COSTS anything on a demand-billed category — and saying so
  // is the point. A domestic reader who sees this field usually assumes it is being charged for.
  live.md = b.isDemandBilled
    ? {
        formula: S.fBilledDemand,
        calc: [`max(${c.md}, ${num(b.demandFloor || 0, 2)}) ${dUnit}`],
        result: `${num(b.billingDemand, 2)} ${dUnit}`,
        note: S.nMdBilled(c),
      }
    : { result: S.nMdResult(c), note: S.nMdRecorded(c) };
  live.readingStatus = {
    result: scenario.status,
    note: S.nStatus({ ...c, okPrefix: scenario.status === 'OK' ? S.nStatusOk(c) : '' }),
  };

  // ── slab ladder ───────────────────────────────────────────────────────────
  const slabs = (b.slabBreakdown || []).map(s => ({
    label: s.label, units: num(s.units, 2), rate: rate2(s.rate), amount: money(s.amount),
  }));
  live.energyCharge = {
    formula: S.fEnergy,
    calc: (b.slabBreakdown || []).map(s =>
      `${num(s.units, 2)} × ${rate2(s.rate)} = ${money(s.amount)}`),
    result: money(b.totalEnergy),
    note: slabs.length > 1 ? S.nEnergyLadder(c) : S.nEnergyFlat(c),
  };

  // ── charges ───────────────────────────────────────────────────────────────
  const charges = [];
  charges.push({ k: S.energyCharge, v: money(b.totalEnergy), mark: 'energy-charge' });
  charges.push({
    k: b.isDemandBilled ? S.demandCharge : S.fixedCharge,
    v: money(b.fixedCharge), mark: 'fixed-charge',
  });
  live.fixedCharge = b.isDemandBilled
    ? {
        formula: S.fDemand(c),
        calc: [`${rate2(fixedRate)} × ${num(b.billingDemand, 2)} ${dUnit}`],
        result: money(b.fixedCharge),
        note: S.nDemandCharge(c),
      }
    : {
        formula: S.fFixedLoad(c),
        calc: [`${rate2(fixedRate)} × ${c.load} ${dUnit}`],
        result: money(b.fixedCharge),
        note: S.nFixedCharge(c),
      };

  if (b.excessDemandPenalty > 0) {
    charges.push({ k: S.excessPenalty, v: money(b.excessDemandPenalty), mark: 'excess-demand' });
    c.threshold = num(b.connectedLoadKw * (1 + (b.excessDemandTolerancePct || 0) / 100), 2);
    c.tolerancePct = pct(b.excessDemandTolerancePct);
    c.tolerance = b.excessDemandTolerancePct ? S.nToleranceClause(c) : '';
    c.multiplier = num(b.excessDemandMultiplier, 2);
    c.multiplierClause = b.excessDemandMultiplier ? S.nMultiplierClause(c) : '';
    // Three ways a state levies this, and the engine picks between them — so the formula shown
    // has to match the one that actually ran, not a generic ₹/kW that happens to be commonest.
    live.excessDemand = b.excessDemandPctEnergyPerKw
      ? {
          formula: S.fPenaltyPct,
          calc: [`${c.excess} ${dUnit} × ${pct(b.excessDemandPctEnergyPerKw)} × ${money(b.totalEnergy)}`],
          result: money(b.excessDemandPenalty),
          note: S.nPenaltyPct(c),
        }
      : {
          formula: S.fPenaltyRate(c),
          calc: [S.cExcess(c), `${c.excess} × ${rate2(b.excessDemandRate)}`],
          result: money(b.excessDemandPenalty),
          note: S.nPenaltyRate(c),
        };
  }

  // FPPA can be NEGATIVE — UPPCL notified a 4.43% credit for July 2026 — so this is gated on
  // "not zero", not "greater than zero", and a credit renders as a deduction.
  if (b.facAmount !== 0) {
    const credit = b.facAmount < 0;
    charges.push({
      k: credit ? S.fppaCredit : S.fppa,
      v: (credit ? '− ' : '') + money(Math.abs(b.facAmount)),
      mark: 'fppa', credit,
    });
    // The percent base is the engine's facBase: fixed + energy + penalty + TOD + min top-up.
    // NOT the energy charge alone — that is the commonest wrong assumption about FPPA.
    const facBase = b.fixedCharge + b.totalEnergy + b.excessDemandPenalty + (b.todNet || 0) + b.minChargeTopUp;
    c.creditClause = credit ? S.nFppaCreditClause(c) : '';
    live.fppa = b.facMode === 'percent'
      ? {
          formula: S.fFppaPct,
          calc: [S.cBase({ ...c, base: money(facBase) }), `${money(facBase)} × ${pct(b.facRate)}`],
          result: (credit ? '− ' : '') + money(Math.abs(b.facAmount)),
          note: S.nFppaPct(c),
        }
      : {
          formula: S.fFppaUnit,
          calc: [`${c.units} × ${rate2(b.facRate)}`],
          result: (credit ? '− ' : '') + money(Math.abs(b.facAmount)),
          note: S.nFppaUnit(c),
        };
  }

  if (b.wheelingCharge > 0) {
    charges.push({ k: b.wheelingLabel || S.wheeling, v: money(b.wheelingCharge), mark: 'wheeling' });
    live.wheeling = b.wheelingType === 'per_unit'
      ? {
          formula: S.fWheelUnit,
          calc: [`${c.units} × ${rate2(b.wheelingRate)}`],
          result: money(b.wheelingCharge),
          note: S.nWheelUnit(c),
        }
      : {
          formula: S.fWheelLoad(c),
          calc: [`${rate2(b.wheelingRate)} × ${c.load} ${dUnit}`],
          result: money(b.wheelingCharge),
          note: S.nWheelLoad(c),
        };
  }

  for (const x of otherExtras) charges.push({ k: x.name, v: money(x.amount) });

  if (duty) {
    charges.push({ k: duty.name, v: money(duty.amount), mark: 'electricity-duty' });
    // The percent_total base is not "the bill" loosely — it is a specific sum the engine
    // builds, and it deliberately includes FPPA. Quoting it exactly is the point.
    const totalBase = b.fixedCharge + b.totalEnergy + b.excessDemandPenalty
      + (b.todNet || 0) + b.minChargeTopUp + b.wheelingCharge + b.facAmount;
    live.electricityDuty = duty.type === 'percent_energy'
      ? {
          formula: S.fDutyEnergy,
          calc: [`${money(b.totalEnergy)} × ${pct(duty.rate)}`],
          result: money(duty.amount),
          note: S.nDutyEnergy(c),
        }
      : duty.type === 'percent_total'
      ? {
          formula: S.fDutyTotal,
          calc: [S.cBase({ ...c, base: money(totalBase) }), `${money(totalBase)} × ${pct(duty.rate)}`],
          result: money(duty.amount),
          note: S.nDutyTotal(c),
        }
      : {
          formula: S.fDutyUnit,
          calc: [`${c.units} × ${rate2(duty.rate)}`],
          result: money(duty.amount),
          note: S.nDutyUnit(c),
        };
  }

  if (b.minChargeTopUp > 0) charges.push({ k: S.minTopUp, v: money(b.minChargeTopUp) });

  // ── amount payable ────────────────────────────────────────────────────────
  // Gross → subsidy → NET CURRENT BILL → arrears/surcharge/payments → TOTAL PAYABLE.
  // The two bold figures are different quantities and the bill has to show why: the net
  // current bill is this month's consumption, the total payable is what you owe today.
  const totals = [{ k: S.currentCharges, v: money(b.currentGross) }];

  if (b.subsidyAmount > 0) {
    totals.push({ k: S.subsidy, v: '− ' + money(b.subsidyAmount), mark: 'subsidy', credit: true });
    live.subsidy = {
      formula: S.fNetAfterSubsidy,
      calc: [`${money(b.currentGross)} − ${money(b.subsidyAmount)}`],
      result: money(b.currentNet),
      note: S.nSubsidy({ ...c, subsidyLabel: b.subsidyLabel || S.wStateScheme }),
    };
  }

  totals.push({ k: S.netCurrentBill, v: money(b.currentNet), mark: 'net-current-bill' });
  live.netCurrentBill = {
    formula: b.subsidyAmount > 0
      ? S.fNetAfterSubsidy
      : S.fNetSum + join(charges.map(x => (x.credit ? '−' : '+') + ' ' + x.k.toLowerCase())),
    calc: b.subsidyAmount > 0
      ? [`${money(b.currentGross)} − ${money(b.subsidyAmount)}`]
      : [join(charges.map(x => (x.credit ? '−' : '+') + ' ' + x.v.replace(/^− /, '')))],
    result: money(b.currentNet),
    note: S.nNetCurrentBill(c),
  };

  if (b.arrears > 0) {
    totals.push({ k: S.arrears, v: money(b.arrears), mark: 'arrears' });
    live.arrears = { result: money(b.arrears), note: S.nArrears(c) };
  }
  const lpsc = (b.arrearLpsc || 0) + (b.currentLpsc || 0);
  if (lpsc > 0) {
    totals.push({ k: S.lpsc, v: money(lpsc), mark: 'lpsc' });
    live.lpsc = {
      formula: S.fLpsc,
      calc: [`${money(b.arrears)} × ${pct(b.lpscRate)}`],
      result: money(lpsc),
      note: S.nLpsc(c),
    };
  }
  if (b.totalPayments > 0) {
    totals.push({ k: S.payments, v: '− ' + money(b.totalPayments), credit: true });
  }
  totals.push({ k: S.totalPayable, v: money(b.totalPayable), mark: 'total-payable', grand: true });

  const netCalc = [`${money(b.currentNet)} ${S.wNetCurrentBill}`];
  if (b.arrears > 0) netCalc.push(`+ ${money(b.arrears)} ${S.wArrears}`);
  if (lpsc > 0) netCalc.push(`+ ${money(lpsc)} ${S.wSurcharge}`);
  if (b.totalPayments > 0) netCalc.push(`− ${money(b.totalPayments)} ${S.wPaid}`);
  live.totalPayable = {
    formula: S.fTotal,
    calc: [netCalc.join(' ')],
    result: money(b.totalPayable),
    note: S.nTotalPayable({
      ...c,
      diffClause: (b.arrears > 0 || lpsc > 0) ? S.nTotalDiffers(c) : S.nTotalSame(c),
    }),
  };

  // Prompt-payment rebate — only where the DISCOM's own schedule documents one. There is no
  // generic rate to fall back on, and inventing one would put a fake discount on the page.
  if (scenario.rebate) {
    const R = scenario.rebate;
    const amount = R.type === 'per_unit'
      ? +(b.units * R.rate).toFixed(2)
      : +(b.totalEnergy * R.rate / 100).toFixed(2);
    const payByDue = Math.round(b.totalPayable - amount);
    totals.push({ k: S.rebateBy(c), v: '− ' + money(amount), mark: 'due-date-rebate', credit: true });
    totals.push({ k: S.payableByDue, v: money(payByDue), grand: true });
    live.dueDateRebate = {
      formula: R.type === 'per_unit' ? S.fRebateUnit : S.fRebatePct,
      calc: [R.type === 'per_unit'
        ? `${c.units} × ${rate2(R.rate)}`
        : `${money(b.totalEnergy)} × ${pct(R.rate)}`],
      result: '− ' + money(amount),
      note: S.nRebate({ ...c, rebateLabel: T(lang, R.label), payByDue: money(payByDue) }),
    };
  }

  const source = {
    label: b.tariffAsOf || b.tariffPeriodLabel || '',
    verified: !!b.tariffVerified,
    url: b.tariffSourceUrl || '',
    discom: b.discom ? (b.discom.fullName || b.discom.name) : '',
  };

  return { account, period, reading, slabs, charges, totals, live, source, meter, S };
}

// ─── markup ───────────────────────────────────────────────────────────────────
// Also shared between build and runtime, for the same reason the arithmetic is: the served
// HTML and the hydrated HTML have to be the same markup, or the page rewrites itself in
// front of the reader on load and Googlebot indexes whichever it happens to see.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// The note and formula templates in bill-strings.js are written across several lines for
// legibility, so their indentation has to be squashed before it reaches the page.
const flat = (s) => esc(String(s ?? '').replace(/\s+/g, ' ').trim());

// Every marked row is one grid row of a single-column document, so a marker can be pulled
// out into the gutter beside the bill with pure CSS — no measuring, no JS, and it stays put
// when a row's text wraps. The leader line is drawn by ::after on the anchor itself.
// The callout carries the number AND the row's title, so the gutter reads as a legend on its
// own — "1. Consumer number", "7. Fuel surcharge (FPPA)" — rather than as bare digits that
// only mean something once you have found the matching explanation below.
function marker(mark, k, n) {
  return `<a class="bill-mark" href="#explain-${mark}" id="mark-${mark}">`
    + `<span class="bill-mark-n">${n}</span>`
    + `<span class="bill-mark-t">${esc(k)}</span></a>`;
}

function fieldRows(rows, counter) {
  return rows.map(r => {
    const m = r.mark ? marker(r.mark, r.k, counter.next(r.mark)) : '';
    const c = [r.mark ? 'is-marked' : '', r.credit ? 'is-credit' : '', r.grand ? 'is-grand' : '',
      r.live ? 'is-live' : '']
      .filter(Boolean).join(' ');
    return `<div class="bill-row${c ? ' ' + c : ''}"${r.mark ? ` data-line="${r.mark}"` : ''}>`
      + `${m}<span class="bill-row-k">${esc(r.k)}</span>`
      + `<span class="bill-row-v">${esc(r.v)}</span></div>`;
  }).join('');
}

function block(title, rows, counter, cls) {
  return `<section class="bill-block${cls ? ' ' + cls : ''}"><h4>${esc(title)}</h4>`
    + `<div class="bill-rows">${fieldRows(rows, counter)}</div></section>`;
}

/**
 * @returns {{html:string, marks:Object}} `marks` maps a line id to the number printed on the
 *   bill, so the explanation list downstream can show the same digit.
 */
export function billHtml(r) {
  const marks = {};
  let n = 0;
  const counter = { next(id) { marks[id] = ++n; return n; } };

  // Numbering follows DOCUMENT order, so the blocks are built in the order they appear on the
  // page rather than in the order the template happens to interpolate them.
  const accountBlock = block(r.S.blkAccount, r.account, counter);
  const periodBlock = block(r.S.blkPeriod, r.period, counter, 'bill-block-period');
  const readingBlock = block(r.S.blkReading, r.reading, counter, 'bill-block-reading');
  const chargesBlock = block(r.S.blkCharges, r.charges, counter, 'bill-block-charges');
  const totalsBlock = block(r.S.blkPayable, r.totals, counter, 'bill-block-total');

  const slabRows = r.slabs.map(s =>
    `<tr><td>${esc(s.label)}</td><td class="num">${esc(s.units)}</td>`
    + `<td class="num">${esc(s.rate)}</td><td class="num">${esc(s.amount)}</td></tr>`).join('');

  const src = r.source.label
    ? `<p class="bill-source">${esc(r.source.label)}`
      + (r.source.verified
        ? ` <span class="bill-badge is-ok">${esc(r.S.verified)}</span>`
        : ` <span class="bill-badge">${esc(r.S.representative)}</span>`)
      + (r.source.url ? ` · <a href="${esc(r.source.url)}" target="_blank" rel="noopener">${esc(r.S.source)}</a>` : '')
      + `</p>`
    : '';

  const html = `
        <div class="bill-doc-head">
          <div class="bill-doc-id">
            <strong class="bill-doc-title">${esc(r.source.discom || r.S.fallbackDiscom)}</strong>
            <span class="bill-doc-sub">${esc(r.S.docSub)}</span>
          </div>
          <span class="bill-doc-stamp">${esc(r.S.stamp)}</span>
        </div>
        ${accountBlock}
        ${periodBlock}
        ${readingBlock}
        <section class="bill-block bill-block-slabs">
          <h4>${esc(r.S.blkSlabs)}</h4>
          <div class="bill-scroll"><table class="bill-slabs">
            <thead><tr><th scope="col">${esc(r.S.thSlab)}</th><th scope="col">${esc(r.S.thUnits)}</th><th scope="col">${esc(r.S.thRate)}</th><th scope="col">${esc(r.S.thAmount)}</th></tr></thead>
            <tbody>${slabRows}</tbody>
          </table></div>
        </section>
        ${chargesBlock}
        ${totalsBlock}
        ${src}`;

  return { html, marks };
}

/**
 * The formula / working / answer block shown under each explanation. Rendered from the same
 * `live` entry at build time and at runtime — see the note at the top of this file.
 */
export function liveHtml(live) {
  if (!live) return '';
  const parts = [];
  if (live.formula) parts.push(`<div class="ub-calc-formula">${flat(live.formula)}</div>`);
  if (live.calc && live.calc.length) {
    parts.push(`<div class="ub-calc-work">`
      + live.calc.map(c => `<span class="ub-calc-step">${flat(c)}</span>`).join('')
      + `</div>`);
  }
  if (live.result) {
    parts.push(`<div class="ub-calc-result"><span class="ub-calc-eq" aria-hidden="true">=</span>`
      + `<span class="sr-only">Result</span>${flat(live.result)}</div>`);
  }
  const calc = parts.length ? `<div class="ub-calc">${parts.join('')}</div>` : '';
  const note = live.note ? `<p class="ub-live-note">${flat(live.note)}</p>` : '';
  return calc + note;
}
