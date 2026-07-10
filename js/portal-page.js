// portal-page.js — shared wiring for the "pick State → DISCOM, then go to the official
// portal" pages (New Connection, Register Complaint). Each page supplies its own renderResult()
// that builds the result card; this module owns the dropdowns and the official-URL helper.

import { getStates, getDiscoms } from './tariffs/registry.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Absolute, safe URL to the DISCOM's official site; falls back to a web search with a context
// suffix (e.g. "new electricity connection" / "complaint") when no website is on record.
export function portalUrl(discom, searchSuffix = '') {
  if (discom && discom.website) {
    return /^https?:\/\//i.test(discom.website) ? discom.website : 'https://' + discom.website;
  }
  const name = (discom && (discom.fullName || discom.name)) || 'electricity board';
  return 'https://www.google.com/search?q=' + encodeURIComponent(`${name} ${searchSuffix}`.trim());
}

export const hostOf = (url) => url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

// ── Per-DISCOM facts strip ────────────────────────────────────────────────────
// The service tabs used to render the same template with only the name swapped.
// This block injects facts unique to the selected DISCOM (rates, tariff year,
// LPSC, category count — all straight from the tariff DB) plus deep links to its
// tariff page and pre-filled calculator, so each selection shows real content.

const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Domestic slab-rate span for a DISCOM (mirrors the build-time helper in generate-seo.js).
function domesticRates(discom) {
  const cats = discom.categories || [];
  const cat = cats.find(c => /domestic|residential|lmv-?1|lt-?1|^dom/i.test(c.name || c.id))
      || cats.find(c => /home|household/i.test(c.name || c.id))
      || cats[0] || null;
  if (!cat) return null;
  const blocks = (cat.supplyTypes && cat.supplyTypes.length) ? cat.supplyTypes : [cat];
  const rates = [];
  for (const b of blocks) for (const s of (b.energySlabs || [])) if (typeof s.rate === 'number') rates.push(s.rate);
  if (!rates.length) return null;
  return { min: Math.min(...rates), max: Math.max(...rates), catName: cat.name };
}

export function discomFactsHtml(state, discom) {
  if (!discom) return '';
  const dr = domesticRates(discom);
  const fy = discom.tariffYear || '';
  const nCats = (discom.categories || []).length;
  const tariffUrl = `/tariffs/${slugify(state)}/${encodeURIComponent(discom.id)}/`;
  const calcUrl = `/?state=${encodeURIComponent(state)}&discom=${encodeURIComponent(discom.id)}#calculator`;
  const facts = [];
  if (dr) facts.push(`<span class="svc-fact"><strong>${rupee(dr.min)}–${rupee(dr.max)}</strong>/unit domestic</span>`);
  if (fy) facts.push(`<span class="svc-fact"><strong>${esc(fy)}</strong> tariff</span>`);
  if (discom.lpscRate != null) facts.push(`<span class="svc-fact"><strong>${esc(discom.lpscRate)}%</strong>/mo late fee</span>`);
  if (nCats) facts.push(`<span class="svc-fact"><strong>${nCats}</strong> tariff categories</span>`);
  if (!facts.length) return '';
  return `
    <div class="svc-facts">
      <div class="svc-facts-row">${facts.join('')}</div>
      <div class="svc-facts-links">
        <a href="${esc(tariffUrl)}">Full ${esc(discom.name)} tariff &amp; rates →</a>
        <a href="${esc(calcUrl)}">Calculate a ${esc(discom.name)} bill →</a>
        <a href="/smart-meter-recharge/${slugify(state)}/${encodeURIComponent(discom.id)}/">Smart meter recharge guide →</a>
      </div>
    </div>`;
}

/**
 * Wire up a portal page.
 * @param {object} cfg
 * @param {string} cfg.stateId   - id of the state <select>
 * @param {string} cfg.discomId  - id of the DISCOM <select>
 * @param {string} cfg.resultId  - id of the container to render into
 * @param {(box:HTMLElement, state:string, discom:object)=>void} cfg.renderResult
 * @param {string} [cfg.defaultState]
 */
export function initPortalPage({ stateId, discomId, resultId, renderResult, defaultState = 'Uttar Pradesh' }) {
  const run = () => {
    const stateSel = document.getElementById(stateId);
    const discomSel = document.getElementById(discomId);
    const box = document.getElementById(resultId);
    if (!stateSel || !discomSel || !box) return; // not on this page

    const states = getStates();
    stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

    const draw = () => {
      const discoms = getDiscoms(stateSel.value);
      const discom = discoms.find(d => d.id === discomSel.value) || discoms[0];
      renderResult(box, stateSel.value, discom);
    };
    const populate = (preselectDiscom) => {
      const discoms = getDiscoms(stateSel.value);
      discomSel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
      if (preselectDiscom && discoms.some(d => d.id === preselectDiscom)) discomSel.value = preselectDiscom;
      draw();
    };

    // Deep-link support: /new-connection/?state=Uttar%20Pradesh&discom=mvvnl preselects the DISCOM.
    const params = new URLSearchParams(location.search);
    const wantState = params.get('state');
    const wantDiscom = params.get('discom');
    stateSel.value = (wantState && states.includes(wantState)) ? wantState
                   : states.includes(defaultState) ? defaultState : states[0];
    populate(wantDiscom);
    stateSel.addEventListener('change', populate);
    discomSel.addEventListener('change', draw);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
}
