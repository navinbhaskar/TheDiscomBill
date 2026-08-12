// smart-meter-svg.js — the meter diagram, shared by every language twin.
//
// The markings on the casing stay in English on purpose: they are what is printed on a real
// Indian meter, and translating them would make the diagram less accurate, not more useful.
// Only the callout legend and the surrounding prose are translated.
//
// The seven-segment digits inside <g id="mSeg"> are stamped by scripts/meter-digits.mjs from
// the same segmentsFor() the runtime uses. Regenerate with: node scripts/meter-digits.mjs
// The device on its own. /understand-your-bill/ renders this and supplies its own callouts,
// numbered to match the bill beside it — so one number means one thing across both drawings.
// Keeping it as the same string the guide uses is the point: the two pages cannot drift.
export const METER_DEVICE = String.raw`<svg class="meter-svg" viewBox="0 0 700 560" role="img"
     aria-labelledby="meter-dia-title meter-dia-desc">
  <title id="meter-dia-title">Labelled diagram of an Indian single-phase prepaid smart meter</title>
  <desc id="meter-dia-desc">A single-phase AC static watthour smart meter seen face on. The
  upper casing carries a maker's mark, COM and ON indicator lamps and the communication
  module details. The lower face carries a green backlit LCD in the centre showing a status
  icon row, the main reading, a register code and a unit label; a pulse LED and standard
  markings below it; a serial barcode and printed specification block on the left; and a
  scroll button with a circular optical port on the right. A dark terminal block with brass
  screws runs along the bottom. Twelve numbered callouts key each element to the legend below.</desc>

  <defs>
    <linearGradient id="mBody" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#fbfaf6"/><stop offset="0.5" stop-color="#f1efe8"/>
      <stop offset="1" stop-color="#dedbd2"/>
    </linearGradient>
    <linearGradient id="mBodyTop" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="#fdfdfa"/><stop offset="1" stop-color="#e7e4dc"/>
    </linearGradient>
    <linearGradient id="mLcd" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#b6e86a"/><stop offset="0.55" stop-color="#8ed23a"/>
      <stop offset="1" stop-color="#6fb823"/>
    </linearGradient>
    <linearGradient id="mGloss" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="mPortMetal" cx="0.32" cy="0.26" r="0.9">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#d6d9dd"/>
      <stop offset="0.7" stop-color="#9aa0a7"/><stop offset="1" stop-color="#c9ced4"/>
    </radialGradient>
    <linearGradient id="mTerm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a4a4a"/><stop offset="0.5" stop-color="#2e2e2e"/>
      <stop offset="1" stop-color="#3d3d3d"/>
    </linearGradient>
    <radialGradient id="mBrass" cx="0.35" cy="0.3" r="0.85">
      <stop offset="0" stop-color="#e8d089"/><stop offset="0.6" stop-color="#b8963f"/>
      <stop offset="1" stop-color="#7d6427"/>
    </radialGradient>
    <radialGradient id="mLedOn" cx="0.35" cy="0.3" r="0.85">
      <stop offset="0" stop-color="#ff9a9a"/><stop offset="0.45" stop-color="#e01b1b"/>
      <stop offset="1" stop-color="#7a1010"/>
    </radialGradient>
    <radialGradient id="mLedOff" cx="0.35" cy="0.3" r="0.85">
      <stop offset="0" stop-color="#f2f1ee"/><stop offset="1" stop-color="#c3c1ba"/>
    </radialGradient>
    <radialGradient id="mScrew" cx="0.35" cy="0.3" r="0.85">
      <stop offset="0" stop-color="#f0eee9"/><stop offset="1" stop-color="#a9a69e"/>
    </radialGradient>
    <filter id="mShadow" x="-15%" y="-10%" width="130%" height="128%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0b1020" flood-opacity="0.3"/>
    </filter>
    <filter id="mGlowLcd" x="-25%" y="-40%" width="150%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#8ed23a" flood-opacity="0.5"/>
    </filter>
    <filter id="mGlowLed" x="-160%" y="-160%" width="420%" height="420%">
      <feDropShadow dx="0" dy="0" stdDeviation="3.6" flood-color="#ff2d2d" flood-opacity="0.9"/>
    </filter>
    <clipPath id="mLcdClip"><rect x="292" y="220" width="168" height="78" rx="3"/></clipPath>
  </defs>

  <g filter="url(#mShadow)">
    <!-- mounting flanges behind the casing, top and bottom -->
    <path class="m-flange" d="M148 62h404v32H148zM148 424h404v30H148z"/>
    <circle class="m-flange-hole" cx="164" cy="78" r="5"/>
    <circle class="m-flange-hole" cx="536" cy="78" r="5"/>

    <!-- upper casing -->
    <rect class="m-case-top" x="172" y="40" width="356" height="146" rx="10"/>
    <g class="m-screw-sm">
      <circle cx="190" cy="58" r="6"/><circle cx="510" cy="58" r="6"/>
      <circle cx="190" cy="168" r="6"/><circle cx="510" cy="168" r="6"/>
    </g>
    <!-- neutral maker's mark: this is a dummy device, so it carries no real brand -->
    <g class="m-mark" transform="translate(200 92)">
      <path d="M0 0h14a14 14 0 0 1 0 28H7v12H0z"/>
      <path class="m-mark-cut" d="M7 7h7a7 7 0 0 1 0 14H7z"/>
    </g>
    <text class="m-maker" x="200" y="164">SMART METER</text>
    <!-- COM / ON lamps -->
    <text class="m-lamp-lbl" x="356" y="88">COM</text>
    <text class="m-lamp-lbl" x="414" y="88">ON</text>
    <path class="m-lamp-tick" d="M356 92v7M414 92v7"/>
    <circle class="m-lamp-on" id="mLampCom" cx="349" cy="110" r="6"/>
    <circle class="m-lamp-off" cx="371" cy="110" r="6"/>
    <circle class="m-lamp-on" cx="407" cy="110" r="6"/>
    <circle class="m-lamp-off" cx="429" cy="110" r="6"/>
    <text class="m-spec" x="342" y="142">Comm. Tech.: NAN (865-867 MHz)</text>
    <text class="m-spec" x="342" y="156">Communication Module: Plug-in</text>

    <!-- lower casing -->
    <rect class="m-case" x="172" y="186" width="356" height="254" rx="10"/>
    <text class="m-title" x="350" y="203">AC STATIC WATTHOUR SMART METER</text>

    <!-- LCD -->
    <rect class="m-lcd-frame" x="286" y="214" width="180" height="90" rx="5"/>
    <rect class="m-lcd" x="292" y="220" width="168" height="78" rx="3" filter="url(#mGlowLcd)"/>
    <g clip-path="url(#mLcdClip)">
      <g class="m-ico">
        <g transform="translate(300 226)">
          <rect x="0" y="7" width="2.4" height="4"/><rect x="3.6" y="4.8" width="2.4" height="6.2"/>
          <rect x="7.2" y="2.4" width="2.4" height="8.6"/><rect x="10.8" y="0" width="2.4" height="11"/>
        </g>
        <g transform="translate(332 226)" class="m-ico-warn">
          <path d="M1.6 10.4V4.8a4.8 4.8 0 0 1 9.6 0v5.6" fill="none" stroke-width="2.4"/>
          <rect x="0.4" y="9.6" width="4" height="2.4"/><rect x="8.4" y="9.6" width="4" height="2.4"/>
        </g>
        <g transform="translate(364 226)">
          <circle cx="6.4" cy="6" r="5.6" fill="none" stroke-width="1.9"/>
          <path d="M6.4 1.2v5.6" fill="none" stroke-width="1.9" stroke-linecap="round"/>
        </g>
        <g transform="translate(396 225)" class="m-ico-warn">
          <path d="M7.2 0 14.4 12.8H0z" fill="none" stroke-width="1.9" stroke-linejoin="round"/>
          <path d="M7.2 4.8v4" stroke-width="1.9" stroke-linecap="round"/>
          <circle cx="7.2" cy="10.7" r="1" stroke="none"/>
        </g>
      </g>
      <!-- the unlit segments of an LCD stay faintly visible; that ghost is most of what
           makes a real display read as a display rather than as printed text -->
      <!-- Seven-segment digits. Markup is stamped by scripts/meter-digits.mjs from the
           same segmentsFor() the runtime uses, so a no-JS visitor sees a real display too.
           Regenerate with: node scripts/meter-digits.mjs -->
      <g class="m-seg" id="mSeg"><polygon class="sg-on" points="323.4,246 333.6,246 335.3,247.7 333.6,249.39999999999998 323.4,249.39999999999998 321.7,247.7"/><polygon class="sg-off" points="323.4,259.3 333.6,259.3 335.3,261 333.6,262.7 323.4,262.7 321.7,261"/><polygon class="sg-on" points="323.4,272.6 333.6,272.6 335.3,274.3 333.6,276 323.4,276 321.7,274.3"/><polygon class="sg-on" points="320,249.39999999999998 321.7,247.7 323.4,249.39999999999998 323.4,259.3 321.7,261 320,259.3"/><polygon class="sg-on" points="333.6,249.39999999999998 335.3,247.7 337,249.39999999999998 337,259.3 335.3,261 333.6,259.3"/><polygon class="sg-on" points="320,262.7 321.7,261 323.4,262.7 323.4,272.6 321.7,274.3 320,272.6"/><polygon class="sg-on" points="333.6,262.7 335.3,261 337,262.7 337,272.6 335.3,274.3 333.6,272.6"/><polygon class="sg-off" points="343.9,246 354.1,246 355.8,247.7 354.1,249.39999999999998 343.9,249.39999999999998 342.2,247.7"/><polygon class="sg-on" points="343.9,259.3 354.1,259.3 355.8,261 354.1,262.7 343.9,262.7 342.2,261"/><polygon class="sg-off" points="343.9,272.6 354.1,272.6 355.8,274.3 354.1,276 343.9,276 342.2,274.3"/><polygon class="sg-on" points="340.5,249.39999999999998 342.2,247.7 343.9,249.39999999999998 343.9,259.3 342.2,261 340.5,259.3"/><polygon class="sg-on" points="354.1,249.39999999999998 355.8,247.7 357.5,249.39999999999998 357.5,259.3 355.8,261 354.1,259.3"/><polygon class="sg-off" points="340.5,262.7 342.2,261 343.9,262.7 343.9,272.6 342.2,274.3 340.5,272.6"/><polygon class="sg-on" points="354.1,262.7 355.8,261 357.5,262.7 357.5,272.6 355.8,274.3 354.1,272.6"/><polygon class="sg-on" points="364.4,246 374.6,246 376.3,247.7 374.6,249.39999999999998 364.4,249.39999999999998 362.7,247.7"/><polygon class="sg-on" points="364.4,259.3 374.6,259.3 376.3,261 374.6,262.7 364.4,262.7 362.7,261"/><polygon class="sg-on" points="364.4,272.6 374.6,272.6 376.3,274.3 374.6,276 364.4,276 362.7,274.3"/><polygon class="sg-on" points="361,249.39999999999998 362.7,247.7 364.4,249.39999999999998 364.4,259.3 362.7,261 361,259.3"/><polygon class="sg-on" points="374.6,249.39999999999998 376.3,247.7 378,249.39999999999998 378,259.3 376.3,261 374.6,259.3"/><polygon class="sg-off" points="361,262.7 362.7,261 364.4,262.7 364.4,272.6 362.7,274.3 361,272.6"/><polygon class="sg-on" points="374.6,262.7 376.3,261 378,262.7 378,272.6 376.3,274.3 374.6,272.6"/><polygon class="sg-off" points="384.9,246 395.1,246 396.8,247.7 395.1,249.39999999999998 384.9,249.39999999999998 383.2,247.7"/><polygon class="sg-off" points="384.9,259.3 395.1,259.3 396.8,261 395.1,262.7 384.9,262.7 383.2,261"/><polygon class="sg-off" points="384.9,272.6 395.1,272.6 396.8,274.3 395.1,276 384.9,276 383.2,274.3"/><polygon class="sg-off" points="381.5,249.39999999999998 383.2,247.7 384.9,249.39999999999998 384.9,259.3 383.2,261 381.5,259.3"/><polygon class="sg-on" points="395.1,249.39999999999998 396.8,247.7 398.5,249.39999999999998 398.5,259.3 396.8,261 395.1,259.3"/><polygon class="sg-off" points="381.5,262.7 383.2,261 384.9,262.7 384.9,272.6 383.2,274.3 381.5,272.6"/><polygon class="sg-on" points="395.1,262.7 396.8,261 398.5,262.7 398.5,272.6 396.8,274.3 395.1,272.6"/><polygon class="sg-on" points="405.4,246 415.6,246 417.3,247.7 415.6,249.39999999999998 405.4,249.39999999999998 403.7,247.7"/><polygon class="sg-on" points="405.4,259.3 415.6,259.3 417.3,261 415.6,262.7 405.4,262.7 403.7,261"/><polygon class="sg-on" points="405.4,272.6 415.6,272.6 417.3,274.3 415.6,276 405.4,276 403.7,274.3"/><polygon class="sg-off" points="402,249.39999999999998 403.7,247.7 405.4,249.39999999999998 405.4,259.3 403.7,261 402,259.3"/><polygon class="sg-on" points="415.6,249.39999999999998 417.3,247.7 419,249.39999999999998 419,259.3 417.3,261 415.6,259.3"/><polygon class="sg-on" points="402,262.7 403.7,261 405.4,262.7 405.4,272.6 403.7,274.3 402,272.6"/><polygon class="sg-off" points="415.6,262.7 417.3,261 419,262.7 419,272.6 417.3,274.3 415.6,272.6"/><rect class="sg-on" x="423.5" y="272.6" width="3.4" height="3.4"/><polygon class="sg-on" points="438.4,246 448.6,246 450.3,247.7 448.6,249.39999999999998 438.4,249.39999999999998 436.7,247.7"/><polygon class="sg-on" points="438.4,259.3 448.6,259.3 450.3,261 448.6,262.7 438.4,262.7 436.7,261"/><polygon class="sg-on" points="438.4,272.6 448.6,272.6 450.3,274.3 448.6,276 438.4,276 436.7,274.3"/><polygon class="sg-on" points="435,249.39999999999998 436.7,247.7 438.4,249.39999999999998 438.4,259.3 436.7,261 435,259.3"/><polygon class="sg-off" points="448.6,249.39999999999998 450.3,247.7 452,249.39999999999998 452,259.3 450.3,261 448.6,259.3"/><polygon class="sg-on" points="435,262.7 436.7,261 438.4,262.7 438.4,272.6 436.7,274.3 435,272.6"/><polygon class="sg-on" points="448.6,262.7 450.3,261 452,262.7 452,272.6 450.3,274.3 448.6,272.6"/></g>
      <text class="m-code" id="mCode" x="300" y="292">1.8.0</text>
      <text class="m-unit" id="mUnit" x="452" y="292">kWh</text>
    </g>
    <path class="m-gloss" d="M292 220h168v28l-168 32z"/>

    <!-- pulse LED and standard markings -->
    <circle class="m-led-pulse" cx="298" cy="326" r="5.5" filter="url(#mGlowLed)"/>
    <text class="m-print" x="310" y="330">kWh — 3200 Imp/Unit</text>
    <text class="m-print" x="292" y="352">IS 16444 (Part 1)</text>
    <text class="m-print m-print-sm" x="292" y="364">CM/L-8400169811</text>

    <!-- serial barcode + printed specification block -->
    <g class="m-bars" transform="translate(186 340)">
      <rect x="0" y="0" width="2.2" height="22"/><rect x="4.4" y="0" width="1.1" height="22"/>
      <rect x="7.7" y="0" width="3.3" height="22"/><rect x="13.2" y="0" width="1.1" height="22"/>
      <rect x="16.5" y="0" width="2.2" height="22"/><rect x="22" y="0" width="1.1" height="22"/>
      <rect x="25.3" y="0" width="1.1" height="22"/><rect x="28.6" y="0" width="3.3" height="22"/>
      <rect x="34.1" y="0" width="1.1" height="22"/><rect x="37.4" y="0" width="2.2" height="22"/>
      <rect x="42.9" y="0" width="3.3" height="22"/><rect x="48.4" y="0" width="1.1" height="22"/>
      <rect x="51.7" y="0" width="2.2" height="22"/><rect x="57.2" y="0" width="1.1" height="22"/>
      <rect x="60.5" y="0" width="3.3" height="22"/><rect x="66" y="0" width="1.1" height="22"/>
      <rect x="69.3" y="0" width="2.2" height="22"/><rect x="74.8" y="0" width="1.1" height="22"/>
    </g>
    <text class="m-serial" x="186" y="378">Sr. No. RND00001</text>
    <g class="m-spec">
      <text x="186" y="396">1P, 2W, 240V, 5-60A, 50 Hz, Class 1.0</text>
      <text x="186" y="408">DLMS Meter Type: 6 · Cat.: D1, 27&#176;C</text>
      <text x="186" y="420">Type: GPSM 03 · MM/YYYY: 08/2026</text>
      <text x="186" y="432">Illustration only — not a real meter</text>
    </g>

    <!-- right column -->
    <text class="m-print m-print-sm m-print-end" x="518" y="332">MTCTE : 283603039</text>
    <!-- Real control, not decoration: focusable, keyboard-operable, and with a hit area
         larger than the drawn button so it clears the 24px minimum on touch. -->
    <!-- "Press here" tag. Brand blue and pill-shaped so it reads as annotation laid over
         the device rather than as something printed on it. Decorative to assistive tech —
         the button below already carries its own label — and it retires on first press
         along with the pulse, since by then it has said what it had to say. -->
    <g class="m-hint-tag" aria-hidden="true">
      <rect x="384" y="348" width="86" height="21" rx="10.5"/>
      <text x="424" y="363">Press here</text>
      <path d="M472 352.5 481 358.5 472 364.5 Z"/>
    </g>
    <g class="m-btn-hit" id="mBtn" role="button" tabindex="0"
       aria-label="Press the meter's scroll button to show the next reading"
       aria-describedby="mReadout">
      <circle class="m-btn-target" cx="500" cy="358" r="26"/>
      <!-- Resting affordance. Hover cannot carry this — it does not exist on touch —
           so an expanding ring runs until the first press, then stops for good. -->
      <circle class="m-btn-pulse" cx="500" cy="358" r="15"/>
      <circle class="m-btn-ring" cx="500" cy="358" r="20"/>
      <circle class="m-btn-rim" cx="500" cy="358" r="15"/>
      <circle class="m-btn" cx="500" cy="358" r="11.5"/>
      <text class="m-label" x="500" y="382">Scroll</text>
    </g>
    <circle class="m-port-metal" cx="486" cy="410" r="24"/>
    <circle class="m-port-ring" cx="486" cy="410" r="17.5"/>
    <ellipse class="m-port-slot" cx="486" cy="410" rx="11" ry="5.5"/>

    <!-- terminal block -->
    <rect class="m-term" x="196" y="440" width="308" height="50" rx="4"/>
    <g class="m-term-slot">
      <rect x="214" y="446" width="38" height="28" rx="2"/>
      <rect x="271" y="446" width="38" height="28" rx="2"/>
      <rect x="328" y="446" width="38" height="28" rx="2"/>
      <rect x="385" y="446" width="38" height="28" rx="2"/>
      <rect x="442" y="446" width="38" height="28" rx="2"/>
    </g>
    <g class="m-brass">
      <circle cx="233" cy="458" r="6.5"/><circle cx="290" cy="458" r="6.5"/>
      <circle cx="347" cy="458" r="6.5"/><circle cx="404" cy="458" r="6.5"/>
      <circle cx="461" cy="458" r="6.5"/>
    </g>
    <circle class="m-term-seal" cx="350" cy="481" r="4.5"/>
  </g>

`;

// The guide's own twelve callouts. Appended to the device to make the full diagram.
const METER_CALLOUTS = String.raw`  <!-- callout leaders: every run is routed through a corridor with no printed detail in it -->
  <!-- Numbered top-to-bottom down the device, so the two casing lamps take 1 and 2 and
       everything on the LCD follows. The legend uses a CSS counter, so its numbering
       tracks this automatically. COM approaches from below the ON pair to avoid
       crossing it; every other run sits in a corridor with no printed detail in it. -->
  <g class="m-lead">
    <path d="M576 100h-120l-28-24h-68"/>
    <path d="M576 134h-140l-6-16"/>
    <path d="M124 214h156l26 16"/>
    <path d="M124 248h156l58-16"/>
    <path d="M576 214h-172l-34 16"/>
    <path d="M576 248h-130l-43-16"/>
    <path d="M124 282h150l12-18"/>
    <path d="M124 316h150l14-22"/>
    <path d="M576 292h-114"/>
    <path d="M124 350h150l26-22"/>
    <path d="M576 358h-58"/>
    <path d="M124 380h56"/>
  </g>
  <g class="m-num">
    <circle cx="588" cy="100" r="12"/><text x="588" y="104.5">1</text>
    <circle cx="588" cy="134" r="12"/><text x="588" y="138.5">2</text>
    <circle cx="112" cy="214" r="12"/><text x="112" y="218.5">3</text>
    <circle cx="112" cy="248" r="12"/><text x="112" y="252.5">4</text>
    <circle cx="588" cy="214" r="12"/><text x="588" y="218.5">5</text>
    <circle cx="588" cy="248" r="12"/><text x="588" y="252.5">6</text>
    <circle cx="112" cy="282" r="12"/><text x="112" y="286.5">7</text>
    <circle cx="112" cy="316" r="12"/><text x="112" y="320.5">8</text>
    <circle cx="588" cy="292" r="12"/><text x="588" y="296.5">9</text>
    <circle cx="112" cy="350" r="12"/><text x="112" y="354.5">10</text>
    <circle cx="588" cy="358" r="12"/><text x="588" y="362.5">11</text>
    <circle cx="112" cy="380" r="12"/><text x="112" y="384.5">12</text>
  </g>        `;

export const METER_SVG = METER_DEVICE + METER_CALLOUTS + String.raw`</svg>`;
