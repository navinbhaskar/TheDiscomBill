// bill-anatomy.js — turns an engine result into the rows and readouts /understand-your-bill/
// displays.
//
// Imported by BOTH generate-seo.js (to render the default scenario into the served HTML) and
// js/understand-bill.js (to re-render when the reader changes an input). That is the whole
// reason it exists as its own module: if the build-time markup and the runtime markup came
// from two implementations they would drift, and the drift would show up as the page visibly
// rewriting itself on load. One function, two callers, identical output.
//
// It contains no strings that need translating and no DOM — just arithmetic and formatting.

/**
 * The scenarios the DISCOM selector offers — structure only; their labels and notes live in
 * understand-bill-content.js, which is a build-time module and never reaches the browser.
 *
 * Chosen for STRUCTURAL variety, not popularity. Between them they exercise every shape the
 * bill can take, which is the whole point of letting the reader switch:
 *   uppcl-domestic   two slabs, percent-of-total Electricity Duty, no wheeling
 *   msedcl-domestic  a separate Wheeling Charge line, and ED levied on energy only
 *   kseb-domestic    five narrow slabs and no additional charges at all
 *   uppcl-commercial demand-billed: fixed charge on recorded MD, plus an excess-demand penalty
 */
export const SCENARIOS = [
  {
    id: 'uppcl-domestic',
    discomId: 'mvvnl', categoryId: 'domestic', supplyTypeId: '10B',
    units: 250, connectedLoadKw: 2,
    consumerNo: '1234 5678 9012', meterNo: 'MV 4471 2208', phase: 'Single phase',
  },
  {
    id: 'msedcl-domestic',
    discomId: 'msedcl', categoryId: 'domestic', supplyTypeId: '',
    units: 250, connectedLoadKw: 2,
    consumerNo: '0210 4455 6677', meterNo: 'MS 9032 5514', phase: 'Single phase',
  },
  {
    id: 'kseb-domestic',
    discomId: 'kseb', categoryId: 'domestic', supplyTypeId: 'single_phase',
    units: 250, connectedLoadKw: 2,
    consumerNo: '1195 3320 8841', meterNo: 'KS 2210 7743', phase: 'Single phase',
  },
  {
    id: 'uppcl-commercial',
    discomId: 'mvvnl', categoryId: 'commercial', supplyTypeId: '20HV',
    units: 800, connectedLoadKw: 8, billedDemandKw: 9,
    consumerNo: '5566 1234 8890', meterNo: 'MV 7781 0043', phase: 'Three phase',
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

/** Fixed dates, so the served HTML is byte-stable across rebuilds and diffs stay readable. */
const BILL_DATE = '05-08-2026';
const DUE_DATE = '20-08-2026';
const PERIOD = '01-07-2026 to 31-07-2026';

/** The arrears/LPSC/payment overlay the "messy bill" toggle adds. */
export const MESSY = { arrears: 1240, lpscRate: 1.25, currentLpscMonths: 0, payment: 500 };

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
  };
  // Recorded MD only matters on a demand-billed category. The scenario carries it as an
  // offset from its own default load so that dragging the load slider keeps the overshoot
  // — otherwise raising the load would silently make the penalty vanish, which is the one
  // thing this scenario exists to demonstrate.
  if (scenario.billedDemandKw != null) {
    input.billedDemandKw = +(load + (scenario.billedDemandKw - scenario.connectedLoadKw)).toFixed(2);
  }
  if (messy) {
    input.arrears = MESSY.arrears;
    input.lpscRate = MESSY.lpscRate;
    input.arrearLpsc = +(MESSY.arrears * MESSY.lpscRate / 100).toFixed(2);
    input.payments = [{ label: 'Part payment', amount: MESSY.payment }];
  }
  return input;
}

/** The one extra charge that gets its own annotated row; everything else rides along generically. */
const isDuty = (c) => /duty/i.test(c.name || '');

/**
 * @param {Object} b       result of calculateBill()
 * @param {Object} scenario entry from SCENARIOS
 * @returns {{header:Array, reading:Array, slabs:Array, charges:Array, totals:Array, live:Object, source:Object}}
 *   `live` is keyed by the `live` field of LINES; a key that is absent means that line is not
 *   on this bill and its explanation renders the "not charged here" note instead.
 */
export function readout(b, scenario) {
  const live = {};
  const duty = (b.extraCharges || []).find(isDuty);
  const otherExtras = (b.extraCharges || []).filter(c => !isDuty(c));

  const dUnit = b.demandUnit || 'kW';
  const lastRate = b.slabBreakdown && b.slabBreakdown.length
    ? b.slabBreakdown[b.slabBreakdown.length - 1].rate : 0;
  const avgRate = b.units > 0 ? b.totalEnergy / b.units : 0;
  const fixedBasis = b.isDemandBilled ? b.billingDemand : b.connectedLoadKw;
  const fixedRate = fixedBasis > 0 ? b.fixedCharge / fixedBasis : 0;

  // ── header ────────────────────────────────────────────────────────────────
  const catName = b.category ? b.category.name : '';
  const tariffLabel = b.supplyTypeName ? `${catName} · ${b.supplyTypeName}` : catName;
  live.tariffCategory = `${tariffLabel}. Every rate on this bill follows from that one code.`;
  live.sanctionedLoad = b.isDemandBilled
    ? `${num(b.connectedLoadKw, 2)} ${dUnit} sanctioned, against ${num(b.billedDemandKw, 2)} ${dUnit} actually recorded. `
      + `The fixed charge is billed on the recorded figure, not the sanctioned one.`
    : `${num(b.connectedLoadKw, 2)} ${dUnit}, which is what the ${money(b.fixedCharge)} fixed charge below is levied on `
      + `— ${rate2(fixedRate)} per ${dUnit} a month.`;

  const header = [
    { k: 'Consumer number', v: scenario.consumerNo, mark: 'consumer-no' },
    { k: 'Consumer name', v: 'A. Kumar' },
    { k: 'Address', v: '14, MG Road (address is invented)' },
    { k: 'Tariff category', v: tariffLabel, mark: 'tariff-category' },
    { k: 'Sanctioned load', v: `${num(b.connectedLoadKw, 2)} ${dUnit}`, mark: 'sanctioned-load' },
    { k: 'Meter number', v: scenario.meterNo },
    { k: 'Connection', v: scenario.phase },
  ];
  const summary = [
    { k: 'Bill date', v: BILL_DATE },
    { k: 'Due date', v: DUE_DATE },
    { k: 'Billing period', v: PERIOD },
    { k: 'Bill number', v: 'ILLUSTRATIVE / NOT A BILL' },
  ];

  // ── meter reading ─────────────────────────────────────────────────────────
  // Back-computed from the units so the subtraction on the page actually checks out.
  const present = 14820;
  const previous = +(present - b.units).toFixed(0);
  const reading = [
    { k: 'Previous', v: num(previous) },
    { k: 'Present', v: num(present) },
    { k: 'Multiplying factor', v: '1' },
    { k: 'Units consumed', v: `${num(b.units, 2)} ${b.energyUnit || 'kWh'}`, mark: 'units-consumed' },
  ];
  live.unitsConsumed = `${num(b.units, 2)} units over ${b.billingPeriodDays || 30} days `
    + `— about ${num(b.units / (b.billingPeriodDays || 30), 1)} units a day. `
    + `${num(present)} − ${num(previous)} = ${num(b.units, 2)}, times a meter constant of 1.`;

  // ── slab ladder ───────────────────────────────────────────────────────────
  const slabs = (b.slabBreakdown || []).map(s => ({
    label: s.label, units: num(s.units, 2), rate: rate2(s.rate), amount: money(s.amount),
  }));
  live.energyCharge = slabs.length > 1
    ? `${money(b.totalEnergy)} for ${num(b.units, 2)} units, across ${slabs.length} slabs. `
      + `The last unit cost ${rate2(lastRate)}, but the average across the whole bill is `
      + `${rate2(avgRate)} — that gap is the telescopic ladder at work.`
    : `${money(b.totalEnergy)} for ${num(b.units, 2)} units at ${rate2(avgRate)} a unit — a single slab, no ladder.`;

  // ── charges ───────────────────────────────────────────────────────────────
  const charges = [];
  charges.push({ k: 'Energy charge', v: money(b.totalEnergy), mark: 'energy-charge' });
  charges.push({
    k: b.isDemandBilled ? 'Demand / fixed charge' : 'Fixed charge',
    v: money(b.fixedCharge), mark: 'fixed-charge',
  });
  live.fixedCharge = b.isDemandBilled
    ? `${money(b.fixedCharge)} — ${rate2(fixedRate)} per ${dUnit} on ${num(b.billingDemand, 2)} ${dUnit} of billed demand. `
      + `On this category the charge follows the demand the meter recorded, so it moves month to month.`
    : `${money(b.fixedCharge)} — ${rate2(fixedRate)} per ${dUnit} on ${num(b.connectedLoadKw, 2)} ${dUnit} of sanctioned load. `
      + `Set the units to zero above and this line is all that remains.`;

  if (b.excessDemandPenalty > 0) {
    charges.push({ k: 'Excess demand penalty', v: money(b.excessDemandPenalty), mark: 'excess-demand' });
    live.excessDemand = `${money(b.excessDemandPenalty)} — the meter recorded ${num(b.billedDemandKw, 2)} ${dUnit} `
      + `against a sanctioned ${num(b.connectedLoadKw, 2)} ${dUnit}, an overshoot of ${num(b.excessDemand, 2)} ${dUnit}. `
      + `Raise the sanctioned load above and watch this line disappear.`;
  }
  if (b.facAmount > 0) {
    charges.push({ k: 'Fuel surcharge (FPPA)', v: money(b.facAmount), mark: 'fppa' });
    live.fppa = b.facMode === 'percent'
      ? `${money(b.facAmount)} at ${num(b.facRate, 2)}% of the energy charge.`
      : `${money(b.facAmount)} at ${rate2(b.facRate)} per unit on ${num(b.units, 2)} units.`;
  }
  if (b.wheelingCharge > 0) {
    charges.push({ k: b.wheelingLabel || 'Wheeling charge', v: money(b.wheelingCharge), mark: 'wheeling' });
    live.wheeling = `${money(b.wheelingCharge)}`
      + (b.wheelingType === 'per_unit'
        ? ` at ${rate2(b.wheelingRate)} per unit on ${num(b.units, 2)} units.`
        : ` at ${rate2(b.wheelingRate)} per ${dUnit} on ${num(b.connectedLoadKw, 2)} ${dUnit}.`)
      + ` This state unbundles the cost of the wires from the cost of the power.`;
  }
  for (const c of otherExtras) {
    charges.push({ k: c.name, v: money(c.amount) });
  }
  if (duty) {
    charges.push({ k: duty.name, v: money(duty.amount), mark: 'electricity-duty' });
    const base = duty.type === 'percent_energy' ? 'the energy charge only'
      : duty.type === 'percent_total' ? 'the whole bill, fixed charge included'
      : 'the units consumed';
    live.electricityDuty = `${money(duty.amount)} at ${num(duty.rate, 2)}`
      + (duty.type === 'per_unit' ? ' paise per unit' : '%') + ` on ${base}. `
      + `Switch DISCOM above and the base changes with it — that is a state-by-state decision, not a rate difference.`;
  }
  if (b.subsidyAmount > 0) {
    charges.push({ k: b.subsidyLabel || 'Subsidy', v: '− ' + money(b.subsidyAmount), mark: 'subsidy', credit: true });
    live.subsidy = `A credit of ${money(b.subsidyAmount)}. The DISCOM still bills the full tariff above; `
      + `the state reimburses it, which is why it shows as a deduction rather than a lower rate.`;
  }
  if (b.minChargeTopUp > 0) {
    charges.push({ k: 'Minimum charge top-up', v: money(b.minChargeTopUp) });
  }

  // ── totals ────────────────────────────────────────────────────────────────
  const totals = [{ k: 'Current bill amount', v: money(b.currentNet), mark: 'current-bill' }];
  live.currentBill = `${money(b.currentNet)} for this month alone. `
    + `Across ${num(b.units, 2)} units that works out to ${rate2(b.units > 0 ? b.currentNet / b.units : 0)} `
    + `all-in per unit — the number worth comparing month to month, and always above the slab rate.`;

  if (b.arrears > 0) {
    totals.push({ k: 'Arrears', v: money(b.arrears), mark: 'arrears' });
    live.arrears = `${money(b.arrears)} carried forward from earlier bills. `
      + `It is not part of this month's consumption and should not be read as such.`;
  }
  const lpsc = (b.arrearLpsc || 0) + (b.currentLpsc || 0);
  if (lpsc > 0) {
    totals.push({ k: 'Late payment surcharge', v: money(lpsc), mark: 'lpsc' });
    live.lpsc = `${money(lpsc)} at ${num(b.lpscRate, 2)}% a month on the arrear. `
      + `Paying by the due date removes this line entirely — it is the one charge here that is purely optional.`;
  }
  if (b.totalPayments > 0) {
    totals.push({ k: 'Payments received', v: '− ' + money(b.totalPayments), credit: true });
  }
  totals.push({ k: 'Net payable', v: money(b.totalPayable), mark: 'net-payable', grand: true });
  live.netPayable = `${money(b.totalPayable)}. `
    + (b.arrears > 0 || lpsc > 0
      ? `That is ${money(b.currentNet)} for this month plus ${money(b.arrears + lpsc)} of old dues and surcharge`
        + (b.totalPayments > 0 ? `, less ${money(b.totalPayments)} already paid.` : '.')
      : `Nothing is carried forward on this bill, so it equals the current bill amount above.`);

  const source = {
    label: b.tariffAsOf || b.tariffPeriodLabel || '',
    verified: !!b.tariffVerified,
    url: b.tariffSourceUrl || '',
    discom: b.discom ? (b.discom.fullName || b.discom.name) : '',
  };

  return { header, summary, reading, slabs, charges, totals, live, source };
}

// ─── markup ───────────────────────────────────────────────────────────────────
// Also shared between build and runtime, for the same reason the arithmetic is: the served
// HTML and the hydrated HTML have to be the same markup, or the page rewrites itself in
// front of the reader on load and Googlebot indexes whichever it happens to see.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Marker numbers are assigned in document order, so they read 1,2,3… down the page. */
function marker(mark, k, n) {
  return `<a class="bill-mark" href="#explain-${mark}" id="mark-${mark}"`
    + ` aria-label="${esc('What is ' + k + '?')}">${n}</a>`;
}

function dlBlock(title, rows, counter) {
  const items = rows.map(r => {
    const m = r.mark ? ' ' + marker(r.mark, r.k, counter.next(r.mark)) : '';
    return `<div class="bill-field"${r.mark ? ` data-line="${r.mark}"` : ''}>`
      + `<dt>${esc(r.k)}${m}</dt><dd>${esc(r.v)}</dd></div>`;
  }).join('');
  return `<section class="bill-block"><h4>${esc(title)}</h4><dl class="bill-fields">${items}</dl></section>`;
}

function lineTable(title, rows, counter, cls) {
  const body = rows.map(r => {
    const m = r.mark ? ' ' + marker(r.mark, r.k, counter.next(r.mark)) : '';
    const c = [r.credit ? 'is-credit' : '', r.grand ? 'is-grand' : ''].filter(Boolean).join(' ');
    return `<tr${c ? ` class="${c}"` : ''}${r.mark ? ` data-line="${r.mark}"` : ''}>`
      + `<th scope="row">${esc(r.k)}${m}</th><td class="num">${esc(r.v)}</td></tr>`;
  }).join('');
  return `<section class="bill-block ${cls}"><h4>${esc(title)}</h4>`
    + `<table class="bill-lines"><tbody>${body}</tbody></table></section>`;
}

/**
 * @returns {{html:string, marks:Object}} `marks` maps a line id to the number printed on the
 *   bill, so the explanation list downstream can show the same digit.
 */
export function billHtml(r) {
  const marks = {};
  let n = 0;
  const counter = { next(id) { marks[id] = ++n; return n; } };

  // Numbering follows DOCUMENT order, so these are built in the order they appear on the
  // page rather than in the order the template happens to interpolate them. Computing the
  // reading row first — the obvious way to write this — silently handed marker 1 to "units
  // consumed", three rows below the consumer number that visually reads first.
  const headBlock = dlBlock('Consumer details', r.header, counter);
  const summaryBlock = dlBlock('Bill summary', r.summary, counter);

  const readTh = ['Previous', 'Present', 'Multiplying factor', 'Units consumed'];
  const readCells = r.reading.map((c) => {
    const m = c.mark ? ' ' + marker(c.mark, c.k, counter.next(c.mark)) : '';
    return `<td${c.mark ? ` data-line="${c.mark}" class="num is-marked"` : ' class="num"'}>${esc(c.v)}${m}</td>`;
  }).join('');

  const slabRows = r.slabs.map(s =>
    `<tr><td>${esc(s.label)}</td><td class="num">${esc(s.units)}</td>`
    + `<td class="num">${esc(s.rate)}</td><td class="num">${esc(s.amount)}</td></tr>`).join('');

  const src = r.source.label
    ? `<p class="bill-source">${esc(r.source.discom)} · ${esc(r.source.label)}`
      + (r.source.verified
        ? ` <span class="bill-badge is-ok">Verified against the tariff order</span>`
        : ` <span class="bill-badge">Representative rates, not yet line-by-line verified</span>`)
      + (r.source.url ? ` · <a href="${esc(r.source.url)}" target="_blank" rel="noopener">Source</a>` : '')
      + `</p>`
    : '';

  const html = `
      <div class="bill-doc-head">
        <div>
          <strong class="bill-doc-title">${esc(r.source.discom || 'Electricity Distribution Company')}</strong>
          <span class="bill-doc-sub">Electricity bill · this is an illustration, not a real bill</span>
        </div>
        <span class="bill-doc-stamp">Sample</span>
      </div>
      <div class="bill-grid">
        ${headBlock}
        ${summaryBlock}
      </div>
      <section class="bill-block">
        <h4>Meter reading</h4>
        <div class="bill-scroll"><table class="bill-reading">
          <thead><tr>${readTh.map(t => `<th scope="col">${esc(t)}</th>`).join('')}</tr></thead>
          <tbody><tr>${readCells}</tr></tbody>
        </table></div>
      </section>
      <section class="bill-block">
        <h4>How the energy charge was built</h4>
        <div class="bill-scroll"><table class="bill-slabs">
          <thead><tr><th scope="col">Slab</th><th scope="col">Units</th><th scope="col">Rate</th><th scope="col">Amount</th></tr></thead>
          <tbody>${slabRows}</tbody>
        </table></div>
      </section>
      ${lineTable('Charges', r.charges, counter, 'bill-block-charges')}
      ${lineTable('Amount payable', r.totals, counter, 'bill-block-total')}
      ${src}`;

  return { html, marks };
}
