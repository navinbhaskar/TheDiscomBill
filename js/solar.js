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
    pullTitle: 'Build an estimate on the Electricity Cost Calculator page first',
    billConv: (u) => `≈ ${u} units at your tariff — filled in above.`,
    upNote: 'UPNEDA top-up: ₹15,000/kW up to ₹30,000 — limited to the first 1,00,000 installations.',
    asNote: 'Assam state top-up: ₹15,000/kW, capped at ₹45,000 (3 kW and above).',
    breakEven: (y) => `Break-even in year ${y}`,
    chartCost: 'system cost', chartYr: 'yr',
    projYear: (y) => `Year ${y}`, projProfit: 'Profit', projRecovering: 'Recovering',
    shareText: (r) => `☀️ My rooftop solar estimate (TheDiscomBill)\n• System size: ${r.size} kW\n• Net cost after subsidy: ₹${Math.round(r.net).toLocaleString('en-IN')}\n• Savings: ₹${Math.round(r.monthlySavings).toLocaleString('en-IN')}/month\n• Pays back in ~${r.paybackYears.toFixed(1)} years\nCalculate yours free: https://thediscombill.com/solar-calculator/`,
  },
  hi: {
    roofNote: 'आपकी छत के क्षेत्रफल से सीमित — बड़े सिस्टम के लिए और छाया-रहित जगह चाहिए।',
    usageNote: 'आपकी मासिक खपत के हिसाब से साइज़ किया गया।',
    years: ' वर्ष', unitsMo: ' यूनिट/माह', capped: ' (3 kW पर कैप)', perMo: '/माह', tPerYr: ' टन/वर्ष',
    pullEst: (n) => `मेरा अनुमान इस्तेमाल करें (${n} यूनिट)`,
    pullTitle: 'पहले बिजली लागत कैलकुलेटर पेज पर अनुमान बनाएँ',
    billConv: (u) => `≈ ${u} यूनिट आपके टैरिफ पर — ऊपर भर दिया गया।`,
    upNote: 'UPNEDA टॉप-अप: ₹15,000/kW, अधिकतम ₹30,000 — पहले 1,00,000 इंस्टॉलेशन तक सीमित।',
    asNote: 'असम राज्य टॉप-अप: ₹15,000/kW, अधिकतम ₹45,000 (3 kW और ऊपर)।',
    breakEven: (y) => `वर्ष ${y} में लागत वसूल`,
    chartCost: 'सिस्टम लागत', chartYr: 'वर्ष',
    projYear: (y) => `वर्ष ${y}`, projProfit: 'मुनाफ़ा', projRecovering: 'लागत वसूली जारी',
    shareText: (r) => `☀️ मेरा रूफटॉप सोलर अनुमान (TheDiscomBill)\n• सिस्टम साइज़: ${r.size} kW\n• सब्सिडी के बाद नेट लागत: ₹${Math.round(r.net).toLocaleString('en-IN')}\n• बचत: ₹${Math.round(r.monthlySavings).toLocaleString('en-IN')}/माह\n• ~${r.paybackYears.toFixed(1)} वर्ष में लागत वसूल\nअपना अनुमान मुफ़्त निकालें: https://thediscombill.com/solar-calculator/`,
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

let lastResult = null;   // latest calc() output, for the WhatsApp share text

// Verified state top-up subsidies (on top of the PM Surya Ghar central subsidy).
// Only states with corroborated, published schemes are listed — a wrong preset is
// worse than an empty field. Amounts auto-scale with system size up to the cap.
const STATE_SUBS = {
  up:    { perKw: 15000, cap: 30000, note: 'upNote' },
  assam: { perKw: 15000, cap: 45000, note: 'asNote' },
};

// System size from consumption/roof only (state subsidy doesn't affect size,
// so this can't recurse with calc()).
function sizeOnly() {
  const monthly = readNum('solMonthly');
  const roof = readNum('solRoof');
  const consLimit = monthly > 0 ? monthly / UNITS_PER_KW_MONTH : Infinity;
  const roofLimit = roof > 0 ? roof / SQFT_PER_KW : Infinity;
  let size = Math.min(consLimit, roofLimit);
  if (!isFinite(size) || size <= 0) return 0;
  return Math.max(1, Math.round(size * 2) / 2);
}

// When a state preset is selected, keep the ₹ field in sync with the system size.
function updateStateSub() {
  const sel = $('solStateSel');
  const hint = $('solStateHint');
  if (!sel) return;
  const preset = STATE_SUBS[sel.value];
  if (!preset) { if (hint) hint.hidden = true; return; }
  const size = sizeOnly();
  $('solState').value = size > 0 ? Math.min(preset.perKw * size, preset.cap) : 0;
  if (hint) { hint.textContent = SOL_STR[lang()][preset.note]; hint.hidden = false; }
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

// Cumulative-savings timeline: 25 thin bars racing a dashed "net cost" line.
// Bars turn from amber to green the year cumulative savings pass the net cost.
function renderChart(r) {
  const box = $('solChart');
  if (!box) return;
  const S = SOL_STR[lang()];
  const W = 300, H = 110, base = 92, maxVal = Math.max(r.annualSavings * 25, r.net) || 1;
  const beYear = r.annualSavings > 0 ? Math.ceil(r.net / r.annualSavings) : Infinity;
  const costY = base - (r.net / maxVal) * 78;
  let bars = '';
  for (let y = 1; y <= 25; y++) {
    const h = Math.max(2, (r.annualSavings * y / maxVal) * 78);
    const paid = y >= beYear;
    bars += `<rect x="${8 + (y - 1) * 11.4}" y="${base - h}" width="8" height="${h}" rx="1.5" fill="${paid ? 'var(--success, #16a34a)' : '#f59e0b'}" opacity="${paid ? '0.9' : '0.85'}"/>`;
  }
  const beLabel = isFinite(beYear) && beYear <= 25 ? S.breakEven(beYear) : '';
  box.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${beLabel}">
    ${bars}
    <line x1="6" y1="${costY}" x2="${W - 6}" y2="${costY}" stroke="var(--text-tertiary)" stroke-width="1" stroke-dasharray="4 3"/>
    <line x1="8" y1="9" x2="22" y2="9" stroke="var(--text-tertiary)" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="27" y="12" font-size="9" fill="var(--text-tertiary)">${S.chartCost} ₹${Math.round(r.net).toLocaleString('en-IN')}</text>
    <text x="8" y="${H - 4}" font-size="9.5" fill="var(--text-tertiary)">1 ${S.chartYr}</text>
    <text x="${W - 6}" y="${H - 4}" text-anchor="end" font-size="9.5" fill="var(--text-tertiary)">25 ${S.chartYr}</text>
  </svg>
  ${beLabel ? `<div class="solar-chart-be">${beLabel}</div>` : ''}`;
}

// Year-by-year projection table. Unlike the flat headline numbers, this models
// tariff escalation and panel degradation, so the two must not be conflated:
// the table's footnote states its assumptions and the headline stays conservative.
const TARIFF_ESCALATION = 0.05;   // grid tariffs rise ~5%/yr (long-run India average)
const PANEL_DEGRADATION = 0.007;  // output falls ~0.7%/yr (typical warranty curve)
const PROJ_YEARS = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25];

function renderProjTable(r) {
  const body = $('solProjBody');
  if (!body) return;
  const S = SOL_STR[lang()];
  let cum = 0, rows = '';
  for (let y = 1; y <= PANEL_LIFE_YEARS; y++) {
    const annual = r.annualSavings * Math.pow(1 + TARIFF_ESCALATION, y - 1) * Math.pow(1 - PANEL_DEGRADATION, y - 1);
    cum += annual;
    if (!PROJ_YEARS.includes(y)) continue;
    const net = cum - r.net;
    const profit = net >= 0;
    rows += `<tr>
      <td class="sp-year">${S.projYear(y)}</td>
      <td class="sp-annual">${rs(annual)}</td>
      <td class="sp-cumul">${rs(cum)}</td>
      <td class="${profit ? 'sp-net-pos' : 'sp-net-neg'}">${profit ? '+' : '−'}${rs(Math.abs(net)).slice(1)}</td>
      <td><span class="sp-chip ${profit ? 'sp-chip-profit' : 'sp-chip-recover'}">${profit ? S.projProfit : S.projRecovering}</span></td>
    </tr>`;
  }
  body.innerHTML = rows;
}

function render() {
  updateStateSub();   // preset amounts track the system size
  const r = calc();
  const empty = $('solEmpty'), result = $('solResult'), proj = $('solProj');
  if (!r.haveInput) { empty.hidden = false; result.hidden = true; if (proj) proj.hidden = true; return; }
  empty.hidden = true; result.hidden = false;
  if (proj) proj.hidden = false;
  lastResult = r;
  renderChart(r);
  renderProjTable(r);

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

  // Registered BEFORE the render listeners below: typing a custom amount must flip
  // the dropdown to "custom" first, or render()'s preset sync clobbers the input.
  $('solState').addEventListener('input', () => {
    const sel = $('solStateSel');
    if (sel && STATE_SUBS[sel.value]) sel.value = 'custom';
    const hint = $('solStateHint');
    if (hint) hint.hidden = true;
  });

  ['solMonthly', 'solRoof', 'solRate', 'solState', 'solCost'].forEach(id =>
    $(id).addEventListener('input', render));

  // "I only know my bill amount" — one-way conversion: ₹ → units via the tariff rate.
  // Typing units directly never touches this field, so there's no feedback loop.
  $('solBillAmt')?.addEventListener('input', () => {
    const amt = readNum('solBillAmt');
    const rate = readNum('solRate', 7) || 7;
    const hint = $('solBillHint');
    if (amt > 0) {
      const units = Math.round(amt / rate);
      $('solMonthly').value = units;
      if (hint) hint.textContent = SOL_STR[lang()].billConv(units);
    }
    render();
  });

  // State-subsidy dropdown: presets fill the ₹ field (size-aware); typing a
  // custom amount flips the dropdown to "custom" so the preset stops overwriting it.
  $('solStateSel')?.addEventListener('change', () => {
    const v = $('solStateSel').value;
    if (v === 'none') $('solState').value = 0;
    if (v === 'custom') $('solState').focus();
    render();
  });

  // Share the current estimate as a pre-filled WhatsApp message.
  $('solShare')?.addEventListener('click', () => {
    if (!lastResult) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(SOL_STR[lang()].shareText(lastResult)), '_blank', 'noopener');
  });

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
    pull.addEventListener('click', () => { location.href = '/electricity-cost-calculator/'; });
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
