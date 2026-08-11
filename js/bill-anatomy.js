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
    discomId: 'mvvnl', categoryId: 'domestic', supplyTypeId: '10B',
    units: 250, connectedLoadKw: 2, md: 1.62,
    period: { from: '01-06-2026', to: '30-06-2026', month: 'JUN-2026', end: '2026-06-30', bill: '05-07-2026', due: '20-07-2026' },
    consumerNo: '1234 5678 9012', meterNo: 'MV 4471 2208', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'msedcl-domestic',
    discomId: 'msedcl', categoryId: 'domestic', supplyTypeId: '',
    units: 250, connectedLoadKw: 2, md: 1.74,
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '0210 4455 6677', meterNo: 'MS 9032 5514', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'kseb-domestic',
    discomId: 'kseb', categoryId: 'domestic', supplyTypeId: 'single_phase',
    units: 250, connectedLoadKw: 2, md: 1.48,
    period: { from: '01-07-2026', to: '31-07-2026', month: 'JUL-2026', end: '2026-07-31', bill: '05-08-2026', due: '20-08-2026' },
    consumerNo: '1195 3320 8841', meterNo: 'KS 2210 7743', phase: 'Single phase', status: 'OK',
  },
  {
    id: 'delhi-domestic',
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

/** The present reading. Previous is back-computed from it, so the subtraction checks out. */
const PRESENT_READING = 14820;

/** The arrears/LPSC/payment overlay the "messy bill" toggle adds. */
export const MESSY = { arrears: 1240, lpscRate: 1.25, payment: 500 };

/** Inputs for calculateBill() for a scenario, with the reader's overrides applied. */
export function billInput(scenario, { units, connectedLoadKw, messy } = {}) {
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
  // Recorded MD is carried as an offset from the scenario's own default load, so dragging the
  // load slider keeps any overshoot — otherwise raising the load would silently make the
  // penalty vanish, which is the one thing the commercial scenario exists to demonstrate.
  input.billedDemandKw = +(load + (scenario.md - scenario.connectedLoadKw)).toFixed(2);

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
export function readout(b, scenario) {
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

  // ── account block ─────────────────────────────────────────────────────────
  const catName = b.category ? b.category.name : '';
  const tariffLabel = b.supplyTypeName ? `${catName} · ${b.supplyTypeName}` : catName;

  live.tariffCategory = {
    note: `This bill is on ${tariffLabel}. Every rate below — the slabs, the fixed charge, whether a `
      + `demand penalty can apply at all — follows from that one code and nothing else.`,
  };
  live.sanctionedLoad = b.isDemandBilled
    ? {
        note: `${num(b.connectedLoadKw, 2)} ${dUnit} sanctioned, against ${num(b.billedDemandKw, 2)} ${dUnit} `
          + `actually recorded. On this category the charge follows the recorded figure, not the sanctioned `
          + `one — and the gap between them is what the penalty is levied on.`,
      }
    : {
        formula: `Fixed charge = rate per ${dUnit} × sanctioned load`,
        calc: [`${rate2(fixedRate)} × ${num(b.connectedLoadKw, 2)} ${dUnit}`],
        result: money(b.fixedCharge),
        note: `The sanctioned load is the only thing this charge depends on. Set the units to zero above `
          + `and it is all that remains on the bill.`,
      };

  const account = [
    { k: 'Consumer number', v: scenario.consumerNo, mark: 'consumer-no' },
    { k: 'Consumer name', v: 'A. Kumar' },
    { k: 'Tariff category', v: tariffLabel, mark: 'tariff-category' },
    { k: 'Sanctioned load', v: `${num(b.connectedLoadKw, 2)} ${dUnit}`, mark: 'sanctioned-load' },
    { k: 'Meter number', v: `${scenario.meterNo} · ${scenario.phase}` },
  ];

  // ── billing period ────────────────────────────────────────────────────────
  const P = scenario.period;
  const period = [
    { k: 'Bill month', v: P.month, mark: 'bill-month' },
    { k: 'Reading period', v: `${P.from} – ${P.to}` },
    { k: 'Bill date', v: P.bill },
    { k: 'Due date', v: P.due, mark: 'due-date' },
  ];
  live.billMonth = {
    note: `${P.month} — the month the power was USED (${P.from} to ${P.to}), not the month the bill was `
      + `printed. It matters more than it looks: the fuel surcharge is notified per month, so this field `
      + `decides which rate applies. Switch DISCOM above and watch the same UPPCL connection charge +10% `
      + `in June and refund 4.43% in July.`,
  };
  live.dueDate = {
    note: `Pay on or before ${P.due} and the bill costs exactly what it says. After it, a late payment `
      + `surcharge starts accruing on the whole outstanding amount and compounds monthly — and where the `
      + `DISCOM offers a prompt-payment rebate, you lose that too. The gap between the bill date and the `
      + `due date is typically 15 days.`,
  };

  // ── meter reading ─────────────────────────────────────────────────────────
  const reading = [
    { k: 'Previous reading', v: num(previous) },
    { k: 'Present reading', v: num(PRESENT_READING) },
    { k: 'Units consumed', v: `${num(b.units, 2)} ${eUnit}`, mark: 'units-consumed' },
    { k: 'Maximum demand', v: `${num(b.billedDemandKw, 2)} ${dUnit}`, mark: 'md' },
    { k: 'Reading status', v: scenario.status, mark: 'reading-status' },
  ];
  live.unitsConsumed = {
    formula: 'Units = (Present reading − Previous reading) × Meter constant',
    calc: [`(${num(PRESENT_READING)} − ${num(previous)}) × 1`],
    result: `${num(b.units, 2)} ${eUnit}`,
    note: `About ${num(b.units / (b.billingPeriodDays || 30), 1)} units a day over `
      + `${b.billingPeriodDays || 30} days. The meter constant is 1 on almost every domestic `
      + `connection; where it is not, it is printed on the meter and multiplies the difference.`,
  };
  // MD is on every bill, but it only COSTS anything on a demand-billed category — and saying so
  // is the point. A domestic reader who sees this field usually assumes it is being charged for.
  live.md = b.isDemandBilled
    ? {
        formula: 'Billed demand = higher of (recorded MD, contractual floor)',
        calc: [`max(${num(b.billedDemandKw, 2)}, ${num(b.demandFloor || 0, 2)}) ${dUnit}`],
        result: `${num(b.billingDemand, 2)} ${dUnit}`,
        note: `The highest half-hour average the meter logged this month. On this category the demand `
          + `charge and any excess-demand penalty are both levied on it, so a few minutes with everything `
          + `running at once sets the price of the whole month.`,
      }
    : {
        result: `${num(b.billedDemandKw, 2)} ${dUnit} recorded, against ${num(b.connectedLoadKw, 2)} ${dUnit} sanctioned`,
        note: `The highest half-hour average the meter logged. On a domestic connection it is recorded but `
          + `NOT what you are billed on — the fixed charge follows the sanctioned load regardless. It still `
          + `matters: if it creeps above your sanctioned load, the DISCOM can raise a penalty or ask you to `
          + `regularise the connection.`,
      };
  live.readingStatus = {
    result: scenario.status,
    note: `How the reading was obtained. ${scenario.status === 'OK' ? 'OK means the meter was physically '
      + 'read and the reading was accepted — the bill is based on real consumption. ' : ''}DISCOMs print a `
      + `short code here and the vocabulary is utility-specific. What matters is the distinction: a status `
      + `saying the meter was actually read, versus one saying it was estimated, inaccessible or faulty. `
      + `Anything in the second group means the units above are a guess that will be trued up later, and `
      + `it is worth taking your own reading and quoting it.`,
  };

  // ── slab ladder ───────────────────────────────────────────────────────────
  const slabs = (b.slabBreakdown || []).map(s => ({
    label: s.label, units: num(s.units, 2), rate: rate2(s.rate), amount: money(s.amount),
  }));
  live.energyCharge = {
    formula: 'Energy charge = Σ (units falling in each slab × that slab’s rate)',
    calc: (b.slabBreakdown || []).map(s =>
      `${num(s.units, 2)} × ${rate2(s.rate)} = ${money(s.amount)}`),
    result: money(b.totalEnergy),
    note: slabs.length > 1
      ? `The slabs STACK — crossing into a higher one raises the price of the extra units only. `
        + `The last unit cost ${rate2(lastRate)}, but the average across the bill is `
        + `${money(b.totalEnergy)} ÷ ${num(b.units, 2)} = ${rate2(avgRate)} a unit.`
      : `A single slab, so there is no ladder here: every unit cost ${rate2(avgRate)}.`,
  };

  // ── charges ───────────────────────────────────────────────────────────────
  const charges = [];
  charges.push({ k: 'Energy charge', v: money(b.totalEnergy), mark: 'energy-charge' });
  charges.push({
    k: b.isDemandBilled ? 'Demand charge' : 'Fixed charge',
    v: money(b.fixedCharge), mark: 'fixed-charge',
  });
  live.fixedCharge = b.isDemandBilled
    ? {
        formula: `Demand charge = rate per ${dUnit} × billed demand`,
        calc: [`${rate2(fixedRate)} × ${num(b.billingDemand, 2)} ${dUnit}`],
        result: money(b.fixedCharge),
        note: `Billed demand is the higher of the recorded maximum demand and any contractual floor, `
          + `so on this category the charge moves month to month with how hard you ran.`,
      }
    : {
        formula: `Fixed charge = rate per ${dUnit} × sanctioned load`,
        calc: [`${rate2(fixedRate)} × ${num(b.connectedLoadKw, 2)} ${dUnit}`],
        result: money(b.fixedCharge),
        note: `Consumption does not enter this formula anywhere. That is why a locked, empty house `
          + `still receives a bill.`,
      };

  if (b.excessDemandPenalty > 0) {
    charges.push({ k: 'Excess demand penalty', v: money(b.excessDemandPenalty), mark: 'excess-demand' });
    const threshold = b.connectedLoadKw * (1 + (b.excessDemandTolerancePct || 0) / 100);
    // Three ways a state levies this, and the engine picks between them — so the formula shown
    // has to match the one that actually ran, not a generic ₹/kW that happens to be commonest.
    live.excessDemand = b.excessDemandPctEnergyPerKw
      ? {
          formula: 'Penalty = excess demand × (% of energy charge per excess kW)',
          calc: [`${num(b.excessDemand, 2)} ${dUnit} × ${pct(b.excessDemandPctEnergyPerKw)} × ${money(b.totalEnergy)}`],
          result: money(b.excessDemandPenalty),
          note: `Threshold: ${num(threshold, 2)} ${dUnit}`
            + (b.excessDemandTolerancePct ? ` (sanctioned load plus a ${pct(b.excessDemandTolerancePct)} tolerance)` : '')
            + `. Recorded demand was ${num(b.billedDemandKw, 2)} ${dUnit}.`,
        }
      : {
          formula: `Penalty = excess demand × penalty rate per ${dUnit}`,
          calc: [
            `Excess = ${num(b.billedDemandKw, 2)} − ${num(threshold, 2)} = ${num(b.excessDemand, 2)} ${dUnit}`,
            `${num(b.excessDemand, 2)} × ${rate2(b.excessDemandRate)}`,
          ],
          result: money(b.excessDemandPenalty),
          note: (b.excessDemandMultiplier
            ? `The penalty rate is ${num(b.excessDemandMultiplier, 2)}× the normal demand rate. `
            : '')
            + `Raise the sanctioned load above and watch this line disappear — then check whether the `
            + `higher fixed charge costs you more or less than the penalty did.`,
        };
  }

  // FPPA can be NEGATIVE — UPPCL notified a 4.43% credit for July 2026 — so this is gated on
  // "not zero", not "greater than zero", and a credit renders as a deduction.
  if (b.facAmount !== 0) {
    const credit = b.facAmount < 0;
    charges.push({
      k: credit ? 'Fuel surcharge credit (FPPA)' : 'Fuel surcharge (FPPA)',
      v: (credit ? '− ' : '') + money(Math.abs(b.facAmount)),
      mark: 'fppa', credit,
    });
    // The percent base is the engine's facBase: fixed + energy + penalty + TOD + min top-up.
    // NOT the energy charge alone — that is the commonest wrong assumption about FPPA.
    const facBase = b.fixedCharge + b.totalEnergy + b.excessDemandPenalty + (b.todNet || 0) + b.minChargeTopUp;
    live.fppa = b.facMode === 'percent'
      ? {
          formula: 'FPPA = (energy charge + fixed/demand charge + penalties) × notified rate %',
          calc: [`Base = ${money(facBase)}`, `${money(facBase)} × ${pct(b.facRate)}`],
          result: (credit ? '− ' : '') + money(Math.abs(b.facAmount)),
          note: (credit
              ? 'This month the rate is NEGATIVE, so the line is a credit: power cost the DISCOM less than '
                + 'the regulator assumed and the difference comes back to you. '
              : '')
            + 'The rate is notified per month and it applies to the fixed charge as well as the energy '
            + 'charge — not to the units alone, which is the commonest misreading of this line.',
        }
      : {
          formula: 'FPPA = units × notified rate per unit',
          calc: [`${num(b.units, 2)} × ${rate2(b.facRate)}`],
          result: (credit ? '− ' : '') + money(Math.abs(b.facAmount)),
          note: 'The per-unit rate is the gap between what power actually cost the DISCOM and what '
            + 'the regulator assumed when your tariff was set.',
        };
  }

  if (b.wheelingCharge > 0) {
    charges.push({ k: b.wheelingLabel || 'Wheeling charge', v: money(b.wheelingCharge), mark: 'wheeling' });
    live.wheeling = b.wheelingType === 'per_unit'
      ? {
          formula: 'Wheeling charge = units × wheeling rate per unit',
          calc: [`${num(b.units, 2)} × ${rate2(b.wheelingRate)}`],
          result: money(b.wheelingCharge),
          note: 'This state unbundles the cost of the wires from the cost of the power. States that '
            + 'do not have folded the same cost into the energy rate — you are not paying it twice.',
        }
      : {
          formula: `Wheeling charge = rate per ${dUnit} × sanctioned load`,
          calc: [`${rate2(b.wheelingRate)} × ${num(b.connectedLoadKw, 2)} ${dUnit}`],
          result: money(b.wheelingCharge),
          note: 'Levied on the load rather than the units, because the network has to be sized for '
            + 'the capacity you might draw, not the energy you happened to use.',
        };
  }

  for (const c of otherExtras) charges.push({ k: c.name, v: money(c.amount) });

  if (duty) {
    charges.push({ k: duty.name, v: money(duty.amount), mark: 'electricity-duty' });
    // The percent_total base is not "the bill" loosely — it is a specific sum the engine
    // builds, and it deliberately includes FPPA. Quoting it exactly is the point.
    const totalBase = b.fixedCharge + b.totalEnergy + b.excessDemandPenalty
      + (b.todNet || 0) + b.minChargeTopUp + b.wheelingCharge + b.facAmount;
    live.electricityDuty = duty.type === 'percent_energy'
      ? {
          formula: 'Duty = energy charge × duty rate %',
          calc: [`${money(b.totalEnergy)} × ${pct(duty.rate)}`],
          result: money(duty.amount),
          note: 'Here the duty sits on the energy charge alone — the fixed charge is not taxed.',
        }
      : duty.type === 'percent_total'
      ? {
          formula: 'Duty = (energy + fixed + penalties + wheeling + FPPA) × duty rate %',
          calc: [`Base = ${money(totalBase)}`, `${money(totalBase)} × ${pct(duty.rate)}`],
          result: money(duty.amount),
          note: 'Here the duty sits on the WHOLE bill, fixed charge included. Which base a state uses '
            + 'is a state-by-state decision, and it is why two identical households across a border '
            + 'pay different totals.',
        }
      : {
          formula: 'Duty = units × duty rate per unit',
          calc: [`${num(b.units, 2)} × ${rate2(duty.rate)}`],
          result: money(duty.amount),
          note: 'A per-unit duty, so it scales with consumption rather than with the bill.',
        };
  }

  if (b.minChargeTopUp > 0) charges.push({ k: 'Minimum charge top-up', v: money(b.minChargeTopUp) });

  // ── amount payable ────────────────────────────────────────────────────────
  // Gross → subsidy → NET CURRENT BILL → arrears/surcharge/payments → TOTAL PAYABLE.
  // The two bold figures are different quantities and the bill has to show why: the net
  // current bill is this month's consumption, the total payable is what you owe today.
  const totals = [{ k: 'Current charges', v: money(b.currentGross) }];

  if (b.subsidyAmount > 0) {
    totals.push({ k: 'Subsidy', v: '− ' + money(b.subsidyAmount), mark: 'subsidy', credit: true });
    live.subsidy = {
      formula: 'Net current bill = current charges − subsidy',
      calc: [`${money(b.currentGross)} − ${money(b.subsidyAmount)}`],
      result: money(b.currentNet),
      note: `${b.subsidyLabel || 'A state scheme'} applies here. The DISCOM still bills the full tariff `
        + `above and the state reimburses it, which is why this shows as a deduction rather than as a `
        + `lower rate — and why the subsidy can be withdrawn without any tariff order changing.`,
    };
  }

  totals.push({ k: 'Net current bill', v: money(b.currentNet), mark: 'net-current-bill', sub: true });
  live.netCurrentBill = {
    formula: b.subsidyAmount > 0
      ? 'Net current bill = current charges − subsidy'
      : 'Net current bill = ' + join(charges.map(c => (c.credit ? '−' : '+') + ' ' + c.k.toLowerCase())),
    calc: b.subsidyAmount > 0
      ? [`${money(b.currentGross)} − ${money(b.subsidyAmount)}`]
      : [join(charges.map(c => (c.credit ? '−' : '+') + ' ' + c.v.replace(/^− /, '')))],
    result: money(b.currentNet),
    note: `THIS MONTH ONLY — it is not what you owe. Across ${num(b.units, 2)} units it works out to `
      + `${money(b.currentNet)} ÷ ${num(b.units, 2)} = ${rate2(b.units > 0 ? b.currentNet / b.units : 0)} `
      + `all-in per unit, always above the slab rate. This is the figure to compare month to month; the `
      + `total payable below mixes in old dues and would tell you the wrong story about your usage.`,
  };

  if (b.arrears > 0) {
    totals.push({ k: 'Arrears', v: money(b.arrears), mark: 'arrears' });
    live.arrears = {
      result: money(b.arrears),
      note: 'Carried forward from earlier bills. It is not part of this month’s consumption and '
        + 'should not be read as such when you compare months.',
    };
  }
  const lpsc = (b.arrearLpsc || 0) + (b.currentLpsc || 0);
  if (lpsc > 0) {
    totals.push({ k: 'Late payment surcharge', v: money(lpsc), mark: 'lpsc' });
    live.lpsc = {
      formula: 'LPSC = arrears × surcharge rate % per month',
      calc: [`${money(b.arrears)} × ${pct(b.lpscRate)}`],
      result: money(lpsc),
      note: 'It compounds while the arrear is outstanding. Paying by the due date removes this line '
        + 'entirely — it is the one charge on the bill that is purely optional.',
    };
  }
  if (b.totalPayments > 0) {
    totals.push({ k: 'Payments received', v: '− ' + money(b.totalPayments), credit: true });
  }
  totals.push({ k: 'Total payable', v: money(b.totalPayable), mark: 'total-payable', grand: true });

  const netCalc = [`${money(b.currentNet)} net current bill`];
  if (b.arrears > 0) netCalc.push(`+ ${money(b.arrears)} arrears`);
  if (lpsc > 0) netCalc.push(`+ ${money(lpsc)} surcharge`);
  if (b.totalPayments > 0) netCalc.push(`− ${money(b.totalPayments)} paid`);
  live.totalPayable = {
    formula: 'Total payable = net current bill + arrears + surcharge − payments already credited',
    calc: [netCalc.join(' ')],
    result: money(b.totalPayable),
    note: (b.arrears > 0 || lpsc > 0
        ? 'Different from the net current bill above because old dues are in it. '
        : 'Equal to the net current bill above only because nothing is carried forward on this bill. ')
      + 'Pay the full amount: a part payment does not stop the surcharge accruing on the remainder.',
  };

  // Prompt-payment rebate — only where the DISCOM's own schedule documents one. There is no
  // generic rate to fall back on, and inventing one would put a fake discount on the page.
  if (scenario.rebate) {
    const R = scenario.rebate;
    const amount = R.type === 'per_unit'
      ? +(b.units * R.rate).toFixed(2)
      : +(b.totalEnergy * R.rate / 100).toFixed(2);
    const payByDue = Math.round(b.totalPayable - amount);
    totals.push({ k: `Rebate if paid by ${P.due}`, v: '− ' + money(amount), mark: 'due-date-rebate', credit: true });
    totals.push({ k: 'Payable on or before due date', v: money(payByDue), grand: true });
    live.dueDateRebate = {
      formula: R.type === 'per_unit'
        ? 'Rebate = units × rebate rate per unit'
        : 'Rebate = energy charge × rebate rate %',
      calc: [R.type === 'per_unit'
        ? `${num(b.units, 2)} × ${rate2(R.rate)}`
        : `${money(b.totalEnergy)} × ${pct(R.rate)}`],
      result: '− ' + money(amount),
      note: `${R.label} Pay on or before ${P.due} and you owe ${money(payByDue)} instead of `
        + `${money(b.totalPayable)}. Miss it and you lose the rebate AND start accruing late payment `
        + `surcharge — the due date is worth two separate amounts of money, not one.`,
    };
  }

  const source = {
    label: b.tariffAsOf || b.tariffPeriodLabel || '',
    verified: !!b.tariffVerified,
    url: b.tariffSourceUrl || '',
    discom: b.discom ? (b.discom.fullName || b.discom.name) : '',
  };

  return { account, period, reading, slabs, charges, totals, live, source };
}

// ─── markup ───────────────────────────────────────────────────────────────────
// Also shared between build and runtime, for the same reason the arithmetic is: the served
// HTML and the hydrated HTML have to be the same markup, or the page rewrites itself in
// front of the reader on load and Googlebot indexes whichever it happens to see.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
    const c = [r.mark ? 'is-marked' : '', r.credit ? 'is-credit' : '', r.grand ? 'is-grand' : '']
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
  const accountBlock = block('Account', r.account, counter);
  const periodBlock = block('Billing period', r.period, counter, 'bill-block-period');
  const readingBlock = block('Meter reading', r.reading, counter, 'bill-block-reading');
  const chargesBlock = block('Charges', r.charges, counter, 'bill-block-charges');
  const totalsBlock = block('Amount payable', r.totals, counter, 'bill-block-total');

  const slabRows = r.slabs.map(s =>
    `<tr><td>${esc(s.label)}</td><td class="num">${esc(s.units)}</td>`
    + `<td class="num">${esc(s.rate)}</td><td class="num">${esc(s.amount)}</td></tr>`).join('');

  const src = r.source.label
    ? `<p class="bill-source">${esc(r.source.label)}`
      + (r.source.verified
        ? ` <span class="bill-badge is-ok">Verified against the order</span>`
        : ` <span class="bill-badge">Representative rates</span>`)
      + (r.source.url ? ` · <a href="${esc(r.source.url)}" target="_blank" rel="noopener">Source</a>` : '')
      + `</p>`
    : '';

  const html = `
        <div class="bill-doc-head">
          <div class="bill-doc-id">
            <strong class="bill-doc-title">${esc(r.source.discom || 'Electricity Distribution Company')}</strong>
            <span class="bill-doc-sub">Illustration · not a real bill</span>
          </div>
          <span class="bill-doc-stamp">Sample</span>
        </div>
        ${accountBlock}
        ${periodBlock}
        ${readingBlock}
        <section class="bill-block bill-block-slabs">
          <h4>Slab ladder behind the energy charge</h4>
          <div class="bill-scroll"><table class="bill-slabs">
            <thead><tr><th scope="col">Slab</th><th scope="col">Units</th><th scope="col">Rate</th><th scope="col">Amount</th></tr></thead>
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
  if (live.formula) parts.push(`<div class="ub-calc-formula">${esc(live.formula)}</div>`);
  if (live.calc && live.calc.length) {
    parts.push(`<div class="ub-calc-work">`
      + live.calc.map(c => `<span class="ub-calc-step">${esc(c)}</span>`).join('')
      + `</div>`);
  }
  if (live.result) {
    parts.push(`<div class="ub-calc-result"><span class="ub-calc-eq" aria-hidden="true">=</span>`
      + `<span class="sr-only">Result</span>${esc(live.result)}</div>`);
  }
  const calc = parts.length ? `<div class="ub-calc">${parts.join('')}</div>` : '';
  const note = live.note ? `<p class="ub-live-note">${esc(live.note)}</p>` : '';
  return calc + note;
}
