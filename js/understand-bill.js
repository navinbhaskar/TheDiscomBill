// understand-bill.js — makes the annotated bill on /understand-your-bill/ interactive.
//
// The page arrives complete: the default scenario's bill, its numbers and every explanation
// are in the served HTML, rendered at build time by the same two functions this file calls
// (js/bill-anatomy.js). So there is no hydration flash and nothing to do on load — this
// module only runs when the reader changes something.
//
// The tariff registry loads state tables on demand, which is why render() is async and why
// the scenario's state is fetched before the engine is asked for a bill.

import { SCENARIOS, DEFAULT_SCENARIO, billInput, readout, billHtml, liveHtml } from '/js/bill-anatomy.js';
// The seven-segment renderer the smart-meter guide already uses. Importing it rather than
// reimplementing keeps one definition of what a digit looks like on the glass.
import { segmentsFor } from '/js/smart-meter.js';

const NOT_ON_BILL = 'Not charged on the bill shown — pick another DISCOM or category above and it appears.';

export async function initUnderstandBill() {
  const form = document.getElementById('ubControls');
  const doc = document.getElementById('billDoc');
  if (!form || !doc) return;

  const sel = document.getElementById('ubScenario');
  const units = document.getElementById('ubUnits');
  const load = document.getElementById('ubLoad');
  const md = document.getElementById('ubMd');
  const messy = document.getElementById('ubMessy');
  const reset = document.getElementById('ubReset');
  const err = document.getElementById('ubError');
  // Everything that belongs to one scenario and hides for the others: the note under the
  // selector AND its row of links to that DISCOM's real bill and rate schedule. Selecting on
  // the data attribute rather than on a class means a new per-scenario block is toggled
  // automatically — the link rows were missed when they were added, and sat frozen on the
  // first scenario no matter what the reader picked.
  const perScenario = [...document.querySelectorAll('[data-scenario]')];

  // Loaded lazily so a reader who never touches a control pays nothing for them. Both are
  // needed together, so one await covers both.
  let engine, registry;
  async function deps() {
    if (!engine) {
      [engine, registry] = await Promise.all([
        import('/js/engine.js'),
        import('/js/tariffs/registry.js'),
      ]);
    }
    return { engine, registry };
  }

  const current = () => SCENARIOS.find(s => s.id === sel.value) || SCENARIOS[0];

  // MD is optional, so switching scenario CLEARS it and moves the scenario's own recorded
  // figure into the placeholder. Filling the field instead would quietly turn every scenario
  // change into an explicit override and the field would stop meaning "leave blank for normal".
  function applyDefaults(s) {
    units.value = s.units;
    load.value = s.connectedLoadKw;
    md.value = '';
    md.placeholder = String(s.md);
  }

  function fail(message) {
    err.textContent = message;
    err.hidden = false;
  }

  async function render() {
    const s = current();
    perScenario.forEach(n => { n.hidden = n.dataset.scenario !== s.id; });

    const u = Number(units.value);
    const kw = Number(load.value);
    if (!Number.isFinite(u) || u < 0 || !Number.isFinite(kw) || kw <= 0) {
      fail('Enter a consumption of 0 or more and a sanctioned load above 0.');
      return;
    }
    // Blank is the normal state, not an error — it means "use the recorded demand".
    const mdRaw = md.value.trim();
    const mdVal = mdRaw === '' ? null : Number(mdRaw);
    if (mdVal !== null && (!Number.isFinite(mdVal) || mdVal < 0)) {
      fail('Maximum demand must be 0 or more, or left blank.');
      return;
    }

    const { engine: E, registry: R } = await deps();
    await R.ensureDiscom(s.discomId);

    const bill = E.calculateBill(billInput(s, {
      units: u, connectedLoadKw: kw, md: mdVal, messy: messy.checked,
    }));
    if (bill.error) { fail(bill.message); return; }
    err.hidden = true;

    const r = readout(bill, s, document.documentElement.lang || 'en');
    const { html, marks } = billHtml(r);
    doc.innerHTML = html;
    syncExplanations(r, marks);
    syncMeter(r);
    drawLinks();
  }

  // Keep the explanation column in step with the bill: the marker digits shift whenever a
  // line appears or disappears, and a stale digit is worse than none — it would point the
  // reader at the wrong row.
  // The explanation blocks are the source of truth for which lines exist and what each one
  // reads its figure from — they carry data-line and data-live from the build. Nothing here
  // needs the prose module, which is why the browser never downloads it.
  const explainEls = [...document.querySelectorAll('.ub-explain')];

  function syncExplanations(r, marks) {
    for (const el of explainEls) {
      const n = marks[el.dataset.line];
      const numEl = el.querySelector('.ub-num');
      if (numEl) {
        numEl.textContent = n || '';
        numEl.hidden = !n;
      }
      const live = el.dataset.live ? r.live[el.dataset.live] : null;
      const liveEl = el.querySelector('.ub-live:not(.is-absent)');
      const absentEl = el.querySelector('.ub-live.is-absent');
      if (liveEl) {
        // liveHtml() is the same function the build called, and every value inside it is a
        // formatted number or a string this module owns — nothing from the page or the URL
        // reaches it, so there is no untrusted input to escape beyond what it already does.
        liveEl.querySelector('.ub-live-body').innerHTML = liveHtml(live);
        liveEl.hidden = !live;
      }
      if (absentEl) {
        absentEl.textContent = NOT_ON_BILL;
        absentEl.hidden = !!live;
      }
      el.toggleAttribute('data-absent', !n);
    }
  }

  // Highlight the bill row an explanation belongs to when its marker is followed, and the
  // reverse. Delegated, because both sides are replaced wholesale on every render.
  document.addEventListener('click', (e) => {
    const mark = e.target.closest('.bill-mark');
    if (!mark) return;
    const id = mark.getAttribute('href').replace('#explain-', '');
    highlight(id);
  });

  function highlight(id) {
    document.querySelectorAll('[data-line].is-lit').forEach(el => el.classList.remove('is-lit'));
    document.querySelectorAll(`[data-line="${CSS.escape(id)}"]`).forEach(el => el.classList.add('is-lit'));
  }

  // ── the meter beside the bill ───────────────────────────────────────────
  // Press-driven, never timed. The markers are links, and a link that relocates while the
  // reader is reaching for it is a real usability failure — WCAG 2.2.2 wants a pause control
  // for anything that updates on its own. The guide's meter made the same call.
  //
  // The numbers on the meter NEVER renumber as the display cycles. Both registers keep their
  // own permanent marker; the active one lights up and the other dims. Renumbering would break
  // the page's core contract, which is that marker 7 means one thing.
  const meterSvg = document.querySelector('.meter-mini-stage .meter-svg');
  const mm = meterSvg && {
    seg: document.getElementById('mSeg'),
    code: document.getElementById('mCode'),
    unit: document.getElementById('mUnit'),
    step: document.getElementById('mmStep'),
    title: document.getElementById('mmTitle'),
    btn: document.getElementById('mBtn'),
  };
  let screens = [];
  let screenIx = 0;

  function paintMeter() {
    if (!mm || !screens.length) return;
    const sc = screens[screenIx % screens.length];
    mm.seg.innerHTML = segmentsFor(sc.value);
    mm.code.textContent = sc.code;
    mm.unit.textContent = sc.unit;
    mm.title.textContent = sc.title;
    mm.step.textContent = String(screenIx + 1) + '/' + screens.length;
    // Light the register being displayed, on the meter AND on the bill row it feeds.
    // Light the part of the meter the displayed register lives on. Nothing renumbers, because
    // the number is not on the meter at all — it is the single marker in the gap.
    meterSvg.querySelectorAll('.meter-mini-parts [data-mm]').forEach(el => {
      el.classList.toggle('is-live', el.dataset.mm === sc.key);
    });
    document.querySelectorAll('[data-line].is-live').forEach(el => el.classList.remove('is-live'));
    document.querySelectorAll('[data-line="' + CSS.escape(sc.key) + '"]')
      .forEach(el => el.classList.add('is-live'));
    syncLinkState();
  }

  function syncMeter(r) {
    if (!mm) return;
    screens = r.meter.screens;
    paintMeter();
  }

  if (mm && mm.btn) {
    const press = () => {
      screenIx = (screenIx + 1) % Math.max(1, screens.length);
      meterSvg.classList.add('has-pressed');
      paintMeter();
    };
    mm.btn.addEventListener('click', press);
    mm.btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(); }
    });
  }

  // ── connectors from the shared markers to the meter ─────────────────────
  // The three markers the meter shares sit beside their BILL rows, which puts them hundreds of
  // pixels below the parts of the meter they name. No CSS joins two independently flowing
  // elements across that distance, so the routes are measured and drawn here.
  //
  // Orthogonal, not straight: out of the meter, down a lane in the gap, then in to the marker.
  // A direct line would cross the meter and the bill; a lane per route keeps the three apart.
  const stage = document.querySelector('.ub-stage');
  const links = document.getElementById('ubLinks');

  function drawLinks() {
    if (!links || !stage) return;
    // Below the breakpoint the markers fold inline against their rows and the routes would be
    // nonsense, so the overlay is emptied rather than left holding stale geometry.
    if (!window.matchMedia('(min-width: 881px)').matches) {
      links.querySelectorAll('.ub-link').forEach(el => el.removeAttribute('d'));
      return;
    }

    const box = stage.getBoundingClientRect();
    const fig = document.querySelector('.meter-mini');
    const meterRight = fig ? fig.getBoundingClientRect().right - box.left : 0;
    links.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    links.setAttribute('width', box.width);
    links.setAttribute('height', box.height);

    const R = 9;                       // corner radius
    // The paths are declared in the served HTML; only their geometry is set here.
    const routes = [...links.querySelectorAll('.ub-link')];

    routes.forEach((pathEl, i) => {
      const id = pathEl.dataset.link;
      const a = document.querySelector('.bill-mark.is-shared[href="#explain-' + CSS.escape(id) + '"]');
      const part = document.querySelector('.meter-mini-parts [data-mm="' + CSS.escape(id) + '"]');
      if (!a || !part) return;
      const pb = part.getBoundingClientRect();
      const mb = a.getBoundingClientRect();
      if (!pb.width || !mb.width) return;

      const x0 = pb.right - box.left;
      const y0 = pb.top + pb.height / 2 - box.top;
      const x1 = mb.left - box.left - 5;
      const y1 = mb.top + mb.height / 2 - box.top;

      // One lane per route, so three descents through the same gap never overlap — and all of
      // them to the RIGHT of the meter, never through it. Measured from the figure rather than
      // from the part, because the part is inside the drawing and a lane there would fall
      // through the casing, the printed spec block and the readout text below.
      const lane = Math.min(meterRight + 8 + i * 9, x1 - 14);
      const dir = y1 > y0 ? 1 : -1;
      const r = Math.min(R, Math.abs(y1 - y0) / 2, Math.abs(lane - x0), Math.abs(x1 - lane));

      pathEl.setAttribute('d',
        `M${x0} ${y0} H${lane - r} Q${lane} ${y0} ${lane} ${y0 + dir * r} `
        + `V${y1 - dir * r} Q${lane} ${y1} ${lane + r} ${y1} H${x1}`);
    });

    syncLinkState();
  }

  // The route belonging to the register currently on the meter's display is emphasised, the
  // same way the meter part and the bill row are.
  function syncLinkState() {
    const live = document.querySelector('.meter-mini-parts [data-mm].is-live');
    const key = live && live.dataset.mm;
    links && links.querySelectorAll('.ub-link').forEach(pathEl => {
      pathEl.classList.toggle('is-live', pathEl.dataset.link === key);
    });
  }

  if (links && stage) {
    // Resizes are coalesced through rAF so a drag redraws once per frame rather than per pixel.
    if ('ResizeObserver' in window) {
      let raf;
      new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(drawLinks);
      }).observe(stage);
    }
    // Crossing the breakpoint is a correctness case, not a smoothness one: above it the routes
    // must exist, below it they must be cleared or they hang across the page pointing at markers
    // that have folded back inline. rAF is throttled to nothing in a hidden tab, so that
    // transition is handled directly rather than waiting for a paint.
    const wide = window.matchMedia('(min-width: 881px)');
    (wide.addEventListener ? wide.addEventListener.bind(wide, 'change') : wide.addListener.bind(wide))(drawLinks);
  }
  addEventListener('load', drawLinks);
  // Webfont swap changes row heights by a few pixels after first paint, which leaves the routes
  // landing just off their markers. Redraw once the faces are in.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLinks).catch(() => {});

  let t;
  const debounced = () => { clearTimeout(t); t = setTimeout(render, 200); };

  sel.addEventListener('change', () => { applyDefaults(current()); render(); });
  units.addEventListener('input', debounced);
  load.addEventListener('input', debounced);
  md.addEventListener('input', debounced);
  messy.addEventListener('change', render);
  reset.addEventListener('click', () => {
    sel.value = DEFAULT_SCENARIO;
    messy.checked = false;
    applyDefaults(current());
    render();
  });

  // A ?discom=/&units= deep link, so a guide can point at one explanation with the bill
  // already set up to show it. Only re-renders when the URL actually asks for something.
  const q = new URLSearchParams(location.search);
  let deep = false;
  if (q.has('scenario') && SCENARIOS.some(s => s.id === q.get('scenario'))) {
    sel.value = q.get('scenario');
    applyDefaults(current());
    deep = true;
  }
  if (q.has('units')) { units.value = q.get('units'); deep = true; }
  if (q.has('load')) { load.value = q.get('load'); deep = true; }
  if (q.has('md')) { md.value = q.get('md'); deep = true; }
  if (q.get('messy') === '1') { messy.checked = true; deep = true; }
  if (deep) render();

  // The served HTML already shows the right digits, but the meter's screen list lives in the
  // readout — so build it once on load without touching the DOM the build produced.
  if (mm && !deep) {
    const s0 = current();
    deps().then(({ engine: E, registry: R }) => R.ensureDiscom(s0.discomId).then(() => {
      const b0 = E.calculateBill(billInput(s0));
      if (!b0.error) screens = readout(b0, s0, document.documentElement.lang || 'en').meter.screens;
    })).catch(() => {});
  }

  drawLinks();

  if (location.hash.startsWith('#explain-')) highlight(location.hash.replace('#explain-', ''));
}
