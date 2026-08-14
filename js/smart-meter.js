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

// The readout is the only user-facing copy that lives in JS rather than in the page, so it
// carries its own translations. Keyed off <html lang>, which the generated twins already set.
const L10N = {
  hi: {
    step: (i, n) => `स्क्रीन ${i} / ${n}`,
    t: ['कुल ली गई सक्रिय ऊर्जा', 'प्रीपेड बैलेंस', 'ToD ज़ोन 1 की खपत', 'ToD ज़ोन 2 की खपत',
        'कुल आभासी ऊर्जा', 'अधिकतम डिमांड', 'मीटर की घड़ी', 'मीटर की तारीख'],
    w: [
      'मीटर लगने के बाद से आपके कनेक्शन ने कुल कितनी यूनिट ली — बिल इसी से बनता है। हर महीने एक ही तारीख को यह नोट कीजिए; दो रीडिंग का अंतर उस महीने की खपत है।',
      'मीटर में बचे पैसे। बाकी रजिस्टरों के उलट यह घटता है, और डिस्कॉम की तय सीमा से नीचे जाते ही कम-बैलेंस की चेतावनी जलती है।',
      'टाइम-ऑफ-डे टैरिफ में खपत समय-बैंड के हिसाब से बँटती है। ज़ोन 1 आम तौर पर सामान्य या ऑफ-पीक बैंड होता है। ज़ोन 1 और 2 मिलकर <code>1.8.0</code> बनते हैं।',
      'पीक बैंड, जिस पर दर ज़्यादा होती है। ज़ोन 1 के मुकाबले यह बड़ा हो तो गीज़र, वॉशिंग मशीन या पंप जैसे भारी लोड पीक घंटों के बाहर चलाना सबसे सस्ती बचत है।',
      'आभासी ऊर्जा हमेशा सक्रिय ऊर्जा के बराबर या उससे ज़्यादा होती है — यही अंतर आपका पावर फैक्टर है। जहाँ बिल kVAh पर बनता है, वहाँ kWh न बढ़ने पर भी खराब पावर फैक्टर बिल बढ़ा देता है।',
      'इस बिलिंग अवधि में किसी एक अंतराल में दर्ज हुआ सबसे ऊँचा औसत लोड। जहाँ डिमांड चार्ज लगता है वहाँ यही उसे तय करता है, और स्वीकृत लोड पार होने पर यही ट्रिप कराता है।',
      'टाइम-ऑफ-डे टैरिफ पर यह देखना ज़रूरी है। घड़ी आगे-पीछे हो तो खपत गलत समय-बैंड में दर्ज होती है और ऑफ-पीक यूनिट चुपचाप पीक दर पर चली जाती हैं।',
      'घड़ी के साथ मिलकर यह हर अंतराल की रीडिंग, हर टैम्पर घटना और हर रिचार्ज पर समय अंकित करता है — इसी से मीटर का अपना रिकॉर्ड विवाद में सबूत बनता है।'],
    btn: 'यहाँ दबाएँ →',
  },
  mr: {
    step: (i, n) => `स्क्रीन ${i} / ${n}`,
    t: ['एकूण घेतलेली सक्रिय ऊर्जा', 'प्रीपेड बॅलन्स', 'ToD झोन 1 चा वापर', 'ToD झोन 2 चा वापर',
        'एकूण आभासी ऊर्जा', 'कमाल डिमांड', 'मीटरचे घड्याळ', 'मीटरची तारीख'],
    w: [
      'मीटर बसल्यापासून तुमच्या कनेक्शनने घेतलेली एकूण युनिट — बिल याच्यावरून ठरते. दर महिन्याला एकाच तारखेला हे नोंदवा; दोन रीडिंगमधील फरक त्या महिन्याचा वापर.',
      'मीटरमध्ये शिल्लक पैसे. इतर रजिस्टरच्या उलट हे कमी होत जाते, आणि डिस्कॉमच्या मर्यादेखाली गेल्यावर कमी-बॅलन्सचा इशारा उजळतो.',
      'टाइम-ऑफ-डे दरात वापर वेळेच्या पट्ट्यांनुसार विभागला जातो. झोन 1 सहसा सामान्य किंवा ऑफ-पीक पट्टा असतो. झोन 1 आणि 2 मिळून <code>1.8.0</code> होतो.',
      'पीक पट्टा, जिथे दर जास्त असतो. झोन 1 च्या तुलनेत हा मोठा असेल तर गिझर, वॉशिंग मशीन किंवा पंपासारखे मोठे लोड पीकच्या बाहेर चालवणे हीच सर्वात स्वस्त बचत.',
      'आभासी ऊर्जा नेहमी सक्रिय ऊर्जेइतकी किंवा जास्त असते — हाच फरक म्हणजे पॉवर फॅक्टर. जिथे बिल kVAh वर होते तिथे kWh न वाढताही खराब पॉवर फॅक्टर बिल वाढवतो.',
      'या बिलिंग कालावधीत एका अंतरात नोंदलेला सर्वाधिक सरासरी लोड. जिथे डिमांड चार्ज असतो तिथे तोच ठरवतो, आणि मंजूर लोड ओलांडल्यास हाच ट्रिप करवतो.',
      'टाइम-ऑफ-डे दरावर हे तपासणे महत्त्वाचे. घड्याळ मागेपुढे असल्यास वापर चुकीच्या वेळेच्या पट्ट्यात नोंदला जातो आणि ऑफ-पीक युनिट गुपचूप पीक दरात जातात.',
      'घड्याळासोबत हे प्रत्येक अंतराचे रीडिंग, प्रत्येक टॅम्पर घटना आणि प्रत्येक रिचार्जवर वेळ नोंदवते — त्यामुळेच मीटरची स्वतःची नोंद वादात पुरावा ठरते.'],
    btn: 'येथे दाबा →',
  },
  ta: {
    step: (i, n) => `திரை ${i} / ${n}`,
    t: ['மொத்த இறக்குமதி ஆற்றல்', 'ப்ரீபெய்டு பேலன்ஸ்', 'ToD மண்டலம் 1 நுகர்வு', 'ToD மண்டலம் 2 நுகர்வு',
        'மொத்த தோற்ற ஆற்றல்', 'அதிகபட்ச டிமாண்ட்', 'மீட்டர் கடிகாரம்', 'மீட்டர் தேதி'],
    w: [
      'மீட்டர் நிறுவப்பட்டதிலிருந்து உங்கள் இணைப்பு எடுத்த மொத்த யூனிட் — பில் இதிலிருந்தே. ஒவ்வொரு மாதமும் ஒரே தேதியில் குறியுங்கள்; இரண்டு ரீடிங் வித்தியாசமே அம்மாத நுகர்வு.',
      'மீட்டரில் மீதமுள்ள பணம். மற்ற ரெஜிஸ்டர்களுக்கு மாறாக இது குறைந்துகொண்டே வரும், DISCOM வரம்புக்குக் கீழே சென்றால் குறைந்த-பேலன்ஸ் எச்சரிக்கை எரியும்.',
      'நேர அடிப்படை கட்டணத்தில் நுகர்வு நேரப் பிரிவாகப் பிரிக்கப்படும். மண்டலம் 1 பொதுவாக வழக்கமான அல்லது ஆஃப்-பீக் பிரிவு. மண்டலம் 1-ம் 2-ம் சேர்ந்தே <code>1.8.0</code>.',
      'கட்டணம் அதிகமான பீக் பிரிவு. மண்டலம் 1-ஐவிட இது பெரிதாக இருந்தால், கீசர், சலவை இயந்திரம், பம்பு போன்ற பெரிய லோடுகளை பீக் நேரத்துக்கு வெளியே இயக்குவதே மலிவான சேமிப்பு.',
      'தோற்ற ஆற்றல் எப்போதும் செயல் ஆற்றலுக்குச் சமமாகவோ அதிகமாகவோ இருக்கும் — அந்த வித்தியாசமே பவர் ஃபேக்டர். kVAh அடிப்படையில் பில் வரும் இடத்தில், kWh மாறாவிட்டாலும் மோசமான பவர் ஃபேக்டர் பில்லை உயர்த்தும்.',
      'இந்தப் பில்லிங் காலத்தில் ஒரு இடைவெளியில் பதிவான அதிகபட்ச சராசரி லோட். டிமாண்ட் கட்டணம் உள்ள இடத்தில் இதுவே அதை நிர்ணயிக்கும், அனுமதிக்கப்பட்ட லோட்டைத் தாண்டினால் இதுவே டிரிப் செய்யும்.',
      'நேர அடிப்படை கட்டணத்தில் இதைப் பார்ப்பது முக்கியம். கடிகாரம் விலகினால் நுகர்வு தவறான நேரப் பிரிவில் பதிவாகி, ஆஃப்-பீக் யூனிட்கள் அமைதியாக பீக் கட்டணத்துக்கு நகரும்.',
      'கடிகாரத்துடன் சேர்ந்து இது ஒவ்வொரு இடைவெளி ரீடிங், ஒவ்வொரு டேம்பர் நிகழ்வு, ஒவ்வொரு ரீசார்ஜுக்கும் நேரம் பதிக்கும் — அதனாலேயே மீட்டரின் பதிவு தகராறில் ஆதாரமாகும்.'],
    btn: 'இங்கே அழுத்தவும் →',
  },
};

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
  let audioCtx = null;

  const lx = L10N[document.documentElement.lang] || null;
  if (lx && next) next.textContent = lx.btn;

  function playClick() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx ||= new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.035);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function render() {
    const s = SCREENS[i];
    val.innerHTML = segmentsFor(s.value);
    code.textContent = s.code;
    unit.textContent = s.unit;
    step.textContent = lx ? lx.step(i + 1, SCREENS.length) : `Screen ${i + 1} of ${SCREENS.length}`;
    title.textContent = lx ? lx.t[i] : s.title;
    why.innerHTML = (lx ? lx.w[i] : s.why).replace(/\s+/g, ' ').trim();

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
    playClick();
    i = (i + 1) % SCREENS.length;
    // The attention ring has done its job the moment it is used once.
    svg.classList.add('has-pressed');
    render();
  }

  // Revealed only once the module is actually running. Without JS the readout would be an
  // empty box explaining a control that does nothing, which is worse than not showing it —
  // the diagram and the legend still carry the whole page without any of this.
  const readout = document.getElementById('mReadout');
  if (readout) readout.classList.add('is-ready');

  btn.addEventListener('click', advance);
  svg.querySelector('.m-hint-tag')?.addEventListener('click', advance);
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
