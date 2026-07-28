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
// Scope: parseBillText now extracts the bill's own charge lines (CHARGE_LABELS in
// bill-ocr.js), so stage 3 is a genuine line-by-line audit rather than a total-vs-total
// comparison. The honesty constraint moved rather than disappeared: only lines OCR actually
// read are scored, the verdict sums those lines rather than quoting the total gap, and the
// report never dresses itself as human work.

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

// The bill's own charge lines, kept from extraction so stage 3 can put them in the
// "On your bill" column. Not editable in stage 2: these are what the bill SAYS, and a
// user correcting them would defeat the point of comparing against them.
let billCharges = null;
let billMeta = null;

function renderConfirm(f, meta) {
  billCharges = f.charges || null;
  billMeta = { ...meta, billMonth: f.billMonth, billYear: f.billYear, fromDate: f.fromDate, toDate: f.toDate, consumerName: f.consumerName };
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

// ── stage 3: line-by-line audit report ───────────────────────────────────────
// Mirrors the structure of /bill-review/sample-report/ — case summary, line-by-line
// recomputation, findings with amounts, verdict, next steps — but is explicitly an
// AUTOMATED recomputation. It carries no case number, no analyst byline and no
// turnaround, because those represent human work this page does not do.
//
// The "On your bill" column comes from parseBillText's `charges` (CHARGE_LABELS in
// bill-ocr.js). Any line OCR could not read is shown as "not read" and excluded from both
// the findings and the verdict — a blank is never treated as a zero, which would invent a
// discrepancy the size of the whole line.

// `modelled: false` means the engine does not compute that line at all (meter rent,
// rebates, LPSC), so its presence on the bill is reported but never scored.
function auditLines(bill, charges, fppa) {
  const ed = (bill.extraCharges || []).find((e) => /duty/i.test(e.name));
  const rows = [
    { key: 'energy',    label: 'Energy charge',          ours: bill.totalEnergy,  modelled: true },
    { key: 'fixed',     label: 'Fixed / demand charge',  ours: bill.fixedCharge,  modelled: true },
    { key: 'fppa',      label: fppa ? `Fuel surcharge (${fppa.rate}${fppa.mode === 'percent' ? '%' : '/unit'}, verified)` : 'Fuel surcharge', ours: bill.facAmount, modelled: true },
    { key: 'duty',      label: ed ? ed.name : 'Electricity duty', ours: ed ? ed.amount : 0, modelled: true },
    { key: 'wheeling',  label: bill.wheelingLabel || 'Wheeling charges', ours: bill.wheelingCharge, modelled: !!bill.wheelingCharge },
    { key: 'meterRent', label: 'Meter rent',             ours: null, modelled: false },
    { key: 'lpsc',      label: 'Late payment surcharge', ours: null, modelled: false },
    { key: 'rebate',    label: 'Rebate',                 ours: null, modelled: false },
  ];
  return rows
    .map((r) => {
      const theirs = charges && charges[r.key] != null ? charges[r.key] : null;
      const read = theirs !== null;
      const comparable = read && r.modelled;
      return { ...r, theirs, read, comparable, diff: comparable ? theirs - r.ours : null };
    })
    // Drop rows neither on the bill nor in our recomputation — an empty row for every
    // charge type a bill *might* carry is noise, not transparency.
    .filter((r) => r.read || (r.modelled && Math.abs(r.ours || 0) > 0.005));
}

// Each finding states what differs, by how much, and the likeliest mechanical cause.
// None is emitted without both numbers in hand.
function auditFindings(rows, ctx) {
  const out = [];
  const TOL = 1;   // a rupee of rounding is not a finding
  for (const r of rows) {
    if (!r.comparable || Math.abs(r.diff) <= TOL) continue;
    const amt = rs2(Math.abs(r.diff));
    const over = r.diff > 0;

    if (r.key === 'fixed') {
      // Back out the load the bill's own fixed charge implies. Far more actionable than a
      // per-kW rate — "your bill is charging as if you had 4 kW" is a sentence you can put
      // to the DISCOM, and it is a straight ratio because the charge is linear within a band.
      const perKw = ctx.load > 0 ? r.ours / ctx.load : 0;
      const impliedLoad = perKw > 0 ? r.theirs / perKw : null;
      const hint = impliedLoad && Math.abs(impliedLoad - ctx.load) > 0.05
        ? ` At that rate your bill is charging as if the sanctioned load were about <strong>${(Math.round(impliedLoad * 10) / 10)} kW</strong>, not ${ctx.load} kW.`
        : '';
      out.push({ title: `Fixed charge differs by ${amt}`, over, body:
        `Your bill shows <strong>${rs2(r.theirs)}</strong>; on a <strong>${ctx.load} kW</strong> sanctioned load the tariff gives <strong>${rs2(r.ours)}</strong>. The fixed charge is set by the load band, so a gap here usually means the bill is levying it on a different load than the one you entered — check the "Sanctioned / Connected Load" printed on the bill.${hint}` });
    } else if (r.key === 'fppa') {
      out.push({ title: `Fuel surcharge differs by ${amt}`, over, body:
        `Your bill shows <strong>${rs2(r.theirs)}</strong>; the rate we hold${ctx.fppa ? ` for this DISCOM (<strong>${ctx.fppa.rate}${ctx.fppa.mode === 'percent' ? '%' : ' per unit'}</strong>)` : ''} gives <strong>${rs2(r.ours)}</strong>. This surcharge is revised monthly, so the commonest explanation is that your bill used a different month's rate — check which period the bill states before treating it as an error.` });
    } else if (r.key === 'energy') {
      out.push({ title: `Energy charge differs by ${amt}`, over, body:
        `Your bill shows <strong>${rs2(r.theirs)}</strong> for <strong>${ctx.units} units</strong>; the published slabs give <strong>${rs2(r.ours)}</strong>. This is the slab calculation itself, so a gap points at the units billed, the tariff category, or a billing period longer than a month pushing units into higher slabs.` });
    } else if (r.key === 'duty') {
      out.push({ title: `Electricity duty differs by ${amt}`, over, body:
        `Duty is a percentage, so it moves with the lines above it. If the energy or fixed charge is wrong, this follows automatically — correct those first, then re-check this one.` });
    } else {
      out.push({ title: `${r.label} differs by ${amt}`, over, body:
        `Your bill shows <strong>${rs2(r.theirs)}</strong> against our <strong>${rs2(r.ours)}</strong>.` });
    }
  }
  // On the bill but not modelled by us — reported, never scored.
  for (const r of rows.filter((x) => x.read && !x.modelled && Math.abs(x.theirs) > 0.005)) {
    out.push({ title: `${r.label}: ${rs2(r.theirs)} on your bill`, over: null, body:
      r.key === 'lpsc'
        ? 'A late-payment surcharge is only due if the previous bill was actually paid late. If you paid on time and it still appears, ask for a reversal and keep the receipt — this is one of the commonest recoverable charges.'
        : 'We do not recompute this line, so it is listed for completeness rather than checked.' });
  }
  return out;
}

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
  const rows = auditLines(bill, billCharges, fppa);
  const findings = auditFindings(rows, { load, units, fppa });
  const readCount = rows.filter((r) => r.read).length;
  const comparable = rows.filter((r) => r.comparable);
  // The verdict is the sum of the lines we could actually compare — NOT the difference of
  // the two totals. Those differ whenever a line was unreadable, and quoting the total gap
  // as if it were attributable would be the exact overreach this report is built to avoid.
  const scored = comparable.reduce((s, r) => s + r.diff, 0);
  const TOL = 1;
  const overs = comparable.filter((r) => r.diff > TOL);
  const unders = comparable.filter((r) => r.diff < -TOL);

  const period = billMeta && billMeta.fromDate && billMeta.toDate
    ? `${esc(billMeta.fromDate.display)} – ${esc(billMeta.toDate.display)}`
    : (billMeta && billMeta.billMonth
        ? new Date(billMeta.billYear || new Date().getFullYear(), billMeta.billMonth - 1, 1)
            .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : 'not read from the bill');

  const cell = (r) => r.read ? rs2(r.theirs) : '<span class="bca-unread">not read</span>';
  const ourCell = (r) => r.modelled ? rs2(r.ours || 0) : '<span class="bca-unread">not modelled</span>';
  const diffCell = (r) => {
    if (!r.comparable) return '<span class="bca-unread">—</span>';
    if (Math.abs(r.diff) <= TOL) return '<span class="bca-ok">matches</span>';
    return `<strong class="${r.diff > 0 ? 'bca-over' : 'bca-under'}">${r.diff > 0 ? '+' : '−'}${rs2(Math.abs(r.diff)).slice(1)}</strong>`;
  };

  const verdictLine = !comparable.length
    ? 'No charge lines could be read from this bill, so there is nothing to compare line by line.'
    : overs.length
      ? `<strong>${rs2(scored)}</strong> more than the published tariff produces across the ${comparable.length} line${comparable.length > 1 ? 's' : ''} we could check.`
      : unders.length
        ? `<strong>${rs2(Math.abs(scored))}</strong> less than the tariff produces — usually a subsidy or rebate we do not model.`
        : `Every charge line we could read matches the published tariff.`;

  const verdictHead = !comparable.length ? { cls: '', icon: '🧾', t: 'Nothing to compare' }
    : overs.length ? { cls: 'sub-bad', icon: '🚩', t: `${rs2(scored)} above the tariff` }
    : unders.length ? { cls: 'sub-good', icon: 'ℹ️', t: `${rs2(Math.abs(scored))} below the tariff` }
    : { cls: 'sub-good', icon: '✅', t: 'Your bill checks out' };

  $('bcResultBody').innerHTML = `
  <div class="bca-report">
    <div class="bca-head">
      <div>
        <strong>Electricity Bill Audit Report</strong>
        <span>Automated recomputation by TheDiscomBill's tariff engine · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <span class="bca-src">thediscombill.com</span>
    </div>

    <p class="bca-machine">This report was produced by software, not by a person. It recomputes your bill
    from published tariff data and compares each line it could read. It is a starting point for a
    conversation with your DISCOM, not a certified audit.</p>

    <section class="bca-block">
      <h3>Case summary</h3>
      <div class="tsm-table-wrap"><table class="tsm-table bca-summary">
        <tbody>
          <tr><td>DISCOM &amp; tariff</td><td>${esc(bill.discom.name)} — ${esc(bill.category ? bill.category.name : '')}${bill.supplyTypeName ? ', ' + esc(bill.supplyTypeName) : ''}</td></tr>
          <tr><td>Sanctioned load</td><td>${load} kW</td></tr>
          <tr><td>Billing period</td><td>${period} · ${units} units</td></tr>
          <tr><td>Rates applied</td><td>${esc(bill.tariffPeriodLabel || '')}${bill.tariffVerified ? ' — checked against the published tariff order' : ' — representative estimate, not a verified order'}</td></tr>
          <tr><td>Read from your bill</td><td>${readCount} of ${rows.length} charge lines${billMeta && billMeta.cloud ? ' (cloud OCR)' : ' (read on your device)'}</td></tr>
        </tbody>
      </table></div>
    </section>

    <section class="bca-block">
      <h3>Line-by-line recomputation</h3>
      <div class="tsm-table-wrap"><table class="tsm-table">
        <thead><tr><th>Charge line</th><th class="num">On your bill</th><th class="num">Recomputed</th><th class="num">Difference</th></tr></thead>
        <tbody>
          ${rows.map((r) => `<tr><td>${esc(r.label)}</td><td class="num">${cell(r)}</td><td class="num">${ourCell(r)}</td><td class="num">${diffCell(r)}</td></tr>`).join('')}
        </tbody>
        <tfoot>
          <tr><td>Total${haveBill ? '' : ' (recomputed)'}</td>
              <td class="num">${haveBill ? rs2(billAmount) : '<span class="bca-unread">not read</span>'}</td>
              <td class="num"><strong>${rs2(ours)}</strong></td>
              <td class="num">${haveBill ? `<strong>${billAmount - ours >= 0 ? '+' : '−'}${rs2(Math.abs(billAmount - ours)).slice(1)}</strong>` : '—'}</td></tr>
        </tfoot>
      </table></div>
      ${readCount < rows.length ? '<p class="rc-note"><strong>Lines marked "not read"</strong> could not be picked out of your bill by OCR. They are excluded from the findings and the verdict — a line we could not read is never assumed to be zero.</p>' : ''}
    </section>

    ${findings.length ? `<section class="bca-block">
      <h3>Findings</h3>
      <ol class="bca-findings">
        ${findings.map((f) => `<li class="${f.over === null ? '' : f.over ? 'is-over' : 'is-under'}">
          <strong>${f.title}</strong>
          <p>${f.body}</p></li>`).join('')}
      </ol>
    </section>` : ''}

    <section class="bca-block">
      <h3>Verdict</h3>
      <div class="sub-card ${verdictHead.cls}">
        <div class="sub-card-head"><span class="sub-icon">${verdictHead.icon}</span>
          <div><strong>${verdictHead.t}</strong><span class="sub-verdict">${comparable.length} of ${rows.length} lines compared</span></div></div>
        <div class="sub-card-body"><p>${verdictLine}</p>
        ${haveBill && comparable.length ? `<p class="rc-note">The totals differ by ${rs2(Math.abs(billAmount - ours))}, of which ${rs2(Math.abs(scored))} is attributable to the lines above. The remainder sits in lines we could not read or do not model ${'—'} including anything carried over from a previous bill.</p>` : ''}</div>
      </div>
    </section>

    ${overs.length ? `<section class="bca-block">
      <h3>Recommended next steps</h3>
      <ol class="tsm-steps">
        <li><strong>Check the disputed line against your bill</strong> — start with the fixed charge and the sanctioned load, which account for most discrepancies.</li>
        <li><strong>Raise a billing complaint</strong> with ${esc(bill.discom.name)} quoting the specific line and amount, not "my bill is too high". The <a href="/complaint/">complaint helper</a> has the portal and the 1912 helpline for your state.</li>
        <li><strong>Ask for a revised bill</strong>, not an adjustment promise, and note the complaint number.</li>
        <li><strong>Pay the undisputed amount</strong> before the due date so no late-payment surcharge accrues while the complaint is open.</li>
        <li><strong>If there is no revision in 30 days</strong>, escalate to the Consumer Grievance Redressal Forum with the complaint number and this recomputation.</li>
      </ol>
    </section>` : ''}

    <p class="bca-foot">Generated from published ${esc(bill.discom.name)} tariff data. OCR can misread a printed
    figure and tariffs change through the year — verify against the bill before relying on this. Not a legal document.</p>

    <div class="bc-actions no-print">
      <button type="button" class="btn-calculate" id="bcPrint">🖨️ Print / Save as PDF</button>
      <a class="btn-clear" href="/bill-review/">Get a human expert review</a>
      <button type="button" class="btn-clear" id="bcRestart">Check another bill</button>
    </div>
  </div>`;

  $('bcPrint')?.addEventListener('click', () => window.print());

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
