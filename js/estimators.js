// estimators.js — Appliance-based monthly consumption estimator for /estimators/.
// Self-contained: no engine import. The user adds appliances (wattage × quantity × hours/day),
// and we compute monthly kWh and an approximate cost, with a visual "where your units go"
// breakdown. State persists in localStorage so it survives reloads.

const DAYS_PER_MONTH = 30;
const STORE_KEY = 'tdb_estimator_v1';

// Typical Indian-household appliance presets. `w` = running wattage, `hrs` = a sensible default
// daily run-time. For the fridge/AC, `hrs` is the *effective* compressor run-time (they cycle).
const CATALOG = [
  { id: 'fan',       name: 'Ceiling Fan',            icon: '🌀', w: 75,   hrs: 12 },
  { id: 'led',       name: 'LED Bulb',               icon: '💡', w: 9,    hrs: 6  },
  { id: 'tube',      name: 'Tube Light',             icon: '🔆', w: 20,   hrs: 6  },
  { id: 'tv',        name: 'LED TV',                 icon: '📺', w: 90,   hrs: 5  },
  { id: 'fridge',    name: 'Refrigerator',           icon: '❄️', w: 150,  hrs: 8  },
  { id: 'ac',        name: 'Air Conditioner (1.5T)', icon: '🧊', w: 1500, hrs: 6  },
  { id: 'cooler',    name: 'Air Cooler',             icon: '🌬️', w: 180,  hrs: 8  },
  { id: 'washer',    name: 'Washing Machine',        icon: '🫧', w: 500,  hrs: 1  },
  { id: 'geyser',    name: 'Geyser / Water Heater',  icon: '🚿', w: 2000, hrs: 1  },
  { id: 'micro',     name: 'Microwave Oven',         icon: '🍲', w: 1200, hrs: 0.5 },
  { id: 'mixer',     name: 'Mixer / Grinder',        icon: '🥤', w: 500,  hrs: 0.5 },
  { id: 'laptop',    name: 'Laptop',                 icon: '💻', w: 60,   hrs: 6  },
  { id: 'desktop',   name: 'Desktop PC',             icon: '🖥️', w: 150,  hrs: 5  },
  { id: 'iron',      name: 'Electric Iron',          icon: '👔', w: 1000, hrs: 0.5 },
  { id: 'induction', name: 'Induction Cooktop',      icon: '🍳', w: 1800, hrs: 1  },
  { id: 'pump',      name: 'Water Pump / Motor',     icon: '⚙️', w: 750,  hrs: 1  },
  { id: 'stb',       name: 'Set-Top Box',            icon: '📡', w: 15,   hrs: 5  },
  { id: 'router',    name: 'Wi-Fi Router',           icon: '📶', w: 10,   hrs: 24 },
  { id: 'custom',    name: 'Custom Appliance',       icon: '➕', w: 100,  hrs: 1  },
];

const byId = (id) => CATALOG.find(c => c.id === id);

// A sensible starter set shown on first visit so the page isn't empty.
const DEFAULT_ROWS = [
  { catId: 'fan',    name: 'Ceiling Fan', icon: '🌀', w: 75,  qty: 3, hrs: 12 },
  { catId: 'led',    name: 'LED Bulb',    icon: '💡', w: 9,   qty: 6, hrs: 6  },
  { catId: 'tv',     name: 'LED TV',      icon: '📺', w: 90,  qty: 1, hrs: 5  },
  { catId: 'fridge', name: 'Refrigerator', icon: '❄️', w: 150, qty: 1, hrs: 8 },
];

let rows = [];   // [{ catId, name, icon, w, qty, hrs }]
let rate = 7;

// ── Persistence ──────────────────────────────────────────────────────────────
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.rows)) { rows = saved.rows; rate = saved.rate ?? 7; return; }
  } catch (e) { /* ignore corrupt store */ }
  rows = DEFAULT_ROWS.map(r => ({ ...r }));
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ rows, rate })); } catch (e) {}
}

// ── Maths ────────────────────────────────────────────────────────────────────
const monthlyKwh = (r) => (Number(r.w) * Number(r.qty) * Number(r.hrs) * DAYS_PER_MONTH) / 1000;
const fmt = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// ── Rendering ────────────────────────────────────────────────────────────────
function rowHtml(r, i) {
  return `
    <div class="est-row" data-i="${i}">
      <span class="est-row-name"><span class="est-row-icon">${r.icon}</span>${r.name}</span>
      <input class="est-in est-w" data-f="w" type="number" min="0" step="1" value="${r.w}" inputmode="numeric" aria-label="Watts">
      <input class="est-in est-q" data-f="qty" type="number" min="0" step="1" value="${r.qty}" inputmode="numeric" aria-label="Quantity">
      <input class="est-in est-h" data-f="hrs" type="number" min="0" max="24" step="0.5" value="${r.hrs}" inputmode="decimal" aria-label="Hours per day">
      <span class="est-row-kwh">${fmt(monthlyKwh(r), 1)}</span>
      <button type="button" class="est-row-remove" data-act="remove" title="Remove" aria-label="Remove ${r.name}">×</button>
    </div>`;
}

function breakdownHtml(total) {
  if (!rows.length || total <= 0) return `<div class="est-bd-empty">Add appliances to see the breakdown.</div>`;
  // Sort descending by share; show top contributors with a proportional bar.
  const items = rows
    .map(r => ({ name: r.name, icon: r.icon, kwh: monthlyKwh(r) }))
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

  const totalMonthly = rows.reduce((s, r) => s + monthlyKwh(r), 0);
  const totalDaily = totalMonthly / DAYS_PER_MONTH;

  document.getElementById('estMonthlyKwh').textContent = fmt(totalMonthly, totalMonthly < 100 ? 1 : 0);
  document.getElementById('estDailyKwh').textContent = fmt(totalDaily, 1);
  document.getElementById('estApplianceCount').textContent = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
  document.getElementById('estCost').textContent = fmt(totalMonthly * rate, 0);
  document.getElementById('estBreakdown').innerHTML = breakdownHtml(totalMonthly);
  save();
}

// ── Events ───────────────────────────────────────────────────────────────────
function addAppliance(catId) {
  const c = byId(catId) || byId('custom');
  rows.push({ catId: c.id, name: c.name, icon: c.icon, w: c.w, qty: 1, hrs: c.hrs });
  render();
}

function initChips() {
  const wrap = document.getElementById('estChips');
  wrap.innerHTML = CATALOG.filter(c => c.id !== 'custom')
    .map(c => `<button type="button" class="est-chip" data-cat="${c.id}"><span class="est-row-icon">${c.icon}</span>${c.name}</button>`)
    .join('');
  wrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.est-chip');
    if (chip) addAppliance(chip.dataset.cat);
  });
}

function initRows() {
  const rowsEl = document.getElementById('estRows');
  // Edit a field
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
    // Live-update just this row's kWh + the totals without re-rendering inputs (keeps focus/caret).
    row.querySelector('.est-row-kwh').textContent = fmt(monthlyKwh(rows[i]), 1);
    updateTotals();
  });
  // Remove a row
  rowsEl.addEventListener('click', (e) => {
    if (e.target.dataset.act === 'remove') {
      rows.splice(+e.target.closest('.est-row').dataset.i, 1);
      render();
    }
  });
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

function init() {
  if (!document.getElementById('estRows')) return; // not on the estimator page
  load();
  initChips();
  initRows();

  document.getElementById('estAddCustom').addEventListener('click', () => addAppliance('custom'));

  const rateEl = document.getElementById('estRate');
  rateEl.value = rate;
  rateEl.addEventListener('input', () => {
    let v = parseFloat(rateEl.value);
    rate = (isNaN(v) || v < 0) ? 0 : v;
    updateTotals();
  });

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
