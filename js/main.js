// js/main.js — Entry point. Imports all modules and wires up the UI.

import {
  populateStates, populateDiscoms, populateCategories, populateSupplyTypes,
  populateMonthYear, prefillFac, prefillLpsc, updateBilledDemandVisibility,
  initTabs, addPaymentRow, addAdjustmentRow,
  updateArrearTotal, updateUnitsDisplay, updateCalcButton, updateBillingPeriod,
  updateTodDisplay, updateFacUnitLabel, updateTariffPeriodHint,
  onFppaAutoToggle, markFppaManual,
  canCalculate, doCalculate, isDelhiDiscom,
  shareBill, loadFromUrl,
  refreshSupplyTypeDependent, applyLifelineDefaultLoad, checkLifelineLimits,
  getMeterMode, setMeterMode, setAdvancedSubMode, addMeterRow, updateAdvancedMeter,
} from './ui.js';
import { initDatePickers } from './datepicker.js';

// Expose shareBill to global scope (called from onclick in rendered bill HTML)
window.__shareBill = shareBill;

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
    updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
    updateTariffPeriodHint();
    updateCalcButton();
  });

  supplyTypeEl.addEventListener('change', () => {
    applyLifelineDefaultLoad(discomEl.value, categoryEl.value, supplyTypeEl.value);
    refreshSupplyTypeDependent();
    checkLifelineLimits();
  });

  ['prevReading', 'currReading', 'unitsInput'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      updateUnitsDisplay();
      updateCalcButton();
      checkLifelineLimits();   // consumption may exceed the lifeline cap
    });
  });

  document.getElementById('fromDate').addEventListener('change', () => {
    updateBillingPeriod();
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

  // Billing month/year change → re-resolve which historical tariff period applies
  ['billingMonth', 'billingYear'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
    });
  });

  document.getElementById('facMode').addEventListener('change', () => {
    updateFacUnitLabel();
    markFppaManual();   // changing mode by hand = manual override
  });
  document.getElementById('fppaAuto').addEventListener('change', () => {
    onFppaAutoToggle(discomEl.value, categoryEl.value, supplyTypeEl.value);
  });
  document.getElementById('facRate').addEventListener('input', markFppaManual);

  // Reading-mode selector (Simple / Advanced / TOD) + Advanced sub-tabs + add-row
  document.querySelectorAll('input[name="meterMode"]').forEach(r => {
    r.addEventListener('change', () => setMeterMode(getMeterMode()));
  });
  document.querySelectorAll('.adv-subtab').forEach(b => {
    b.addEventListener('click', () => setAdvancedSubMode(b.dataset.submode));
  });
  document.getElementById('addMeterRowBtn').addEventListener('click', () => { addMeterRow(''); updateAdvancedMeter(); });

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

  document.getElementById('currReading').addEventListener('keydown', e => {
    if (e.key === 'Enter') doCalculate();
  });
  document.getElementById('unitsInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doCalculate();
  });

  loadFromUrl();
});
