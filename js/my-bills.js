// my-bills.js — account bill history page (/my-bills/).
// Lists the bills synced by ui.js's syncBillToCloud whenever a signed-in user
// calculates one. "Open" reloads the bill in the calculator via its share-link
// params; "Delete" removes the row (RLS restricts everything to the owner).

import { isConfigured, getSupabase } from './supabase-config.js';
import { accountBarHtml, renderSetupNotice, esc, fmtWhen } from './support-common.js';

const LOGIN_URL = '/login/?next=' + encodeURIComponent('/my-bills/');
const $ = (id) => document.getElementById(id);
const mainEl = $('mbMain');
const accountEl = $('mbAccount');
if (mainEl) init();

let sb = null;
let me = null;

async function init() {
  if (!isConfigured()) { renderSetupNotice(mainEl); return; }

  sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.replace(LOGIN_URL); return; }
  me = session.user;

  sb.auth.onAuthStateChange((_event, s) => {
    if (!s) { accountEl.innerHTML = ''; location.replace(LOGIN_URL); }
  });

  accountEl.innerHTML = accountBarHtml(me.user_metadata?.full_name, me.email);
  $('brSignOut').addEventListener('click', () => sb.auth.signOut());

  renderBills();
}

async function renderBills() {
  mainEl.innerHTML = '<p class="tx-muted">Loading your bills…</p>';

  const { data: bills, error } = await sb.from('bills')
    .select('id, label, amount, params, created_at')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // The most likely cause on a fresh project: the bills table hasn't been
    // created yet (schema.sql needs a re-run after this feature was added).
    mainEl.innerHTML = `
      <div class="br-card">
        <p class="br-error">Could not load bills: ${esc(error.message)}</p>
        ${/find|exist|schema/i.test(error.message) ? `
        <p class="tx-muted">If this project was set up before the My Bills feature, re-run
        <code>supabase/schema.sql</code> in the Supabase SQL Editor to create the <code>bills</code> table.</p>` : ''}
      </div>`;
    return;
  }

  if (!bills.length) {
    mainEl.innerHTML = `
      <div class="br-card">
        <h3>No saved bills yet</h3>
        <p class="tx-muted" style="margin:8px 0 14px">Calculate a bill while signed in and it will
        appear here automatically.</p>
        <a class="btn-primary mb-cta" href="/#calculator">Open the calculator →</a>
      </div>`;
    return;
  }

  mainEl.innerHTML = `
    <div class="br-card">
      <div class="br-card-head"><h3>Recent bills <span class="br-count">${bills.length}</span></h3></div>
      <div class="br-list">
        ${bills.map(b => `
        <div class="br-item br-item-static mb-bill">
          <div class="br-item-main">
            <span class="br-item-subject">${esc(b.label)}</span>
            <span class="br-item-meta">${esc(fmtWhen(b.created_at))}</span>
          </div>
          <span class="mb-amt">₹ ${esc(b.amount)}</span>
          <span class="mb-actions">
            <a class="br-back mb-open" href="/?${esc(b.params)}#calculator">Open</a>
            <button type="button" class="br-back mb-delete" data-id="${esc(b.id)}" aria-label="Delete this bill">🗑</button>
          </span>
        </div>`).join('')}
      </div>
    </div>`;

  mainEl.querySelectorAll('.mb-delete').forEach(btn =>
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const { error: delErr } = await sb.from('bills').delete().eq('id', btn.dataset.id);
      if (delErr) { btn.disabled = false; alert('Could not delete: ' + delErr.message); return; }
      renderBills();
    }));
}
