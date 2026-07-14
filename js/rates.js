// js/rates.js — remote FPPA/PPAC rates from Supabase (public.fppa_rates), merged into the
// hardcoded tables in js/tariffs/fppa.js so monthly rates can be updated from the dashboard
// without a code redeploy.
//
// Design constraints (deliberate):
//   - resolveFppaForDiscom() stays SYNCHRONOUS — this module only mutates the in-memory
//     FPPA_BY_DISCOM / FPPA_BY_STATE arrays before/around the form using them.
//   - The hardcoded values are the OFFLINE FALLBACK. A failed / slow / unconfigured fetch
//     leaves the site behaving exactly as before this feature existed.
//   - Remote rows WIN over a hardcoded entry for the same (key, from) window, so a bad
//     hardcoded value can be corrected from the dashboard too.
//   - Rows are cached in localStorage: repeat visits apply the cache instantly (offline
//     included) and revalidate in the background at most once per TTL.
//
// After a merge changes anything, a 'fppa-rates-updated' event fires on window; main.js
// re-runs the FPPA prefill so an already-rendered form picks up the fresh rate.

import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './supabase-config.js';
import { FPPA_BY_DISCOM, FPPA_BY_STATE } from './tariffs/fppa.js';

const CACHE_KEY = 'tdb-remote-fppa';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;   // revalidate at most every 6 h
const FETCH_TIMEOUT_MS = 6000;

// (scope, key, from) triples already merged, so cache-then-network can't double-insert.
const appliedKeys = new Set();

function rowToEntry(row) {
  const e = {
    from: row.from_date,
    mode: row.mode === 'per_unit' ? 'per_unit' : 'percent',
    rate: +row.rate,
    label: row.label || `${row.from_date} FPPA`,
    source: row.source || 'DISCOM notice (updated online)',
  };
  if (row.to_date) e.to = row.to_date;
  return e;
}

/**
 * Merge remote rows into the in-memory FPPA tables. Remote wins on (key, from) conflict.
 * @returns {boolean} whether anything changed.
 */
export function applyRemoteRates(rows) {
  let changed = false;
  for (const row of rows || []) {
    if (!row || !row.key || !row.from_date || !(row.scope === 'discom' || row.scope === 'state')) continue;
    if (typeof row.rate !== 'number' && isNaN(+row.rate)) continue;
    const dedupe = `${row.scope}|${row.key}|${row.from_date}`;
    if (appliedKeys.has(dedupe)) continue;
    appliedKeys.add(dedupe);

    const table = row.scope === 'discom' ? FPPA_BY_DISCOM : FPPA_BY_STATE;
    const list = table[row.key] || (table[row.key] = []);
    const entry = rowToEntry(row);
    // Drop any hardcoded entry for the same window start, then keep the list sorted
    // newest-first (pick() matches top-to-bottom, same convention as the static tables).
    const i = list.findIndex((e) => e.from === entry.from);
    if (i >= 0) list.splice(i, 1);
    const at = list.findIndex((e) => e.from < entry.from);
    list.splice(at >= 0 ? at : list.length, 0, entry);
    changed = true;
  }
  return changed;
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return (c && Array.isArray(c.rows)) ? c : null;
  } catch (e) { return null; }
}

function writeCache(rows) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows })); } catch (e) {}
}

async function fetchRates() {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    // PostgREST read with the anon key — no SDK download needed for a public table.
    const url = `${SUPABASE_URL}/rest/v1/fppa_rates` +
      '?select=scope,key,from_date,to_date,mode,rate,label,source&order=from_date.desc&limit=500';
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows : null;
  } catch (e) {
    return null;      // offline / timeout / CORS — fallback data stays in charge
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Load remote rates: cached rows apply synchronously, then a background revalidation
 * fetches fresh rows when the cache is stale. Fires 'fppa-rates-updated' on window
 * whenever a merge changed the tables. Safe to call on every page; never throws.
 */
export function initRemoteRates() {
  if (!isConfigured()) return;

  const cache = readCache();
  if (cache && applyRemoteRates(cache.rows)) {
    window.dispatchEvent(new CustomEvent('fppa-rates-updated'));
  }

  const fresh = !cache || (Date.now() - (cache.at || 0)) > CACHE_TTL_MS;
  if (!fresh) return;

  fetchRates().then((rows) => {
    if (!rows) return;
    writeCache(rows);
    if (applyRemoteRates(rows)) {
      window.dispatchEvent(new CustomEvent('fppa-rates-updated'));
    }
  });
}
