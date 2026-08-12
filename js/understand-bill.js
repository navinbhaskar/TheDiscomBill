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

  if (location.hash.startsWith('#explain-')) highlight(location.hash.replace('#explain-', ''));
}
