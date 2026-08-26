// js/bill-view.js — /bill/, a saved or shared bill on its own page.
//
// Before this existed, opening a bill from /my-bills/ sent you to the homepage with the
// calculator repopulated from the link. The repopulation worked; the destination did not —
// a returning user landed on six screens of hero, coverage, state directory, tools, About
// and FAQ, all of which exists to sell the calculator to someone who has never used it.
// The same was true of every bill shared over WhatsApp, which is the site's main organic
// channel: recipients got the marketing page, not the bill.
//
// Two ways in:
//   /bill/?id=<uuid>        a signed-in user's own saved bill, read from Supabase (RLS keeps
//                           it to the owner). Short URL, and the consumer's name and account
//                           number stay out of the address bar.
//   /bill/?state=…&units=…  any share link. Works signed out — that is the point.
//
// The bill itself is rendered by renderer.js's renderBill(), the same function the calculator
// uses, so the two cannot drift into looking like different products. The inputs are read by
// bill-params.js, the same module loadFromUrl consumes, so a bill VIEWED and the same bill
// OPENED cannot disagree about the total.

import { paramsToInputs, billingDateFrom, periodDaysFrom } from './bill-params.js';
import { ensureDiscom } from './tariffs/registry.js';
import { resolveFppaForDiscom } from './tariffs/fppa-resolve.js';
import { DOMESTIC_SUBSIDY } from './tariffs/subsidy.js';
import { calculateBill } from './engine.js';
import { renderBill } from './renderer.js';
import { isConfigured, hasStoredSession, getSupabase } from './supabase-config.js';
import { escHtml } from './utils.js';

const mainEl = document.getElementById('bvMain');
const ctaEl = document.getElementById('bvCta');
if (mainEl) init();

function fail(msg, hint) {
  mainEl.innerHTML = `<div class="br-card"><div class="br-card-head"><h3>${escHtml(msg)}</h3></div>
    <p class="tx-muted" style="padding:0 18px 18px">${hint || ''}</p>
    <p style="padding:0 18px 18px"><a class="br-back" href="/my-bills/">← Back to My Bills</a></p></div>`;
  if (ctaEl) ctaEl.hidden = true;
}

async function init() {
  const q = new URLSearchParams(location.search);
  const id = q.get('id');

  // `?id=` is a pointer into the user's own bills; anything else is a self-contained link.
  let paramsString = location.search;
  if (id) {
    if (!isConfigured() || !hasStoredSession()) {
      fail('Sign in to open this bill',
        'This bill is saved to an account. Shared bill links open without signing in.');
      return;
    }
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('bills').select('params').eq('id', id).single();
      if (error || !data) { fail('Bill not found', 'It may have been deleted.'); return; }
      paramsString = data.params;
    } catch {
      fail('Could not load this bill', 'Check your connection and try again.');
      return;
    }
  }

  const inputs = paramsToInputs(paramsString);
  if (!inputs) {
    fail('Nothing to show here',
      'This page opens a saved or shared bill. Calculate one first, and the link will bring you back here.');
    return;
  }

  try {
    await ensureDiscom(inputs.discomId);
  } catch {
    fail('Could not load that tariff', 'The DISCOM in this link is not one we have data for.');
    return;
  }

  const billingDate = billingDateFrom(inputs);

  // The calculator applies the state scheme by default for domestic supply, and whether the
  // user turned it off is not carried in the link. Match the calculator's default so the same
  // link produces the same number in both places.
  const subsidy = inputs.categoryId === 'domestic'
    ? (DOMESTIC_SUBSIDY[inputs.state] || null) : null;

  const result = calculateBill({
    discomId: inputs.discomId,
    categoryId: inputs.categoryId,
    supplyTypeId: inputs.supplyTypeId || undefined,
    units: inputs.units,
    connectedLoadKw: inputs.connectedLoadKw,
    billedDemandKw: inputs.billedDemandKw ?? undefined,
    billingBasis: inputs.billingBasis || undefined,
    billingPeriodDays: periodDaysFrom(inputs),
    billingDate,
    facRate: inputs.facRate,
    facMode: inputs.facMode || undefined,
    arrears: inputs.arrears,
    arrearLpsc: inputs.arrearLpsc,
    lpscRate: inputs.lpscRate,
    currentLpscMonths: inputs.currentLpscMonths,
    lpscApplicable: inputs.lpscApplicable,
    todUnits: inputs.todUnits || undefined,
    netMetering: inputs.netMetering,
    exportUnits: inputs.exportUnits,
    openingCreditUnits: inputs.openingCreditUnits,
    subsidy,
  });

  if (!result || result.error) {
    fail('This bill could not be recomputed', result?.message || 'The tariff for it is unavailable.');
    return;
  }

  const verifiedFppa = resolveFppaForDiscom(inputs.discomId, billingDate);

  // renderBill()'s action bar calls these globals; calculator-init.js installs them on the
  // calculator page. Nothing installs them here, and they are `&&`-guarded in the markup, so
  // without this the Copy link / WhatsApp / Calculate new bill buttons render and do nothing.
  const shareUrl = () => location.origin + location.pathname + location.search;
  window.__shareBill = () => {
    const url = shareUrl();
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => prompt('Copy this link:', url));
    else prompt('Copy this link:', url);
  };
  window.__shareBillWa = () => {
    const amount = Math.max(0, result.totalPayable).toLocaleString('en-IN');
    const msg = `My ${result.discom.name} bill for ${result.units} units works out to ₹${amount}.`
      + `\n\nSee the full breakdown: ${shareUrl()}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  };
  // On the calculator this clears the form; here the equivalent is simply going there.
  window.__resetCalculator = () => { location.href = '/#calculator'; };
  // A shared link carries no personal details, so it renders the compact bill — the same
  // document the calculator's Simple mode produces, minus the rows it cannot fill.
  const personal = inputs.consumerName || inputs.accountNo || inputs.address;

  const draw = (compact) => {
    mainEl.innerHTML = renderBill({
      result,
      state: inputs.state,
      compact,
      billingMonth: inputs.billingMonth,
      billingYear: inputs.billingYear,
      consumerName: inputs.consumerName,
      accountNo: inputs.accountNo,
      address: inputs.address,
      meterNo: inputs.meterNo,
      prevReading: '', currReading: '',
      fromDate: inputs.fromDate, toDate: inputs.toDate,
      fppaSource: verifiedFppa ? `${verifiedFppa.label} — ${verifiedFppa.source}` : null,
    });
  };

  // The compact bill offers "View the detailed bill"; on the calculator that swaps the
  // document for the full one. Same thing here, from inputs we already hold.
  window.__showFullBill = () => draw(false);
  draw(!personal);

  // Charge rows in the full bill are accordions, and their toggle is delegated from
  // #billPanel on the calculator page. This page's container is #bvMain.
  mainEl.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const item = header.parentElement;
    const isOpen = item.classList.toggle('open');
    header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Straight back into the calculator with every input intact. Deliberately the saved query
  // rather than a rebuilt one: whatever reproduced this bill reproduces it there too.
  if (ctaEl) {
    const qs = paramsString.replace(/^\?/, '');
    ctaEl.hidden = false;
    ctaEl.innerHTML =
      `<a class="btn-primary bv-open" href="/?${escHtml(qs)}#calculator">Open in the calculator
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        ><path d="M9 6l6 6-6 6"/></svg></a>
       <span class="bv-cta-note">Every field comes back filled in, so you can change one and recalculate.</span>`;
  }
}
