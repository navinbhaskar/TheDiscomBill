// admin.js — admin console (/admin/).
// Admins manage accounts (create / delete / switch user ↔ expert) and reach the
// internal tools (tariff editor). Every action calls a SECURITY DEFINER RPC from
// supabase/admin.sql that re-checks the admin role server-side — the page is
// just a UI, it holds no privileged keys.

import { isConfigured, getSupabase } from './supabase-config.js';
import { initAuth, accountBarHtml, esc, fmtWhen, ICONS } from './support-common.js';

const LOGIN_URL = '/login/?next=' + encodeURIComponent('/admin/');

const $ = (id) => document.getElementById(id);
const mainEl = $('adMain');
const accountEl = $('adAccount');
if (mainEl) init();

let sb = null;
let me = null;

async function init() {
  if (!isConfigured()) {
    await initAuth({ mount: mainEl, onSignedIn: () => {} });
    return;
  }

  sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.replace(LOGIN_URL); return; }

  sb.auth.onAuthStateChange((_event, s) => {
    if (!s) { accountEl.innerHTML = ''; location.replace(LOGIN_URL); }
  });

  me = session.user;
  const { data: myProfile } = await sb.from('profiles').select('*').eq('id', me.id).single();
  // Cache the role so the header account dropdown (main.js) can show the
  // Admin Console link on every page without a DB round-trip.
  try {
    if (myProfile?.role === 'admin' || myProfile?.role === 'expert') localStorage.setItem('discombill.role', myProfile.role);
    else localStorage.removeItem('discombill.role');
  } catch (e) {}
  accountEl.innerHTML = accountBarHtml(myProfile?.full_name, me.email,
    myProfile?.role === 'admin' ? 'ADMIN' : '');
  $('brSignOut').addEventListener('click', () => sb.auth.signOut());

  if (myProfile?.role !== 'admin') {
    mainEl.innerHTML = `
      <div class="br-card br-setup">
        <h3>🔒 Not an admin account</h3>
        <p>You're signed in as <strong>${esc(me.email)}</strong>, but this account doesn't have
        admin access. Grant it by running the promotion statement at the bottom of
        <code>supabase/admin.sql</code> (SQL Editor) with this email, then reload.</p>
      </div>`;
    return;
  }
  render();
}

// ── Console ──────────────────────────────────────────────────────────────────
async function render() {
  mainEl.innerHTML = '<p class="tx-muted">Loading accounts…</p>';

  const { data: users, error } = await sb.rpc('admin_list_users');
  if (error) {
    mainEl.innerHTML = `
      <div class="br-card br-setup">
        <h3>${ICONS.gear} Admin backend not installed</h3>
        <p>Could not list accounts: <code>${esc(error.message)}</code></p>
        <p>Run <code>supabase/admin.sql</code> in the Supabase SQL Editor (after
        <code>schema.sql</code>), then reload.</p>
      </div>`;
    return;
  }

  const roleChip = (r) => `<span class="br-chip br-chip-${r === 'admin' ? 'resolved' : r === 'expert' ? 'assigned' : 'pending'}">${esc(r.toUpperCase())}</span>`;

  const rows = users.map(u => `
    <div class="br-item br-item-static">
      <div class="br-item-main">
        <span class="br-item-subject">${esc(u.full_name || '(no name)')} · <span class="tx-muted">${esc(u.email)}</span></span>
        <span class="br-item-meta">joined ${esc(fmtWhen(u.created_at))}</span>
      </div>
      ${roleChip(u.role)}
      ${u.role === 'admin' ? '' : `
      <button type="button" class="br-back ad-role" data-id="${esc(u.id)}" data-role="${u.role === 'expert' ? 'user' : 'expert'}">
        ${u.role === 'expert' ? 'Make user' : 'Make expert'}</button>
      <button type="button" class="br-back ad-del" data-id="${esc(u.id)}" data-email="${esc(u.email)}">Delete</button>`}
    </div>`).join('') || '<p class="tx-muted">No accounts yet.</p>';

  mainEl.innerHTML = `
    <div class="br-card">
      <h3>Internal tools</h3>
      <div class="br-list">
        <a class="br-item" href="/editor.html">
          <div class="br-item-main">
            <span class="br-item-subject">🛠️ Tariff Editor</span>
            <span class="br-item-meta">Edit per-state tariff data files (editor.html)</span>
          </div>
        </a>
        <a class="br-item" href="/expert/">
          <div class="br-item-main">
            <span class="br-item-subject">🗂️ Expert Console</span>
            <span class="br-item-meta">Complaint pool and case chat (expert accounts)</span>
          </div>
        </a>
      </div>
    </div>

    <div class="br-card">
      <h3>Add account</h3>
      <form class="br-auth-form" id="adAddForm" novalidate>
        <div class="svc-control"><label for="adName">Full name</label>
          <input id="adName" type="text" autocomplete="off" placeholder="Name" required></div>
        <div class="svc-control"><label for="adEmail">Email</label>
          <input id="adEmail" type="email" autocomplete="off" placeholder="user@example.com" required></div>
        <div class="svc-control"><label for="adPass">Password</label>
          <input id="adPass" type="text" autocomplete="off" placeholder="Minimum 6 characters" minlength="6" required></div>
        <div class="svc-control"><label for="adRole">Role</label>
          <select id="adRole"><option value="user">User</option><option value="expert">Expert</option></select></div>
        <button type="submit" class="btn-primary br-auth-submit">Create account</button>
        <p class="br-auth-msg" id="adAddMsg" role="alert"></p>
        <p class="br-auth-hint">The account is created pre-confirmed — the person can sign in
        immediately with this email and password.</p>
      </form>
    </div>

    <div class="br-card">
      <div class="br-card-head">
        <h3>Accounts <span class="br-count">${users.length}</span></h3>
        <button type="button" class="br-back" id="adRefresh" title="Refresh">↻ Refresh</button>
      </div>
      <div class="br-list">${rows}</div>
    </div>`;

  $('adRefresh').addEventListener('click', render);
  $('adAddForm').addEventListener('submit', addUser);
  mainEl.querySelectorAll('.ad-role').forEach(b => b.addEventListener('click', () => setRole(b)));
  mainEl.querySelectorAll('.ad-del').forEach(b => b.addEventListener('click', () => delUser(b)));
}

async function addUser(e) {
  e.preventDefault();
  const msg = $('adAddMsg');
  const btn = e.target.querySelector('.br-auth-submit');
  const email = $('adEmail').value.trim();
  const password = $('adPass').value;
  if (!email || password.length < 6) { msg.textContent = 'Enter a valid email and a password of 6+ characters.'; return; }
  btn.disabled = true; msg.textContent = '';
  const { error } = await sb.rpc('admin_create_user', {
    p_email: email, p_password: password,
    p_full_name: $('adName').value.trim(), p_role: $('adRole').value
  });
  btn.disabled = false;
  if (error) { msg.textContent = error.message; return; }
  render();
}

async function setRole(btn) {
  btn.disabled = true; btn.textContent = 'Saving…';
  const { error } = await sb.rpc('admin_set_role', { p_user_id: btn.dataset.id, p_role: btn.dataset.role });
  if (error) { alert('Could not change role: ' + error.message); }
  render();
}

async function delUser(btn) {
  if (!confirm(`Delete ${btn.dataset.email}?\n\nThis removes the account and all of its complaints, files and messages. This cannot be undone.`)) return;
  btn.disabled = true; btn.textContent = 'Deleting…';
  const { error } = await sb.rpc('admin_delete_user', { p_user_id: btn.dataset.id });
  if (error) { alert('Could not delete: ' + error.message); }
  render();
}
