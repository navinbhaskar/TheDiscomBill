// solar-panel-size.js — Solar Panel Size Calculator (/solar-panel-size-calculator/).
// User picks each AC with tap-friendly chips (tonnage + BEE star), steppers for
// hours and quantity, and one of three sun zones; we size the solar array: kW,
// panel count, roof area and cost after the PM Surya Ghar subsidy. Self-contained.

const SQFT_PER_KW = 100;    // shadow-free roof area per kW
const PERF_RATIO  = 0.80;   // inverter losses + temperature derating + dust
const MAX_AC_ROWS = 6;

// Average running input power (watts) — cooling capacity ÷ typical ISEER for the
// star band, NOT the peak nameplate draw (inverter ACs cycle at part load).
const AC_WATTS = {
  '0.8': { 3: 720,  5: 600  },
  '1':   { 3: 900,  5: 745  },
  '1.5': { 3: 1345, 5: 1115 },
  '2':   { 3: 1795, 5: 1490 },
};

const $ = (id) => document.getElementById(id);
const rs = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const num = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// PM Surya Ghar central subsidy (same slabs as the savings calculator).
function centralSubsidy(kW) {
  if (kW <= 0) return 0;
  if (kW <= 2) return kW * 30000;
  if (kW <= 3) return 60000 + (kW - 2) * 18000;
  return 78000;
}

const chip = (cls, val, label, on) =>
  `<button type="button" class="psz-chip-btn${on ? ' is-active' : ''}" data-group="${cls}" data-val="${val}">${label}</button>`;

const stepper = (cls, val, unit) =>
  `<div class="psz-step" data-group="${cls}" data-val="${val}" data-unit="${unit}">
    <button type="button" class="psz-step-btn" data-d="-1" aria-label="decrease">−</button>
    <span class="psz-step-val">${val}${unit}</span>
    <button type="button" class="psz-step-btn" data-d="1" aria-label="increase">+</button>
  </div>`;

function acRowHtml(i) {
  return `<div class="psz-ac-card" data-row="${i}">
    <div class="psz-ac-head">
      <span class="psz-ac-title">AC ${i + 1}</span>
      ${i > 0 ? `<button type="button" class="psz-del" aria-label="Remove AC ${i + 1}">×</button>` : ''}
    </div>
    <div class="psz-line"><span class="psz-line-label">Tonnage</span>
      <div class="psz-chips">${chip('ton', '0.8', '0.8T')}${chip('ton', '1', '1T')}${chip('ton', '1.5', '1.5T', true)}${chip('ton', '2', '2T')}</div>
    </div>
    <div class="psz-line"><span class="psz-line-label">Star rating</span>
      <div class="psz-chips">${chip('star', '3', '3★')}${chip('star', '5', '5★', true)}</div>
    </div>
    <div class="psz-line"><span class="psz-line-label">Hours/day</span>${stepper('hrs', 8, 'h')}</div>
    <div class="psz-line"><span class="psz-line-label">No. of units</span>${stepper('qty', 1, '')}</div>
  </div>`;
}

function addRow() {
  const box = $('pszAcRows');
  const n = box.querySelectorAll('.psz-ac-card').length;
  if (n >= MAX_AC_ROWS) return;
  box.insertAdjacentHTML('beforeend', acRowHtml(n));
  if (n + 1 >= MAX_AC_ROWS) $('pszAddAc').hidden = true;
}

const pick = (card, group) => card.querySelector(`.psz-chip-btn[data-group="${group}"].is-active`).dataset.val;
const stepVal = (card, group) => parseFloat(card.querySelector(`.psz-step[data-group="${group}"]`).dataset.val);

function calc() {
  let acDailyKwh = 0, acCount = 0;
  document.querySelectorAll('.psz-ac-card').forEach(card => {
    const w = AC_WATTS[pick(card, 'ton')][Number(pick(card, 'star'))];
    const hrs = stepVal(card, 'hrs'), qty = stepVal(card, 'qty');
    if (hrs <= 0) return;
    acDailyKwh += (w * hrs * qty) / 1000;
    acCount += qty;
  });

  const otherMonthly = parseFloat($('pszOther').value) || 0;
  const dailyKwh = acDailyKwh + otherMonthly / 30;
  if (dailyKwh <= 0) return { haveInput: false };

  const sun = parseFloat(document.querySelector('.psz-zone.is-active').dataset.sun);
  const size = Math.max(1, Math.round((dailyKwh / (sun * PERF_RATIO)) * 2) / 2);   // nearest 0.5 kW, min 1 kW

  const panelW = parseFloat($('pszPanel').value) || 540;
  const panels = Math.ceil((size * 1000) / panelW);
  const costPerKw = parseFloat($('pszCost').value) || 55000;
  const gross = size * costPerKw;
  const sub = centralSubsidy(size);

  return {
    haveInput: true, size, panels, panelW, dailyKwh, sun, acCount, otherMonthly,
    roof: size * SQFT_PER_KW, dailyGen: size * sun * PERF_RATIO,
    gross, sub, net: Math.max(0, gross - sub),
  };
}

function render() {
  const r = calc();
  $('pszEmpty').hidden = r.haveInput;
  $('pszResult').hidden = !r.haveInput;
  if (!r.haveInput) return;

  $('pszSize').textContent = num(r.size, r.size % 1 ? 1 : 0);
  $('pszSizeNote').textContent = r.acCount
    ? `Covers ${r.acCount} AC${r.acCount > 1 ? 's' : ''}${r.otherMonthly ? ' plus your other load' : ''} on an average sunny day.`
    : 'Covers your other monthly load on an average sunny day.';
  $('pszPanels').textContent = `${r.panels} × ${num(r.panelW)} Wp`;
  $('pszDaily').textContent = num(r.dailyKwh, 1) + ' units/day';
  $('pszRoof').textContent = num(r.roof) + ' sq ft';
  $('pszGen').textContent = num(r.dailyGen, 1) + ' units/day';
  $('pszGross').textContent = rs(r.gross);
  $('pszSub').textContent = '– ' + rs(r.sub) + (r.size >= 3 ? ' (capped at 3 kW)' : '');
  $('pszNet').textContent = rs(r.net);
}

function init() {
  const box = $('pszAcRows');
  if (!box) return; // not on this page

  addRow(); // first AC card

  box.addEventListener('click', (e) => {
    const del = e.target.closest('.psz-del');
    if (del) {
      del.closest('.psz-ac-card').remove();
      $('pszAddAc').hidden = box.querySelectorAll('.psz-ac-card').length >= MAX_AC_ROWS;
      render();
      return;
    }
    const c = e.target.closest('.psz-chip-btn');
    if (c) {
      c.parentElement.querySelectorAll('.psz-chip-btn').forEach(b => b.classList.remove('is-active'));
      c.classList.add('is-active');
      render();
      return;
    }
    const s = e.target.closest('.psz-step-btn');
    if (s) {
      const step = s.closest('.psz-step');
      const isQty = step.dataset.group === 'qty';
      const d = Number(s.dataset.d) * (isQty ? 1 : 0.5);
      const min = isQty ? 1 : 0.5, max = isQty ? 9 : 24;
      const v = Math.min(max, Math.max(min, parseFloat(step.dataset.val) + d));
      step.dataset.val = v;
      step.querySelector('.psz-step-val').textContent = (v % 1 ? v.toFixed(1) : v) + step.dataset.unit;
      render();
    }
  });
  $('pszAddAc').addEventListener('click', () => { addRow(); render(); });

  $('pszZones').addEventListener('click', (e) => {
    const z = e.target.closest('.psz-zone');
    if (!z) return;
    document.querySelectorAll('.psz-zone').forEach(b => b.classList.remove('is-active'));
    z.classList.add('is-active');
    render();
  });

  ['pszOther', 'pszPanel', 'pszCost'].forEach(id => $(id).addEventListener('input', render));

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
