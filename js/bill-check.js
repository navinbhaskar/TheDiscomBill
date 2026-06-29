// bill-check.js — powers the Bill Check page (/bill-check/).
// The user picks their State → DISCOM, and we surface a one-click link to that DISCOM's
// OFFICIAL website (its bill-view / quick-pay portal) so they can check or pay their bill
// on the authoritative source. We never collect any consumer/account details here.

import { TARIFF_DB, getStates, getDiscoms } from './tariffs/registry.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Build a safe absolute URL from the DISCOM's website field; fall back to a web search.
function portalUrl(discom) {
  if (discom.website) {
    return /^https?:\/\//i.test(discom.website) ? discom.website : 'https://' + discom.website;
  }
  return 'https://www.google.com/search?q=' + encodeURIComponent((discom.fullName || discom.name) + ' electricity bill payment');
}

function renderResult(state, discomId) {
  const discoms = getDiscoms(state);
  const discom = discoms.find(d => d.id === discomId) || discoms[0];
  const box = $('billCheckResult');
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }

  const url = portalUrl(discom);
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  box.innerHTML = `
    <div class="billcheck-card">
      <div class="billcheck-discom">
        <span class="billcheck-icon">🔍</span>
        <div>
          <div class="billcheck-name">${esc(discom.fullName || discom.name)}</div>
          ${discom.area ? `<div class="billcheck-area">${esc(discom.area)}</div>` : ''}
        </div>
      </div>

      <a class="billcheck-cta" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
        Check &amp; Pay your bill on the official ${esc(discom.name)} portal
        <span class="billcheck-cta-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="billcheck-host">Opens <strong>${esc(host)}</strong> in a new tab</div>

      <ul class="billcheck-todo">
        <li>View your latest bill &amp; due date</li>
        <li>Pay online (UPI / card / net-banking)</li>
        <li>Download bill &amp; payment receipts</li>
        <li>Check past consumption &amp; payment history</li>
      </ul>

      <p class="billcheck-safety">🔒 You'll be taken to the DISCOM's own website. TheDiscomBill never asks for your
      account number, OTP or password — only enter those on the official portal.</p>
    </div>`;
}

function populateDiscoms(state) {
  const sel = $('billCheckDiscom');
  const discoms = getDiscoms(state);
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  renderResult(state, sel.value);
}

function init() {
  const stateSel = $('billCheckState');
  if (!stateSel) return; // not on the bill-check page

  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  const def = states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0];
  stateSel.value = def;
  populateDiscoms(def);

  stateSel.addEventListener('change', () => populateDiscoms(stateSel.value));
  $('billCheckDiscom').addEventListener('change', () => renderResult(stateSel.value, $('billCheckDiscom').value));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
