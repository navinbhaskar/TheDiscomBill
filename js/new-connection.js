// new-connection.js — New Electricity Connection page (/new-connection/).
// Pick State → DISCOM, then jump to that DISCOM's official portal to apply. Also lays out the
// typical process, documents and charges so users know what to expect before they apply.

import { initPortalPage, esc, portalUrl, hostOf } from './portal-page.js';

const STEPS = [
  ['Apply', 'Submit the new-connection application online on the DISCOM portal (or at the local office).'],
  ['Documents', 'Upload ID proof, address proof and ownership/occupancy proof.'],
  ['Inspection', 'The DISCOM inspects the site and confirms technical feasibility & sanctioned load.'],
  ['Demand note', 'Pay the demand note — security deposit, processing/registration fee and meter cost.'],
  ['Energisation', 'Meter is installed and the connection is energised, usually within the notified service timeline.'],
];

const DOCS = [
  'Photo ID — Aadhaar / Voter ID / Passport / Driving Licence',
  'Address proof — Aadhaar / ration card / registry / tax receipt',
  'Ownership or occupancy proof — sale deed / rent agreement / NOC',
  'Recent passport-size photograph',
  'Load requirement (kW) & wiring/contractor test report (if applicable)',
];

function renderResult(box, state, discom) {
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }
  const url = portalUrl(discom, 'new electricity connection apply');
  const steps = STEPS.map(([t, d], i) =>
    `<li><span class="svc-step-num">${i + 1}</span><div><strong>${esc(t)}</strong><span>${esc(d)}</span></div></li>`).join('');
  const docs = DOCS.map(d => `<li>${esc(d)}</li>`).join('');

  box.innerHTML = `
    <div class="svc-card">
      <div class="svc-discom">
        <span class="svc-icon">🔌</span>
        <div>
          <div class="svc-name">${esc(discom.fullName || discom.name)}</div>
          ${discom.area ? `<div class="svc-area">${esc(discom.area)}</div>` : ''}
        </div>
      </div>
      <a class="svc-cta" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
        Apply for a new connection on the official ${esc(discom.name)} portal
        <span class="svc-cta-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="svc-host">Opens <strong>${esc(hostOf(url))}</strong> in a new tab</div>
    </div>

    <div class="svc-info-grid">
      <div class="svc-info-card">
        <h3 class="svc-info-title">How the process works</h3>
        <ol class="svc-steps">${steps}</ol>
      </div>
      <div class="svc-info-card">
        <h3 class="svc-info-title">Documents you'll need</h3>
        <ul class="svc-docs">${docs}</ul>
        <p class="svc-charge-note">💡 Charges (security deposit, processing fee, meter cost) vary by load,
        category and state. See indicative <a href="/tariffs/">fixed charges &amp; tariffs</a>; the exact
        demand note comes from your DISCOM.</p>
      </div>
    </div>`;
}

initPortalPage({ stateId: 'ncState', discomId: 'ncDiscom', resultId: 'ncResult', renderResult });
