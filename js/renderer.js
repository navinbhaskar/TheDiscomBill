// js/renderer.js — Bill HTML renderer (pure string output, no DOM dependencies)

import { displayDate } from './utils.js';
export { displayDate };

/**
 * Format a number as Indian Rupees with 2 decimal places.
 * @param {number} n - The amount to format.
 * @returns {string} Formatted string like '₹ 1,23,456.78'.
 */
export function formatINR(n) {
  return '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Convert a number to Indian-English words (Crore, Lakh, Thousand) with 'Rupees ... and ... Paise Only'.
 * @param {number} amount - The rupee amount to convert.
 * @returns {string} The amount in words.
 */
export function numberToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function twoDigit(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }
  function threeDigit(n) {
    if (n < 100) return twoDigit(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigit(n % 100) : '');
  }
  function convert(n) {
    if (n === 0) return 'Zero';
    let res = '';
    if (n >= 10000000) { res += convert(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
    if (n >= 100000)   { res += convert(Math.floor(n / 100000))   + ' Lakh ';  n %= 100000;   }
    if (n >= 1000)     { res += convert(Math.floor(n / 1000))     + ' Thousand '; n %= 1000;   }
    if (n > 0)         { res += threeDigit(n); }
    return res.trim();
  }

  const absAmt = Math.abs(Math.round(amount));
  const rupees = Math.floor(absAmt);
  const paise  = Math.round((absAmt - rupees) * 100);
  let words = (amount < 0 ? 'Credit of ' : '') + 'Rupees ' + convert(rupees);
  if (paise > 0) words += ' and ' + convert(paise) + ' Paise';
  return words + ' Only';
}

// Data-confidence badge shown on the bill: distinguishes rates checked against an official tariff
// order ("verified") from representative estimates the user should double-check.
function confidenceBadge(verified, asOf) {
  return verified
    ? `<div class="conf-badge conf-verified" title="Rates checked against the official tariff order">✓ Verified rates${asOf ? ` · ${asOf}` : ''}</div>`
    : `<div class="conf-badge conf-estimate" title="Representative rates — confirm against the DISCOM's official tariff order">≈ Representative rates</div>`;
}

// ─── Tariff / charge breakdown panel helpers ───────────────────────────────────

function fixedChargeDesc(config, demandKw, unit = 'kW') {
  if (config == null) return '—';
  if (typeof config === 'number') return `₹ ${config.toFixed(2)} per month (fixed)`;
  if (config.type === 'flat')   return `₹ ${config.rate.toFixed(2)} per month (fixed)`;
  if (config.type === 'per_kw' || config.type === 'per_kva')
    return `₹ ${config.rate}/${unit}/month × ${demandKw} ${unit}`;
  if (config.type === 'tiered') {
    return config.slabs.map(s => {
      const band = s.label || (s.maxLoad === Infinity ? 'above top slab' : `up to ${s.maxLoad} ${unit}`);
      return `${band}: ₹ ${s.rate}`;
    }).join(' · ');
  }
  return '—';
}

function slabScheduleRows(slabs) {
  let prev = 0;
  return (slabs || []).map(s => {
    const lo = prev + 1;
    const range = s.limit === Infinity ? `Above ${prev} units` : `${lo} – ${s.limit} units`;
    if (s.limit !== Infinity) prev = s.limit;
    return `<tr><td>${range}</td><td class="num">₹ ${s.rate.toFixed(2)}/unit</td></tr>`;
  }).join('');
}

let _accId = 0;
/** Reset the accordion ID counter. Called at the start of each render pass. */
export function resetAccordionIds() { _accId = 0; }
function accordionItem(title, subtitle, bodyHtml) {
  const id = `acc-${++_accId}`;
  return `
  <div class="accordion-item">
    <button type="button" class="accordion-header" aria-expanded="false" aria-controls="${id}" id="${id}-h">
      <span class="accordion-titles">
        <span class="accordion-title">${title}</span>
        <span class="accordion-sub">${subtitle}</span>
      </span>
      <span class="accordion-icon" aria-hidden="true"></span>
    </button>
    <div class="accordion-body" id="${id}" role="region" aria-labelledby="${id}-h"><div class="accordion-body-inner">${bodyHtml}</div></div>
  </div>`;
}

/**
 * Render a single-month provisional bill as an HTML string.
 * @param {Object} params - Consumer details, billing period, and the engine result.
 * @returns {string} Complete bill HTML.
 */
export function renderBill(params) {
  _accId = 0;
  const { result, consumerName, accountNo, address, meterNo,
          billingMonth, billingYear, prevReading, currReading,
          fromDate, toDate, fppaSource } = params;

  const { discom, category, supplyTypeName,
          units, billingBasis, energyUnit,
          netMetering, importUnits, exportUnits, openingCreditUnits, netUnits, closingCredit,
          connectedLoadKw, billedDemandKw, billingDemand, isDemandBilled, demandFloorPct, demandFloorApplied, demandUnit,
          fixedCharge, fixedChargeMonths, fixedPerMonth, slabBreakdown, totalEnergy,
          excessDemand, excessDemandPenalty, excessDemandRate,
          excessDemandMultiplier, excessDemandPctEnergyPerKw, excessDemandTolerancePct,
          minChargeFloor, minChargeTopUp,
          wheelingCharge, wheelingRate, wheelingType, wheelingLabel,
          todUnits, todPeakSurcharge, todOffPeakRebate,
          extraCharges, facAmount, facRate, facMode,
          tariffPeriodLabel, tariffEstimated, tariffVerified, tariffAsOf, tariffSourceUrl, tariffRates,
          currentGross, subsidyAmount, subsidyLabel, currentNet,
          arrears, arrearLpsc, lpscRate, currentLpscMonths, currentLpsc, lpscApplicable,
          payments, totalPayments,
          adjustments, totalAdjustments,
          totalPayable } = result;

  const dU = demandUnit || 'kW';   // 'kW' or 'kVA' for demand labels
  const billDate = new Date();
  const dueDate  = new Date(billDate); dueDate.setDate(dueDate.getDate() + 15);
  const fmtDate  = d => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  let billingPeriodText = '1 Month';
  if (fromDate && toDate) {
    const fd = new Date(fromDate), td = new Date(toDate);
    const days = Math.round((td - fd) / (1000 * 60 * 60 * 24));
    billingPeriodText = `${fmtDate(fd)} – ${fmtDate(td)} (${days} days)`;
  }

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  const categoryLabel = supplyTypeName
    ? `${category.name} › ${supplyTypeName}`
    : category.name;

  const eUnit = energyUnit || 'kWh';
  const slabRows = slabBreakdown.map(s => `
    <tr>
      <td class="indent">Energy Charges: ${eUnit === 'kVAh' ? s.label.replace(/\bunits\b/g, 'kVAh') : s.label}</td>
      <td class="num">${s.units}</td>
      <td class="num">₹ ${s.rate.toFixed(2)}</td>
      <td class="num amt">${formatINR(s.amount)}</td>
    </tr>`).join('');

  const extraRows = extraCharges.map(c => `
    <tr>
      <td>${c.name}${c.type === 'percent_energy' || c.type === 'percent_total'
        ? ' (@ ' + c.rate + '%)' : ''}</td>
      <td></td><td></td>
      <td class="num amt">${formatINR(c.amount)}</td>
    </tr>`).join('');

  const excessBasis = excessDemandPctEnergyPerKw
    ? `${excessDemandPctEnergyPerKw}% of energy/${dU}`
    : `₹ ${excessDemandRate}/${dU}${excessDemandMultiplier ? ` (${excessDemandMultiplier}× demand rate)` : ''}`;
  const excessTolNote = excessDemandTolerancePct ? `, above ${excessDemandTolerancePct}% of load` : '';
  const excessDemandRow = excessDemandPenalty > 0 ? `
    <tr class="excess-demand-row">
      <td class="indent">Excess Demand Penalty (${excessDemand.toFixed(2)} ${dU} × ${excessBasis}${excessTolNote})</td>
      <td></td><td></td>
      <td class="num amt">${formatINR(excessDemandPenalty)}</td>
    </tr>` : '';

  const minChargeRow = minChargeTopUp > 0 ? `
    <tr class="min-charge-row">
      <td class="indent">Minimum Charge top-up (bill raised to floor of ${formatINR(minChargeFloor)})</td>
      <td></td><td></td>
      <td class="num amt">${formatINR(minChargeTopUp)}</td>
    </tr>` : '';

  // Wheeling charge — shown only for DISCOMs whose tariff itemises it (opt-in per tariff).
  const wheelingBasis = wheelingType === 'per_unit'
    ? `${netUnits} ${eUnit} × ₹ ${(+wheelingRate).toFixed(2)}/${eUnit}`
    : (wheelingType && wheelingType !== 'flat' ? `₹ ${(+wheelingRate).toFixed(2)}/${dU}/month` : '');
  const wheelingRow = wheelingCharge > 0 ? `
    <tr class="wheeling-row">
      <td class="indent">${wheelingLabel || 'Wheeling Charges'}${wheelingBasis ? ` (${wheelingBasis})` : ''}</td>
      <td></td><td></td>
      <td class="num amt">${formatINR(wheelingCharge)}</td>
    </tr>` : '';

  const todRows = todUnits ? `
    ${todPeakSurcharge > 0 ? `
    <tr class="tod-peak-row">
      <td class="indent">TOD Peak Surcharge — ${todUnits.peak} units × 20% <span class="tod-slot-label">6AM–10AM · 6PM–10PM</span></td>
      <td class="num">${todUnits.peak}</td><td></td>
      <td class="num amt">+ ${formatINR(todPeakSurcharge)}</td>
    </tr>` : ''}
    ${todUnits.normal > 0 ? `
    <tr class="tod-normal-row">
      <td class="indent">TOD Normal Hours — ${todUnits.normal} units <span class="tod-slot-label">10AM–6PM</span></td>
      <td class="num">${todUnits.normal}</td><td></td>
      <td class="num amt">—</td>
    </tr>` : ''}
    ${todOffPeakRebate > 0 ? `
    <tr class="tod-offpeak-row">
      <td class="indent">TOD Off-Peak Rebate — ${todUnits.offPeak} units × 20% <span class="tod-slot-label">10PM–6AM</span></td>
      <td class="num">${todUnits.offPeak}</td><td></td>
      <td class="num amt">− ${formatINR(todOffPeakRebate)}</td>
    </tr>` : ''}` : '';

  const facLabel = facMode === 'percent'
    ? `FPPA Surcharge @ ${Math.abs(facRate)}% of charges${facRate < 0 ? ' (credit)' : ''}`
    : `FPPA Surcharge @ ₹ ${Math.abs(facRate).toFixed(2)}/unit${facRate < 0 ? ' (credit)' : ''}`;
  const facRow = facAmount !== 0 ? `
    <tr class="fac-row">
      <td>${facLabel}</td>
      <td class="num">${facMode === 'percent' ? '' : netUnits}</td><td></td>
      <td class="num amt">${facAmount < 0 ? '− ' + formatINR(-facAmount) : formatINR(facAmount)}</td>
    </tr>` : '';

  const subsidyRow = subsidyAmount > 0 ? `
    <tr class="subsidy-row">
      <td colspan="3">${subsidyLabel}</td>
      <td class="num amt">− ${formatINR(subsidyAmount)}</td>
    </tr>` : '';

  const hasPayments = totalPayments > 0;
  const adjItems    = adjustments.filter(a => a.amount !== 0);

  // Previous Arrear is always shown (₹0.00 when none); the LPSC lines stay conditional.
  const arrearsSection = `
    <tr class="section-header-row"><td colspan="4">Arrears &amp; Late Payment Charges</td></tr>
    <tr class="arrears-row">
      <td>Previous Arrear</td><td></td><td></td>
      <td class="num amt">${formatINR(arrears)}</td>
    </tr>
    ${arrearLpsc > 0 ? `
    <tr class="lpsc-row">
      <td>Prev. Arrear LPSC</td><td></td><td></td>
      <td class="num amt">${formatINR(arrearLpsc)}</td>
    </tr>` : ''}
    ${currentLpsc > 0 ? `
    <tr class="lpsc-row">
      <td>LPSC on Current Bill (${lpscRate}% × ${currentLpscMonths} month${currentLpscMonths !== 1 ? 's' : ''})</td><td></td><td></td>
      <td class="num amt">${formatINR(currentLpsc)}</td>
    </tr>` : ''}`;

  const paymentsSection = hasPayments ? `
    <tr class="section-header-row"><td colspan="4">Payments Received</td></tr>
    ${payments.filter(p => p.amount > 0).map(p => `
    <tr class="payment-bill-row">
      <td>Payment${p.date ? ' (' + displayDate(p.date) + ')' : ''}</td><td></td><td></td>
      <td class="num amt">− ${formatINR(p.amount)}</td>
    </tr>`).join('')}` : '';

  // Adjustments (miscellaneous charges) are always shown — itemised when present, else a zero row.
  const adjSection = `
    <tr class="section-header-row"><td colspan="4">Adjustments (Miscellaneous Charges)</td></tr>
    ${adjItems.length ? adjItems.map(a => `
    <tr class="adjustment-bill-row">
      <td>${a.name || 'Adjustment'}</td><td></td><td></td>
      <td class="num amt">${a.amount >= 0 ? formatINR(a.amount) : '− ' + formatINR(-a.amount)}</td>
    </tr>`).join('') : `
    <tr class="adjustment-bill-row">
      <td>No adjustments</td><td></td><td></td>
      <td class="num amt">${formatINR(0)}</td>
    </tr>`}`;

  const totalRow = `
    <tr class="total-payable-row">
      <td colspan="3"><strong>TOTAL AMOUNT PAYABLE</strong></td>
      <td class="num total-amt"><strong>₹ ${Math.max(0, totalPayable).toLocaleString('en-IN')}</strong></td>
    </tr>`;

  const estimatedBanner = tariffEstimated ? `
    <div class="bill-estimated-banner">
      <strong>⚠ ESTIMATED — rates approximate for this period.</strong>
      Verified tariff data isn't available for this billing date${tariffPeriodLabel ? ` (nearest applied: ${tariffPeriodLabel})` : ''}.
      Energy/fixed charges are carried forward from the nearest known tariff order and may differ from the actual rates in force then.
    </div>` : '';

  // ── Expandable rate / surcharge detail panels (click + to open) ──
  const edCharge = ((tariffRates && tariffRates.additionalCharges) || [])
    .find(c => c.type === 'percent_total' || c.type === 'percent_energy');

  const tariffBody = `
    <div class="acc-meta">Tariff period: <strong>${tariffPeriodLabel || 'Current'}</strong>
      ${tariffEstimated ? '<span class="tariff-est-tag">(estimated)</span>' : '<span class="hint-verified">✓ verified</span>'}</div>
    <table class="acc-table">
      <tr><td>Demand / Fixed Charge</td><td class="num">${fixedChargeDesc(tariffRates && tariffRates.fixedCharge, billingDemand != null ? billingDemand : billedDemandKw, dU)}${fixedChargeMonths > 1 ? ` × ${fixedChargeMonths} months` : ''} = <strong>${formatINR(fixedCharge)}</strong></td></tr>
    </table>
    <div class="acc-subhead">Energy charge slabs (telescopic)</div>
    <table class="acc-table">${slabScheduleRows(tariffRates && tariffRates.energySlabs)}</table>
    ${edCharge ? `<div class="acc-note">Electricity Duty: <strong>${edCharge.rate}%</strong> ${edCharge.type === 'percent_total' ? 'of fixed + energy + FPPA charges' : 'of energy charges'}.</div>` : ''}
    ${tariffRates && tariffRates.excessDemandRate ? `<div class="acc-note">Excess demand penalty: <strong>₹ ${tariffRates.excessDemandRate}/${dU}</strong> on demand above sanctioned load.</div>` : ''}
    ${billingBasis === 'kvah'
      ? `<div class="acc-note">Billing basis: <strong>kVA based (kVAh)</strong> — demand charged in kVA and energy on apparent units (kVAh), read directly from the kVAh meter; a poor power factor already shows up as more kVAh, so there is no separate PF penalty.</div>`
      : ''}
    ${demandFloorApplied ? `<div class="acc-note">Billing demand floored at <strong>${demandFloorPct}% of contract demand</strong> (${billingDemand.toFixed(2)} ${dU}), as the recorded MD (${billedDemandKw.toFixed(2)} ${dU}) was lower.</div>` : ''}
    <div class="acc-note acc-muted">Telescopic slabs — each rate applies only to units within that band.${result.billingPeriodDays ? ` Slab limits prorated for the ${result.billingPeriodDays}-day period.` : ''}</div>`;

  const lpscBody = `
    <div class="acc-meta">Rate: <strong>${lpscRate || 0}% per month</strong>, charged on the current net bill.${lpscApplicable === false ? ' <span class="tariff-est-tag">(LPSC not applicable)</span>' : ''}</div>
    <div class="acc-note">Formula: <code>LPSC = Net × ${lpscRate || 0}% × months overdue</code></div>
    ${currentLpsc > 0
      ? `<table class="acc-table">
           <tr><td>Net bill</td><td class="num">${formatINR(currentNet)}</td></tr>
           <tr><td>× ${lpscRate}% × ${currentLpscMonths} month${currentLpscMonths !== 1 ? 's' : ''}</td><td class="num"><strong>${formatINR(currentLpsc)}</strong></td></tr>
         </table>`
      : (lpscApplicable === false
          ? `<div class="acc-note acc-muted">LPSC not applicable for this consumer/period — no late-payment surcharge added.</div>`
          : `<div class="acc-note acc-muted">No LPSC on this bill — not marked overdue (0 months late).</div>`)}
    ${arrearLpsc > 0 ? `<div class="acc-note">Previous arrear LPSC carried over: <strong>${formatINR(arrearLpsc)}</strong>.</div>` : ''}
    <div class="acc-note acc-muted">LPSC accrues for each month a bill remains unpaid past its due date.</div>`;

  const fppaBody = `
    <div class="acc-meta">Method: <strong>${facMode === 'percent' ? '% of charges' : '₹ per unit'}</strong> · Applied: <strong>${facMode === 'percent' ? Math.abs(facRate) + '%' : '₹ ' + Math.abs(facRate).toFixed(2) + '/unit'}</strong>${facRate < 0 ? ' (credit)' : ''}</div>
    <div class="acc-note">Formula: <code>${facMode === 'percent' ? `${Math.abs(facRate)}% × (Fixed + Energy)` : `₹${Math.abs(facRate).toFixed(2)} × ${units} units`}</code></div>
    <table class="acc-table"><tr><td>This bill's FPPA</td><td class="num"><strong>${facAmount < 0 ? '− ' + formatINR(-facAmount) : formatINR(facAmount)}</strong></td></tr></table>
    ${fppaSource
      ? `<div class="acc-note acc-verified">✓ Source: ${fppaSource}</div>`
      : `<div class="acc-note acc-muted">No verified FPPA on record for this period — defaulted to ${facMode === 'percent' ? facRate + '%' : '₹' + facRate}. Enter the value from your bill if it differs.</div>`}
    <div class="acc-note acc-muted">FPPA / FPPAS is notified each billing cycle (often a ~3-month lag) to recover the gap between actual and approved power-purchase cost. Some states cap it (e.g. UP: 10%/cycle, excess carried forward).</div>`;

  const billExtras = `
    <div class="bill-extras no-print">
      <div class="bill-extras-title">Rates &amp; Surcharge Details</div>
      ${accordionItem('Tariff Details', 'Applicable rates and full calculation breakdown', tariffBody)}
      ${accordionItem('Late Payment Surcharge', 'How LPSC is applied and calculated for your bill', lpscBody)}
      ${accordionItem('FPPAS Rates', 'The monthly Fuel &amp; Power Purchase Adjustment surcharge applied', fppaBody)}
    </div>`;

  return `
  <div class="bill-actions no-print">
    <button class="btn-print" onclick="window.print()"><svg class="br-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg> Print / Save PDF</button>
    <button class="btn-share" onclick="window.__shareBill && window.__shareBill()"><svg class="br-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link</button>
    <button class="btn-share btn-whatsapp" onclick="window.__shareBillWa && window.__shareBillWa()"><svg class="br-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp</button>
    <button class="btn-share btn-reset" onclick="window.__resetCalculator && window.__resetCalculator()"><svg class="br-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Calculate new bill</button>
  </div>

  <div class="bill-wrap">
    <div class="bill-perf bill-perf-top" aria-hidden="true"></div>
    <div class="bill-stamp" aria-hidden="true"><span>Provisional</span><small>Estimate · Not a demand notice</small></div>
    ${estimatedBanner}
    <div class="bill-header">
      <div class="bill-header-left">
        <div class="bill-discom-icon">⚡</div>
        <div>
          <div class="bill-discom-name">${discom.name}</div>
          <div class="bill-discom-full">${discom.fullName}</div>
          <div class="bill-discom-area">${discom.area}</div>
        </div>
      </div>
      <div class="bill-header-right">
        <div class="bill-title-box">
          <div class="bill-title-main">PROVISIONAL BILL</div>
          <div class="bill-title-sub">Electricity Bill Estimate</div>
          <div class="bill-tariff-year">Tariff Year: ${discom.tariffYear || '2024-25'}</div>
          ${confidenceBadge(tariffVerified, tariffAsOf)}
        </div>
      </div>
    </div>

    <div class="bill-details-row">
      <div class="bill-details-box">
        <div class="bill-section-title">Consumer Details</div>
        <table class="bill-info-table">
          <tr><td>Name</td><td>: <strong>${consumerName || '—'}</strong></td></tr>
          <tr><td>Account No.</td><td>: ${accountNo || '—'}</td></tr>
          <tr><td>Address</td><td>: ${address || '—'}</td></tr>
          <tr><td>Category</td><td>: ${categoryLabel}</td></tr>
          <tr><td>${dU === 'kVA' ? 'Contract Demand' : 'Conn. Load'}</td><td>: ${connectedLoadKw} ${dU}</td></tr>
        </table>
      </div>
      <div class="bill-details-box">
        <div class="bill-section-title">Billing Details</div>
        <table class="bill-info-table">
          <tr><td>Bill Month</td><td>: <strong>${MONTHS[+billingMonth - 1]} ${billingYear}</strong></td></tr>
          <tr><td>Bill Date</td><td>: ${fmtDate(billDate)}</td></tr>
          <tr><td>Due Date</td><td>: ${fmtDate(dueDate)}</td></tr>
          <tr><td>Meter No.</td><td>: ${meterNo || '—'}</td></tr>
          <tr><td>DISCOM</td><td>: ${discom.name}</td></tr>
          <tr><td>Tariff Period</td><td>: ${tariffPeriodLabel || 'Current'}${tariffEstimated ? ' <span class="tariff-est-tag">(est.)</span>' : ''}</td></tr>
        </table>
      </div>
    </div>

    <div class="bill-reading-row">
      <div class="bill-section-title">Meter Reading Details</div>
      <table class="bill-reading-table">
        <thead>
          <tr>
            <th>Previous Reading</th>
            <th>Current Reading</th>
            <th>Units Consumed</th>
            <th>Billing Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${prevReading !== '' && prevReading !== null ? Number(prevReading).toLocaleString('en-IN') + ' kWh' : '—'}</td>
            <td>${currReading !== '' && currReading !== null ? Number(currReading).toLocaleString('en-IN') + ' kWh' : '—'}</td>
            <td><strong>${(netMetering ? netUnits : units).toLocaleString('en-IN')} ${netMetering ? 'net units' : 'units'}</strong>${todUnits ? `<br><span class="tod-reading-detail">Peak ${todUnits.peak} · Normal ${todUnits.normal} · Off-Peak ${todUnits.offPeak}</span>` : ''}</td>
            <td>${billingPeriodText}</td>
          </tr>
        </tbody>
      </table>
      ${netMetering ? `
      <table class="bill-reading-table net-meter-table">
        <thead><tr><th>Imported</th><th>Exported</th><th>Opening credit</th><th>Net billed</th><th>Credit carried fwd</th></tr></thead>
        <tbody><tr>
          <td>${importUnits.toLocaleString('en-IN')} kWh</td>
          <td>${exportUnits.toLocaleString('en-IN')} kWh</td>
          <td>${openingCreditUnits.toLocaleString('en-IN')} kWh</td>
          <td><strong>${netUnits.toLocaleString('en-IN')} kWh</strong></td>
          <td>${closingCredit > 0 ? closingCredit.toLocaleString('en-IN') + ' kWh' : '—'}</td>
        </tr></tbody>
      </table>
      <div class="acc-note acc-muted">Net metering: energy billed on net import = imported − (exported + opening credit). ${closingCredit > 0 ? `Surplus of <strong>${closingCredit.toLocaleString('en-IN')} kWh</strong> is banked and carried to the next bill.` : ''} Fixed/demand charges still apply.</div>
      ` : ''}
    </div>

    <div class="bill-charges-section">
      <div class="bill-section-title">Charge Breakdown</div>
      <table class="bill-charges-table">
        <thead>
          <tr>
            <th style="width:50%">Description</th>
            <th class="num">Units</th>
            <th class="num">Rate (₹/unit)</th>
            <th class="num">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="fixed-row">
            <td>Demand / Fixed Charge${demandFloorApplied
              ? ` (billed on ${billingDemand.toFixed(2)} ${dU} — ${demandFloorPct}% of contract demand; MD was ${billedDemandKw.toFixed(2)} ${dU})`
              : (isDemandBilled && billedDemandKw !== connectedLoadKw) ? ` (MD ${billedDemandKw.toFixed(2)} ${dU})` : ''}${fixedChargeMonths > 1 ? ` <span class="fixed-months">(${formatINR(fixedPerMonth)}/mo × ${fixedChargeMonths} months)</span>` : ''}</td>
            <td></td><td></td>
            <td class="num amt">${formatINR(fixedCharge)}</td>
          </tr>
          ${excessDemandRow}
          ${slabRows}
          <tr class="subtotal-row">
            <td colspan="3"><strong>Sub-Total (Energy Charges${billingBasis === 'kvah' ? ' — kVAh' : ''})</strong></td>
            <td class="num amt"><strong>${formatINR(totalEnergy)}</strong></td>
          </tr>
          ${todRows}
          ${minChargeRow}
          ${wheelingRow}
          ${facRow}
          ${extraRows}
        </tbody>
        <tfoot>
          <tr class="gross-row">
            <td colspan="3"><strong>Current Bill Gross</strong></td>
            <td class="num amt"><strong>${formatINR(currentGross)}</strong></td>
          </tr>
          ${subsidyRow}
          <tr class="net-row">
            <td colspan="3"><strong>Current Net Bill (Rounded)</strong></td>
            <td class="num net-amt"><strong>₹ ${currentNet.toLocaleString('en-IN')}</strong></td>
          </tr>
          ${arrearsSection}
          ${paymentsSection}
          ${adjSection}
          ${totalRow}
        </tfoot>
      </table>
    </div>

    <div class="bill-words">
      Amount in Words: <em>${numberToWords(Math.max(0, totalPayable))}</em>
    </div>

    ${category.notes ? `<div class="bill-category-note">ℹ️ ${category.notes}</div>` : ''}

    ${(() => {
      const stateVal = document.getElementById('stateSelect')?.value;
      if (!stateVal || !discom.id) return '';
      // Slug must match generate-seo.js so this points at the real static landing page.
      const slug = String(stateVal).toLowerCase().trim()
        .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const url = `/tariffs/${slug}/${discom.id}/`;
      return `<div class="bill-fullpage-link">
        <a href="${url}">See the full ${discom.name} tariff page — slabs, fixed charges &amp; FAQs →</a>
      </div>`;
    })()}

    <div class="bill-disclaimer">
      <strong>⚠ PROVISIONAL BILL</strong> – This is an estimated bill for reference only.
      Actual charges from ${discom.name} may differ. Tariff data is approximate (${discom.tariffYear || '2024-25'}).
      ${discom.website ? `<br>Official website: <a href="${discom.website}" target="_blank" rel="noopener">${discom.website}</a>` : ''}
    </div>

    <div class="bill-barcode" aria-hidden="true">
      <div class="bill-barcode-bars"></div>
      <div class="bill-barcode-label">${(accountNo || 'PROVISIONAL ESTIMATE').toString().toUpperCase()}</div>
    </div>
    <div class="bill-perf bill-perf-bottom" aria-hidden="true"></div>
  </div>
  ${billExtras}`;
}

// ─── DISCOM comparison (same usage priced across a state's DISCOMs) ─────────────
export function renderComparison({ state, categoryName, units, rows }) {
  const cheapest = rows.length ? rows[0].total : 0;
  return `<div class="bill-wrap comparison-wrap">
    <div class="bill-section-title">DISCOM Comparison — ${state}</div>
    <div class="acc-note">Same usage (<strong>${units.toLocaleString('en-IN')} units</strong> · ${categoryName}) priced across every DISCOM in ${state} that offers this category. Figures are the <strong>net current bill</strong> (excludes arrears / LPSC).</div>
    <div class="rev-table-scroll">
      <table class="bill-charges-table cmp-table">
        <thead><tr><th>DISCOM</th><th class="num">Energy</th><th class="num">Fixed</th><th class="num">FPPA</th><th class="num">Net Bill</th><th class="num">vs best</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr class="${r.current ? 'cmp-current' : ''}">
            <td>${r.name}${r.current ? ' <span class="cmp-you">(selected)</span>' : ''}${r.supplyTypeName ? `<br><span class="cmp-sub">${r.supplyTypeName}</span>` : ''}</td>
            <td class="num">${formatINR(r.energy)}</td>
            <td class="num">${formatINR(r.fixed)}</td>
            <td class="num">${r.fppa ? formatINR(r.fppa) : '—'}</td>
            <td class="num amt"><strong>₹ ${r.total.toLocaleString('en-IN')}</strong></td>
            <td class="num">${r.total === cheapest ? '<span class="cmp-best">cheapest</span>' : '+ ₹ ' + (r.total - cheapest).toLocaleString('en-IN')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="bill-disclaimer">⚠ Indicative comparison using each DISCOM's modelled tariff for identical inputs. FPPA and taxes vary by period — verify against official tariffs before switching decisions.</div>
  </div>`;
}

// ─── Multi-month bill revision (month-by-month, compounding LPSC) ───────────────
/**
 * Render a multi-month bill revision with a month-by-month ledger, compounding LPSC,
 * FPPA breakdown, and net metering summary.
 * @param {Object} params - Consumer details and the revision ledger from buildRevisionLedger.
 * @returns {string} Complete revision bill HTML.
 */
export function renderRevisionBill(params) {
  _accId = 0;
  const { ledger, consumerName, accountNo, address, meterNo, fromDate, toDate } = params;
  const { rows, monthsCount, totalUnits, unitsPerMonth, startArrear, lpscRate,
          totalEnergy, totalDemand, totalED, totalExcess, totalFppa, totalSubsidy, energySlabs,
          fixedPerMonth, edRate, tariffVerified, tariffAsOf,
          arrear, previousLpsc, totalCharges, totalLpsc, totalPay, totalAdj, totalPayable,
          netMetering, totalImport, totalExport, totalNet, finalCredit,
          discom, category, supplyTypeName, connectedLoadKw, billedDemandKw, demandUnit } = ledger;
  const dU = demandUnit || 'kW';

  // Net-metering summary (rooftop solar) — shown above the bill summary when net metering is on.
  const netMeterBlock = netMetering ? `
    <div class="bill-reading-row">
      <div class="bill-section-title">Net Metering (Rooftop Solar)</div>
      <table class="bill-reading-table net-meter-table">
        <thead><tr><th>Imported</th><th>Exported</th><th>Net Billed</th><th>Credit Carried Fwd</th></tr></thead>
        <tbody><tr>
          <td>${totalImport.toLocaleString('en-IN')} kWh</td>
          <td>${totalExport.toLocaleString('en-IN')} kWh</td>
          <td><strong>${totalNet.toLocaleString('en-IN')} kWh</strong></td>
          <td>${finalCredit > 0 ? finalCredit.toLocaleString('en-IN') + ' kWh' : '—'}</td>
        </tr></tbody>
      </table>
      <div class="acc-note acc-muted">Energy billed on net import = imported − exported${finalCredit > 0 ? `; surplus of ${finalCredit.toLocaleString('en-IN')} kWh banked for the next bill` : ''}.</div>
    </div>` : '';

  const fmtDate = iso => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };
  const billDate = new Date();
  const dueDate  = new Date(billDate); dueDate.setDate(dueDate.getDate() + 15);
  const categoryLabel = supplyTypeName ? `${category.name} › ${supplyTypeName}` : (category ? category.name : '');
  const fmtPlain = d => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const signed = n => n < 0 ? '− ' + formatINR(-n) : formatINR(n);
  const line = (label, amount, cls = '') => `<tr class="${cls}"><td>${label}</td><td class="num amt">${signed(amount)}</td></tr>`;

  // ── Aggregated summary (totals over all months) ──
  // Previous Arrear and Adjustments are always shown (₹0.00 when none); LPSC/payment lines stay conditional.
  const arrLpscRows = [
    line('Previous Arrear', arrear),
    previousLpsc > 0 ? line('Previous LPSC', previousLpsc) : '',
    totalLpsc > 0    ? line('Current LPSC (compounded)', totalLpsc) : '',
    totalPay > 0     ? `<tr class="payment-bill-row"><td>Payments Received</td><td class="num amt">− ${formatINR(totalPay)}</td></tr>` : '',
    line('Adjustments (Miscellaneous Charges)', totalAdj, 'adjustment-bill-row'),
  ].filter(Boolean).join('');
  const arrSection = `<tr class="section-header-row"><td colspan="2">Arrears &amp; Late Payment Charges</td></tr>${arrLpscRows}`;

  const slabRows = (energySlabs || []).map(s =>
    `<tr><td class="indent">Energy @ ₹ ${s.rate.toFixed(2)}/unit — ${s.units.toLocaleString('en-IN')} units</td><td class="num amt">${formatINR(s.amount)}</td></tr>`
  ).join('');

  const summaryTable = `
    <table class="bill-charges-table">
      <thead><tr><th>Description</th><th class="num">Amount (₹)</th></tr></thead>
      <tbody>
        ${slabRows}
        <tr class="subtotal-row"><td><strong>Energy Charges</strong></td><td class="num amt"><strong>${formatINR(totalEnergy)}</strong></td></tr>
        ${line(`Fixed Charge${monthsCount > 1 ? ` (${formatINR(fixedPerMonth)}/mo × ${monthsCount} months)` : ''}`, totalDemand)}
        ${totalExcess > 0 ? line('Excess Demand Penalty', totalExcess) : ''}
        ${line('FPPA Surcharge', totalFppa)}
        ${totalED ? line(`Electricity Duty${edRate ? ` @ ${edRate}%` : ''}`, totalED) : ''}
        ${totalSubsidy > 0 ? `<tr class="subsidy-row"><td>Subsidy</td><td class="num amt">− ${formatINR(totalSubsidy)}</td></tr>` : ''}
      </tbody>
      <tfoot>
        <tr class="net-row"><td><strong>Net Current Bill</strong></td><td class="num net-amt"><strong>${formatINR(totalCharges)}</strong></td></tr>
        ${arrSection}
        <tr class="total-payable-row"><td><strong>TOTAL AMOUNT PAYABLE</strong></td><td class="num total-amt"><strong>₹ ${Math.max(0, totalPayable).toLocaleString('en-IN')}</strong></td></tr>
      </tfoot>
    </table>`;

  // ── Expandable: month-by-month ledger ──
  const showExcess = totalExcess > 0;   // only show the Excess column when a penalty applies
  const cell = (v, cls = 'num') => `<td class="${cls}">${v}</td>`;
  const headCols = ['Month', 'Units', 'Energy', 'Fixed', ...(showExcess ? ['Excess'] : []), 'FPPA', 'ED', 'LPSC', 'Payment', 'Balance'];
  const thead = `<tr>${headCols.map((h, i) => `<th class="${i === 0 ? '' : 'num'}">${h}</th>`).join('')}</tr>`;
  const emptyMid = headCols.length - 2;   // cells between Month and Balance
  const startRow = startArrear > 0
    ? `<tr class="rev-start-row"><td>Opening arrear (carried in)</td>${'<td></td>'.repeat(emptyMid)}<td class="num amt">${formatINR(startArrear)}</td></tr>`
    : '';
  const monthRows = rows.map(r => `<tr>${[
    `<td>${r.label}</td>`,
    cell(r.units.toLocaleString('en-IN')),
    cell(r.energy ? formatINR(r.energy) : '—'),
    cell(r.fixed ? formatINR(r.fixed) : '—'),
    ...(showExcess ? [cell(r.excess ? formatINR(r.excess) : '—')] : []),
    cell(r.fppaAmount ? signed(r.fppaAmount) : '—'),
    cell(r.ed ? formatINR(r.ed) : '—'),
    cell(r.lpsc > 0 ? '+ ' + formatINR(r.lpsc) : '—'),
    cell(r.payment > 0 ? '− ' + formatINR(r.payment) : '—'),
    cell(formatINR(r.balance), 'num amt'),
  ].join('')}</tr>`).join('');
  const footCells = [
    `<td><strong>Totals</strong></td>`,
    `<td></td>`,
    `<td class="num"><strong>${formatINR(totalEnergy)}</strong></td>`,
    `<td class="num"><strong>${formatINR(totalDemand)}</strong></td>`,
    ...(showExcess ? [`<td class="num"><strong>${formatINR(totalExcess)}</strong></td>`] : []),
    `<td class="num"><strong>${signed(totalFppa)}</strong></td>`,
    `<td class="num"><strong>${formatINR(totalED)}</strong></td>`,
    `<td class="num"><strong>${formatINR(totalLpsc)}</strong></td>`,
    `<td class="num"><strong>${totalPay > 0 ? '− ' + formatINR(totalPay) : '—'}</strong></td>`,
    `<td class="num amt"><strong>${formatINR(Math.max(0, totalPayable))}</strong></td>`,
  ].join('');
  const ledgerBody = `
    <div class="acc-note">Per-month charges itemised: <strong>Energy</strong>, <strong>Fixed</strong> (demand)${showExcess ? ', <strong>Excess</strong> (demand penalty)' : ''}, <strong>FPPA</strong> and <strong>ED</strong> (Electricity Duty). LPSC compounds on the running balance.</div>
    <div class="rev-table-scroll">
      <table class="bill-charges-table rev-table rev-table--wide">
        <thead>${thead}</thead>
        <tbody>${startRow}${monthRows}</tbody>
        <tfoot><tr class="subtotal-row">${footCells}</tr></tfoot>
      </table>
    </div>`;

  // ── Expandable: month-by-month FPPA (same compact table style as the ledger) ──
  const fppaIsPercent = !!(rows[0] && rows[0].fppaMode === 'percent');
  const fppaRows = rows.map(r => `
    <tr>
      <td>${r.label}</td>
      <td class="num">${r.fppaMode === 'percent' ? r.fppaRate + '%' : '₹' + r.fppaRate + '/unit'}</td>
      <td class="num">${r.fppaMode === 'percent' ? formatINR(r.fppaBase) : r.units.toLocaleString('en-IN')}</td>
      <td class="num amt">${signed(r.fppaAmount)}</td>
    </tr>`).join('');
  const fppaBody = `
    <div class="acc-note">Each month uses its own notified FPPA rate, applied to that month's ${fppaIsPercent ? 'fixed + energy + excess charges (base)' : 'units'}.</div>
    <div class="rev-table-scroll">
      <table class="bill-charges-table rev-table">
        <thead><tr><th>Month</th><th class="num">Rate</th><th class="num">${fppaIsPercent ? 'Base (₹)' : 'Units'}</th><th class="num">FPPA (₹)</th></tr></thead>
        <tbody>${fppaRows}</tbody>
        <tfoot><tr class="subtotal-row"><td colspan="3"><strong>Total FPPA</strong></td><td class="num amt"><strong>${signed(totalFppa)}</strong></td></tr></tfoot>
      </table>
    </div>`;

  const expandables = `
    <div class="bill-extras no-print">
      <div class="bill-extras-title">Details (click + to expand)</div>
      ${accordionItem('Month-by-Month Ledger', `${monthsCount} months · LPSC @ ${lpscRate}%/mo compounded on the running balance`, ledgerBody)}
      ${accordionItem('Month-by-Month FPPA', 'Each month&rsquo;s fuel-surcharge rate and amount', fppaBody)}
    </div>`;

  return `
  <div class="bill-actions no-print">
    <button class="btn-print" onclick="window.print()"><svg class="br-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg> Print / Save PDF</button>
    <button class="btn-share" onclick="window.__shareBill && window.__shareBill()"><svg class="br-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link</button>
    <button class="btn-share btn-whatsapp" onclick="window.__shareBillWa && window.__shareBillWa()"><svg class="br-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp</button>
    <button class="btn-share btn-reset" onclick="window.__resetCalculator && window.__resetCalculator()"><svg class="br-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Calculate new bill</button>
  </div>

  <div class="bill-wrap">
    <div class="bill-perf bill-perf-top" aria-hidden="true"></div>
    <div class="bill-stamp" aria-hidden="true"><span>Provisional</span><small>Estimate · Not a demand notice</small></div>
    <div class="bill-header">
      <div class="bill-header-left">
        <div class="bill-discom-icon">⚡</div>
        <div>
          <div class="bill-discom-name">${discom.name}</div>
          <div class="bill-discom-full">${discom.fullName}</div>
          <div class="bill-discom-area">${discom.area}</div>
        </div>
      </div>
      <div class="bill-header-right">
        <div class="bill-title-box">
          <div class="bill-title-main">Provisional Bill/Bill Revision</div>
          <div class="bill-title-sub">Multi-Month Estimate</div>
          <div class="bill-tariff-year">Tariff Year: ${discom.tariffYear || '2024-25'}</div>
          ${confidenceBadge(tariffVerified, tariffAsOf)}
        </div>
      </div>
    </div>

    <div class="bill-details-row">
      <div class="bill-details-box">
        <div class="bill-section-title">Consumer Details</div>
        <table class="bill-info-table">
          <tr><td>Name</td><td>: <strong>${consumerName || '—'}</strong></td></tr>
          <tr><td>Account No.</td><td>: ${accountNo || '—'}</td></tr>
          <tr><td>Address</td><td>: ${address || '—'}</td></tr>
          <tr><td>Category</td><td>: ${categoryLabel}</td></tr>
          <tr><td>${dU === 'kVA' ? 'Contract Demand' : 'Conn. Load'}</td><td>: ${connectedLoadKw} ${dU}${billedDemandKw ? ` · MD ${billedDemandKw} ${dU}` : ''}</td></tr>
        </table>
      </div>
      <div class="bill-details-box">
        <div class="bill-section-title">Revision Details</div>
        <table class="bill-info-table">
          <tr><td>Period</td><td>: <strong>${fmtDate(fromDate)} – ${fmtDate(toDate)}</strong></td></tr>
          <tr><td>Months</td><td>: ${monthsCount}</td></tr>
          <tr><td>Total Units</td><td>: ${totalUnits.toLocaleString('en-IN')} (~${unitsPerMonth}/mo)</td></tr>
          <tr><td>Meter No.</td><td>: ${meterNo || '—'}</td></tr>
          <tr><td>Bill Date</td><td>: ${fmtPlain(billDate)}</td></tr>
          <tr><td>Due Date</td><td>: ${fmtPlain(dueDate)}</td></tr>
        </table>
      </div>
    </div>

    ${netMeterBlock}

    <div class="bill-charges-section">
      <div class="bill-section-title">Bill Summary</div>
      ${summaryTable}
    </div>

    <div class="bill-words">
      Amount in Words: <em>${numberToWords(Math.max(0, totalPayable))}</em>
    </div>

    ${expandables}

    <div class="bill-category-note">
      ℹ️ ${monthsCount}-month revision. <strong>Assumption:</strong> the ${totalUnits.toLocaleString('en-IN')} total units are
      split <strong>evenly</strong> (~${unitsPerMonth}/month) across the period — if actual monthly consumption varied, the
      slab placement and FPPA per month (and hence the total) will differ; enter each month separately for an exact figure.
      Each month is billed at its own FPPA / tariff. LPSC @ <strong>${lpscRate}%/month compounds on the running balance</strong>
      (so each month's bill first attracts LPSC the following month). Payments are applied on their dates.
      Expand the panels above for the month-by-month ledger and FPPA breakdown.
    </div>

    <div class="bill-disclaimer">
      <strong>⚠ Provisional Bill / Bill Revision</strong> – Estimated multi-month bill for reference only.
      Consumption is assumed uniform across the period; actual monthly readings and surcharges from ${discom.name} may differ.
      ${discom.website ? `<br>Official website: <a href="${discom.website}" target="_blank" rel="noopener">${discom.website}</a>` : ''}
    </div>

    <div class="bill-barcode" aria-hidden="true">
      <div class="bill-barcode-bars"></div>
      <div class="bill-barcode-label">${(accountNo || 'PROVISIONAL ESTIMATE').toString().toUpperCase()}</div>
    </div>
    <div class="bill-perf bill-perf-bottom" aria-hidden="true"></div>
  </div>`;
}
