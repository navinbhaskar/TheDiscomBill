// js/ui.js — All DOM manipulation and UI state functions

import {
  getStates, getDiscoms, getCategories, getSupplyTypes,
  findDiscom, getEffectiveTariff,
  findStateMetaByDiscom, resolveDatedTariff, fyStart,
} from './tariffs/registry.js';
import { resolveFppaForDiscom } from './tariffs/fppa.js';
import { calculateBill } from './engine.js';
import { renderBill } from './renderer.js';

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
    meter:   document.getElementById('meterNo').value,
    month:   document.getElementById('billingMonth').value,
    year:    document.getElementById('billingYear').value,
    fd:      document.getElementById('fromDate').value,
    td:      document.getElementById('toDate').value,
    prev:    document.getElementById('prevReading').value,
    curr:    document.getElementById('currReading').value,
    units:   document.getElementById('unitsInput').value,
    load:    document.getElementById('connectedLoad').value,
    bd:      document.getElementById('billedDemand')?.value || '',
    tod:     document.getElementById('todEnabled')?.checked ? '1' : '',
    todp:    document.getElementById('todPeak')?.value    || '',
    todn:    document.getElementById('todNormal')?.value  || '',
    todop:   document.getElementById('todOffPeak')?.value || '',
    fac:     document.getElementById('facRate').value,
    facm:    document.getElementById('facMode')?.value || '',
    arr:     document.getElementById('arrears').value,
    arrlpsc: document.getElementById('arrearLpsc').value,
    lpsc:    document.getElementById('lpscRate').value,
    curmo:   document.getElementById('currentLpscMonths').value,
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
    <input type="date" class="dyn-date" placeholder="Payment Date">
    <input type="number" class="dyn-amount" placeholder="Amount (₹)" value="0" min="0" step="0.01">
    <button class="btn-remove-row" type="button" title="Remove">×</button>`;
  row.querySelector('.dyn-amount').addEventListener('input', updatePaymentTotal);
  row.querySelector('.btn-remove-row').addEventListener('click', () => { row.remove(); updatePaymentTotal(); });
  container.appendChild(row);
  row.querySelector('.dyn-date').focus();
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

export function prefillFac(discomId, categoryId, supplyTypeId) {
  const rateEl = document.getElementById('facRate');
  const modeEl = document.getElementById('facMode');
  const autoEl = document.getElementById('fppaAuto');

  // Manual mode: never overwrite the user's entered value
  if (autoEl && !autoEl.checked) { updateFacUnitLabel(); return; }

  // 1) Government-verified notified FPPA for this billing cycle takes priority
  const verified = resolveFppaForDiscom(discomId, getBillingDate());
  if (verified) {
    rateEl.value = verified.rate;
    if (modeEl) modeEl.value = verified.mode === 'percent' ? 'percent' : 'per_unit';
    setFppaSource(`✓ ${verified.label} — ${verified.source}`, 'verified');
    updateFacUnitLabel();
    return;
  }

  // 2) No verified value on record for this period → default to 0 (editable).
  // FPPA is notified per billing cycle; many periods genuinely had none, so we don't
  // assume the static tariff default. Enter it manually if your bill shows one.
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

export function populateMonthYear() {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const mSel = document.getElementById('billingMonth');
  MONTHS.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = String(i + 1).padStart(2, '0');
    opt.textContent = m;
    mSel.appendChild(opt);
  });
  const now = new Date();
  mSel.value = String(now.getMonth() + 1).padStart(2, '0');

  const ySel = document.getElementById('billingYear');
  const cy = now.getFullYear();
  // Range back to 2004 so historical (year-versioned) bills can be calculated
  for (let y = cy + 1; y >= 2004; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    ySel.appendChild(opt);
  }
  ySel.value = cy;
}

// ─── Units Display ────────────────────────────────────────────────────────────

export function getTodUnits() {
  if (!document.getElementById('todEnabled')?.checked) return null;
  const peak    = +document.getElementById('todPeak').value    || 0;
  const normal  = +document.getElementById('todNormal').value  || 0;
  const offPeak = +document.getElementById('todOffPeak').value || 0;
  return { peak, normal, offPeak };
}

export function updateTodDisplay() {
  const enabled = document.getElementById('todEnabled')?.checked;
  const group   = document.getElementById('todGroup');
  if (group) group.style.display = enabled ? 'block' : 'none';
  if (enabled) {
    const peak    = +document.getElementById('todPeak').value    || 0;
    const normal  = +document.getElementById('todNormal').value  || 0;
    const offPeak = +document.getElementById('todOffPeak').value || 0;
    const total   = peak + normal + offPeak;
    const display = document.getElementById('todTotalDisplay');
    if (total > 0) {
      document.getElementById('todTotalUnitsDisplay').textContent  = total.toLocaleString('en-IN');
      document.getElementById('todPeakDisplay').textContent        = peak.toLocaleString('en-IN');
      document.getElementById('todNormalDisplay').textContent      = normal.toLocaleString('en-IN');
      document.getElementById('todOffPeakDisplay').textContent     = offPeak.toLocaleString('en-IN');
      display.style.display = 'block';
    } else {
      display.style.display = 'none';
    }
  }
  updateCalcButton();
}

export function getEffectiveUnits() {
  // TOD mode: total is sum of the three time zones
  if (document.getElementById('todEnabled')?.checked) {
    const peak    = +document.getElementById('todPeak').value    || 0;
    const normal  = +document.getElementById('todNormal').value  || 0;
    const offPeak = +document.getElementById('todOffPeak').value || 0;
    const total   = peak + normal + offPeak;
    return total > 0 ? total : null;
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
  const units = getEffectiveUnits();
  const disp  = document.getElementById('unitsDisplay');
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

export function updateBilledDemandVisibility(discomId, categoryId, supplyTypeId) {
  const tariff = getEffectiveTariff(discomId, categoryId, supplyTypeId);
  const group  = document.getElementById('billedDemandGroup');
  if (group) group.style.display = (tariff && tariff.excessDemandRate) ? 'block' : 'none';
}

export function doCalculate() {
  if (!canCalculate()) return;

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

  const delhiSubsidy = isDelhiDiscom(discomId) &&
    document.getElementById('delhiSubsidyCheck') &&
    document.getElementById('delhiSubsidyCheck').checked;

  const billingPeriodDays = getBillingPeriodDays();
  const billingDate       = getBillingDate();
  const todUnits          = getTodUnits();

  const result = calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: load,
    billedDemandKw, billingPeriodDays, billingDate,
    facRate, facMode, arrears, arrearLpsc, lpscRate, currentLpscMonths,
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
    meterNo:      document.getElementById('meterNo').value.trim(),
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
          meterNo: 'meter', prevReading: 'prev', currReading: 'curr',
          fromDate: 'fd', toDate: 'td',
          unitsInput: 'units', connectedLoad: 'load', billedDemand: 'bd',
          todPeak: 'todp', todNormal: 'todn', todOffPeak: 'todop',
          facRate: 'fac', arrears: 'arr', arrearLpsc: 'arrlpsc',
          lpscRate: 'lpsc', currentLpscMonths: 'curmo'
        };
        for (const [id, key] of Object.entries(fields)) {
          if (p.get(key)) document.getElementById(id).value = p.get(key);
        }
        if (p.get('month')) document.getElementById('billingMonth').value = p.get('month');
        if (p.get('year'))  document.getElementById('billingYear').value  = p.get('year');
        if (p.get('tod') === '1') {
          document.getElementById('todEnabled').checked = true;
          updateTodDisplay();
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
