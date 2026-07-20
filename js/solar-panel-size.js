// solar-panel-size.js — Solar Panel Size Calculator (/solar-panel-size-calculator/).
// User lists their ACs (tonnage + BEE star + hours + qty) and other monthly units;
// we size the solar array: kW required, panel count, roof area and cost after the
// PM Surya Ghar subsidy. Self-contained (no engine import). English-only page.

const SQFT_PER_KW  = 100;    // shadow-free roof area per kW
const PERF_RATIO   = 0.80;   // inverter losses + temperature derating + dust
const MAX_AC_ROWS  = 6;

// Average running input power (watts) — cooling capacity ÷ typical ISEER for the
// star band, NOT the peak nameplate draw (inverter ACs cycle at part load).
const AC_WATTS = {
  '0.8': { 3: 720,  5: 600  },
  '1':   { 3: 900,  5: 745  },
  '1.5': { 3: 1345, 5: 1115 },
  '2':   { 3: 1795, 5: 1490 },
};

// Peak sun hours (annual average of daily equivalent full-sun hours).
const SUN_HOURS = {
  'Rajasthan': 5.6, 'Gujarat': 5.5, 'Madhya Pradesh': 5.3, 'Maharashtra': 5.2,
  'Telangana': 5.2, 'Andhra Pradesh': 5.1, 'Karnataka': 5.1, 'Tamil Nadu': 5.0,
  'Chhattisgarh': 5.0, 'Haryana': 5.0, 'Delhi': 5.0, 'Punjab': 5.0,
  'Uttar Pradesh': 4.9, 'Bihar': 4.8, 'Jharkhand': 4.8, 'Odisha': 4.8,
  'West Bengal': 4.6, 'Kerala': 4.6, 'Uttarakhand': 4.5, 'Himachal Pradesh': 4.5,
  'Assam': 4.2, 'Other / not sure (India average)': 4.8,
};
const DEFAULT_STATE = 'Other / not sure (India average)';

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

function acRowHtml(i) {
  return `<div class="psz-ac-row" data-row="${i}">
    <select class="psz-ton" aria-label="AC ${i + 1} tonnage">
      <option value="0.8">0.8 ton</option>
      <option value="1">1 ton</option>
      <option value="1.5" selected>1.5 ton</option>
      <option value="2">2 ton</option>
    </select>
    <select class="psz-star" aria-label="AC ${i + 1} star rating">
      <option value="3">3★</option>
      <option value="5" selected>5★</option>
    </select>
    <input class="psz-hrs" type="number" min="0" max="24" step="0.5" value="${i === 0 ? 8 : ''}" placeholder="hrs/day" aria-label="AC ${i + 1} hours per day" inputmode="decimal">
    <input class="psz-qty" type="number" min="1" max="9" step="1" value="1" aria-label="AC ${i + 1} quantity" inputmode="numeric">
    ${i > 0 ? `<button type="button" class="psz-del" aria-label="Remove AC ${i + 1}">×</button>` : '<span class="psz-del-spacer"></span>'}
  </div>`;
}

function addRow() {
  const box = $('pszAcRows');
  const n = box.querySelectorAll('.psz-ac-row').length;
  if (n >= MAX_AC_ROWS) return;
  box.insertAdjacentHTML('beforeend', acRowHtml(n));
  if (n + 1 >= MAX_AC_ROWS) $('pszAddAc').hidden = true;
}

function calc() {
  let acDailyKwh = 0, acCount = 0;
  document.querySelectorAll('.psz-ac-row').forEach(row => {
    const ton = row.querySelector('.psz-ton').value;
    const star = Number(row.querySelector('.psz-star').value);
    const hrs = parseFloat(row.querySelector('.psz-hrs').value);
    const qty = parseInt(row.querySelector('.psz-qty').value, 10) || 1;
    if (!hrs || hrs <= 0) return;
    acDailyKwh += (AC_WATTS[ton][star] * hrs * qty) / 1000;
    acCount += qty;
  });

  const otherMonthly = parseFloat($('pszOther').value) || 0;
  const dailyKwh = acDailyKwh + otherMonthly / 30;
  if (dailyKwh <= 0) return { haveInput: false };

  const sun = SUN_HOURS[$('pszState').value] || SUN_HOURS[DEFAULT_STATE];
  const rawKw = dailyKwh / (sun * PERF_RATIO);
  const size = Math.max(1, Math.round(rawKw * 2) / 2);   // nearest 0.5 kW, min 1 kW

  const panelW = parseFloat($('pszPanel').value) || 540;
  const panels = Math.ceil((size * 1000) / panelW);
  const roof = size * SQFT_PER_KW;
  const dailyGen = size * sun * PERF_RATIO;

  const costPerKw = parseFloat($('pszCost').value) || 55000;
  const gross = size * costPerKw;
  const sub = centralSubsidy(size);
  const net = Math.max(0, gross - sub);

  return { haveInput: true, size, panels, panelW, roof, dailyKwh, dailyGen, gross, sub, net, sun, acCount, otherMonthly };
}

function render() {
  const r = calc();
  const sun = SUN_HOURS[$('pszState').value] || SUN_HOURS[DEFAULT_STATE];
  $('pszSunHint').textContent = `~${sun} peak sun hours per day (annual average).`;
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

  addRow(); // first AC row

  box.addEventListener('input', render);
  box.addEventListener('change', render);
  box.addEventListener('click', (e) => {
    const del = e.target.closest('.psz-del');
    if (!del) return;
    del.closest('.psz-ac-row').remove();
    $('pszAddAc').hidden = box.querySelectorAll('.psz-ac-row').length >= MAX_AC_ROWS;
    render();
  });
  $('pszAddAc').addEventListener('click', () => { addRow(); render(); });

  const sel = $('pszState');
  Object.keys(SUN_HOURS).forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = s;
    if (s === DEFAULT_STATE) o.selected = true;
    sel.appendChild(o);
  });

  ['pszOther', 'pszState', 'pszPanel', 'pszCost'].forEach(id => {
    $(id).addEventListener('input', render);
    $(id).addEventListener('change', render);
  });

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
