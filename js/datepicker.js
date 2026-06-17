// js/datepicker.js — Lightweight custom calendar for the billing-period date fields.
// Inputs keep their value in ISO 'YYYY-MM-DD' format (so all existing logic is unchanged);
// the popup writes that value and dispatches 'change'. Range between #fromDate/#toDate is
// highlighted. Self-contained, no dependencies.

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

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
  window.removeEventListener('scroll', close, true);
  window.removeEventListener('resize', close);
}
function position(pop, inp) {
  const r = inp.getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight;
  let left = r.left;
  if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
  if (left < 8) left = 8;
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
}
function onDocDown(e) {
  if (!popup) return;
  const wrap = popup._anchor.closest('.date-field-wrap');
  if (wrap && wrap.contains(e.target)) return;   // clicks within the field/icon
  if (popup.contains(e.target)) return;          // clicks within the calendar
  close();
}
function onKey(e) { if (e.key === 'Escape') close(); }

export function initDatePickers() {
  document.querySelectorAll('input[data-datepicker]').forEach(inp => {
    const wrap = inp.closest('.date-field-wrap');
    const openFn = (e) => { e.preventDefault(); open(inp); };
    inp.addEventListener('mousedown', openFn);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(inp); }
    });
    const btn = wrap && wrap.querySelector('.date-field-btn');
    if (btn) btn.addEventListener('mousedown', openFn);
  });
}

function open(inp) {
  if (popup && popup._anchor === inp) return;   // already open for this field
  close();

  let view = parseISO(inp.value) || new Date();
  view = new Date(view.getFullYear(), view.getMonth(), 1);

  const pop = document.createElement('div');
  pop.className = 'dp-popup';
  pop._anchor = inp;

  const draw = () => {
    pop.innerHTML = monthHtml(view, inp);
    pop.querySelector('.dp-prev').addEventListener('mousedown', e => { e.preventDefault(); view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); });
    pop.querySelector('.dp-next').addEventListener('mousedown', e => { e.preventDefault(); view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); });
    pop.querySelectorAll('.dp-day:not(.dp-empty)').forEach(c =>
      c.addEventListener('mousedown', e => { e.preventDefault(); commit(inp, c.dataset.iso); }));
    pop.querySelector('.dp-today-btn').addEventListener('mousedown', e => { e.preventDefault(); commit(inp, iso(new Date())); });
    pop.querySelector('.dp-clear-btn').addEventListener('mousedown', e => { e.preventDefault(); commit(inp, ''); });
  };
  draw();

  document.body.appendChild(pop);   // body-level so ancestor overflow:hidden can't clip it
  popup = pop;
  position(pop, inp);
  setTimeout(() => {
    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
  }, 0);
}

function commit(inp, value) {
  inp.value = value;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  close();
}

function monthHtml(view, inp) {
  const y = view.getFullYear(), m = view.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const selISO = inp.value;
  const todayISO = iso(new Date());

  // Range highlight using the partner field
  const partner = inp.id === 'fromDate' ? document.getElementById('toDate')
                : inp.id === 'toDate'   ? document.getElementById('fromDate') : null;
  const a = document.getElementById('fromDate');
  const b = document.getElementById('toDate');
  const fromISO = a ? a.value : '';
  const toISO   = b ? b.value : '';

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
      <span class="dp-title">${MONTHS[m]} ${y}</span>
      <button type="button" class="dp-nav dp-next" aria-label="Next month">›</button>
    </div>
    <div class="dp-grid dp-dow">${DOW.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="dp-grid dp-days">${cells}</div>
    <div class="dp-foot">
      <button type="button" class="dp-today-btn">Today</button>
      <button type="button" class="dp-clear-btn">Clear</button>
    </div>`;
}
