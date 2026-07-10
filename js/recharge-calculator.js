// recharge-calculator.js — Smart Meter Recharge Calculator (/recharge-calculator/).
// Answers the question no DISCOM portal answers: "how long will a ₹X recharge last?"
// Uses the SAME billing engine as the main calculator (real slab rates, fixed charges,
// FPPA, duty) run for the user's monthly units, then converts that month's cost into a
// daily burn rate and recharge-lasting estimates.

import { TARIFF_DB, getStates, getDiscoms } from './tariffs/registry.js';
import { calculateBill } from './engine.js';
import { discomFactsHtml } from './portal-page.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const AMOUNTS = [200, 300, 500, 1000, 2000];
const DAYS_PER_MONTH = 30;

// Same domestic-category heuristic used by the SEO generator and services pages.
function domesticCategory(discom) {
  const cats = discom.categories || [];
  return cats.find(c => /domestic|residential|lmv-?1|lt-?1|^dom/i.test(c.name || c.id))
      || cats.find(c => /home|household/i.test(c.name || c.id))
      || cats[0] || null;
}

function fmtDays(days) {
  if (!isFinite(days) || days <= 0) return '—';
  if (days >= 60) return `≈ ${Math.round(days / 30)} months`;
  if (days >= 45) return `≈ 1½ months`;
  return `≈ ${Math.round(days)} days`;
}

function render() {
  const state = $('rcState').value;
  const discoms = getDiscoms(state);
  const discom = discoms.find(d => d.id === $('rcDiscom').value) || discoms[0];
  const box = $('rcResult');
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }

  const units = Math.max(1, Number($('rcUnits').value) || 0);
  const load = Math.max(0.5, Number($('rcLoad').value) || 0);
  const cat = domesticCategory(discom);
  if (!cat) { box.innerHTML = '<p class="tx-muted">No domestic tariff on record for this DISCOM.</p>'; return; }

  let bill = null;
  try {
    const r = calculateBill({ discomId: discom.id, categoryId: cat.id, units, connectedLoadKw: load });
    if (r && !r.error && r.totalPayable != null) bill = r.totalPayable;
  } catch (e) { /* engine couldn't price this combination */ }
  if (bill == null || bill <= 0) {
    box.innerHTML = '<p class="tx-muted">Couldn’t estimate a bill for this selection — try the <a href="/#calculator">full calculator</a>.</p>';
    return;
  }

  const daily = bill / DAYS_PER_MONTH;
  const effRate = bill / units;
  const recommended = Math.ceil(bill / 50) * 50;   // monthly recharge, rounded up to ₹50

  const custom = Number($('rcAmount').value) || 0;
  const amounts = custom > 0 && !AMOUNTS.includes(custom)
    ? [...AMOUNTS, custom].sort((a, b) => a - b) : AMOUNTS;

  const rows = amounts.map(amt => {
    const days = amt / daily;
    const u = amt / effRate;
    const hot = custom > 0 && amt === custom ? ' class="rc-row-custom"' : '';
    return `<tr${hot}><td>${rupee(amt)}</td><td class="num">${fmtDays(days)}</td><td class="num">≈ ${Math.round(u)} units</td></tr>`;
  }).join('');

  box.innerHTML = `
    <div class="svc-card">
      <div class="svc-discom">
        <span class="svc-icon">🔋</span>
        <div>
          <div class="svc-name">${esc(discom.fullName || discom.name)}</div>
          <div class="svc-area">Domestic (${esc(cat.name)}) · ${units.toLocaleString('en-IN')} units/month · ${load} kW load</div>
        </div>
      </div>

      <div class="rc-stats">
        <div class="rc-stat">
          <span class="rc-stat-label">Your daily burn rate</span>
          <span class="rc-stat-value">${'₹' + daily.toLocaleString('en-IN', { maximumFractionDigits: 1 })}<small>/day</small></span>
        </div>
        <div class="rc-stat">
          <span class="rc-stat-label">Effective cost per unit</span>
          <span class="rc-stat-value">${'₹' + effRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}<small>/unit</small></span>
        </div>
        <div class="rc-stat rc-stat-hero">
          <span class="rc-stat-label">Ideal monthly recharge</span>
          <span class="rc-stat-value">${rupee(recommended)}<small>/month</small></span>
        </div>
      </div>

      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Recharge</th><th class="num">Lasts about</th><th class="num">Buys about</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="rc-note">Estimates include ${esc(discom.name)}'s slab energy charges, fixed charges, FPPA and duty
      (the same engine as our <a href="/?state=${encodeURIComponent(state)}&discom=${encodeURIComponent(discom.id)}#calculator">bill calculator</a>),
      spread over a 30-day month. Seasonal usage swings (AC, geyser) will shorten or stretch these numbers.
      Some DISCOMs also give a small rebate on prepaid smart-meter tariffs — check your tariff order.</p>

      ${discomFactsHtml(state, discom)}

      <div class="svc-facts-links rc-links">
        <a href="/smart-meter-recharge/${slugify(state)}/${encodeURIComponent(discom.id)}/">How to recharge a ${esc(discom.name)} smart meter →</a>
        <a href="/guides/smart-meter-prepaid-disconnection/">Low balance &amp; disconnection rules →</a>
      </div>
    </div>`;
}

function populateDiscoms(preselect) {
  const sel = $('rcDiscom');
  const discoms = getDiscoms($('rcState').value);
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (preselect && discoms.some(d => d.id === preselect)) sel.value = preselect;
  render();
}

function init() {
  const stateSel = $('rcState');
  if (!stateSel) return; // not on this page

  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  // Deep-link: /recharge-calculator/?state=Uttar%20Pradesh&discom=mvvnl&units=250
  const params = new URLSearchParams(location.search);
  const wantState = params.get('state');
  stateSel.value = (wantState && states.includes(wantState)) ? wantState
                 : states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0];
  const wantUnits = Number(params.get('units'));
  if (wantUnits > 0) $('rcUnits').value = wantUnits;
  populateDiscoms(params.get('discom'));

  stateSel.addEventListener('change', () => populateDiscoms());
  $('rcDiscom').addEventListener('change', render);
  for (const id of ['rcUnits', 'rcLoad', 'rcAmount']) $(id).addEventListener('input', render);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
