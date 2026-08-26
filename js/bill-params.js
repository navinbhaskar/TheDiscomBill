// js/bill-params.js — one definition of what a saved-bill query string means.
//
// A bill's inputs travel as a share-link query (`?state=…&discom=…&units=…`), produced by
// buildShareUrl(). Two things read that query back:
//
//   ui.js loadFromUrl()  — fills the calculator form, so the user can edit and recalculate
//   bill-view.js         — computes the bill directly, with no form on the page
//
// Both used to be impossible without a second parser, and a second parser is how a bill
// *viewed* and the same bill *opened* end up disagreeing about the total — the one failure
// this site cannot afford. So the key names, the base64 `q=` legacy form and the type
// coercion live here once, and both callers consume the result.
//
// This module is deliberately pure: no DOM, no engine import, no side effects. It turns a
// query string into a plain object and nothing else.

/** Legacy share links wrapped the whole query in base64 under `q`. Still decoded. */
function unwrap(search) {
  let p = new URLSearchParams(search ?? '');
  if (p.has('q')) {
    try { p = new URLSearchParams(atob(p.get('q'))); } catch { /* keep the outer params */ }
  }
  return p;
}

const num = (v, dflt = 0) => {
  if (v == null || v === '') return dflt;
  const n = Number(v);
  return Number.isFinite(n) ? n : dflt;
};

/**
 * Parse a saved-bill query string into normalised inputs.
 *
 * @param {string|URLSearchParams} search  `location.search`, or a stored params string.
 * @returns {Object|null} null when the query carries no state — i.e. it is not a bill link.
 */
export function paramsToInputs(search) {
  const p = search instanceof URLSearchParams ? search : unwrap(search);
  if (!p.get('state')) return null;   // every bill link starts with a state

  return {
    // identity of the tariff
    state:        p.get('state'),
    discomId:     p.get('discom') || '',
    categoryId:   p.get('cat') || '',
    supplyTypeId: p.get('st') || '',

    // billing period. `month`/`year` pin the tariff year and the FPPA month, which is why an
    // old bill reopens at its own rates rather than today's.
    billingMonth: p.get('month') || '',
    billingYear:  p.get('year') || '',
    fromDate:     p.get('fd') || '',
    toDate:       p.get('td') || '',

    // consumption. Per-meter rows are not serialised — the link carries the effective total.
    units:            p.get('units') === '' || p.get('units') == null ? null : num(p.get('units')),
    connectedLoadKw:  num(p.get('load')),
    billedDemandKw:   p.get('bd') ? num(p.get('bd')) : null,
    billingBasis:     p.get('basis') || '',
    meterMode:        p.get('mmode') === 'tod' ? 'tod' : 'normal',
    todUnits: p.get('mmode') === 'tod'
      ? { peak: num(p.get('todp')), normal: num(p.get('todn')), offPeak: num(p.get('todop')) }
      : null,

    // solar
    netMetering:         p.get('nm') === '1',
    exportUnits:         num(p.get('exp')),
    openingCreditUnits:  num(p.get('cr')),

    // surcharges and dues
    facRate:           num(p.get('fac')),
    facMode:           p.get('facm') || '',
    arrears:           num(p.get('arr')),
    arrearLpsc:        num(p.get('arrlpsc')),
    lpscRate:          num(p.get('lpsc')),
    currentLpscMonths: num(p.get('curmo')),
    // Serialised only when OFF, so absence means on. Matches loadFromUrl, which acts on '0'.
    lpscApplicable:    p.get('lpscon') !== '0',

    // personal details — present only on the user's own saved bills, never on a shared link
    consumerName: p.get('name') || '',
    accountNo:    p.get('acc') || '',
    address:      p.get('addr') || '',
    meterNo:      p.get('meter') || '',
  };
}

/**
 * The billing date the engine should price against: the 15th of the saved month, matching
 * how the calculator derives it. Falls back to today when the link predates month/year.
 */
export function billingDateFrom(inputs) {
  const y = inputs.billingYear, m = inputs.billingMonth;
  if (!y || !m) return new Date().toISOString().slice(0, 10);
  return `${y}-${String(m).padStart(2, '0')}-15`;
}

/** Whole months between two ISO dates, else 30 — the calculator's own default. */
export function periodDaysFrom(inputs) {
  const { fromDate, toDate } = inputs;
  if (!fromDate || !toDate) return 30;
  const d = (new Date(toDate) - new Date(fromDate)) / 86400000;
  return Number.isFinite(d) && d > 0 ? Math.round(d) + 1 : 30;
}
