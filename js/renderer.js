// js/renderer.js — Bill HTML renderer (pure string output, no DOM dependencies)

export function formatINR(n) {
  return '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

// ─── Tariff / charge breakdown panel helpers ───────────────────────────────────

function fixedChargeDesc(config, demandKw) {
  if (config == null) return '—';
  if (typeof config === 'number') return `₹ ${config.toFixed(2)} per month (fixed)`;
  if (config.type === 'flat')   return `₹ ${config.rate.toFixed(2)} per month (fixed)`;
  if (config.type === 'per_kw') return `₹ ${config.rate}/kW/month × ${demandKw} kW`;
  if (config.type === 'tiered') {
    return config.slabs.map(s => {
      const band = s.label || (s.maxLoad === Infinity ? 'above top slab' : `up to ${s.maxLoad} kW`);
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

function accordionItem(title, subtitle, bodyHtml) {
  return `
  <div class="accordion-item">
    <button type="button" class="accordion-header" aria-expanded="false">
      <span class="accordion-titles">
        <span class="accordion-title">${title}</span>
        <span class="accordion-sub">${subtitle}</span>
      </span>
      <span class="accordion-icon" aria-hidden="true"></span>
    </button>
    <div class="accordion-body"><div class="accordion-body-inner">${bodyHtml}</div></div>
  </div>`;
}

export function renderBill(params) {
  const { result, consumerName, accountNo, address, meterNo,
          billingMonth, billingYear, prevReading, currReading,
          fromDate, toDate, fppaSource } = params;

  const { discom, category, supplyTypeName,
          units, connectedLoadKw, billedDemandKw,
          fixedCharge, fixedChargeMonths, fixedPerMonth, slabBreakdown, totalEnergy,
          excessDemand, excessDemandPenalty, excessDemandRate,
          todUnits, todPeakSurcharge, todOffPeakRebate,
          extraCharges, facAmount, facRate, facMode,
          tariffPeriodLabel, tariffEstimated, tariffRates,
          currentGross, subsidyAmount, subsidyLabel, currentNet,
          arrears, arrearLpsc, lpscRate, currentLpscMonths, currentLpsc, lpscApplicable,
          payments, totalPayments,
          adjustments, totalAdjustments,
          totalPayable } = result;

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

  const slabRows = slabBreakdown.map(s => `
    <tr>
      <td class="indent">Energy Charges: ${s.label}</td>
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

  const excessDemandRow = excessDemandPenalty > 0 ? `
    <tr class="excess-demand-row">
      <td class="indent">Excess Demand Penalty (${excessDemand.toFixed(2)} kW excess × ₹ ${excessDemandRate}/kW)</td>
      <td></td><td></td>
      <td class="num amt">${formatINR(excessDemandPenalty)}</td>
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
      <td class="num">${facMode === 'percent' ? '' : units}</td><td></td>
      <td class="num amt">${facAmount < 0 ? '− ' + formatINR(-facAmount) : formatINR(facAmount)}</td>
    </tr>` : '';

  const subsidyRow = subsidyAmount > 0 ? `
    <tr class="subsidy-row">
      <td colspan="3">${subsidyLabel}</td>
      <td class="num amt">− ${formatINR(subsidyAmount)}</td>
    </tr>` : '';

  const hasArrears  = arrears > 0 || arrearLpsc > 0 || currentLpsc > 0;
  const hasPayments = totalPayments > 0;
  const hasAdj      = adjustments.some(a => a.amount !== 0);
  const showTotal   = hasArrears || hasPayments || hasAdj;

  const arrearsSection = hasArrears ? `
    <tr class="section-header-row"><td colspan="4">Arrears &amp; Late Payment Charges</td></tr>
    ${arrears > 0 ? `
    <tr class="arrears-row">
      <td>Previous Arrear</td><td></td><td></td>
      <td class="num amt">${formatINR(arrears)}</td>
    </tr>` : ''}
    ${arrearLpsc > 0 ? `
    <tr class="lpsc-row">
      <td>Prev. Arrear LPSC</td><td></td><td></td>
      <td class="num amt">${formatINR(arrearLpsc)}</td>
    </tr>` : ''}
    ${currentLpsc > 0 ? `
    <tr class="lpsc-row">
      <td>LPSC on Current Bill (${lpscRate}% × ${currentLpscMonths} month${currentLpscMonths !== 1 ? 's' : ''})</td><td></td><td></td>
      <td class="num amt">${formatINR(currentLpsc)}</td>
    </tr>` : ''}` : '';

  const paymentsSection = hasPayments ? `
    <tr class="section-header-row"><td colspan="4">Payments Received</td></tr>
    ${payments.filter(p => p.amount > 0).map(p => `
    <tr class="payment-bill-row">
      <td>Payment${p.date ? ' (' + p.date + ')' : ''}</td><td></td><td></td>
      <td class="num amt">− ${formatINR(p.amount)}</td>
    </tr>`).join('')}` : '';

  const adjSection = hasAdj ? `
    <tr class="section-header-row"><td colspan="4">Adjustments</td></tr>
    ${adjustments.filter(a => a.amount !== 0).map(a => `
    <tr class="adjustment-bill-row">
      <td>${a.name || 'Adjustment'}</td><td></td><td></td>
      <td class="num amt">${a.amount >= 0 ? formatINR(a.amount) : '− ' + formatINR(-a.amount)}</td>
    </tr>`).join('')}` : '';

  const totalRow = showTotal ? `
    <tr class="total-payable-row">
      <td colspan="3"><strong>TOTAL AMOUNT PAYABLE</strong></td>
      <td class="num total-amt"><strong>₹ ${Math.max(0, totalPayable).toLocaleString('en-IN')}</strong></td>
    </tr>` : '';

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
      <tr><td>Demand / Fixed Charge</td><td class="num">${fixedChargeDesc(tariffRates && tariffRates.fixedCharge, billedDemandKw)}${fixedChargeMonths > 1 ? ` × ${fixedChargeMonths} months` : ''} = <strong>${formatINR(fixedCharge)}</strong></td></tr>
    </table>
    <div class="acc-subhead">Energy charge slabs (telescopic)</div>
    <table class="acc-table">${slabScheduleRows(tariffRates && tariffRates.energySlabs)}</table>
    ${edCharge ? `<div class="acc-note">Electricity Duty: <strong>${edCharge.rate}%</strong> ${edCharge.type === 'percent_total' ? 'of fixed + energy + FPPA charges' : 'of energy charges'}.</div>` : ''}
    ${tariffRates && tariffRates.excessDemandRate ? `<div class="acc-note">Excess demand penalty: <strong>₹ ${tariffRates.excessDemandRate}/kW</strong> on demand above sanctioned load.</div>` : ''}
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
    <button class="btn-print" onclick="window.print()">🖨️ Print Bill</button>
    <button class="btn-share" onclick="window.__shareBill && window.__shareBill()">🔗 Share</button>
  </div>

  <div class="bill-wrap">
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
          <tr><td>Conn. Load</td><td>: ${connectedLoadKw} kW</td></tr>
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
            <td><strong>${units.toLocaleString('en-IN')} units</strong>${todUnits ? `<br><span class="tod-reading-detail">Peak ${todUnits.peak} · Normal ${todUnits.normal} · Off-Peak ${todUnits.offPeak}</span>` : ''}</td>
            <td>${billingPeriodText}</td>
          </tr>
        </tbody>
      </table>
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
            <td>Demand / Fixed Charge${(excessDemandRate && billedDemandKw !== connectedLoadKw) ? ` (MD ${billedDemandKw.toFixed(2)} kW)` : ''}${fixedChargeMonths > 1 ? ` <span class="fixed-months">(${formatINR(fixedPerMonth)}/mo × ${fixedChargeMonths} months)</span>` : ''}</td>
            <td></td><td></td>
            <td class="num amt">${formatINR(fixedCharge)}</td>
          </tr>
          ${excessDemandRow}
          ${slabRows}
          <tr class="subtotal-row">
            <td colspan="3"><strong>Sub-Total (Energy Charges)</strong></td>
            <td class="num amt"><strong>${formatINR(totalEnergy)}</strong></td>
          </tr>
          ${todRows}
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

    <div class="bill-disclaimer">
      <strong>⚠ PROVISIONAL BILL</strong> – This is an estimated bill for reference only.
      Actual charges from ${discom.name} may differ. Tariff data is approximate (${discom.tariffYear || '2024-25'}).
      ${discom.website ? `<br>Official website: <a href="${discom.website}" target="_blank" rel="noopener">${discom.website}</a>` : ''}
    </div>
  </div>
  ${billExtras}`;
}

// ─── Multi-month bill revision (month-by-month, compounding LPSC) ───────────────
export function renderRevisionBill(params) {
  const { ledger, consumerName, accountNo, address, meterNo, fromDate, toDate } = params;
  const { rows, monthsCount, totalUnits, unitsPerMonth, startArrear, lpscRate,
          totalCharges, totalLpsc, totalPay, totalAdj, totalPayable,
          discom, category, supplyTypeName, connectedLoadKw, billedDemandKw } = ledger;

  const fmtDate = iso => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };
  const billDate = new Date();
  const dueDate  = new Date(billDate); dueDate.setDate(dueDate.getDate() + 15);
  const categoryLabel = supplyTypeName ? `${category.name} › ${supplyTypeName}` : (category ? category.name : '');
  const fmtPlain = d => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const startRow = startArrear > 0
    ? `<tr class="rev-start-row"><td>Opening arrear (carried in)</td><td></td><td></td><td></td><td></td><td class="num amt">${formatINR(startArrear)}</td></tr>`
    : '';

  const monthRows = rows.map(r => `
    <tr>
      <td>${r.label}${r.fppaRate ? ` <span class="rev-fppa">FPPA ${r.fppaMode === 'percent' ? r.fppaRate + '%' : '₹' + r.fppaRate}</span>` : ''}</td>
      <td class="num">${r.units.toLocaleString('en-IN')}</td>
      <td class="num">${r.lpsc > 0 ? '+ ' + formatINR(r.lpsc) : '—'}</td>
      <td class="num">${r.charges ? formatINR(r.charges) : '—'}</td>
      <td class="num">${r.payment > 0 ? '− ' + formatINR(r.payment) : '—'}</td>
      <td class="num amt">${formatINR(r.balance)}</td>
    </tr>`).join('');

  const adjRow = totalAdj !== 0
    ? `<tr class="adjustment-bill-row"><td colspan="5">Adjustments</td><td class="num amt">${totalAdj >= 0 ? formatINR(totalAdj) : '− ' + formatINR(-totalAdj)}</td></tr>`
    : '';

  return `
  <div class="bill-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print Bill</button>
    <button class="btn-share" onclick="window.__shareBill && window.__shareBill()">🔗 Share</button>
  </div>

  <div class="bill-wrap">
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
          <div class="bill-title-main">BILL REVISION</div>
          <div class="bill-title-sub">Month-by-Month Estimate</div>
          <div class="bill-tariff-year">Tariff Year: ${discom.tariffYear || '2024-25'}</div>
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
          <tr><td>Conn. Load</td><td>: ${connectedLoadKw} kW${billedDemandKw ? ` · MD ${billedDemandKw} kW` : ''}</td></tr>
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

    <div class="bill-charges-section">
      <div class="bill-section-title">Month-by-Month Ledger (LPSC @ ${lpscRate}%/month, compounded)</div>
      <table class="bill-charges-table rev-table">
        <thead>
          <tr>
            <th>Month</th>
            <th class="num">Units</th>
            <th class="num">LPSC</th>
            <th class="num">Charges</th>
            <th class="num">Payment</th>
            <th class="num">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${startRow}
          ${monthRows}
        </tbody>
        <tfoot>
          <tr class="subtotal-row">
            <td><strong>Totals</strong></td>
            <td></td>
            <td class="num"><strong>${formatINR(totalLpsc)}</strong></td>
            <td class="num"><strong>${formatINR(totalCharges)}</strong></td>
            <td class="num"><strong>${totalPay > 0 ? '− ' + formatINR(totalPay) : '—'}</strong></td>
            <td></td>
          </tr>
          ${adjRow}
          <tr class="total-payable-row">
            <td colspan="5"><strong>TOTAL AMOUNT PAYABLE</strong></td>
            <td class="num total-amt"><strong>₹ ${Math.max(0, totalPayable).toLocaleString('en-IN')}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="bill-words">
      Amount in Words: <em>${numberToWords(Math.max(0, totalPayable))}</em>
    </div>

    <div class="bill-category-note">
      ℹ️ ${monthsCount}-month revision: ${totalUnits.toLocaleString('en-IN')} units split evenly (~${unitsPerMonth}/month).
      Each month is billed at its own FPPA / tariff for that month. Late Payment Surcharge is charged at
      <strong>${lpscRate}% per month on the running balance</strong> (so each month's bill first attracts LPSC the
      following month) and compounds. Payments are applied on their dates.
    </div>

    <div class="bill-disclaimer">
      <strong>⚠ PROVISIONAL — BILL REVISION</strong> – Estimated month-by-month bill for reference only.
      Consumption is assumed uniform across the period; actual monthly readings and surcharges from ${discom.name} may differ.
      ${discom.website ? `<br>Official website: <a href="${discom.website}" target="_blank" rel="noopener">${discom.website}</a>` : ''}
    </div>
  </div>`;
}
