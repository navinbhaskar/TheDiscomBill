// js/editor.js — In-browser tariff & FPPA editor (maintenance tool, editor.html).
// Reuses the real data + engine modules so what you see here matches the live app.

import { getStates, getDiscoms, STATE_META } from './tariffs/registry.js';
import { FPPA_BY_DISCOM, FPPA_BY_STATE } from './tariffs/fppa.js';
import { calculateEnergySlabs, resolveFixedCharge } from './engine.js';
import { round2, escHtml as esc } from './utils.js';

// ─── Small helpers ──────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
// esc and round2 are now imported from utils.js
const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const slug = s => String(s).trim().toLowerCase()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const keyOf = k => /^\d+$/.test(k) ? +k : k;
function getPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[keyOf(k)]), obj);
}
function setPath(obj, path, val) {
  const ks = path.split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[keyOf(ks[i])];
  o[keyOf(ks[ks.length - 1])] = val;
}

function toast(msg) {
  const t = $('edToast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Generic JS-source emitter (handles Infinity, quotes only when needed) ────
function emitVal(v, ind = '') {
  if (v === Infinity) return 'Infinity';
  if (v === -Infinity) return '-Infinity';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'Infinity';
  if (typeof v === 'boolean') return String(v);
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return '[\n' + v.map(x => ind + '  ' + emitVal(x, ind + '  ')).join(',\n') + '\n' + ind + ']';
  }
  const keys = Object.keys(v);
  if (!keys.length) return '{}';
  const body = keys.map(k => {
    const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
    return ind + '  ' + key + ': ' + emitVal(v[k], ind + '  ');
  }).join(',\n');
  return '{\n' + body + '\n' + ind + '}';
}

// ════════════════════════════════════════════════════════════════════════════
//  TARIFF BUILDER
// ════════════════════════════════════════════════════════════════════════════

let tariff = null;            // working model (editor-shaped, see norm* below)
let existingSlugs = new Set(); // state slugs already in the registry

// ─── Undo stack ───────────────────────────────────────────────────────────────
const UNDO_MAX = 20;
let _undoStack = [];

function saveSnapshot() {
  if (!tariff) return;
  _undoStack.push(JSON.stringify(tariff));
  if (_undoStack.length > UNDO_MAX) _undoStack.shift();
  updateUndoBtn();
}

function undo() {
  if (!_undoStack.length) return;
  tariff = JSON.parse(_undoStack.pop());
  renderTariff();
  updateUndoBtn();
  toast('Undone');
}

function updateUndoBtn() {
  const btn = $('undoBtn');
  if (btn) btn.disabled = !_undoStack.length;
}

// ── Blank factories ──
const blankSlab    = () => ({ limit: '', inf: false, rate: '' });
const blankCharge  = () => ({ name: '', type: 'percent_energy', rate: '' });
const blankTariff  = () => ({
  fixedCharge: { kind: 'flat', rate: '', slabs: [] },
  energySlabs: [{ limit: '100', inf: false, rate: '' }, { limit: '', inf: true, rate: '' }],
  additionalCharges: [],
});
const blankCategory = () => ({ id: '', name: '', notes: '', mode: 'direct', ...blankTariff(), supplyTypes: [] });
const blankSupply   = () => ({ id: '', name: '', description: '', ...blankTariff() });
const blankDiscom   = () => ({ id: '', name: '', fullName: '', area: '', tariffYear: '2024-25', website: '', lpscRate: '1.5', categories: [blankCategory()] });
const blankModel    = () => ({ state: '', currentRatesFrom: '', discoms: [blankDiscom()] });

// Keys the editor manages explicitly at each level; ANY other key on the live object is preserved
// verbatim through a round-trip via `_extra` (so advanced fields the form doesn't expose —
// demandUnit, excessDemand, excessDemandRate, billingDemandFloorPct, rateHistory, state-level
// excessDemand, … — are not silently dropped when you re-download a state file).
const TARIFF_KEYS   = ['fixedCharge', 'energySlabs', 'additionalCharges'];
const SUPPLY_KEYS   = ['id', 'name', 'description', ...TARIFF_KEYS];
const CATEGORY_KEYS = ['id', 'name', 'notes', 'supplyTypes', ...TARIFF_KEYS];
const DISCOM_KEYS   = ['id', 'name', 'fullName', 'area', 'tariffYear', 'website', 'lpscRate', 'categories'];
const MODEL_KEYS    = ['state', 'currentRatesFrom', 'discoms'];
const extras = (obj, known) => {
  const o = {};
  Object.keys(obj || {}).forEach(k => { if (!known.includes(k)) o[k] = obj[k]; });
  return o;
};

// ── Normalize a live tariff object → editor model ──
function normFixed(fc) {
  if (fc == null) return { kind: 'flat', rate: '', slabs: [] };
  if (typeof fc === 'number') return { kind: 'flat', rate: fc, slabs: [] };
  if (fc.type === 'per_kw' || fc.type === 'per_kva') return { kind: fc.type, rate: fc.rate, slabs: [] };
  if (fc.type === 'tiered') return {
    kind: 'tiered', rate: '',
    slabs: (fc.slabs || []).map(s => ({
      maxLoad: s.maxLoad === Infinity ? '' : s.maxLoad,
      inf: s.maxLoad === Infinity, rate: s.rate, label: s.label || '',
    })),
  };
  return { kind: 'flat', rate: '', slabs: [] };
}
const normSlabs   = sl => (sl || []).map(s => ({ limit: s.limit === Infinity ? '' : s.limit, inf: s.limit === Infinity, rate: s.rate }));
const normCharges = ch => (ch || []).map(c => ({ name: c.name || '', type: c.type || 'percent_energy', rate: c.rate }));
const normTariff  = t => ({ fixedCharge: normFixed(t.fixedCharge), energySlabs: normSlabs(t.energySlabs), additionalCharges: normCharges(t.additionalCharges) });

function normCategory(c) {
  const base = { id: c.id || '', name: c.name || '', notes: c.notes || '' };
  if (c.supplyTypes && c.supplyTypes.length) {
    return {
      ...base, mode: 'supply',
      fixedCharge: { kind: 'flat', rate: '', slabs: [] }, energySlabs: [], additionalCharges: [],
      supplyTypes: c.supplyTypes.map(st => ({ id: st.id || '', name: st.name || '', description: st.description || '', ...normTariff(st), _extra: extras(st, SUPPLY_KEYS) })),
      _extra: extras(c, CATEGORY_KEYS),
    };
  }
  return { ...base, mode: 'direct', ...normTariff(c), supplyTypes: [], _extra: extras(c, CATEGORY_KEYS) };
}
function normModel(mod) {
  return {
    state: mod.state || '', currentRatesFrom: mod.currentRatesFrom || '',
    discoms: (mod.discoms || []).map(d => ({
      id: d.id || '', name: d.name || '', fullName: d.fullName || '', area: d.area || '',
      tariffYear: d.tariffYear || '', website: d.website || '',
      lpscRate: d.lpscRate == null ? '' : d.lpscRate,
      categories: (d.categories || []).map(normCategory),
      _extra: extras(d, DISCOM_KEYS),
    })),
    _extra: extras(mod, MODEL_KEYS),
  };
}

// ── Mode / kind switches (restructure without losing data) ──
function setCategoryMode(cat, mode) {
  if (mode === cat.mode) return;
  if (mode === 'supply') {
    if (!cat.supplyTypes.length) {
      cat.supplyTypes = [{ id: '', name: 'Default', description: '', fixedCharge: cat.fixedCharge, energySlabs: cat.energySlabs, additionalCharges: cat.additionalCharges }];
    }
  } else {
    const st = cat.supplyTypes[0];
    if (st) { cat.fixedCharge = st.fixedCharge; cat.energySlabs = st.energySlabs; cat.additionalCharges = st.additionalCharges; }
  }
  cat.mode = mode;
}
function setFixedKind(t, kind) {
  if (kind === t.fixedCharge.kind) return;
  t.fixedCharge.kind = kind;
  if (kind === 'tiered' && !t.fixedCharge.slabs.length) {
    t.fixedCharge.slabs = [{ maxLoad: '', inf: true, rate: '', label: 'All loads' }];
  }
}

// ── Build editor model → clean export object (live shape) ──
function buildFixed(fc) {
  if (fc.kind === 'per_kw' || fc.kind === 'per_kva') return { type: fc.kind, rate: num(fc.rate) };
  if (fc.kind === 'tiered') return {
    type: 'tiered',
    slabs: fc.slabs.map(s => {
      const o = { maxLoad: s.inf ? Infinity : num(s.maxLoad), rate: num(s.rate) };
      if (s.label && s.label.trim()) o.label = s.label.trim();
      return o;
    }),
  };
  return num(fc.rate);
}
const buildSlabs = sl => sl.map(s => ({ limit: s.inf ? Infinity : num(s.limit), rate: num(s.rate) }));
const buildCharges = ch => ch.filter(c => (c.name || '').trim()).map(c => ({ name: c.name.trim(), type: c.type, rate: num(c.rate) }));
function buildTariff(t) {
  const o = { fixedCharge: buildFixed(t.fixedCharge), energySlabs: buildSlabs(t.energySlabs) };
  const ch = buildCharges(t.additionalCharges);
  if (ch.length) o.additionalCharges = ch;
  return o;
}
function buildCategory(c) {
  const o = { id: c.id.trim(), name: c.name.trim() };
  if (c.notes && c.notes.trim()) o.notes = c.notes.trim();
  if (c.mode === 'supply') {
    o.supplyTypes = c.supplyTypes.map(st => {
      const s = { id: st.id.trim(), name: st.name.trim() };
      if (st.description && st.description.trim()) s.description = st.description.trim();
      Object.assign(s, buildTariff(st));
      return Object.assign(s, st._extra || {});   // preserve advanced supply-type fields
    });
  } else {
    Object.assign(o, buildTariff(c));
  }
  return Object.assign(o, c._extra || {});         // preserve advanced category fields (demandUnit, …)
}
function buildDiscom(d) {
  const o = { id: d.id.trim(), name: d.name.trim(), fullName: d.fullName.trim(), area: d.area.trim(), tariffYear: d.tariffYear.trim() };
  if (d.website && d.website.trim()) o.website = d.website.trim();
  if (d.lpscRate !== '' && d.lpscRate != null) o.lpscRate = num(d.lpscRate);
  o.categories = d.categories.map(buildCategory);
  return Object.assign(o, d._extra || {});
}
function buildExport(model) {
  const o = { state: model.state.trim() };
  if (model.currentRatesFrom && model.currentRatesFrom.trim()) o.currentRatesFrom = model.currentRatesFrom.trim();
  o.discoms = model.discoms.map(buildDiscom);
  return Object.assign(o, model._extra || {});      // preserve state-level excessDemand / billingDemandFloorPct
}
function serializeStateFile(model) {
  const exp = buildExport(model);
  const yr = exp.discoms[0] && exp.discoms[0].tariffYear;
  const head = `// ${exp.state || 'State'} — Electricity Tariff Data${yr ? ` (${yr})` : ''}\n`
    + `// Generated by the in-browser tariff editor (editor.html). See TARIFF_GUIDE.md.\n\n`;
  return head + 'export default ' + emitVal(exp) + ';\n';
}

// ── Validation ──
function validateBody(t, label, msgs) {
  const E = m => msgs.push({ level: 'err', msg: m });
  const W = m => msgs.push({ level: 'warn', msg: m });
  const sl = t.energySlabs;
  if (!sl.length) { E(`${label}: add at least one energy slab.`); return; }
  if (!sl[sl.length - 1].inf) E(`${label}: the last energy slab must be ∞ (tick "∞ last").`);
  let prev = 0;
  sl.forEach((s, i) => {
    if (s.inf) { if (i !== sl.length - 1) E(`${label}: only the last slab may be ∞.`); return; }
    if (s.limit === '' || isNaN(+s.limit)) { E(`${label}: slab ${i + 1} needs a numeric limit.`); return; }
    if (+s.limit <= prev) E(`${label}: slab limits must increase (slab ${i + 1} = ${+s.limit} ≤ ${prev}).`);
    prev = +s.limit;
    if (s.rate === '' || isNaN(+s.rate)) W(`${label}: slab ${i + 1} rate is not set.`);
  });
  const fc = t.fixedCharge;
  if ((fc.kind === 'flat' || fc.kind === 'per_kw') && (fc.rate === '' || isNaN(+fc.rate))) W(`${label}: fixed charge value not set.`);
  if (fc.kind === 'tiered') {
    if (!fc.slabs.length) E(`${label}: tiered fixed charge has no tiers.`);
    else if (!fc.slabs[fc.slabs.length - 1].inf) W(`${label}: last fixed-charge tier should be ∞ (Above…).`);
  }
  t.additionalCharges.forEach(c => {
    if ((c.name || '').trim() && (c.rate === '' || isNaN(+c.rate))) W(`${label}: charge "${c.name}" rate not set.`);
  });
}
function validateTariff(model) {
  const msgs = [];
  const E = m => msgs.push({ level: 'err', msg: m });
  const W = m => msgs.push({ level: 'warn', msg: m });
  if (!model.state.trim()) E('State name is required.');
  if (!model.discoms.length) E('Add at least one DISCOM.');
  const dids = new Set();
  model.discoms.forEach((d, di) => {
    const dl = d.name.trim() || d.id.trim() || `DISCOM ${di + 1}`;
    if (!d.id.trim()) E(`${dl}: DISCOM id is required.`);
    else if (dids.has(d.id.trim())) E(`Duplicate DISCOM id "${d.id.trim()}".`); else dids.add(d.id.trim());
    if (!d.fullName.trim()) W(`${dl}: full name is empty.`);
    if (!d.categories.length) E(`${dl}: add at least one category.`);
    const cids = new Set();
    d.categories.forEach((c, ci) => {
      const cl = `${dl} › ${c.name.trim() || c.id.trim() || 'category ' + (ci + 1)}`;
      if (!c.id.trim()) E(`${cl}: category id is required.`);
      else if (cids.has(c.id.trim())) E(`${cl}: duplicate category id "${c.id.trim()}".`); else cids.add(c.id.trim());
      if (!c.name.trim()) W(`${cl}: name is empty.`);
      if (c.mode === 'supply') {
        if (!c.supplyTypes.length) E(`${cl}: supply-type mode but no supply types.`);
        const sids = new Set();
        c.supplyTypes.forEach((st, si) => {
          const slbl = `${cl} › ${st.name.trim() || st.id.trim() || 'supply ' + (si + 1)}`;
          if (!st.id.trim()) E(`${slbl}: supply type id is required.`);
          else if (sids.has(st.id.trim())) E(`${slbl}: duplicate supply type id.`); else sids.add(st.id.trim());
          validateBody(st, slbl, msgs);
        });
      } else {
        validateBody(c, cl, msgs);
      }
    });
  });
  return msgs;
}

// ── Live preview (uses the real engine functions) ──
function computePreview(t, units, load) {
  try {
    const real = buildTariff(t);
    if (!real.energySlabs.length) return { ok: false, html: 'Add energy slabs to preview.' };
    const energy = round2(calculateEnergySlabs(real.energySlabs, units, 1).reduce((s, r) => s + r.amount, 0));
    const fixed = round2(resolveFixedCharge(real.fixedCharge, load));
    return {
      ok: true,
      html: `→ At <strong>${units}</strong> units / <strong>${load}</strong> kW: `
        + `Energy <strong>₹${energy.toFixed(2)}</strong> · Fixed <strong>₹${fixed.toFixed(2)}</strong> · `
        + `Subtotal <strong>₹${(energy + fixed).toFixed(2)}</strong>`,
    };
  } catch (e) {
    return { ok: false, html: 'Preview unavailable: ' + e.message };
  }
}
function updatePreviews() {
  if (!tariff) return;
  const units = +$('prevUnits').value || 0;
  const load = +$('prevLoad').value || 0;
  document.querySelectorAll('#tariffForm .ed-preview-out').forEach(el => {
    const t = getPath(tariff, el.dataset.target);
    if (!t) return;
    const r = computePreview(t, units, load);
    el.innerHTML = r.html;
    el.classList.toggle('bad', !r.ok);
  });
}

// ── Render helpers ──
const delBtn = (act, path, idx, title) =>
  `<button class="ed-btn-del" data-act="${act}" data-path="${path}" data-idx="${idx}" title="${title}">×</button>`;
const addBtn = (act, path, text) =>
  `<button class="ed-btn-add" data-act="${act}" data-path="${path}">${text}</button>`;
const field = (label, path, value, type = 'text', attrs = '') =>
  `<div class="ed-field"><label>${label}</label><input type="${type}" data-path="${path}" value="${esc(value)}" ${attrs}></div>`;

function renderFixed(targetPath, fc) {
  const opt = (v, t) => `<option value="${v}" ${fc.kind === v ? 'selected' : ''}>${t}</option>`;
  let rows = '';
  if (fc.kind === 'flat') rows = field('Amount (₹/month)', `${targetPath}.fixedCharge.rate`, fc.rate, 'number', 'step="0.01"');
  else if (fc.kind === 'per_kw') rows = field('Rate (₹/kW/month)', `${targetPath}.fixedCharge.rate`, fc.rate, 'number', 'step="0.01"');
  else if (fc.kind === 'per_kva') rows = field('Rate (₹/kVA/month)', `${targetPath}.fixedCharge.rate`, fc.rate, 'number', 'step="0.01"');
  else if (fc.kind === 'tiered') {
    const tp = `${targetPath}.fixedCharge.slabs`;
    rows = `<div class="ed-row ed-rowhdr ed-row-tier"><span>Up to load (kW)</span><span></span><span>Rate (₹)</span><span>Label (optional)</span><span></span></div>`
      + fc.slabs.map((s, i) => `<div class="ed-row ed-row-tier">
          <input type="number" data-path="${tp}.${i}.maxLoad" value="${esc(s.maxLoad)}" placeholder="kW" step="0.1" ${s.inf ? 'disabled' : ''}>
          <label class="ed-row-inf"><input type="checkbox" data-check="${tp}.${i}.inf" ${s.inf ? 'checked' : ''}> ∞</label>
          <input type="number" data-path="${tp}.${i}.rate" value="${esc(s.rate)}" placeholder="₹" step="0.01">
          <input type="text" data-path="${tp}.${i}.label" value="${esc(s.label)}" placeholder="e.g. Up to 2 kW">
          ${delBtn('delTier', tp, i, 'Remove tier')}
        </div>`).join('')
      + addBtn('addTier', tp, '+ Add tier');
  }
  return `<div class="ed-subhead">Fixed / Demand Charge</div>
    <div class="ed-field"><label>Type</label>
      <select data-kind="${targetPath}">${opt('flat', 'Flat ₹/month')}${opt('per_kw', 'Per kW of load')}${opt('per_kva', 'Per kVA of demand')}${opt('tiered', 'Tiered by load')}</select>
    </div>${rows}`;
}
function renderSlabs(targetPath, slabs) {
  const tp = `${targetPath}.energySlabs`;
  return `<div class="ed-subhead">Energy Slabs (telescopic — rate applies only within each band)</div>
    <div class="ed-row ed-rowhdr ed-row-slab"><span>Up to (cumulative units)</span><span></span><span>Rate (₹/unit)</span><span></span></div>`
    + slabs.map((s, i) => `<div class="ed-row ed-row-slab">
        <input type="number" data-path="${tp}.${i}.limit" value="${esc(s.limit)}" placeholder="upper limit" step="0.01" ${s.inf ? 'disabled' : ''}>
        <label class="ed-row-inf"><input type="checkbox" data-check="${tp}.${i}.inf" ${s.inf ? 'checked' : ''}> ∞ last</label>
        <input type="number" data-path="${tp}.${i}.rate" value="${esc(s.rate)}" placeholder="₹/unit" step="0.01">
        ${delBtn('delSlab', tp, i, 'Remove slab')}
      </div>`).join('')
    + addBtn('addSlab', tp, '+ Add slab');
}
function renderCharges(targetPath, charges) {
  const tp = `${targetPath}.additionalCharges`;
  const typeOpts = (sel) => [
    ['percent_energy', '% of energy'], ['percent_total', '% of fixed+energy'],
    ['per_unit', '₹ per unit'], ['flat', 'flat ₹'],
  ].map(([v, t]) => `<option value="${v}" ${sel === v ? 'selected' : ''}>${t}</option>`).join('');
  return `<div class="ed-subhead">Additional Charges (Electricity Duty, etc.)</div>`
    + (charges.length ? `<div class="ed-row ed-rowhdr ed-row-charge"><span>Name</span><span>Type</span><span>Rate</span><span></span></div>` : '')
    + charges.map((c, i) => `<div class="ed-row ed-row-charge">
        <input type="text" data-path="${tp}.${i}.name" value="${esc(c.name)}" placeholder="e.g. Electricity Duty">
        <select data-path="${tp}.${i}.type">${typeOpts(c.type)}</select>
        <input type="number" data-path="${tp}.${i}.rate" value="${esc(c.rate)}" placeholder="rate" step="0.01">
        ${delBtn('delCharge', tp, i, 'Remove charge')}
      </div>`).join('')
    + addBtn('addCharge', tp, '+ Add charge');
}
function renderTariffBody(targetPath, t) {
  return renderFixed(targetPath, t.fixedCharge)
    + renderSlabs(targetPath, t.energySlabs)
    + renderCharges(targetPath, t.additionalCharges)
    + `<div class="ed-preview-out" data-target="${targetPath}"></div>`;
}
function renderCategory(di, ci, c) {
  const p = `discoms.${di}.categories.${ci}`;
  const modeSel = `<div class="ed-field"><label>Structure</label>
    <select data-mode="${p}">
      <option value="direct" ${c.mode === 'direct' ? 'selected' : ''}>Single tariff (no sub-types)</option>
      <option value="supply" ${c.mode === 'supply' ? 'selected' : ''}>Split into supply types (urban/rural/…)</option>
    </select></div>`;
  let inner;
  if (c.mode === 'supply') {
    inner = c.supplyTypes.map((st, si) => {
      const sp = `${p}.supplyTypes.${si}`;
      return `<div class="ed-card ed-supply"><div class="ed-card-head"><h3>Supply type ${si + 1}</h3>${delBtn('delSupply', `${p}.supplyTypes`, si, 'Remove supply type')}</div>
        <div class="ed-card-body">
          <div class="ed-grid ed-grid-2">${field('ID', `${sp}.id`, st.id)}${field('Name', `${sp}.name`, st.name)}</div>
          ${field('Description (shown under the dropdown)', `${sp}.description`, st.description)}
          ${renderTariffBody(sp, st)}
        </div></div>`;
    }).join('') + addBtn('addSupply', `${p}.supplyTypes`, '+ Add supply type');
  } else {
    inner = renderTariffBody(p, c);
  }
  return `<div class="ed-card ed-category"><div class="ed-card-head"><h3>Category ${ci + 1}</h3>${delBtn('delCategory', `discoms.${di}.categories`, ci, 'Remove category')}</div>
    <div class="ed-card-body">
      <div class="ed-grid ed-grid-2">${field('ID (slug)', `${p}.id`, c.id)}${field('Name', `${p}.name`, c.name)}</div>
      ${field('Notes (optional, shown on the bill)', `${p}.notes`, c.notes)}
      ${modeSel}
      ${inner}
    </div></div>`;
}
function renderDiscom(di, d) {
  const p = `discoms.${di}`;
  const cats = d.categories.map((c, ci) => renderCategory(di, ci, c)).join('');
  return `<div class="ed-card ed-discom"><div class="ed-card-head"><h3>DISCOM ${di + 1}${d.name ? ' — ' + esc(d.name) : ''}</h3>${tariff.discoms.length > 1 ? delBtn('delDiscom', 'discoms', di, 'Remove DISCOM') : ''}</div>
    <div class="ed-card-body">
      <div class="ed-grid ed-grid-2">
        ${field('ID (slug, e.g. bescom)', `${p}.id`, d.id)}
        ${field('Short name (e.g. BESCOM)', `${p}.name`, d.name)}
      </div>
      ${field('Full name', `${p}.fullName`, d.fullName)}
      ${field('Area covered', `${p}.area`, d.area)}
      <div class="ed-grid ed-grid-3">
        ${field('Tariff year', `${p}.tariffYear`, d.tariffYear)}
        ${field('LPSC rate (%/mo)', `${p}.lpscRate`, d.lpscRate, 'number', 'step="0.1"')}
        ${field('Website', `${p}.website`, d.website)}
      </div>
      <div class="ed-subhead">Categories</div>
      ${cats}
      ${addBtn('addCategory', `${p}.categories`, '+ Add category')}
    </div></div>`;
}
function renderTariff() {
  const form = $('tariffForm');
  if (!tariff) { form.innerHTML = `<div class="ed-empty">Select a state to edit, or start a new one.</div>`; refreshTariffOutput(); return; }
  const stateBlock = `<div class="ed-card"><div class="ed-card-body">
      <div class="ed-grid ed-grid-2">
        ${field('State / UT name', 'state', tariff.state)}
        ${field('Current rates effective from (optional, YYYY-MM-DD)', 'currentRatesFrom', tariff.currentRatesFrom, 'text', 'placeholder="e.g. 2024-04-01"')}
      </div>
    </div></div>`;
  const discoms = tariff.discoms.map((d, di) => renderDiscom(di, d)).join('');
  form.innerHTML = stateBlock + discoms + addBtn('addDiscom', 'discoms', '+ Add DISCOM');
  refreshTariffOutput();
}

// ── Output / validation refresh (no re-render) ──
function refreshTariffOutput() {
  const valBox = $('tariffValidation');
  const out = $('tariffOutput').querySelector('code');
  const note = $('registryNote');
  if (!tariff) { valBox.innerHTML = ''; out.textContent = ''; note.style.display = 'none'; $('genFilename').textContent = 'file.js'; return; }

  const fname = (slug(tariff.state) || 'state') + '.js';
  $('genFilename').textContent = fname;

  const msgs = validateTariff(tariff);
  const errs = msgs.filter(m => m.level === 'err');
  valBox.innerHTML = (errs.length ? '' : `<div class="ed-vmsg ok">✓ Looks valid — ${tariff.discoms.length} DISCOM(s).</div>`)
    + msgs.map(m => `<div class="ed-vmsg ${m.level === 'err' ? 'err' : 'warn'}">${m.level === 'err' ? '✗' : '⚠'} ${esc(m.msg)}</div>`).join('');

  out.textContent = serializeStateFile(tariff);
  updatePreviews();

  // New-state registry wiring note
  if (tariff.state.trim() && !existingSlugs.has(slug(tariff.state))) {
    const sl = slug(tariff.state);
    const varName = '_' + sl.replace(/-/g, '_');
    note.style.display = 'block';
    note.innerHTML = `<strong>New state — also wire it into <code>registry.js</code>:</strong>
      add the import at the top, and add <code>${varName}</code> to the array passed to <code>.forEach</code>:
      <pre>import ${varName} from './${sl}.js';\n// …then add ${varName} to the [ … ] list</pre>`;
  } else {
    note.style.display = 'none';
  }
}

// ── Tariff event wiring (delegated, attached once) ──
function wireTariff() {
  const form = $('tariffForm');
  const onValue = e => {
    const p = e.target.dataset.path;
    if (p === undefined) return;
    setPath(tariff, p, e.target.value);
    refreshTariffOutput();
  };
  form.addEventListener('input', onValue);
  form.addEventListener('change', e => {
    if (e.target.dataset.path !== undefined) { onValue(e); return; }
    if (e.target.dataset.check !== undefined) { setPath(tariff, e.target.dataset.check, e.target.checked); renderTariff(); return; }
    if (e.target.dataset.kind !== undefined) { setFixedKind(getPath(tariff, e.target.dataset.kind), e.target.value); renderTariff(); return; }
    if (e.target.dataset.mode !== undefined) { setCategoryMode(getPath(tariff, e.target.dataset.mode), e.target.value); renderTariff(); return; }
  });
  form.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const path = btn.dataset.path;
    const idx = +btn.dataset.idx;
    const arr = getPath(tariff, path);
    switch (act) {
      case 'addDiscom':  arr.push(blankDiscom()); break;
      case 'delDiscom':  saveSnapshot(); arr.splice(idx, 1); break;
      case 'addCategory': arr.push(blankCategory()); break;
      case 'delCategory': saveSnapshot(); arr.splice(idx, 1); break;
      case 'addSupply':  arr.push(blankSupply()); break;
      case 'delSupply':  saveSnapshot(); arr.splice(idx, 1); break;
      case 'addSlab':    arr.push(blankSlab()); break;
      case 'delSlab':    saveSnapshot(); arr.splice(idx, 1); break;
      case 'addCharge':  arr.push(blankCharge()); break;
      case 'delCharge':  saveSnapshot(); arr.splice(idx, 1); break;
      case 'addTier':    arr.push({ maxLoad: '', inf: false, rate: '', label: '' }); break;
      case 'delTier':    saveSnapshot(); arr.splice(idx, 1); break;
    }
    renderTariff();
  });

  $('prevUnits').addEventListener('input', updatePreviews);
  $('prevLoad').addEventListener('input', updatePreviews);

  $('loadStateSelect').addEventListener('change', e => {
    if (!e.target.value) return;
    tariff = normModel(STATE_META[e.target.value]);
    renderTariff();
  });
  $('newStateBtn').addEventListener('click', () => {
    tariff = blankModel();
    $('loadStateSelect').value = '';
    renderTariff();
    toast('Started a new state');
  });
  $('copyTariffBtn').addEventListener('click', () => {
    if (!tariff) return;
    navigator.clipboard.writeText(serializeStateFile(tariff)).then(() => toast('Copied to clipboard'));
  });
  $('downloadTariffBtn').addEventListener('click', () => {
    if (!tariff) return;
    download((slug(tariff.state) || 'state') + '.js', serializeStateFile(tariff));
    toast('Downloaded ' + (slug(tariff.state) || 'state') + '.js');
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  FPPA BUILDER
// ════════════════════════════════════════════════════════════════════════════

let fppa = { byDiscom: {}, byState: {} };
const discomNameMap = {};

const cloneFppaTable = tbl => {
  const out = {};
  Object.keys(tbl).forEach(k => {
    out[k] = (tbl[k] || []).map(e => ({
      from: e.from || '', to: e.to || '', mode: e.mode || 'percent',
      rate: e.rate, label: e.label || '', source: e.source || '',
    }));
  });
  return out;
};

const FPPA_HEAD = `// js/tariffs/fppa.js
// Verified FPPA / FPPAS / PPAC / FAC values as notified by State Electricity Regulatory
// Commissions / DISCOMs. These vary by billing PERIOD (notified monthly or quarterly) and,
// in some states (e.g. Delhi), by DISCOM. Only values confirmed from official notices /
// credible reporting are listed; periods with no entry default to 0 (user-editable).
//
// Each entry: { from, to?, mode, rate, label, source }
//   mode: 'percent' (rate% of energy + demand/fixed charges) | 'per_unit' (₹/unit × units)
//   from/to: inclusive date window (YYYY-MM-DD). Omit \`to\` for an open-ended (current) rate.
// Entries are matched top-to-bottom, so list specific dated windows BEFORE open-ended ones.
//
// Generated by the in-browser tariff editor (editor.html).

import { findStateMetaByDiscom } from './registry.js';

// DISCOM-specific values (take priority over the state-wide table).
export const FPPA_BY_DISCOM = `;

const FPPA_MID = `;

// State-wide values (apply to every DISCOM in the state unless overridden above).
export const FPPA_BY_STATE = `;

const FPPA_FOOT = `;

function pick(list, billingDate) {
  if (!list || !list.length) return null;
  const bd = billingDate ? new Date(billingDate) : new Date();
  if (isNaN(bd)) return null;
  for (const e of list) {
    const from = new Date(e.from);
    const to   = e.to ? new Date(e.to) : null;
    if (bd >= from && (!to || bd <= to)) return e;
  }
  return null;
}

// Returns the verified FPPA entry for a DISCOM at a billing date, or null if none on record.
export function resolveFppaForDiscom(discomId, billingDate) {
  const byDiscom = pick(FPPA_BY_DISCOM[discomId], billingDate);
  if (byDiscom) return byDiscom;
  const meta = findStateMetaByDiscom(discomId);
  if (meta) return pick(FPPA_BY_STATE[meta.state], billingDate);
  return null;
}
`;

function buildFppaTable(tbl) {
  const out = {};
  Object.keys(tbl).forEach(k => {
    const entries = tbl[k].slice().sort((a, b) => String(b.from).localeCompare(String(a.from)));
    out[k] = entries.map(e => {
      const o = { from: e.from };
      if (e.to && e.to.trim()) o.to = e.to;
      o.mode = e.mode === 'per_unit' ? 'per_unit' : 'percent';
      o.rate = num(e.rate);
      if (e.label && e.label.trim()) o.label = e.label.trim();
      if (e.source && e.source.trim()) o.source = e.source.trim();
      return o;
    });
  });
  return out;
}
function serializeFppaFile() {
  return FPPA_HEAD + emitVal(buildFppaTable(fppa.byDiscom))
    + FPPA_MID + emitVal(buildFppaTable(fppa.byState)) + FPPA_FOOT;
}

function validateFppa() {
  const msgs = [];
  const check = (scope, key, list) => {
    const sorted = list.slice().sort((a, b) => String(a.from).localeCompare(String(b.from)));
    sorted.forEach((e, i) => {
      const lbl = `${scope} "${key}" — ${e.label || e.from || 'entry ' + (i + 1)}`;
      if (!e.from || isNaN(new Date(e.from))) msgs.push({ level: 'err', msg: `${lbl}: needs a valid "from" date.` });
      if (e.to && e.to.trim() && e.from && e.to < e.from) msgs.push({ level: 'err', msg: `${lbl}: "to" is before "from".` });
      if (e.rate === '' || e.rate == null || isNaN(+e.rate)) msgs.push({ level: 'warn', msg: `${lbl}: rate not set.` });
      if (i > 0) {
        const prev = sorted[i - 1];
        if (prev.to && prev.to.trim() && e.from && e.from <= prev.to) msgs.push({ level: 'warn', msg: `${lbl}: window overlaps the previous entry (ends ${prev.to}).` });
        else if ((!prev.to || !prev.to.trim()) && e.from) msgs.push({ level: 'warn', msg: `${lbl}: an earlier entry is open-ended, so this newer one is unreachable. Give the earlier one a "to" date.` });
      }
    });
  };
  Object.keys(fppa.byDiscom).forEach(k => check('DISCOM', k, fppa.byDiscom[k]));
  Object.keys(fppa.byState).forEach(k => check('State', k, fppa.byState[k]));
  return msgs;
}

function fppaRow(scope, key, e, i) {
  const m = () => [['percent', '% of charges'], ['per_unit', '₹/unit']]
    .map(([v, t]) => `<option value="${v}" ${e.mode === v ? 'selected' : ''}>${t}</option>`).join('');
  return `<div class="ed-fppa-row" data-scope="${scope}" data-key="${esc(key)}" data-idx="${i}">
      <input type="date" data-f="from" value="${esc(e.from)}" title="From">
      <input type="date" data-f="to" value="${esc(e.to)}" title="To (blank = open-ended)">
      <select data-f="mode">${m()}</select>
      <input type="number" data-f="rate" value="${esc(e.rate)}" step="0.01" placeholder="rate" title="Rate (may be negative)">
      <input type="text" data-f="label" value="${esc(e.label)}" placeholder="Label (e.g. Jul 2026)">
      <input type="text" data-f="source" value="${esc(e.source)}" placeholder="Source / citation">
      ${delBtn('delFppa', '', i, 'Remove entry')}
    </div>`;
}
function fppaGroup(scope, key, list) {
  const title = scope === 'byDiscom' ? `${esc(key)}${discomNameMap[key] ? ' — ' + esc(discomNameMap[key]) : ''}` : esc(key);
  const rows = list.length
    ? `<div class="ed-fppa-row ed-rowhdr"><span>From</span><span>To</span><span>Mode</span><span>Rate</span><span>Label</span><span>Source</span><span></span></div>` + list.map((e, i) => fppaRow(scope, key, e, i)).join('')
    : `<div class="ed-output-hint" style="margin:4px 0 8px">No entries yet.</div>`;
  return `<div class="ed-card" data-group-scope="${scope}" data-group-key="${esc(key)}"><div class="ed-card-head"><h3>${title}</h3>
      <button class="ed-btn ed-btn-sm" data-act="delGroup" title="Remove this group">Remove group</button></div>
    <div class="ed-card-body">
      ${rows}
      <button class="ed-btn-add" data-act="addFppa">+ Add entry</button>
    </div></div>`;
}
function renderFppa() {
  $('fppaDiscomGroups').innerHTML = Object.keys(fppa.byDiscom).sort().map(k => fppaGroup('byDiscom', k, fppa.byDiscom[k])).join('')
    || `<div class="ed-output-hint">No DISCOM-specific overrides. Add one above.</div>`;
  $('fppaStateGroups').innerHTML = Object.keys(fppa.byState).sort().map(k => fppaGroup('byState', k, fppa.byState[k])).join('')
    || `<div class="ed-output-hint">No state-wide entries yet. Add one above.</div>`;
  refreshFppaOutput();
}
function refreshFppaOutput() {
  const msgs = validateFppa();
  const errs = msgs.filter(m => m.level === 'err');
  const nGroups = Object.keys(fppa.byDiscom).length + Object.keys(fppa.byState).length;
  $('fppaValidation').innerHTML = (errs.length || !nGroups ? '' : `<div class="ed-vmsg ok">✓ ${nGroups} group(s) valid.</div>`)
    + msgs.map(m => `<div class="ed-vmsg ${m.level === 'err' ? 'err' : 'warn'}">${m.level === 'err' ? '✗' : '⚠'} ${esc(m.msg)}</div>`).join('');
  $('fppaOutput').querySelector('code').textContent = serializeFppaFile();
}
const newFppaEntry = () => ({ from: '', to: '', mode: 'percent', rate: '', label: '', source: '' });

function wireFppa() {
  const groupKey = el => { const g = el.closest('[data-group-scope]'); return g ? { scope: g.dataset.groupScope, key: g.dataset.groupKey } : null; };

  const onInput = e => {
    const f = e.target.dataset.f;
    if (!f) return;
    const row = e.target.closest('.ed-fppa-row');
    const g = groupKey(e.target);
    if (!row || !g) return;
    fppa[g.scope][g.key][+row.dataset.idx][f] = e.target.value;
    refreshFppaOutput();
  };
  ['fppaDiscomGroups', 'fppaStateGroups'].forEach(id => {
    const box = $(id);
    box.addEventListener('input', onInput);
    box.addEventListener('change', onInput);
    box.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const g = groupKey(btn);
      if (!g) return;
      if (btn.dataset.act === 'addFppa') fppa[g.scope][g.key].push(newFppaEntry());
      else if (btn.dataset.act === 'delFppa') fppa[g.scope][g.key].splice(+btn.closest('.ed-fppa-row').dataset.idx, 1);
      else if (btn.dataset.act === 'delGroup') delete fppa[g.scope][g.key];
      renderFppa();
    });
  });

  $('addDiscomFppa').addEventListener('change', e => {
    const id = e.target.value; e.target.value = '';
    if (!id) return;
    if (!fppa.byDiscom[id]) fppa.byDiscom[id] = [newFppaEntry()];
    renderFppa();
  });
  $('addStateFppa').addEventListener('change', e => {
    const st = e.target.value; e.target.value = '';
    if (!st) return;
    if (!fppa.byState[st]) fppa.byState[st] = [newFppaEntry()];
    renderFppa();
  });
  $('copyFppaBtn').addEventListener('click', () => navigator.clipboard.writeText(serializeFppaFile()).then(() => toast('Copied fppa.js')));
  $('downloadFppaBtn').addEventListener('click', () => { download('fppa.js', serializeFppaFile()); toast('Downloaded fppa.js'); });
}

// ════════════════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════════════════
function init() {
  // Tabs (with aria-selected)
  document.querySelectorAll('.ed-tab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.ed-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.ed-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    $('edpanel-' + btn.dataset.edtab).classList.add('active');
  }));

  // Populate state list + discom/state FPPA pickers
  const states = getStates();
  existingSlugs = new Set(states.map(slug));
  const stSel = $('loadStateSelect');
  const addState = $('addStateFppa');
  states.forEach(s => {
    stSel.insertAdjacentHTML('beforeend', `<option value="${esc(s)}">${esc(s)}</option>`);
    addState.insertAdjacentHTML('beforeend', `<option value="${esc(s)}">${esc(s)}</option>`);
    getDiscoms(s).forEach(d => {
      discomNameMap[d.id] = d.name;
      $('addDiscomFppa').insertAdjacentHTML('beforeend', `<option value="${esc(d.id)}">${esc(d.id)} — ${esc(d.name)}</option>`);
    });
  });

  // FPPA model from live data
  fppa = { byDiscom: cloneFppaTable(FPPA_BY_DISCOM), byState: cloneFppaTable(FPPA_BY_STATE) };

  wireTariff();
  wireFppa();
  renderTariff();
  renderFppa();

  // Undo button + Ctrl+Z
  $('undoBtn')?.addEventListener('click', undo);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  });
}
document.addEventListener('DOMContentLoaded', init);
