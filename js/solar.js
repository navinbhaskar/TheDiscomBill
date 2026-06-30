// solar.js — Rooftop Solar / PM Surya Ghar savings & payback calculator (/solar/).
// User enters monthly units (or pulls them from the Consumption Estimator) + roof area; we
// estimate the right system size, upfront cost, central + state subsidy, monthly savings,
// payback period and 25-year savings. Self-contained (no engine import).

// ── Assumptions (India averages; all overridable where it matters) ────────────
const UNITS_PER_KW_MONTH = 120;     // ~4 kWh per kW per day generation
const SQFT_PER_KW        = 100;     // shadow-free roof area needed per kW
const DEFAULT_COST_PER_KW = 55000;  // turnkey system cost (MNRE benchmark ballpark)
const CO2_PER_KWH        = 0.82;    // kg CO₂ avoided per grid kWh (India grid factor)
const PANEL_LIFE_YEARS   = 25;
const EST_STORE_KEY      = 'tdb_estimator_v1';

const $ = (id) => document.getElementById(id);
const rs  = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const num = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// PM Surya Ghar Muft Bijli Yojana central subsidy (residential):
// ₹30,000/kW for the first 2 kW, ₹18,000/kW for the 3rd kW, capped at ₹78,000 (≥3 kW).
function centralSubsidy(kW) {
  if (kW <= 0) return 0;
  if (kW <= 2) return kW * 30000;
  if (kW <= 3) return 60000 + (kW - 2) * 18000;
  return 78000;
}

// Pull the user's monthly consumption from the Consumption Estimator (localStorage), if present.
function estimatorUnits() {
  try {
    const s = JSON.parse(localStorage.getItem(EST_STORE_KEY));
    if (s && Array.isArray(s.rows) && s.rows.length) {
      const total = s.rows.reduce((sum, r) => sum + (Number(r.w) * Number(r.qty) * Number(r.hrs) * 30) / 1000, 0);
      return total > 0 ? Math.round(total) : null;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function readNum(id, fallback = 0) {
  const v = parseFloat($(id).value);
  return isNaN(v) || v < 0 ? fallback : v;
}

function calc() {
  const monthly = readNum('solMonthly');
  const roof    = readNum('solRoof');
  const rate    = readNum('solRate', 7);
  const stateSub = readNum('solState');
  const costPerKw = readNum('solCost', DEFAULT_COST_PER_KW) || DEFAULT_COST_PER_KW;

  // Size is limited by EITHER what your consumption needs OR what your roof can hold.
  const consLimit = monthly > 0 ? monthly / UNITS_PER_KW_MONTH : Infinity;
  const roofLimit = roof   > 0 ? roof    / SQFT_PER_KW        : Infinity;
  let size = Math.min(consLimit, roofLimit);
  const haveInput = isFinite(size) && size > 0;
  if (!haveInput) return { haveInput: false };

  size = Math.max(1, Math.round(size * 2) / 2);   // nearest 0.5 kW, min 1 kW
  const roofLimited = roofLimit < consLimit;

  const monthlyGen = size * UNITS_PER_KW_MONTH;
  const annualGen  = monthlyGen * 12;
  const monthlySavings = monthlyGen * rate;
  const annualSavings  = monthlySavings * 12;

  const gross   = size * costPerKw;
  const central = centralSubsidy(size);
  const net     = Math.max(0, gross - central - stateSub);

  const paybackYears = annualSavings > 0 ? net / annualSavings : Infinity;
  const lifetimeSavings = annualSavings * PANEL_LIFE_YEARS - net;
  const co2Tonnes = (annualGen * CO2_PER_KWH) / 1000;

  return {
    haveInput: true, size, roofLimited, monthly, monthlyGen, annualGen,
    monthlySavings, annualSavings, gross, central, stateSub, net,
    paybackYears, lifetimeSavings, co2Tonnes, capped: size >= 3
  };
}

function render() {
  const r = calc();
  const empty = $('solEmpty'), result = $('solResult');
  if (!r.haveInput) { empty.hidden = false; result.hidden = true; return; }
  empty.hidden = true; result.hidden = false;

  $('solSize').textContent = num(r.size, r.size % 1 ? 1 : 0);
  $('solSizeNote').textContent = r.roofLimited
    ? 'Limited by your roof area — a bigger system would need more shadow-free space.'
    : 'Sized to cover your monthly usage.';
  $('solPayback').textContent = isFinite(r.paybackYears) ? num(r.paybackYears, 1) + ' years' : '—';

  $('solGen').textContent = num(r.monthlyGen) + ' units/mo';
  $('solGross').textContent = rs(r.gross);
  $('solCentral').textContent = '– ' + rs(r.central) + (r.capped ? ' (capped at 3 kW)' : '');
  $('solState2').textContent = r.stateSub > 0 ? '– ' + rs(r.stateSub) : '₹0';
  $('solNet').textContent = rs(r.net);
  $('solMonthlySave').textContent = rs(r.monthlySavings) + '/mo';
  $('solLifetime').textContent = rs(r.lifetimeSavings);
  $('solCo2').textContent = num(r.co2Tonnes, 1) + ' t/yr';
}

function init() {
  if (!$('solMonthly')) return; // not on the solar page

  ['solMonthly', 'solRoof', 'solRate', 'solState', 'solCost'].forEach(id =>
    $(id).addEventListener('input', render));

  // "Use my estimate" — fill monthly units from the Consumption Estimator if available.
  const pull = $('solPull');
  const est = estimatorUnits();
  if (est) {
    pull.addEventListener('click', () => { $('solMonthly').value = est; render(); });
    pull.textContent = `Use my estimate (${est} units)`;
  } else {
    pull.classList.add('is-disabled');
    pull.title = 'Build an estimate on the Consumption Estimators page first';
    pull.addEventListener('click', () => { location.href = '/estimators/'; });
  }

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
