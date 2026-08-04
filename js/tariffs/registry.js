// js/tariffs/registry.js
// The tariff registry: an index that is always present, plus per-state tariff tables that
// load on demand.
//
// This file used to statically import all 34 per-state modules. That made every page which
// touched the registry — including the homepage, via bill-ocr.js — download 38 modules and
// ~200 KB of slab tables to render a dropdown, for a visitor who will pick exactly one state.
//
// The split follows the shape of the data: `categories` (the slab/charge tables) is ~93% of
// the bytes and is not needed until a DISCOM is chosen. Everything else — state names, DISCOM
// names, service areas, tariff years, state metadata — is 13 KB and is needed immediately, so
// it lives in the generated index.js and is imported statically.
//
// USING THIS MODULE
//   • getStates(), getDiscoms(), findDiscom(), STATE_META, findStateMetaByDiscom() and the
//     date helpers work immediately — they read the index and need no await.
//   • Anything that reads a tariff (getCategories, getCategory, getSupplyTypes,
//     getEffectiveTariff, getDefault*) needs that state's data loaded first:
//         await ensureDiscom(discomId);   // or ensureState(state) / ensureAll()
//     Those accessors THROW if the data is missing rather than returning empty. In a billing
//     engine a silent empty result becomes a wrong bill; a thrown error is caught in tests.

import { STATE_SLUG, STATE_INFO, DISCOM_INDEX, STATES, DISCOM_STATE } from './index.js';

/**
 * State name -> array of DISCOM objects.
 *
 * Seeded from the index, so it is fully populated with DISCOM *metadata* from the first tick.
 * Each DISCOM gains its `categories` tariff tables when its state is loaded. The arrays and
 * objects are mutated in place rather than replaced, so a consumer that captured a reference
 * before loading (compare.js does) sees the tariff data appear on the objects it already has.
 */
export const TARIFF_DB = {};
/** State-level metadata (currentRatesFrom, verified, sourceUrl …). Complete from the index. */
export const STATE_META = {};

for (const state of STATES) {
  TARIFF_DB[state] = DISCOM_INDEX[state].map((d) => ({ ...d }));
  STATE_META[state] = { ...STATE_INFO[state], discoms: TARIFF_DB[state] };
}

// ─── On-demand loading ────────────────────────────────────────────────────────

/** States whose tariff tables have been merged in. */
const loaded = new Set();
/** In-flight loads, so ten concurrent callers share one request. */
const inflight = new Map();

/**
 * Vite/Rollup and plain-browser ESM both resolve this because the specifier is a template
 * over a known slug set; the slug comes from the generated index, never from user input.
 */
async function loadStateModule(state) {
  const slug = STATE_SLUG[state];
  if (!slug) throw new Error(`registry: unknown state "${state}"`);
  const mod = (await import(`./${slug}.js`)).default;
  // Merge tariff tables onto the existing DISCOM objects rather than replacing the array,
  // so references captured before the load stay valid.
  const byId = new Map(TARIFF_DB[state].map((d) => [d.id, d]));
  for (const src of mod.discoms) {
    const dst = byId.get(src.id);
    if (dst) Object.assign(dst, src);
    else TARIFF_DB[state].push({ ...src });      // a DISCOM added since the index was built
  }
  Object.assign(STATE_META[state], mod, { discoms: TARIFF_DB[state] });
  loaded.add(state);
}

/** @returns {boolean} Whether this state's tariff tables are in memory. */
export function isStateLoaded(state) { return loaded.has(state); }

/**
 * Load one state's tariff tables. Idempotent and safe to call concurrently.
 * @param {string} state
 * @returns {Promise<void>}
 */
export function ensureState(state) {
  if (loaded.has(state)) return Promise.resolve();
  if (!inflight.has(state)) {
    inflight.set(state, loadStateModule(state).finally(() => inflight.delete(state)));
  }
  return inflight.get(state);
}

/**
 * Load whichever state contains this DISCOM.
 * @param {string} discomId
 * @returns {Promise<void>}
 */
export function ensureDiscom(discomId) {
  const state = DISCOM_STATE[discomId];
  if (!state) return Promise.reject(new Error(`registry: unknown DISCOM "${discomId}"`));
  return ensureState(state);
}

/**
 * Load every state. For the few consumers that genuinely span the country — the comparison
 * tool, the tariff explorer, the static site build and the test suite.
 * @returns {Promise<void>}
 */
export function ensureAll() { return Promise.all(STATES.map(ensureState)).then(() => undefined); }

/**
 * Guard for the accessors below. Returning [] for an unloaded state would let a missing
 * `await` surface as a bill with no energy charge instead of an error, so this throws.
 */
function assertLoaded(discomId) {
  const state = DISCOM_STATE[discomId];
  if (state && !loaded.has(state)) {
    throw new Error(
      `registry: tariff data for "${state}" is not loaded — await ensureDiscom(${JSON.stringify(discomId)}) first`);
  }
}

/** @returns {string[]} Sorted list of all state/UT names. */
export function getStates() { return Object.keys(TARIFF_DB).sort(); }

/**
 * Get all DISCOMs in a state.
 * @param {string} state - State name.
 * @returns {Array<{id:string, name:string, fullName:string, area:string}>}
 */
export function getDiscoms(state) { return TARIFF_DB[state] || []; }

/**
 * Find a DISCOM object by its unique id across all states.
 * @param {string} discomId - DISCOM identifier.
 * @returns {Object|null} The DISCOM object, or null.
 */
export function findDiscom(discomId) {
  for (const state of Object.values(TARIFF_DB)) {
    const d = state.find(x => x.id === discomId);
    if (d) return d;
  }
  return null;
}

/**
 * @returns {Array} Categories for the given DISCOM.
 * @throws if the DISCOM's state has not been loaded — see the note at the top of this file.
 */
export function getCategories(discomId) {
  assertLoaded(discomId);
  const discom = findDiscom(discomId);
  return (discom && discom.categories) ? discom.categories : [];
}

/** @returns {Object|null} A single category object. */
export function getCategory(discomId, categoryId) {
  const cats = getCategories(discomId);
  return cats.find(c => c.id === categoryId) || null;
}

/** @returns {Array} Supply types within a category (may be empty). */
export function getSupplyTypes(discomId, categoryId) {
  const cat = getCategory(discomId, categoryId);
  return (cat && cat.supplyTypes) ? cat.supplyTypes : [];
}

/* ── Sensible defaults ─────────────────────────────────────────────────────────
   The form used to make the visitor answer every dropdown before showing a number,
   even though the data usually leaves them no real choice: 20 of 34 states have a
   single DISCOM, and all 65 DISCOMs have exactly one domestic category. These
   helpers pick the option a household visitor almost certainly wants, so Simple
   mode can pre-fill it and ask only for state + units.                          */

const DOMESTIC_RE   = /domestic|residential|lmv-?1\b/i;
const COMMERCIAL_RE = /commercial|non-?domestic|non-?residential|lmv-?2\b/i;

/**
 * The category a household visitor wants.
 * @param {string} discomId
 * @param {'domestic'|'commercial'} [kind='domestic']
 * @returns {Object|null} A category object, or null if the DISCOM is unknown.
 */
export function getDefaultCategory(discomId, kind = 'domestic') {
  const cats = getCategories(discomId);
  if (!cats.length) return null;
  if (kind === 'commercial') return cats.find(c => COMMERCIAL_RE.test(c.name)) || null;
  // Commercial names usually contain "Non-Domestic", which DOMESTIC_RE also matches, so a
  // domestic lookup has to rule the commercial pattern out first.
  const doms = cats.filter(c => DOMESTIC_RE.test(c.name) && !COMMERCIAL_RE.test(c.name));
  if (!doms.length) return cats[0];
  // KSEB is the one DISCOM that splits domestic in two, and lists the sub-500W band first —
  // taking [0] there would put an ordinary household on a band it doesn't qualify for.
  return doms.map((c, i) => ({ c, i, rank: categoryRank(c) }))
             .sort((a, b) => a.rank - b.rank || a.i - b.i)[0].c;
}

/* Ids follow a convention across the tariff files: the mainstream band is plain `domestic` /
   `residential`, and restricted bands carry a qualifier (`domestic_low`). Fall back to the
   name for files that don't follow it. */
const SMALL_BAND_RE = /life\s*-?\s*line|kutir|\bbpl\b|_low\b|\blow\b|<\s*\d|below\s*\d/i;

function categoryRank(c) {
  if (/^(domestic|residential)$/i.test(c.id)) return 0;
  if (SMALL_BAND_RE.test(`${c.id} ${c.name}`)) return 2;
  return 1;
}

/* Supply types are listed in tariff-order sequence, which puts the *subsidised* variant
   first — Bihar's DS list opens with Kutir Jyoti (BPL) and UP's LMV-1 list opens with
   ST-10A Urban Life Line (≤1 kW, ≤100 units). Blindly taking [0] therefore defaulted
   most visitors onto a tariff they are not eligible for. Rank instead: anything
   means-tested, unmetered or rural loses to the mainstream urban variant. */
const NICHE_SUPPLY_RE = /life\s*-?\s*line|kutir|\bbpl\b|unmetered|un-?metered/i;
const RURAL_SUPPLY_RE = /\brural\b/i;

function supplyTypeRank(st) {
  const s = `${st.id} ${st.name}`;
  if (NICHE_SUPPLY_RE.test(s)) return 2;   // means-tested / unmetered — never a safe guess
  if (RURAL_SUPPLY_RE.test(s)) return 1;   // plausible, but urban is the commoner case
  return 0;
}

/**
 * The supply type to pre-select within a category. Falls back to the first entry when
 * every option is equally niche, so this never returns null for a non-empty list.
 * @param {string} discomId
 * @param {string} categoryId
 * @returns {Object|null}
 */
export function getDefaultSupplyType(discomId, categoryId) {
  const types = getSupplyTypes(discomId, categoryId);
  if (!types.length) return null;
  // Stable: ties keep tariff-order sequence, so only the niche entries actually move.
  return types.map((st, i) => ({ st, i, rank: supplyTypeRank(st) }))
              .sort((a, b) => a.rank - b.rank || a.i - b.i)[0].st;
}

/**
 * Resolve the effective tariff object for a DISCOM + category + optional supply type.
 * If supply types exist, merges the selected supply type onto the category.
 * @param {string} discomId
 * @param {string} categoryId
 * @param {string} [supplyTypeId]
 * @returns {Object|null}
 */
export function getEffectiveTariff(discomId, categoryId, supplyTypeId) {
  const cat = getCategory(discomId, categoryId);
  if (!cat) return null;
  if (cat.supplyTypes && cat.supplyTypes.length > 0) {
    const st = supplyTypeId
      ? (cat.supplyTypes.find(s => s.id === supplyTypeId) || cat.supplyTypes[0])
      : cat.supplyTypes[0];
    return { ...st, categoryId: cat.id, categoryName: cat.name };
  }
  return { ...cat, categoryId: cat.id, categoryName: cat.name };
}

// ─── Historical (date-versioned) tariff resolution ──────────────────────────────

/**
 * Reverse lookup: find the state metadata object that contains the given DISCOM.
 * @param {string} discomId
 * @returns {Object|null}
 */
export function findStateMetaByDiscom(discomId) {
  // Index-backed, so this answers before any tariff data is loaded and without scanning.
  const state = DISCOM_STATE[discomId];
  return state ? (STATE_META[state] || null) : null;
}

/**
 * Parse an Indian financial year label (e.g. '2025-26') into the FY start date.
 * @param {string} tariffYear - e.g. '2025-26'
 * @returns {string|null} ISO date like '2025-04-01', or null.
 */
export function fyStart(tariffYear) {
  if (!tariffYear) return null;
  const m = String(tariffYear).match(/^(\d{4})/);
  return m ? `${m[1]}-04-01` : null;
}

/**
 * How far behind the current Indian financial year a tariffYear sits.
 *
 * Note what this does and does NOT claim. Many SERCs RETAIN rates — UPERC's July 2026 order
 * left every UP rate unchanged — so "behind" never means "wrong". It means we have not read
 * an order for the current FY, which is the only thing we can honestly assert. The audits
 * that have been done, though, found stale entries that matched no published order at all
 * (Tamil Nadu and Odisha both), so two years behind is worth saying out loud.
 *
 * @param {string} tariffYear - e.g. "2026-27".
 * @param {Date|string} [onDate] - Defaults to now; injectable so tests do not drift over time.
 * @returns {{fy: string|null, currentFy: string, yearsBehind: number|null}}
 */
export function tariffAge(tariffYear, onDate) {
  const d = onDate ? new Date(onDate) : new Date();
  // Indian FY starts 1 April: Jan-Mar still belongs to the FY that began the previous April.
  const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  const currentFy = `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
  const m = String(tariffYear || '').match(/^(\d{4})/);
  if (!m) return { fy: null, currentFy, yearsBehind: null };
  return { fy: String(tariffYear), currentFy, yearsBehind: startYear - Number(m[1]) };
}

const DEFAULT_CURRENT_FROM = '2024-04-01';

/**
 * Resolve a tariff to the rate set effective at a given billing date.
 * Supports rateHistory[] for historical billing; falls back to current rates.
 * @param {Object} tariff - Tariff object with optional rateHistory array.
 * @param {string|Date} billingDate - Billing date (ISO string or Date).
 * @param {string} [currentRatesFrom] - When current rates took effect.
 * @param {string} [currentLabel] - Label for the current rate period.
 * @returns {Object} Tariff with periodLabel, estimated flag, and effectiveFrom.
 */
export function resolveDatedTariff(tariff, billingDate, currentRatesFrom, currentLabel) {
  // Spread the whole tariff so non-rate config (demandUnit, excessDemand, excessDemandRate,
  // billingDemandFloorPct, …) carries through to the engine; only the date-versioned RATE fields
  // below are swapped per historical period.
  const currentSet = {
    ...tariff,
    fixedCharge:       tariff.fixedCharge,
    energySlabs:       tariff.energySlabs,
    additionalCharges: tariff.additionalCharges,
    excessDemandRate:  tariff.excessDemandRate,
    wheelingCharge:    tariff.wheelingCharge,
    fac:               tariff.fac,
  };

  // A tariff may self-declare its own effective-from / period label / estimated flag (e.g. one
  // supply type refreshed to a newer order or subsidy notification while the rest of the state
  // schedule is unchanged). Those win over the discom-level defaults; when unset, the current set
  // is treated as verified with the discom's FY label, exactly as before.
  const curFromStr = tariff.currentRatesFrom || currentRatesFrom || DEFAULT_CURRENT_FROM;
  const curLabel   = tariff.periodLabel || currentLabel || (tariff.tariffYear ? `FY ${tariff.tariffYear}` : 'Current rates');
  const curEstimated = !!tariff.estimated;

  if (!billingDate) {
    return { ...currentSet, periodLabel: curLabel, estimated: curEstimated, effectiveFrom: curFromStr };
  }
  const bd = billingDate instanceof Date ? billingDate : new Date(billingDate);
  if (isNaN(bd)) {
    return { ...currentSet, periodLabel: curLabel, estimated: curEstimated, effectiveFrom: curFromStr };
  }

  // Build dated candidate list (current + historical overrides)
  const candidates = [{
    from: new Date(curFromStr), label: curLabel, estimated: curEstimated, set: currentSet,
    effectiveFrom: curFromStr
  }];
  for (const h of (tariff.rateHistory || [])) {
    candidates.push({
      from: new Date(h.from),
      label: h.label || h.from,
      estimated: !!h.estimated,
      effectiveFrom: h.from,
      set: {
        ...tariff,
        fixedCharge:       h.fixedCharge       !== undefined ? h.fixedCharge       : tariff.fixedCharge,
        energySlabs:       h.energySlabs       !== undefined ? h.energySlabs       : tariff.energySlabs,
        additionalCharges: h.additionalCharges !== undefined ? h.additionalCharges : tariff.additionalCharges,
        excessDemandRate:  h.excessDemandRate  !== undefined ? h.excessDemandRate  : tariff.excessDemandRate,
        wheelingCharge:    h.wheelingCharge    !== undefined ? h.wheelingCharge    : tariff.wheelingCharge,
        fac:               h.fac               !== undefined ? h.fac               : tariff.fac,
      }
    });
  }
  const dated = candidates.filter(c => !isNaN(c.from)).sort((a, b) => a.from - b.from);

  // Pick the most recent set whose effective date is on/before the billing date
  let chosen = null;
  for (const c of dated) { if (c.from <= bd) chosen = c; }

  if (chosen) {
    return { ...chosen.set, periodLabel: chosen.label, estimated: chosen.estimated,
             effectiveFrom: chosen.effectiveFrom };
  }
  // Billing date predates all known rate sets → carry back earliest, flag as estimated
  const earliest = dated[0];
  return { ...earliest.set, periodLabel: earliest.label, estimated: true,
           carriedBack: true, effectiveFrom: earliest.effectiveFrom };
}
