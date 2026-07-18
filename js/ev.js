// ev.js — EV Charging Cost Calculator (/ev/).
// Pick an EV (or enter battery + real-world range), your monthly km and tariff; we compute
// units drawn from the wall (incl. charging losses), cost per full charge, monthly charging
// cost, per-km cost vs petrol, savings, and charge times. Self-contained (no engine import).

// ── Assumptions (overridable in Advanced) ─────────────────────────────────────
const CHARGING_LOSS_PCT   = 10;    // AC charging conversion loss (heat), typical 8–12%
const DEFAULT_TARIFF      = 7;     // ₹/unit domestic average; users should use their slab rate
const DEFAULT_PETROL      = 105;   // ₹/litre
const DEFAULT_MILEAGE     = 15;    // km/litre petrol equivalent
const DEFAULT_PUBLIC_RATE = 20;    // ₹/unit public DC fast charging (₹15–25 + GST typical)
const SLOW_KW             = 3.3;   // 15A home socket
const WALLBOX_KW          = 7.2;   // AC wallbox

const $ = (id) => document.getElementById(id);
const rs  = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const num = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// EV presets: battery (kWh) + conservative REAL-WORLD range (km), not ARAI claims.
// Both stay editable after selection, so a wrong preset is always correctable.
const EV_PRESETS = [
  { id: 'ather450x', label: 'Ather 450X', kwh: 3.7, km: 105, type: '2W' },
  { id: 'ola_s1pro', label: 'Ola S1 Pro', kwh: 4.0, km: 135, type: '2W' },
  { id: 'tvs_iqube', label: 'TVS iQube', kwh: 3.4, km: 90, type: '2W' },
  { id: 'chetak', label: 'Bajaj Chetak', kwh: 3.2, km: 95, type: '2W' },
  { id: 'tiago', label: 'Tata Tiago EV', kwh: 24, km: 190, type: '4W' },
  { id: 'punch', label: 'Tata Punch EV', kwh: 35, km: 260, type: '4W' },
  { id: 'nexon', label: 'Tata Nexon EV', kwh: 40.5, km: 320, type: '4W' },
  { id: 'windsor', label: 'MG Windsor EV', kwh: 38, km: 270, type: '4W' },
  { id: 'xuv400', label: 'Mahindra XUV400', kwh: 39.4, km: 280, type: '4W' },
  { id: 'zsev', label: 'MG ZS EV', kwh: 50.3, km: 370, type: '4W' },
  { id: 'creta', label: 'Hyundai Creta Electric', kwh: 51.4, km: 390, type: '4W' },
  { id: 'atto3', label: 'BYD Atto 3', kwh: 60.5, km: 420, type: '4W' },
];

// Dynamic result strings in both languages (static labels are handled by i18n data-i18n).
const lang = () => { try { return localStorage.getItem('lang') === 'hi' ? 'hi' : 'en'; } catch { return 'en'; } };
const EV_STR = {
  en: {
    custom: 'Custom / other EV…', grp2w: 'Two-wheelers', grp4w: 'Cars & SUVs',
    perKm: '/km', perMo: '/mo', perYr: '/yr', unitsMo: ' units/mo',
    cheaper: (p) => `${p}% cheaper than petrol`,
    hrs: (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60); return H ? `${H}h ${M ? M + 'm' : ''}`.trim() : `${M}m`; },
    toPct: (p) => p >= 100 ? 'full charge' : `to ${p}%`,
    petrolSame: (km) => `petrol for the same ${num(km)} km`,
    shareText: (r) => `🔌 My EV charging cost (TheDiscomBill)\n• ${r.evLabel}: ₹${r.evPerKm.toFixed(2)}/km vs petrol ₹${r.petrolPerKm.toFixed(2)}/km\n• Monthly charging: ₹${Math.round(r.monthlyCost).toLocaleString('en-IN')} for ${Math.round(r.monthlyKm).toLocaleString('en-IN')} km\n• I save ₹${Math.round(r.monthlySave).toLocaleString('en-IN')}/month vs petrol\nCalculate yours free: https://thediscombill.com/ev/`,
  },
  hi: {
    custom: 'कस्टम / अन्य EV…', grp2w: 'दोपहिया', grp4w: 'कार व SUV',
    perKm: '/किमी', perMo: '/माह', perYr: '/वर्ष', unitsMo: ' यूनिट/माह',
    cheaper: (p) => `पेट्रोल से ${p}% सस्ता`,
    hrs: (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60); return H ? `${H}घं ${M ? M + 'मि' : ''}`.trim() : `${M}मि`; },
    toPct: (p) => p >= 100 ? 'फुल चार्ज' : `${p}% तक`,
    petrolSame: (km) => `इतने ही ${num(km)} किमी के लिए पेट्रोल`,
    shareText: (r) => `🔌 मेरी EV चार्जिंग लागत (TheDiscomBill)\n• ${r.evLabel}: ₹${r.evPerKm.toFixed(2)}/किमी बनाम पेट्रोल ₹${r.petrolPerKm.toFixed(2)}/किमी\n• मासिक चार्जिंग: ₹${Math.round(r.monthlyCost).toLocaleString('en-IN')} (${Math.round(r.monthlyKm).toLocaleString('en-IN')} किमी)\n• पेट्रोल की तुलना में ₹${Math.round(r.monthlySave).toLocaleString('en-IN')}/माह की बचत\nअपनी लागत मुफ़्त निकालें: https://thediscombill.com/ev/`,
  },
};

function readNum(id, fallback = 0) {
  const v = parseFloat($(id).value);
  return isNaN(v) || v < 0 ? fallback : v;
}

let lastResult = null;

function populatePresets() {
  const sel = $('evSelect');
  const S = EV_STR[lang()];
  const cur = sel.value;
  sel.innerHTML = '';
  const mk = (label, items) => {
    const g = document.createElement('optgroup');
    g.label = label;
    items.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id; o.textContent = `${p.label} (${p.kwh} kWh)`;
      g.appendChild(o);
    });
    sel.appendChild(g);
  };
  mk(S.grp2w, EV_PRESETS.filter(p => p.type === '2W'));
  mk(S.grp4w, EV_PRESETS.filter(p => p.type === '4W'));
  const custom = document.createElement('option');
  custom.value = 'custom'; custom.textContent = S.custom;
  sel.appendChild(custom);
  sel.value = cur && [...sel.options].some(o => o.value === cur) ? cur : 'nexon';
}

function applyPreset() {
  const p = EV_PRESETS.find(x => x.id === $('evSelect').value);
  if (!p) return;                       // custom — leave fields as typed
  $('evBattery').value = p.kwh;
  $('evRange').value = p.km;
}

function calc() {
  const battery  = readNum('evBattery');
  const range    = readNum('evRange');
  const monthlyKm = readNum('evKm');
  const rate     = readNum('evRate', DEFAULT_TARIFF) || DEFAULT_TARIFF;
  const lossPct  = readNum('evLoss', CHARGING_LOSS_PCT);
  const petrol   = readNum('evPetrol', DEFAULT_PETROL) || DEFAULT_PETROL;
  const mileage  = readNum('evMileage', DEFAULT_MILEAGE) || DEFAULT_MILEAGE;
  const pubRate  = readNum('evPublicRate', DEFAULT_PUBLIC_RATE) || DEFAULT_PUBLIC_RATE;

  if (battery <= 0 || range <= 0 || monthlyKm <= 0) return { haveInput: false };

  // Typical charge level (%). Owners usually stop near 80% for battery health, and it sets the
  // per-session cost/time. Monthly energy is km-based, so depth does NOT change the monthly cost.
  const depthPct = Math.min(100, Math.max(10, readNum('evDepth', 80) || 80));
  const depth = depthPct / 100;

  const loss = 1 + lossPct / 100;               // wall units = battery units × loss factor
  const wallPerFull = battery * loss;           // kWh drawn from the meter for a full 0→100%
  const wallPerSession = wallPerFull * depth;   // a typical top-up to `depthPct`
  const costPerCharge = wallPerSession * rate;  // cost of that session
  const evPerKm       = (wallPerFull * rate) / range;   // per-km uses full-battery energy (depth-independent)
  const kmPer100      = evPerKm > 0 ? 100 / evPerKm : 0; // km you travel on ₹100 of home charging
  const unitsPerMonth = (monthlyKm / range) * wallPerFull;
  const monthlyCost   = unitsPerMonth * rate;
  const chargesPerMonth = monthlyKm / range;

  const petrolPerKm  = petrol / mileage;
  const petrolMonthly = petrolPerKm * monthlyKm;
  const monthlySave  = petrolMonthly - monthlyCost;
  const yearlySave   = monthlySave * 12;
  const cheaperPct   = petrolMonthly > 0 ? Math.round((monthlySave / petrolMonthly) * 100) : 0;

  const publicPerKm  = (wallPerFull * pubRate) / range;
  const publicMonthly = publicPerKm * monthlyKm;

  // Time to reach the chosen charge level (approx; ignores end-of-charge taper).
  const slowHours    = (battery * depth) / SLOW_KW;
  const wallboxHours = (battery * depth) / WALLBOX_KW;

  const sel = $('evSelect');
  const evLabel = sel.value === 'custom'
    ? `${battery} kWh EV`
    : (EV_PRESETS.find(x => x.id === sel.value)?.label || 'EV');

  return {
    haveInput: true, evLabel, battery, range, monthlyKm, depthPct,
    wallPerSession, costPerCharge, evPerKm, kmPer100, unitsPerMonth, monthlyCost, chargesPerMonth,
    petrolPerKm, petrolMonthly, monthlySave, yearlySave, cheaperPct,
    publicPerKm, publicMonthly, slowHours, wallboxHours,
  };
}

// Monthly-cost comparison: three horizontal bars (EV home / public DC / petrol).
function renderBars(r) {
  const box = $('evBars');
  if (!box) return;
  const maxVal = Math.max(r.petrolMonthly, r.publicMonthly, r.monthlyCost) || 1;
  const bar = (cls, label, val) => {
    const w = Math.max(2, (val / maxVal) * 100);
    return `<div class="ev-bar-row">
      <span class="ev-bar-label">${label}</span>
      <span class="ev-bar-track"><span class="ev-bar-fill ${cls}" style="width:${w}%"></span></span>
      <span class="ev-bar-val">${rs(val)}</span>
    </div>`;
  };
  const L = {
    en: { home: 'EV · home', pub: 'EV · public DC', pet: 'Petrol' },
    hi: { home: 'EV · घर', pub: 'EV · पब्लिक DC', pet: 'पेट्रोल' },
  }[lang()];
  box.innerHTML = bar('ev-bar-home', L.home, r.monthlyCost)
    + bar('ev-bar-public', L.pub, r.publicMonthly)
    + bar('ev-bar-petrol', L.pet, r.petrolMonthly);
}

function render() {
  const r = calc();
  const empty = $('evEmpty'), result = $('evResult');
  if (!r.haveInput) { empty.hidden = false; result.hidden = true; return; }
  empty.hidden = true; result.hidden = false;
  lastResult = r;
  const S = EV_STR[lang()];

  $('evPerKmVal').textContent = '₹' + r.evPerKm.toFixed(2);
  $('evPetrolKmVal').textContent = '₹' + r.petrolPerKm.toFixed(2) + S.perKm;
  $('evCheaperPill').textContent = S.cheaper(r.cheaperPct);
  $('evCheaperPill').hidden = r.cheaperPct <= 0;

  $('evRCharge').textContent = rs(r.costPerCharge) + ' · ' + num(r.wallPerSession, 1) + ' kWh ' + S.toPct(r.depthPct);
  $('evRRange100').textContent = num(r.kmPer100) + ' km';
  $('evRUnits').textContent = num(r.unitsPerMonth) + S.unitsMo;
  $('evRMonthly').textContent = rs(r.monthlyCost) + S.perMo;
  $('evRPetrol').textContent = rs(r.petrolMonthly) + S.perMo;
  $('evRSaveMo').textContent = rs(r.monthlySave) + S.perMo;
  $('evRSaveYr').textContent = rs(r.yearlySave) + S.perYr;
  $('evRTime33').textContent = S.hrs(r.slowHours);
  $('evRTime72').textContent = S.hrs(r.wallboxHours);
  $('evRPublic').textContent = '₹' + r.publicPerKm.toFixed(2) + S.perKm;

  renderBars(r);
}

function init() {
  if (!$('evSelect')) return; // not on the EV page

  populatePresets();
  applyPreset();

  $('evSelect').addEventListener('change', () => { applyPreset(); render(); });
  // Charge-level slider: live % label + recompute.
  const depthLabel = () => { const v = $('evDepthVal'); if (v) v.textContent = ($('evDepth').value || 80) + '%'; };
  $('evDepth')?.addEventListener('input', () => { depthLabel(); render(); });
  depthLabel();
  ['evBattery', 'evRange', 'evKm', 'evRate', 'evLoss', 'evPetrol', 'evMileage', 'evPublicRate']
    .forEach(id => $(id)?.addEventListener('input', () => {
      // Editing battery/range detaches from the preset (it no longer matches).
      if ((id === 'evBattery' || id === 'evRange')) {
        const p = EV_PRESETS.find(x => x.id === $('evSelect').value);
        if (p && (readNum('evBattery') !== p.kwh || readNum('evRange') !== p.km)) $('evSelect').value = 'custom';
      }
      render();
    }));

  $('evShare')?.addEventListener('click', () => {
    if (!lastResult) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(EV_STR[lang()].shareText(lastResult)), '_blank', 'noopener');
  });

  // Language switched in place: rebuild the preset optgroups + dynamic strings.
  window.addEventListener('storage', () => { populatePresets(); render(); });
  document.getElementById('langMenu')?.addEventListener('click', () => setTimeout(() => { populatePresets(); render(); }, 0));

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
