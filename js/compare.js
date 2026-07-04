// compare.js — builds the "Major DISCOM: consumption vs bill amount" table on /compare/.
// For each consumption tier (200/400/600/1000 kWh) it runs the real bill engine against
// each featured DISCOM's Domestic / Commercial tariff and shows the monthly payable amount.

import { TARIFF_DB } from './tariffs/registry.js';
import { calculateBill } from './engine.js';

// Featured DISCOMs — one representative per major state, ordered roughly North → South.
// (UP's five DISCOMs share the UPERC schedule, so MVVNL stands in; its rates are bill-verified.)
const MAJOR_DISCOMS = [
  { id: 'mvvnl',    state: 'Uttar Pradesh',  discom: 'MVVNL' },
  { id: 'tpddl',    state: 'Delhi',          discom: 'Tata Power-DDL' },
  { id: 'pspcl',    state: 'Punjab',         discom: 'PSPCL' },
  { id: 'dhbvn',    state: 'Haryana',        discom: 'DHBVN' },
  { id: 'jvvnl',    state: 'Rajasthan',      discom: 'JVVNL' },
  { id: 'upcl',     state: 'Uttarakhand',    discom: 'UPCL' },
  { id: 'ugvcl',    state: 'Gujarat',        discom: 'UGVCL' },
  { id: 'msedcl',   state: 'Maharashtra',    discom: 'MSEDCL' },
  { id: 'mppkvvcl', state: 'Madhya Pradesh', discom: 'MPPKVVCL' },
  { id: 'cspdcl',   state: 'Chhattisgarh',   discom: 'CSPDCL' },
  { id: 'nbpdcl',   state: 'Bihar',          discom: 'NBPDCL' },
  { id: 'jbvnl',    state: 'Jharkhand',      discom: 'JBVNL' },
  { id: 'wbsedcl',  state: 'West Bengal',    discom: 'WBSEDCL' },
  { id: 'tpnodl',   state: 'Odisha',         discom: 'TPNODL' },
  { id: 'apdcl',    state: 'Assam',          discom: 'APDCL' },
  { id: 'tsspdcl',  state: 'Telangana',      discom: 'TSSPDCL' },
  { id: 'apspdcl',  state: 'Andhra Pradesh', discom: 'APSPDCL' },
  { id: 'bescom',   state: 'Karnataka',      discom: 'BESCOM' },
  { id: 'tangedco', state: 'Tamil Nadu',     discom: 'TANGEDCO' },
  { id: 'kseb',     state: 'Kerala',         discom: 'KSEB' },
];

// Flatten all state DISCOM arrays into a single lookup list.
const ALL_DISCOMS = Object.values(TARIFF_DB).flat();

const UNIT_TIERS = [200, 400, 600, 1000];

// Fixed 1 kW sanctioned/connected load for every tier, so the comparison isolates the
// per-unit energy + fixed charge differences between DISCOMs on a like-for-like basis.
const LOAD_KW = 1;

// Compact rupee format for the table (whole rupees, Indian grouping).
const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// Compute the monthly payable for one DISCOM at one consumption level. Returns null on error
// or when the DISCOM has no matching category (so the cell renders as "—").
function billFor(discomId, categoryTarget, units) {
  const discom = ALL_DISCOMS.find(d => d.id === discomId);
  if (!discom) return null;
  const cat = discom.categories.find(c => c.id === categoryTarget);
  if (!cat) return null;
  const supplyTypeId = cat.supplyTypes && cat.supplyTypes.length ? cat.supplyTypes[0].id : null;
  try {
    const bill = calculateBill({
      discomId, categoryId: categoryTarget, supplyTypeId,
      units, connectedLoadKw: LOAD_KW, billingMonths: 1,
      fppaOverride: null,        // let the engine apply default / auto FPPA
      isNetMetering: false,
      lpscApplicable: false,
      isDelhiSubsidyOptIn: true  // assume opted-in where a state subsidy applies
    });
    return bill.totalPayable;
  } catch (err) {
    console.error(`Compare error for ${discomId} @ ${units}u (${categoryTarget}):`, err);
    return null;
  }
}

// Build all table rows for one category, highlighting the cheapest DISCOM in each column.
function generateComparisonRows(categoryTarget) {
  // First pass: compute every amount so we can find the lowest per consumption tier.
  const rows = MAJOR_DISCOMS
    .map(d => ({ state: d.state, discom: d.discom, amounts: UNIT_TIERS.map(u => billFor(d.id, categoryTarget, u)) }))
    .filter(r => r.amounts.some(a => a !== null)); // drop DISCOMs with no data for this category

  const columnMin = UNIT_TIERS.map((_, col) => {
    const vals = rows.map(r => r.amounts[col]).filter(a => a !== null);
    return vals.length ? Math.min(...vals) : null;
  });

  // Second pass: render. The cheapest cell in each column gets a green "lowest" highlight.
  return rows.map(r => {
    const cells = r.amounts.map((amt, col) => {
      if (amt === null) return `<td class="num comp-na">—</td>`;
      const isBest = columnMin[col] !== null && amt === columnMin[col];
      const tick = isBest ? '<span class="comp-tick" title="Lowest at this usage">✓</span>' : '';
      return `<td class="num${isBest ? ' comp-best' : ''}">${tick}${fmt(amt)}</td>`;
    }).join('');
    return `<tr>
      <td class="comp-name"><span class="comp-state">${r.state}</span><span class="comp-code">${r.discom}</span></td>
      ${cells}
    </tr>`;
  }).join('');
}

export function initComparisonTable() {
  const tbody = document.getElementById('compTableBody');
  const tabs = document.querySelectorAll('.comp-tab');
  if (!tbody || tabs.length === 0) return;

  const renderTable = (target) => { tbody.innerHTML = generateComparisonRows(target); };

  // Initial render for the default active tab ('domestic').
  setTimeout(() => renderTable('domestic'), 300); // small delay so modules are ready

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tbody.innerHTML = `<tr><td colspan="5" class="comp-loading">Calculating…</td></tr>`;
      setTimeout(() => renderTable(tab.dataset.target), 30); // tiny timeout for the loading flash
    });
  });

  initCustomCompare();   // head-to-head "pick any two DISCOMs + your own units" tool
}

// ── Custom head-to-head comparison ────────────────────────────────────────────
// The static table above answers "who's cheapest among the majors?"; this turns the
// page into a decision tool — pick ANY two DISCOMs and YOUR usage for a like-for-like
// bill, with a breakdown and a verdict. Same engine, so it agrees with the calculator.

// Every DISCOM as a flat, alphabetically-sorted option list (id + display name + state).
const DISCOM_OPTIONS = Object.keys(TARIFF_DB).sort()
  .flatMap(state => (TARIFF_DB[state] || []).map(d => ({ id: d.id, name: d.name, state })))
  .sort((a, b) => a.name.localeCompare(b.name));

// Full bill object for one DISCOM (not just the total), so we can show the breakdown.
// Returns { unsupported:true } when the DISCOM has no tariff for the chosen category,
// or null on an engine error. `applySubsidy` turns on eligible government subsidy — the
// engine models the Delhi GNCTD domestic subsidy (first 200 units free), which is
// domestic-only AND Delhi-only. The engine's delhiSubsidy flag doesn't self-check the
// state, so we gate it here to Delhi DISCOMs so a non-Delhi bill is never wrongly zeroed.
function fullBillFor(discomId, categoryTarget, units, loadKw, applySubsidy, state) {
  const discom = ALL_DISCOMS.find(d => d.id === discomId);
  if (!discom) return null;
  const cat = discom.categories.find(c => c.id === categoryTarget);
  if (!cat) return { unsupported: true };
  const supplyTypeId = cat.supplyTypes && cat.supplyTypes.length ? cat.supplyTypes[0].id : null;
  try {
    const bill = calculateBill({
      discomId, categoryId: categoryTarget, supplyTypeId,
      units, connectedLoadKw: loadKw, billingMonths: 1,
      fppaOverride: null, isNetMetering: false, lpscApplicable: false,
      delhiSubsidy: !!applySubsidy && categoryTarget === 'domestic' && state === 'Delhi',
    });
    return (bill && !bill.error) ? bill : null;
  } catch (err) {
    console.error(`Custom compare error for ${discomId} @ ${units}u:`, err);
    return null;
  }
}

const escHtml = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// One DISCOM's result card. `opt` is the {id,name,state} option; `bill` the engine result.
function ccCardHtml(opt, bill, units, category, loadKw, isWinner) {
  const name = `<span class="cc-card-code">${escHtml(opt.name)}</span><span class="cc-card-state">${escHtml(opt.state)}</span>`;
  if (!bill) {
    return `<div class="cc-card cc-card-na"><div class="cc-card-name">${name}</div><p class="cc-na">Couldn't estimate a bill for this selection.</p></div>`;
  }
  if (bill.unsupported) {
    return `<div class="cc-card cc-card-na"><div class="cc-card-name">${name}</div><p class="cc-na">No ${escHtml(category)} tariff on record for ${escHtml(opt.name)} yet.</p></div>`;
  }
  const fppa = bill.facAmount || 0;
  const subsidy = bill.subsidyAmount || 0;
  const deep = `/?state=${encodeURIComponent(opt.state)}&discom=${encodeURIComponent(opt.id)}&cat=${encodeURIComponent(category)}&units=${encodeURIComponent(units)}&load=${encodeURIComponent(loadKw)}#calculator`;
  return `<div class="cc-card${isWinner ? ' cc-card-win' : ''}">
      ${isWinner ? '<div class="cc-badge">Cheaper</div>' : ''}
      <div class="cc-card-name">${name}</div>
      <div class="cc-card-total">${fmt(bill.totalPayable)}<span>/mo</span></div>
      <dl class="cc-breakdown">
        <div><dt>Energy</dt><dd>${fmt(bill.totalEnergy)}</dd></div>
        <div><dt>Fixed / demand</dt><dd>${fmt(bill.fixedCharge)}</dd></div>
        ${fppa ? `<div><dt>FPPA</dt><dd>${fppa < 0 ? '−' : ''}${fmt(Math.abs(fppa))}</dd></div>` : ''}
        ${subsidy > 0 ? `<div class="cc-subsidy-row"><dt>Govt subsidy${bill.subsidyLabel ? `<span class="cc-subsidy-tag" title="${escHtml(bill.subsidyLabel)}"> ⓘ</span>` : ''}</dt><dd>−${fmt(subsidy)}</dd></div>` : ''}
      </dl>
      <a class="cc-deep" href="${deep}">Full breakdown in calculator →</a>
    </div>`;
}

function renderCustomResult(resultEl, optA, optB, units, category, loadKw, applySubsidy) {
  const a = fullBillFor(optA.id, category, units, loadKw, applySubsidy, optA.state);
  const b = fullBillFor(optB.id, category, units, loadKw, applySubsidy, optB.state);
  const aOk = a && !a.unsupported, bOk = b && !b.unsupported;

  let verdict = '';
  if (aOk && bOk) {
    const diff = Math.abs(a.totalPayable - b.totalPayable);
    if (diff === 0) {
      verdict = `<div class="cc-verdict cc-verdict-tie">Both come to <strong>${fmt(a.totalPayable)}/month</strong> at ${units} units — no difference.</div>`;
    } else {
      const cheaper = a.totalPayable < b.totalPayable ? optA : optB;
      const dearer  = a.totalPayable < b.totalPayable ? b : a;
      const pct = Math.round((diff / dearer.totalPayable) * 100);
      verdict = `<div class="cc-verdict"><strong>${escHtml(cheaper.name)}</strong> is cheaper by <strong>${fmt(diff)}/month</strong>${pct ? ` (${pct}% less)` : ''} at ${units} units.</div>`;
    }
  }

  const winA = aOk && bOk && a.totalPayable < b.totalPayable;
  const winB = aOk && bOk && b.totalPayable < a.totalPayable;
  resultEl.innerHTML = `
    ${verdict}
    <div class="cc-cards">
      ${ccCardHtml(optA, a, units, category, loadKw, winA)}
      <div class="cc-vs-mid" aria-hidden="true">vs</div>
      ${ccCardHtml(optB, b, units, category, loadKw, winB)}
    </div>`;
}

function initCustomCompare() {
  const form = document.getElementById('ccForm');
  const selA = document.getElementById('ccDiscomA');
  const selB = document.getElementById('ccDiscomB');
  const unitsEl = document.getElementById('ccUnits');
  const loadEl = document.getElementById('ccLoad');
  const catEl = document.getElementById('ccCategory');
  const subsidyEl = document.getElementById('ccSubsidy');
  const resultEl = document.getElementById('ccResult');
  if (!form || !selA || !selB || !resultEl) return;

  const optionsHtml = DISCOM_OPTIONS
    .map(o => `<option value="${escHtml(o.id)}">${escHtml(o.name)} — ${escHtml(o.state)}</option>`).join('');
  selA.innerHTML = optionsHtml;
  selB.innerHTML = optionsHtml;

  // Sensible, different defaults so the first view is a real comparison, not A vs A.
  const pick = (id, fallbackIdx) => DISCOM_OPTIONS.some(o => o.id === id) ? id : DISCOM_OPTIONS[fallbackIdx]?.id;
  selA.value = pick('mvvnl', 0);
  selB.value = pick('bescom', 1);
  if (selB.value === selA.value && DISCOM_OPTIONS[1]) selB.value = DISCOM_OPTIONS.find(o => o.id !== selA.value)?.id;

  const run = () => {
    const optA = DISCOM_OPTIONS.find(o => o.id === selA.value);
    const optB = DISCOM_OPTIONS.find(o => o.id === selB.value);
    const units = Math.max(0, parseInt(unitsEl.value, 10) || 0);
    const loadKw = Math.max(0.5, parseFloat(loadEl.value) || 1);
    const category = catEl.value === 'commercial' ? 'commercial' : 'domestic';
    const applySubsidy = subsidyEl ? subsidyEl.checked : true;
    if (!optA || !optB) return;
    renderCustomResult(resultEl, optA, optB, units, category, loadKw, applySubsidy);
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  // Live-update on any control change — a decision tool should feel immediate.
  [selA, selB, catEl, subsidyEl].filter(Boolean).forEach(el => el.addEventListener('change', run));
  [unitsEl, loadEl].forEach(el => el.addEventListener('input', run));

  setTimeout(run, 320);   // seed an example result once the engine modules are ready
}
