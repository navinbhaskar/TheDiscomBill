// subsidy-checker.js — Electricity Subsidy Eligibility Checker (/subsidy-checker/).
// Three schemes, checked for the user's state + usage:
//   1. PM Surya Ghar rooftop-solar subsidy — a KNOWN central formula, computed exactly.
//   2. State free-units / lifeline domestic scheme — read from js/tariffs/subsidy.js
//      (the same authoritative map the bill engine uses), benefit estimated from the
//      DISCOM's real first-slab energy rate.
//   3. Agricultural power — eligibility guidance only; farm tariffs are state-specific
//      and change often, so we flag likely eligibility and link out rather than invent rates.

import { getStates, getDiscoms } from './tariffs/registry.js';
import { DOMESTIC_SUBSIDY } from './tariffs/subsidy.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rupee = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// PM Surya Ghar central subsidy: ₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd,
// capped at ₹78,000 for 3 kW+. (Muft Bijli Yojana, in force since 2024.)
function pmSuryaGharSubsidy(kw) {
  const s = 30000 * Math.min(kw, 2) + 18000 * Math.min(Math.max(kw - 2, 0), 1);
  return Math.min(s, 78000);
}

function domesticCategory(discom) {
  const cats = discom.categories || [];
  return cats.find(c => /domestic|residential|lmv-?1|lt-?1|^dom/i.test(c.name || c.id))
      || cats.find(c => /home|household/i.test(c.name || c.id))
      || cats[0] || null;
}

// First telescopic slab energy rate for the domestic category — the rate the free-units
// waiver removes (the engine's conservative free-units model waives energy charge only).
function firstSlabRate(discom) {
  const cat = domesticCategory(discom);
  const st = cat && (cat.supplyTypes ? cat.supplyTypes[0] : cat);
  const slabs = st && st.energySlabs;
  return (slabs && slabs.length && slabs[0].rate) || 0;
}

function card(icon, title, verdict, bodyHtml, tone) {
  return `<div class="sub-card sub-${tone}">
    <div class="sub-card-head"><span class="sub-icon">${icon}</span>
      <div><strong>${esc(title)}</strong><span class="sub-verdict">${verdict}</span></div></div>
    <div class="sub-card-body">${bodyHtml}</div>
  </div>`;
}

function renderDomestic(state, discom, units, roof) {
  const cards = [];

  // 1. PM Surya Ghar
  if (roof === 'yes') {
    // Size ≈ monthly units ÷ 120 kWh/kW·month (~4 sun-hours). Max central subsidy at 3 kW.
    const suggest = Math.max(1, Math.round((units / 120) * 2) / 2);
    const subsidyKw = Math.min(suggest, 3);
    const subsidy = pmSuryaGharSubsidy(subsidyKw);
    cards.push(card('☀️', 'PM Surya Ghar (rooftop solar)', `Up to ${rupee(subsidy)} central subsidy`,
      `<p>For your ~${units} units/month, a <strong>${suggest} kW</strong> system is a sensible fit. The central
      subsidy on that is <strong>${rupee(subsidy)}</strong>${suggest > 3 ? ' (the ₹78,000 cap applies beyond 3 kW)' : ''},
      and many states add a top-up. You keep generating free power for 25+ years after payback.</p>
      <p class="sub-links"><a href="/solar-calculator/">Estimate full payback on your bill →</a>
      &nbsp;·&nbsp; <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener nofollow">Apply on the portal →</a></p>`,
      'good'));
  } else {
    cards.push(card('☀️', 'PM Surya Ghar (rooftop solar)', 'Needs your own roof',
      `<p>The rooftop-solar subsidy (up to ₹78,000) needs a roof you own. On a rented or shared roof you can't
      claim it directly — but a landlord can, or you can look at a community/group-housing solar arrangement.</p>`,
      'muted'));
  }

  // 2. State free-units / lifeline
  const scheme = DOMESTIC_SUBSIDY[state];
  if (scheme && scheme.type === 'free-units') {
    const rate = firstSlabRate(discom);
    const freeApplied = Math.min(units, scheme.units);
    const monthly = freeApplied * rate;
    cards.push(card('🏠', 'State free-units subsidy', monthly > 0 ? `≈ ${rupee(monthly)}/month saved` : 'You qualify',
      `<p>${esc(scheme.label)}. On your ~${units} units, that waives the energy charge on about
      <strong>${Math.round(freeApplied)} units</strong>${rate > 0 ? ` — roughly <strong>${rupee(monthly)}/month</strong>
      (${rupee(monthly * 12)}/year)` : ''}. Fixed charge, fuel surcharge and duty still apply on the rest.</p>
      <p class="sub-links"><a href="/?state=${encodeURIComponent(state)}&discom=${encodeURIComponent(discom.id)}#calculator">See it applied on a full bill →</a></p>`,
      'good'));
  } else if (scheme && scheme.type === 'delhi-gnctd') {
    cards.push(card('🏠', 'Delhi domestic subsidy', units <= 200 ? 'Likely a nil energy bill' : 'Partial rebate',
      `<p>${esc(scheme.label)}. At ~${units} units/month you fall in the
      <strong>${units <= 200 ? '≤200-unit (nil energy charge)' : units <= 400 ? '201–400 (50% on the first 200 units)' : 'above-400 (no rebate)'}</strong>
      band. The subsidy is applied automatically if you've opted in with BSES/TPDDL.</p>`,
      units <= 400 ? 'good' : 'muted'));
  } else {
    cards.push(card('🏠', 'State free-units subsidy', 'None modelled for your state',
      `<p>We don't have a statewide free-units scheme on record for ${esc(state)}. Some DISCOMs still run a
      cheaper <strong>lifeline slab</strong> for very low consumption (often the first 30–50 units). Check your
      DISCOM's <a href="/tariffs/${state.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/">domestic tariff</a> for a lifeline rate.</p>`,
      'muted'));
  }

  // 3. Lifeline nudge for very low users where no free-units scheme applies
  if (!scheme && units <= 50) {
    cards.push(card('💡', 'Lifeline slab', 'Likely eligible',
      `<p>At ${units} units/month you're in the range most states price at a subsidised lifeline rate. It's applied
      automatically by slab, but confirm the first-slab rate on your <a href="/glossary/#telescopic-slabs">slab-wise
      tariff</a>.</p>`, 'good'));
  }

  return cards.join('');
}

function renderAgricultural(state) {
  return card('🚜', 'Agricultural power subsidy', 'Likely eligible — state scheme',
    `<p>Most states supply metered or flat-rate <strong>agricultural pump-set</strong> connections free or at a
    heavily subsidised tariff, funded by a state subsidy to the DISCOM. The exact rule for ${esc(state)} —
    free vs. flat ₹/HP, metering, and any horsepower cap — is set in your state's tariff order and changes
    often. Apply through your DISCOM's agricultural connection scheme and confirm the current farm tariff.</p>
    <p class="sub-links"><a href="/tariffs/${state.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/">See ${esc(state)} tariffs →</a>
    &nbsp;·&nbsp; <a href="/new-connection/">New connection help →</a></p>`, 'good');
}

function render() {
  const type = $('subType').value;
  const state = $('subState').value;
  const discom = getDiscoms(state).find(d => d.id === $('subDiscom').value) || getDiscoms(state)[0];
  const box = $('subResult');
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }

  // Toggle domestic-only inputs.
  document.querySelectorAll('[data-role="domestic"]').forEach(el => { el.style.display = type === 'domestic' ? '' : 'none'; });

  let cards;
  if (type === 'agricultural') {
    cards = renderAgricultural(state);
  } else {
    const units = Math.max(1, Number($('subUnits').value) || 0);
    cards = renderDomestic(state, discom, units, $('subRoof').value);
  }
  box.innerHTML = `<div class="sub-cards">${cards}</div>`;
}

function populateDiscoms(preselect) {
  const sel = $('subDiscom');
  const discoms = getDiscoms($('subState').value);
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (preselect && discoms.some(d => d.id === preselect)) sel.value = preselect;
  render();
}

function init() {
  const stateSel = $('subState');
  if (!stateSel) return; // not on this page
  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  const params = new URLSearchParams(location.search);
  const wantState = params.get('state');
  stateSel.value = (wantState && states.includes(wantState)) ? wantState
                 : states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0];
  const wantUnits = Number(params.get('units'));
  if (wantUnits > 0) $('subUnits').value = wantUnits;
  if (params.get('type') === 'agricultural') $('subType').value = 'agricultural';
  populateDiscoms(params.get('discom'));

  stateSel.addEventListener('change', () => populateDiscoms());
  $('subDiscom').addEventListener('change', render);
  $('subType').addEventListener('change', render);
  $('subRoof').addEventListener('change', render);
  $('subUnits').addEventListener('input', render);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
