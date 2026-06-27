// js/main.js — Entry point. Imports all modules and wires up the UI.

import {
  populateStates, populateDiscoms, populateCategories, populateSupplyTypes,
  populateMonthYear, prefillFac, prefillLpsc, updateBilledDemandVisibility,
  initTabs, addPaymentRow, addAdjustmentRow,
  updateArrearTotal, updateUnitsDisplay, updateCalcButton, updateBillingPeriod,
  updateTodDisplay, updateFacUnitLabel, updateTariffPeriodHint,
  onFppaAutoToggle, markFppaManual,
  canCalculate, doCalculate, isDelhiDiscom,
  shareBill, loadFromUrl, loadSample, initHistory, compareDiscoms,
  refreshSupplyTypeDependent, applyLifelineDefaultLoad, checkLifelineLimits,
  getMeterMode, setMeterMode, addMeterRow, updateAdvancedMeter,
  syncBillingMonthYear, applyDefaultBillingBasis, showToast,
} from './ui.js';
import { initDatePickers } from './datepicker.js';
import { initI18n } from './i18n.js';

// Expose helpers called from onclick in the rendered bill HTML
window.__shareBill = shareBill;

// "Save as PDF" — generate and download a PDF of the bill directly (no print dialog). The HTML→PDF
// library is vendored locally and loaded lazily on first use; if it fails (e.g. offline before it's
// cached) we fall back to the browser's print dialog.
let _pdfLib = null;
function loadPdfLib() {
  if (window.html2pdf) return Promise.resolve();
  if (_pdfLib) return _pdfLib;
  _pdfLib = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'js/vendor/html2pdf.bundle.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
  return _pdfLib;
}
window.__savePdf = () => {
  // To achieve the perfect vector-quality native print layout the user requested,
  // we leverage the browser's native print dialog which has a "Save as PDF" destination.
  showToast('Select "Save as PDF" in the printer destination dropdown for a perfect quality document.');
  setTimeout(() => window.print(), 500);
}

// Register the service worker for offline support (no-op on unsupported / insecure contexts).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

document.addEventListener('DOMContentLoaded', () => {
  populateStates();
  populateMonthYear();
  initTabs();
  initI18n();   // apply saved/default language + wire the EN/हिंदी switcher

  // Theme toggle — data-theme is pre-set by the inline <head> script; here we sync the button
  // and let the user flip + persist their choice.
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    const syncThemeBtn = () => {
      const dark = root.dataset.theme === 'dark';
      themeBtn.textContent = dark ? '☀' : '☾';
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    };
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      syncThemeBtn();
    });
    syncThemeBtn();
  }

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
    applyDefaultBillingBasis();   // kVA tariff → kVA-MD; everything else → kWh
    updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
    updateTariffPeriodHint();
    updateCalcButton();
  });

  // Billing Basis selector (kWh / kVA-MD / kVAh) → refresh demand labels + MD/PF visibility
  document.getElementById('billingBasis').addEventListener('change', () => {
    updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
  });

  supplyTypeEl.addEventListener('change', () => {
    applyLifelineDefaultLoad(discomEl.value, categoryEl.value, supplyTypeEl.value);
    refreshSupplyTypeDependent();
    checkLifelineLimits();
  });


  document.getElementById('fromDate').addEventListener('change', () => {
    updateBillingPeriod();
    // From Date changes the month span → re-resolve the per-month FPPA average + tariff period
    prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
    updateTariffPeriodHint();
    checkLifelineLimits();     // period length changes the prorated unit cap
  });
  document.getElementById('toDate').addEventListener('change', () => {
    updateBillingPeriod();
    // To Date can drive the tariff period — refresh hint and re-prefill period FPPA
    prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
    updateTariffPeriodHint();
    checkLifelineLimits();
  });
  document.getElementById('connectedLoad').addEventListener('input', () => {
    updateCalcButton();
    checkLifelineLimits();     // load > 1 kW drops a lifeline consumer to non-lifeline
  });
  document.getElementById('billedDemand').addEventListener('input', checkLifelineLimits); // MD > 1 kW also disqualifies (UP)

  // Billing month/year change → re-resolve which historical tariff period applies
  ['billingMonth', 'billingYear'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
    });
  });
  // The visible month-year picker drives the hidden billingMonth/billingYear inputs
  document.getElementById('billingMonthYear').addEventListener('change', syncBillingMonthYear);

  document.getElementById('facMode').addEventListener('change', () => {
    updateFacUnitLabel();
    markFppaManual();   // changing mode by hand = manual override
  });
  document.getElementById('fppaAuto').addEventListener('change', () => {
    onFppaAutoToggle(discomEl.value, categoryEl.value, supplyTypeEl.value);
  });
  document.getElementById('facRate').addEventListener('input', markFppaManual);

  // Reading-mode selector (Meter Reading / TOD) + add-meter
  document.querySelectorAll('input[name="meterMode"]').forEach(r => {
    r.addEventListener('change', () => setMeterMode(getMeterMode()));
  });
  document.getElementById('addMeterRowBtn').addEventListener('click', () => { addMeterRow(''); updateAdvancedMeter(); });
  setMeterMode(getMeterMode());   // initialise the default Meter Reading mode (creates the first meter row)

  ['todPeak', 'todNormal', 'todOffPeak'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => { updateTodDisplay(); checkLifelineLimits(); });
  });
  document.getElementById('arrears').addEventListener('input', updateArrearTotal);
  document.getElementById('arrearLpsc').addEventListener('input', updateArrearTotal);

  // LPSC Applicable toggle — disable the rate/months inputs when LPSC doesn't apply
  const lpscChk = document.getElementById('lpscApplicable');
  const toggleLpscFields = () => {
    const on = lpscChk.checked;
    document.getElementById('lpscRate').disabled = !on;
    document.getElementById('currentLpscMonths').disabled = !on;
    document.getElementById('lpscFields').classList.toggle('fields-disabled', !on);
  };
  lpscChk.addEventListener('change', toggleLpscFields);
  toggleLpscFields();

  document.getElementById('addPaymentBtn').addEventListener('click', addPaymentRow);
  document.getElementById('addAdjustmentBtn').addEventListener('click', addAdjustmentRow);

  document.getElementById('calculateBtn').addEventListener('click', doCalculate);
  document.getElementById('sampleBtn').addEventListener('click', loadSample);
  document.getElementById('compareBtn').addEventListener('click', compareDiscoms);
  initHistory();   // render + wire the Recent-bills panel

  // Net metering — reveal the export/credit fields when enabled
  const netChk = document.getElementById('netMeteringChk');
  netChk.addEventListener('change', () => {
    document.getElementById('netMeteringFields').style.display = netChk.checked ? 'block' : 'none';
  });

  // Custom calendar for the From / To billing-period fields
  initDatePickers();

  // Expandable rate/surcharge panels in the rendered bill (delegated — survives re-render)
  document.getElementById('billPanel').addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const item = header.parentElement;
    const isOpen = item.classList.toggle('open');
    header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Enter in any meter-row field (reading / MF / MD / units) calculates the bill.
  document.getElementById('advancedRows').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); doCalculate(); }
  });

  loadFromUrl();
});
