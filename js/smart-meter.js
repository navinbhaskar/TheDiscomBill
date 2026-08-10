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

// ── seven-segment renderer ────────────────────────────────────────────────────
// A segment LCD does not draw glyphs, it lights bars — which is why a bold sans
// font never quite passes as a meter display. Each character is drawn from the
// same seven mitred bars a real one has, and the unlit bars stay faintly visible
// underneath, because on a real LCD they do.
//
// Geometry lives here alone. scripts/meter-digits.mjs imports this same function
// to stamp the initial screen into the page, so the static markup and the live
// re-render can never drift apart.
const SEG = {
  '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
  '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
  '-': 'g', ' ': '',
};
const CELL_W = 17, CELL_H = 30, GAP = 3.5, T = 3.4, NARROW = 9;

// Mitred bars: the angled ends are what make a segment display look like one.
function hBar(x1, x2, y) {
  const h = T / 2;
  return `${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h} ${x1},${y}`;
}
function vBar(x, y1, y2) {
  const h = T / 2;
  return `${x - h},${y1 + h} ${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h}`;
}

function cellPolys(ch, ox, oy) {
  const L = ox + T / 2, R = ox + CELL_W - T / 2;
  const TOP = oy + T / 2, MID = oy + CELL_H / 2, BOT = oy + CELL_H - T / 2;
  const bars = {
    a: hBar(L, R, TOP), g: hBar(L, R, MID), d: hBar(L, R, BOT),
    f: vBar(L, TOP, MID), b: vBar(R, TOP, MID),
    e: vBar(L, MID, BOT), c: vBar(R, MID, BOT),
  };
  const on = SEG[ch] ?? '';
  return Object.entries(bars).map(([k, pts]) =>
    `<polygon class="${on.includes(k) ? 'sg-on' : 'sg-off'}" points="${pts}"/>`).join('');
}

// Advance width per character: separators are narrow, as they are on real glass.
const isNarrow = (ch) => ch === '.' || ch === ':';
const advance = (ch) => (isNarrow(ch) ? NARROW : CELL_W) + GAP;

/** Render `text` as seven-segment SVG, right-aligned to `right`, baseline top at `top`. */
export function segmentsFor(text, { right = 452, top = 246 } = {}) {
  const chars = [...String(text)];
  const width = chars.reduce((w, ch) => w + advance(ch), 0) - GAP;
  let x = right - width;
  let out = '';
  for (const ch of chars) {
    if (ch === '.') {
      out += `<rect class="sg-on" x="${(x + 1).toFixed(1)}" y="${(top + CELL_H - T).toFixed(1)}" width="${T}" height="${T}"/>`;
    } else if (ch === ':') {
      out += `<rect class="sg-on" x="${(x + 1).toFixed(1)}" y="${(top + CELL_H * 0.3).toFixed(1)}" width="${T}" height="${T}"/>`
           + `<rect class="sg-on" x="${(x + 1).toFixed(1)}" y="${(top + CELL_H * 0.68).toFixed(1)}" width="${T}" height="${T}"/>`;
    } else {
      out += cellPolys(ch, x, top);
    }
    x += advance(ch);
  }
  return out;
}

export function initSmartMeter() {
  const svg = document.querySelector('.meter-svg');
  const btn = document.getElementById('mBtn');
  if (!svg || !btn) return;

  const val = document.getElementById('mSeg');
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
    val.innerHTML = segmentsFor(s.value);
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
    // The attention ring has done its job the moment it is used once.
    svg.classList.add('has-pressed');
    render();
  }

  btn.addEventListener('click', advance);
  // The glass is where the eye already is, so it advances too. Pointer-only: the button
  // above carries the semantics and the keyboard path, and a second focusable control
  // announcing the same action would just be noise on a screen reader.
  svg.querySelectorAll('.m-lcd, .m-lcd-frame').forEach((el) => el.addEventListener('click', advance));
  btn.addEventListener('keydown', (e) => {
    // A real <button> fires click on both keys; an SVG <g> with role=button does not.
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); advance(); }
  });
  if (next) next.addEventListener('click', advance);

  render();
}
