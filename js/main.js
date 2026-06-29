// js/main.js — Entry point. Imports all modules and wires up the UI.

import {
  populateStates, populateDiscoms, populateCategories, populateSupplyTypes,
  populateMonthYear, prefillFac, prefillLpsc, updateBilledDemandVisibility,
  initTabs, addPaymentRow, addAdjustmentRow,
  updateArrearTotal, updateUnitsDisplay, updateCalcButton, updateBillingPeriod,
  updateTodDisplay, updateFacUnitLabel, updateTariffPeriodHint,
  onFppaAutoToggle, markFppaManual,
  doCalculate, isDelhiDiscom,
  shareBill, loadFromUrl, loadSample, initHistory, compareDiscoms,
  refreshSupplyTypeDependent, applyLifelineDefaultLoad, checkLifelineLimits,
  getMeterMode, setMeterMode, addMeterRow, updateAdvancedMeter,
  syncBillingMonthYear, applyDefaultBillingBasis, showToast, refreshRequiredValidation,
} from './ui.js';
import { initDatePickers } from './datepicker.js';
import { initI18n } from './i18n.js';
import { initComparisonTable } from './compare.js';
import Lenis from './vendor/lenis.mjs';

// Expose helpers called from onclick in the rendered bill HTML

// ── Smooth momentum scrolling (Lenis) ─────────────────────────────────────────
// Gives the whole page an eased, weighted "glide" instead of the browser's default
// jump. Disabled for users who prefer reduced motion (they keep native scrolling).
function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({
    duration: 1.1,
    easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),   // easeOutExpo — quick start, soft landing
    smoothWheel: true,
    // Leave touch devices on native scrolling (smoother + better battery/accessibility).
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // Route in-page anchor links (#calculator, #about, skip-link) through Lenis so they
  // glide to the target instead of jumping.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;                 // ignore bare "#"
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -70 });   // clear the sticky header
  });

  window.__lenis = lenis;
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
// Fade + rise elements (marked `.reveal`) as they scroll into view. Each reveals
// once, then is unobserved. Falls back to showing everything if IntersectionObserver
// is unavailable or the user prefers reduced motion.
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

// Start every load at the top so the hero's reveal-on-load animation plays (the browser would
// otherwise restore the previous scroll position on reload/back-navigation).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// Expose helpers called from onclick in the rendered bill HTML
window.__shareBill = shareBill;

// Register the service worker for offline support (no-op on unsupported / insecure contexts).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();   // Lenis momentum scrolling (skipped under prefers-reduced-motion)
  initScrollReveal();   // fade + rise elements as they enter the viewport
  populateStates();
  populateMonthYear();
  initTabs();
  initI18n();   // apply saved/default language + wire the EN/हिंदी switcher
  initComparisonTable(); // Render the dynamic tariff comparison table

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

  // Delhi GNCTD subsidy toggle takes effect on the next "Calculate Provisional Bill" click —
  // we deliberately don't re-run the bill live here, so the preview only updates on demand.

  document.getElementById('addPaymentBtn').addEventListener('click', addPaymentRow);
  document.getElementById('addAdjustmentBtn').addEventListener('click', addAdjustmentRow);

  // While the "missing required fields" warning is showing, clear each field's red as it's filled
  // (delegated so it covers every input/select in the form, including meter rows and TOD).
  const formPanel = document.querySelector('.form-panel');
  if (formPanel) {
    formPanel.addEventListener('input', refreshRequiredValidation);
    formPanel.addEventListener('change', refreshRequiredValidation);
  }

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
