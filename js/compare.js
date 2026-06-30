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
}
