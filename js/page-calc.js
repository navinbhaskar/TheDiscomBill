// js/page-calc.js — the compact calculator embedded on a state tariff page.
//
// WHY THIS IS NOT THE MAIN CALCULATOR
//
// The homepage calculator is 33.6 KB of markup across 99 element ids, and it depends on ui.js
// (99 KB) plus calculator-init.js. Putting that on 500 generated pages would more than double
// each one and repeat an identical form everywhere — the template-thinness signal you least
// want on programmatic pages. This is the simple-mode subset with the state already known, so
// the visitor supplies only DISCOM (when the state has more than one), units and load.
//
// WHAT IT SHARES WITH THE REAL ONE
//
// Everything that produces a number. calculateBill() from engine.js does the arithmetic and
// renderBill() from renderer.js draws the result, exactly as the calculator and /bill/ do.
// There is no second implementation of a tariff here, so this cannot drift from the rest of
// the site — which was the whole argument for bill-params.js earlier.
//
// SUPPLY TYPE IS REQUIRED, AND THAT IS NOT AN OVERSIGHT
//
// Leaving supplyTypeId out makes the engine take the first one on the category. For UP that
// is ST-10A (Urban Life Line, capped at 1 kW and 100 units), so 250 units at 2 kW returned
// Rs 1,260 when the correct ST-10B answer is Rs 1,727 — a 37% understatement on a bill the
// consumer could not legally be on. The caps exist only in the prose of name/description;
// there is no numeric field to check against, so this asks rather than infers.
//
// COST ON PAGE LOAD: NOTHING
//
// This module is imported by a one-line inline bootstrap on first interaction with the form,
// and it imports the engine and registry only at that point. A visitor who reads the tariff
// table and leaves downloads none of it.

const esc = (v) => String(v).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let engine = null;   // { calculateBill, renderBill, ensureDiscom, resolveFppa, subsidy }

async function loadEngine() {
  if (engine) return engine;
  const [eng, rend, reg, fppa, sub] = await Promise.all([
    import('./engine.js'),
    import('./renderer.js'),
    import('./tariffs/registry.js'),
    import('./tariffs/fppa-resolve.js'),
    import('./tariffs/subsidy.js'),
  ]);
  engine = {
    calculateBill: eng.calculateBill,
    renderBill: rend.renderBill,
    ensureDiscom: reg.ensureDiscom,
    resolveFppaForDiscom: fppa.resolveFppaForDiscom,
    DOMESTIC_SUBSIDY: sub.DOMESTIC_SUBSIDY,
  };
  return engine;
}

export async function initPageCalc() {
  const form = document.getElementById('pcalcForm');
  if (!form) return;
  const out = document.getElementById('pcOut');
  const btn = form.querySelector('.pcalc-go');
  const section = form.closest('.pcalc');
  const state = section ? section.dataset.state : '';
  // Every string this module writes into the page comes from the server-rendered element, so
  // the /hi/, /mr/ and /ta/ twins get their own copy from the one table in generate-seo.js
  // rather than a second set of translations living here. English is the fallback, which is
  // also what an older cached page without data-msgs gets.
  const M = {
    pick: 'Select your supply type…', na: 'Not applicable — single domestic tariff',
    busy: 'Calculating…',
    errUnits: 'Enter how many units you used this month.',
    errSupply: 'Choose your supply type — the rates differ sharply between them, so there is'
      + ' no safe default. It is printed on your bill.',
    errTariff: 'That tariff is unavailable.',
    errLoad: 'Could not load the tariff data. Check your connection and try again.',
  };
  try { Object.assign(M, JSON.parse((section && section.dataset.msgs) || '{}')); } catch { /* keep English */ }
  // Tells the inline bootstrap to stop intercepting: this module owns submit now.
  form.dataset.ready = '1';

  // Supply types differ per DISCOM, so the select is rebuilt whenever the DISCOM changes.
  // The map is emitted with the page (id + name only), so this needs no network call.
  const supply = document.getElementById('pcSupply');
  const discomEl = document.getElementById('pcDiscom');
  let types = {};
  try { types = JSON.parse(section.dataset.types || '{}'); } catch { /* leave empty */ }

  const supplyField = document.getElementById('pcSupplyField');
  function fillSupply() {
    const list = types[discomEl.value] || [];
    supply.innerHTML = `<option value="">${esc(M.pick)}</option>`
      + list.map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join('');
    // A DISCOM with a single undifferentiated domestic tariff (BESCOM, for one) has no supply
    // types. Asking for one there is not just noise — a required empty select cannot be
    // satisfied, so the form would never submit. Disable rather than hide: the DISCOM can
    // change under this field, and one that vanishes shifts every control below it.
    const has = list.length > 0;
    supply.required = has;
    supply.disabled = !has;
    if (!has) supply.innerHTML = `<option value="">${esc(M.na)}</option>`;
  }
  if (discomEl && discomEl.tagName === 'SELECT') discomEl.addEventListener('change', fillSupply);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const units = Number(document.getElementById('pcUnits').value);
    const load = Number(document.getElementById('pcLoad').value) || 0;
    const discomId = discomEl.value;
    const supplyTypeId = supply ? supply.value : '';

    // Validate before doing any work — an empty box should say so, not silently do nothing.
    if (!Number.isFinite(units) || units <= 0) {
      out.hidden = false;
      out.innerHTML = `<p class="pcalc-err">${esc(M.errUnits)}</p>`;
      document.getElementById('pcUnits').focus();
      return;
    }
    // Refuse rather than default. Picking one for them is what produced a 37% error.
    if (supply && supply.required && !supplyTypeId) {
      out.hidden = false;
      out.innerHTML = `<p class="pcalc-err">${esc(M.errSupply)}</p>`;
      supply.focus();
      return;
    }

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = M.busy;
    try {
      const E = await loadEngine();
      await E.ensureDiscom(discomId);

      // Price against the current month, the same default the calculator uses when a visitor
      // has not chosen a billing period.
      const now = new Date();
      const billingDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;

      const result = E.calculateBill({
        discomId, categoryId: 'domestic', supplyTypeId: supplyTypeId || undefined,
        units, connectedLoadKw: load,
        billingPeriodDays: 30, billingDate,
        // Domestic state schemes are applied by default, matching the calculator.
        subsidy: E.DOMESTIC_SUBSIDY[state] || null,
      });

      if (!result || result.error) {
        out.hidden = false;
        out.innerHTML = `<p class="pcalc-err">${esc((result && result.message) || M.errTariff)}</p>`;
        return;
      }

      const fppa = E.resolveFppaForDiscom(discomId, billingDate);
      out.hidden = false;
      // compact: the same document the calculator's Simple mode and /bill/ produce.
      out.innerHTML = E.renderBill({
        result, state, compact: true,
        billingMonth: String(now.getMonth() + 1), billingYear: String(now.getFullYear()),
        consumerName: '', accountNo: '', address: '', meterNo: '',
        prevReading: '', currReading: '', fromDate: '', toDate: '',
        fppaSource: fppa ? `${fppa.label} — ${fppa.source}` : null,
      });
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      out.hidden = false;
      out.innerHTML = `<p class="pcalc-err">${esc(M.errLoad)}</p>`;
      console.warn('page-calc:', err && err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  // The bill document renders its own action bar and drives it through these globals, which
  // only calculator-init.js installs. Without them the buttons render and silently do nothing.
  window.__showFullBill = () => { location.href = '/bill-calculator/'; };
  window.__resetCalculator = () => { out.hidden = true; out.innerHTML = ''; form.reset(); };
  window.__shareBill = () => {
    const url = location.origin + location.pathname;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => prompt('Copy this link:', url));
    else prompt('Copy this link:', url);
  };
  window.__shareBillWa = () => {
    const t = out.querySelector('.total-amt');
    const amount = t ? t.textContent.replace(/\s+/g, ' ').trim() : '';
    const msg = `My ${state} electricity bill works out to ${amount}.`
      + `\n\nWorked out here: ${location.origin + location.pathname}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  };
}

initPageCalc();
