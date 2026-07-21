// sanctioned-load.js — Sanctioned Load Optimizer (/sanctioned-load-optimizer/).
// Fixed charges are billed on sanctioned load every month, used or not — and most
// households never revisit the load set at connection time. Given the user's current
// load, highest recorded MD (12-month peak) and monthly units, this prices the bill at
// every candidate load with the SAME engine as the main calculator, so per-kW, tiered
// and flat fixed-charge schedules all come out right — and loads below the MD surface
// the excess-demand penalty instead of pretending the saving is free.

import { getStates, getDiscoms } from './tariffs/registry.js';
import { calculateBill } from './engine.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// Headroom over the recorded 12-month peak. MD is a 30-minute average your next summer
// can beat; 20% keeps one appliance's worth of slack so the optimized load survives it.
const HEADROOM = 1.2;
const MIN_LOAD = 1;          // most DISCOMs won't sanction a domestic connection below 1 kW

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

function render() {
  const state = $('slState').value;
  const discoms = getDiscoms(state);
  const discom = discoms.find(d => d.id === $('slDiscom').value) || discoms[0];
  const box = $('slResult');
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }

  const current = Math.max(0.5, Number($('slLoad').value) || 0);
  const md      = Math.max(0.1, Number($('slMd').value) || 0);
  const units   = Math.max(1, Number($('slUnits').value) || 0);
  const cat = domesticCategory(discom);
  if (!cat) { box.innerHTML = '<p class="tx-muted">No domestic tariff on record for this DISCOM.</p>'; return; }

  const base = priceAt(discom, cat, units, current, md);
  if (!base) {
    box.innerHTML = '<p class="tx-muted">Couldn’t price this combination — try the <a href="/#calculator">full calculator</a>.</p>';
    return;
  }

  if (md > current) {
    box.innerHTML = `
    <div class="svc-card">
      <p class="rc-note"><strong>Your recorded demand (${md} kW) already exceeds your sanctioned load
      (${current} kW).</strong> There is nothing to cut — you are in excess-demand territory, where many
      DISCOMs bill a penalty${base.excessDemandPenalty > 0 ? ` (≈ ${rupee(base.excessDemandPenalty)} on this
      month's numbers)` : ''} or enhance your load on their own. Consider regularising your load upward
      instead — see <a href="/guides/uppcl-sanctioned-load-increased/">what happens when the DISCOM raises
      it for you</a>.</p>
    </div>`;
    return;
  }

  // Recommended load: MD + headroom, rounded UP to the 0.5 kW the application forms use.
  const ideal = Math.max(MIN_LOAD, Math.ceil(md * HEADROOM * 2) / 2);
  const recommended = Math.min(ideal, current);   // never recommend more than they have

  const rows = candidates(current).map(kw => {
    const r = priceAt(discom, cat, units, kw, md);
    if (!r) return '';
    const saveYr = (base.totalPayable - r.totalPayable) * 12;
    const risky  = r.excessDemandPenalty > 0;
    const isCur  = kw === current;
    const isRec  = kw === recommended && !isCur;
    const tag = isCur ? '<span class="rc-beta">current</span>'
              : isRec ? '<span class="rc-beta">recommended</span>' : '';
    const note = risky ? `penalty ≈ ${rupee(r.excessDemandPenalty)}/mo` : isCur ? '—' : (saveYr > 0 ? rupee(saveYr) + '/yr' : '—');
    return `<tr${isRec ? ' class="rc-row-custom"' : ''}>
      <td>${kw} kW ${tag}</td>
      <td class="num">${rupee(r.fixedPerMonth)}/mo</td>
      <td class="num">${risky ? '⚠ ' : ''}${note}</td>
    </tr>`;
  }).join('');

  const rec = priceAt(discom, cat, units, recommended, md);
  const monthlySave = rec ? base.totalPayable - rec.totalPayable : 0;
  const yearlySave  = monthlySave * 12;
  const already = recommended >= current;

  box.innerHTML = `
    <div class="svc-card">
      <div class="svc-discom">
        <span class="svc-icon">⚡</span>
        <div>
          <div class="svc-name">${esc(discom.fullName || discom.name)}</div>
          <div class="svc-area">Domestic (${esc(cat.name)}) · sanctioned ${current} kW · peak demand ${md} kW</div>
        </div>
      </div>

      <div class="rc-stats">
        <div class="rc-stat">
          <span class="rc-stat-label">Load you actually need</span>
          <span class="rc-stat-value">${recommended}<small> kW</small></span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-label">Fixed charge at ${recommended} kW</span>
          <span class="rc-stat-value">${rec ? rupee(rec.fixedPerMonth) : '—'}<small>/month</small></span>
        </div>
        <div class="rc-stat rc-stat-hero">
          <span class="rc-stat-label">${already ? 'You are already optimal' : 'Yearly saving'}</span>
          <span class="rc-stat-value">${already ? '✓' : rupee(Math.max(0, yearlySave))}<small>${already ? '' : '/year'}</small></span>
        </div>
      </div>

      ${already ? `<p class="rc-note">Your sanctioned load is already close to your real demand
      (${md} kW peak + safety headroom). Cutting further would leave no room for a hot-summer peak —
      an MD above your new load can trigger an excess-demand penalty or an automatic load enhancement.</p>` : `
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Sanctioned load</th><th class="num">Fixed charge</th><th class="num">Saving vs current</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="rc-note">Priced with ${esc(discom.name)}'s current domestic tariff — fixed-charge schedule,
      slab rates and duty — holding your recorded demand at ${md} kW (the same engine as our
      <a href="/?state=${encodeURIComponent(state)}&discom=${encodeURIComponent(discom.id)}#calculator">bill calculator</a>).
      Rows marked ⚠ sit below your recorded demand: the modelled excess-demand penalty already eats the
      fixed-charge saving there, and repeated excess can get your load force-enhanced.
      The recommendation keeps ${Math.round((HEADROOM - 1) * 100)}% headroom over your 12-month peak.</p>`}

      <div class="svc-facts-links rc-links">
        <a href="/guides/reduce-fixed-charges-sanctioned-load/">How to apply for a load reduction →</a>
        <a href="/guides/uppcl-sanctioned-load-increased/">DISCOM raised your load on its own? →</a>
      </div>
    </div>`;
}

function populateDiscoms(preselect) {
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
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
