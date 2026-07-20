// profile.js — account profile page (/profile/).
// Shows the signed-in user's identity (from Supabase auth + the profiles table)
// and lets them edit their display name. The name is saved BOTH to
// profiles.full_name (used by expert/admin consoles and community posts) and to
// auth user_metadata.full_name (used by the header chip on every page).

import { isConfigured, getSupabase, clearStoredSession } from './supabase-config.js';
import { renderSetupNotice, esc } from './support-common.js';

const LOGIN_URL = '/login/?next=' + encodeURIComponent('/profile/');
const mainEl = document.getElementById('pfMain');
if (mainEl) init();

let sb = null;
let me = null;

async function init() {
  if (!isConfigured()) { renderSetupNotice(mainEl); return; }

  sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.replace(LOGIN_URL); return; }
  me = session.user;

  sb.auth.onAuthStateChange((_event, s) => { if (!s) location.replace(LOGIN_URL); });

  // profiles row: display name + role + join date. Tolerate a missing row
  // (pre-trigger signups) by falling back to auth metadata.
  let profile = null;
  try {
    const { data } = await sb.from('profiles')
      .select('full_name, role, created_at').eq('id', me.id).maybeSingle();
    profile = data;
  } catch (e) { /* fall through to auth-only view */ }

  render(profile);
}

function render(profile) {
  const name = (profile && profile.full_name) || me.user_metadata?.full_name || '';
  const role = (profile && profile.role) || 'user';
  const joined = profile && profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const initial = ((name || me.email)[0] || '?').toUpperCase();
  const roleLabel = role === 'expert' ? 'Expert' : role === 'admin' ? 'Admin' : 'Member';

  // The email is read-only, so say WHY rather than just "can't be changed":
  // an OAuth address is owned by the provider, a password address by us.
  const verified = !!me.email_confirmed_at;
  const provider = me.app_metadata?.provider || 'email';
  const providerName = { google: 'Google', github: 'GitHub', facebook: 'Facebook' }[provider];
  const providerHint = providerName
    ? `Signed in with ${providerName} — your email is managed there.`
    : "Your sign-in email can't be changed here.";

  mainEl.innerHTML = `
    <div class="pf-card">
      <div class="pf-head">
        <span class="pf-avatar" aria-hidden="true">${esc(initial)}</span>
        <div class="pf-id">
          <strong>${esc(name || 'Set your name below')}</strong>
          <span>${esc(me.email)}</span>
        </div>
        <span class="pf-role pf-role-${esc(role)}">${esc(roleLabel)}</span>
      </div>

      <form id="pfForm" class="pf-form">
        <div class="form-group">
          <label for="pfName">Display name</label>
          <input type="text" id="pfName" maxlength="60" value="${esc(name)}" placeholder="e.g. Navin Bhaskar" autocomplete="name">
          <small>Shown on your community posts and bill-review conversations.</small>
        </div>
        <div class="form-group">
          <label for="pfEmail">Email</label>
          <div class="pf-email">
            <svg class="pf-email-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
            <input type="email" id="pfEmail" value="${esc(me.email)}" readonly aria-describedby="pfEmailHint">
            ${verified ? '<span class="pf-email-badge" title="Email confirmed">Verified</span>' : ''}
            <button type="button" class="pf-email-copy" id="pfEmailCopy" title="Copy email" aria-label="Copy email address">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
          <small id="pfEmailHint">${providerHint}</small>
        </div>
        <div class="pf-actions">
          <button type="submit" class="btn-primary" id="pfSave">Save changes</button>
          <span class="pf-status" id="pfStatus" role="status" aria-live="polite"></span>
        </div>
      </form>

      <div class="pf-meta">
        ${joined ? `<span>Member since ${esc(joined)}</span>` : ''}
        <button type="button" class="pf-signout" id="pfSignOut">Sign out</button>
      </div>
    </div>

    <div class="pf-links">
      <a class="pf-link" href="/my-bills/"><strong>My Bills</strong><span>Bills you calculated while signed in</span></a>
      <a class="pf-link" href="/bill-review/"><strong>My Complaints</strong><span>Expert bill reviews &amp; conversations</span></a>
      <a class="pf-link" href="/community/"><strong>Community</strong><span>Questions &amp; tips from other consumers</span></a>
    </div>`;

  document.getElementById('pfForm').addEventListener('submit', saveName);

  // Copy-to-clipboard with inline confirmation. Falls back to selecting the text
  // when the Clipboard API is unavailable (http origins, older browsers).
  document.getElementById('pfEmailCopy').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const input = document.getElementById('pfEmail');
    try {
      await navigator.clipboard.writeText(me.email);
      btn.classList.add('is-copied');
      btn.setAttribute('aria-label', 'Email copied');
      setTimeout(() => { btn.classList.remove('is-copied'); btn.setAttribute('aria-label', 'Copy email address'); }, 1600);
    } catch (err) {
      input.focus(); input.select();
    }
  });
  document.getElementById('pfSignOut').addEventListener('click', async () => {
    try { await Promise.race([sb.auth.signOut(), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
    try { localStorage.removeItem('discombill.role'); } catch (e) {}
    clearStoredSession();
    location.href = '/';
  });
}

async function saveName(e) {
  e.preventDefault();
  const btn = document.getElementById('pfSave');
  const statusEl = document.getElementById('pfStatus');
  const name = document.getElementById('pfName').value.trim();
  if (!name) { statusEl.textContent = 'Please enter a name.'; statusEl.className = 'pf-status pf-status-err'; return; }

  btn.disabled = true;
  statusEl.textContent = 'Saving…';
  statusEl.className = 'pf-status';

  // profiles row first (RLS "own profile update"), then the auth metadata the
  // header reads. Either failing alone still leaves the other consistent enough,
  // but report the first error we hit.
  const { error: dbErr } = await sb.from('profiles').update({ full_name: name }).eq('id', me.id);
  const { error: authErr } = dbErr ? { error: null } : await sb.auth.updateUser({ data: { full_name: name } });
  btn.disabled = false;

  const err = dbErr || authErr;
  if (err) {
    statusEl.textContent = 'Could not save: ' + err.message +
      (/policy|permission|denied/i.test(err.message) ? ' — run supabase/community.sql to enable profile edits.' : '');
    statusEl.className = 'pf-status pf-status-err';
    return;
  }
  statusEl.textContent = 'Saved ✓';
  statusEl.className = 'pf-status pf-status-ok';
}
