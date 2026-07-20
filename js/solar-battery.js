// solar-battery.js — Solar Battery Backup Calculator (/solar-battery-backup-calculator/).
// Tap-friendly inputs: AC tonnage + star rating as chips, other load and backup
// hours as +/- steppers. Sizes the battery bank (kWh + Ah) for LiFePO4 and
// lead-acid side by side, with ballpark 2026 India costs. Self-contained.

const INVERTER_EFF = 0.90;
const DOD_LFP = 0.80;   // usable depth of discharge, LiFePO4
const DOD_LA  = 0.50;   // usable depth of discharge, flooded lead-acid

// Average running input power (watts) at part load — capacity ÷ typical ISEER.
const AC_WATTS = {
  '0.8': { 3: 720,  5: 600  },
  '1':   { 3: 900,  5: 745  },
  '1.5': { 3: 1345, 5: 1115 },
  '2':   { 3: 1795, 5: 1490 },
};

const $ = (id) => document.getElementById(id);
const rs = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const num = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// Round a bank up to the next practical increment (0.5 kWh) — you buy whole batteries.
const bank = (kWh) => Math.ceil(kWh * 2) / 2;

const chipVal = (boxId) => $(boxId).querySelector('.psz-chip-btn.is-active').dataset.val;

function calc() {
  const ton = chipVal('sbbTonChips');
  const star = Number(chipVal('sbbStarChips'));
  const acW = ton === '0' ? 0 : AC_WATTS[ton][star];
  const extraW = parseFloat($('sbbExtra').dataset.val) || 0;
  const hours = parseFloat($('sbbHours').dataset.val) || 0;

  const loadW = acW + extraW;
  if (loadW <= 0 || hours <= 0) return { haveInput: false };

  const energyKwh = (loadW * hours) / 1000 / INVERTER_EFF;
  const lfpKwh = bank(energyKwh / DOD_LFP);
  const laKwh  = bank(energyKwh / DOD_LA);

  const volt = Number($('sbbVolt').value) || 48;
  const lfpAh = Math.round(lfpKwh * 1000 / volt);
  const laAh  = Math.round(laKwh  * 1000 / volt);

  const lfpCost = lfpKwh * (parseFloat($('sbbLfpPrice').value) || 26000);
  const laCost  = laKwh  * (parseFloat($('sbbLaPrice').value)  || 11000);

  return { haveInput: true, acW, extraW, loadW, hours, energyKwh, lfpKwh, laKwh, lfpAh, laAh, lfpCost, laCost, volt };
}

function verdict(r) {
  const premium = r.lfpCost - r.laCost;
  // LiFePO4 ~3000 cycles vs lead-acid ~700: per-cycle cost decides the honest answer.
  const lfpPerCycle = r.lfpCost / 3000, laPerCycle = r.laCost / 700;
  if (lfpPerCycle <= laPerCycle) {
    return `For daily overnight use, LiFePO4 wins despite costing ${rs(premium)} more upfront: `
      + `~${rs(lfpPerCycle)} per backup night vs ~${rs(laPerCycle)} for lead-acid over their rated cycle lives, `
      + `and the bank is roughly half the size and weight.`;
  }
  return `If power cuts are rare where you live, the cheaper lead-acid bank is defensible — `
    + `but for regular use LiFePO4's ~3,000 cycles vs ~700 usually repays the ${rs(premium)} premium.`;
}

function render() {
  const r = calc();
  $('sbbEmpty').hidden = r.haveInput;
  $('sbbResult').hidden = !r.haveInput;
  if (!r.haveInput) return;

  $('sbbEnergy').textContent = num(r.energyKwh, 1);
  $('sbbLoad').textContent = num(r.loadW) + ' W for ' + num(r.hours) + ' hrs';
  $('sbbLoadNote').textContent = r.acW
    ? `AC average draw ${num(r.acW)} W (BEE part-load, not nameplate) + ${num(r.extraW)} W other load, incl. 90% inverter efficiency.`
    : `${num(r.extraW)} W of load through a 90%-efficient inverter.`;

  $('sbbLfpSize').textContent = num(r.lfpKwh, 1) + ' kWh';
  $('sbbLfpAh').textContent = num(r.lfpAh) + ' Ah @ ' + r.volt + ' V';
  $('sbbLfpCost').textContent = rs(r.lfpCost);
  $('sbbLaSize').textContent = num(r.laKwh, 1) + ' kWh';
  $('sbbLaAh').textContent = num(r.laAh) + ' Ah @ ' + r.volt + ' V';
  $('sbbLaCost').textContent = rs(r.laCost);
  $('sbbPremium').textContent = rs(r.lfpCost - r.laCost);
  $('sbbVerdict').textContent = verdict(r);
}

function init() {
  if (!$('sbbTonChips')) return; // not on this page

  // Chip groups: one active per group.
  ['sbbTonChips', 'sbbStarChips'].forEach(boxId => {
    $(boxId).addEventListener('click', (e) => {
      const c = e.target.closest('.psz-chip-btn');
      if (!c) return;
      $(boxId).querySelectorAll('.psz-chip-btn').forEach(b => b.classList.remove('is-active'));
      c.classList.add('is-active');
      render();
    });
  });

  // Steppers: value lives in data-val; label shows value + unit.
  const steppers = { sbbExtra: { step: 50, min: 0, max: 3000, unit: ' W' }, sbbHours: { step: 1, min: 1, max: 24, unit: ' h' } };
  Object.entries(steppers).forEach(([id, cfg]) => {
    $(id).addEventListener('click', (e) => {
      const b = e.target.closest('.psz-step-btn');
      if (!b) return;
      const el = $(id);
      const v = Math.min(cfg.max, Math.max(cfg.min, parseFloat(el.dataset.val) + Number(b.dataset.d) * cfg.step));
      el.dataset.val = v;
      el.querySelector('.psz-step-val').textContent = num(v) + cfg.unit;
      render();
    });
  });

  ['sbbLfpPrice', 'sbbLaPrice', 'sbbVolt'].forEach(id => {
    $(id).addEventListener('input', render);
    $(id).addEventListener('change', render);
  });

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
