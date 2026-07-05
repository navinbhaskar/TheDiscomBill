// services.js — tab switching for the DISCOM Services hub (/services/).
// The four service forms are wired by their own modules (bill-check.js, new-connection.js,
// complaint.js); this only controls which tab/panel is visible and mirrors it in the URL hash
// so /services/#complaint deep-links straight to the right tab.

const TABS = ['pay', 'new-connection', 'complaint', 'helplines'];

function run() {
  const tablist = document.querySelector('.svc-tabs');
  if (!tablist) return;
  const buttons = [...tablist.querySelectorAll('.comp-tab')];
  const panelOf = (t) => document.getElementById('panel-' + t);

  // Tab content sits inside display:none panels, so the scroll-reveal observer never sees it.
  // Reveal it up front so switching tabs shows the content immediately instead of blank.
  document.querySelectorAll('.svc-tabpanel .reveal').forEach(el => el.classList.add('is-visible'));

  function activate(target, updateHash = true) {
    if (!TABS.includes(target)) target = 'pay';
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
    if (updateHash) history.replaceState(null, '', location.pathname + location.search + '#' + target);
  }

  buttons.forEach(b => b.addEventListener('click', () => activate(b.dataset.target)));
  window.addEventListener('hashchange', () => activate((location.hash || '').replace('#', ''), false));

  const initial = (location.hash || '').replace('#', '');
  activate(TABS.includes(initial) ? initial : 'pay', false);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
else run();
