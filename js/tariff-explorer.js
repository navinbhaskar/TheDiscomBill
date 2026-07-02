// tariff-explorer.js — powers the Electricity Tariff reference page (/tariffs/).
// Lets the user browse the real tariff schedule (energy slabs, fixed charge, duties) for any
// State → DISCOM → consumer category, straight from the same data the calculator uses.

import { TARIFF_DB, STATE_META, getStates, getDiscoms } from './tariffs/registry.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
// Must match the slug used by generate-seo.js so the reflected URL points at the real static page.
const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const discomPageUrl = (state, discomId) => `/tariffs/${slugify(state)}/${discomId}/`;

// ── Renderers for the pieces of a tariff ─────────────────────────────────────
function slabRange(prev, limit) {
  if (limit === Infinity || limit == null) return `Above ${prev}`;
  if (prev === 0) return `0 – ${limit}`;
  return `${prev} – ${limit}`;
}

function energySlabsHtml(slabs) {
  if (!Array.isArray(slabs) || !slabs.length) return '<p class="tx-muted">Not specified.</p>';
  let prev = 0;
  const rows = slabs.map(s => {
    const range = slabRange(prev, s.limit);
    prev = (s.limit === Infinity || s.limit == null) ? prev : s.limit;
    const note = s.label ? ` <span class="tx-muted">(${esc(s.label)})</span>` : '';
    return `<tr><td>${range} <span class="tx-muted">units</span>${note}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">/unit</span></td></tr>`;
  }).join('');
  return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
}

function fixedChargeHtml(fc) {
  if (fc == null) return '<span class="tx-muted">—</span>';
  if (typeof fc === 'number') return `<strong>${rupee(fc)}</strong> <span class="tx-muted">/ month (flat)</span>`;
  if (fc.type === 'per_kw')  return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kW / month</span>`;
  if (fc.type === 'per_kva') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kVA / month</span>`;
  if (fc.type === 'tiered' && Array.isArray(fc.slabs)) {
    const rows = fc.slabs.map(s => {
      const label = s.label || (s.maxLoad === Infinity ? 'Above limit' : `Up to ${s.maxLoad} kW`);
      return `<tr><td>${esc(label)}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">/mo</span></td></tr>`;
    }).join('');
    return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
  }
  if (typeof fc.rate === 'number') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ month</span>`;
  return '<span class="tx-muted">—</span>';
}

function additionalChargesHtml(arr) {
  if (!Array.isArray(arr) || !arr.length) return '';
  const items = arr.map(a => {
    const isPct = a.type && String(a.type).includes('percent');
    const val = isPct ? `${a.rate}%` : rupee(a.rate);
    return `<li><span>${esc(a.name || 'Charge')}</span><strong>${val}</strong></li>`;
  }).join('');
  return `<div class="tariff-field"><div class="tariff-field-label">Additional charges</div><ul class="tariff-addl">${items}</ul></div>`;
}

// A rate-bearing block (a category without supply types, or one supply type).
function tariffBlockHtml(obj) {
  return `
    <div class="tariff-block">
      <div class="tariff-field">
        <div class="tariff-field-label">Fixed charge</div>
        <div class="tariff-field-value">${fixedChargeHtml(obj.fixedCharge)}</div>
      </div>
      <div class="tariff-field">
        <div class="tariff-field-label">Energy charges</div>
        ${energySlabsHtml(obj.energySlabs)}
      </div>
      ${additionalChargesHtml(obj.additionalCharges)}
    </div>`;
}

function categoryCardHtml(cat) {
  const hasSupplyTypes = Array.isArray(cat.supplyTypes) && cat.supplyTypes.length > 0;
  let body;
  if (hasSupplyTypes) {
    body = cat.supplyTypes.map(st => `
      <div class="tariff-supplytype">
        <div class="tariff-st-name">${esc(st.name || st.id)}</div>
        ${st.description ? `<p class="tariff-st-desc">${esc(st.description)}</p>` : ''}
        ${tariffBlockHtml(st)}
      </div>`).join('');
  } else {
    body = tariffBlockHtml(cat);
  }
  const icon = /commerc|non.?domestic|lt-?2|lmv-?2|ned/i.test(cat.name || cat.id) ? '🏪'
             : /industr/i.test(cat.name || cat.id) ? '🏭'
             : /agri/i.test(cat.name || cat.id) ? '🌾' : '🏠';
  return `
    <article class="tariff-card">
      <header class="tariff-card-head">
        <span class="tariff-card-icon">${icon}</span>
        <div>
          <h3>${esc(cat.name || cat.id)}</h3>
          ${cat.description && !hasSupplyTypes ? `<p class="tariff-card-desc">${esc(cat.description)}</p>` : ''}
        </div>
      </header>
      ${body}
      ${cat.notes ? `<p class="tariff-card-note">ℹ️ ${esc(cat.notes)}</p>` : ''}
    </article>`;
}

// ── Page wiring ──────────────────────────────────────────────────────────────
function renderDiscom(state, discomId) {
  const discoms = getDiscoms(state);
  const discom = discoms.find(d => d.id === discomId) || discoms[0];
  if (!discom) { $('tariffCards').innerHTML = '<p class="tx-muted">No tariff data for this selection.</p>'; return; }

  const meta = STATE_META[state] || {};
  const badges = [];
  if (meta.verified) badges.push('<span class="tariff-badge verified">✓ Verified rates</span>');
  if (discom.tariffYear || meta.ratesAsOf) badges.push(`<span class="tariff-badge">FY ${esc(discom.tariffYear || meta.ratesAsOf)}</span>`);
  const src = discom.website || meta.sourceUrl;

  const pageUrl = discomPageUrl(state, discom.id);
  $('tariffDiscomMeta').innerHTML = `
    <div class="tariff-discom-headrow">
      <div>
        <div class="tariff-discom-name">${esc(discom.fullName || discom.name)}</div>
        ${discom.area ? `<div class="tariff-discom-area">Service area: ${esc(discom.area)}</div>` : ''}
      </div>
      <div class="tariff-badges">${badges.join('')}</div>
    </div>
    <div class="tariff-meta-links">
      <a class="tariff-pagelink" href="${esc(pageUrl)}">Open full ${esc(discom.name)} page ↗</a>
      ${src ? `<a class="tariff-source" href="${esc(src)}" target="_blank" rel="noopener">Official source ↗</a>` : ''}
    </div>`;

  $('tariffCards').innerHTML = (discom.categories || []).map(categoryCardHtml).join('')
    || '<p class="tx-muted">No categories listed.</p>';

  // Reflect the selection in the address bar using the canonical per-DISCOM URL. A real static
  // page exists at this path (built by generate-seo.js), so the URL is shareable and reloads
  // straight to the full page. replaceState avoids spamming the back button as dropdowns change.
  try { history.replaceState(null, '', pageUrl); } catch (e) {}
}

function populateDiscoms(state, preselectId) {
  const sel = $('tariffDiscom');
  const discoms = getDiscoms(state);
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (preselectId && discoms.some(d => d.id === preselectId)) sel.value = preselectId;
  renderDiscom(state, sel.value);
}

function init() {
  const stateSel = $('tariffState');
  if (!stateSel) return; // not on the tariff page

  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  // Default to a verified state (Uttar Pradesh) when available, else the first.
  const def = states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0];
  stateSel.value = def;
  populateDiscoms(def);

  stateSel.addEventListener('change', () => populateDiscoms(stateSel.value));
  $('tariffDiscom').addEventListener('change', () => renderDiscom(stateSel.value, $('tariffDiscom').value));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
