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
import { tariffProvenanceHtml } from './tariff-provenance.js';
import { resolveFppaForDiscom } from './tariffs/fppa-resolve.js';
import {
  getStates, getDiscoms, getCategories, getDefaultCategory,
  getSupplyTypes, getDefaultSupplyType, ensureState } from './tariffs/registry.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Sign goes OUTSIDE the symbol — "−₹89.62", not "₹-89.62". Credits are common here
// (a negative fuel-surcharge adjustment, a rebate), so this is not a rare path.
const rs = (n) => (n < 0 ? '−' : '') + '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
const rs2 = (n) => (n < 0 ? '−' : '') + '₹' + Math.abs(Number(n)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── stage plumbing ───────────────────────────────────────────────────────────
function show(stage) {
  for (const s of ['Upload', 'Confirm', 'Result']) {
    const el = $('bc' + s);
    if (el) el.hidden = (s.toLowerCase() !== stage);
  }
  // The escalation to a human reviewer rides with the result stage: offering it before the
  // user has a recomputation in hand would just be the old two-parallel-choices problem in
  // a new place. It is a rung above the self-check, not an alternative to it.
  const esc = $('bcEscalate');
  if (esc) esc.hidden = (stage !== 'result');
  const order = { upload: 0, confirm: 1, result: 2 };
  document.querySelectorAll('.bc-step').forEach((el, i) => {
    el.classList.toggle('is-active', i === order[stage]);
    el.classList.toggle('is-done', i < order[stage]);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── stage 2: confirm ─────────────────────────────────────────────────────────
// draw()/fillCategories() below read discom.categories, so the state's tariff tables must
// be loaded first. DISCOM names come from the registry index and need no await.
async function fillDiscoms(state, want) {
  if (state) await ensureState(state);
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

// Async because fillDiscoms now fetches the detected state's tariff tables, and the two
// calls straight after it read those tables. Awaiting is not optional here: without it
// fillCategories() runs against an unloaded state and the registry throws.
async function renderConfirm(f, meta) {
  billCharges = f.charges || null;
  billMeta = { ...meta, billMonth: f.billMonth, billYear: f.billYear, fromDate: f.fromDate, toDate: f.toDate, consumerName: f.consumerName };
  const states = getStates();
  const stSel = $('bcState');
  stSel.innerHTML = states.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  const gotDiscom = !!(f.discom && states.includes(f.discom.state));
  stSel.value = gotDiscom ? f.discom.state : (states.includes('Uttar Pradesh') ? 'Uttar Pradesh' : states[0]);
  await fillDiscoms(stSel.value, gotDiscom ? f.discom.id : null);
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

  // OCR is Beta and its real-world hit rate is unknown. Recording which engine ran and how
  // many fields came back is the only way to find out whether it is fit to be the site's
  // primary funnel. Counts and the engine name only — never the extracted values.
  window.gtag?.('event', 'ocr_read', {
    engine: meta.cloud ? 'cloud' : 'device',
    fields_found: [f.discom, f.units, f.sanctionedLoad, f.billAmount].filter(v => v != null).length,
  });

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

  const cell = (r) => r.read ? rs2(r.theirs) : '<span class="audit-unread">not read</span>';
  const ourCell = (r) => r.modelled ? rs2(r.ours || 0) : '<span class="audit-unread">not modelled</span>';
  // Returns the whole <td> so it can carry .audit-bad / .audit-good, matching the
  // difference column on /bill-review/sample-report/.
  const diffCell = (r) => {
    if (!r.comparable) return '<td class="num"><span class="audit-unread">—</span></td>';
    if (Math.abs(r.diff) <= TOL) return '<td class="num audit-good">matches</td>';
    const sign = r.diff > 0 ? '+' : '−';
    return `<td class="num ${r.diff > 0 ? 'audit-bad' : 'audit-good'}">${sign}${rs2(Math.abs(r.diff))}</td>`;
  };
  const totalGap = haveBill ? billAmount - ours : 0;
  const totalDiffCell = Math.abs(totalGap) <= TOL
    ? '<td class="num audit-good">matches</td>'
    : `<td class="num ${totalGap > 0 ? 'audit-bad' : 'audit-good'}">${totalGap > 0 ? '+' : '−'}${rs2(Math.abs(totalGap))}</td>`;

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

  // Rendered with the same .audit-* vocabulary as /bill-review/sample-report/ so the two read
  // as one document family. Every difference is deliberate and all in the direction of
  // claiming less: an amber "this is software" banner in place of the analyst byline, no case
  // number or turnaround, and "not read" wherever OCR came up empty.
  $('bcResultBody').innerHTML = `
  <p class="audit-banner"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  Produced by software, not by a person — it recomputes your bill from published tariff data and compares every line it could read. A starting point for a conversation with your DISCOM, not a certified audit.</p>

  <article class="audit-doc" aria-label="Automated bill audit report">
    <div class="audit-head">
      <h3 class="audit-title">Electricity Bill Audit Report
        <small>Automated recomputation by TheDiscomBill&rsquo;s tariff engine</small>
      </h3>
      <div class="audit-case">
        <strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong><br>
        ${comparable.length} of ${rows.length} lines compared<br>
        ${billMeta && billMeta.cloud ? 'Read via cloud OCR' : 'Read on your device'}
      </div>
    </div>

    <p class="audit-h">Case summary</p>
    <table class="audit-table">
      <tbody>
        <tr><td>DISCOM &amp; tariff</td><td>${esc(bill.discom.name)} &mdash; ${esc(bill.category ? bill.category.name : '')}${bill.supplyTypeName ? ', ' + esc(bill.supplyTypeName) : ''}</td></tr>
        <tr><td>Sanctioned load</td><td>${load} kW</td></tr>
        <tr><td>Billing period</td><td>${period} &middot; ${units} units</td></tr>
        <tr><td>Rates applied</td><td>${esc(bill.tariffPeriodLabel || '')}${bill.tariffVerified ? ' &mdash; checked against the published tariff order' : ' &mdash; representative estimate, not a verified order'}</td></tr>
        <tr><td>Charge lines read</td><td>${readCount} of ${rows.length} off your bill</td></tr>
      </tbody>
    </table>
    ${tariffProvenanceHtml(bill)}

    <p class="audit-h">Line-by-line recomputation</p>
    <div class="audit-table-wrap"><table class="audit-table">
      <thead>
        <tr><th>Charge line</th><th class="num">On your bill</th><th class="num">Recomputed*</th><th class="num">Difference</th></tr>
      </thead>
      <tbody>
        ${rows.map((r) => `<tr><td>${esc(r.label)}</td><td class="num">${cell(r)}</td><td class="num">${ourCell(r)}</td>${diffCell(r)}</tr>`).join('')}
      </tbody>
      <tfoot>
        <tr><td>Total${haveBill ? '' : ' (recomputed)'}</td>
            <td class="num">${haveBill ? rs2(billAmount) : '<span class="audit-unread">not read</span>'}</td>
            <td class="num">${rs2(ours)}</td>
            ${haveBill ? totalDiffCell : '<td class="num">&mdash;</td>'}</tr>
      </tfoot>
    </table></div>
    <p class="tariff-card-note">*Recomputed against the ${esc(bill.tariffPeriodLabel || 'current')} ${esc(bill.discom.name)} rate schedule${fppa ? `, including the verified ${fppa.rate}${fppa.mode === 'percent' ? '%' : '/unit'} fuel surcharge` : ''}.${readCount < rows.length ? ' Lines marked &ldquo;not read&rdquo; could not be picked out of your bill by OCR &mdash; they are left out of the findings and the verdict rather than assumed to be zero.' : ''}</p>

    ${findings.length ? `<p class="audit-h">Findings</p>
    ${findings.map((f, i) => `<div class="audit-finding">
      <strong>${i + 1}. ${f.title}</strong>
      <p>${f.body}</p>
    </div>`).join('')}` : ''}

    <p class="audit-h">Verdict</p>
    <div class="audit-verdict">
      <span class="audit-verdict-amt${overs.length ? ' audit-verdict-bad' : ''}">${comparable.length ? rs2(Math.abs(scored)) : '&mdash;'}</span>
      <p>${verdictLine}${haveBill && comparable.length ? ` The two totals differ by <strong>${rs2(Math.abs(billAmount - ours))}</strong>, of which <strong>${rs2(Math.abs(scored))}</strong> is attributable to the lines above; the rest sits in lines we could not read or do not model, including anything carried over from a previous bill.` : ''}</p>
    </div>

    ${overs.length ? `<p class="audit-h">Recommended next steps</p>
    <ol class="audit-next">
      <li><strong>Check the disputed lines against the bill in your hand</strong> &mdash; start with the fixed charge and the sanctioned load, which account for most discrepancies.</li>
      <li><strong>Raise a billing complaint</strong> with ${esc(bill.discom.name)} quoting the specific line and amount rather than &ldquo;my bill is too high&rdquo;. The <a href="/complaint/">complaint helper</a> has the portal and the 1912 helpline for your state.</li>
      <li><strong>Ask for a revised bill</strong>, not an adjustment promise, and note the complaint number.</li>
      <li><strong>Pay the undisputed amount</strong> before the due date so no late-payment surcharge accrues while the complaint is open.</li>
      <li><strong>If there is no revision within 30 days</strong>, escalate to the Consumer Grievance Redressal Forum with the complaint number and this recomputation.</li>
    </ol>` : ''}

    <p class="audit-foot">Generated from published ${esc(bill.discom.name)} tariff data. OCR can misread a printed figure and
    tariffs change through the year &mdash; verify against your bill before relying on this. Not a legal document.</p>
  </article>

  <div class="bc-actions no-print">
    <button type="button" class="btn-calculate" id="bcPrint">🖨️ Print / Save as PDF</button>
    <a class="btn-clear" href="/bill-review/">Get a human expert review</a>
    <button type="button" class="btn-clear" id="bcRestart">Check another bill</button>
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
      await renderConfirm(fields, { cloud, note });
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
