// expert.js — expert console (/expert/).
// Experts sign in, claim complaints from the shared pool, examine the uploaded
// documents and chat with the consumer. Accounts become experts when you set
// profiles.role = 'expert' in the Supabase dashboard (see supabase/schema.sql).

import { isConfigured, getSupabase, clearStoredSession } from './supabase-config.js';
import { initAuth, accountBarHtml, startChat, fileListHtml,
         esc, fmtWhen, statusChip } from './support-common.js';

const LOGIN_URL = '/login/?next=' + encodeURIComponent('/expert/');

const $ = (id) => document.getElementById(id);
const mainEl = $('exMain');
const accountEl = $('exAccount');
if (mainEl) init();

let sb = null;
let me = null;
let myProfile = null;
let stopChat = null;
let tab = 'pool';       // 'pool' | 'mine'

function leaveChat() { if (stopChat) { stopChat(); stopChat = null; } }

async function init() {
  // Backend not configured → show the login card in preview mode (initAuth
  // handles the banner). Signed-out visitors otherwise go to the login page.
  if (!isConfigured()) {
    await initAuth({ mount: mainEl, onSignedIn: () => {} });
    return;
  }

  sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.replace(LOGIN_URL); return; }

  sb.auth.onAuthStateChange((_event, s) => {
    if (!s) { leaveChat(); accountEl.innerHTML = ''; location.replace(LOGIN_URL); }
  });

  me = session.user;
  const { data } = await sb.from('profiles').select('*').eq('id', me.id).single();
  myProfile = data;
  // Cache the role so the header account dropdown (main.js) can show/hide the
  // Expert Console link on every page without a DB round-trip.
  try {
    if (myProfile?.role === 'expert' || myProfile?.role === 'admin') localStorage.setItem('discombill.role', myProfile.role);
    else localStorage.removeItem('discombill.role');
  } catch (e) {}
  accountEl.innerHTML = accountBarHtml(myProfile?.full_name, me.email,
    myProfile?.role === 'expert' ? 'EXPERT' : '');
  $('brSignOut').addEventListener('click', async () => {
    // signOut() resolves with { error } and keeps the local session on failure —
    // clear it explicitly so Sign out always signs out.
    try { await Promise.race([sb.auth.signOut(), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
    clearStoredSession();
    location.reload();
  });

  if (myProfile?.role !== 'expert') {
    mainEl.innerHTML = `
      <div class="br-card br-setup">
        <h3>🔒 Not an expert account</h3>
        <p>You're signed in as <strong>${esc(me.email)}</strong>, but this account doesn't have
        expert access yet. Ask the administrator to promote it (Supabase → Table Editor →
        <code>profiles</code> → set <code>role</code> to <code>expert</code>), then reload.</p>
        <p>Looking to get your own bill reviewed? Head to the
        <a href="/bill-review/">consumer portal</a>.</p>
      </div>`;
    return;
  }
  showLists();
}

// ── Pool + my cases ──────────────────────────────────────────────────────────
async function showLists() {
  leaveChat();
  mainEl.innerHTML = '<p class="tx-muted">Loading cases…</p>';

  const [pool, mine] = await Promise.all([
    sb.from('complaints').select('id, state, discom, subject, created_at')
      .eq('status', 'pending').order('created_at', { ascending: true }),
    sb.from('complaints').select('id, state, discom, subject, status, created_at')
      .eq('expert_id', me.id).order('created_at', { ascending: false })
  ]);
  if (pool.error) { mainEl.innerHTML = `<p class="br-error">Could not load the pool: ${esc(pool.error.message)}</p>`; return; }

  const poolHtml = pool.data.length ? pool.data.map(c => `
    <div class="br-item br-item-static">
      <div class="br-item-main">
        <span class="br-item-subject">${esc(c.subject)}</span>
        <span class="br-item-meta">${esc(c.discom)}, ${esc(c.state)} · filed ${esc(fmtWhen(c.created_at))}</span>
      </div>
      <button type="button" class="btn-primary br-accept" data-id="${esc(c.id)}">Accept</button>
    </div>`).join('')
    : '<p class="tx-muted">The pool is empty — no complaints waiting. 🎉</p>';

  const mineHtml = (mine.data || []).length ? mine.data.map(c => `
    <button type="button" class="br-item" data-id="${esc(c.id)}">
      <div class="br-item-main">
        <span class="br-item-subject">${esc(c.subject)}</span>
        <span class="br-item-meta">${esc(c.discom)}, ${esc(c.state)} · filed ${esc(fmtWhen(c.created_at))}</span>
      </div>
      ${statusChip(c.status)}
    </button>`).join('')
    : '<p class="tx-muted">You haven\'t accepted any cases yet.</p>';

  mainEl.innerHTML = `
    <div class="br-card">
      <div class="br-tabs" role="tablist">
        <button type="button" class="br-tab ${tab === 'pool' ? 'active' : ''}" data-tab="pool" role="tab">
          Pool <span class="br-count">${pool.data.length}</span></button>
        <button type="button" class="br-tab ${tab === 'mine' ? 'active' : ''}" data-tab="mine" role="tab">
          My cases <span class="br-count">${(mine.data || []).length}</span></button>
        <button type="button" class="br-back" id="exRefresh" title="Refresh">↻ Refresh</button>
      </div>
      <div class="br-list" id="exPool"  ${tab === 'pool' ? '' : 'hidden'}>${poolHtml}</div>
      <div class="br-list" id="exMine" ${tab === 'mine' ? '' : 'hidden'}>${mineHtml}</div>
    </div>`;

  mainEl.querySelectorAll('.br-tab').forEach(t => t.addEventListener('click', () => {
    tab = t.dataset.tab;
    mainEl.querySelectorAll('.br-tab').forEach(x => x.classList.toggle('active', x === t));
    $('exPool').hidden = tab !== 'pool';
    $('exMine').hidden = tab !== 'mine';
  }));
  $('exRefresh').addEventListener('click', showLists);

  mainEl.querySelectorAll('.br-accept').forEach(b =>
    b.addEventListener('click', () => acceptCase(b)));
  $('exMine').querySelectorAll('.br-item').forEach(el =>
    el.addEventListener('click', () => showCase(el.dataset.id)));
}

async function acceptCase(btn) {
  btn.disabled = true; btn.textContent = 'Accepting…';
  // .is('expert_id', null) makes the claim atomic — if a colleague grabbed it
  // first, zero rows match and we tell the expert instead of double-assigning.
  const { data, error } = await sb.from('complaints')
    .update({ expert_id: me.id, status: 'assigned', accepted_at: new Date().toISOString() })
    .eq('id', btn.dataset.id).eq('status', 'pending').is('expert_id', null)
    .select();
  if (error || !data?.length) {
    btn.textContent = 'Taken';
    setTimeout(showLists, 800);
    return;
  }
  tab = 'mine';
  showCase(btn.dataset.id);
}

// ── Case detail + chat ───────────────────────────────────────────────────────
async function showCase(id) {
  leaveChat();
  mainEl.innerHTML = '<p class="tx-muted">Loading case…</p>';

  const [{ data: c, error }, { data: files }] = await Promise.all([
    sb.from('complaints').select('*').eq('id', id).single(),
    sb.from('complaint_files').select('*').eq('complaint_id', id).order('created_at')
  ]);
  if (error || !c) { mainEl.innerHTML = '<p class="br-error">Could not load this case.</p>'; return; }

  const { data: consumer } = await sb.from('profiles').select('full_name').eq('id', c.user_id).single();
  const consumerName = consumer?.full_name || 'Consumer';

  mainEl.innerHTML = `
    <div class="br-card">
      <div class="br-card-head">
        <h3>${esc(c.subject)}</h3>
        <button type="button" class="br-back" id="exBack">← All cases</button>
      </div>
      <div class="br-detail-meta">
        ${statusChip(c.status)}
        <span class="tx-muted">${esc(c.discom)}, ${esc(c.state)} · filed ${esc(fmtWhen(c.created_at))} by <strong>${esc(consumerName)}</strong></span>
      </div>
      ${c.description ? `<p class="br-detail-desc">${esc(c.description)}</p>` : ''}
      <div class="tariff-field-label">Consumer's documents</div>
      <div id="exDocs"><p class="tx-muted">Loading documents…</p></div>
      <div class="tariff-field-label">Conversation with ${esc(consumerName)}</div>
      <div id="exChat"></div>
      ${c.status === 'assigned' ? `<button type="button" class="br-resolve" id="exResolve">✓ Mark resolved</button>` : ''}
    </div>`;

  $('exBack').addEventListener('click', showLists);
  fileListHtml(sb, files || []).then(html => { $('exDocs').innerHTML = html; });

  stopChat = startChat({
    sb, complaint: c, meId: me.id,
    names: { [c.user_id]: consumerName },
    mount: $('exChat'),
    canSend: c.status === 'assigned'
  });

  $('exResolve')?.addEventListener('click', async () => {
    if (!confirm('Mark this case as resolved? Chat will close for both sides.')) return;
    const { error: rErr } = await sb.from('complaints')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', c.id).eq('expert_id', me.id);
    if (rErr) { alert('Could not resolve: ' + rErr.message); return; }
    showCase(c.id);
  });
}
