// ─── Bill Calculation ────────────────────────────────────────────────────────

function resolveFixedCharge(fixedCharge, connectedLoadKw) {
  if (typeof fixedCharge === 'number') return fixedCharge;
  if (!fixedCharge) return 0;
  if (fixedCharge.type === 'flat') return fixedCharge.rate;
  if (fixedCharge.type === 'per_kw') return fixedCharge.rate * connectedLoadKw;
  if (fixedCharge.type === 'tiered') {
    for (const slab of fixedCharge.slabs) {
      if (connectedLoadKw <= slab.maxLoad) return slab.rate;
    }
    return fixedCharge.slabs[fixedCharge.slabs.length - 1].rate;
  }
  return 0;
}

function calculateEnergySlabs(slabs, units) {
  const breakdown = [];
  let remaining = units;
  let prevLimit = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const capacity = slab.limit === Infinity ? remaining : slab.limit - prevLimit;
    const unitsInSlab = Math.min(remaining, capacity);
    if (unitsInSlab > 0) {
      const from = prevLimit + 1;
      const to = prevLimit + unitsInSlab;
      const label = slab.label ||
        (slab.limit === Infinity || to >= slab.limit
          ? `${from}${from === to ? '' : ' – ' + to} units`
          : `${from} – ${to} units`);
      breakdown.push({
        label,
        units: unitsInSlab,
        rate: slab.rate,
        amount: +(unitsInSlab * slab.rate).toFixed(2)
      });
    }
    remaining -= unitsInSlab;
    prevLimit = Math.min(slab.limit, prevLimit + capacity);
  }
  return breakdown;
}

function calculateBill({ discomId, categoryId, supplyTypeId, units, connectedLoadKw,
                         facRate, arrears, arrearLpsc, lpscRate, currentLpscMonths,
                         payments, adjustments, delhiSubsidy }) {
  const discom = findDiscom(discomId);
  if (!discom) return null;

  const tariff = getEffectiveTariff(discomId, categoryId, supplyTypeId);
  if (!tariff) return null;

  const cat = getCategory(discomId, categoryId);

  const fixedCharge   = resolveFixedCharge(tariff.fixedCharge, connectedLoadKw);
  const slabBreakdown = calculateEnergySlabs(tariff.energySlabs, units);
  const totalEnergy   = slabBreakdown.reduce((s, r) => s + r.amount, 0);

  const extraCharges = [];
  let totalExtra = 0;
  for (const charge of (tariff.additionalCharges || [])) {
    let amount = 0;
    if (charge.type === 'percent_energy') {
      amount = +(totalEnergy * charge.rate / 100).toFixed(2);
    } else if (charge.type === 'percent_total') {
      amount = +((fixedCharge + totalEnergy) * charge.rate / 100).toFixed(2);
    } else if (charge.type === 'per_unit') {
      amount = +(units * charge.rate).toFixed(2);
    } else if (charge.type === 'flat') {
      amount = charge.rate;
    }
    extraCharges.push({ name: charge.name, amount, rate: charge.rate, type: charge.type });
    totalExtra += amount;
  }

  const facAmount   = +(units * (facRate || 0)).toFixed(2);
  const currentGross = +(fixedCharge + totalEnergy + totalExtra + facAmount).toFixed(2);

  // Delhi subsidy
  let subsidyAmount = 0;
  let subsidyLabel  = '';
  if (delhiSubsidy && units > 0) {
    if (units <= 200) {
      subsidyAmount = currentGross;
      subsidyLabel  = 'GNCTD Subsidy (100% — ≤200 units)';
    } else if (units <= 400) {
      subsidyAmount = Math.min(200 * 3.00, totalEnergy) * 0.5;
      subsidyLabel  = 'GNCTD Subsidy (50% rebate on first 200 units)';
    }
  }

  const currentNet = Math.round(Math.max(0, currentGross - subsidyAmount));

  const safeArrears   = arrears    || 0;
  const safeArrLpsc   = arrearLpsc || 0;
  const currentLpsc   = +(currentNet * (lpscRate || 0) / 100 * (currentLpscMonths || 0)).toFixed(2);

  const totalPayments    = (payments    || []).reduce((s, p) => s + (p.amount || 0), 0);
  const totalAdjustments = (adjustments || []).reduce((s, a) => s + (a.amount || 0), 0);

  const totalPayable = Math.round(
    currentNet + safeArrears + safeArrLpsc + currentLpsc
    - totalPayments + totalAdjustments
  );

  return {
    discom,
    category: cat,
    supplyTypeId,
    supplyTypeName: (cat && cat.supplyTypes && cat.supplyTypes.length > 0 && supplyTypeId) ? tariff.name : null,
    units,
    connectedLoadKw,
    fixedCharge: +fixedCharge.toFixed(2),
    slabBreakdown,
    totalEnergy: +totalEnergy.toFixed(2),
    extraCharges,
    facAmount,
    facRate: facRate || 0,
    currentGross,
    subsidyAmount: +subsidyAmount.toFixed(2),
    subsidyLabel,
    currentNet,
    arrears: safeArrears,
    arrearLpsc: safeArrLpsc,
    lpscRate: lpscRate || 0,
    currentLpscMonths: currentLpscMonths || 0,
    currentLpsc,
    payments: payments || [],
    totalPayments: +totalPayments.toFixed(2),
    adjustments: adjustments || [],
    totalAdjustments: +totalAdjustments.toFixed(2),
    totalPayable
  };
}

// ─── Number to Indian Words ──────────────────────────────────────────────────

function numberToWords(amount) {
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
    if (n >= 100000)   { res += convert(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
    if (n >= 1000)     { res += convert(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
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

// ─── Bill HTML Renderer ───────────────────────────────────────────────────────

function formatINR(n) {
  return '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderBill(params) {
  const { result, consumerName, accountNo, address, meterNo,
          billingMonth, billingYear, prevReading, currReading } = params;

  const { discom, category, supplyTypeName,
          units, connectedLoadKw,
          fixedCharge, slabBreakdown, totalEnergy,
          extraCharges, facAmount, facRate,
          currentGross, subsidyAmount, subsidyLabel, currentNet,
          arrears, arrearLpsc, lpscRate, currentLpscMonths, currentLpsc,
          payments, totalPayments,
          adjustments, totalAdjustments,
          totalPayable } = result;

  const billDate = new Date();
  const dueDate  = new Date(billDate); dueDate.setDate(dueDate.getDate() + 15);
  const fmtDate  = d => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  const categoryLabel = supplyTypeName
    ? `${category.name} › ${supplyTypeName}`
    : category.name;

  const slabRows = slabBreakdown.map(s => `
    <tr>
      <td class="indent">Energy Charges: ${s.label}</td>
      <td class="num">${s.units}</td>
      <td class="num">₹ ${s.rate.toFixed(2)}</td>
      <td class="num amt">${formatINR(s.amount)}</td>
    </tr>`).join('');

  const extraRows = extraCharges.map(c => `
    <tr>
      <td>${c.name}${c.type === 'percent_energy' || c.type === 'percent_total'
        ? ' (@ ' + c.rate + '%)' : ''}</td>
      <td></td><td></td>
      <td class="num amt">${formatINR(c.amount)}</td>
    </tr>`).join('');

  const facRow = facAmount > 0 ? `
    <tr class="fac-row">
      <td>Fuel Adj. Charge (FAC) @ ₹ ${facRate.toFixed(2)}/unit</td>
      <td class="num">${units}</td><td></td>
      <td class="num amt">${formatINR(facAmount)}</td>
    </tr>` : '';

  const subsidyRow = subsidyAmount > 0 ? `
    <tr class="subsidy-row">
      <td colspan="3">${subsidyLabel}</td>
      <td class="num amt">− ${formatINR(subsidyAmount)}</td>
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
      <td class="num amt">− ${formatINR(p.amount)}</td>
    </tr>`).join('')}` : '';

  const adjSection = hasAdj ? `
    <tr class="section-header-row"><td colspan="4">Adjustments</td></tr>
    ${adjustments.filter(a => a.amount !== 0).map(a => `
    <tr class="adjustment-bill-row">
      <td>${a.name || 'Adjustment'}</td><td></td><td></td>
      <td class="num amt">${a.amount >= 0 ? formatINR(a.amount) : '− ' + formatINR(-a.amount)}</td>
    </tr>`).join('')}` : '';

  const totalRow = showTotal ? `
    <tr class="total-payable-row">
      <td colspan="3"><strong>TOTAL AMOUNT PAYABLE</strong></td>
      <td class="num total-amt"><strong>₹ ${Math.max(0, totalPayable).toLocaleString('en-IN')}</strong></td>
    </tr>` : '';

  return `
  <div class="bill-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print Bill</button>
    <button class="btn-share" onclick="shareBill()">🔗 Share</button>
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
            <td><strong>${units.toLocaleString('en-IN')} units</strong></td>
            <td>1 Month</td>
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
            <td>Fixed / Demand Charge</td>
            <td></td><td></td>
            <td class="num amt">${formatINR(fixedCharge)}</td>
          </tr>
          ${slabRows}
          <tr class="subtotal-row">
            <td colspan="3"><strong>Sub-Total (Energy Charges)</strong></td>
            <td class="num amt"><strong>${formatINR(totalEnergy)}</strong></td>
          </tr>
          ${extraRows}
          ${facRow}
        </tbody>
        <tfoot>
          <tr class="gross-row">
            <td colspan="3"><strong>Current Bill Gross</strong></td>
            <td class="num amt"><strong>${formatINR(currentGross)}</strong></td>
          </tr>
          ${subsidyRow}
          <tr class="net-row">
            <td colspan="3"><strong>Current Net Bill (Rounded)</strong></td>
            <td class="num net-amt"><strong>₹ ${currentNet.toLocaleString('en-IN')}</strong></td>
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
  </div>`;
}

// ─── URL State (Share) ────────────────────────────────────────────────────────

function buildShareUrl() {
  const p = new URLSearchParams({
    state:  document.getElementById('stateSelect').value,
    discom: document.getElementById('discomSelect').value,
    cat:    document.getElementById('categorySelect').value,
    st:     document.getElementById('supplyTypeSelect').value,
    name:   document.getElementById('consumerName').value,
    acc:    document.getElementById('accountNo').value,
    addr:   document.getElementById('address').value,
    meter:  document.getElementById('meterNo').value,
    month:  document.getElementById('billingMonth').value,
    year:   document.getElementById('billingYear').value,
    prev:   document.getElementById('prevReading').value,
    curr:   document.getElementById('currReading').value,
    units:  document.getElementById('unitsInput').value,
    load:   document.getElementById('connectedLoad').value,
    fac:    document.getElementById('facRate').value,
    arr:    document.getElementById('arrears').value,
    arrlpsc: document.getElementById('arrearLpsc').value,
    lpsc:   document.getElementById('lpscRate').value,
    curmo:  document.getElementById('currentLpscMonths').value,
  });
  return location.origin + location.pathname + '?' + p.toString();
}

function shareBill() {
  const url = buildShareUrl();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard!'));
  } else {
    prompt('Copy this link:', url);
  }
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── Tab Management ───────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll('.bill-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bill-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.bill-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ─── Dynamic Payment / Adjustment Rows ───────────────────────────────────────

function fmtTotal(n) {
  return '₹ ' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateArrearTotal() {
  const a  = +document.getElementById('arrears').value    || 0;
  const al = +document.getElementById('arrearLpsc').value || 0;
  document.getElementById('arrearTotalDisplay').textContent = fmtTotal(a + al);
}

function updatePaymentTotal() {
  let total = 0;
  document.querySelectorAll('#paymentRows .dyn-amount').forEach(el => {
    total += +el.value || 0;
  });
  document.getElementById('paymentTotalDisplay').textContent = fmtTotal(total);
}

function updateAdjustmentTotal() {
  let total = 0;
  document.querySelectorAll('#adjustmentRows .dyn-amount').forEach(el => {
    total += +el.value || 0;
  });
  document.getElementById('adjustmentTotalDisplay').textContent = fmtTotal(total);
}

function addPaymentRow() {
  const container = document.getElementById('paymentRows');
  const row = document.createElement('div');
  row.className = 'dyn-row';
  row.innerHTML = `
    <input type="date" class="dyn-date" placeholder="Payment Date">
    <input type="number" class="dyn-amount" placeholder="Amount (₹)" value="0" min="0" step="0.01">
    <button class="btn-remove-row" type="button" title="Remove">×</button>`;
  row.querySelector('.dyn-amount').addEventListener('input', updatePaymentTotal);
  row.querySelector('.btn-remove-row').addEventListener('click', () => {
    row.remove();
    updatePaymentTotal();
  });
  container.appendChild(row);
  row.querySelector('.dyn-date').focus();
}

function addAdjustmentRow() {
  const container = document.getElementById('adjustmentRows');
  const row = document.createElement('div');
  row.className = 'dyn-row';
  row.innerHTML = `
    <input type="text" class="dyn-name" placeholder="e.g., Meter Cost, Rebate">
    <input type="number" class="dyn-amount" placeholder="Amount (+/−)" value="0" step="0.01">
    <button class="btn-remove-row" type="button" title="Remove">×</button>`;
  row.querySelector('.dyn-amount').addEventListener('input', updateAdjustmentTotal);
  row.querySelector('.btn-remove-row').addEventListener('click', () => {
    row.remove();
    updateAdjustmentTotal();
  });
  container.appendChild(row);
  row.querySelector('.dyn-name').focus();
}

function getPayments() {
  const rows = document.querySelectorAll('#paymentRows .dyn-row');
  return Array.from(rows).map(r => ({
    date:   r.querySelector('.dyn-date')   ? r.querySelector('.dyn-date').value   : '',
    amount: +r.querySelector('.dyn-amount').value || 0
  })).filter(p => p.amount > 0);
}

function getAdjustments() {
  const rows = document.querySelectorAll('#adjustmentRows .dyn-row');
  return Array.from(rows).map(r => ({
    name:   r.querySelector('.dyn-name') ? r.querySelector('.dyn-name').value.trim() : '',
    amount: +r.querySelector('.dyn-amount').value || 0
  })).filter(a => a.amount !== 0);
}

// ─── UI Initialization ────────────────────────────────────────────────────────

function populateStates() {
  const sel = document.getElementById('stateSelect');
  getStates().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
}

function populateDiscoms(state) {
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

function populateCategories(discomId) {
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

function populateSupplyTypes(discomId, categoryId) {
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
    opt.value = st.id;
    opt.textContent = st.name;
    sel.appendChild(opt);
  });

  sel.value = types[0].id;
  desc.textContent = types[0].description || '';
  group.style.display = 'block';
  prefillFac(discomId, categoryId, types[0].id);
}

function prefillFac(discomId, categoryId, supplyTypeId) {
  const tariff = getEffectiveTariff(discomId, categoryId, supplyTypeId);
  const el = document.getElementById('facRate');
  if (tariff && tariff.fac != null) {
    el.value = tariff.fac;
  } else {
    el.value = 0;
  }
}

function prefillLpsc(discomId) {
  const discom = findDiscom(discomId);
  const el = document.getElementById('lpscRate');
  if (discom && discom.lpscRate != null) {
    el.value = discom.lpscRate;
  } else {
    el.value = 1.5;
  }
}

function populateMonthYear() {
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
  for (let y = cy - 2; y <= cy + 1; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    ySel.appendChild(opt);
  }
  ySel.value = cy;
}

function getEffectiveUnits() {
  const prev   = document.getElementById('prevReading').value.trim();
  const curr   = document.getElementById('currReading').value.trim();
  const direct = document.getElementById('unitsInput').value.trim();

  if (prev !== '' && curr !== '' && !isNaN(+prev) && !isNaN(+curr)) {
    return Math.max(0, +curr - +prev);
  }
  if (direct !== '' && !isNaN(+direct)) return Math.max(0, +direct);
  return null;
}

function updateUnitsDisplay() {
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

function canCalculate() {
  const discom = document.getElementById('discomSelect').value;
  const cat    = document.getElementById('categorySelect').value;
  const units  = getEffectiveUnits();
  const load   = +document.getElementById('connectedLoad').value;

  const stGroup = document.getElementById('supplyTypeGroup');
  const stVal   = document.getElementById('supplyTypeSelect').value;
  if (stGroup.style.display !== 'none' && !stVal) return false;

  return !!(discom && cat && units !== null && units >= 0 && load > 0);
}

function updateCalcButton() {
  document.getElementById('calculateBtn').disabled = !canCalculate();
}

function isDelhiDiscom(discomId) {
  return ['brpl', 'bypl', 'tpddl', 'ndmc_delhi'].includes(discomId);
}

function doCalculate() {
  if (!canCalculate()) return;

  const discomId          = document.getElementById('discomSelect').value;
  const categoryId        = document.getElementById('categorySelect').value;
  const supplyTypeId      = document.getElementById('supplyTypeSelect').value || null;
  const units             = getEffectiveUnits();
  const load              = +document.getElementById('connectedLoad').value;
  const facRate           = +document.getElementById('facRate').value     || 0;
  const arrears           = +document.getElementById('arrears').value     || 0;
  const arrearLpsc        = +document.getElementById('arrearLpsc').value  || 0;
  const lpscRate          = +document.getElementById('lpscRate').value    || 0;
  const currentLpscMonths = +document.getElementById('currentLpscMonths').value || 0;

  const delhiSubsidy = isDelhiDiscom(discomId) &&
    document.getElementById('delhiSubsidyCheck') &&
    document.getElementById('delhiSubsidyCheck').checked;

  const result = calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: load,
    facRate, arrears, arrearLpsc, lpscRate, currentLpscMonths,
    payments: getPayments(), adjustments: getAdjustments(),
    delhiSubsidy
  });
  if (!result) return;

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
  });

  const panel = document.getElementById('billPanel');
  panel.innerHTML = html;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Load from URL Params ─────────────────────────────────────────────────────

function loadFromUrl() {
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
          unitsInput: 'units', connectedLoad: 'load',
          facRate: 'fac', arrears: 'arr', arrearLpsc: 'arrlpsc',
          lpscRate: 'lpsc', currentLpscMonths: 'curmo'
        };
        for (const [id, key] of Object.entries(fields)) {
          if (p.get(key)) document.getElementById(id).value = p.get(key);
        }
        if (p.get('month')) document.getElementById('billingMonth').value = p.get('month');
        if (p.get('year'))  document.getElementById('billingYear').value  = p.get('year');

        updateArrearTotal();
        updateUnitsDisplay();
        updateCalcButton();
        if (canCalculate()) doCalculate();
      }, 50);
    }, 50);
  }, 50);
}

// ─── Event Wiring ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  populateStates();
  populateMonthYear();
  initTabs();

  const stateEl      = document.getElementById('stateSelect');
  const discomEl     = document.getElementById('discomSelect');
  const categoryEl   = document.getElementById('categorySelect');
  const supplyTypeEl = document.getElementById('supplyTypeSelect');

  stateEl.addEventListener('change', () => {
    populateDiscoms(stateEl.value);
    populateCategories('');
    populateSupplyTypes('', '');
    updateCalcButton();
    document.getElementById('delhiSubsidyGroup').style.display = 'none';
  });

  discomEl.addEventListener('change', () => {
    populateCategories(discomEl.value);
    populateSupplyTypes('', '');
    updateCalcButton();
    const showDelhi = isDelhiDiscom(discomEl.value);
    document.getElementById('delhiSubsidyGroup').style.display = showDelhi ? 'flex' : 'none';
    prefillLpsc(discomEl.value);
  });

  categoryEl.addEventListener('change', () => {
    populateSupplyTypes(discomEl.value, categoryEl.value);
    updateCalcButton();
  });

  supplyTypeEl.addEventListener('change', () => {
    const types = getSupplyTypes(discomEl.value, categoryEl.value);
    const st = types.find(s => s.id === supplyTypeEl.value);
    document.getElementById('supplyTypeDesc').textContent = st ? (st.description || '') : '';
    prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
    updateCalcButton();
  });

  ['prevReading', 'currReading', 'unitsInput'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      updateUnitsDisplay();
      updateCalcButton();
    });
  });

  document.getElementById('connectedLoad').addEventListener('input', updateCalcButton);

  document.getElementById('arrears').addEventListener('input', updateArrearTotal);
  document.getElementById('arrearLpsc').addEventListener('input', updateArrearTotal);

  document.getElementById('addPaymentBtn').addEventListener('click', addPaymentRow);
  document.getElementById('addAdjustmentBtn').addEventListener('click', addAdjustmentRow);

  document.getElementById('calculateBtn').addEventListener('click', doCalculate);

  document.getElementById('currReading').addEventListener('keydown', e => {
    if (e.key === 'Enter') doCalculate();
  });
  document.getElementById('unitsInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doCalculate();
  });

  loadFromUrl();
});
