// js/datepicker.js — Lightweight custom calendar shared by every date field.
// Day fields keep their value in ISO 'YYYY-MM-DD'; month-year-only fields (data-my) display
// "Month YYYY" and carry the machine value in dataset.y / dataset.m. The calendar header's
// month and year are clickable, each opening its own list (months grid / scrollable years).

import { displayDate } from './utils.js';
export { displayDate };

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const MON3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const YEAR_MIN = 2004;
const yearMax  = () => new Date().getFullYear() + 1;

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt) ? null : dt;
}

let popup = null;
function close(restoreFocus) {
  if (!popup) return;
  const anchor = popup._anchor;
  popup.remove();
  popup = null;
  document.removeEventListener('mousedown', onDocDown, true);
  document.removeEventListener('keydown', onKey, true);
  window.removeEventListener('scroll', onScroll, true);
  window.removeEventListener('resize', onResize);
  // Return focus to the field only when closing via keyboard / selection, not on an outside click
  // (which would steal focus from wherever the user clicked).
  if (restoreFocus && anchor && anchor.focus) anchor.focus();
}
function position(pop, inp) {
  const r = inp.getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight;
  let left = r.left;
  if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
  if (left < 8) left = 8;
  // Prefer below the field; if it won't fit, place above; finally clamp into the viewport.
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) {
    const above = r.top - h - 6;
    top = above >= 8 ? above : Math.max(8, window.innerHeight - h - 8);
  }
  if (top < 8) top = 8;
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
}
function onScroll() {
  if (!popup) return;
  const r = popup._anchor.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) { close(); return; }  // field scrolled away
  position(popup, popup._anchor);                                       // otherwise keep attached
}
function onDocDown(e) {
  if (!popup) return;
  const wrap = popup._anchor.closest('.date-field-wrap');
  if (wrap && wrap.contains(e.target)) return;   // clicks within the field/icon
  if (popup.contains(e.target)) return;          // clicks within the calendar
  close();
}
function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); close(true); } }
function onResize() { close(false); }

// Build an ISO date from parts, returning null if it isn't a real calendar date.
function mkISO(y, mo, d) {
  const dt = new Date(y, mo - 1, d);
  if (isNaN(dt) || dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${pad(mo)}-${pad(d)}`;
}
// Parse a typed day value flexibly: ISO (YYYY-MM-DD) or D-M-YYYY / D/M/YYYY → ISO, else null.
function flexParseISO(s) {
  s = String(s || '').trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)))            return mkISO(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)))  return mkISO(+m[3], +m[2], +m[1]);
  return null;
}
// The latest selectable date for billing-capped fields: the last day of the chosen billing month.
function billingCapISO() {
  const ye = document.getElementById('billingYear');
  const me = document.getElementById('billingMonth');
  const y = ye && +ye.value, m = me && +me.value;
  if (!y || !m) return null;
  return `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`;
}
// Cap applies only to fields tagged data-cap-bill (the reading / billing-period dates).
function capFor(inp) { return inp.hasAttribute('data-cap-bill') ? billingCapISO() : null; }

// ─── Display vs machine value ──────────────────────────────────────────────────
// Day fields SHOW DD-MM-YYYY (inp.value) but carry the canonical ISO in inp.dataset.iso, so all
// calculation code keeps reading clean ISO via fieldISO() regardless of the display format.
// displayDate is now imported from utils.js and re-exported above.
export function fieldISO(inp) {
  if (!inp) return '';
  if (inp.dataset && inp.dataset.iso) return inp.dataset.iso;
  return flexParseISO(inp.value) || '';     // fallback: parse whatever the user typed
}
export function setFieldDate(inp, iso) {
  if (!inp) return;
  if (iso) { inp.dataset.iso = iso; inp.value = displayDate(iso); }
  else { delete inp.dataset.iso; inp.value = ''; }
}

// Normalise a typed value → store ISO in dataset.iso + show DD-MM-YYYY, clamped to the billing cap.
function normalizeTyped(inp) {
  const raw = inp.value.trim();
  if (raw === '') { setFieldDate(inp, ''); return; }
  let v = flexParseISO(raw);
  if (!v) { setFieldDate(inp, ''); return; }
  const cap = capFor(inp);
  if (cap && v > cap) v = cap;
  setFieldDate(inp, v);
}

// ─── Type-ahead date mask ───────────────────────────────────────────────────────
// Auto-formats a typed value toward DD-MM-YYYY, inserting "-" as each segment completes.
// "Smart" rule: a leading digit that can't begin a two-digit value closes its segment at
// once (day 4-9, month 2-9); an ambiguous leading digit (day 0-3, month 0-1) waits for the
// second digit. Keystrokes that would form an impossible day (32+) or month (13+) are dropped.
//   `forward` = true on insert (a freshly-completed segment shows its trailing "-"),
//               false on delete (so the user can backspace through the auto "-").
function validDayPair(a, b)   { const v = +(a + b); return v >= 1 && v <= 31; }
function validMonthPair(a, b) { const v = +(a + b); return v >= 1 && v <= 12; }

function maskTypedDate(value, forward) {
  const ds = value.replace(/\D/g, '').slice(0, 8);   // DDMMYYYY → at most 8 digits
  const n = ds.length;
  let res = '', i = 0;
  const sep = () => res += (i < n || forward) ? '-' : '';   // internal always; trailing only forward

  // ── DAY (01-31) ──
  if (i < n) {
    const a = ds[i];
    if (a >= '4') { res += a; i++; sep(); }            // 4-9 → single-digit day, closed
    else if (i + 1 < n) {                              // 0-3 with a second digit available
      const b = ds[i + 1];
      if (validDayPair(a, b)) { res += a + b; i += 2; sep(); }
      else return res + a;                             // block invalid 2nd digit, keep waiting
    } else return res + a;                             // single 0-3 so far → wait for 2nd
  }

  // ── MONTH (01-12) ──
  if (i < n) {
    const a = ds[i];
    if (a >= '2') { res += a; i++; sep(); }            // 2-9 → single-digit month, closed
    else if (i + 1 < n) {                              // 0-1 with a second digit available
      const b = ds[i + 1];
      if (validMonthPair(a, b)) { res += a + b; i += 2; sep(); }
      else return res + a;                             // block invalid 2nd digit
    } else return res + a;                             // single 0-1 so far → wait
  }

  // ── YEAR (up to 4 digits; range clamped later on commit) ──
  if (i < n) res += ds.slice(i, i + 4);
  return res;
}

// Reformat the field as the user types; caret goes to the end (these fields are short and
// typed left-to-right). Skipped when the value is already in canonical form.
function onDateMaskInput(e) {
  const el = e.target;
  const forward = !(e.inputType && e.inputType.startsWith('delete'));
  const formatted = maskTypedDate(el.value, forward);
  if (formatted !== el.value) {
    el.value = formatted;
    const pos = formatted.length;
    try { el.setSelectionRange(pos, pos); } catch (err) {}
  }
}

// Wire one input (idempotent) — used for both static and dynamically-added fields.
export function attachDatePicker(inp) {
  if (!inp || inp._dpWired) return;
  inp._dpWired = true;
  const wrap = inp.closest('.date-field-wrap');
  const openFn = (e) => { e.preventDefault(); open(inp); };
  const btn = wrap && wrap.querySelector('.date-field-btn');
  if (btn) btn.addEventListener('mousedown', openFn);

  if (inp.hasAttribute('data-my')) {
    // Month-year fields: pick-only (the markup keeps them readonly).
    inp.addEventListener('mousedown', openFn);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(inp); }
    });
  } else {
    // Day fields: typeable. The calendar button (or ArrowDown) opens the picker; Enter commits the
    // typed value; the capture-phase 'change' normalises it to ISO before other listeners read it.
    inp.addEventListener('input', onDateMaskInput);   // auto-insert "-" / block bad digits as typed
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(inp); }
      else if (e.key === 'Enter') { e.preventDefault(); normalizeTyped(inp); inp.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    inp.addEventListener('change', () => normalizeTyped(inp), true);
  }
}

export function initDatePickers() {
  document.querySelectorAll('input[data-datepicker]').forEach(attachDatePicker);
}

function viewFor(inp, myOnly) {
  if (myOnly) {
    const y = +inp.dataset.y, m = +inp.dataset.m;
    if (y && m) return new Date(y, m - 1, 1);
    const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1);
  }
  const parsed = parseISO(fieldISO(inp));
  const d = parsed || new Date();
  let view = new Date(d.getFullYear(), d.getMonth(), 1);
  // For a capped field with no value, don't open on a fully-disabled future month — start at the
  // cap's month (e.g. billing = Jan 2026 → open the calendar on January, not today's month).
  if (!parsed) {
    const cap = parseISO(capFor(inp));
    if (cap) {
      const capMonth = new Date(cap.getFullYear(), cap.getMonth(), 1);
      if (view > capMonth) view = capMonth;
    }
  }
  return view;
}

function open(inp) {
  if (popup && popup._anchor === inp) return;   // already open for this field
  close();

  const myOnly = inp.hasAttribute('data-my');   // month-year-only field (no day grid)
  let view = viewFor(inp, myOnly);
  let mode = myOnly ? 'months' : 'days';
  let pendingFocusISO = null;   // day to focus after an arrow-key month change
  let firstDraw = true;         // focus the active day once, when the calendar first opens

  const pop = document.createElement('div');
  pop.className = 'dp-popup';
  pop._anchor = inp;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', myOnly ? 'Choose month and year' : 'Choose date');

  const draw = () => {
    if (mode === 'months')      pop.innerHTML = monthsHtml(view, inp, myOnly);
    else if (mode === 'years')  pop.innerHTML = yearsHtml(view);
    else                        pop.innerHTML = daysHtml(view, inp);
    wire();
    // The views have different heights — re-anchor after each switch so the new content stays
    // fully on-screen (otherwise e.g. the year list could open below the fold).
    if (pop.isConnected) position(pop, inp);
    if (mode === 'years') scrollYearIntoView(view.getFullYear());
    // Keyboard focus follows arrow-key navigation across a month boundary (popup already in DOM).
    if (mode === 'days' && pendingFocusISO && pop.isConnected) {
      const sel = pop.querySelector(`.dp-day[data-iso="${pendingFocusISO}"]`);
      if (sel) {
        pop.querySelectorAll('.dp-day').forEach(d => { d.tabIndex = -1; });
        sel.tabIndex = 0;
        sel.focus();
      }
      pendingFocusISO = null;
    }
  };

  const goMonths = () => { mode = 'months'; draw(); };
  const goYears  = () => { mode = 'years';  draw(); };

  const wire = () => {
    const md = (sel, fn) => { const el = pop.querySelector(sel); if (el) el.addEventListener('mousedown', e => { e.preventDefault(); fn(el); }); };
    if (mode === 'days') {
      md('.dp-prev', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); });
      md('.dp-next', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); });
      md('.dp-mon', goMonths);
      md('.dp-yr',  goYears);
      pop.querySelectorAll('.dp-day:not(.dp-empty)').forEach(c =>
        c.addEventListener('mousedown', e => { e.preventDefault(); commit(inp, c.dataset.iso); }));
      md('.dp-today-btn', () => commit(inp, iso(new Date())));
      md('.dp-clear-btn', () => commit(inp, ''));
      // Arrow-key navigation across the day grid (crossing month boundaries re-renders).
      const grid = pop.querySelector('.dp-days');
      if (grid) grid.addEventListener('keydown', e => {
        const cur = document.activeElement;
        if (!cur || !cur.dataset || !cur.dataset.iso) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(inp, cur.dataset.iso); return; }
        const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (delta == null) return;
        e.preventDefault();
        const d = parseISO(cur.dataset.iso); d.setDate(d.getDate() + delta);
        const targetISO = iso(d);
        if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
          view = new Date(d.getFullYear(), d.getMonth(), 1); pendingFocusISO = targetISO; draw();
        } else {
          const btn = pop.querySelector(`.dp-day[data-iso="${targetISO}"]`);
          if (btn) { grid.querySelectorAll('.dp-day').forEach(x => { x.tabIndex = -1; }); btn.tabIndex = 0; btn.focus(); }
        }
      });
    } else if (mode === 'months') {
      md('.dp-prev', () => { view = new Date(view.getFullYear() - 1, view.getMonth(), 1); draw(); });
      md('.dp-next', () => { view = new Date(view.getFullYear() + 1, view.getMonth(), 1); draw(); });
      md('.dp-yr',  goYears);
      pop.querySelectorAll('.dp-month').forEach(c =>
        c.addEventListener('mousedown', e => {
          e.preventDefault();
          const mm = +c.dataset.m;
          view = new Date(view.getFullYear(), mm, 1);
          if (myOnly) commitYM(inp, view.getFullYear(), mm);
          else { mode = 'days'; draw(); }
        }));
    } else { // years
      pop.querySelectorAll('.dp-year').forEach(c =>
        c.addEventListener('mousedown', e => {
          e.preventDefault();
          view = new Date(+c.dataset.y, view.getMonth(), 1);
          mode = myOnly ? 'months' : 'days';
          draw();
        }));
    }
  };

  draw();
  document.body.appendChild(pop);   // body-level so ancestor overflow:hidden can't clip it
  popup = pop;
  position(pop, inp);
  if (mode === 'years') scrollYearIntoView(view.getFullYear());
  // Move keyboard focus into the calendar so arrow keys work immediately (post-append).
  if (firstDraw && mode === 'days') {
    const active = pop.querySelector('.dp-day[tabindex="0"]') || pop.querySelector('.dp-day:not(.dp-empty)');
    if (active) active.focus();
  }
  firstDraw = false;
  setTimeout(() => {
    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
  }, 0);
}

function scrollYearIntoView(y) {
  if (!popup) return;
  const box = popup.querySelector('.dp-years');
  const el  = popup.querySelector(`.dp-year[data-y="${y}"]`);
  if (box && el) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
}

// Day field commit (ISO value → stored in dataset.iso, shown as DD-MM-YYYY)
function commit(inp, value) {
  if (value) { const cap = capFor(inp); if (cap && value > cap) value = cap; }
  setFieldDate(inp, value);
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  close(true);
}
// Month-year field commit ("Month YYYY" display + dataset.y / dataset.m machine value)
function commitYM(inp, y, m) {
  inp.dataset.y = String(y);
  inp.dataset.m = pad(m + 1);
  inp.value = `${MONTHS[m]} ${y}`;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  close(true);
}

function daysHtml(view, inp) {
  const y = view.getFullYear(), m = view.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const selISO = fieldISO(inp);
  const todayISO = iso(new Date());

  // Range highlight only applies to the billing-period fields
  const isPeriod = inp.id === 'fromDate' || inp.id === 'toDate';
  const fromISO = isPeriod ? fieldISO(document.getElementById('fromDate')) : '';
  const toISO   = isPeriod ? fieldISO(document.getElementById('toDate'))   : '';

  // The single keyboard-focusable ("active") day: the selected day, else today, else the 1st —
  // but only if it falls in the month on view; gives the grid a roving tabindex.
  const monthPrefix = `${y}-${pad(m + 1)}`;
  const activeISO = (selISO && selISO.startsWith(monthPrefix)) ? selISO
                  : todayISO.startsWith(monthPrefix) ? todayISO
                  : `${monthPrefix}-01`;

  // Hard cap: billing-capped fields can't pick a date after the selected billing month.
  const capISO = capFor(inp);

  let cells = '';
  for (let i = 0; i < startDow; i++) cells += '<span class="dp-day dp-empty" aria-hidden="true"></span>';
  for (let d = 1; d <= days; d++) {
    const cur = `${y}-${pad(m + 1)}-${pad(d)}`;
    const disabled = capISO && cur > capISO;
    const cls = ['dp-day'];
    if (cur === selISO) cls.push('dp-selected');
    else if (cur === todayISO) cls.push('dp-today');
    if (fromISO && toISO && cur > fromISO && cur < toISO) cls.push('dp-inrange');
    if ((inp.id === 'toDate' && fromISO && cur < fromISO) ||
        (inp.id === 'fromDate' && toISO && cur > toISO)) cls.push('dp-disabledish');
    cells += `<button type="button" class="${cls.join(' ')}" data-iso="${cur}" role="gridcell"${disabled ? ' disabled aria-disabled="true"' : ''}`
      + ` tabindex="${(cur === activeISO && !disabled) ? 0 : -1}" aria-selected="${cur === selISO ? 'true' : 'false'}"`
      + ` aria-label="${d} ${MONTHS[m]} ${y}">${d}</button>`;
  }

  return `
    <div class="dp-head">
      <button type="button" class="dp-nav dp-prev" aria-label="Previous month">‹</button>
      <span class="dp-title">
        <button type="button" class="dp-pick dp-mon">${MONTHS[m]}</button>
        <button type="button" class="dp-pick dp-yr">${y}</button>
      </span>
      <button type="button" class="dp-nav dp-next" aria-label="Next month">›</button>
    </div>
    <div class="dp-grid dp-dow" aria-hidden="true">${DOW.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="dp-grid dp-days" role="grid" aria-label="${MONTHS[m]} ${y}">${cells}</div>
    <div class="dp-foot">
      <button type="button" class="dp-today-btn">Today</button>
      <button type="button" class="dp-clear-btn">Clear</button>
    </div>`;
}

function monthsHtml(view, inp, myOnly) {
  const y = view.getFullYear();
  // selected month to highlight: the field's own month (for myOnly) or the view month
  let selM = view.getMonth();
  if (myOnly && inp.dataset.y) selM = (+inp.dataset.y === y) ? (+inp.dataset.m - 1) : -1;
  const cells = MON3.map((mn, i) =>
    `<button type="button" class="dp-month${i === selM ? ' dp-selected' : ''}" data-m="${i}">${mn}</button>`).join('');
  return `
    <div class="dp-head">
      <button type="button" class="dp-nav dp-prev" aria-label="Previous year">‹</button>
      <span class="dp-title"><button type="button" class="dp-pick dp-yr">${y}</button></span>
      <button type="button" class="dp-nav dp-next" aria-label="Next year">›</button>
    </div>
    <div class="dp-grid dp-months">${cells}</div>`;
}

function yearsHtml(view) {
  const sel = view.getFullYear();
  let cells = '';
  for (let y = YEAR_MIN; y <= yearMax(); y++) {
    cells += `<button type="button" class="dp-year${y === sel ? ' dp-selected' : ''}" data-y="${y}">${y}</button>`;
  }
  return `
    <div class="dp-head"><span class="dp-title dp-title-static">Select year</span></div>
    <div class="dp-years">${cells}</div>`;
}
