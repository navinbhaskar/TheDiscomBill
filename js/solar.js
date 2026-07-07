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

// Dynamic result strings in both languages (static labels are handled by i18n data-i18n).
const lang = () => { try { return localStorage.getItem('lang') === 'hi' ? 'hi' : 'en'; } catch { return 'en'; } };
const SOL_STR = {
  en: {
    roofNote: 'Limited by your roof area — a bigger system would need more shadow-free space.',
    usageNote: 'Sized to cover your monthly usage.',
    years: ' years', unitsMo: ' units/mo', capped: ' (capped at 3 kW)', perMo: '/mo', tPerYr: ' t/yr',
    pullEst: (n) => `Use my estimate (${n} units)`,
    pullTitle: 'Build an estimate on the Usage Estimator page first',
  },
  hi: {
    roofNote: 'आपकी छत के क्षेत्रफल से सीमित — बड़े सिस्टम के लिए और छाया-रहित जगह चाहिए।',
    usageNote: 'आपकी मासिक खपत के हिसाब से साइज़ किया गया।',
    years: ' वर्ष', unitsMo: ' यूनिट/माह', capped: ' (3 kW पर कैप)', perMo: '/माह', tPerYr: ' टन/वर्ष',
    pullEst: (n) => `मेरा अनुमान इस्तेमाल करें (${n} यूनिट)`,
    pullTitle: 'पहले यूसेज एस्टिमेटर पेज पर अनुमान बनाएँ',
  },
};

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

  const S = SOL_STR[lang()];
  $('solSize').textContent = num(r.size, r.size % 1 ? 1 : 0);
  $('solSizeNote').textContent = r.roofLimited ? S.roofNote : S.usageNote;
  $('solPayback').textContent = isFinite(r.paybackYears) ? num(r.paybackYears, 1) + S.years : '—';

  $('solGen').textContent = num(r.monthlyGen) + S.unitsMo;
  $('solGross').textContent = rs(r.gross);
  $('solCentral').textContent = '– ' + rs(r.central) + (r.capped ? S.capped : '');
  $('solState2').textContent = r.stateSub > 0 ? '– ' + rs(r.stateSub) : '₹0';
  $('solNet').textContent = rs(r.net);
  $('solMonthlySave').textContent = rs(r.monthlySavings) + S.perMo;
  $('solLifetime').textContent = rs(r.lifetimeSavings);
  $('solCo2').textContent = num(r.co2Tonnes, 1) + S.tPerYr;
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
    pull.textContent = SOL_STR[lang()].pullEst(est);
    pull.removeAttribute('data-i18n');   // dynamic text now owns this button
  } else {
    pull.classList.add('is-disabled');
    pull.title = SOL_STR[lang()].pullTitle;
    pull.addEventListener('click', () => { location.href = '/usage/'; });
  }

  // Language switched in place (no reload on tool pages): re-render the dynamic
  // result strings so they match the freshly swapped static labels.
  window.addEventListener('storage', () => render());
  document.getElementById('langMenu')?.addEventListener('click', () => setTimeout(() => {
    render();
    if (est) pull.textContent = SOL_STR[lang()].pullEst(est); else pull.title = SOL_STR[lang()].pullTitle;
  }, 0));

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
