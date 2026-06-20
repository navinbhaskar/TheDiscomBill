// js/ui.js — All DOM manipulation and UI state functions

import {
  getStates, getDiscoms, getCategories, getSupplyTypes,
  findDiscom, getEffectiveTariff,
  findStateMetaByDiscom, resolveDatedTariff, fyStart,
} from './tariffs/registry.js';
import { resolveFppaForDiscom } from './tariffs/fppa.js';
import { calculateBill } from './engine.js';
import { renderBill, renderRevisionBill } from './renderer.js';
import { attachDatePicker } from './datepicker.js';

// Calendar icon markup reused by dynamically-created date fields
const CAL_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>`;
const dateFieldHtml = (cls, placeholder) =>
  `<div class="date-field-wrap"><input type="text" class="date-field ${cls}" data-datepicker readonly placeholder="${placeholder}"><button type="button" class="date-field-btn" aria-label="Open calendar" tabindex="-1">${CAL_SVG}</button></div>`;

// ─── Toast ────────────────────────────────────────────────────────────────────

export function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── Share ────────────────────────────────────────────────────────────────────

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
    fd:      document.getElementById('fromDate').value,
    td:      document.getElementById('toDate').value,
    prev:    document.getElementById('prevReading').value,
    curr:    document.getElementById('currReading').value,
    // Advanced rows aren't serialized; share the computed total so the link still reproduces the bill
    units:   getMeterMode() === 'advanced' ? (getEffectiveUnits() ?? '') : document.getElementById('unitsInput').value,
    load:    document.getElementById('connectedLoad').value,
    bd:      document.getElementById('billedDemand')?.value || '',
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
  return location.origin + location.pathname + '?' + p.toString();
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
      document.querySelectorAll('.bill-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.bill-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
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
    ${dateFieldHtml('dyn-date', 'Payment Date')}
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
    date:   r.querySelector('.dyn-date')   ? r.querySelector('.dyn-date').value   : '',
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
  const toVal = document.getElementById('toDate')?.value;
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
  const fromV = document.getElementById('fromDate')?.value;
  const toV   = document.getElementById('toDate')?.value || getBillingDate();
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
  lblEl.textContent = modeEl.value === 'percent'
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
}

export function populateMonthYear() {
  const now = new Date();
  setBillingMonthYear(now.getMonth() + 1, now.getFullYear());
}

// ─── Units Display ────────────────────────────────────────────────────────────

// Reading mode: 'simple' | 'advanced' | 'tod' (selected by the radio group)
export function getMeterMode() {
  const r = document.querySelector('input[name="meterMode"]:checked');
  return r ? r.value : 'simple';
}

// Meter number depends on the reading mode: Simple/TOD each have their own field; Advanced
// derives it from the per-meter labels in the table (joined).
export function getMeterNo() {
  const mode = getMeterMode();
  if (mode === 'advanced') {
    return Array.from(document.querySelectorAll('#advancedRows .m-label'))
      .map(i => i.value.trim()).filter(Boolean).join(', ');
  }
  const el = document.getElementById(mode === 'tod' ? 'meterNoTod' : 'meterNoSimple');
  return el ? el.value.trim() : '';
}

let advancedSubMode = 'single';   // 'single' | 'replacement'

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
    if (!isNaN(prev) && !isNaN(curr) && curr >= prev) totalUnits += (curr - prev) * mf;
    const pd = r.querySelector('.m-prevdate').value;
    const cd = r.querySelector('.m-currdate').value;
    if (pd && (!minPrev || pd < minPrev)) minPrev = pd;
    if (cd && (!maxCurr || cd > maxCurr)) maxCurr = cd;
    const md = parseFloat(r.querySelector('.m-md').value);
    if (!isNaN(md) && md > maxMD) maxMD = md;   // billed demand = peak MD across meters
  });
  return { totalUnits: Math.round(totalUnits * 100) / 100, minPrev, maxCurr, maxMD };
}

export function addMeterRow(label = '') {
  const c = document.getElementById('advancedRows');
  const row = document.createElement('div');
  row.className = 'meter-row';
  row.innerHTML = `
    <div class="meter-row-top">
      <input type="text" class="m-label" value="${label}" placeholder="Meter no. / label">
      <button type="button" class="btn-remove-row m-remove" title="Remove">×</button>
    </div>
    <div class="meter-fields">
      <div class="mf-field"><span>Prev Date</span>${dateFieldHtml('m-prevdate', 'Date')}</div>
      <label class="mf-field"><span>Prev Read</span><input type="number" class="m-prevread" placeholder="0" min="0" step="0.01"></label>
      <div class="mf-field"><span>Curr Date</span>${dateFieldHtml('m-currdate', 'Date')}</div>
      <label class="mf-field"><span>Curr Read</span><input type="number" class="m-currread" placeholder="0" min="0" step="0.01"></label>
      <label class="mf-field"><span>MF</span><input type="number" class="m-mf" value="1" min="0.01" step="0.01" title="Multiplying Factor"></label>
      <label class="mf-field"><span>MD (kW)</span><input type="number" class="m-md" placeholder="0" min="0" step="0.01" title="Maximum demand recorded"></label>
      <div class="mf-field mf-units"><span>Units</span><span class="m-units">0</span></div>
    </div>`;
  row.querySelectorAll('input').forEach(i => {
    i.addEventListener('input',  updateAdvancedMeter);
    i.addEventListener('change', updateAdvancedMeter);
  });
  row.querySelector('.m-remove').addEventListener('click', () => { row.remove(); updateAdvancedMeter(); });
  c.appendChild(row);
  attachDatePicker(row.querySelector('.m-prevdate'));
  attachDatePicker(row.querySelector('.m-currdate'));
}

export function setAdvancedSubMode(sub) {
  advancedSubMode = sub;
  document.querySelectorAll('.adv-subtab').forEach(b => b.classList.toggle('active', b.dataset.submode === sub));
  const hint = document.getElementById('advHint');
  document.getElementById('advancedRows').innerHTML = '';
  if (sub === 'replacement') {
    hint.textContent = 'Meter replaced mid-cycle: enter the OLD meter (previous → final read) and the NEW meter (initial → current read). Units from both are summed.';
    addMeterRow('Old meter');
    addMeterRow('New meter');
  } else {
    hint.textContent = 'Units = (Current − Previous) × MF. Add more meters with “+”; their units are summed.';
    addMeterRow('Meter 1');
  }
  updateAdvancedMeter();
}

export function updateAdvancedMeter() {
  document.querySelectorAll('#advancedRows .meter-row').forEach(r => {
    const prev = parseFloat(r.querySelector('.m-prevread').value);
    const curr = parseFloat(r.querySelector('.m-currread').value);
    const mfRaw = parseFloat(r.querySelector('.m-mf').value);
    const mf = (isNaN(mfRaw) || mfRaw <= 0) ? 1 : mfRaw;
    const u = (!isNaN(prev) && !isNaN(curr) && curr >= prev) ? (curr - prev) * mf : 0;
    r.querySelector('.m-units').textContent = (Math.round(u * 100) / 100).toLocaleString('en-IN');
  });
  const data = getAdvancedMeterData();
  const days = (data.minPrev && data.maxCurr)
    ? Math.round((new Date(data.maxCurr) - new Date(data.minPrev)) / 86400000) : 0;
  document.getElementById('advTotalUnits').textContent  = data.totalUnits.toLocaleString('en-IN');
  document.getElementById('advTotalMonths').textContent = (days > 0 ? days / 30 : 0).toFixed(2);
  document.getElementById('advancedTotalDisplay').style.display = data.totalUnits > 0 ? 'block' : 'none';

  // Drive the billing period through the existing From/To wiring (FPPA/tariff/period all reuse it),
  // and the billed demand from the peak MD column (feeds demand charge + excess-demand penalty).
  if (getMeterMode() === 'advanced') {
    const from = document.getElementById('fromDate'), to = document.getElementById('toDate');
    from.value = data.minPrev || '';
    to.value   = data.maxCurr || '';
    from.dispatchEvent(new Event('change'));
    to.dispatchEvent(new Event('change'));
    const bd = document.getElementById('billedDemand');
    if (bd) bd.value = data.maxMD > 0 ? data.maxMD : '';
  }
  updateCalcButton();
}

export function setMeterMode(mode) {
  const panels = { simple: 'meterSimple', advanced: 'meterAdvanced', tod: 'meterTod' };
  Object.entries(panels).forEach(([m, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (m === mode) ? 'block' : 'none';
  });
  // From/To date inputs are user-set in Simple/TOD, and auto-filled (hidden) in Advanced
  document.getElementById('meterDatesRow').style.display = (mode === 'advanced') ? 'none' : 'block';

  if (mode === 'advanced') {
    if (!document.querySelector('#advancedRows .meter-row')) setAdvancedSubMode(advancedSubMode);
    else updateAdvancedMeter();
  } else if (mode === 'tod') {
    updateTodDisplay();
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
  const mode = getMeterMode();
  if (mode === 'tod') {
    const t = getTodUnits();
    const total = (t.peak || 0) + (t.normal || 0) + (t.offPeak || 0);
    return total > 0 ? total : null;
  }
  if (mode === 'advanced') {
    const u = getAdvancedMeterData().totalUnits;
    return u > 0 ? u : null;
  }
  const prev   = document.getElementById('prevReading').value.trim();
  const curr   = document.getElementById('currReading').value.trim();
  const direct = document.getElementById('unitsInput').value.trim();
  if (prev !== '' && curr !== '' && !isNaN(+prev) && !isNaN(+curr)) {
    return Math.max(0, +curr - +prev);
  }
  if (direct !== '' && !isNaN(+direct)) return Math.max(0, +direct);
  return null;
}

export function updateUnitsDisplay() {
  const disp = document.getElementById('unitsDisplay');
  if (getMeterMode() !== 'simple') { disp.style.display = 'none'; return; }
  const units = getEffectiveUnits();
  const num   = document.getElementById('unitsConsumedDisplay');
  if (units !== null &&
      document.getElementById('prevReading').value !== '' &&
      document.getElementById('currReading').value !== '') {
    disp.style.display = 'block';
    num.textContent = units.toLocaleString('en-IN');
  } else {
    disp.style.display = 'none';
  }
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

export function updateCalcButton() {
  document.getElementById('calculateBtn').disabled = !canCalculate();
}

export function isDelhiDiscom(discomId) {
  return ['brpl', 'bypl', 'tpddl', 'ndmc_delhi'].includes(discomId);
}

// ─── Calculate ────────────────────────────────────────────────────────────────

export function getBillingPeriodDays() {
  const fromVal = document.getElementById('fromDate').value;
  const toVal   = document.getElementById('toDate').value;
  if (!fromVal || !toVal) return null;
  const days = Math.round((new Date(toVal) - new Date(fromVal)) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : null;
}

export function updateBillingPeriod() {
  const days    = getBillingPeriodDays();
  const display = document.getElementById('billingPeriodDisplay');
  if (!days) { display.style.display = 'none'; return; }
  document.getElementById('billingPeriodDaysDisplay').textContent   = days;
  document.getElementById('billingPeriodMonthsDisplay').textContent = (days / 30).toFixed(2);
  display.style.display = 'block';
  updateCalcButton();
}

export function updateBilledDemandVisibility() {
  const group = document.getElementById('billedDemandGroup');
  // Maximum Demand is shown on the main page in Simple/TOD modes; in Advanced the MD column
  // supplies it, so the standalone field is hidden there.
  if (group) group.style.display = (getMeterMode() === 'advanced') ? 'none' : 'block';
}

// ─── Lifeline supply types (UP) ────────────────────────────────────────────────
// UP "Life Line" supply types are capped at ≤ 1 kW sanctioned load and ≤ 100 units/month.
// Beyond either cap the consumer falls to the paired non-lifeline tariff. Ids are UP-specific
// (ST-10A→ST-10B urban, ST-17→ST-17B rural); the guard below only fires when the selected
// category actually contains BOTH the lifeline type and its counterpart.
const LIFELINE_MAP = { '10A': '10B', '17': '17B' };
const LIFELINE_MAX_LOAD_KW = 1;
const LIFELINE_MAX_UNITS_PER_MONTH = 100;

// Returns the non-lifeline counterpart id if the given supply type is a lifeline type whose
// counterpart also exists in the same category; otherwise null.
function lifelineCounterpart(discomId, categoryId, supplyTypeId) {
  const target = LIFELINE_MAP[supplyTypeId];
  if (!target) return null;
  const types = getSupplyTypes(discomId, categoryId);
  const hasSelf   = types.some(t => t.id === supplyTypeId);
  const hasTarget = types.some(t => t.id === target);
  return (hasSelf && hasTarget) ? target : null;
}

// Lifeline unit cap, prorated for multi-month periods (floored at one month so short cycles
// never lose the benefit) — mirrors how the engine prorates energy-slab limits.
function lifelineUnitCap() {
  const days = getBillingPeriodDays();
  const months = days ? Math.max(1, days / 30) : 1;
  return LIFELINE_MAX_UNITS_PER_MONTH * months;
}

function showLifelineNotice(msg) {
  const el = document.getElementById('lifelineNotice');
  if (!el) return;
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
}
function hideLifelineNotice() {
  const el = document.getElementById('lifelineNotice');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
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

// If the selected supply type is lifeline but load > 1 kW or units exceed the (period-scaled)
// cap, switch to the non-lifeline counterpart and explain why. One-directional: never switches
// back automatically (the user can re-select the lifeline type manually).
export function checkLifelineLimits() {
  const discomId     = document.getElementById('discomSelect').value;
  const categoryId   = document.getElementById('categorySelect').value;
  const supplyTypeId = document.getElementById('supplyTypeSelect').value;
  const counterpart  = lifelineCounterpart(discomId, categoryId, supplyTypeId);
  if (!counterpart) { hideLifelineNotice(); return; }

  const load  = +document.getElementById('connectedLoad').value || 0;
  const units = getEffectiveUnits() || 0;
  const cap   = lifelineUnitCap();
  const loadOver  = load > LIFELINE_MAX_LOAD_KW;
  const unitsOver = units > cap;

  if (!loadOver && !unitsOver) { hideLifelineNotice(); return; }

  document.getElementById('supplyTypeSelect').value = counterpart;
  refreshSupplyTypeDependent();

  const reasons = [];
  if (loadOver)  reasons.push(`sanctioned load ${load} kW exceeds the 1 kW lifeline limit`);
  if (unitsOver) reasons.push(`consumption ${Math.round(units)} units exceeds the ${Math.round(cap)}-unit lifeline cap${cap > LIFELINE_MAX_UNITS_PER_MONTH ? ' for this billing period' : ''}`);
  const msg = `Switched to the non-lifeline tariff — ${reasons.join(' and ')}.`;
  showLifelineNotice(msg);
  showToast(msg);
}

// ─── Multi-month bill revision (month-by-month, compounding LPSC) ───────────────
const round2 = n => Math.round(n * 100) / 100;

// Builds the month-by-month ledger: total units split evenly across the months; each month's
// bill computed at that month's own FPPA/tariff; LPSC compounded on the running balance
// (charged on the prior balance, so a month's bill first attracts LPSC the next month);
// dated payments applied in their month; undated payments + adjustments applied at the end.
export function buildRevisionLedger({ discomId, categoryId, supplyTypeId, totalUnits,
    connectedLoadKw, billedDemandKw, fromISO, toISO, fppaAuto, manualFacRate, manualFacMode,
    lpscRate, previousArrear, arrearLpsc, payments, adjustments, delhiSubsidy }) {
  const months = fppaMonthDates(fromISO, toISO);
  const N = months.length || 1;
  const unitsPerMonth = totalUnits / N;

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
  const slabAgg = {};   // aggregated energy slabs keyed by rate → { rate, units, amount }
  let fixedPerMonth = 0, edRate = 0;
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
      connectedLoadKw, billedDemandKw, billingPeriodDays: 30, billingDate: ym + '-15',
      facRate, facMode, arrears: 0, arrearLpsc: 0, lpscRate: 0, currentLpscMonths: 0,
      lpscApplicable: false, payments: [], adjustments: [], delhiSubsidy, todUnits: null,
    });
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
      fixedPerMonth = mb.fixedPerMonth;
      const edc = (mb.extraCharges || []).find(c => c.type === 'percent_total' || c.type === 'percent_energy');
      if (edc) edRate = edc.rate;
    }
    balance += charges;

    const pay = payByMonth[ym] || 0;
    balance -= pay;

    rows.push({
      label: `${MON_ABBR[d.getMonth()]} ${d.getFullYear()}`,
      units: round2(unitsPerMonth), fppaRate: facRate, fppaMode: facMode,
      fppaBase, fppaAmount: round2(fppaAmt),
      energy: round2(energy), fixed: round2(demand),
      excess: round2(excess), ed: round2(ed),
      lpsc, charges, payment: pay, balance: round2(balance),
    });
    totalCharges += charges; totalLpsc += lpsc; totalPay += pay;
    totalEnergy += energy; totalDemand += demand; totalED += ed;
    totalExcess += excess; totalFppa += fppaAmt; totalSubsidy += subsidy;
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
    fixedPerMonth: round2(fixedPerMonth), edRate,
    totalCharges: round2(totalCharges), totalLpsc: round2(totalLpsc),
    totalPay: round2(totalPay), totalAdj: round2(totalAdj),
    totalPayable: Math.round(balance),
    discom, category, supplyTypeName, connectedLoadKw, billedDemandKw,
  };
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

  // Multi-month bill revision: when LPSC applies over a period spanning ≥2 months, bill each
  // month separately and compound LPSC on the running balance.
  const fromISO = document.getElementById('fromDate').value;
  const toISO   = document.getElementById('toDate').value;
  const revMonths = (fromISO && toISO) ? fppaMonthDates(fromISO, toISO) : [];
  if (lpscApplicable && revMonths.length >= 2 && units != null) {
    const ledger = buildRevisionLedger({
      discomId, categoryId, supplyTypeId, totalUnits: units,
      connectedLoadKw: load, billedDemandKw, fromISO, toISO,
      fppaAuto: document.getElementById('fppaAuto')?.checked !== false,
      manualFacRate: facRate, manualFacMode: facMode,
      lpscRate, previousArrear: arrears, arrearLpsc,
      payments: getPayments(), adjustments: getAdjustments(), delhiSubsidy,
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
    return;
  }

  const result = calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: load,
    billedDemandKw, billingPeriodDays, billingDate,
    facRate, facMode, arrears, arrearLpsc, lpscRate, currentLpscMonths, lpscApplicable,
    payments: getPayments(), adjustments: getAdjustments(),
    delhiSubsidy, todUnits
  });
  if (!result) return;

  const verifiedFppa = resolveFppaForDiscom(discomId, billingDate);

  const html = renderBill({
    result,
    consumerName: document.getElementById('consumerName').value.trim(),
    accountNo:    document.getElementById('accountNo').value.trim(),
    address:      document.getElementById('address').value.trim(),
    meterNo:      getMeterNo(),
    billingMonth: document.getElementById('billingMonth').value,
    billingYear:  document.getElementById('billingYear').value,
    prevReading:  document.getElementById('prevReading').value,
    currReading:  document.getElementById('currReading').value,
    fromDate:     document.getElementById('fromDate').value,
    toDate:       document.getElementById('toDate').value,
    fppaSource:   verifiedFppa ? `${verifiedFppa.label} — ${verifiedFppa.source}` : null,
  });

  const panel = document.getElementById('billPanel');
  panel.innerHTML = html;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Load from URL Params ─────────────────────────────────────────────────────

export function loadFromUrl() {
  const p = new URLSearchParams(location.search);
  if (!p.get('state')) return;

  const stateEl = document.getElementById('stateSelect');
  stateEl.value = p.get('state');
  stateEl.dispatchEvent(new Event('change'));

  setTimeout(() => {
    const discomEl = document.getElementById('discomSelect');
    discomEl.value = p.get('discom') || '';
    discomEl.dispatchEvent(new Event('change'));

    setTimeout(() => {
      const catEl = document.getElementById('categorySelect');
      catEl.value = p.get('cat') || '';
      catEl.dispatchEvent(new Event('change'));

      setTimeout(() => {
        if (p.get('st')) document.getElementById('supplyTypeSelect').value = p.get('st');

        const fields = {
          consumerName: 'name', accountNo: 'acc', address: 'addr',
          prevReading: 'prev', currReading: 'curr',
          fromDate: 'fd', toDate: 'td',
          unitsInput: 'units', connectedLoad: 'load', billedDemand: 'bd',
          todPeak: 'todp', todNormal: 'todn', todOffPeak: 'todop',
          facRate: 'fac', arrears: 'arr', arrearLpsc: 'arrlpsc',
          lpscRate: 'lpsc', currentLpscMonths: 'curmo'
        };
        for (const [id, key] of Object.entries(fields)) {
          const el = document.getElementById(id);
          if (el && p.get(key)) el.value = p.get(key);
        }
        // Meter number now lives in the Simple/TOD panels (Advanced derives it from labels)
        if (p.get('meter')) {
          ['meterNoSimple', 'meterNoTod'].forEach(id => { const e = document.getElementById(id); if (e) e.value = p.get('meter'); });
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
      }, 50);
    }, 50);
  }, 50);
}
