// js/alerts-ui.js — the header Alerts dropdown, and the filters on /alerts/.
//
// The /alerts/ feed itself is server-rendered by generate-seo.js: this module never builds it,
// it only filters what is already in the document. That split is deliberate — the notices are
// the page's indexable content and must exist without JavaScript.

import { formatAlertDate, getAlertStates, getAlertSummary, getPublicAlerts, getUsedAlertCategories } from './alerts-data.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pillClass = (c) => String(c).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const ALERT_LANGS = new Set(['en', 'hi', 'mr', 'ta']);
const ALERT_UI = {
  en: {
    latest: 'Latest updates',
    tracked: '{total} tracked',
    states: '{states} states',
    seeAll: 'See all {total} alerts',
    important: 'Important',
    info: 'Info',
    categories: {
      'Fuel surcharge': 'Fuel surcharge',
      'Tariff': 'Tariff',
      'Connection': 'Connection',
      'Subsidy': 'Subsidy',
      'Policy': 'Policy',
      'True-up': 'True-up',
    },
  },
  hi: {
    latest: 'ताज़ा अपडेट',
    tracked: '{total} ट्रैक किए गए',
    states: '{states} राज्य',
    seeAll: 'सभी {total} अलर्ट देखें',
    important: 'महत्वपूर्ण',
    info: 'जानकारी',
    categories: {
      'Fuel surcharge': 'ईंधन अधिभार',
      'Tariff': 'टैरिफ',
      'Connection': 'कनेक्शन',
      'Subsidy': 'सब्सिडी',
      'Policy': 'नीति',
      'True-up': 'ट्रू-अप',
    },
  },
  mr: {
    latest: 'ताजे अपडेट्स',
    tracked: '{total} ट्रॅक केले',
    states: '{states} राज्ये',
    seeAll: 'सर्व {total} अलर्ट पहा',
    important: 'महत्त्वाचे',
    info: 'माहिती',
    categories: {
      'Fuel surcharge': 'इंधन अधिभार',
      'Tariff': 'टॅरिफ',
      'Connection': 'कनेक्शन',
      'Subsidy': 'सबसिडी',
      'Policy': 'धोरण',
      'True-up': 'ट्रू-अप',
    },
  },
  ta: {
    latest: 'சமீபத்திய புதுப்பிப்புகள்',
    tracked: '{total} கண்காணிக்கப்பட்டவை',
    states: '{states} மாநிலங்கள்',
    seeAll: 'அனைத்து {total} அலர்ட்களையும் காண்க',
    important: 'முக்கியம்',
    info: 'தகவல்',
    categories: {
      'Fuel surcharge': 'எரிபொருள் கூடுதல் கட்டணம்',
      'Tariff': 'கட்டணம்',
      'Connection': 'இணைப்பு',
      'Subsidy': 'மானியம்',
      'Policy': 'கொள்கை',
      'True-up': 'ட்ரூ-அப்',
    },
  },
};
const currentLang = () => {
  const lang = String(document.documentElement.lang || 'en').slice(0, 2);
  return ALERT_LANGS.has(lang) ? lang : 'en';
};
const ui = (key, vars = {}, lang = currentLang()) => {
  const raw = (ALERT_UI[lang] || ALERT_UI.en)[key] || ALERT_UI.en[key] || '';
  return raw.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
};
const categoryLabel = (category, lang = currentLang()) =>
  (ALERT_UI[lang]?.categories?.[category]) || ALERT_UI.en.categories[category] || category;
const severityLabel = (severity, lang = currentLang()) =>
  severity === 'Important' ? ui('important', {}, lang) : ui('info', {}, lang);

// ── Header dropdown ──────────────────────────────────────────────────────────

// One row of the dropdown. Deliberately terser than a row on /alerts/: no summary, no source,
// no severity chip. This is a peek at what is new, and the whole point of it is that five of
// them can be read at a glance before deciding whether to open the full feed.
function dropdownItem(alert, lang = currentLang()) {
  return `
      <li class="alerts-nav-item">
        <a class="alerts-nav-link" href="${esc(alert.href || '/alerts/')}">
          <span class="alerts-nav-tags">
            <span class="alert-pill is-${esc(pillClass(alert.category))}">${esc(categoryLabel(alert.category, lang))}</span>
            <time datetime="${esc(alert.publishedDate || '')}">${esc(formatAlertDate(alert.publishedDate))}</time>
          </span>
          <strong>${esc(alert.title)}</strong>
          <span class="alerts-nav-state">${esc(alert.state)}</span>
        </a>
      </li>`;
}

export function renderAlertsDropdown(menu) {
  if (!menu) return;
  const alerts = getPublicAlerts();
  const summary = getAlertSummary(alerts);
  const recent = alerts.slice(0, 5);
  const lang = currentLang();
  menu.innerHTML = `
    <div class="alerts-nav-head">
      <strong>${esc(ui('latest', {}, lang))}</strong>
      <span>${esc(ui('tracked', { total: summary.total }, lang))} · ${esc(ui('states', { states: summary.states }, lang))}</span>
    </div>
    <ol class="alerts-nav-list">${recent.map((alert) => dropdownItem(alert, lang)).join('')}</ol>
    <a href="/alerts/" class="alerts-see-all">${esc(ui('seeAll', { total: summary.total }, lang))}</a>`;
  if (!menu.dataset.alertsLangListener) {
    menu.dataset.alertsLangListener = 'true';
    window.addEventListener('tdb:langchange', () => renderAlertsDropdown(menu));
  }
}

// ── /alerts/ filters ─────────────────────────────────────────────────────────

function applyFilters(root) {
  if (!root) return;
  const state = root.querySelector('#alertState')?.value || '';
  const category = root.querySelector('#alertCategory')?.value || '';
  const severity = root.querySelector('#alertSeverity')?.value || '';
  const q = (root.querySelector('#alertSearch')?.value || '').trim().toLowerCase();

  let shown = 0;
  // Walk the feed in order so each month heading can be switched off when every notice
  // beneath it is filtered out — otherwise filtering to one state leaves a column of empty
  // month labels behind, which reads as a broken result rather than a narrow one.
  let heading = null, headingHasRows = false;
  const closeGroup = () => { if (heading) heading.hidden = !headingHasRows; };

  root.querySelectorAll('[data-alert-group], [data-alert-card]').forEach((el) => {
    if (el.hasAttribute('data-alert-group')) {
      closeGroup();
      heading = el;
      headingHasRows = false;
      return;
    }
    const show = (!state || el.dataset.state === state)
      && (!category || el.dataset.category === category)
      && (!severity || el.dataset.severity === severity)
      && (!q || (el.dataset.search || '').includes(q));
    el.hidden = !show;
    if (show) { shown++; headingHasRows = true; }
  });
  closeGroup();

  const count = root.querySelector('[data-alert-count]');
  if (count) count.textContent = String(shown);
  const empty = root.querySelector('[data-alert-empty]');
  if (empty) empty.hidden = shown !== 0;

  // The chips mirror the category <select>, so a chip only reads as pressed while it is the
  // active filter — including when the select is what changed.
  root.querySelectorAll('[data-alert-index]').forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.alertIndex === category && category !== '');
    chip.setAttribute('aria-pressed', String(chip.dataset.alertIndex === category && category !== ''));
  });
}

function fillSelect(select, options, label = (o) => o) {
  if (!select) return;
  const current = select.value;
  const first = select.firstElementChild?.outerHTML || '<option value="">All</option>';
  select.innerHTML = first + options.map((o) => `<option value="${esc(o)}">${esc(label(o))}</option>`).join('');
  if ([...select.options].some((o) => o.value === current)) select.value = current;
}

export function initAlertsPage() {
  const root = document.getElementById('alertsPageRoot');
  if (!root) return;
  const alerts = getPublicAlerts();

  // The selects are server-rendered with the same values; refilling them keeps the page
  // correct if the data module ever moves ahead of the built HTML.
  const refreshSelects = () => {
    fillSelect(root.querySelector('#alertState'), getAlertStates());
    fillSelect(root.querySelector('#alertCategory'), getUsedAlertCategories(alerts), categoryLabel);
  };
  refreshSelects();
  window.addEventListener('tdb:langchange', () => {
    refreshSelects();
    root.querySelectorAll('[data-alert-index-label]').forEach((el) => {
      el.textContent = categoryLabel(el.dataset.alertIndexLabel || '');
    });
    root.querySelectorAll('[data-alert-severity-label]').forEach((el) => {
      el.textContent = severityLabel(el.dataset.alertSeverityLabel || '');
    });
    applyFilters(root);
  });

  root.querySelectorAll('#alertState, #alertCategory, #alertSeverity, #alertSearch')
    .forEach((el) => el.addEventListener('input', () => applyFilters(root)));

  root.querySelectorAll('[data-alert-reset]').forEach((btn) => btn.addEventListener('click', () => {
    root.querySelectorAll('#alertState, #alertCategory, #alertSeverity, #alertSearch').forEach((el) => { el.value = ''; });
    applyFilters(root);
    root.querySelector('#alertSearch')?.focus();
  }));

  applyFilters(root);
}

// A category chip toggles: clicking the active one clears the filter rather than re-applying
// it, so the chips can be used to browse without reaching for Reset.
export function hydrateAlertIndex(root = document) {
  const page = document.getElementById('alertsPageRoot');
  root.querySelectorAll('[data-alert-index]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const select = document.getElementById('alertCategory');
      if (!select) return;
      const value = chip.dataset.alertIndex || '';
      select.value = select.value === value ? '' : value;
      applyFilters(page);
    });
  });
}

// No self-initialisation on import. main.js owns the lifecycle — it imports this module only
// when #alertsPageRoot exists and calls initAlertsPage() and hydrateAlertIndex() itself.
// Running both here as well attached every filter and chip listener twice.
