// js/datepicker.js — Lightweight custom calendar shared by every date field.
// Day fields keep their value in ISO 'YYYY-MM-DD'; month-year-only fields (data-my) display
// "Month YYYY" and carry the machine value in dataset.y / dataset.m. The calendar header's
// month and year are clickable, each opening its own list (months grid / scrollable years).
// Self-contained, no dependencies.

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
function close() {
  if (!popup) return;
  popup.remove();
  popup = null;
  document.removeEventListener('mousedown', onDocDown, true);
  document.removeEventListener('keydown', onKey, true);
  window.removeEventListener('scroll', onScroll, true);
  window.removeEventListener('resize', close);
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
function onKey(e) { if (e.key === 'Escape') close(); }

// Wire one input (idempotent) — used for both static and dynamically-added fields.
export function attachDatePicker(inp) {
  if (!inp || inp._dpWired) return;
  inp._dpWired = true;
  const wrap = inp.closest('.date-field-wrap');
  const openFn = (e) => { e.preventDefault(); open(inp); };
  inp.addEventListener('mousedown', openFn);
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(inp); }
  });
  const btn = wrap && wrap.querySelector('.date-field-btn');
  if (btn) btn.addEventListener('mousedown', openFn);
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
  const d = parseISO(inp.value) || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function open(inp) {
  if (popup && popup._anchor === inp) return;   // already open for this field
  close();

  const myOnly = inp.hasAttribute('data-my');   // month-year-only field (no day grid)
  let view = viewFor(inp, myOnly);
  let mode = myOnly ? 'months' : 'days';

  const pop = document.createElement('div');
  pop.className = 'dp-popup';
  pop._anchor = inp;

  const draw = () => {
    if (mode === 'months')      pop.innerHTML = monthsHtml(view, inp, myOnly);
    else if (mode === 'years')  pop.innerHTML = yearsHtml(view);
    else                        pop.innerHTML = daysHtml(view, inp);
    wire();
    // The views have different heights — re-anchor after each switch so the new content stays
    // fully on-screen (otherwise e.g. the year list could open below the fold).
    if (pop.isConnected) position(pop, inp);
    if (mode === 'years') scrollYearIntoView(view.getFullYear());
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
  setTimeout(() => {
    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
  }, 0);
}

function scrollYearIntoView(y) {
  if (!popup) return;
  const box = popup.querySelector('.dp-years');
  const el  = popup.querySelector(`.dp-year[data-y="${y}"]`);
  if (box && el) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
}

// Day field commit (ISO value)
function commit(inp, value) {
  inp.value = value;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  close();
}
// Month-year field commit ("Month YYYY" display + dataset.y / dataset.m machine value)
function commitYM(inp, y, m) {
  inp.dataset.y = String(y);
  inp.dataset.m = pad(m + 1);
  inp.value = `${MONTHS[m]} ${y}`;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  close();
}

function daysHtml(view, inp) {
  const y = view.getFullYear(), m = view.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const selISO = inp.value;
  const todayISO = iso(new Date());

  // Range highlight only applies to the billing-period fields
  const isPeriod = inp.id === 'fromDate' || inp.id === 'toDate';
  const fromISO = isPeriod ? (document.getElementById('fromDate')?.value || '') : '';
  const toISO   = isPeriod ? (document.getElementById('toDate')?.value || '') : '';

  let cells = '';
  for (let i = 0; i < startDow; i++) cells += '<span class="dp-day dp-empty"></span>';
  for (let d = 1; d <= days; d++) {
    const cur = `${y}-${pad(m + 1)}-${pad(d)}`;
    const cls = ['dp-day'];
    if (cur === selISO) cls.push('dp-selected');
    else if (cur === todayISO) cls.push('dp-today');
    if (fromISO && toISO && cur > fromISO && cur < toISO) cls.push('dp-inrange');
    if ((inp.id === 'toDate' && fromISO && cur < fromISO) ||
        (inp.id === 'fromDate' && toISO && cur > toISO)) cls.push('dp-disabledish');
    cells += `<button type="button" class="${cls.join(' ')}" data-iso="${cur}">${d}</button>`;
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
    <div class="dp-grid dp-dow">${DOW.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="dp-grid dp-days">${cells}</div>
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
