// support-common.js — shared building blocks for the Bill Review portals
// (/bill-review/ for consumers, /expert/ for the review team): auth card,
// live chat widget, and small formatting helpers.

import { getSupabase, isConfigured } from './supabase-config.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const fmtWhen = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const fmtSize = (b) => {
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  if (b >= 1024) return Math.round(b / 1024) + ' KB';
  return b + ' B';
};

export const STATUS_LABEL = { pending: 'In pool — awaiting expert', assigned: 'Expert reviewing', resolved: 'Resolved' };

export const statusChip = (status) =>
  `<span class="br-chip br-chip-${esc(status)}">${esc(STATUS_LABEL[status] || status)}</span>`;

// ── Backend-not-configured notice ────────────────────────────────────────────
export function renderSetupNotice(mount) {
  mount.innerHTML = `
    <div class="br-card br-setup">
      <h3>⚙️ Backend not connected yet</h3>
      <p>The Bill Review service needs its Supabase backend configured before
      logins and uploads work. One-time setup:</p>
      <ol>
        <li>Create a free project at <strong>supabase.com</strong></li>
        <li>Run <code>supabase/schema.sql</code> in the project's SQL Editor</li>
        <li>Paste the Project URL and anon key into <code>js/supabase-config.js</code></li>
      </ol>
    </div>`;
}

// ── Auth card ────────────────────────────────────────────────────────────────
// Renders sign-in / create-account tabs into `mount` and calls onSignedIn(sb,
// session) once a session exists (including on page load with a saved session).
// When the backend isn't configured yet the full form still renders (so the
// frontend is visible) — submitting just explains what's missing.
export async function initAuth({ mount, onSignedIn, onSignedOut, signupHint = '' }) {
  const configured = isConfigured();
  const sb = configured ? await getSupabase() : null;

  function renderForm(mode) {
    const isUp = mode === 'signup';
    mount.innerHTML = `
      ${configured ? '' : `
      <div class="br-banner">⚙️ <strong>Preview mode</strong> — the backend isn't connected yet, so
        sign-in and uploads are disabled. One-time setup: run <code>supabase/schema.sql</code> on a free
        Supabase project and paste its keys into <code>js/supabase-config.js</code>.</div>`}
      <div class="br-card br-auth">
        <div class="br-tabs" role="tablist">
          <button type="button" class="br-tab ${isUp ? '' : 'active'}" data-mode="signin" role="tab">Sign in</button>
          <button type="button" class="br-tab ${isUp ? 'active' : ''}" data-mode="signup" role="tab">Create account</button>
        </div>
        <form class="br-auth-form" novalidate>
          ${isUp ? `
          <div class="svc-control"><label for="brName">Full name</label>
            <input id="brName" type="text" autocomplete="name" placeholder="Your name" required></div>` : ''}
          <div class="svc-control"><label for="brEmail">Email</label>
            <input id="brEmail" type="email" autocomplete="email" placeholder="you@example.com" required></div>
          <div class="svc-control"><label for="brPass">Password</label>
            <input id="brPass" type="password" autocomplete="${isUp ? 'new-password' : 'current-password'}" placeholder="Minimum 6 characters" minlength="6" required></div>
          <button type="submit" class="btn-primary br-auth-submit">${isUp ? 'Create account' : 'Sign in'}</button>
          <p class="br-auth-msg" role="alert"></p>
          ${isUp && signupHint ? `<p class="br-auth-hint">${signupHint}</p>` : ''}
        </form>
      </div>`;

    mount.querySelectorAll('.br-tab').forEach(t =>
      t.addEventListener('click', () => renderForm(t.dataset.mode)));

    const form = mount.querySelector('.br-auth-form');
    const msg = mount.querySelector('.br-auth-msg');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!sb) { msg.textContent = '⚙️ Backend not connected yet — complete the Supabase setup above to enable accounts.'; return; }
      const email = mount.querySelector('#brEmail').value.trim();
      const password = mount.querySelector('#brPass').value;
      if (!email || password.length < 6) { msg.textContent = 'Enter a valid email and a password of 6+ characters.'; return; }
      const btn = form.querySelector('.br-auth-submit');
      btn.disabled = true; msg.textContent = '';
      try {
        if (isUp) {
          const fullName = mount.querySelector('#brName').value.trim();
          const { data, error } = await sb.auth.signUp({
            email, password, options: { data: { full_name: fullName } }
          });
          if (error) throw error;
          if (!data.session) {           // email confirmation is enabled
            msg.textContent = '✅ Account created — check your email for the confirmation link, then sign in.';
            return;
          }
        } else {
          const { error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
        // onAuthStateChange below takes it from here.
      } catch (err) {
        msg.textContent = err?.message || 'Something went wrong. Please try again.';
      } finally {
        btn.disabled = false;
      }
    });
  }

  if (!sb) { renderForm('signin'); return null; }

  sb.auth.onAuthStateChange((_event, session) => {
    if (session) onSignedIn(sb, session);
    else { renderForm('signin'); onSignedOut?.(); }
  });

  const { data: { session } } = await sb.auth.getSession();
  if (session) onSignedIn(sb, session);
  else renderForm('signin');
  return sb;
}

// Small header strip shown once signed in (name + sign out).
export function accountBarHtml(name, email, roleLabel = '') {
  return `
    <div class="br-account">
      <span class="br-account-who">👤 ${esc(name || email)}${roleLabel ? ` <span class="br-role">${esc(roleLabel)}</span>` : ''}</span>
      <button type="button" class="br-signout" id="brSignOut">Sign out</button>
    </div>`;
}

// ── Chat widget ──────────────────────────────────────────────────────────────
// Renders a live thread for one complaint. Returns a cleanup function that
// removes the realtime subscription (call it before re-rendering the view).
export function startChat({ sb, complaint, meId, names, mount, canSend }) {
  mount.innerHTML = `
    <div class="br-chat">
      <div class="br-chat-log" aria-live="polite"></div>
      ${canSend ? `
      <form class="br-chat-form">
        <input type="text" class="br-chat-input" placeholder="Type a message…" maxlength="2000" autocomplete="off">
        <button type="submit" class="btn-primary br-chat-send">Send</button>
      </form>` : `<p class="br-chat-locked">💬 Chat opens once an expert accepts this complaint.</p>`}
    </div>`;

  const log = mount.querySelector('.br-chat-log');
  const seen = new Set();

  function addMsg(m) {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    const mine = m.sender_id === meId;
    const who = mine ? 'You' : (names[m.sender_id] || 'Participant');
    const el = document.createElement('div');
    el.className = 'br-msg' + (mine ? ' br-msg-mine' : '');
    el.innerHTML = `<div class="br-msg-meta">${esc(who)} · ${esc(fmtWhen(m.created_at))}</div>
                    <div class="br-msg-body">${esc(m.body)}</div>`;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  (async () => {
    const { data, error } = await sb.from('messages')
      .select('id, sender_id, body, created_at')
      .eq('complaint_id', complaint.id)
      .order('id', { ascending: true });
    if (error) { log.innerHTML = `<p class="br-chat-locked">Could not load messages: ${esc(error.message)}</p>`; return; }
    if (!data.length) log.innerHTML = '<p class="br-chat-empty">No messages yet — say hello 👋</p>';
    else { log.innerHTML = ''; data.forEach(addMsg); }
  })();

  const channel = sb.channel(`chat-${complaint.id}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `complaint_id=eq.${complaint.id}` },
      (payload) => {
        if (log.querySelector('.br-chat-empty')) log.innerHTML = '';
        addMsg(payload.new);
      })
    .subscribe();

  const form = mount.querySelector('.br-chat-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('.br-chat-input');
    const body = input.value.trim();
    if (!body) return;
    input.value = '';
    const { error } = await sb.from('messages')
      .insert({ complaint_id: complaint.id, sender_id: meId, body });
    if (error) { input.value = body; alert('Message failed to send: ' + error.message); }
  });

  return () => sb.removeChannel(channel);
}

// ── Files ────────────────────────────────────────────────────────────────────
export async function fileListHtml(sb, files) {
  if (!files?.length) return '<p class="tx-muted">No documents attached.</p>';
  const items = await Promise.all(files.map(async f => {
    const { data } = await sb.storage.from('complaint-docs').createSignedUrl(f.path, 3600);
    const href = data?.signedUrl;
    const label = `📄 ${esc(f.name)} <span class="tx-muted">(${fmtSize(f.size)})</span>`;
    return href
      ? `<a class="br-file" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`
      : `<span class="br-file">${label}</span>`;
  }));
  return `<div class="br-files">${items.join('')}</div>`;
}
