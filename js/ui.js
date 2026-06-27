// js/ui.js — All DOM manipulation and UI state functions

import {
  getStates, getDiscoms, getCategories, getSupplyTypes,
  findDiscom, getEffectiveTariff,
  findStateMetaByDiscom, resolveDatedTariff, fyStart,
} from './tariffs/registry.js';
import { resolveFppaForDiscom } from './tariffs/fppa.js';
import { calculateBill } from './engine.js';
import { renderBill, renderRevisionBill, renderComparison } from './renderer.js';
import { attachDatePicker, fieldISO, setFieldDate } from './datepicker.js';
import { round2, escHtml } from './utils.js';

// Calendar icon markup reused by dynamically-created date fields
const CAL_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>`;
const dateFieldHtml = (cls, placeholder, extra = '') =>
  `<div class="date-field-wrap"><input type="text" class="date-field ${cls}" data-datepicker ${extra} placeholder="${placeholder}"><button type="button" class="date-field-btn" aria-label="Open calendar" tabindex="-1">${CAL_SVG}</button></div>`;

// ─── Toast ────────────────────────────────────────────────────────────────────

let _toastTimer = null;
export function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast';
    t.setAttribute('role', 'status');           // announced by screen readers
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);   // restart the clock on each message
  _toastTimer = setTimeout(() => { t.classList.remove('show'); _toastTimer = null; }, 3500);
}

// ─── Saved-bill history (localStorage) ─────────────────────────────────────────
const HISTORY_KEY = 'discombill.history';
const HISTORY_MAX = 8;
// escHtml is now imported from utils.js

function readHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
function writeHistory(list) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX))); } catch {} }

// Record a calculated bill so the user can reload it later. `params` is the share-link query string.
export function saveBillToHistory({ label, amount, params }) {
  if (!params) return;
  const list = readHistory().filter(e => e.params !== params);   // de-dupe identical inputs
  list.unshift({ label, amount, params, ts: Date.now() });
  writeHistory(list);
  renderHistory();
}

export function renderHistory() {
  const box = document.getElementById('historyPanel');
  if (!box) return;
  const list = readHistory();
  if (!list.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
  box.style.display = 'block';
  box.innerHTML =
    `<div class="history-head"><span>Recent bills</span>` +
    `<button type="button" id="historyClear" class="history-clear">Clear</button></div>` +
    list.map((e, i) => `<button type="button" class="history-item" data-i="${i}">` +
      `<span class="history-label">${escHtml(e.label)}</span>` +
      `<span class="history-amt">₹ ${escHtml(e.amount)}</span></button>`).join('');
}

// Wire the Recent-bills panel (delegated). Loading an entry re-opens it via the share-link params.
export function initHistory() {
  const box = document.getElementById('historyPanel');
  if (!box) return;
  box.addEventListener('click', e => {
    if (e.target.closest('#historyClear')) { writeHistory([]); renderHistory(); return; }
    const item = e.target.closest('.history-item');
    if (!item) return;
    const entry = readHistory()[+item.dataset.i];
    if (entry) location.search = '?' + entry.params;   // reload; loadFromUrl auto-calculates
  });
  renderHistory();
}

// ─── Share ────────────────────────────────────────────────────────────────────

/**
 * Serializes the current calculator form state into a URL for sharing.
 * The parameters are obfuscated using Base64 encoding to keep the URL clean.
 * @returns {string} The full shareable URL
 */
export function buildShareUrl() {
  const p = new URLSearchParams({
    state:   document.getElementById('stateSelect').value,
    discom:  document.getElementById('discomSelect').value,
    cat:     document.getElementById('categorySelect').value,
    st:      document.getElementById('supplyTypeSelect').value,
    name:    document.getElementById('consumerName').value,
    acc:     document.getElementById('accountNo').value,
    addr:    document.getElementById('address').value,
    meter:   getMeterNo(),
    month:   document.getElementById('billingMonth').value,
    year:    document.getElementById('billingYear').value,
    fd:      fieldISO(document.getElementById('fromDate')),
    td:      fieldISO(document.getElementById('toDate')),
    // Per-meter rows aren't serialized; share the computed total so the link still reproduces the bill
    units:   getEffectiveUnits() ?? '',
    load:    document.getElementById('connectedLoad').value,
    bd:      document.getElementById('billedDemand')?.value || '',
    basis:   getBillingBasis(),
    nm:      document.getElementById('netMeteringChk')?.checked ? '1' : '',
    exp:     document.getElementById('exportUnits')?.value || '',
    cr:      document.getElementById('openingCredit')?.value || '',
    mmode:   getMeterMode(),
    todp:    document.getElementById('todPeak')?.value    || '',
    todn:    document.getElementById('todNormal')?.value  || '',
    todop:   document.getElementById('todOffPeak')?.value || '',
    fac:     document.getElementById('facRate').value,
    facm:    document.getElementById('facMode')?.value || '',
    arr:     document.getElementById('arrears').value,
    arrlpsc: document.getElementById('arrearLpsc').value,
    lpsc:    document.getElementById('lpscRate').value,
    curmo:   document.getElementById('currentLpscMonths').value,
    lpscon:  document.getElementById('lpscApplicable')?.checked ? '1' : '0',
  });
  
  // Base64 encode the query string to hide the raw parameters from the user
  const encoded = btoa(p.toString());
  return location.origin + location.pathname + '?q=' + encoded;
}

export function shareBill() {
  const url = buildShareUrl();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard!'));
  } else {
    prompt('Copy this link:', url);
  }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function initTabs() {
  document.querySelectorAll('.bill-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bill-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.bill-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ─── Dynamic Rows ─────────────────────────────────────────────────────────────

function fmtTotal(n) {
  return '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function updateArrearTotal() {
  const a  = +document.getElementById('arrears').value    || 0;
  const al = +document.getElementById('arrearLpsc').value || 0;
  document.getElementById('arrearTotalDisplay').textContent = fmtTotal(a + al);
}

export function updatePaymentTotal() {
  let total = 0;
  document.querySelectorAll('#paymentRows .dyn-amount').forEach(el => { total += +el.value || 0; });
  document.getElementById('paymentTotalDisplay').textContent = fmtTotal(total);
}

export function updateAdjustmentTotal() {
  let total = 0;
  document.querySelectorAll('#adjustmentRows .dyn-amount').forEach(el => { total += +el.value || 0; });
  document.getElementById('adjustmentTotalDisplay').textContent = fmtTotal(total);
}

export function addPaymentRow() {
  const container = document.getElementById('paymentRows');
  const row = document.createElement('div');
  row.className = 'dyn-row';
  row.innerHTML = `
    ${dateFieldHtml('dyn-date', 'DD-MM-YYYY')}
    <input type="number" class="dyn-amount" placeholder="Amount (₹)" value="0" min="0" step="0.01">
    <button class="btn-remove-row" type="button" title="Remove">×</button>`;
  row.querySelector('.dyn-amount').addEventListener('input', updatePaymentTotal);
  row.querySelector('.btn-remove-row').addEventListener('click', () => { row.remove(); updatePaymentTotal(); });
  container.appendChild(row);
  attachDatePicker(row.querySelector('.dyn-date'));
}

export function addAdjustmentRow() {
  const container = document.getElementById('adjustmentRows');
  const row = document.createElement('div');
  row.className = 'dyn-row';
  row.innerHTML = `
    <input type="text" class="dyn-name" placeholder="e.g., Meter Cost, Rebate">
    <input type="number" class="dyn-amount" placeholder="Amount (+/−)" value="0" step="0.01">
    <button class="btn-remove-row" type="button" title="Remove">×</button>`;
  row.querySelector('.dyn-amount').addEventListener('input', updateAdjustmentTotal);
  row.querySelector('.btn-remove-row').addEventListener('click', () => { row.remove(); updateAdjustmentTotal(); });
  container.appendChild(row);
  row.querySelector('.dyn-name').focus();
}

export function getPayments() {
  return Array.from(document.querySelectorAll('#paymentRows .dyn-row')).map(r => ({
    date:   fieldISO(r.querySelector('.dyn-date')),
    amount: +r.querySelector('.dyn-amount').value || 0
  })).filter(p => p.amount > 0);
}

export function getAdjustments() {
  return Array.from(document.querySelectorAll('#adjustmentRows .dyn-row')).map(r => ({
    name:   r.querySelector('.dyn-name') ? r.querySelector('.dyn-name').value.trim() : '',
    amount: +r.querySelector('.dyn-amount').value || 0
  })).filter(a => a.amount !== 0);
}

// ─── Selects ──────────────────────────────────────────────────────────────────

export function populateStates() {
  const sel = document.getElementById('stateSelect');
  getStates().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
}

export function populateDiscoms(state) {
  const sel = document.getElementById('discomSelect');
  sel.innerHTML = '<option value="">-- Select DISCOM --</option>';
  sel.disabled = !state;
  if (!state) return;
  getDiscoms(state).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name + ' — ' + d.fullName;
    sel.appendChild(opt);
  });
}

export function populateCategories(discomId) {
  const sel = document.getElementById('categorySelect');
  sel.innerHTML = '<option value="">-- Select Category --</option>';
  sel.disabled = !discomId;
  if (!discomId) return;
  getCategories(discomId).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

export function populateSupplyTypes(discomId, categoryId) {
  const group = document.getElementById('supplyTypeGroup');
  const sel   = document.getElementById('supplyTypeSelect');
  const desc  = document.getElementById('supplyTypeDesc');
  sel.innerHTML = '<option value="">-- Select Supply Type --</option>';

  const types = getSupplyTypes(discomId, categoryId);
  if (!discomId || !categoryId || types.length === 0) {
    group.style.display = 'none';
    hideLifelineNotice();
    return;
  }

  types.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st.id; opt.textContent = st.name;
    sel.appendChild(opt);
  });

  sel.value = types[0].id;
  desc.textContent = types[0].description || '';
  group.style.display = 'block';
  prefillFac(discomId, categoryId, types[0].id);
  applyLifelineDefaultLoad(discomId, categoryId, types[0].id);
  checkLifelineLimits();
}

// Billing date drives historical tariff resolution: prefer To Date, else billing month/year
export function getBillingDate() {
  const toVal = fieldISO(document.getElementById('toDate'));
  if (toVal) return toVal;
  const y = document.getElementById('billingYear')?.value;
  const m = document.getElementById('billingMonth')?.value;
  return (y && m) ? `${y}-${m}-15` : null;
}

function resolveDatedFor(discomId, categoryId, supplyTypeId) {
  const tariff = getEffectiveTariff(discomId, categoryId, supplyTypeId);
  if (!tariff) return null;
  const discom    = findDiscom(discomId);
  const stateMeta = findStateMetaByDiscom(discomId);
  const curFrom   = (stateMeta && stateMeta.currentRatesFrom) || fyStart(discom && discom.tariffYear);
  const curLabel  = (discom && discom.tariffYear) ? `FY ${discom.tariffYear}` : 'Current rates';
  return resolveDatedTariff(tariff, getBillingDate(), curFrom, curLabel);
}

function setFppaSource(text, cls) {
  const srcEl = document.getElementById('fppaSource');
  if (!srcEl) return;
  if (!text) { srcEl.style.display = 'none'; return; }
  srcEl.textContent = text;
  srcEl.className = 'fppa-source' + (cls ? ' ' + cls : '');
  srcEl.style.display = 'block';
}

// Calendar months (15th of each) spanned by a from→to ISO date range (capped for safety).
function fppaMonthDates(fromISO, toISO) {
  const f = new Date(fromISO), t = new Date(toISO);
  if (isNaN(f) || isNaN(t) || t < f) return [];
  const out = [];
  let y = f.getFullYear(), m = f.getMonth();
  for (let i = 0; i < 600 && (y < t.getFullYear() || (y === t.getFullYear() && m <= t.getMonth())); i++) {
    out.push(new Date(y, m, 15));
    if (++m > 11) { m = 0; y++; }
  }
  return out;
}

const MON_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function prefillFac(discomId, categoryId, supplyTypeId) {
  const rateEl = document.getElementById('facRate');
  const modeEl = document.getElementById('facMode');
  const autoEl = document.getElementById('fppaAuto');

  // Manual mode: never overwrite the user's entered value
  if (autoEl && !autoEl.checked) { updateFacUnitLabel(); return; }

  // Multi-month bills: FPPA is notified PER MONTH, so apply each month's own rate rather than
  // one rate throughout. Per-month consumption isn't known, so we average the monthly rates
  // (equivalent to applying each month's rate to an even share of the period's charges).
  const fromV = fieldISO(document.getElementById('fromDate'));
  const toV   = fieldISO(document.getElementById('toDate')) || getBillingDate();
  const months = (fromV && toV) ? fppaMonthDates(fromV, toV) : [];
  if (months.length > 1) {
    const entries = months.map(d => resolveFppaForDiscom(discomId, d));
    const mode = entries.some(e => e && e.mode === 'percent') ? 'percent' : 'per_unit';
    const rates = entries.map(e => (e ? e.rate : 0));   // months with no notice → 0 that month
    const avg = Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) / 100;
    rateEl.value = avg;
    if (modeEl) modeEl.value = mode;
    const unit = mode === 'percent' ? '%' : '';
    const note = months.length <= 6
      ? `✓ Avg of ${months.length} months — ${months.map((d, i) => `${MON_ABBR[d.getMonth()]} ${String(d.getFullYear()).slice(2)} ${rates[i]}${unit}`).join(', ')} = ${avg}${unit}`
      : `✓ Avg of ${months.length} monthly FPPA rates = ${avg}${unit} (auto)`;
    setFppaSource(note, 'verified');
    updateFacUnitLabel();
    return;
  }

  // Single-month: government-verified notified FPPA for this billing cycle takes priority
  const verified = resolveFppaForDiscom(discomId, getBillingDate());
  if (verified) {
    rateEl.value = verified.rate;
    if (modeEl) modeEl.value = verified.mode === 'percent' ? 'percent' : 'per_unit';
    setFppaSource(`✓ ${verified.label} — ${verified.source}`, 'verified');
    updateFacUnitLabel();
    return;
  }

  // No verified value on record for this period → default to 0 (editable).
  rateEl.value = 0;
  if (modeEl) modeEl.value = 'per_unit';
  setFppaSource('No verified FPPA on record for this period — defaulted to 0 (enter manually if your bill shows one).', '');
  updateFacUnitLabel();
}

// User toggled the auto-fill checkbox or typed a manual value
export function onFppaAutoToggle(discomId, categoryId, supplyTypeId) {
  const autoEl = document.getElementById('fppaAuto');
  if (autoEl && autoEl.checked) {
    prefillFac(discomId, categoryId, supplyTypeId);
  } else {
    setFppaSource('✎ Manual entry — auto-fill disabled.', 'manual');
  }
}

export function markFppaManual() {
  const autoEl = document.getElementById('fppaAuto');
  if (autoEl && autoEl.checked) {
    autoEl.checked = false;
    setFppaSource('✎ Manual entry — auto-fill disabled.', 'manual');
  }
}

// Swap the FPPA helper text / suffix based on selected mode
export function updateFacUnitLabel() {
  const modeEl = document.getElementById('facMode');
  const lblEl  = document.getElementById('facRateLabel');
  if (!modeEl || !lblEl) return;
  const t = lblEl.querySelector('.lbl-text') || lblEl;
  t.textContent = modeEl.value === 'percent'
    ? 'FPPA / FAC Surcharge (% of charges)'
    : 'FPPA / FAC Surcharge (₹/unit)';
}

// Live hint showing which tariff period a bill will use (and whether it's estimated)
export function updateTariffPeriodHint() {
  const discomId     = document.getElementById('discomSelect').value;
  const categoryId   = document.getElementById('categorySelect').value;
  const supplyTypeId = document.getElementById('supplyTypeSelect').value || null;
  const hint = document.getElementById('tariffPeriodHint');
  if (!hint) return;
  if (!discomId || !categoryId) { hint.style.display = 'none'; return; }
  const eff = resolveDatedFor(discomId, categoryId, supplyTypeId);
  if (!eff) { hint.style.display = 'none'; return; }
  hint.innerHTML = eff.estimated
    ? `⚠ Tariff period: <strong>${eff.periodLabel}</strong> — <span class="hint-estimated">estimated (verified rates unavailable for this date)</span>`
    : `Tariff period: <strong>${eff.periodLabel}</strong> <span class="hint-verified">✓ verified</span>`;
  hint.className = 'tariff-period-hint' + (eff.estimated ? ' estimated' : '');
  hint.style.display = 'block';
}

export function prefillLpsc(discomId) {
  const discom = findDiscom(discomId);
  document.getElementById('lpscRate').value = (discom && discom.lpscRate != null) ? discom.lpscRate : 1.5;
}

// ─── Month / Year ─────────────────────────────────────────────────────────────

const FULL_MONTHS = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

// Bill Month & Year is a month-year-only calendar field (#billingMonthYear, shows "Month YYYY")
// backed by hidden #billingMonth ('MM') and #billingYear ('YYYY') that the rest of the app reads.
export function setBillingMonthYear(mm, yyyy) {
  const m = String(mm).padStart(2, '0');
  document.getElementById('billingMonth').value = m;
  document.getElementById('billingYear').value  = String(yyyy);
  const my = document.getElementById('billingMonthYear');
  if (my) { my.dataset.m = m; my.dataset.y = String(yyyy); my.value = `${FULL_MONTHS[mm - 1]} ${yyyy}`; }
}

// Sync the visible #billingMonthYear field's change → hidden inputs, and fire billingMonth's
// change so the existing FPPA / tariff-period listeners run.
export function syncBillingMonthYear() {
  const my = document.getElementById('billingMonthYear');
  if (!my || !my.dataset.m || !my.dataset.y) return;
  const mEl = document.getElementById('billingMonth');
  const yEl = document.getElementById('billingYear');
  mEl.value = my.dataset.m;
  yEl.value = my.dataset.y;
  mEl.dispatchEvent(new Event('change'));
  updateCalcButton();
}

export function populateMonthYear() {
  const now = new Date();
  setBillingMonthYear(now.getMonth() + 1, now.getFullYear());
}

// ─── Units Display ────────────────────────────────────────────────────────────

// Reading mode: 'simple' | 'advanced' | 'tod' (selected by the radio group)
export function getMeterMode() {
  const r = document.querySelector('input[name="meterMode"]:checked');
  return r ? r.value : 'advanced';
}

// Meter number: TOD has its own field; the unified Meter Reading mode derives it from the
// per-meter labels in the table (joined).
export function getMeterNo() {
  if (getMeterMode() === 'tod') {
    const el = document.getElementById('meterNoTod');
    return el ? el.value.trim() : '';
  }
  return Array.from(document.querySelectorAll('#advancedRows .m-label'))
    .map(i => i.value.trim()).filter(Boolean).join(', ');
}


// ── TOD ──
export function getTodUnits() {
  if (getMeterMode() !== 'tod') return null;
  const peak    = +document.getElementById('todPeak').value    || 0;
  const normal  = +document.getElementById('todNormal').value  || 0;
  const offPeak = +document.getElementById('todOffPeak').value || 0;
  return { peak, normal, offPeak };
}

export function updateTodDisplay() {
  if (getMeterMode() !== 'tod') { updateCalcButton(); return; }
  const peak    = +document.getElementById('todPeak').value    || 0;
  const normal  = +document.getElementById('todNormal').value  || 0;
  const offPeak = +document.getElementById('todOffPeak').value || 0;
  const total   = peak + normal + offPeak;
  const display = document.getElementById('todTotalDisplay');
  if (total > 0) {
    document.getElementById('todTotalUnitsDisplay').textContent = total.toLocaleString('en-IN');
    document.getElementById('todPeakDisplay').textContent       = peak.toLocaleString('en-IN');
    document.getElementById('todNormalDisplay').textContent     = normal.toLocaleString('en-IN');
    document.getElementById('todOffPeakDisplay').textContent    = offPeak.toLocaleString('en-IN');
    display.style.display = 'block';
  } else {
    display.style.display = 'none';
  }
  updateCalcButton();
}

// ── Advanced meter read (Single Meter / Meter Replacement) ──
// Each row: Units = (Current − Previous) × MF. Total = sum over rows. The earliest
// previous date → latest current date define the billing period (written to From/To).
export function getAdvancedMeterData() {
  let totalUnits = 0, minPrev = null, maxCurr = null, maxMD = 0;
  document.querySelectorAll('#advancedRows .meter-row').forEach(r => {
    const prev = parseFloat(r.querySelector('.m-prevread').value);
    const curr = parseFloat(r.querySelector('.m-currread').value);
    const mfRaw = parseFloat(r.querySelector('.m-mf').value);
    const mf = (isNaN(mfRaw) || mfRaw <= 0) ? 1 : mfRaw;
    // Units = (Curr − Prev) × MF when readings are entered, else the directly-typed Units field.
    if (!isNaN(prev) && !isNaN(curr) && curr >= prev) totalUnits += (curr - prev) * mf;
    else totalUnits += parseFloat(r.querySelector('.m-units').value) || 0;
    const pd = fieldISO(r.querySelector('.m-prevdate'));
    const cd = fieldISO(r.querySelector('.m-currdate'));
    if (pd && (!minPrev || pd < minPrev)) minPrev = pd;
    if (cd && (!maxCurr || cd > maxCurr)) maxCurr = cd;
    const md = parseFloat(r.querySelector('.m-md').value);
    if (!isNaN(md) && md > maxMD) maxMD = md;   // billed demand = peak MD across meters
  });
  return { totalUnits: Math.round(totalUnits * 100) / 100, minPrev, maxCurr, maxMD };
}

/**
 * Adds a new meter reading row to the advanced meter form.
 * Handles the logic for the "Override Units" checkbox and automatically
 * pre-fills the new row's "Previous Date" based on the previous row's "Current Date".
 * @param {string} label The placeholder label for the meter (e.g. "Meter 1")
 */
export function addMeterRow(label = '') {
  const c = document.getElementById('advancedRows');
  
  // Smart Date Logic: Find the most recently added meter row (which is visually 'above' this new one).
  // If it has a valid 'Previous Date', pre-fill this new meter's 'Current Date'
  // to be exactly one day before that Previous Date.
  let newCurrDateIso = null;
  const existingRows = c.querySelectorAll('.meter-row');
  if (existingRows.length > 0) {
    const lastRow = existingRows[existingRows.length - 1];
    const lastPrevDate = fieldISO(lastRow.querySelector('.m-prevdate'));
    if (lastPrevDate) {
      const d = new Date(lastPrevDate);
      d.setDate(d.getDate() - 1);
      newCurrDateIso = d.toISOString().split('T')[0];
    }
  }

  const isFirstMeter = existingRows.length === 0;
  const prevDateLabel = isFirstMeter ? 'Prev Date' : 'Start Date';
  const currDateLabel = isFirstMeter ? 'Curr Date' : 'End Date';

  const row = document.createElement('div');
  row.className = 'meter-row';
  
  // Layout V3: Pure 2-column grid so all inputs are precisely the same width.
  row.innerHTML = `
    <div class="meter-row-top">
      <input type="text" class="m-label" value="${label}" placeholder="Enter your meter number (optional)">
      <button type="button" class="btn-remove-row m-remove" title="Remove">×</button>
    </div>
    <div class="meter-fields-v2">
      <div class="mf-field"><span>${prevDateLabel}</span>${dateFieldHtml('m-prevdate', 'DD-MM-YYYY', 'data-cap-bill')}</div>
      <div class="mf-field"><span>${currDateLabel}</span>${dateFieldHtml('m-currdate', 'DD-MM-YYYY', 'data-cap-bill')}</div>
      
      <div class="mf-field"><span>Prev Read</span><input type="number" class="m-prevread" placeholder="0" min="0" step="0.01"></div>
      <div class="mf-field"><span>Curr Read</span><input type="number" class="m-currread" placeholder="0" min="0" step="0.01"></div>
      
      <div class="mf-field"><span>MF</span><input type="number" class="m-mf" value="1" min="0.01" step="0.01" title="Multiplying Factor"></div>
      <div class="mf-field"><span class="m-md-label">MD (kW)</span><input type="number" class="m-md" placeholder="0" min="0" step="0.01" title="Maximum demand recorded"></div>
      
      <label class="mf-override-label"><input type="checkbox" class="m-override-chk"> Or Enter Units Consumed Directly (kWh or kVAH)</label>
      <div class="mf-field mf-units"><span class="m-units-label">Total Units (Calculated)</span><input type="number" class="m-units" placeholder="Total Units" min="0" step="0.01" readonly></div>
    </div>`;
    
  row.querySelectorAll('input').forEach(i => {
    i.addEventListener('input',  updateAdvancedMeter);
    i.addEventListener('change', updateAdvancedMeter);
  });
  
  // Checkbox Override Logic
  const chk = row.querySelector('.m-override-chk');
  const unitsInput = row.querySelector('.m-units');
  const unitsLabel = row.querySelector('.m-units-label');
  chk.addEventListener('change', () => {
    if (chk.checked) {
      row.querySelector('.m-currread').disabled = true;
      row.querySelector('.m-prevread').disabled = true;
      unitsInput.readOnly = false;
      unitsLabel.textContent = 'Total Units (Manual Override)';
    } else {
      row.querySelector('.m-currread').disabled = false;
      row.querySelector('.m-prevread').disabled = false;
      unitsInput.readOnly = true;
      unitsLabel.textContent = 'Total Units (Calculated)';
    }
    updateAdvancedMeter();
  });

  row.querySelector('.m-remove').addEventListener('click', () => { row.remove(); updateAdvancedMeter(); });
  c.appendChild(row);

  // Apply "Current Meter" / "Old Meter" labels when multiple meters exist
  const allRows = c.querySelectorAll('.meter-row');
  if (allRows.length > 1) {
    // As requested: 1st meter -> Current Meter, 2nd meter -> Old Meter
    const firstLabel = allRows[0].querySelector('.m-label');
    if (!firstLabel.value) firstLabel.value = 'Current Meter';
    
    const secondLabel = allRows[1].querySelector('.m-label');
    if (!secondLabel.value) secondLabel.value = 'Old Meter';
  }

  attachDatePicker(row.querySelector('.m-prevdate'));
  attachDatePicker(row.querySelector('.m-currdate'));
  
  if (newCurrDateIso) {
    const currDateInput = row.querySelector('.m-currdate');
    setFieldDate(currDateInput, newCurrDateIso);
    currDateInput.dispatchEvent(new Event('change'));
  }

  updateDemandUnitLabels();      // reflect kVA vs kW on the new row's MD column
  updateReadingUnitLabels();     // reflect kWh vs kVAh on the new row's Prev/Curr Read labels
}

// Initialise the unified meter table with a single default row (the user adds more with "+").
export function setAdvancedSubMode() {
  const hint = document.getElementById('advHint');
  if (hint) hint.textContent = 'Enter each meter’s previous → current reading (Units = (Current − Previous) × MF). Use “+ Add meter” for a mid-cycle replacement (old + new meter) or for multiple meters — their units are summed.';
  if (!document.querySelector('#advancedRows .meter-row')) addMeterRow();
  updateAdvancedMeter();
}

export function updateAdvancedMeter() {
  // Auto-fill each row's Units from its readings; rows without both readings keep their typed Units.
  document.querySelectorAll('#advancedRows .meter-row').forEach(r => {
    const prev = parseFloat(r.querySelector('.m-prevread').value);
    const curr = parseFloat(r.querySelector('.m-currread').value);
    const mfRaw = parseFloat(r.querySelector('.m-mf').value);
    const mf = (isNaN(mfRaw) || mfRaw <= 0) ? 1 : mfRaw;
    const isOverride = r.querySelector('.m-override-chk').checked;

    let calcUnits = 0;
    if (!isNaN(prev) && !isNaN(curr) && curr >= prev) {
      calcUnits = Math.round((curr - prev) * mf * 100) / 100;
    }

    if (!isOverride) {
      r.querySelector('.m-units').value = calcUnits || '';
    }
  });
  const data = getAdvancedMeterData();
  // Auto-fill the billing period From/To from the per-meter dates when present (the standalone
  // From/To row is hidden in this mode); billed demand from the peak MD column.
  if (getMeterMode() !== 'tod') {
    const from = document.getElementById('fromDate'), to = document.getElementById('toDate');
    if (data.minPrev) { setFieldDate(from, data.minPrev); from.dispatchEvent(new Event('change')); }
    if (data.maxCurr) { setFieldDate(to, data.maxCurr); to.dispatchEvent(new Event('change')); }
    const bd = document.getElementById('billedDemand');
    if (bd && data.maxMD > 0) bd.value = data.maxMD;   // don't clear a manually-entered MD
  }
  const periodDays = getBillingPeriodDays();
  document.getElementById('advTotalUnits').textContent  = data.totalUnits.toLocaleString('en-IN');
  document.getElementById('advTotalMonths').textContent = (periodDays ? periodDays / 30 : 0).toFixed(2);
  document.getElementById('advancedTotalDisplay').style.display = data.totalUnits > 0 ? 'block' : 'none';
  updateCalcButton();
}

export function setMeterMode(mode) {
  const panels = { advanced: 'meterAdvanced', tod: 'meterTod' };
  Object.entries(panels).forEach(([m, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (m === mode) ? 'block' : 'none';
  });
  // The billing period comes from the per-meter Prev/Curr dates in Meter Reading mode, so the
  // standalone From/To row is only shown for TOD (which has no meter rows).
  document.getElementById('meterDatesRow').style.display = (mode === 'tod') ? 'block' : 'none';

  if (mode === 'tod') {
    updateTodDisplay();
  } else {
    if (!document.querySelector('#advancedRows .meter-row')) setAdvancedSubMode();
    else updateAdvancedMeter();
  }
  // MD column owns billed demand in Advanced mode → toggle the standalone field accordingly
  updateBilledDemandVisibility(
    document.getElementById('discomSelect').value,
    document.getElementById('categorySelect').value,
    document.getElementById('supplyTypeSelect').value
  );
  updateUnitsDisplay();
  updateCalcButton();
  checkLifelineLimits();
}

export function getEffectiveUnits() {
  if (getMeterMode() === 'tod') {
    const t = getTodUnits();
    const total = (t.peak || 0) + (t.normal || 0) + (t.offPeak || 0);
    return total > 0 ? total : null;
  }
  // Unified Meter Reading: summed per-meter Units (each computed from readings or typed directly).
  const meterTotal = getAdvancedMeterData().totalUnits;
  return meterTotal > 0 ? meterTotal : null;
}

// The unified meter total (including the direct-units fallback) is rendered by updateAdvancedMeter;
// this thin wrapper keeps existing callers working.
export function updateUnitsDisplay() {
  if (getMeterMode() !== 'tod') updateAdvancedMeter();
}

// ─── Calculate Button ─────────────────────────────────────────────────────────

export function canCalculate() {
  const discom = document.getElementById('discomSelect').value;
  const cat    = document.getElementById('categorySelect').value;
  const units  = getEffectiveUnits();
  const load   = +document.getElementById('connectedLoad').value;

  const stGroup = document.getElementById('supplyTypeGroup');
  const stVal   = document.getElementById('supplyTypeSelect').value;
  if (stGroup.style.display !== 'none' && !stVal) return false;

  return !!(discom && cat && units !== null && units >= 0 && load > 0);
}

export function validateForm() {
  const banner = document.getElementById('dateWarningBanner');
  const textEl = document.getElementById('dateWarningText');
  let errorMsg = null;

  const mode = getMeterMode();
  let latestCurrDate = null;

  if (mode === 'advanced') {
    const rows = document.querySelectorAll('#advancedRows .meter-row');
    for (const r of rows) {
      const prev = fieldISO(r.querySelector('.m-prevdate'));
      const curr = fieldISO(r.querySelector('.m-currdate'));
      if (prev && curr && new Date(prev) > new Date(curr)) {
        errorMsg = "Start Date cannot be after End Date.";
        break;
      }
      if (curr && (!latestCurrDate || new Date(curr) > new Date(latestCurrDate))) {
        latestCurrDate = curr;
      }
    }
  } else {
    const fromVal = fieldISO(document.getElementById('fromDate'));
    const toVal   = fieldISO(document.getElementById('toDate'));
    if (fromVal && toVal && new Date(fromVal) > new Date(toVal)) {
      errorMsg = "Start Date cannot be after End Date.";
    }
    latestCurrDate = toVal;
  }

  if (!errorMsg && latestCurrDate) {
    const billYear = document.getElementById('billingYear').value;
    const billMonth = document.getElementById('billingMonth').value; // 1 to 12
    if (billYear && billMonth) {
      const bYear = parseInt(billYear, 10);
      const bMonth = parseInt(billMonth, 10);
      const cDate = new Date(latestCurrDate);
      const cYear = cDate.getFullYear();
      const cMonth = cDate.getMonth() + 1;

      // Check if Billing Month is earlier than Current Reading Date
      if (bYear < cYear || (bYear === cYear && bMonth < cMonth)) {
        errorMsg = "Billing Month cannot be earlier than the current reading date.";
      }
    }
  }

  if (errorMsg) {
    if (textEl) textEl.textContent = errorMsg;
    if (banner) banner.style.display = 'flex';
    return false;
  } else {
    if (banner) banner.style.display = 'none';
    return true;
  }
}

export function updateCalcButton() {
  const isValid = validateForm();
  document.getElementById('calculateBtn').disabled = !canCalculate() || !isValid;
}

export function isDelhiDiscom(discomId) {
  return ['brpl', 'bypl', 'tpddl', 'ndmc_delhi'].includes(discomId);
}

// ─── Calculate ────────────────────────────────────────────────────────────────

export function getBillingPeriodDays() {
  const fromVal = fieldISO(document.getElementById('fromDate'));
  const toVal   = fieldISO(document.getElementById('toDate'));
  if (!fromVal || !toVal) return null;
  const days = Math.round((new Date(toVal) - new Date(fromVal)) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : null;
}

export function updateBillingPeriod() {
  const days    = getBillingPeriodDays();
  const display = document.getElementById('billingPeriodDisplay');
  if (!days) {
    display.style.display = 'none';
    updateCalcButton(); // Still update to run validation
    return;
  }
  document.getElementById('billingPeriodDaysDisplay').textContent   = days;
  document.getElementById('billingPeriodMonthsDisplay').textContent = (days / 30).toFixed(2);
  display.style.display = 'block';
  updateCalcButton();
}

export function updateBilledDemandVisibility() {
  const hasCat = !!document.getElementById('categorySelect').value;

  // Billing Basis selector — shown once a category is picked, so kVA billing is discoverable anywhere.
  const bGroup = document.getElementById('billingBasisGroup');
  if (bGroup) bGroup.style.display = hasCat ? 'block' : 'none';

  const group = document.getElementById('billedDemandGroup');
  // Maximum Demand is shown on the main page in Simple/TOD modes; in Advanced the MD column
  // supplies it, so the standalone field is hidden there.
  if (group) group.style.display = (getMeterMode() === 'advanced') ? 'none' : 'block';
  updateDemandUnitLabels();
  updateReadingUnitLabels();
}

// Reading & units labels follow the billing basis: kWh for active billing, kVAh when kVA-based
// (the meter is read in apparent energy, so readings/units are entered directly in kVAh).
export function updateReadingUnitLabels() {
  const eu = getBillingBasis() === 'kvah' ? 'kVAh' : 'kWh';
  // Per-meter Units field doubles as the direct-entry box — keep its placeholder's unit in sync.
  document.querySelectorAll('#advancedRows .m-units').forEach(i => { i.placeholder = `Or Enter Units Consumed Directly (${eu})`; });
  // TOD labels carry a badge span — update only the leading text node so the badge survives
  [['todPeak', 'Peak'], ['todNormal', 'Normal'], ['todOffPeak', 'Off-Peak']].forEach(([id, name]) => {
    const lbl = document.querySelector(`label[for="${id}"]`);
    if (lbl && lbl.firstChild && lbl.firstChild.nodeType === Node.TEXT_NODE)
      lbl.firstChild.nodeValue = `${name} Units (${eu}) `;
  });
  // Plain "units" words in the running totals, and the advanced per-meter read labels
  document.querySelectorAll('.reading-unit').forEach(s => { s.textContent = (eu === 'kVAh') ? 'kVAh' : 'units'; });
  document.querySelectorAll('#advancedRows .m-prevread-label').forEach(s => { s.textContent = `Prev Read (${eu})`; });
  document.querySelectorAll('#advancedRows .m-currread-label').forEach(s => { s.textContent = `Curr Read (${eu})`; });
}

export function getBillingBasis() {
  const sel = document.getElementById('billingBasis');
  return sel ? sel.value : 'kwh';
}

// The natural basis for the selected tariff: kVA tariffs default to kVA-based (kVAh), else kWh.
function defaultBillingBasis() {
  const t = getEffectiveTariff(
    document.getElementById('discomSelect').value,
    document.getElementById('categorySelect').value,
    document.getElementById('supplyTypeSelect').value || null);
  return (t && (t.demandUnit === 'kVA' || t.demandUnit === 'kva')) ? 'kvah' : 'kwh';
}

// Reset the Billing Basis selector to the tariff's natural default (called on category change).
export function applyDefaultBillingBasis() {
  const sel = document.getElementById('billingBasis');
  if (sel) sel.value = defaultBillingBasis();
}

// Demand is labelled/charged in kVA for the kVA-based (kVAh) basis; in kW for the active (kWh) basis.
export function getDemandUnit() {
  return (getBillingBasis() === 'kvah') ? 'kVA' : 'kW';
}

export function updateDemandUnitLabels() {
  const kva = getDemandUnit() === 'kVA';
  // Write into the .lbl-text span (if present) so the glossary ⓘ icon in the label survives.
  const setText = (lbl, txt) => { if (lbl) (lbl.querySelector('.lbl-text') || lbl).textContent = txt; };
  setText(document.querySelector('label[for="connectedLoad"]'), kva ? 'Contract Demand (kVA)' : 'Sanctioned Load (kW)');
  setText(document.querySelector('label[for="billedDemand"]'), kva ? 'Maximum Demand (kVA)' : 'Maximum Demand (MD) (kW)');
  // Advanced meter-table MD column header(s)
  document.querySelectorAll('#advancedRows .m-md-label').forEach(s => { s.textContent = kva ? 'MD (kVA)' : 'MD (kW)'; });
}

// ─── Lifeline supply types (UP) ────────────────────────────────────────────────
// UP "Life Line" supply types qualify at ≤ 1 kW sanctioned load AND ≤ 100 units/month. The
// calculator decides lifeline-vs-non-lifeline AUTOMATICALLY from the entered load + consumption
// (both directions): a qualifying consumer is promoted to the lifeline tariff, and one that exceeds
// either limit is dropped to the paired non-lifeline tariff. Ids are UP-specific (ST-10A↔ST-10B
// urban, ST-17↔ST-17B rural); the logic only fires when the category contains BOTH members of a pair.
const LIFELINE_MAP = { '10A': '10B', '17': '17B' };               // lifeline → non-lifeline
const LIFELINE_REVERSE = Object.fromEntries(Object.entries(LIFELINE_MAP).map(([a, b]) => [b, a])); // non-lifeline → lifeline
const LIFELINE_MAX_LOAD_KW = 1;
const LIFELINE_MAX_UNITS_PER_MONTH = 100;

// Both members of the pair must exist in the category for an auto-switch to be valid.
function lifelinePairExists(discomId, categoryId, lifeId, nonLifeId) {
  const types = getSupplyTypes(discomId, categoryId);
  return types.some(t => t.id === lifeId) && types.some(t => t.id === nonLifeId);
}
// Non-lifeline counterpart id if the given supply type is a lifeline type (whose pair exists), else null.
function lifelineCounterpart(discomId, categoryId, supplyTypeId) {
  const target = LIFELINE_MAP[supplyTypeId];
  return (target && lifelinePairExists(discomId, categoryId, supplyTypeId, target)) ? target : null;
}
// Lifeline partner id if the given supply type is a non-lifeline type (whose pair exists), else null.
function lifelinePartner(discomId, categoryId, supplyTypeId) {
  const target = LIFELINE_REVERSE[supplyTypeId];
  return (target && lifelinePairExists(discomId, categoryId, target, supplyTypeId)) ? target : null;
}

// Lifeline unit cap, prorated for multi-month periods (floored at one month so short cycles
// never lose the benefit) — mirrors how the engine prorates energy-slab limits.
function lifelineUnitCap() {
  const days = getBillingPeriodDays();
  const months = days ? Math.max(1, days / 30) : 1;
  return LIFELINE_MAX_UNITS_PER_MONTH * months;
}

let _lifelineNoticeTimer = null;
function showLifelineNotice(msg) {
  const el = document.getElementById('lifelineNotice');
  if (!el) return;
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
  if (_lifelineNoticeTimer) clearTimeout(_lifelineNoticeTimer);
  _lifelineNoticeTimer = setTimeout(() => { hideLifelineNotice(); }, 6000);
}
function hideLifelineNotice() {
  const el = document.getElementById('lifelineNotice');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
  if (_lifelineNoticeTimer) clearTimeout(_lifelineNoticeTimer);
}

// Re-run everything that depends on the selected supply type (description, FPPA prefill,
// billed-demand visibility, tariff hint, calc button). Used by the change handler and by the
// lifeline auto-switch so it doesn't need to dispatch a synthetic 'change' event.
export function refreshSupplyTypeDependent() {
  const discomId     = document.getElementById('discomSelect').value;
  const categoryId   = document.getElementById('categorySelect').value;
  const supplyTypeId = document.getElementById('supplyTypeSelect').value;
  const types = getSupplyTypes(discomId, categoryId);
  const st    = types.find(s => s.id === supplyTypeId);
  document.getElementById('supplyTypeDesc').textContent = st ? (st.description || '') : '';
  prefillFac(discomId, categoryId, supplyTypeId);
  updateBilledDemandVisibility(discomId, categoryId, supplyTypeId);
  updateTariffPeriodHint();
  updateCalcButton();
}

// When a lifeline supply type is selected, default the Sanctioned Load field to 1 kW.
export function applyLifelineDefaultLoad(discomId, categoryId, supplyTypeId) {
  if (lifelineCounterpart(discomId, categoryId, supplyTypeId)) {
    document.getElementById('connectedLoad').value = LIFELINE_MAX_LOAD_KW;
  }
}

// Decide lifeline vs non-lifeline automatically from the current load + consumption, switching the
// supply type in EITHER direction:
//   • a lifeline tariff that exceeds 1 kW or the (period-scaled) 100-unit cap → drops to non-lifeline
//   • a non-lifeline tariff that qualifies (≤ 1 kW AND known consumption ≤ cap) → promoted to lifeline
// Promotion needs consumption to be entered (we can't judge eligibility without it).
let _lifelineBusy = false;
export function checkLifelineLimits() {
  if (_lifelineBusy) return;   // guard: never re-enter while an auto-switch is in progress
  const discomId     = document.getElementById('discomSelect').value;
  const categoryId   = document.getElementById('categorySelect').value;
  const supplyTypeId = document.getElementById('supplyTypeSelect').value;

  const load  = +document.getElementById('connectedLoad').value || 0;
  const md    = +document.getElementById('billedDemand')?.value || 0;   // recorded Maximum Demand (kW)
  const units = getEffectiveUnits();                 // null when not yet entered
  const cap   = lifelineUnitCap();

  const switchTo = (id, msg) => {
    _lifelineBusy = true;
    try {
      document.getElementById('supplyTypeSelect').value = id;
      refreshSupplyTypeDependent();
      showLifelineNotice(msg);
      showToast(msg);
    } finally { _lifelineBusy = false; }
  };

  // Currently a lifeline tariff → drop to non-lifeline if it no longer qualifies.
  const counterpart = lifelineCounterpart(discomId, categoryId, supplyTypeId);
  if (counterpart) {
    const loadOver  = load > LIFELINE_MAX_LOAD_KW;
    const mdOver    = md > LIFELINE_MAX_LOAD_KW;     // UP: recorded MD above 1 kW also disqualifies
    const unitsOver = units != null && units > cap;
    if (loadOver || mdOver || unitsOver) {
      const reasons = [];
      if (loadOver)  reasons.push(`sanctioned load ${load} kW exceeds the 1 kW lifeline limit`);
      if (mdOver)    reasons.push(`recorded maximum demand ${md} kW exceeds the 1 kW lifeline limit`);
      if (unitsOver) reasons.push(`consumption ${Math.round(units)} units exceeds the ${Math.round(cap)}-unit lifeline cap${cap > LIFELINE_MAX_UNITS_PER_MONTH ? ' for this billing period' : ''}`);
      switchTo(counterpart, `Auto-switched to the non-lifeline tariff — ${reasons.join(' and ')}.`);
    } else { hideLifelineNotice(); }
    return;
  }

  // Currently a non-lifeline tariff → promote to lifeline if it now qualifies.
  const partner = lifelinePartner(discomId, categoryId, supplyTypeId);
  if (partner) {
    const qualifies = load <= LIFELINE_MAX_LOAD_KW && md <= LIFELINE_MAX_LOAD_KW && units != null && units <= cap;
    if (qualifies) {
      switchTo(partner, `Auto-switched to the Life Line tariff — load ≤ 1 kW, MD ≤ 1 kW and ${Math.round(units)} units is within the ${Math.round(cap)}-unit lifeline cap.`);
    } else { hideLifelineNotice(); }
    return;
  }

  hideLifelineNotice();
}

// ─── Multi-month bill revision (month-by-month, compounding LPSC) ───────────────
// round2 is now imported from utils.js

// Builds the month-by-month ledger: total units split evenly across the months; each month's
// bill computed at that month's own FPPA/tariff; LPSC compounded on the running balance
// (charged on the prior balance, so a month's bill first attracts LPSC the next month);
// dated payments applied in their month; undated payments + adjustments applied at the end.
export function buildRevisionLedger({ discomId, categoryId, supplyTypeId, totalUnits,
    connectedLoadKw, billedDemandKw, billingBasis, fromISO, toISO, fppaAuto, manualFacRate, manualFacMode,
    lpscRate, previousArrear, arrearLpsc, payments, adjustments, delhiSubsidy,
    netMetering, exportUnits, openingCreditUnits }) {
  const months = fppaMonthDates(fromISO, toISO);
  const N = months.length || 1;
  const unitsPerMonth = totalUnits / N;
  // Net metering across the period: split exported units evenly per month and carry the banked
  // credit forward month to month (so a surplus month offsets a later month's import).
  const exportPerMonth = netMetering ? (exportUnits || 0) / N : 0;
  let runningCredit    = netMetering ? (openingCreditUnits || 0) : 0;

  const payByMonth = {};
  let undatedPay = 0;
  (payments || []).forEach(p => {
    if (p.date) { const k = p.date.slice(0, 7); payByMonth[k] = (payByMonth[k] || 0) + p.amount; }
    else undatedPay += p.amount;
  });

  let balance = (previousArrear || 0) + (arrearLpsc || 0);
  const startArrear = balance;
  const rows = [];
  let totalCharges = 0, totalLpsc = 0, totalPay = 0;
  // component totals for the aggregated summary
  let totalEnergy = 0, totalDemand = 0, totalED = 0, totalExcess = 0, totalFppa = 0, totalSubsidy = 0;
  let totalNet = 0;   // net (billed) units summed over the months — used for the net-metering summary
  const slabAgg = {};   // aggregated energy slabs keyed by rate → { rate, units, amount }
  let fixedPerMonth = 0, edRate = 0, demandUnit = 'kW';
  let tariffVerified = false, tariffAsOf = null;
  let discom = null, category = null, supplyTypeName = null;

  months.forEach(d => {
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const carriedIn = balance;
    const lpsc = carriedIn > 0 ? round2(carriedIn * (lpscRate || 0) / 100) : 0;
    balance += lpsc;

    let facRate, facMode;
    if (fppaAuto) {
      const f = resolveFppaForDiscom(discomId, d);
      facRate = f ? f.rate : 0;
      facMode = (f && f.mode === 'percent') ? 'percent' : 'per_unit';
    } else { facRate = manualFacRate; facMode = manualFacMode; }

    const mb = calculateBill({
      discomId, categoryId, supplyTypeId, units: unitsPerMonth,
      connectedLoadKw, billedDemandKw, billingBasis, billingPeriodDays: 30, billingDate: ym + '-15',
      facRate, facMode, arrears: 0, arrearLpsc: 0, lpscRate: 0, currentLpscMonths: 0,
      lpscApplicable: false, payments: [], adjustments: [], delhiSubsidy, todUnits: null,
      netMetering, exportUnits: exportPerMonth, openingCreditUnits: runningCredit,
    });
    if (netMetering && mb) runningCredit = mb.closingCredit;   // carry surplus to the next month
    const energy  = mb ? mb.totalEnergy : 0;
    const demand  = mb ? mb.fixedCharge : 0;
    const excess  = mb ? mb.excessDemandPenalty : 0;
    const fppaAmt = mb ? mb.facAmount : 0;
    const ed      = mb ? (mb.extraCharges || []).reduce((s, c) => s + c.amount, 0) : 0;
    const subsidy = mb ? mb.subsidyAmount : 0;
    // Month's net = sum of the itemised components, so the ledger columns reconcile exactly
    const charges = Math.max(0, round2(energy + demand + excess + fppaAmt + ed - subsidy));
    const fppaBase = round2(demand + energy + excess);   // matches the engine's percent FPPA base
    if (mb) (mb.slabBreakdown || []).forEach(s => {
      const k = s.rate;
      if (!slabAgg[k]) slabAgg[k] = { rate: s.rate, units: 0, amount: 0 };
      slabAgg[k].units += s.units; slabAgg[k].amount += s.amount;
    });
    if (mb && !discom) {
      discom = mb.discom; category = mb.category; supplyTypeName = mb.supplyTypeName;
      fixedPerMonth = mb.fixedPerMonth; demandUnit = mb.demandUnit || 'kW';
      tariffVerified = mb.tariffVerified; tariffAsOf = mb.tariffAsOf;
      const edc = (mb.extraCharges || []).find(c => c.type === 'percent_total' || c.type === 'percent_energy');
      if (edc) edRate = edc.rate;
    }
    balance += charges;

    const pay = payByMonth[ym] || 0;
    balance -= pay;

    rows.push({
      label: `${MON_ABBR[d.getMonth()]} ${d.getFullYear()}`,
      units: round2(mb ? mb.netUnits : unitsPerMonth), fppaRate: facRate, fppaMode: facMode,
      fppaBase, fppaAmount: round2(fppaAmt),
      energy: round2(energy), fixed: round2(demand),
      excess: round2(excess), ed: round2(ed),
      lpsc, charges, payment: pay, balance: round2(balance),
    });
    totalCharges += charges; totalLpsc += lpsc; totalPay += pay;
    totalEnergy += energy; totalDemand += demand; totalED += ed;
    totalExcess += excess; totalFppa += fppaAmt; totalSubsidy += subsidy;
    totalNet += mb ? mb.netUnits : 0;
  });

  const totalAdj = (adjustments || []).reduce((s, a) => s + (a.amount || 0), 0);
  balance -= undatedPay;
  balance += totalAdj;
  totalPay += undatedPay;

  return {
    rows, monthsCount: N, totalUnits, unitsPerMonth: round2(unitsPerMonth),
    startArrear: round2(startArrear), lpscRate: lpscRate || 0,
    arrear: round2(previousArrear || 0), previousLpsc: round2(arrearLpsc || 0),
    totalEnergy: round2(totalEnergy), totalDemand: round2(totalDemand), totalED: round2(totalED),
    totalExcess: round2(totalExcess), totalFppa: round2(totalFppa), totalSubsidy: round2(totalSubsidy),
    energySlabs: Object.values(slabAgg).sort((a, b) => a.rate - b.rate)
      .map(s => ({ rate: s.rate, units: round2(s.units), amount: round2(s.amount) })),
    fixedPerMonth: round2(fixedPerMonth), edRate, demandUnit, tariffVerified, tariffAsOf,
    totalCharges: round2(totalCharges), totalLpsc: round2(totalLpsc),
    totalPay: round2(totalPay), totalAdj: round2(totalAdj),
    totalPayable: Math.round(balance),
    // Net-metering summary (only meaningful when netMetering is on)
    netMetering: !!netMetering,
    totalImport: round2(totalUnits),
    totalExport: round2(netMetering ? (exportUnits || 0) : 0),
    totalNet: round2(totalNet),
    finalCredit: round2(netMetering ? runningCredit : 0),
    discom, category, supplyTypeName, connectedLoadKw, billedDemandKw,
  };
}

/** Wait for a <select> to contain an option with the given value, select it, and dispatch 'change'. */
function awaitOption(selectId, value, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const el = document.getElementById(selectId);
    const check = () => {
      if ([...el.options].some(o => o.value === value)) {
        el.value = value;
        el.dispatchEvent(new Event('change'));
        resolve(el);
        return true;
      }
      return false;
    };
    if (check()) return;
    const obs = new MutationObserver(() => { if (check()) { obs.disconnect(); clearTimeout(tid); } });
    obs.observe(el, { childList: true });
    const tid = setTimeout(() => { obs.disconnect(); reject(new Error(`Timeout: ${selectId}=${value}`)); }, timeout);
  });
}

// Fill a known, verified example (UP DVVNL domestic, 350 units / 3 kW) and calculate it — gives a
// first-time visitor an instant result without hunting through every field. Cascades through the
// dependent dropdowns the same way a shared link does.
export async function loadSample() {
  const stateEl = document.getElementById('stateSelect');
  stateEl.value = 'Uttar Pradesh';
  stateEl.dispatchEvent(new Event('change'));
  try {
    await awaitOption('discomSelect', 'dvvnl');
    await awaitOption('categorySelect', 'domestic');
    const st = document.getElementById('supplyTypeSelect');
    if ([...st.options].some(o => o.value === '10B')) { st.value = '10B'; st.dispatchEvent(new Event('change')); }
    document.getElementById('consumerName').value = 'Sample Consumer';
    document.getElementById('connectedLoad').value = 3;
    // Reset to a clean single meter row and type 350 units directly into its Units field;
    // clear any leftover derived period so the sample bills as a single current-month bill.
    setFieldDate(document.getElementById('fromDate'), '');
    setFieldDate(document.getElementById('toDate'), '');
    document.getElementById('advancedRows').innerHTML = '';
    addMeterRow();
    const u = document.querySelector('#advancedRows .meter-row .m-units');
    if (u) { u.value = 350; u.dispatchEvent(new Event('input')); }
    updateCalcButton();
    doCalculate();
  } catch (e) { console.warn('loadSample:', e.message); }
}

// Compare the current usage (units / load / period / basis) across every DISCOM in the selected
// state that offers the same category, ranked by net bill — answers "which utility is cheapest for
// me?". Uses the clean net bill (no arrears / LPSC, which are consumer-specific).
export function compareDiscoms() {
  const state        = document.getElementById('stateSelect').value;
  const categoryId   = document.getElementById('categorySelect').value;
  const supplyTypeId = document.getElementById('supplyTypeSelect').value || null;
  const curDiscom    = document.getElementById('discomSelect').value;
  const units        = getEffectiveUnits();
  if (!state || !categoryId) { showToast('Pick a state and category first.'); return; }
  if (units == null)         { showToast('Enter consumption (units) first.'); return; }

  const load = +document.getElementById('connectedLoad').value;
  const bdVal = +document.getElementById('billedDemand')?.value || 0;
  const common = {
    units, connectedLoadKw: load, billedDemandKw: bdVal > 0 ? bdVal : undefined,
    billingBasis: getBillingBasis(),
    billingPeriodDays: getBillingPeriodDays(), billingDate: getBillingDate(),
    facRate: +document.getElementById('facRate').value || 0,
    facMode: document.getElementById('facMode')?.value || 'per_unit',
    todUnits: getTodUnits(), lpscApplicable: false, delhiSubsidy: false,
    netMetering: document.getElementById('netMeteringChk')?.checked || false,
    exportUnits: +document.getElementById('exportUnits')?.value || 0,
    openingCreditUnits: +document.getElementById('openingCredit')?.value || 0,
  };

  const rows = [];
  getDiscoms(state).forEach(d => {
    if (!getCategories(d.id).some(c => c.id === categoryId)) return;   // category not offered here
    // The selected supply type may not exist in this DISCOM's category — fall back to no supply type.
    const r = calculateBill({ discomId: d.id, categoryId, supplyTypeId, ...common })
           || calculateBill({ discomId: d.id, categoryId, supplyTypeId: null, ...common });
    if (!r) return;
    rows.push({ name: d.name, current: d.id === curDiscom, energy: r.totalEnergy,
      fixed: r.fixedCharge, fppa: r.facAmount, total: r.currentNet, supplyTypeName: r.supplyTypeName });
  });
  if (rows.length < 1) { showToast('No comparable DISCOMs for this category.'); return; }
  rows.sort((a, b) => a.total - b.total);

  const catName = (getCategories(curDiscom).find(c => c.id === categoryId) || {}).name || categoryId;
  const panel = document.getElementById('billPanel');
  panel.innerHTML = renderComparison({ state, categoryName: catName, units, rows });
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function doCalculate() {
  if (!canCalculate()) return;
  checkLifelineLimits();   // safety net for programmatic flows (e.g. shared-link load)

  const discomId          = document.getElementById('discomSelect').value;
  const categoryId        = document.getElementById('categorySelect').value;
  const supplyTypeId      = document.getElementById('supplyTypeSelect').value || null;
  const units             = getEffectiveUnits();
  const load              = +document.getElementById('connectedLoad').value;
  const bdVal             = +document.getElementById('billedDemand')?.value || 0;
  const billedDemandKw    = bdVal > 0 ? bdVal : undefined;
  const billingBasis      = getBillingBasis();
  const facRate           = +document.getElementById('facRate').value     || 0;
  const facMode           = document.getElementById('facMode')?.value || 'per_unit';
  const arrears           = +document.getElementById('arrears').value     || 0;
  const arrearLpsc        = +document.getElementById('arrearLpsc').value  || 0;
  const lpscRate          = +document.getElementById('lpscRate').value    || 0;
  const currentLpscMonths = +document.getElementById('currentLpscMonths').value || 0;
  const lpscApplicable    = document.getElementById('lpscApplicable')?.checked !== false;

  const delhiSubsidy = isDelhiDiscom(discomId) &&
    document.getElementById('delhiSubsidyCheck') &&
    document.getElementById('delhiSubsidyCheck').checked;

  const billingPeriodDays = getBillingPeriodDays();
  const billingDate       = getBillingDate();
  const todUnits          = getTodUnits();
  const netMetering       = document.getElementById('netMeteringChk')?.checked || false;
  const exportUnits       = +document.getElementById('exportUnits')?.value || 0;
  const openingCreditUnits = +document.getElementById('openingCredit')?.value || 0;

  // Multi-month bill revision: when LPSC applies over a period spanning ≥2 months, bill each
  // month separately and compound LPSC on the running balance.
  const fromISO = fieldISO(document.getElementById('fromDate'));
  const toISO   = fieldISO(document.getElementById('toDate'));
  const revMonths = (fromISO && toISO) ? fppaMonthDates(fromISO, toISO) : [];
  if (lpscApplicable && revMonths.length >= 2 && units != null) {
    const ledger = buildRevisionLedger({
      discomId, categoryId, supplyTypeId, totalUnits: units,
      connectedLoadKw: load, billedDemandKw, billingBasis, fromISO, toISO,
      fppaAuto: document.getElementById('fppaAuto')?.checked !== false,
      manualFacRate: facRate, manualFacMode: facMode,
      lpscRate, previousArrear: arrears, arrearLpsc,
      payments: getPayments(), adjustments: getAdjustments(), delhiSubsidy,
      netMetering, exportUnits, openingCreditUnits,
    });
    const panel = document.getElementById('billPanel');
    panel.innerHTML = renderRevisionBill({
      ledger,
      consumerName: document.getElementById('consumerName').value.trim(),
      accountNo:    document.getElementById('accountNo').value.trim(),
      address:      document.getElementById('address').value.trim(),
      meterNo:      getMeterNo(),
      fromDate: fromISO, toDate: toISO,
    });
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    saveBillToHistory({
      label: `${ledger.discom.name} · ${ledger.category.name} · ${ledger.monthsCount} mo · ${ledger.totalUnits} u`,
      amount: Math.max(0, ledger.totalPayable).toLocaleString('en-IN'),
      params: new URL(buildShareUrl()).search.slice(1),
    });
    return;
  }

  const result = calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: load,
    billedDemandKw, billingBasis, billingPeriodDays, billingDate,
    facRate, facMode, arrears, arrearLpsc, lpscRate, currentLpscMonths, lpscApplicable,
    payments: getPayments(), adjustments: getAdjustments(),
    delhiSubsidy, todUnits, netMetering, exportUnits, openingCreditUnits
  });
  if (!result || result.error) { showToast(result?.message || 'Calculation failed.'); return; }

  const verifiedFppa = resolveFppaForDiscom(discomId, billingDate);

  // Show the meter readings on the bill only for a single meter; multi-meter bills show the total.
  const meterRows = document.querySelectorAll('#advancedRows .meter-row');
  const oneMeter  = (getMeterMode() !== 'tod' && meterRows.length === 1) ? meterRows[0] : null;

  const html = renderBill({
    result,
    consumerName: document.getElementById('consumerName').value.trim(),
    accountNo:    document.getElementById('accountNo').value.trim(),
    address:      document.getElementById('address').value.trim(),
    meterNo:      getMeterNo(),
    billingMonth: document.getElementById('billingMonth').value,
    billingYear:  document.getElementById('billingYear').value,
    prevReading:  oneMeter ? oneMeter.querySelector('.m-prevread').value : '',
    currReading:  oneMeter ? oneMeter.querySelector('.m-currread').value : '',
    fromDate:     fieldISO(document.getElementById('fromDate')),
    toDate:       fieldISO(document.getElementById('toDate')),
    fppaSource:   verifiedFppa ? `${verifiedFppa.label} — ${verifiedFppa.source}` : null,
  });

  const panel = document.getElementById('billPanel');
  panel.innerHTML = html;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  saveBillToHistory({
    label: `${result.discom.name} · ${result.category.name}${result.supplyTypeName ? ' · ' + result.supplyTypeName : ''} · ${result.units} u`,
    amount: Math.max(0, result.totalPayable).toLocaleString('en-IN'),
    params: new URL(buildShareUrl()).search.slice(1),
  });
}

// ─── Load from URL Params ─────────────────────────────────────────────────────

/**
 * Loads calculator state from URL parameters.
 * First checks for an obfuscated 'q' parameter (Base64 encoded string).
 * Falls back to standard URL parameters for backward compatibility.
 */
export async function loadFromUrl() {
  let p = new URLSearchParams(location.search);
  
  // If the 'q' param exists, decode it first.
  if (p.has('q')) {
    try {
      p = new URLSearchParams(atob(p.get('q')));
    } catch (e) {
      console.error('Failed to decode share link');
      return;
    }
  }
  
  if (!p.get('state')) return;

  const stateEl = document.getElementById('stateSelect');
  stateEl.value = p.get('state');
  stateEl.dispatchEvent(new Event('change'));

  try {
    if (p.get('discom')) await awaitOption('discomSelect', p.get('discom'));
    if (p.get('cat'))    await awaitOption('categorySelect', p.get('cat'));

    if (p.get('st')) document.getElementById('supplyTypeSelect').value = p.get('st');

    const fields = {
      consumerName: 'name', accountNo: 'acc', address: 'addr',
      connectedLoad: 'load', billedDemand: 'bd',
      exportUnits: 'exp', openingCredit: 'cr',
      todPeak: 'todp', todNormal: 'todn', todOffPeak: 'todop',
      facRate: 'fac', arrears: 'arr', arrearLpsc: 'arrlpsc',
      lpscRate: 'lpsc', currentLpscMonths: 'curmo'
    };
    for (const [id, key] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el && p.get(key)) el.value = p.get(key);
    }
    // Per-meter rows aren't serialized — restore the shared total into the first meter's Units.
    if (p.get('units')) {
      const u = document.querySelector('#advancedRows .meter-row .m-units');
      if (u) { u.value = p.get('units'); u.dispatchEvent(new Event('input')); }
    }
    // Date fields carry ISO in the URL → store ISO + show DD-MM-YYYY via the datepicker helper.
    if (p.get('fd')) setFieldDate(document.getElementById('fromDate'), p.get('fd'));
    if (p.get('td')) setFieldDate(document.getElementById('toDate'), p.get('td'));
    // Meter number → TOD has its own field; otherwise it's the per-meter labels (not restored here).
    if (p.get('meter')) {
      const e = document.getElementById('meterNoTod'); if (e) e.value = p.get('meter');
    }
    // Net metering — toggle reveals export/credit fields (already set via the fields map above)
    if (p.get('nm') === '1') {
      const c = document.getElementById('netMeteringChk');
      if (c) { c.checked = true; c.dispatchEvent(new Event('change')); }
    }
    // Billing basis — overrides the category-driven default; refresh labels/visibility
    if (p.get('basis')) {
      const b = document.getElementById('billingBasis');
      if (b) { b.value = p.get('basis'); b.dispatchEvent(new Event('change')); }
    }
    if (p.get('month') || p.get('year')) {
      const mm = +(p.get('month') || document.getElementById('billingMonth').value);
      const yy = +(p.get('year')  || document.getElementById('billingYear').value);
      setBillingMonthYear(mm, yy);   // updates hidden inputs + visible field
    }
    // Restore reading mode. Advanced rows aren't serialized — those links carry the
    // computed total in `units` and load as Simple, which reproduces the same bill.
    if (p.get('mmode') === 'tod') {
      const r = document.querySelector('input[name="meterMode"][value="tod"]');
      if (r) { r.checked = true; setMeterMode('tod'); }
    }
    if (p.get('lpscon') === '0') {
      const c = document.getElementById('lpscApplicable');
      if (c) { c.checked = false; c.dispatchEvent(new Event('change')); }
    }
    if (p.get('facm') && document.getElementById('facMode')) {
      document.getElementById('facMode').value = p.get('facm');
      updateFacUnitLabel();
    }

    updateArrearTotal();
    updateUnitsDisplay();
    updateTariffPeriodHint();
    updateCalcButton();
    if (canCalculate()) doCalculate();
  } catch (e) { console.warn('loadFromUrl:', e.message); }
}
