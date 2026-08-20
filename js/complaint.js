// complaint.js — Register Electricity Complaint page (/complaint/).
// Pick State → DISCOM, then jump to that DISCOM's official complaint portal. Also surfaces the
// 24×7 national power helpline (1912) and the escalation path (CGRF → Electricity Ombudsman).

import { initPortalPage, esc, portalUrl, hostOf, discomFactsHtml } from './portal-page.js';

// Each row carries its icon as complete markup rather than a name to build a class from.
// split-css keeps a CSS rule only when it finds the class as a literal — in page markup, or
// in a `class="..."` attribute inside JS — and deliberately does not sweep bare strings,
// because that drags the i18n tables in and inflates the sheet. So `class="ico ${name}"` left
// all six of these unpainted in content.min.css while looking correct in styles.min.css.
//
// The icons are chosen for meaning, replacing emoji that were approximations: the old
// "new-connection delay" glyph was a sewing needle, and "hanging wires" was a tree.
const COMPLAINT_TYPES = [
  ['<span class="ico ico-bolt" aria-hidden="true"></span>', 'No power supply / outage'],
  ['<span class="ico ico-receipt" aria-hidden="true"></span>', 'Wrong or excessive bill'],
  ['<span class="ico ico-gauge" aria-hidden="true"></span>', 'Faulty / fast-running meter'],
  ['<span class="ico ico-voltdown" aria-hidden="true"></span>', 'Low or fluctuating voltage'],
  ['<span class="ico ico-clock" aria-hidden="true"></span>', 'New-connection delay'],
  ['<span class="ico ico-alert" aria-hidden="true"></span>', 'Hanging wires / safety hazard'],
];

function renderResult(box, state, discom) {
  if (!discom) { box.innerHTML = '<p class="tx-muted">No DISCOM data for this selection.</p>'; return; }
  const url = portalUrl(discom, 'electricity complaint register');
  const types = COMPLAINT_TYPES.map(([i, t]) =>
    `<li><span class="svc-row-icon">${i}</span>${esc(t)}</li>`).join('');

  box.innerHTML = `
    <div class="svc-card">
      <div class="svc-discom">
        <span class="svc-icon"><span class="ico ico-megaphone" aria-hidden="true"></span></span>
        <div>
          <div class="svc-name">${esc(discom.fullName || discom.name)}</div>
          ${discom.area ? `<div class="svc-area">${esc(discom.area)}</div>` : ''}
        </div>
      </div>
      <a class="svc-cta" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
        Register a complaint on the official ${esc(discom.name)} portal
        <span class="svc-cta-arrow" aria-hidden="true"><span class="ico ico-external"></span></span>
      </a>
      <div class="svc-host">Opens <strong>${esc(hostOf(url))}</strong> in a new tab</div>

      <ul class="svc-types">${types}</ul>
      ${discomFactsHtml(state, discom)}
    </div>

    <p class="svc-escalate">If your complaint isn't resolved in the notified time, escalate to the DISCOM's
    <strong>Consumer Grievance Redressal Forum (CGRF)</strong>, and then to the
    <strong>Electricity Ombudsman</strong> of your state regulatory commission.</p>`;
}

function initHelpline() {
  // The 1912 helpline is national and static — wire it once, independent of the DISCOM selection.
  const el = document.getElementById('helplineCall');
  if (el) el.setAttribute('href', 'tel:1912');
}

initPortalPage({ stateId: 'cmpState', discomId: 'cmpDiscom', resultId: 'cmpResult', renderResult });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHelpline);
else initHelpline();
