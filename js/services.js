// services.js — tab switching for the DISCOM Services hub (/services/).
// The four service forms are wired by their own modules (bill-check.js, new-connection.js,
// complaint.js); this only controls which tab/panel is visible and mirrors it in the URL hash
// so /services/#complaint deep-links straight to the right tab. It also carries the chosen
// State + DISCOM from the tab you leave to the tab you open, so switching tabs keeps your
// selection instead of snapping back to each tab's own default.

const TABS = ['pay', 'new-connection', 'complaint', 'helplines'];

// State + DISCOM <select> ids per tab (Helplines has none).
const SELECTS = {
  'pay': { state: 'billCheckState', discom: 'billCheckDiscom' },
  'new-connection': { state: 'ncState', discom: 'ncDiscom' },
  'complaint': { state: 'cmpState', discom: 'cmpDiscom' },
};

function run() {
  const tablist = document.querySelector('.svc-tabs');
  if (!tablist) return;
  const buttons = [...tablist.querySelectorAll('.comp-tab')];
  const panelOf = (t) => document.getElementById('panel-' + t);

  // Tab content sits inside display:none panels, so the scroll-reveal observer never sees it.
  // Reveal it up front so switching tabs shows the content immediately instead of blank.
  document.querySelectorAll('.svc-tabpanel .reveal').forEach(el => el.classList.add('is-visible'));

  // Read the current State + DISCOM off a tab's own selects.
  const readSel = (tab) => {
    const ids = SELECTS[tab];
    if (!ids) return null;
    const s = document.getElementById(ids.state), d = document.getElementById(ids.discom);
    if (!s || !d || !s.value) return null;
    return { state: s.value, discom: d.value };
  };

  // Apply a State + DISCOM onto a tab's selects, dispatching the same `change` events the
  // per-tab modules listen for (state → repopulate DISCOMs + render; DISCOM → render).
  const applySel = (tab, sel) => {
    const ids = SELECTS[tab];
    if (!ids || !sel) return;
    const s = document.getElementById(ids.state), d = document.getElementById(ids.discom);
    if (!s || !d) return;
    if (sel.state && s.value !== sel.state && [...s.options].some(o => o.value === sel.state)) {
      s.value = sel.state;
      s.dispatchEvent(new Event('change'));   // module repopulates the DISCOM list for this state
    }
    if (sel.discom && [...d.options].some(o => o.value === sel.discom) && d.value !== sel.discom) {
      d.value = sel.discom;
      d.dispatchEvent(new Event('change'));   // module re-renders the result card
    }
  };

  // The State + DISCOM last chosen by the user, carried between tabs.
  let shared = null;
  let current = null;

  function activate(target, updateHash = true) {
    if (!TABS.includes(target)) target = 'pay';

    // Remember what was selected on the tab we're leaving, so the tab we open inherits it.
    if (current && current !== target) {
      const leaving = readSel(current);
      if (leaving) shared = leaving;
    }

    buttons.forEach(b => {
      const on = b.dataset.target === target;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    TABS.forEach(t => {
      const p = panelOf(t);
      if (!p) return;
      const on = t === target;
      p.classList.toggle('active', on);
      p.hidden = !on;
    });

    current = target;
    if (shared) applySel(target, shared);   // no-op for Helplines / on first paint (selects still empty)

    if (updateHash) history.replaceState(null, '', location.pathname + location.search + '#' + target);
  }

  buttons.forEach(b => b.addEventListener('click', () => activate(b.dataset.target)));
  window.addEventListener('hashchange', () => activate((location.hash || '').replace('#', ''), false));

  const initial = (location.hash || '').replace('#', '');
  activate(TABS.includes(initial) ? initial : 'pay', false);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
else run();
