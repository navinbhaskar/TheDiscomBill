// js/tariffs/surcharge-terms.js
// What each jurisdiction actually CALLS its fuel surcharge.
//
// The mechanism is the same everywhere — recover the gap between the power-purchase cost the
// regulator approved and what the utility actually paid — but the name is not. A Maharashtra
// consumer reads "FAC" on their bill and searches "MSEDCL FAC"; a Delhi consumer reads
// "PPAC"; a UP consumer reads "FPPAS". Labelling all of them "FPPA" makes the reader do the
// translation, and it makes the page compete for a term nobody in that state types.
//
// This is display vocabulary ONLY. It never touches how the surcharge is computed: the rate,
// the mode (percent vs per-unit) and the billing window all still come from fppa.js. Renaming
// a charge must not change a bill.
//
// ── Rule for adding an entry ─────────────────────────────────────────────────
// Use the term the REGULATOR or the DISCOM uses in its own notices, and record where it came
// from. Do not infer a state's term from its neighbours and do not translate one acronym into
// another: FPPCA, FPPAS and FAC are not interchangeable, they are different jurisdictions'
// names for a similar mechanism. An unlisted state falls back to the generic term below,
// which is correct-but-generic rather than confidently wrong.

/** Used when a jurisdiction has no recorded term of its own. */
export const GENERIC_TERM = {
  code: 'FPPA',
  full: 'Fuel and Power Purchase Adjustment',
  generic: true,
};

/**
 * State name → term. `discoms` optionally overrides per DISCOM id, for states where
 * licensees differ (none yet, but Delhi's three are all DERC-regulated under one name).
 *
 * code    — the short form as printed on the bill / in the notice
 * full    — what the acronym expands to, in that jurisdiction's own wording
 * also    — other forms the same jurisdiction uses interchangeably (for copy + search)
 * regulator, sourceUrl, verifiedOn — provenance, same discipline as the rate data
 */
export const SURCHARGE_TERMS = {
  'Delhi': {
    // DERC's orders say PPAC; BSES's own consumer page is headed "Fuel & Power Purchase
    // Adjustment Charges" and its rate table is labelled FPPAS. Both appear on real Delhi
    // bills, so PPAC leads and FPPAS is carried alongside it.
    code: 'PPAC',
    full: 'Power Purchase Adjustment Cost',
    also: ['FPPAS'],
    regulator: 'DERC',
    sourceUrl: 'https://www.bsesdelhi.com/web/brpl/fuel-power-purchase-adjustment-charges',
    verifiedOn: '2026-08-17',
  },
  'Uttar Pradesh': {
    code: 'FPPAS',
    full: 'Fuel and Power Purchase Adjustment Surcharge',
    regulator: 'UPERC',
    sourceUrl: 'https://www.uperc.org',
    verifiedOn: '2026-08-17',
  },
  'Rajasthan': {
    // RERC levies a single "Regulatory Surcharge" of which FPPAS is a component, so the
    // consumer-facing line is the surcharge, not FPPAS. Naming it FPPAS here would not match
    // the bill. See the long note in fppa.js for why the two are not additive.
    code: 'Regulatory Surcharge',
    full: 'Regulatory Surcharge (a combination including Fuel and Power Purchase Adjustment Surcharge)',
    also: ['FPPAS'],
    regulator: 'RERC',
    sourceUrl: 'https://rerc.rajasthan.gov.in',
    verifiedOn: '2026-08-19',
  },
  'Maharashtra': {
    // MERC publishes these monthly under "Fuel Adjustment Charges"; MSEDCL's own consumer
    // page calls it "Fuel Adjustment Cost". FPPCA appears in MERC's tariff orders for the
    // same mechanism, so it is carried as an alternate rather than as the headline.
    code: 'FAC',
    full: 'Fuel Adjustment Charge',
    also: ['FPPCA', 'Fuel Adjustment Cost'],
    regulator: 'MERC',
    sourceUrl: 'https://merc.gov.in/fuel-adjustment-charges-type/maharashtra-state-electricity-distribution-co-ltd-msedcl/',
    verifiedOn: '2026-08-19',
  },
};

/**
 * The term for a jurisdiction. Falls back to the generic one, flagged `generic: true` so a
 * caller can choose to say "fuel surcharge" in prose rather than assert an acronym the state
 * may not use.
 *
 * @param {string} state     state name as used by the tariff registry
 * @param {string} [discomId] optional DISCOM id, for future per-licensee overrides
 */
export function surchargeTerm(state, discomId) {
  const t = SURCHARGE_TERMS[state];
  if (!t) return GENERIC_TERM;
  if (discomId && t.discoms && t.discoms[discomId]) {
    return { ...t, ...t.discoms[discomId], generic: false };
  }
  return { ...t, generic: false };
}

/**
 * Short display label, e.g. "FAC" for Maharashtra, "FPPA" everywhere unrecorded.
 */
export const surchargeCode = (state, discomId) => surchargeTerm(state, discomId).code;

/**
 * "FAC (Fuel Adjustment Charge)" — for a first mention. Collapses to just the code when the
 * code IS the full name, so Rajasthan does not render "Regulatory Surcharge (Regulatory
 * Surcharge …)".
 */
export function surchargeLabel(state, discomId) {
  const t = surchargeTerm(state, discomId);
  if (!t.full) return t.code;
  // Rajasthan's code IS a phrase ("Regulatory Surcharge") and its full form elaborates on it,
  // so bracketing one inside the other reads as a stutter. When the full form already opens
  // with the code, the full form alone is the label.
  if (t.full === t.code || t.full.startsWith(t.code)) return t.full;
  return `${t.code} (${t.full})`;
}

/** Every term a jurisdiction is known by — the headline code plus any alternates. */
export function surchargeAliases(state, discomId) {
  const t = surchargeTerm(state, discomId);
  return [t.code, ...(t.also || [])];
}
