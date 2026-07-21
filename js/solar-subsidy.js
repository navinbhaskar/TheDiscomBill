// solar-subsidy.js — Solar Subsidy Checker (/solar-subsidy-checker/).
// Focused on PM Surya Ghar: Muft Bijli Yojana — the central rooftop-solar subsidy.
// From the user's state + monthly usage we suggest a system size, compute the exact
// central subsidy (a known formula), estimate generation, annual saving at the DISCOM's
// real marginal rate, net cost after subsidy and a rough payback. Deep-links to the full
// /solar-calculator/ for detailed net-metering maths.

import { getStates, getDiscoms } from './tariffs/registry.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rupee = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// PM Surya Ghar central subsidy: ₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd,
// capped at ₹78,000 for 3 kW+. (Muft Bijli Yojana, in force since 2024.)
function pmSuryaGharSubsidy(kw) {
  const s = 30000 * Math.min(kw, 2) + 18000 * Math.min(Math.max(kw - 2, 0), 1);
  return Math.min(s, 78000);
}

// Benchmark all-India installed cost (~₹55k/kW for 1–3 kW, a little less at larger sizes)
// and generation (~4 units/kW/day ≈ 1,460 kWh/kW/year). Both vary by site; labelled as est.
const COST_PER_KW = 55000;
const GEN_PER_KW_YEAR = 1460;
const SQFT_PER_KW = 100;   // usable shadow-free roof area per kW

function domesticCategory(discom) {
  const cats = discom.categories || [];
  return cats.find(c => /domestic|residential|lmv-?1|lt-?1|^dom/i.test(c.name || c.id))
      || cats.find(c => /home|household/i.test(c.name || c.id))
      || cats[0] || null;
}

// Marginal energy rate at a monthly consumption — the rate solar units actually offset
// (solar shaves the top of your bill first). Walks the telescopic slabs.
function marginalRate(discom, units) {
  const cat = domesticCategory(discom);
  const st = cat && (cat.supplyTypes ? cat.supplyTypes[0] : cat);
  const slabs = (st && st.energySlabs) || [];
  let rate = 0, lower = 0;
  for (const s of slabs) {
    rate = s.rate;
    if (units <= (s.limit ?? Infinity)) break;
    lower = s.limit;
  }
  return rate || 0;
}

function render() {
  const state = $('ssState').value;
  const discom = getDiscoms(state).find(d => d.id === $('ssDiscom').value) || getDiscoms(state)[0];
  const box = $('ssResult');
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }

  const units = Math.max(1, Number($('ssUnits').value) || 0);
  const roofSqft = Number($('ssRoof').value) || 0;
  const roof = $('ssOwnRoof').value;

  if (roof === 'no') {
    box.innerHTML = `<div class="sub-cards"><div class="sub-card sub-muted">
      <div class="sub-card-head"><span class="sub-icon">🏠</span><div><strong>PM Surya Ghar needs a roof you own</strong>
      <span class="sub-verdict">Not eligible on a rented / shared roof</span></div></div>
      <div class="sub-card-body"><p>The subsidy is paid to the consumer who owns the rooftop. On a rented home the
      landlord can claim it, or a housing society can install a shared system under the group-housing (GHS/RWA)
      route — which has its own ₹18,000/kW subsidy up to 500 kW.</p></div></div></div>`;
    return;
  }

  // Size the system: solar sized to cover roughly the user's consumption (units/month ÷ ~120),
  // capped by roof area if given. PM Surya Ghar residential subsidy tops out at 3 kW.
  let suggest = Math.max(1, Math.round((units / 120) * 2) / 2);
  let roofCapped = false;
  if (roofSqft > 0) {
    const maxByRoof = Math.floor((roofSqft / SQFT_PER_KW) * 2) / 2;
    if (maxByRoof > 0 && maxByRoof < suggest) { suggest = maxByRoof; roofCapped = true; }
  }
  const subsidy = pmSuryaGharSubsidy(suggest);
  const gross = COST_PER_KW * suggest;
  const net = Math.max(0, gross - subsidy);
  const genYear = GEN_PER_KW_YEAR * suggest;
  const rate = marginalRate(discom, units);
  const saveYear = genYear * rate;
  const payback = saveYear > 0 ? net / saveYear : 0;

  box.innerHTML = `
    <div class="sub-cards">
      <div class="sub-card sub-good">
        <div class="sub-card-head"><span class="sub-icon">☀️</span>
          <div><strong>PM Surya Ghar central subsidy</strong>
          <span class="sub-verdict">${rupee(subsidy)} on a ${suggest} kW system</span></div></div>
        <div class="sub-card-body">
          <div class="rc-stats">
            <div class="rc-stat"><span class="rc-stat-label">Suggested size</span>
              <span class="rc-stat-value">${suggest}<small> kW</small></span></div>
            <div class="rc-stat"><span class="rc-stat-label">Central subsidy</span>
              <span class="rc-stat-value">${rupee(subsidy)}</span></div>
            <div class="rc-stat rc-stat-hero"><span class="rc-stat-label">Net cost after subsidy</span>
              <span class="rc-stat-value">${rupee(net)}</span></div>
          </div>
          <p class="rc-note">Sized to cover your ~${units} units/month${roofCapped ? ` (capped by your ${roofSqft} sq ft roof)` : ''}.
          The central subsidy is fixed at <strong>₹30,000/kW for the first 2 kW and ₹18,000 for the 3rd</strong>
          (max ₹78,000 at 3 kW). Gross cost is a benchmark <strong>~${rupee(COST_PER_KW)}/kW</strong>; your quote
          will vary. <strong>Many states add a top-up subsidy</strong> on the central amount — check your state
          nodal agency.</p>
        </div>
      </div>

      <div class="sub-card sub-good">
        <div class="sub-card-head"><span class="sub-icon">💰</span>
          <div><strong>Estimated savings & payback</strong>
          <span class="sub-verdict">${saveYear > 0 ? `≈ ${rupee(saveYear)}/year saved` : 'Enter usage to estimate'}</span></div></div>
        <div class="sub-card-body">
          <p>A ${suggest} kW system generates about <strong>${Math.round(genYear).toLocaleString('en-IN')} units/year</strong>
          (~4 units/kW/day). At ${esc(discom.name)}'s marginal rate of about <strong>${rate ? '₹' + rate.toFixed(2) : '—'}/unit</strong>
          for your usage, that's roughly <strong>${rupee(saveYear)}/year</strong>${payback > 0 ? `, so the net cost pays
          back in about <strong>${payback.toFixed(1)} years</strong>` : ''}. After that it's near-free power for the
          system's 25-year life.</p>
          <p class="sub-links"><a href="/?state=${encodeURIComponent(state)}&discom=${encodeURIComponent(discom.id)}#calculator">See your current bill →</a>
          &nbsp;·&nbsp; <a href="/solar-calculator/">Full net-metering payback →</a></p>
        </div>
      </div>

      <div class="sub-card">
        <div class="sub-card-head"><span class="sub-icon">✅</span>
          <div><strong>Are you eligible?</strong><span class="sub-verdict">Residential rooftop</span></div></div>
        <div class="sub-card-body">
          <ul class="ss-check">
            <li>A residential electricity connection in your name</li>
            <li>Your own rooftop with shadow-free space (~${SQFT_PER_KW} sq ft per kW)</li>
            <li>No existing rooftop-solar subsidy already claimed on the connection</li>
          </ul>
          <p class="sub-links"><a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener nofollow">Register on the national portal →</a></p>
        </div>
      </div>
    </div>`;
}

function populateDiscoms(preselect) {
  const sel = $('ssDiscom');
  const discoms = getDiscoms($('ssState').value);
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (preselect && discoms.some(d => d.id === preselect)) sel.value = preselect;
  render();
}

function init() {
  const stateSel = $('ssState');
  if (!stateSel) return; // not on this page
  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  const params = new URLSearchParams(location.search);
  const wantState = params.get('state');
  stateSel.value = (wantState && states.includes(wantState)) ? wantState
                 : states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0];
  const wantUnits = Number(params.get('units'));
  if (wantUnits > 0) $('ssUnits').value = wantUnits;
  populateDiscoms(params.get('discom'));

  stateSel.addEventListener('change', () => populateDiscoms());
  $('ssDiscom').addEventListener('change', render);
  for (const id of ['ssUnits', 'ssRoof', 'ssOwnRoof']) $(id).addEventListener('input', render);
  $('ssOwnRoof').addEventListener('change', render);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
