// js/calculator-init.js — everything the bill calculator needs, split out of main.js.
//
// Why this file exists: main.js wires the shared header, so EVERY page loads it. It used to
// statically import ui.js, which pulls renderer.js, engine.js, datepicker.js and the tariff
// registry's 37 state data modules — 514KB of JavaScript, on guide and tariff pages that use
// none of it. main.js now imports this module dynamically, only when #stateSelect is present.
//
// Nothing here changed behaviourally; it is the same code, moved.

import {
  populateStates, populateDiscoms, populateCategories, populateSupplyTypes,
  populateMonthYear, prefillFac, prefillLpsc, updateBilledDemandVisibility,
  initTabs, initLoadFloor, initAdvPanel, addPaymentRow, addAdjustmentRow,
  updateArrearTotal, updateUnitsDisplay, updateCalcButton, updateBillingPeriod,
  updateTodDisplay, updateFacUnitLabel, updateTariffPeriodHint,
  onFppaAutoToggle, markFppaManual,
  doCalculate, refreshSubsidyToggle,
  shareBill, shareBillWhatsApp, resetCalculator, loadFromUrl, loadSample, initHistory,
  refreshSupplyTypeDependent, applyLifelineDefaultLoad, checkLifelineLimits,
  getMeterMode, setMeterMode, addMeterRow, updateAdvancedMeter,
  syncBillingMonthYear, applyDefaultBillingBasis, showToast, refreshRequiredValidation,
} from './ui.js';
import { getDefaultCategory, ensureState, ensureDiscom } from './tariffs/registry.js';
import { initDatePickers } from './datepicker.js';

// Called from main.js's DOMContentLoaded handler once the calculator DOM is confirmed present.
export function initCalculator() {
  populateStates();
  populateMonthYear();
  initTabs();

  // Expose helpers called from onclick in the rendered bill HTML. These live here rather than
  // at module scope in main.js because they close over ui.js, which is now lazily loaded.
  window.__shareBill = shareBill;
  window.__shareBillWa = shareBillWhatsApp;
  window.__resetCalculator = resetCalculator;

  // Remote FPPA rates land asynchronously; when fresh rows arrive after the form has rendered,
  // re-run the auto prefill so the visible rate updates too. Registered here (not in main.js)
  // because prefillFac comes from ui.js. initRemoteRates() fires a network request, so this
  // listener is always attached long before any event it needs to catch.
  window.addEventListener('fppa-rates-updated', () => {
    const discomEl = document.getElementById('discomSelect');
    const autoEl   = document.getElementById('fppaAuto');
    if (discomEl && discomEl.value && autoEl && autoEl.checked) {
      prefillFac(discomEl.value,
        document.getElementById('categorySelect')?.value,
        document.getElementById('supplyTypeSelect')?.value);
    }
  });

  const stateEl      = document.getElementById('stateSelect');
  const discomEl     = document.getElementById('discomSelect');
  const categoryEl   = document.getElementById('categorySelect');
  const supplyTypeEl = document.getElementById('supplyTypeSelect');

  // ── Purpose chips + remembered selection ────────────────────────────────────
  // Simple mode asks "Home or Shop?" instead of showing a Consumer Category select full of
  // tariff codes. The chips are a view over #categorySelect — that select stays the single
  // source of truth for calculation, sharing, history and OCR autofill.
  const purposeChips = document.getElementById('purposeChips');
  const purposeEcho  = document.getElementById('purposeEcho');
  let purposeKind = 'domestic';

  const currentPurpose = () => purposeKind;

  // Mirrors whatever #categorySelect actually holds back onto the chips, and names the
  // resolved tariff underneath so a pre-filled choice is never invisible. Called after
  // every cascade, including ones the user didn't drive (share links, OCR, sample bill).
  function syncPurposeChips() {
    if (!purposeChips) return;
    const discomId = discomEl.value;
    const commercial = discomId ? getDefaultCategory(discomId, 'commercial') : null;
    // Derive from the select, don't just replay the last chip click: Detailed mode, a share
    // link and OCR autofill all write the category directly, and the chips must not claim
    // "Home" while the form is calculating a commercial tariff.
    if (categoryEl.value && commercial && categoryEl.value === commercial.id) purposeKind = 'commercial';
    else if (categoryEl.value) purposeKind = 'domestic';
    purposeChips.querySelectorAll('.purpose-chip').forEach(b => {
      // 17 of 65 DISCOMs carry no commercial tariff — offer no choice rather than a dead one.
      if (b.dataset.kind === 'commercial') b.hidden = !!discomId && !commercial;
      const on = b.dataset.kind === purposeKind;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (purposeEcho) {
      const catName = categoryEl.options[categoryEl.selectedIndex]?.textContent.trim();
      const stName  = supplyTypeEl.value && supplyTypeGroupVisible()
        ? supplyTypeEl.options[supplyTypeEl.selectedIndex]?.textContent.trim() : '';
      purposeEcho.textContent = catName && categoryEl.value
        ? (stName ? `${catName} · ${stName}` : catName)
        : '';
    }
  }
  // Declaration, not a const arrow: syncPurposeChips above calls it, and a const would be
  // in its temporal dead zone on the first cascade fired during init.
  function supplyTypeGroupVisible() {
    return document.getElementById('supplyTypeGroup')?.style.display !== 'none';
  }

  purposeChips?.querySelectorAll('.purpose-chip').forEach(b => {
    b.addEventListener('click', () => {
      if (purposeKind === b.dataset.kind) return;
      purposeKind = b.dataset.kind;
      const def = discomEl.value ? getDefaultCategory(discomEl.value, purposeKind) : null;
      if (def) { categoryEl.value = def.id; categoryEl.dispatchEvent(new Event('change')); }
      syncPurposeChips();
    });
  });

  // The form used to reopen on a returning visitor's last state + DISCOM, remembered in
  // localStorage. Removed on request: the calculator should start empty and let the visitor
  // choose, so a stale pick can never be mistaken for one they just made. A ?state=/?discom=
  // link still fills the form — that is an explicit request, not a remembered guess.
  // Any key left over from the old behaviour is cleared so it does not linger in storage.
  try { localStorage.removeItem('discombill.lastSelection'); } catch (e) {}

  if (stateEl) {
    stateEl.addEventListener('change', async () => {
      // Picking a state is the moment we know WHICH tariff tables to fetch, and it happens
      // before anything reads a rate — so this is the one place the on-demand load belongs.
      // Everything downstream (categories, supply types, the engine) stays synchronous.
      if (stateEl.value) await ensureState(stateEl.value);
      // 20 of 34 states have one DISCOM; when so, populateDiscoms picks it and we replay the
      // normal `change` cascade rather than duplicating it here.
      const auto = populateDiscoms(stateEl.value);
      if (auto) {
        discomEl.dispatchEvent(new Event('change'));
      } else {
        populateCategories('');
        populateSupplyTypes('', '');
        updateCalcButton();
        refreshSubsidyToggle();
      }
    });

    discomEl.addEventListener('change', () => {
      // Pre-selects the domestic category (or commercial, if the Business chip is on) and
      // replays the category cascade below, so supply type / FPPA / load all follow.
      const cat = populateCategories(discomEl.value, currentPurpose());
      populateSupplyTypes('', '');
      updateCalcButton();
      refreshSubsidyToggle();
      prefillLpsc(discomEl.value);
      // Reflect the chosen DISCOM (and its state) in the URL without reloading, so the
      // selection can be bookmarked / shared. Other existing query params are preserved.
      const params = new URLSearchParams(location.search);
      if (discomEl.value) {
        params.set('state', stateEl.value);
        params.set('discom', discomEl.value);
      } else {
        params.delete('discom');
      }
      const qs = params.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      if (cat) categoryEl.dispatchEvent(new Event('change'));
      syncPurposeChips();
    });

    categoryEl.addEventListener('change', () => {
      populateSupplyTypes(discomEl.value, categoryEl.value);
      applyDefaultBillingBasis();
      updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
      updateCalcButton();
      refreshSubsidyToggle();
      syncPurposeChips();
    });

    document.querySelectorAll('input[name="billingBasis"]').forEach(r => {
      r.addEventListener('change', () => {
        updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
      });
    });

    supplyTypeEl.addEventListener('change', () => {
      applyLifelineDefaultLoad(discomEl.value, categoryEl.value, supplyTypeEl.value);
      refreshSupplyTypeDependent();
      checkLifelineLimits();
      syncPurposeChips();
    });

    document.getElementById('fromDate').addEventListener('change', () => {
      updateBillingPeriod();
      prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
      checkLifelineLimits();
    });
    document.getElementById('toDate').addEventListener('change', () => {
      updateBillingPeriod();
      prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
      checkLifelineLimits();
    });
    document.getElementById('connectedLoad').addEventListener('input', () => {
      updateCalcButton();
      checkLifelineLimits();
    });
    document.getElementById('billedDemand').addEventListener('input', checkLifelineLimits);

    ['billingMonth', 'billingYear'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
        updateTariffPeriodHint();
      });
    });
    document.getElementById('billingMonthYear').addEventListener('change', syncBillingMonthYear);

    document.getElementById('facMode').addEventListener('change', () => {
      updateFacUnitLabel();
      markFppaManual();
    });
    // Segmented ₹/unit ⇄ % pill mirrors the hidden #facMode select (the JS source of truth)
    document.querySelectorAll('input[name="facModeSeg"]').forEach(r => {
      r.addEventListener('change', () => {
        const sel = document.getElementById('facMode');
        if (sel && sel.value !== r.value) { sel.value = r.value; sel.dispatchEvent(new Event('change')); }
      });
    });
    document.getElementById('fppaAuto').addEventListener('change', () => {
      onFppaAutoToggle(discomEl.value, categoryEl.value, supplyTypeEl.value);
    });
    document.getElementById('facRate').addEventListener('input', markFppaManual);

    document.getElementById('todSplitChk').addEventListener('change', () => setMeterMode(getMeterMode()));
    document.getElementById('addMeterRowBtn').addEventListener('click', () => { addMeterRow(''); updateAdvancedMeter(); });
    setMeterMode(getMeterMode());

    ['todPeak', 'todNormal', 'todOffPeak'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        updateTodDisplay();
        prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
        checkLifelineLimits();
      });
    });
    document.getElementById('arrears').addEventListener('input', updateArrearTotal);
    document.getElementById('arrearLpsc').addEventListener('input', updateArrearTotal);

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

    const formPanel = document.querySelector('.form-panel');
    if (formPanel) {
      formPanel.addEventListener('input', refreshRequiredValidation);
      formPanel.addEventListener('change', refreshRequiredValidation);
    }

    document.getElementById('calculateBtn').addEventListener('click', doCalculate);
    document.getElementById('resetBtn')?.addEventListener('click', resetCalculator);
    document.getElementById('sampleBtnPanel')?.addEventListener('click', loadSample);
    initHistory();

    // ── Simple / Detailed mode ────────────────────────────────────────────────
    // Simple mode strips the form to state → DISCOM → category → units → load. It reuses the
    // existing meter row in direct-units mode, so validation, sharing and history are untouched.
    const setCalcMode = (mode) => {
      const simple = mode === 'simple';
      formPanel.classList.toggle('simple-mode', simple);
      // Drives the segmented control's sliding thumb (CSS keys off this attribute)
      document.getElementById('calcMode')?.setAttribute('data-active', mode);
      document.querySelectorAll('#calcMode .calc-mode-btn').forEach(b => {
        const on = b.dataset.mode === mode;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      const hint = document.getElementById('calcModeHint');
      if (hint) hint.style.display = simple ? '' : 'none';
      if (simple) {
        // Force the plain "type your units" path: TOD split off + direct-units override.
        const todChk = document.getElementById('todSplitChk');
        if (todChk && todChk.checked) { todChk.checked = false; todChk.dispatchEvent(new Event('change')); }
        const row = document.querySelector('#advancedRows .meter-row');
        const chk = row?.querySelector('.m-override-chk');
        if (chk && !chk.checked) { chk.checked = true; chk.dispatchEvent(new Event('change')); }
        const lbl = row?.querySelector('.m-units-label');
        if (lbl) lbl.textContent = (localStorage.getItem('lang') === 'hi')
          ? 'इस महीने की खपत (यूनिट)' : 'Units consumed this month';
      }
    };
    document.querySelectorAll('#calcMode .calc-mode-btn').forEach(b => {
      b.addEventListener('click', () => setCalcMode(b.dataset.mode));
    });
    // Always open in Simple — the calculator's default face is the stripped-down state → DISCOM →
    // category → units → load form. Switching to Detailed is per-session only (not remembered), so
    // every fresh load and every "Calculate new bill" reset lands back in Simple. The one exception
    // is a legacy ?q= share link, which opens Detailed so every field it carries (arrears, TOD,
    // dates…) stays visible.
    const hasSharePayload = new URLSearchParams(location.search).has('q');
    // /bill-calculator/ marks itself detailed: it exists for the fields Simple mode hides, so
    // opening it stripped-down would hide the only reason to be on that page.
    const pageDefault = document.getElementById('calculator')?.dataset.defaultMode;
    setCalcMode(hasSharePayload || pageDefault === 'detailed' ? 'detailed' : 'simple');

    // "Show the full bill breakdown" on the Simple result: switch to Detailed and
    // re-render the same inputs as the full facsimile, then scroll to it.
    window.__showFullBill = () => {
      setCalcMode('detailed');
      doCalculate();
    };

    const netChk = document.getElementById('netMeteringChk');
    netChk.addEventListener('change', () => {
      document.getElementById('netMeteringFields').style.display = netChk.checked ? 'block' : 'none';
    });

    initDatePickers();

    document.getElementById('billPanel').addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;
      const item = header.parentElement;
      const isOpen = item.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.getElementById('advancedRows').addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); doCalculate(); }
    });

    // A browser refresh should start fresh — the same clean slate as the "Calculate new bill"
    // button — instead of restoring the bill from the share params still in the address bar after
    // a calculation. Detect a reload (vs a first visit or an opened share link, which should still
    // restore) and reset to the clean URL. The clean reload then has no params, so no loop.
    const navEntry = performance.getEntriesByType('navigation')[0];
    const isReload = navEntry ? navEntry.type === 'reload'
                              : (performance.navigation && performance.navigation.type === 1);
    if (isReload && location.search.length > 1) {
      location.replace(location.pathname + '#calculator');
      return;
    }

    loadFromUrl();
    syncPurposeChips();
    initLoadFloor();   // after loadFromUrl so a share link's load is floored too
    initAdvPanel();    // ditto — a share link's ToD / solar / LPSC switches open the panel
  }
}
