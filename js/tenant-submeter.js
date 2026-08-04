// tenant-submeter.js — Tenant vs. Landlord Sub-Meter Splitter (/tenant-submeter-calculator/).
//
// The problem this solves: a landlord holds one DISCOM connection, fits a private sub-meter
// per tenant, and bills a flat ₹10–12/unit. The tenant has no way to know what the units
// actually cost, because the real bill is telescopic — cheap slabs first, fixed charge shared
// across the whole building, duty as a percentage on top.
//
// So we rebuild the LEGAL bill for the whole connection with the same engine the main
// calculator uses, then apportion it:
//   • energy + all per-unit / percentage charges → pro-rata on the tenant's unit share.
//     Pro-rata is the fair method precisely BECAUSE the slabs are telescopic — nobody gets
//     to claim the ₹3 slab while their neighbour eats the ₹7 one.
//   • fixed / demand charges → either split equally per sub-meter (the usual arrangement)
//     or pro-rata, user's choice.
// Then we compare that against what the landlord charges and print a report the tenant can
// hand over. Deliberately NOT framed as legal advice — see the disclaimer copy.

import { calculateBill } from './engine.js';
import { getStates, getDiscoms, getCategories, getDefaultCategory,
         getSupplyTypes, getDefaultSupplyType, ensureState } from './tariffs/registry.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rs = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const rs2 = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numv = (id, fallback = 0) => {
  const v = parseFloat(($(id) || {}).value);
  return (isNaN(v) || v < 0) ? fallback : v;
};

let lastCalc = null;   // latest compute() output, for the print report

// ── Model ────────────────────────────────────────────────────────────────────

// Rebuild the landlord's real DISCOM bill and split the tenant's share out of it.
function compute() {
  const discomId = $('tsDiscom').value;
  const categoryId = $('tsCategory').value;
  const supplyTypeId = $('tsSupply').value || undefined;

  const myUnits = numv('tsMyUnits');
  const tenants = Math.max(1, Math.round(numv('tsTenants', 1)) || 1);
  const load = numv('tsLoad', 3) || 3;
  const lRate = numv('tsRate');
  const lFixed = numv('tsFixed');
  const splitMode = $('tsSplit').value;   // 'equal' | 'prorata'

  if (myUnits <= 0) return { empty: true };

  // If the tenant can't see the main meter, the honest fallback is to bill their units as
  // if they were the whole connection. That UNDER-states the real cost per unit (the cheap
  // slabs aren't being shared), so the overcharge we report stays conservative — never
  // inflated. The UI says so rather than hiding the assumption.
  const enteredTotal = numv('tsTotalUnits');
  const assumedTotal = enteredTotal < myUnits;
  const totalUnits = assumedTotal ? myUnits : enteredTotal;

  const bill = calculateBill({
    discomId, categoryId, supplyTypeId,
    units: totalUnits,
    connectedLoadKw: load,
  });
  if (bill.error) return { error: bill.message };

  // Split the legal bill into the part that scales with consumption and the part that
  // doesn't. Excess-demand penalty and the minimum-charge top-up ride with the fixed side:
  // both are consequences of the connection itself, not of any one tenant's units.
  const fixedPart = bill.fixedCharge + bill.excessDemandPenalty + bill.minChargeTopUp;
  const variablePart = Math.max(0, bill.currentNet - fixedPart);

  const unitShare = totalUnits > 0 ? myUnits / totalUnits : 0;
  const fixedShare = splitMode === 'equal' ? (1 / tenants) : unitShare;

  const myVariable = variablePart * unitShare;
  const myFixed = fixedPart * fixedShare;
  const myFair = myVariable + myFixed;

  const landlordCharge = myUnits * lRate + lFixed;
  const overcharge = landlordCharge - myFair;

  return {
    bill, totalUnits, assumedTotal, myUnits, tenants, load, splitMode,
    lRate, lFixed, unitShare, fixedShare,
    fixedPart, variablePart, myFixed, myVariable, myFair,
    landlordCharge, overcharge,
    fairRate: myUnits > 0 ? myFair / myUnits : 0,
    landlordEffRate: myUnits > 0 ? landlordCharge / myUnits : 0,
    overchargePct: myFair > 0 ? (overcharge / myFair) * 100 : 0,
  };
}

// ── Render ───────────────────────────────────────────────────────────────────

function verdictCard(r) {
  const over = r.overcharge;
  // A few rupees either way is rounding, not gouging — don't cry wolf over ₹25.
  const material = over > 25 && r.overchargePct > 3;
  const under = over < -25;

  const tone = material ? 'sub-bad' : under ? 'sub-good' : 'sub-good';
  const icon = material ? '🚩' : under ? '✅' : '✅';
  const head = material
    ? `You are being charged ${rs(over)} a month too much`
    : under
      ? `Your landlord charges less than the tariff`
      : `Your landlord's charge is broadly fair`;
  const verdict = material
    ? `${rs(over * 12)} a year over the DISCOM tariff`
    : under
      ? `${rs(Math.abs(over))}/month below the tariff cost`
      : `Within ${rs(Math.abs(over))} of the tariff cost`;

  const body = material
    ? `<p>At <strong>${rs2(r.lRate)}/unit</strong>${r.lFixed > 0 ? ` plus ${rs(r.lFixed)} fixed` : ''} your landlord bills you
       <strong>${rs(r.landlordCharge)}</strong> for ${r.myUnits.toLocaleString('en-IN')} units. Your share of the actual
       ${esc(r.bill.discom.name)} bill for the same units is <strong>${rs(r.myFair)}</strong> — an effective
       <strong>${rs2(r.fairRate)}/unit</strong> against the <strong>${rs2(r.landlordEffRate)}/unit</strong> you pay.
       That is <strong>${Math.round(r.overchargePct)}% above tariff</strong>.</p>`
    : under
      ? `<p>Your landlord bills <strong>${rs(r.landlordCharge)}</strong> where your share of the real
         ${esc(r.bill.discom.name)} bill works out to <strong>${rs(r.myFair)}</strong>. Nothing to raise —
         though check whether maintenance or common-area power is being billed elsewhere.</p>`
      : `<p>Your landlord bills <strong>${rs(r.landlordCharge)}</strong>; your share of the real
         ${esc(r.bill.discom.name)} bill is <strong>${rs(r.myFair)}</strong>. The gap is small enough to be
         rounding or meter drift rather than a markup.</p>`;

  return `<div class="sub-card ${tone}">
    <div class="sub-card-head"><span class="sub-icon">${icon}</span>
      <div><strong>${head}</strong><span class="sub-verdict">${verdict}</span></div></div>
    <div class="sub-card-body">
      ${body}
      <div class="rc-stats">
        <div class="rc-stat"><span class="rc-stat-label">Landlord charges you</span>
          <span class="rc-stat-value">${rs(r.landlordCharge)}</span></div>
        <div class="rc-stat"><span class="rc-stat-label">Your share at tariff</span>
          <span class="rc-stat-value">${rs(r.myFair)}</span></div>
        <div class="rc-stat rc-stat-hero"><span class="rc-stat-label">${over >= 0 ? 'Extra you pay' : 'You pay less by'} / year</span>
          <span class="rc-stat-value">${rs(Math.abs(over) * 12)}</span></div>
      </div>
    </div></div>`;
}

function splitCard(r) {
  const b = r.bill;
  const pct = (n) => (n * 100).toFixed(1) + '%';
  return `<div class="sub-card">
    <div class="sub-card-head"><span class="sub-icon">🧾</span>
      <div><strong>How your share was worked out</strong>
      <span class="sub-verdict">${r.myUnits.toLocaleString('en-IN')} of ${r.totalUnits.toLocaleString('en-IN')} units = ${pct(r.unitShare)}</span></div></div>
    <div class="sub-card-body">
      <div class="tsm-table-wrap">
      <table class="tsm-table">
        <thead><tr><th>Component</th><th class="num">Whole connection</th><th class="num">Basis</th><th class="num">Your share</th></tr></thead>
        <tbody>
          <tr><td>Energy &amp; per-unit charges</td><td class="num">${rs2(r.variablePart)}</td>
              <td class="num">${pct(r.unitShare)} of units</td><td class="num">${rs2(r.myVariable)}</td></tr>
          <tr><td>Fixed / demand charge</td><td class="num">${rs2(r.fixedPart)}</td>
              <td class="num">${r.splitMode === 'equal' ? `1 of ${r.tenants} meters` : pct(r.fixedShare) + ' of units'}</td>
              <td class="num">${rs2(r.myFixed)}</td></tr>
        </tbody>
        <tfoot>
          <tr><td>Your share of the legal bill</td><td class="num">${rs2(b.currentNet)}</td><td class="num">—</td>
              <td class="num"><strong>${rs2(r.myFair)}</strong></td></tr>
          <tr><td>What your landlord charges</td><td class="num">—</td>
              <td class="num">${rs2(r.lRate)}/unit${r.lFixed > 0 ? ` + ${rs(r.lFixed)}` : ''}</td>
              <td class="num"><strong>${rs2(r.landlordCharge)}</strong></td></tr>
          <tr class="tsm-row-diff"><td>Difference</td><td class="num">—</td><td class="num">—</td>
              <td class="num"><strong>${r.overcharge >= 0 ? '+' : '−'}${rs2(Math.abs(r.overcharge)).slice(1)}</strong></td></tr>
        </tfoot>
      </table></div>
      <p class="rc-note">Energy is apportioned <strong>pro-rata on units</strong> rather than by re-running the
      slabs on your units alone — on a telescopic tariff the cheap first slabs belong to the whole connection,
      so sharing them by unit share is the even-handed method. Fixed charges are
      ${r.splitMode === 'equal' ? 'split equally per sub-meter, since the connection charge exists whether or not you switch anything on' : 'split pro-rata on units'}.
      ${r.assumedTotal ? '<strong>You did not enter the main-meter reading</strong>, so we billed your units as if they were the whole connection. That understates the real per-unit cost, so the gap shown above is a floor, not a ceiling.' : ''}</p>
    </div></div>`;
}

function legalBillCard(r) {
  const b = r.bill;
  const rows = [];
  rows.push(['Fixed / demand charge', b.fixedCharge]);
  for (const s of b.slabBreakdown || []) {
    rows.push([`Energy — ${esc(s.label)} @ ${rs2(s.rate)}`, s.amount]);
  }
  if (b.minChargeTopUp) rows.push(['Minimum charge top-up', b.minChargeTopUp]);
  if (b.excessDemandPenalty) rows.push(['Excess demand penalty', b.excessDemandPenalty]);
  if (b.wheelingCharge) rows.push([esc(b.wheelingLabel || 'Wheeling charges'), b.wheelingCharge]);
  if (b.facAmount) rows.push(['FPPA / fuel surcharge', b.facAmount]);
  for (const e of b.extraCharges || []) if (e.amount) rows.push([esc(e.name), e.amount]);
  if (b.subsidyAmount) rows.push([esc(b.subsidyLabel || 'Subsidy'), -b.subsidyAmount]);

  return `<div class="sub-card">
    <div class="sub-card-head"><span class="sub-icon">⚡</span>
      <div><strong>The real ${esc(b.discom.name)} bill for this connection</strong>
      <span class="sub-verdict">${rs(b.currentNet)} for ${r.totalUnits.toLocaleString('en-IN')} units</span></div></div>
    <div class="sub-card-body">
      <div class="tsm-table-wrap">
      <table class="tsm-table">
        <tbody>${rows.map(([l, a]) => `<tr><td>${l}</td><td class="num">${rs2(a)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td>Total for the whole connection</td><td class="num"><strong>${rs2(b.currentNet)}</strong></td></tr>
        <tr><td>Effective rate across all units</td><td class="num"><strong>${rs2(b.currentNet / r.totalUnits)}/unit</strong></td></tr></tfoot>
      </table></div>
      <p class="rc-note">${esc(b.category ? b.category.name : '')}${b.supplyTypeName ? ' · ' + esc(b.supplyTypeName) : ''},
      ${esc(b.tariffPeriodLabel || '')} rates, ${r.load} kW sanctioned load.
      ${b.tariffVerified ? 'These rates are checked against the published tariff order.' : 'These rates are a representative estimate — confirm against the current tariff order.'}
      <a href="/?state=&discom=${encodeURIComponent(b.discom.id)}#calculator">Open this in the full bill calculator →</a></p>
    </div></div>`;
}

function actionCard(r) {
  if (r.overcharge <= 25) return '';
  return `<div class="sub-card">
    <div class="sub-card-head"><span class="sub-icon">📄</span>
      <div><strong>What you can do about it</strong><span class="sub-verdict">Start with the numbers, not a fight</span></div></div>
    <div class="sub-card-body">
      <ol class="tsm-steps">
        <li><strong>Print this comparison</strong> and share it with your landlord. Most flat rates are set out of
        habit, not malice — a tariff-backed number usually settles it without escalation.</li>
        <li><strong>Ask for the main-meter bill</strong> for the same month. You are paying a share of it, so you
        have a reasonable basis to ask what it says.</li>
        <li><strong>Agree a method, not a rate.</strong> "My units × the DISCOM's effective rate, plus an equal
        share of the fixed charge" survives every tariff revision; a fixed ₹/unit does not.</li>
        <li><strong>If it isn't resolved</strong>, most state regulators bar reselling power above the applicable
        tariff and your DISCOM's consumer grievance forum will take a complaint. The
        <a href="/complaint/">complaint helper</a> lists the forum and the 1912 helpline for your state.</li>
      </ol>
      <p class="rc-note">Rules on sub-metering and permitted service charges differ by state and are set by your
      State Electricity Regulatory Commission, not nationally. This tool tells you what the units cost under the
      tariff — it is not legal advice, and it does not decide what your tenancy agreement permits.</p>
    </div></div>`;
}

function reportHeader(r) {
  const d = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return `<div class="tsm-report-head">
    <div>
      <strong>Sub-meter cost comparison</strong>
      <span>${esc(r.bill.discom.name)} tariff · ${esc(r.bill.tariffPeriodLabel || '')} · prepared ${d}</span>
    </div>
    <span class="tsm-report-src">thediscombill.com</span>
  </div>`;
}

function render() {
  const box = $('tsResult');
  const r = compute();
  lastCalc = null;

  if (r.empty) {
    box.innerHTML = `<p class="tx-muted">Enter your sub-meter units and what your landlord charges per unit to see the comparison.</p>`;
    return;
  }
  if (r.error) {
    box.innerHTML = `<p class="tx-muted">${esc(r.error)}</p>`;
    return;
  }
  lastCalc = r;

  box.innerHTML = `<div class="tsm-report">
    ${reportHeader(r)}
    <div class="sub-cards">
      ${verdictCard(r)}
      ${splitCard(r)}
      ${legalBillCard(r)}
      ${actionCard(r)}
    </div>
    <p class="tsm-report-foot">Generated by TheDiscomBill's Tenant Sub-Meter Calculator from published
    ${esc(r.bill.discom.name)} tariff rates. Estimate for discussion — not a legal document.</p>
    <div class="tsm-actions no-print">
      <button type="button" class="btn-calculate" id="tsPrint">🖨️ Print / Save as PDF</button>
      <button type="button" class="btn-clear" id="tsShare">Share on WhatsApp</button>
    </div>
  </div>`;

  $('tsPrint').addEventListener('click', () => window.print());
  $('tsShare').addEventListener('click', () => {
    const t = `⚡ Sub-meter check (TheDiscomBill)\n• My units: ${r.myUnits}\n• Landlord charges: ${rs(r.landlordCharge)} (${rs2(r.landlordEffRate)}/unit)\n• Actual ${r.bill.discom.name} cost for my share: ${rs(r.myFair)} (${rs2(r.fairRate)}/unit)\n• Difference: ${rs(Math.abs(r.overcharge))}/month${r.overcharge > 0 ? ' extra' : ' less'}\nCheck yours free: https://thediscombill.com/tenant-submeter-calculator/`;
    window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener');
  });
}

// ── Cascading tariff pickers ─────────────────────────────────────────────────

function fillSupplyTypes() {
  const sel = $('tsSupply');
  const types = getSupplyTypes($('tsDiscom').value, $('tsCategory').value) || [];
  if (!types.length) {
    sel.innerHTML = '';
    sel.closest('.svc-control').hidden = true;
    return;
  }
  sel.closest('.svc-control').hidden = false;
  sel.innerHTML = types.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
  const def = getDefaultSupplyType($('tsDiscom').value, $('tsCategory').value);
  if (def) sel.value = def.id;
}

function fillCategories() {
  const discomId = $('tsDiscom').value;
  const sel = $('tsCategory');
  const cats = getCategories(discomId) || [];
  sel.innerHTML = cats.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  // Landlord connections are usually domestic; commercial is a real case though, so it stays pickable.
  const def = getDefaultCategory(discomId, 'domestic');
  if (def) sel.value = def.id;
  fillSupplyTypes();
}

// draw()/fillCategories() below read discom.categories, so the state's tariff tables must
// be loaded first. DISCOM names come from the registry index and need no await.
async function fillDiscoms(preselect) {
  if ($('tsState').value) await ensureState($('tsState').value);
  const sel = $('tsDiscom');
  const discoms = getDiscoms($('tsState').value) || [];
  sel.innerHTML = discoms.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  if (preselect && discoms.some(d => d.id === preselect)) sel.value = preselect;
  fillCategories();
}

function init() {
  const stateSel = $('tsState');
  if (!stateSel) return;   // not on this page

  const states = getStates();
  stateSel.innerHTML = states.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');

  const params = new URLSearchParams(location.search);
  const wantState = params.get('state');
  stateSel.value = (wantState && states.includes(wantState)) ? wantState
                 : states.includes('Delhi') ? 'Delhi' : states[0];
  // fillDiscoms is async now (it fetches the state's tariff tables), so the first render
  // has to wait for it rather than running against a state with no rates loaded.
  fillDiscoms(params.get('discom')).then(render);

  stateSel.addEventListener('change', async () => { await fillDiscoms(); render(); });
  $('tsDiscom').addEventListener('change', () => { fillCategories(); render(); });
  $('tsCategory').addEventListener('change', () => { fillSupplyTypes(); render(); });
  ['tsSupply', 'tsSplit'].forEach(id => $(id).addEventListener('change', render));
  ['tsMyUnits', 'tsTotalUnits', 'tsTenants', 'tsLoad', 'tsRate', 'tsFixed']
    .forEach(id => $(id).addEventListener('input', render));
  // No bare render() here — the initial one is chained off fillDiscoms above, because the
  // rates it needs are fetched rather than already in memory.
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
