// check-my-bill.js — /check-my-bill/ : upload a bill, confirm what we read, recompute it.
//
// (Not to be confused with bill-check.js, which powers /bill-check/ — the DISCOM
// portal-links page. Different feature, unfortunately adjacent name.)
//
// Three deliberate stages, because the failure mode this page has to avoid is a
// confidently wrong verdict:
//   1. upload   — the page's only job until a file arrives
//   2. confirm  — every extracted field shown and EDITABLE before anything is computed.
//                 OCR on Indian bills is variable; the user is the check on it, and this
//                 stage is what the old homepage autofill never had.
//   3. result   — engine recomputation vs the total printed on the bill
//
// Scope note: this compares TOTAL vs TOTAL. parseBillText does not extract per-line charges
// (energy / fixed / FPPA / duty are not in its output), so a line-by-line audit like
// /bill-review/sample-report/ is not honestly derivable here yet. The copy says so plainly
// rather than implying otherwise, and points at the human review for that.

import { extractBillFields } from './bill-ocr.js';
import { calculateBill } from './engine.js';
import { resolveFppaForDiscom } from './tariffs/fppa-resolve.js';
import {
  getStates, getDiscoms, getCategories, getDefaultCategory,
  getSupplyTypes, getDefaultSupplyType,
} from './tariffs/registry.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rs = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const rs2 = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── stage plumbing ───────────────────────────────────────────────────────────
function show(stage) {
  for (const s of ['Upload', 'Confirm', 'Result']) {
    const el = $('bc' + s);
    if (el) el.hidden = (s.toLowerCase() !== stage);
  }
  const order = { upload: 0, confirm: 1, result: 2 };
  document.querySelectorAll('.bc-step').forEach((el, i) => {
    el.classList.toggle('is-active', i === order[stage]);
    el.classList.toggle('is-done', i < order[stage]);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── stage 2: confirm ─────────────────────────────────────────────────────────
function fillDiscoms(state, want) {
  const sel = $('bcDiscom');
  const list = getDiscoms(state) || [];
  sel.innerHTML = list.map((d) => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (want && list.some((d) => d.id === want)) sel.value = want;
  return fillCategories();
}

function fillCategories(wantCat) {
  const discomId = $('bcDiscom').value;
  const sel = $('bcCategory');
  const cats = getCategories(discomId) || [];
  sel.innerHTML = cats.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  // OCR gives the code printed on the bill ("LMV-1", "LT-I"), not our internal id —
  // match on the visible name.
  let matched = null;
  if (wantCat) {
    const up = String(wantCat).toUpperCase();
    matched = cats.find((c) => (c.name + ' ' + c.id).toUpperCase().includes(up));
  }
  if (matched) sel.value = matched.id;
  else { const def = getDefaultCategory(discomId, 'domestic'); if (def) sel.value = def.id; }
  fillSupplyTypes();
  return !!matched;
}

function fillSupplyTypes(wantSt) {
  const sel = $('bcSupply');
  const wrap = sel.closest('.bc-field');
  const types = getSupplyTypes($('bcDiscom').value, $('bcCategory').value) || [];
  if (!types.length) { sel.innerHTML = ''; wrap.hidden = true; return; }
  wrap.hidden = false;
  sel.innerHTML = types.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
  let matched = null;
  if (wantSt) {
    const num = String(wantSt).replace(/[^0-9]/g, '');
    if (num) {
      const re = new RegExp(`\\bST\\s*[-–]?\\s*${num}\\b`, 'i');
      matched = types.find((t) => re.test(t.id + ' ' + t.name));
    }
  }
  if (matched) sel.value = matched.id;
  else { const def = getDefaultSupplyType($('bcDiscom').value, $('bcCategory').value); if (def) sel.value = def.id; }
}

// A field the parser could not read is the one most likely to skew the result, so it gets
// marked rather than left looking like a confident value.
function mark(id, got) {
  const wrap = $(id)?.closest('.bc-field');
  if (wrap) wrap.classList.toggle('bc-missing', !got);
}

function renderConfirm(f, meta) {
  const states = getStates();
  const stSel = $('bcState');
  stSel.innerHTML = states.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  const gotDiscom = !!(f.discom && states.includes(f.discom.state));
  stSel.value = gotDiscom ? f.discom.state : (states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0]);
  fillDiscoms(stSel.value, gotDiscom ? f.discom.id : null);
  const gotCat = fillCategories(f.category);
  fillSupplyTypes(f.supplyType);

  $('bcUnits').value = f.units != null ? f.units
    : (f.prevRead != null && f.currRead != null
        ? Math.max(0, Math.round((f.currRead - f.prevRead) * (f.mf || 1))) : '');
  $('bcLoad').value = f.sanctionedLoad != null ? f.sanctionedLoad : '';
  $('bcBillAmount').value = f.billAmount != null ? f.billAmount : '';
  $('bcArrears').value = f.arrears != null ? f.arrears : 0;

  mark('bcDiscom', gotDiscom);
  mark('bcCategory', gotCat);
  mark('bcUnits', $('bcUnits').value !== '');
  mark('bcLoad', f.sanctionedLoad != null);
  mark('bcBillAmount', f.billAmount != null);

  const read = [];
  if (gotDiscom) read.push(f.discom.name);
  if ($('bcUnits').value !== '') read.push($('bcUnits').value + ' units');
  if (f.sanctionedLoad != null) read.push(f.sanctionedLoad + ' kW');
  if (f.billAmount != null) read.push(rs(f.billAmount) + ' on the bill');
  if (f.consumerName) read.push(f.consumerName);

  const missing = document.querySelectorAll('.bc-missing').length;
  $('bcReadSummary').innerHTML = read.length
    ? `Read from your bill: <strong>${esc(read.join(' · '))}</strong>`
    : 'We could not read much from this file — fill the fields in yourself below.';
  const note = $('bcMissingNote');
  note.hidden = missing === 0;
  if (missing) {
    note.innerHTML = `<strong>${missing} field${missing > 1 ? 's' : ''} could not be read</strong> and ${missing > 1 ? 'are' : 'is'} highlighted below. Fill ${missing > 1 ? 'them' : 'it'} in — the recomputation is only as good as these inputs.`;
  }
  $('bcEngineNote').textContent = meta.cloud
    ? 'Read with cloud OCR.'
    : 'Read on this device — nothing was uploaded.';
  const cn = $('bcCloudNote');
  if (meta.note) { cn.hidden = false; cn.textContent = meta.note; } else cn.hidden = true;

  show('confirm');
}

// ── stage 3: recompute ───────────────────────────────────────────────────────
function recompute() {
  const discomId = $('bcDiscom').value;
  const categoryId = $('bcCategory').value;
  const stWrap = $('bcSupply').closest('.bc-field');
  const supplyTypeId = stWrap.hidden ? undefined : $('bcSupply').value;
  const units = parseFloat($('bcUnits').value);
  const load = parseFloat($('bcLoad').value) || 1;
  const billAmount = parseFloat($('bcBillAmount').value);
  const arrears = parseFloat($('bcArrears').value) || 0;

  if (!(units > 0)) {
    $('bcResultBody').innerHTML = '<p class="ocr-fail">Enter the units consumed — without them there is nothing to recompute.</p>';
    show('result');
    return;
  }

  // Apply the verified FPPA/PPAC for this DISCOM where we publish one. Real bills almost
  // always carry it, so omitting it would manufacture a phantom gap and wrongly imply an error.
  const fppa = resolveFppaForDiscom(discomId, null);
  const bill = calculateBill({
    discomId, categoryId, supplyTypeId, units, connectedLoadKw: load, arrears,
    facRate: fppa ? fppa.rate : 0,
    facMode: fppa ? fppa.mode : 'per_unit',
  });
  if (bill.error) {
    $('bcResultBody').innerHTML = `<p class="ocr-fail">${esc(bill.message)}</p>`;
    show('result');
    return;
  }

  const ours = bill.totalPayable;
  const haveBill = billAmount > 0;
  const diff = haveBill ? billAmount - ours : null;
  // A couple of percent is rounding, a stale surcharge or a part-month — not a finding.
  const tol = Math.max(50, ours * 0.02);
  const verdict = !haveBill ? 'none' : Math.abs(diff) <= tol ? 'match' : diff > 0 ? 'higher' : 'lower';

  const slabRows = (bill.slabBreakdown || [])
    .map((s) => `<tr><td>${esc(s.label)}</td><td class="num">${s.units} × ${rs2(s.rate)}</td><td class="num">${rs2(s.amount)}</td></tr>`)
    .join('');
  const extras = [];
  if (bill.fixedCharge) extras.push([`Fixed / demand charge (${load} kW)`, bill.fixedCharge]);
  if (bill.facAmount) extras.push([`FPPA / fuel surcharge — ${fppa.rate}${fppa.mode === 'percent' ? '%' : ' /unit'}, verified`, bill.facAmount]);
  for (const e of bill.extraCharges || []) if (e.amount) extras.push([esc(e.name), e.amount]);
  if (bill.subsidyAmount) extras.push([esc(bill.subsidyLabel || 'Subsidy'), -bill.subsidyAmount]);
  if (arrears) extras.push(['Previous dues (as entered)', arrears]);

  const head = verdict === 'match'
    ? { cls: 'sub-good', icon: '✅', title: 'Your bill matches the tariff', sub: `within ${rs(Math.abs(diff))} of our recomputation` }
    : verdict === 'higher'
      ? { cls: 'sub-bad', icon: '🔎', title: `Your bill is ${rs(diff)} above our recomputation`, sub: 'worth checking — see what usually explains this' }
      : verdict === 'lower'
        ? { cls: 'sub-good', icon: '🔎', title: `Your bill is ${rs(Math.abs(diff))} below our recomputation`, sub: 'usually a subsidy or rebate we have not applied' }
        : { cls: '', icon: '🧮', title: 'Recomputed from the tariff', sub: 'add your bill total above to compare' };

  // Ranked causes. These are things to CHECK, not defects we claim to have found — with only
  // the printed total we cannot attribute a gap to any single line, and saying otherwise
  // would be the exact overreach this page is designed to avoid.
  const causes = [];
  if (verdict === 'higher') {
    causes.push(['Sanctioned load', `We billed the fixed charge on <strong>${load} kW</strong>. If your bill shows a higher load, its fixed charge is higher too — the commonest single cause of a gap.`]);
    if (!fppa) causes.push(['Fuel surcharge', 'We hold no verified FPPA/PPAC for this DISCOM, so none was applied. Your bill almost certainly carries one, and it would account for part of this gap.']);
    causes.push(['Arrears and late-payment surcharge', 'Anything carried over from last month appears on the bill but not here unless you entered it above.']);
    causes.push(['Tariff category', `We used <strong>${esc(bill.category ? bill.category.name : categoryId)}</strong>. A commercial or non-domestic category costs materially more — check the code printed on your bill.`]);
    causes.push(['Billing period', 'A cycle longer than about 30 days pushes more units into the higher slabs.']);
  } else if (verdict === 'lower') {
    causes.push(['Government subsidy', 'A state subsidy or rebate applied on your bill may not be modelled here.']);
    causes.push(['Payments and adjustments', 'Credits posted during the period reduce the printed total.']);
  }

  $('bcResultBody').innerHTML = `
    <div class="sub-cards">
      <div class="sub-card ${head.cls}">
        <div class="sub-card-head"><span class="sub-icon">${head.icon}</span>
          <div><strong>${head.title}</strong><span class="sub-verdict">${head.sub}</span></div></div>
        <div class="sub-card-body">
          <div class="rc-stats">
            <div class="rc-stat"><span class="rc-stat-label">Printed on your bill</span>
              <span class="rc-stat-value">${haveBill ? rs(billAmount) : '—'}</span></div>
            <div class="rc-stat"><span class="rc-stat-label">Our recomputation</span>
              <span class="rc-stat-value">${rs(ours)}</span></div>
            ${haveBill ? `<div class="rc-stat rc-stat-hero"><span class="rc-stat-label">Difference</span>
              <span class="rc-stat-value">${diff >= 0 ? '+' : '−'}${rs(Math.abs(diff)).slice(1)}</span></div>` : ''}
          </div>
          <p class="rc-note">${esc(bill.discom.name)} · ${esc(bill.category ? bill.category.name : '')} · ${units} units · ${load} kW ·
          ${esc(bill.tariffPeriodLabel || '')} rates.
          ${bill.tariffVerified
            ? 'These rates are checked against the published tariff order.'
            : 'These rates are a representative estimate rather than a verified tariff order — treat the comparison as indicative.'}</p>
        </div>
      </div>

      <div class="sub-card">
        <div class="sub-card-head"><span class="sub-icon">🧾</span>
          <div><strong>How we got ${rs(ours)}</strong><span class="sub-verdict">slab by slab</span></div></div>
        <div class="sub-card-body">
          <div class="tsm-table-wrap"><table class="tsm-table">
            <thead><tr><th>Line</th><th class="num">Working</th><th class="num">Amount</th></tr></thead>
            <tbody>
              ${slabRows}
              ${extras.map(([l, a]) => `<tr><td>${l}</td><td class="num">—</td><td class="num">${rs2(a)}</td></tr>`).join('')}
            </tbody>
            <tfoot><tr><td>Total</td><td class="num">—</td><td class="num"><strong>${rs2(ours)}</strong></td></tr></tfoot>
          </table></div>
        </div>
      </div>

      ${causes.length ? `<div class="sub-card">
        <div class="sub-card-head"><span class="sub-icon">📋</span>
          <div><strong>What usually explains a gap this size</strong>
          <span class="sub-verdict">check these against your bill, in this order</span></div></div>
        <div class="sub-card-body">
          <ol class="tsm-steps">
            ${causes.map(([t, d]) => `<li><strong>${t}.</strong> ${d}</li>`).join('')}
          </ol>
        </div>
      </div>` : ''}

      <div class="sub-card">
        <div class="sub-card-head"><span class="sub-icon">👤</span>
          <div><strong>This compared totals, not lines</strong><span class="sub-verdict">what a human review adds</span></div></div>
        <div class="sub-card-body">
          <p>This page reads the amount printed on your bill and recomputes what the published tariff
          produces for the same inputs. It does <strong>not</strong> yet read your bill's own energy,
          fixed, surcharge and duty lines separately — so where there is a gap, it can tell you the
          size but not which line caused it.</p>
          <p>A TheDiscomBill analyst rechecks every charge line against the tariff order in force for
          your billing period, states each discrepancy in rupees, and gives you a verdict and next
          steps. <a href="/bill-review/sample-report/">See a sample report →</a></p>
          <p class="bc-actions">
            <a class="btn-calculate" href="/bill-review/">Get a free expert review</a>
            <button type="button" class="btn-clear" id="bcRestart">Check another bill</button>
          </p>
        </div>
      </div>
    </div>`;

  $('bcRestart')?.addEventListener('click', () => show('upload'));
  show('result');
}

// ── stage 1: upload ──────────────────────────────────────────────────────────
function initUpload() {
  const input = $('bcFile');
  const drop = $('bcDrop');
  const prog = $('bcProgress');
  const bar = $('bcProgressBar');
  const status = $('bcStatus');
  const fail = $('bcFail');

  const setStatus = (t) => { status.textContent = t; };
  const setProgress = (p) => { bar.style.width = Math.round(p * 100) + '%'; };

  // Cloud OCR uploads the image, so it asks first (once per session). Declining is a
  // first-class choice, not a dead end — on-device OCR still runs.
  const askCloudConsent = () => {
    if (sessionStorage.getItem('ocrCloudConsent') === 'yes') return Promise.resolve(true);
    return new Promise((resolve) => {
      prog.hidden = true;
      fail.hidden = false;
      fail.innerHTML = `<div class="bc-consent">
        <strong>Read this scan in the cloud?</strong>
        <p>A photo or scanned PDF reads far more accurately through our cloud OCR. The image is
        passed through for reading and <strong>not stored</strong>. Choose on-device instead and
        nothing leaves your phone — it is just less accurate on noisy scans.</p>
        <p class="bc-actions">
          <button type="button" class="btn-calculate" id="bcConsentYes">Use cloud OCR</button>
          <button type="button" class="btn-clear" id="bcConsentNo">Keep it on my device</button>
        </p></div>`;
      $('bcConsentYes').addEventListener('click', () => {
        sessionStorage.setItem('ocrCloudConsent', 'yes');
        fail.hidden = true; prog.hidden = false; resolve(true);
      });
      $('bcConsentNo').addEventListener('click', () => {
        fail.hidden = true; prog.hidden = false; resolve(false);
      });
    });
  };

  async function handle(file) {
    if (!file) return;
    fail.hidden = true; fail.innerHTML = '';
    prog.hidden = false;
    setProgress(0); setStatus('Preparing…');
    try {
      const { fields, cloud, note } = await extractBillFields(file, { setStatus, setProgress, askCloudConsent });
      prog.hidden = true;
      renderConfirm(fields, { cloud, note });
    } catch (err) {
      console.error('Bill check failed:', err);
      prog.hidden = true;
      fail.hidden = false;
      fail.innerHTML = `<p class="ocr-fail">Could not read that file (${esc(err && err.message ? err.message : 'unknown error')}).
        Try a sharper, straight-on photo or a screenshot of the PDF — or
        <a href="/#calculator">enter the figures yourself in the calculator</a>.</p>`;
    }
  }

  input?.addEventListener('change', () => { const f = input.files && input.files[0]; input.value = ''; handle(f); });
  drop?.addEventListener('click', () => input.click());
  drop?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  ['dragenter', 'dragover'].forEach((ev) =>
    drop?.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    drop?.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop?.addEventListener('drop', (e) => handle(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]));
}

function init() {
  if (!$('bcDrop')) return;   // not on this page
  initUpload();
  $('bcState').addEventListener('change', () => fillDiscoms($('bcState').value));
  $('bcDiscom').addEventListener('change', () => fillCategories());
  $('bcCategory').addEventListener('change', () => fillSupplyTypes());
  $('bcRecompute').addEventListener('click', recompute);
  $('bcBack').addEventListener('click', () => show('upload'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
