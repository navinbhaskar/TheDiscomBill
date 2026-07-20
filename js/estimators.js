// estimators.js — Appliance-based monthly usage estimator for /usage/ (the "Usage Estimator").
// Self-contained: no engine import. The user adds appliances (wattage × quantity × hours/day),
// and we compute monthly kWh and an approximate cost, with a visual "where your units go"
// breakdown. State persists in localStorage so it survives reloads.
//
// Three refinements make the estimate more honest:
//   • Season toggle — AC/cooler/fan/geyser run-times swing wildly across summer/monsoon/winter.
//   • Star rating  — AC and fridge wattage depends heavily on the BEE star rating.
//   • Hindi        — the whole JS-rendered UI (names, chips, breakdown) is bilingual.

const DAYS_PER_MONTH = 30;
const STORE_KEY = 'tdb_estimator_v1';

const lang = () => { try { return localStorage.getItem('lang') === 'hi' ? 'hi' : 'en'; } catch { return 'en'; } };

// Line-style SVG icons for every appliance — emoji render differently on every
// device (and some, like the old 🪭 fan, are outright wrong), so the whole
// catalog uses consistent stroke icons tinted via CSS (currentColor).
const I = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICONS = {
  fan:       I('<path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"/><path d="M12 12v.01"/>'),
  led:       I('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>'),
  tube:      I('<rect x="2" y="10" width="20" height="4" rx="2"/><path d="M6 10V7M18 10V7"/>'),
  tv:        I('<rect x="2" y="7" width="20" height="13" rx="2"/><path d="m17 2-5 5-5-5"/>'),
  fridge:    I('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14"/><path d="M8 5v2"/><path d="M8 13v3"/>'),
  ac:        I('<path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 8h12"/><path d="M18.3 17.7a2.5 2.5 0 0 1-3.16 3.83 2.53 2.53 0 0 1-1.14-2V12"/><path d="M6.6 15.6A2 2 0 1 0 10 17v-5"/>'),
  cooler:    I('<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>'),
  washer:    I('<rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5"/><path d="M7 5h.01"/><path d="M10 5h.01"/>'),
  geyser:    I('<path d="m4 4 2.5 2.5"/><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"/><path d="M15 5 5 15"/><path d="M14 17v.01"/><path d="M10 16v.01"/><path d="M13 13v.01"/><path d="M16 10v.01"/><path d="M11 20v.01"/><path d="M17 14v.01"/><path d="M20 11v.01"/>'),
  micro:     I('<rect x="2" y="4" width="20" height="15" rx="2"/><rect x="6" y="8" width="8" height="7" rx="1"/><path d="M18 8v7"/><path d="M6 19v2"/><path d="M18 19v2"/>'),
  mixer:     I('<path d="M8 3h8l-1.5 10h-5z"/><path d="M10 13v2a2 2 0 0 0 4 0v-2"/><path d="M9 21h6"/><path d="M12 17v4"/>'),
  laptop:    I('<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>'),
  desktop:   I('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'),
  iron:      I('<path d="M21 17H3l1.3-5.2A5 5 0 0 1 9.15 8H14a5 5 0 0 1 4.9 4l.6 3"/><path d="M9 13h6"/>'),
  induction: I('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2.5"/><circle cx="15" cy="15" r="2.5"/>'),
  pump:      I('<circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M19.1 4.9 17 7"/><path d="m7 17-2.1 2.1"/>'),
  stb:       I('<path d="M4 10a7.31 7.31 0 0 0 10 10Z"/><path d="m9 15 3-3"/><path d="M17 13a6 6 0 0 0-6-6"/><path d="M21 13A10 10 0 0 0 11 3"/>'),
  router:    I('<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>'),
  custom:    I('<path d="M5 12h14"/><path d="M12 5v14"/>'),
};

// Appliance presets. `w` = running wattage; `hrs` = a sensible default daily run-time (for the
// fridge/AC this is *effective* compressor run-time, since they cycle). Names are bilingual.
const CATALOG = [
  { id: 'fan',       name: { en: 'Ceiling Fan',            hi: 'सीलिंग फैन' },       icon: ICONS.fan,       w: 75,   hrs: 14 },
  { id: 'led',       name: { en: 'LED Bulb',               hi: 'LED बल्ब' },          icon: ICONS.led,       w: 9,    hrs: 6  },
  { id: 'tube',      name: { en: 'Tube Light',             hi: 'ट्यूब लाइट' },        icon: ICONS.tube,      w: 20,   hrs: 6  },
  { id: 'tv',        name: { en: 'LED TV',                 hi: 'LED टीवी' },          icon: ICONS.tv,        w: 90,   hrs: 5  },
  { id: 'fridge',    name: { en: 'Refrigerator',           hi: 'रेफ्रिजरेटर' },       icon: ICONS.fridge,    w: 150,  hrs: 8,  star: '3' },
  { id: 'ac',        name: { en: 'Air Conditioner (1.5T)', hi: 'एयर कंडीशनर (1.5T)' }, icon: ICONS.ac,        w: 1500, hrs: 8,  star: '3' },
  { id: 'cooler',    name: { en: 'Air Cooler',             hi: 'एयर कूलर' },          icon: ICONS.cooler,    w: 180,  hrs: 10 },
  { id: 'washer',    name: { en: 'Washing Machine',        hi: 'वॉशिंग मशीन' },       icon: ICONS.washer,    w: 500,  hrs: 1  },
  { id: 'geyser',    name: { en: 'Geyser / Water Heater',  hi: 'गीज़र / वॉटर हीटर' },  icon: ICONS.geyser,    w: 2000, hrs: 0.3 },
  { id: 'micro',     name: { en: 'Microwave Oven',         hi: 'माइक्रोवेव ओवन' },     icon: ICONS.micro,     w: 1200, hrs: 0.5 },
  { id: 'mixer',     name: { en: 'Mixer / Grinder',        hi: 'मिक्सर / ग्राइंडर' },  icon: ICONS.mixer,     w: 500,  hrs: 0.5 },
  { id: 'laptop',    name: { en: 'Laptop',                 hi: 'लैपटॉप' },            icon: ICONS.laptop,    w: 60,   hrs: 6  },
  { id: 'desktop',   name: { en: 'Desktop PC',             hi: 'डेस्कटॉप PC' },        icon: ICONS.desktop,   w: 150,  hrs: 5  },
  { id: 'iron',      name: { en: 'Electric Iron',          hi: 'इलेक्ट्रिक आयरन' },    icon: ICONS.iron,      w: 1000, hrs: 0.5 },
  { id: 'induction', name: { en: 'Induction Cooktop',      hi: 'इंडक्शन कुकटॉप' },     icon: ICONS.induction, w: 1800, hrs: 1  },
  { id: 'pump',      name: { en: 'Water Pump / Motor',     hi: 'वॉटर पंप / मोटर' },    icon: ICONS.pump,      w: 750,  hrs: 1  },
  { id: 'stb',       name: { en: 'Set-Top Box',            hi: 'सेट-टॉप बॉक्स' },      icon: ICONS.stb,       w: 15,   hrs: 5  },
  { id: 'router',    name: { en: 'Wi-Fi Router',           hi: 'वाई-फाई राउटर' },      icon: ICONS.router,    w: 10,   hrs: 24 },
  { id: 'custom',    name: { en: 'Custom Appliance',       hi: 'कस्टम उपकरण' },        icon: ICONS.custom,    w: 100,  hrs: 1  },
];

// Effective daily run-hours per season for weather-driven appliances. Switching season
// resets these rows to the seasonal default (they're estimates, not user-entered facts).
const SEASON_HRS = {
  summer:  { fan: 14, ac: 8, cooler: 10, geyser: 0.3 },
  monsoon: { fan: 10, ac: 3, cooler: 4,  geyser: 0.6 },
  winter:  { fan: 3,  ac: 0, cooler: 0,  geyser: 1.5 },
};
const SEASONS = ['summer', 'monsoon', 'winter'];

// BEE star-rating running-wattage presets for the two big-ticket appliances.
const STAR_W = {
  ac:     { '3': 1500, '5': 1100 },
  fridge: { '3': 150,  '5': 90 },
};

// JS-rendered UI strings (static HTML labels use data-i18n in the page itself).
const L = {
  en: {
    bdEmpty: 'Add appliances to see the breakdown.',
    custom: 'Custom W', star3: '3★', star5: '5★',
    seasonNote: { summer: 'Summer run-times — AC & cooler at peak.', monsoon: 'Monsoon run-times — lighter cooling.', winter: 'Winter run-times — heating up, cooling off.' },
  },
  hi: {
    bdEmpty: 'ब्रेकडाउन देखने के लिए उपकरण जोड़ें।',
    custom: 'कस्टम W', star3: '3★', star5: '5★',
    seasonNote: { summer: 'गर्मी के घंटे — AC व कूलर पूरी तरह चालू।', monsoon: 'मानसून के घंटे — कम कूलिंग।', winter: 'सर्दी के घंटे — हीटिंग ज़्यादा, कूलिंग कम।' },
  },
};
const t = (k) => L[lang()][k];

const byId = (id) => CATALOG.find(c => c.id === id);
const iconFor = (r) => (r.catId && byId(r.catId)?.icon) || r.icon || '';
// Name is always resolved from the catalog by catId, so it localizes on language switch.
const nameFor = (r) => { const c = byId(r.catId); return c ? c.name[lang()] : (typeof r.name === 'string' ? r.name : (r.name?.[lang()] || '')); };

// Weather-driven appliances that a season toggle manages.
const WEATHER_IDS = ['fan', 'ac', 'cooler', 'geyser'];
// Which weather appliances are PRE-ADDED for each season. Others stay in the catalog and can
// be added by hand — e.g. winter drops the fan/AC/cooler and pre-adds the geyser instead.
const SEASON_APPLIANCES = {
  summer:  ['fan', 'cooler'],   // peak cooling season — fan + air cooler by default
  monsoon: ['fan'],
  winter:  ['geyser'],
};

// Build one seasonal weather row (tagged `seasonal` so a season switch can swap it without
// touching anything the user added by hand).
function seasonalRow(id, seas) {
  const c = byId(id);
  return { catId: id, w: c.w, qty: id === 'fan' ? 3 : 1, hrs: SEASON_HRS[seas]?.[id] ?? c.hrs,
           seasonal: true, ...(c.star ? { star: c.star } : {}) };
}

// A sensible starter set shown on first visit: season-appropriate weather appliances plus a
// common base (lights, TV, fridge) that applies year-round.
function defaultRows(seas) {
  return [
    ...(SEASON_APPLIANCES[seas] || []).map(id => seasonalRow(id, seas)),
    { catId: 'led',    w: 9,   qty: 6, hrs: 6 },
    { catId: 'tv',     w: 90,  qty: 1, hrs: 5 },
    { catId: 'fridge', w: 150, qty: 1, hrs: 8, star: '3' },
  ];
}

let rows = [];        // [{ catId, w, qty, hrs, star? }]
let rate = 7;
let season = 'summer';

// ── Persistence ──────────────────────────────────────────────────────────────
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.rows)) {
      rows = saved.rows; rate = saved.rate ?? 7;
      if (SEASONS.includes(saved.season)) season = saved.season;
      return;
    }
  } catch (e) { /* ignore corrupt store */ }
  rows = defaultRows(season);
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ rows, rate, season })); } catch (e) {}
}

// ── Maths ────────────────────────────────────────────────────────────────────
const monthlyKwh = (r) => (Number(r.w) * Number(r.qty) * Number(r.hrs) * DAYS_PER_MONTH) / 1000;
const fmt = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// ── Rendering ────────────────────────────────────────────────────────────────
function starSelectHtml(r) {
  if (!STAR_W[r.catId]) return '';
  const v = r.star || 'custom';
  const opt = (val, label) => `<option value="${val}"${v === val ? ' selected' : ''}>${label}</option>`;
  return `<select class="est-star" data-f="star" aria-label="Efficiency rating">${
    opt('3', t('star3'))}${opt('5', t('star5'))}${opt('custom', t('custom'))}</select>`;
}

function rowHtml(r, i) {
  return `
    <div class="est-row" data-i="${i}">
      <span class="est-row-name">
        <span class="est-row-icon">${iconFor(r)}</span>
        <span class="est-row-nm">
          <span class="est-row-label">${nameFor(r)}</span>
          ${starSelectHtml(r)}
        </span>
      </span>
      <input class="est-in est-w" data-f="w" type="number" min="0" step="1" value="${r.w}" inputmode="numeric" aria-label="Watts">
      <input class="est-in est-q" data-f="qty" type="number" min="0" step="1" value="${r.qty}" inputmode="numeric" aria-label="Quantity">
      <input class="est-in est-h" data-f="hrs" type="number" min="0" max="24" step="0.5" value="${r.hrs}" inputmode="decimal" aria-label="Hours per day">
      <span class="est-row-kwh">${fmt(monthlyKwh(r), 1)}</span>
      <button type="button" class="est-row-remove" data-act="remove" title="Remove" aria-label="Remove">×</button>
    </div>`;
}

function breakdownHtml(total) {
  if (!rows.length || total <= 0) return `<div class="est-bd-empty">${t('bdEmpty')}</div>`;
  const items = rows
    .map(r => ({ name: nameFor(r), icon: iconFor(r), kwh: monthlyKwh(r) }))
    .filter(x => x.kwh > 0)
    .sort((a, b) => b.kwh - a.kwh);
  const max = items.length ? items[0].kwh : 1;
  return items.map(x => {
    const pct = total > 0 ? Math.round((x.kwh / total) * 100) : 0;
    const barW = max > 0 ? Math.max(4, (x.kwh / max) * 100) : 0;
    return `
      <div class="est-bd-row">
        <div class="est-bd-label"><span class="est-row-icon">${x.icon}</span>${x.name}</div>
        <div class="est-bd-track"><div class="est-bd-bar" style="width:${barW}%"></div></div>
        <div class="est-bd-val">${pct}%</div>
      </div>`;
  }).join('');
}

function render() {
  const rowsEl = document.getElementById('estRows');
  const emptyEl = document.getElementById('estEmpty');
  rowsEl.innerHTML = rows.map(rowHtml).join('');
  emptyEl.hidden = rows.length > 0;
  syncSeasonUI();
  updateTotals();
}

function updateTotals() {
  const totalMonthly = rows.reduce((s, r) => s + monthlyKwh(r), 0);
  document.getElementById('estMonthlyKwh').textContent = fmt(totalMonthly, totalMonthly < 100 ? 1 : 0);
  document.getElementById('estDailyKwh').textContent = fmt(totalMonthly / DAYS_PER_MONTH, 1);
  document.getElementById('estApplianceCount').textContent = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
  document.getElementById('estCost').textContent = fmt(totalMonthly * rate, 0);
  document.getElementById('estBreakdown').innerHTML = breakdownHtml(totalMonthly);
  save();
}

function syncSeasonUI() {
  document.querySelectorAll('#estSeason .est-season-btn').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.season === season ? 'true' : 'false'));
  const note = document.getElementById('estSeasonNote');
  if (note) note.textContent = L[lang()].seasonNote[season];
}

// ── Events ───────────────────────────────────────────────────────────────────
function addAppliance(catId) {
  const c = byId(catId) || byId('custom');
  const r = { catId: c.id, w: c.w, qty: 1, hrs: c.hrs };
  if (c.star) r.star = c.star;
  // Weather-driven appliances inherit the current season's run-time.
  if (SEASON_HRS[season]?.[c.id] != null) r.hrs = SEASON_HRS[season][c.id];
  rows.push(r);
  render();
}

function applySeason(next) {
  if (!SEASONS.includes(next)) return;
  season = next;
  const keep = SEASON_APPLIANCES[next] || [];
  // Drop only auto-added (seasonal) weather rows that don't belong to the new season —
  // anything the user added by hand is left in place.
  rows = rows.filter(r => !(r.seasonal && WEATHER_IDS.includes(r.catId) && !keep.includes(r.catId)));
  // Pre-add this season's weather appliances if they aren't already present.
  keep.forEach(id => { if (!rows.some(r => r.catId === id)) rows.unshift(seasonalRow(id, next)); });
  // Reset run-times for any weather rows still present (seasonal estimates, not user facts).
  rows.forEach(r => { const h = SEASON_HRS[next]?.[r.catId]; if (h != null) r.hrs = h; });
  render();
}

function renderChips() {
  const wrap = document.getElementById('estChips');
  wrap.innerHTML = CATALOG.filter(c => c.id !== 'custom')
    .map(c => `<button type="button" class="est-chip" data-cat="${c.id}"><span class="est-row-icon">${c.icon}</span>${c.name[lang()]}</button>`)
    .join('');
}

function initChips() {
  renderChips();
  document.getElementById('estChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.est-chip');
    if (chip) addAppliance(chip.dataset.cat);
  });
}

function initRows() {
  const rowsEl = document.getElementById('estRows');
  rowsEl.addEventListener('input', (e) => {
    const input = e.target.closest('.est-in');
    if (!input) return;
    const row = e.target.closest('.est-row');
    const i = +row.dataset.i;
    const f = input.dataset.f;
    let v = parseFloat(input.value);
    if (isNaN(v) || v < 0) v = 0;
    if (f === 'hrs' && v > 24) v = 24;
    rows[i][f] = v;
    // Manually editing an AC/fridge wattage means it no longer matches a star preset.
    if (f === 'w' && STAR_W[rows[i].catId]) {
      rows[i].star = 'custom';
      const sel = row.querySelector('.est-star');
      if (sel) sel.value = 'custom';
    }
    row.querySelector('.est-row-kwh').textContent = fmt(monthlyKwh(rows[i]), 1);
    updateTotals();
  });
  // Star-rating change → set the preset wattage.
  rowsEl.addEventListener('change', (e) => {
    const sel = e.target.closest('.est-star');
    if (!sel) return;
    const row = e.target.closest('.est-row');
    const i = +row.dataset.i;
    rows[i].star = sel.value;
    if (sel.value !== 'custom' && STAR_W[rows[i].catId]) {
      rows[i].w = STAR_W[rows[i].catId][sel.value];
      row.querySelector('.est-w').value = rows[i].w;
      row.querySelector('.est-row-kwh').textContent = fmt(monthlyKwh(rows[i]), 1);
    }
    updateTotals();
  });
  rowsEl.addEventListener('click', (e) => {
    if (e.target.dataset.act === 'remove') {
      rows.splice(+e.target.closest('.est-row').dataset.i, 1);
      render();
    }
  });
}

function initSeason() {
  document.getElementById('estSeason')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.est-season-btn');
    if (btn) applySeason(btn.dataset.season);
  });
}

function init() {
  if (!document.getElementById('estRows')) return; // not on the estimator page
  load();
  initChips();
  initRows();
  initSeason();

  document.getElementById('estAddCustom').addEventListener('click', () => addAppliance('custom'));

  const rateEl = document.getElementById('estRate');
  rateEl.value = rate;
  rateEl.addEventListener('input', () => {
    let v = parseFloat(rateEl.value);
    rate = (isNaN(v) || v < 0) ? 0 : v;
    updateTotals();
  });

  // Share the current estimate as a pre-filled WhatsApp message.
  document.getElementById('estShare')?.addEventListener('click', () => {
    const totalMonthly = rows.reduce((s, r) => s + monthlyKwh(r), 0);
    if (totalMonthly <= 0) return;
    const top = rows.map(r => ({ name: nameFor(r), kwh: monthlyKwh(r) })).sort((a, b) => b.kwh - a.kwh)[0];
    const text = lang() === 'hi'
      ? `⚡ मेरा बिजली खपत अनुमान (TheDiscomBill)\n• मासिक खपत: ~${fmt(totalMonthly)} यूनिट\n• अनुमानित लागत: ₹${fmt(totalMonthly * rate)}/माह (₹${rate}/यूनिट पर)\n• सबसे ज़्यादा खपत: ${top.name} (~${fmt(top.kwh)} यूनिट)\nअपना अनुमान मुफ़्त निकालें: https://thediscombill.com/electricity-cost-calculator/`
      : `⚡ My electricity usage estimate (TheDiscomBill)\n• Monthly usage: ~${fmt(totalMonthly)} units\n• Approx cost: ₹${fmt(totalMonthly * rate)}/month (at ₹${rate}/unit)\n• Biggest consumer: ${top.name} (~${fmt(top.kwh)} units)\nEstimate yours free: https://thediscombill.com/electricity-cost-calculator/`;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  // Language switched in place (no reload on tool pages): re-render the JS-built
  // chips, rows and breakdown so their names/labels match the new language.
  document.getElementById('langMenu')?.addEventListener('click', () => setTimeout(() => { renderChips(); render(); }, 0));

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
