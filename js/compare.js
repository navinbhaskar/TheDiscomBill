import { TARIFF_DB } from './tariffs/registry.js';

// Flatten all state DISCOM arrays into a single lookup list
const ALL_DISCOMS = Object.values(TARIFF_DB).flat();
import { calculateBill } from './engine.js';
import { formatINR } from './renderer.js';

// The list of major DISCOMs to feature in the comparison table
const MAJOR_DISCOMS = [
  { id: 'uppcl', name: 'UPPCL (Uttar Pradesh)' },
  { id: 'bescom', name: 'BESCOM (Karnataka)' },
  { id: 'msedcl', name: 'MSEDCL (Maharashtra)' },
  { id: 'tangedco', name: 'TANGEDCO (Tamil Nadu)' },
  { id: 'tpddl', name: 'Tata Power-DDL (Delhi)' },
  { id: 'kseb', name: 'KSEB (Kerala)' }
];

const UNIT_TIERS = [200, 400, 600, 1000];

// Returns the generated HTML string for the table rows
function generateComparisonRows(categoryTarget) {
  let html = '';
  
  for (const major of MAJOR_DISCOMS) {
    const discomData = ALL_DISCOMS.find(d => d.id === major.id);
    if (!discomData) continue;

    // Find the requested category (usually 'domestic' or 'commercial')
    const cat = discomData.categories.find(c => c.id === categoryTarget);
    if (!cat) continue;

    // Default supply type (usually the first one, e.g., rural vs urban, just take the first)
    const supplyTypeId = cat.supplyTypes && cat.supplyTypes.length > 0 ? cat.supplyTypes[0].id : null;
    
    // For connected load, we need a reasonable assumption based on usage.
    // We'll calculate each tier dynamically.
    html += `<tr>
      <td><strong>${major.name}</strong></td>`;
      
    for (const units of UNIT_TIERS) {
      // Estimate connected load: 200 units -> 2kW, 400 -> 3kW, 600 -> 5kW, 1000 -> 8kW
      const assumedLoad = units <= 200 ? 2 : (units <= 400 ? 3 : (units <= 600 ? 5 : 8));
      
      try {
        const bill = calculateBill({
          discomId: major.id,
          categoryId: categoryTarget,
          supplyTypeId: supplyTypeId,
          units: units,
          connectedLoadKw: assumedLoad,
          billingMonths: 1,
          fppaOverride: null, // Let engine use default/auto FPPA
          isNetMetering: false,
          lpscApplicable: false,
          isDelhiSubsidyOptIn: true // Assume opted-in for Delhi
        });
        
        html += `<td class="num">${formatINR(bill.netBillAmt)}</td>`;
      } catch (err) {
        console.error(`Compare error for ${major.id} at ${units}u:`, err);
        html += `<td class="num text-tertiary">—</td>`;
      }
    }
    html += `</tr>`;
  }
  
  return html;
}

export function initComparisonTable() {
  const tbody = document.getElementById('compTableBody');
  const tabs = document.querySelectorAll('.comp-tab');
  if (!tbody || tabs.length === 0) return;

  const renderTable = (target) => {
    tbody.innerHTML = generateComparisonRows(target);
  };

  // Initial render for 'domestic' (the default active tab)
  setTimeout(() => renderTable('domestic'), 500); // Slight delay so main app initializes

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Re-render table based on data-target attribute
      const target = tab.dataset.target;
      tbody.innerHTML = `<tr><td colspan="5" class="comp-loading">Calculating...</td></tr>`;
      setTimeout(() => renderTable(target), 50); // tiny timeout for UI update
    });
  });
}
