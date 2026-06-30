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
    const populate = () => {
      const discoms = getDiscoms(stateSel.value);
      discomSel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
      draw();
    };

    stateSel.value = states.includes(defaultState) ? defaultState : states[0];
    populate();
    stateSel.addEventListener('change', populate);
    discomSel.addEventListener('change', draw);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
}
