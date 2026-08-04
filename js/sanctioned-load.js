// sanctioned-load.js — Sanctioned Load Optimizer (/sanctioned-load-optimizer/).
// Fixed charges are billed on sanctioned load every month, used or not — and most
// households never revisit the load set at connection time. Given the user's current
// load, highest recorded MD (12-month peak) and monthly units, this prices the bill at
// every candidate load with the SAME engine as the main calculator, so per-kW, tiered
// and flat fixed-charge schedules all come out right — and loads below the MD surface
// the excess-demand penalty instead of pretending the saving is free.

import { getStates, getDiscoms, ensureState } from './tariffs/registry.js';
import { calculateBill } from './engine.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// Headroom over the recorded 12-month peak. MD is a 30-minute average your next summer
// can beat; 20% keeps one appliance's worth of slack so the optimized load survives it.
const HEADROOM = 1.2;
const MIN_LOAD = 1;          // most DISCOMs won't sanction a domestic connection below 1 kW

// Financial-year order, because that is the order the 12 bills sit in and the order
// every DISCOM's own consumption history is printed in.
const FY_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// Same domestic-category heuristic as the recharge calculator / services pages.
function domesticCategory(discom) {
  const cats = discom.categories || [];
  return cats.find(c => /domestic|residential|lmv-?1|lt-?1|^dom/i.test(c.name || c.id))
      || cats.find(c => /home|household/i.test(c.name || c.id))
      || cats[0] || null;
}

// Candidate loads: every 0.5 kW step from MIN_LOAD up to the current load.
function candidates(current) {
  const out = [];
  for (let kw = MIN_LOAD; kw < current - 0.001; kw += 0.5) out.push(+kw.toFixed(1));
  out.push(current);
  return out;
}

function priceAt(discom, cat, units, loadKw, mdKw) {
  try {
    const r = calculateBill({ discomId: discom.id, categoryId: cat.id, units,
      connectedLoadKw: loadKw, billedDemandKw: mdKw });
    if (r && !r.error && r.totalPayable != null) return r;
  } catch (e) { /* engine couldn't price this combination */ }
  return null;
}

// ── Month-by-month MD ─────────────────────────────────────────────────────────
// Sizing to the single worst month is what leaves people over-sanctioned: a household
// that peaks at 5 kW for three summer months and stays under 3 kW for the other nine
// pays the 5 kW fixed charge twelve times over. With the year's twelve MDs we can price
// the WHOLE year at every candidate load and let the arithmetic choose.
//
// Deliberately NOT the default. Twelve numbers is a lot to ask, most people have one
// figure to hand, and the single-MD answer is the safe one — so the grid is opt-in and
// the tool falls back to the peak when it is empty or half-filled.
let mdMonths = new Array(12).fill(null);
const monthsFilled = () => mdMonths.filter(v => v > 0).length;
const useMonthly = () => monthsFilled() >= 2;
// The single-MD field is driven from the grid while the grid is in charge, so the figure the
// user typed there has to be parked somewhere or clearing the grid would silently overwrite it.
let ownMd = null;

// Price a candidate load across the whole year. Units are held flat across the twelve
// months: seasonal usage does vary, but asking for twelve more numbers to refine a
// FIXED charge — which in most states does not depend on units at all — is not a trade
// worth making. Where it does matter (the by_consumption states) it shifts every
// candidate load equally, so the ranking stands.
function priceYear(discom, cat, units, loadKw, mds) {
  let total = 0, penalty = 0, monthsOver = 0;
  for (const md of mds) {
    const r = priceAt(discom, cat, units, loadKw, md);
    if (!r) return null;
    total += r.totalPayable;
    penalty += r.excessDemandPenalty || 0;
    if (r.excessDemandPenalty > 0) monthsOver++;
  }
  return { total, penalty, monthsOver };
}

function render() {
  const state = $('slState').value;
  const discoms = getDiscoms(state);
  const discom = discoms.find(d => d.id === $('slDiscom').value) || discoms[0];
  const box = $('slResult');
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }

  const current = Math.max(0.5, Number($('slLoad').value) || 0);
  const units   = Math.max(1, Number($('slUnits').value) || 0);
  const cat = domesticCategory(discom);
  if (!cat) { box.innerHTML = '<p class="tx-muted">No domestic tariff on record for this DISCOM.</p>'; return; }

  // One MD or twelve. Everything downstream works on the array, so the single-figure path
  // is just the twelve-month path with a one-month year.
  const monthly = useMonthly();
  const filled  = mdMonths.filter(v => v > 0);
  const md      = monthly ? Math.max.apply(null, filled) : Math.max(0.1, Number($('slMd').value) || 0);
  const mds     = monthly ? filled : [md];

  const baseYr = priceYear(discom, cat, units, current, mds);
  if (!baseYr) {
    box.innerHTML = '<p class="tx-muted">Couldn’t price this combination — try the <a href="/#calculator">full calculator</a>.</p>';
    return;
  }
  const perYear = (v) => v * (12 / mds.length);   // scale a part-year total to a full year

  if (md > current) {
    const over = priceAt(discom, cat, units, current, md);
    box.innerHTML = `
    <div class="svc-card">
      <p class="rc-note"><strong>Your recorded demand (${md} kW) already exceeds your sanctioned load
      (${current} kW).</strong> There is nothing to cut — you are in excess-demand territory, where many
      DISCOMs bill a penalty${over && over.excessDemandPenalty > 0 ? ` (≈ ${rupee(over.excessDemandPenalty)} on this
      month's numbers)` : ''} or enhance your load on their own. Consider regularising your load upward
      instead — see <a href="/guides/uppcl-sanctioned-load-increased/">what happens when the DISCOM raises
      it for you</a>.</p>
    </div>`;
    return;
  }

  // Price every candidate load across the whole year, then read two answers off it.
  const priced = candidates(current).map(kw => ({ kw, yr: priceYear(discom, cat, units, kw, mds) }))
                                    .filter(c => c.yr);

  //  safe    = the lowest load that never goes over in any month. This is the recommendation.
  //  optimal = the lowest ANNUAL cost, which may accept a few penalty months to save eleven
  //            months of fixed charge. Shown, never defaulted to — see the note in the markup.
  const clean = priced.filter(c => c.yr.monthsOver === 0);
  const safeFromData = clean.length ? Math.min.apply(null, clean.map(c => c.kw)) : current;
  // Headroom applies to the single-MD path only: one figure is a sample and next summer can
  // beat it. Twelve months IS the distribution, so padding it would just re-inflate the load.
  const safe = monthly
    ? Math.min(current, safeFromData)
    : Math.min(current, Math.max(MIN_LOAD, Math.ceil(md * HEADROOM * 2) / 2));
  const optimal = priced.length ? priced.reduce((a, c) => (c.yr.total < a.yr.total ? c : a), priced[0]) : null;

  const at = (kw) => priced.find(c => c.kw === kw) || null;
  const safeRow = at(safe);
  const yearlySave = safeRow ? perYear(baseYr.total - safeRow.yr.total) : 0;
  const already = safe >= current;
  const recFixed = priceAt(discom, cat, units, safe, md);

  // Only worth showing when it actually differs and actually wins by a visible amount.
  const gamble = (monthly && optimal && safeRow && optimal.kw < safe
    && perYear(safeRow.yr.total - optimal.yr.total) >= 100) ? optimal : null;

  const rows = priced.map(({ kw, yr }) => {
    const saveYr = perYear(baseYr.total - yr.total);
    const risky  = yr.monthsOver > 0;
    const isCur  = kw === current;
    const isRec  = kw === safe && !isCur;
    const tag = isCur ? '<span class="rc-beta">current</span>'
              : isRec ? '<span class="rc-beta">recommended</span>'
              : (gamble && kw === gamble.kw) ? '<span class="rc-beta rc-beta-warn">cheapest</span>' : '';
    const fixed = priceAt(discom, cat, units, kw, md);
    const overCell = monthly
      ? `<td class="num">${risky ? `⚠ ${yr.monthsOver} of ${mds.length}` : '—'}</td>` : '';
    const note = isCur ? '—'
               : saveYr > 0 ? rupee(saveYr) + '/yr'
               : saveYr < 0 ? '−' + rupee(-saveYr) + '/yr' : '—';
    return `<tr${isRec ? ' class="rc-row-custom"' : ''}>
      <td>${kw} kW ${tag}</td>
      <td class="num">${fixed ? rupee(fixed.fixedPerMonth) + '/mo' : '—'}</td>
      ${overCell}
      <td class="num">${!monthly && risky ? '⚠ ' : ''}${note}</td>
    </tr>`;
  }).join('');

  const mdLabel = monthly
    ? `peak ${md} kW across ${mds.length} month${mds.length > 1 ? 's' : ''}`
    : `peak demand ${md} kW`;

  box.innerHTML = `
    <div class="svc-card">
      <div class="svc-discom">
        <span class="svc-icon">⚡</span>
        <div>
          <div class="svc-name">${esc(discom.fullName || discom.name)}</div>
          <div class="svc-area">Domestic (${esc(cat.name)}) · sanctioned ${current} kW · ${mdLabel}</div>
        </div>
      </div>

      <div class="rc-stats">
        <div class="rc-stat">
          <span class="rc-stat-label">${monthly ? 'Penalty-free load' : 'Load you actually need'}</span>
          <span class="rc-stat-value">${safe}<small> kW</small></span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-label">Fixed charge at ${safe} kW</span>
          <span class="rc-stat-value">${recFixed ? rupee(recFixed.fixedPerMonth) : '—'}<small>/month</small></span>
        </div>
        <div class="rc-stat rc-stat-hero">
          <span class="rc-stat-label">${already ? (monthly ? 'Already penalty-free' : 'You are already optimal') : 'Yearly saving'}</span>
          <span class="rc-stat-value">${already ? '✓' : rupee(Math.max(0, yearlySave))}<small>${already ? '' : '/year'}</small></span>
        </div>
      </div>

      ${gamble ? `<div class="sl-gamble">
        <strong>Cheaper on paper: ${gamble.kw} kW</strong>
        <p>Dropping to ${gamble.kw} kW would save a further
        ${rupee(perYear(safeRow.yr.total - gamble.yr.total))}/year — the penalty for the
        ${gamble.yr.monthsOver} month${gamble.yr.monthsOver > 1 ? 's' : ''} you would go over is already
        counted in that figure. We still recommend ${safe} kW, because going over costs more than the
        penalty line: DISCOMs re-sanction your load upward on their own once it happens repeatedly,
        sometimes with arrears, and sustained excess can be assessed as unauthorised use under Section 126
        of the Electricity Act. Treat this as an informed choice, not as the safe one.</p>
      </div>` : ''}

      ${already ? `<p class="rc-note">Your sanctioned load already sits at the lowest figure your demand
      never exceeds (${md} kW peak${monthly ? '' : ' + safety headroom'}). Cutting further means accepting
      an excess-demand penalty in at least one month — and repeated excess can trigger an automatic load
      enhancement.${monthly ? ' The table below prices every step down so you can judge that trade-off for'
      + ' yourself: a load that goes over only in the three summer months is a very different proposition'
      + ' from one that goes over in eight.' : ''}</p>` : ''}

      ${already && !monthly ? '' : `
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Sanctioned load</th><th class="num">Fixed charge</th>${monthly ? '<th class="num">Months over</th>' : ''}<th class="num">Saving vs current</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="rc-note">Priced with ${esc(discom.name)}'s current domestic tariff — fixed-charge schedule,
      slab rates and duty — ${monthly
        ? `re-running all ${mds.length} months at every candidate load and totalling the year`
        : `holding your recorded demand at ${md} kW`}
      (the same engine as our
      <a href="/?state=${encodeURIComponent(state)}&discom=${encodeURIComponent(discom.id)}#calculator">bill calculator</a>).
      ${monthly
        ? 'The recommended load is the lowest one your demand never exceeds, so it carries no penalty in any month you entered. Monthly usage is held flat across the year.'
        : `Rows marked ⚠ sit below your recorded demand: the modelled excess-demand penalty already eats the
           fixed-charge saving there, and repeated excess can get your load force-enhanced.
           The recommendation keeps ${Math.round((HEADROOM - 1) * 100)}% headroom over your 12-month peak.`}</p>`}

      <div class="svc-facts-links rc-links">
        <a href="/guides/reduce-fixed-charges-sanctioned-load/">How to apply for a load reduction →</a>
        <a href="/guides/uppcl-sanctioned-load-increased/">DISCOM raised your load on its own? →</a>
      </div>
    </div>`;
}

// ── Appliance-based MD estimator ──────────────────────────────────────────────
// For users who can't find MD on their bills. MD is about what draws power AT ONCE, so
// there are no run-hours here — but three things decide the answer, and getting any of
// them wrong produces the oversized load this page exists to fix:
//
//  1. SEASON. A geyser and an AC never peak in the same week. Summing the whole house is
//     what makes naive estimates absurd. Each appliance declares the seasons it is used
//     in; we compute a peak per season and take the worst one.
//  2. COINCIDENCE. Things that are simply on — lights, fans, TV, the AC once it is hot —
//     really are on together, so they count in full. Things you operate — geyser, iron,
//     microwave, pump — rarely overlap with each other, so only the largest of them counts.
//  3. THE 30-MINUTE WINDOW. MD is a half-hour AVERAGE, not an instantaneous peak. A 2 kW
//     geyser that heats for 15 minutes contributes ~1 kW to the window; a mixer run for
//     three minutes contributes almost nothing. This is the single biggest reason a
//     measured MD comes in far below what people expect, and the reason the old model
//     (full nameplate for the largest heat appliance) read high.
//
// `duty` is the fraction of a 30-minute window the appliance is actually drawing when in
// use. `cycles: true` marks loads that thermostat-cycle rather than run flat out.
const SEASONS = [
  { id: 'summer',  label: 'Summer' },
  { id: 'monsoon', label: 'Monsoon' },
  { id: 'winter',  label: 'Winter' },
];
const ALL_SEASONS = ['summer', 'monsoon', 'winter'];

const MD_CATALOG = [
  // id            name                                       W     duty  seasons                    operated?
  { id: 'fan',       name: { en: 'Ceiling Fan',            hi: 'सीलिंग फैन' },        w: 75,   duty: 1,   seasons: ['summer', 'monsoon'] },
  { id: 'led',       name: { en: 'LED Bulb',               hi: 'LED बल्ब' },           w: 9,    duty: 1,   seasons: ALL_SEASONS },
  { id: 'tube',      name: { en: 'Tube Light',             hi: 'ट्यूब लाइट' },         w: 20,   duty: 1,   seasons: ALL_SEASONS },
  { id: 'tv',        name: { en: 'LED TV',                 hi: 'LED टीवी' },           w: 90,   duty: 1,   seasons: ALL_SEASONS },
  // A fridge's compressor runs roughly half of any half-hour, harder in summer.
  { id: 'fridge',    name: { en: 'Refrigerator',           hi: 'रेफ्रिजरेटर' },        w: 150,  duty: 0.6, seasons: ALL_SEASONS, cycles: true },
  // An AC compressor cycles once the room is cold; on the hottest evening it barely does.
  { id: 'ac',        name: { en: 'Air Conditioner (1.5T)', hi: 'एयर कंडीशनर (1.5T)' },  w: 1500, duty: 0.9, seasons: ['summer', 'monsoon'], cycles: true },
  { id: 'cooler',    name: { en: 'Air Cooler',             hi: 'एयर कूलर' },           w: 180,  duty: 1,   seasons: ['summer'] },
  { id: 'laptop',    name: { en: 'Laptop',                 hi: 'लैपटॉप' },             w: 60,   duty: 1,   seasons: ALL_SEASONS },
  { id: 'desktop',   name: { en: 'Desktop PC',             hi: 'डेस्कटॉप PC' },         w: 150,  duty: 1,   seasons: ALL_SEASONS },
  { id: 'router',    name: { en: 'Wi-Fi Router',           hi: 'वाई-फाई राउटर' },       w: 10,   duty: 1,   seasons: ALL_SEASONS },
  // ── Operated loads: only the largest counts, and only for the slice of the half-hour
  //    it actually draws. Geysers are winter-and-monsoon; the rest are year-round.
  { id: 'geyser',    name: { en: 'Geyser / Water Heater',  hi: 'गीज़र / वॉटर हीटर' },   w: 2000, duty: 0.5, seasons: ['winter', 'monsoon'], operated: true },
  { id: 'induction', name: { en: 'Induction Cooktop',      hi: 'इंडक्शन कुकटॉप' },      w: 1800, duty: 0.7, seasons: ALL_SEASONS, operated: true },
  { id: 'micro',     name: { en: 'Microwave Oven',         hi: 'माइक्रोवेव ओवन' },      w: 1200, duty: 0.25, seasons: ALL_SEASONS, operated: true },
  { id: 'iron',      name: { en: 'Electric Iron',          hi: 'इलेक्ट्रिक आयरन' },     w: 1000, duty: 0.45, seasons: ALL_SEASONS, operated: true, cycles: true },
  { id: 'washer',    name: { en: 'Washing Machine',        hi: 'वॉशिंग मशीन' },        w: 500,  duty: 0.5, seasons: ALL_SEASONS, operated: true },
  { id: 'pump',      name: { en: 'Water Pump / Motor',     hi: 'वॉटर पंप / मोटर' },     w: 750,  duty: 0.4, seasons: ALL_SEASONS, operated: true },
  { id: 'mixer',     name: { en: 'Mixer / Grinder',        hi: 'मिक्सर / ग्राइंडर' },   w: 500,  duty: 0.1, seasons: ALL_SEASONS, operated: true },
  { id: 'custom',    name: { en: 'Custom Appliance',       hi: 'कस्टम उपकरण' },         w: 100,  duty: 1,   seasons: ALL_SEASONS },
];
const mdSpec = (id) => MD_CATALOG.find(x => x.id === id) || MD_CATALOG[MD_CATALOG.length - 1];
const estLang = () => { try { return localStorage.getItem('lang') === 'hi' ? 'hi' : 'en'; } catch (e) { return 'en'; } };
const mdName = (id) => { const c = MD_CATALOG.find(x => x.id === id); return c ? c.name[estLang()] : id; };

// A typical starter household; every row stays editable/removable.
let estRows = [
  { id: 'fan', w: 75, qty: 3 }, { id: 'led', w: 9, qty: 6 }, { id: 'fridge', w: 150, qty: 1 },
  { id: 'tv', w: 90, qty: 1 }, { id: 'ac', w: 1500, qty: 1 }, { id: 'geyser', w: 2000, qty: 1 },
];

// Peak half-hour demand in one season: everything that is simply ON, in full and at its
// duty, plus the LARGEST single operated load (they rarely overlap with each other).
function seasonKw(season) {
  let together = 0, biggestOperated = 0;
  for (const r of estRows) {
    const spec = mdSpec(r.id);
    if (!spec.seasons.includes(season)) continue;
    const w = Number(r.w) || 0, qty = Number(r.qty) || 0;
    const contribution = w * spec.duty;
    if (spec.operated) biggestOperated = Math.max(biggestOperated, qty > 0 ? contribution : 0);
    else together += contribution * qty;
  }
  return (together + biggestOperated) / 1000;
}

// The year's MD is the worst season, not the sum of all of them.
function estimateSeasons() {
  return SEASONS.map(s => ({ ...s, kw: Math.ceil(seasonKw(s.id) * 10) / 10 }));
}
function estimateMdKw() {
  return estimateSeasons().reduce((m, s) => Math.max(m, s.kw), 0);
}

function renderEst() {
  const wrap = $('slEstRows');
  if (!wrap) return;
  wrap.innerHTML = estRows.map((r, i) => {
    const spec = mdSpec(r.id);
    // Two things the number depends on that the row would otherwise hide: whether this
    // appliance is one of the "only the biggest counts" group, and which seasons it is in.
    const tags = [
      spec.operated ? '<small class="sl-est-heat">largest only</small>' : '',
      spec.seasons.length < 3
        ? `<small class="sl-est-season">${spec.seasons.map(s => s[0].toUpperCase() + s.slice(1)).join(' / ')}</small>`
        : '',
      spec.duty < 1 ? `<small class="sl-est-duty" title="Share of a 30-minute window this actually draws">×${spec.duty}</small>` : '',
    ].filter(Boolean).join(' ');
    return `
    <div class="est-row" data-i="${i}">
      <span class="est-row-name">${esc(mdName(r.id))} ${tags}</span>
      <input class="est-in" data-f="w" data-i="${i}" type="number" min="1" step="10" value="${r.w}" inputmode="numeric" aria-label="Wattage (W)">
      <input class="est-in" data-f="qty" data-i="${i}" type="number" min="0" step="1" value="${r.qty}" inputmode="numeric" aria-label="Quantity">
      <button type="button" class="est-row-remove" data-i="${i}" title="Remove" aria-label="Remove ${esc(mdName(r.id))}">×</button>
    </div>`;
  }).join('') || '<p class="est-empty">Add appliances below to estimate your MD.</p>';
  updateEstOut();
}

// Readout: the per-season split plus the figure we would apply. Shown as three numbers
// because the whole point is that the seasons differ — a single number hides the reason.
function updateEstOut() {
  const seasons = estimateSeasons();
  const kw = estimateMdKw();
  const split = $('slEstSplit');
  if (split) {
    split.innerHTML = seasons.map(s => `
      <span class="sl-est-chip${s.kw === kw && kw > 0 ? ' is-peak' : ''}">
        ${s.label}<strong>${s.kw > 0 ? s.kw + ' kW' : '—'}</strong>
      </span>`).join('');
  }
  $('slEstVal').textContent = kw > 0 ? `≈ ${kw} kW` : '—';
  $('slEstApply').disabled = !(kw > 0);
}

// ── 12-month MD grid ──────────────────────────────────────────────────────────
function renderYearState() {
  const n = monthsFilled();
  const el = $('slYearState');
  if (!el) return;
  el.textContent = n === 0 ? 'Using the single peak above.'
    : n === 1 ? '1 month entered — add at least one more to size to the year.'
    : `Sizing to ${n} month${n > 1 ? 's' : ''} · peak ${Math.max.apply(null, mdMonths.filter(v => v > 0))} kW`;
  const md = $('slMd');
  // The single field is now derived, not ignored: keep it showing the peak so the two
  // inputs never disagree on screen, and hand back the user's own figure when the grid
  // is cleared rather than stranding them with the derived peak.
  if (useMonthly()) {
    if (!md.disabled) ownMd = md.value;
    md.disabled = true;
    md.value = Math.max.apply(null, mdMonths.filter(v => v > 0));
  } else {
    if (md.disabled && ownMd != null) md.value = ownMd;
    md.disabled = false;
  }
}

function initYearGrid() {
  const grid = $('slYearGrid');
  if (!grid) return;
  grid.innerHTML = FY_MONTHS.map((m, i) => `
    <label class="sl-year-cell">
      <span>${m}</span>
      <input type="number" data-m="${i}" min="0" max="50" step="0.1" inputmode="decimal"
             placeholder="—" aria-label="Maximum demand in ${m} (kW)">
    </label>`).join('');

  grid.addEventListener('input', (e) => {
    const i = Number(e.target.dataset.m);
    if (!(i >= 0)) return;
    const v = Number(e.target.value);
    mdMonths[i] = v > 0 ? v : null;
    renderYearState();
    render();
  });
  $('slYearClear').addEventListener('click', () => {
    mdMonths = new Array(12).fill(null);
    grid.querySelectorAll('input').forEach(i => { i.value = ''; });
    renderYearState();
    render();
  });
  renderYearState();
}

function initEstimator() {
  const panel = $('slEstPanel');
  if (!panel) return;
  const addSel = $('slEstAdd');
  const opts = MD_CATALOG.map(c => `<option value="${c.id}">${esc(c.name[estLang()])} (${c.w} W)</option>`).join('');
  addSel.innerHTML = `<option value="" selected disabled>+ Add an appliance…</option>${opts}`;

  addSel.addEventListener('change', () => {
    const c = MD_CATALOG.find(x => x.id === addSel.value);
    if (c) { estRows.push({ id: c.id, w: c.w, qty: 1 }); renderEst(); }
    addSel.value = '';
  });
  $('slEstRows').addEventListener('input', (e) => {
    const f = e.target.dataset.f, i = Number(e.target.dataset.i);
    if (!f || !(i >= 0) || !estRows[i]) return;
    estRows[i][f] = Number(e.target.value) || 0;
    updateEstOut();                     // readout only — rebuilding the rows would drop focus
  });
  $('slEstRows').addEventListener('click', (e) => {
    const btn = e.target.closest('.est-row-remove');
    if (!btn) return;
    estRows.splice(Number(btn.dataset.i), 1);
    renderEst();
  });
  $('slEstApply').addEventListener('click', () => {
    const kw = estimateMdKw();
    if (!(kw > 0)) return;
    // The estimate is a single figure, so it can only drive the single-MD path. Stand the
    // year grid down rather than writing into a field the grid has disabled.
    if (useMonthly()) {
      mdMonths = new Array(12).fill(null);
      const grid = $('slYearGrid');
      if (grid) grid.querySelectorAll('input').forEach(i => { i.value = ''; });
      renderYearState();
    }
    $('slMd').value = kw;
    panel.open = false;
    render();
    $('slMd').focus();
  });
  renderEst();
}

// render() below reads discom.categories, so the state's tariff tables have to be in
// memory first. The registry serves DISCOM names from its index without this await;
// only the rates need the fetch.
async function populateDiscoms(preselect) {
  if ($('slState').value) await ensureState($('slState').value);
  const sel = $('slDiscom');
  const discoms = getDiscoms($('slState').value);
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (preselect && discoms.some(d => d.id === preselect)) sel.value = preselect;
  render();
}

function init() {
  const stateSel = $('slState');
  if (!stateSel) return; // not on this page

  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  // Deep-link: /sanctioned-load-optimizer/?state=Uttar%20Pradesh&discom=mvvnl&load=5&md=2.5
  const params = new URLSearchParams(location.search);
  const wantState = params.get('state');
  stateSel.value = (wantState && states.includes(wantState)) ? wantState
                 : states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0];
  const num = (k, id) => { const v = Number(params.get(k)); if (v > 0) $(id).value = v; };
  num('load', 'slLoad'); num('md', 'slMd'); num('units', 'slUnits');
  populateDiscoms(params.get('discom'));

  stateSel.addEventListener('change', () => populateDiscoms());
  $('slDiscom').addEventListener('change', render);
  for (const id of ['slLoad', 'slMd', 'slUnits']) $(id).addEventListener('input', render);
  initYearGrid();
  initEstimator();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
