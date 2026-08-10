// smart-meter.js — drives the interactive meter diagram on /smart-meter/.
//
// A real prepaid meter shows one number at a time and cycles on a button press, with no
// label anywhere on the device explaining which quantity you are looking at. That is the
// single most common reason people misread their own meter. This makes the drawn meter
// behave like the real one, and adds the explanation the real one is missing.
//
// The figures are internally consistent on purpose: the two ToD registers sum to the total
// (3180.2 + 1732.4 = 4912.6), and apparent energy exceeds active energy, as it must on any
// connection with a power factor below 1. A reader who checks the arithmetic should find it
// holds.

const SCREENS = [
  {
    code: '1.8.0', unit: 'kWh', value: '04912.6',
    title: 'Total active energy imported',
    why: `The cumulative units your connection has drawn since the meter was installed. This is the
          figure your bill is built from — note it on the same date each month and the difference
          between two readings is that month's consumption.`,
  },
  {
    code: 'Bal', unit: '₹', value: '0248.50',
    title: 'Prepaid balance',
    why: `Money left on the meter. Unlike the energy registers this one counts down, and the low
          balance warning lights when it drops under your DISCOM's threshold. The label varies by
          make — <code>Bal</code>, <code>Cr</code>, or just a figure with the ₹ sign.`,
  },
  {
    code: '1.8.1', unit: 'kWh', value: '03180.2',
    title: 'Energy used in ToD zone 1',
    why: `On a time-of-day tariff, consumption is split by time band. Zone 1 is normally the
          off-peak or normal band. Zones 1 and 2 add up to the <code>1.8.0</code> total.`,
  },
  {
    code: '1.8.2', unit: 'kWh', value: '01732.4',
    title: 'Energy used in ToD zone 2',
    why: `The peak band, charged at a higher rate. If this register is large relative to zone 1,
          shifting heavy loads — geyser, washing machine, pump — outside peak hours is the single
          cheapest saving available to you.`,
  },
  {
    code: '9.8.0', unit: 'kVAh', value: '05104.8',
    title: 'Total apparent energy',
    why: `Apparent energy is always at or above active energy — the gap is your power factor. Where
          the DISCOM bills on kVAh, this is the register you are charged on, so a poor power factor
          raises the bill even when the kWh figure has not moved.`,
  },
  {
    code: '1.6.0', unit: 'kW', value: '0002.84',
    title: 'Maximum demand',
    why: `The highest average load recorded in any single interval this billing period. It sets the
          demand charge on connections that carry one, and it is what trips a load-limit
          disconnection when it passes your sanctioned load.`,
  },
  {
    code: '0.9.1', unit: '', value: '19:42:05',
    title: 'Meter clock',
    why: `Worth checking on a time-of-day tariff. A meter whose clock has drifted files consumption
          into the wrong time band, which quietly moves off-peak units into the peak rate.`,
  },
  {
    code: '0.9.2', unit: '', value: '10-08-26',
    title: 'Meter date',
    why: `Used with the clock to timestamp every interval reading, every tamper event and every
          recharge, which is what makes the meter's own log usable as evidence in a dispute.`,
  },
];

export function initSmartMeter() {
  const svg = document.querySelector('.meter-svg');
  const btn = document.getElementById('mBtn');
  if (!svg || !btn) return;

  const val = document.getElementById('mVal');
  const code = document.getElementById('mCode');
  const unit = document.getElementById('mUnit');
  const step = document.getElementById('mStep');
  const title = document.getElementById('mTitle');
  const why = document.getElementById('mWhy');
  const next = document.getElementById('mNext');
  const lampCom = document.getElementById('mLampCom');
  if (!val || !code || !unit || !step || !title || !why) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;

  function render() {
    const s = SCREENS[i];
    val.textContent = s.value;
    code.textContent = s.code;
    unit.textContent = s.unit;
    step.textContent = `Screen ${i + 1} of ${SCREENS.length}`;
    title.textContent = s.title;
    why.innerHTML = s.why.replace(/\s+/g, ' ').trim();

    // An LCD does not fade between screens; it changes in one frame. A very short flash of
    // the glass reads as "the display just switched" without pretending to be an animation.
    if (!reduced) {
      svg.classList.remove('is-switching');
      void svg.offsetWidth;                     // restart the animation
      svg.classList.add('is-switching');
    }
    // The COM lamp blinks on a press because that is what a real one does: pressing the
    // button wakes the meter and it reports in.
    if (lampCom && !reduced) {
      lampCom.classList.remove('is-blink');
      void lampCom.getBoundingClientRect();
      lampCom.classList.add('is-blink');
    }
  }

  function advance() {
    i = (i + 1) % SCREENS.length;
    render();
  }

  btn.addEventListener('click', advance);
  btn.addEventListener('keydown', (e) => {
    // A real <button> fires click on both keys; an SVG <g> with role=button does not.
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); advance(); }
  });
  if (next) next.addEventListener('click', advance);

  render();
}
