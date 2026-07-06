// support-common.js — shared building blocks for the Bill Review portals
// (/bill-review/ for consumers, /expert/ for the review team): auth card,
// live chat widget, and small formatting helpers.

import { getSupabase, isConfigured, hasStoredSession, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Inline SVG icons (Lucide outlines) — functional icons are SVG, never emoji ──
const svgIc = (paths, cls = 'br-ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
export const ICONS = {
  file: svgIc('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
  clip: svgIc('<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>'),
  user: svgIc('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  phone: svgIc('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>'),
  gear: svgIc('<circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  spinner: svgIc('<circle cx="12" cy="12" r="9" opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/>', 'br-ic br-spin'),
};

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
      <h3>${ICONS.gear} Backend not connected yet</h3>
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
  // `sb` is filled in once the supabase-js bundle finishes downloading. It's a `let` so the
  // form's event handlers (defined below) pick up the client the moment it lands, even though
  // we render the form before the download completes.
  let sb = null;

  const notConnected = 'Backend not connected yet — complete the Supabase setup above to enable accounts.';

  // Resolves once the SDK has loaded (or we know it never will). The submit handlers await
  // this before touching `sb`, so a click that lands mid-download waits instead of failing.
  let markReady;
  const sbReady = new Promise(r => { markReady = r; });

  // Name captured during a phone sign-in, saved to user_metadata right after the
  // session lands (phone OTP has no signup step of its own, unlike email).
  let pendingName = '';

  // Phone OTP only works once an SMS provider is enabled in Supabase (see
  // supabase/AUTH_PROVIDERS.md). Probe the public auth settings and keep the
  // "Use phone number instead" option hidden until the server says it works —
  // it then appears automatically, no frontend change needed.
  let phoneEnabled = false;
  const applyPhoneVis = () => {
    const b = mount.querySelector('.br-auth-alt');
    if (b) b.hidden = !phoneEnabled;
  };
  const phoneProbe = !configured ? Promise.resolve() :
    fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } })
      .then(r => r.json())
      .then(j => { phoneEnabled = !!j?.external?.phone; })
      .catch(() => { phoneEnabled = true; }); // probe failed — don't hide a possibly-working option
  phoneProbe.then(applyPhoneVis);

  // Google OAuth is a full-page redirect; on return, onAuthStateChange picks up
  // the session. Requires the Google provider enabled in Supabase → Auth →
  // Providers. redirectTo brings the user back to the page they started on.
  async function signInWithGoogle(msg) {
    if (!sb) await sbReady;
    if (!sb) { msg.textContent = notConnected; return; }
    msg.textContent = '';
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.href }
    });
    if (error) msg.textContent = error.message || 'Could not start Google sign-in.';
  }

  // Google button + "or" divider, shown above the email form on the sign-in and
  // create-account tabs.
  function socialBlockHtml() {
    return `
      <button type="button" class="br-social" data-provider="google">
        <svg class="br-social-icon" viewBox="0 0 18 18" aria-hidden="true" width="18" height="18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.02-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>
      <div class="br-or"><span>or</span></div>`;
  }

  function renderForm(mode) {
    if (mode === 'phone') { renderPhoneForm(); return; }
    const isUp = mode === 'signup';
    mount.innerHTML = `
      ${configured ? '' : `
      <div class="br-banner">${ICONS.gear} <strong>Preview mode</strong> — the backend isn't connected yet, so
        sign-in and uploads are disabled. One-time setup: run <code>supabase/schema.sql</code> on a free
        Supabase project and paste its keys into <code>js/supabase-config.js</code>.</div>`}
      <div class="br-card br-auth">
        <div class="br-tabs" role="tablist">
          <button type="button" class="br-tab ${isUp ? '' : 'active'}" data-mode="signin" role="tab">Sign in</button>
          <button type="button" class="br-tab ${isUp ? 'active' : ''}" data-mode="signup" role="tab">Create account</button>
        </div>
        ${socialBlockHtml()}
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
        <button type="button" class="br-auth-alt" data-mode="phone"${phoneEnabled ? '' : ' hidden'}>${ICONS.phone} Use phone number instead</button>
      </div>`;

    mount.querySelectorAll('.br-tab, .br-auth-alt').forEach(t =>
      t.addEventListener('click', () => renderForm(t.dataset.mode)));

    const form = mount.querySelector('.br-auth-form');
    const msg = mount.querySelector('.br-auth-msg');
    mount.querySelector('.br-social').addEventListener('click', () => signInWithGoogle(msg));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!sb) await sbReady;
      if (!sb) { msg.textContent = notConnected; return; }
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

  // Phone / SMS OTP: a two-step flow — send a one-time code to the number, then
  // verify it. Requires an SMS provider configured in Supabase → Auth →
  // Providers → Phone.
  function renderPhoneForm() {
    mount.innerHTML = `
      ${configured ? '' : `
      <div class="br-banner">${ICONS.gear} <strong>Preview mode</strong> — the backend isn't connected yet, so
        sign-in is disabled. One-time setup: run <code>supabase/schema.sql</code> on a free Supabase
        project and paste its keys into <code>js/supabase-config.js</code>.</div>`}
      <div class="br-card br-auth">
        <div class="br-tabs" role="tablist">
          <button type="button" class="br-tab active" role="tab">Sign in with phone</button>
          <button type="button" class="br-tab br-back" data-mode="signin">← Email</button>
        </div>
        ${socialBlockHtml()}
        <form class="br-auth-form br-phone-form" novalidate>
          <div class="svc-control"><label for="brPhoneName">Full name <span class="br-label-note">first time only</span></label>
            <input id="brPhoneName" type="text" autocomplete="name" placeholder="Your name"></div>
          <div class="svc-control"><label for="brPhone">Phone number</label>
            <div class="br-phone-wrap"><span class="br-phone-cc" aria-hidden="true">+91</span>
              <input id="brPhone" type="tel" autocomplete="tel-national" inputmode="numeric" placeholder="99999 99999" maxlength="14" required></div></div>
          <div class="svc-control br-otp-row" hidden><label for="brOtp">Verification code</label>
            <input id="brOtp" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="6-digit code" maxlength="6"></div>
          <button type="submit" class="btn-primary br-auth-submit">Send code</button>
          <p class="br-auth-msg" role="alert"></p>
          <p class="br-auth-hint">Standard SMS rates may apply. We'll text a one-time code to this number.</p>
        </form>
      </div>`;

    mount.querySelectorAll('.br-tab[data-mode]').forEach(t =>
      t.addEventListener('click', () => renderForm(t.dataset.mode)));

    const form = mount.querySelector('.br-phone-form');
    const msg = mount.querySelector('.br-auth-msg');
    const otpRow = mount.querySelector('.br-otp-row');
    const btn = form.querySelector('.br-auth-submit');
    mount.querySelector('.br-social').addEventListener('click', () => signInWithGoogle(msg));

    let codeSent = false;
    // The +91 prefix is fixed in the UI; tolerate users typing it anyway (or a leading 0).
    const normPhone = () => {
      const digits = mount.querySelector('#brPhone').value
        .replace(/[\s()-]/g, '').replace(/^\+?91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
      return '+91' + digits;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!sb) await sbReady;
      if (!sb) { msg.textContent = notConnected; return; }
      const phone = normPhone();
      if (!/^\+91[6-9]\d{9}$/.test(phone)) { msg.textContent = 'Enter your 10-digit mobile number, e.g. 9999999999.'; return; }
      btn.disabled = true; msg.textContent = '';
      try {
        if (!codeSent) {
          const { error } = await sb.auth.signInWithOtp({ phone });
          if (error) throw error;
          codeSent = true;
          otpRow.hidden = false;
          mount.querySelector('#brPhone').readOnly = true;
          btn.textContent = 'Verify & sign in';
          msg.textContent = `✅ Code sent to ${phone}. Enter it below.`;
          mount.querySelector('#brOtp').focus();
        } else {
          const token = mount.querySelector('#brOtp').value.trim();
          if (!/^\d{4,8}$/.test(token)) { msg.textContent = 'Enter the numeric code from the SMS.'; return; }
          pendingName = mount.querySelector('#brPhoneName').value.trim();
          const { error } = await sb.auth.verifyOtp({ phone, token, type: 'sms' });
          if (error) { pendingName = ''; throw error; }
          // onAuthStateChange takes it from here (saving the name first).
        }
      } catch (err) {
        const m = err?.message || '';
        // Server-side provider gaps read badly raw ("Phone signins are disabled",
        // "unsupported phone provider") — translate them for users.
        msg.textContent = /disabled|unsupported|provider/i.test(m)
          ? 'Phone sign-in isn’t available yet — please use email or Google instead.'
          : (m || 'Something went wrong. Please try again.');
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Paint the sign-in form right away for signed-out visitors, so the dialog is interactive
  // instead of stuck on "Loading…" while the supabase-js bundle downloads from the CDN. When a
  // stored session exists we skip this — the signed-in view below swaps straight in with no
  // flash of the login form.
  const likelySignedOut = !hasStoredSession();
  if (likelySignedOut) renderForm('signin');

  // Now pull the SDK (the slow, first-time-only CDN fetch). The form above is already usable.
  sb = configured ? await getSupabase() : null;
  markReady(sb);

  if (!sb) {
    if (!likelySignedOut) renderForm('signin');   // not configured — the form's submit explains why
    return null;
  }

  sb.auth.onAuthStateChange((_event, session) => {
    if (!session) { renderForm('signin'); onSignedOut?.(); return; }
    const name = pendingName; pendingName = '';
    if (name && !session.user?.user_metadata?.full_name) {
      // First phone sign-in with a name given: persist it before onSignedIn
      // (which may navigate away). setTimeout gets us out of the auth callback —
      // supabase-js deadlocks if you call it from inside onAuthStateChange.
      setTimeout(async () => {
        try { await sb.auth.updateUser({ data: { full_name: name } }); } catch (e) { /* name is a nicety — never block sign-in on it */ }
        onSignedIn(sb, session);
      }, 0);
    } else {
      onSignedIn(sb, session);
    }
  });

  const { data: { session } } = await sb.auth.getSession();
  if (session) onSignedIn(sb, session);
  else if (!likelySignedOut) renderForm('signin');
  return sb;
}

// Small header strip shown once signed in (name + sign out).
export function accountBarHtml(name, email, roleLabel = '') {
  return `
    <div class="br-account">
      <span class="br-account-who">${ICONS.user} ${esc(name || email)}${roleLabel ? ` <span class="br-role">${esc(roleLabel)}</span>` : ''}</span>
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
        <input type="file" class="br-chat-file" hidden accept="image/png,image/jpeg,image/webp,application/pdf">
        <button type="button" class="br-chat-attach" title="Attach a document — PNG, JPG, WebP or PDF, max 10 MB" aria-label="Attach a document">${ICONS.clip}</button>
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
                    ${m.body ? `<div class="br-msg-body">${esc(m.body)}</div>` : ''}
                    ${m.file_path ? `<a class="br-file br-msg-file" target="_blank" rel="noopener">${ICONS.file} ${esc(m.file_name || 'attachment')}${m.file_size ? ` <span class="tx-muted">(${fmtSize(m.file_size)})</span>` : ''}</a>` : ''}`;
    // Attachments are served from private Storage, so the href is a short-lived
    // signed URL fetched after render.
    if (m.file_path) {
      const a = el.querySelector('.br-msg-file');
      sb.storage.from('complaint-docs').createSignedUrl(m.file_path, 3600)
        .then(({ data }) => { if (data?.signedUrl) a.href = data.signedUrl; });
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  (async () => {
    const { data, error } = await sb.from('messages')
      .select('id, sender_id, body, created_at, file_path, file_name, file_size')
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

  // 📎 Attachments: picking a file uploads it into the sender's own Storage
  // folder (same "upload own docs" policy as the original complaint documents)
  // and sends it as a message; requires supabase/chat-attachments.sql.
  const fileInput = mount.querySelector('.br-chat-file');
  const attachBtn = mount.querySelector('.br-chat-attach');
  attachBtn?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    if (file.size > 10485760) { alert('Attachment too large — the limit is 10 MB.'); return; }
    attachBtn.disabled = true; attachBtn.innerHTML = ICONS.spinner;
    try {
      const safe = file.name.replace(/[^\w.\- ]+/g, '').replace(/\s+/g, '-').slice(0, 100) || 'document';
      const path = `${meId}/${complaint.id}/chat-${Date.now()}-${safe}`;
      const { error: upErr } = await sb.storage.from('complaint-docs').upload(path, file);
      if (upErr) throw upErr;
      const { error } = await sb.from('messages').insert({
        complaint_id: complaint.id, sender_id: meId, body: '',
        file_path: path, file_name: file.name, file_size: file.size
      });
      if (error) throw error;
    } catch (err) {
      alert('Attachment failed to send: ' + (err?.message || err));
    } finally {
      attachBtn.disabled = false; attachBtn.innerHTML = ICONS.clip;
    }
  });

  return () => sb.removeChannel(channel);
}

// ── Files ────────────────────────────────────────────────────────────────────
export async function fileListHtml(sb, files) {
  if (!files?.length) return '<p class="tx-muted">No documents attached.</p>';
  const items = await Promise.all(files.map(async f => {
    const { data } = await sb.storage.from('complaint-docs').createSignedUrl(f.path, 3600);
    const href = data?.signedUrl;
    const label = `${ICONS.file} ${esc(f.name)} <span class="tx-muted">(${fmtSize(f.size)})</span>`;
    return href
      ? `<a class="br-file" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`
      : `<span class="br-file">${label}</span>`;
  }));
  return `<div class="br-files">${items.join('')}</div>`;
}
