// js/main.js — Entry point. Imports all modules and wires up the UI.

import { isConfigured, getStoredUser, getSupabase, clearStoredSession } from './supabase-config.js';

function onIdle(fn, timeout = 1500) {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout });
  else setTimeout(fn, Math.min(timeout, 1500));
}

// ── Popup coordinator ─────────────────────────────────────────────────────────
// The header/hero carry four independent popups — the account menu, Quick Links,
// the language switcher (i18n.js) and the "Get your bill reviewed" chooser
// (bill-ocr.js). Each lives in a different module and each trigger calls
// stopPropagation(), so a trigger click never reaches the others' outside-close
// listeners — which let all four stack open at once. This shared registry is the
// single source of truth for "only one open at a time": every popup registers a
// close() and calls closeOthers(name) as it opens, so opening any one dismisses
// the rest. Defined with `||` so whichever module entry point evaluates first
// creates it and the others reuse the same instance.
window.__popups = window.__popups || {
  _reg: new Map(),                        // name → close()
  register(name, close) { this._reg.set(name, close); },
  closeOthers(except) {
    this._reg.forEach((close, name) => { if (name !== except) { try { close(); } catch (e) {} } });
  },
};

// ── Header account button ─────────────────────────────────────────────────────
// Injected on every page (all pages load main.js) so the header never needs
// ── Auth modal ────────────────────────────────────────────────────────────────
// Compact sign-in dialog over a blurred backdrop, opened by the header Login
// button. The visitor keeps their page state (e.g. a half-filled calculator);
// the shared auth card + Supabase SDK are lazy-loaded only when it opens.
// /login/ remains the fallback for no-JS, new-tab clicks and ?next= deep links.
async function openAuthModal(triggerEl, opts = {}) {
  if (document.querySelector('.auth-modal-overlay')) return;
  // Dismiss any open header/hero popup — this dialog blocks the page, so leaving
  // one open behind the backdrop would strand it there.
  window.__popups.closeOthers('authModal');

  const overlay = document.createElement('div');
  overlay.className = 'auth-modal-overlay';
  // data-lenis-prevent: Lenis intercepts wheel events page-wide, which would leave
  // the dialog's own overflow scroll dead — this attribute restores native scrolling
  // inside it. Lenis itself is also paused below while the dialog is open.
  overlay.innerHTML = `
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authModalTitle" data-lenis-prevent>
      <button type="button" class="auth-modal-close" aria-label="Close sign-in dialog">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div class="auth-modal-head">
        <span class="auth-modal-spark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.6 13.4h5.9L9.4 22 18 10.6h-5.9L13 2z"/></svg>
        </span>
        <h2 class="auth-modal-title" id="authModalTitle">Welcome to TheDiscomBill</h2>
        <p class="auth-modal-sub">Sign in to save bills, get expert reviews and&nbsp;more</p>
      </div>
      <div class="auth-modal-body"><p class="tx-muted">Loading…</p></div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  window.__lenis?.stop();
  const dialog = overlay.querySelector('.auth-modal');

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    document.body.style.overflow = '';
    window.__lenis?.start();
    triggerEl?.isConnected && triggerEl.focus();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // Keep Tab cycling inside the dialog while it is open.
    const f = [...dialog.querySelectorAll('button, [href], input, select, textarea')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.auth-modal-close').addEventListener('click', close);
  overlay.querySelector('.auth-modal-close').focus();

  const { initAuth } = await import('./support-common.js');
  if (closed) return;                       // user closed it before the SDK arrived
  await initAuth({
    mount: overlay.querySelector('.auth-modal-body'),
    signupHint: 'We only use your email to sign you in and notify you about your cases. No spam, ever.',
    onSignedIn: () => {
      if (closed) return;
      close();
      // A gated CTA (e.g. "Get my bill reviewed by an expert") asked us to land the
      // visitor on a specific page once they're in — go straight there.
      if (opts.redirectTo) { location.assign(opts.redirectTo); return; }
      // Otherwise swap Login → account dropdown without a navigation. The session
      // lands in localStorage just before this fires; reload as a belt-and-braces
      // fallback if it hasn't (so the header never lies about auth state).
      initLoginButton();
      if (!document.querySelector('.account-dropdown')) { location.reload(); return; }
      // Let the gated flow that summoned this dialog pick up where it left off
      // (e.g. reopen the "Get your bill reviewed" chooser).
      opts.afterSignIn?.();
    }
  });
}

// Other modules (bill-ocr.js gates the "Get your bill reviewed" chooser) need to
// summon the same sign-in dialog without importing this entry module.
window.__openAuthModal = openAuthModal;

// Gated CTAs → auth modal (not the full /login/ page). The Bill Review portal
// requires an account and would otherwise bounce a logged-out visitor to /login/.
// Intercept clicks on any link into it: signed-out visitors get the in-page modal
// and are redirected to the portal once they finish; signed-in visitors, new-tab
// clicks and the portal's own pages navigate normally.
function initGatedLinks() {
  if (!isConfigured()) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="/bill-review/"], a[href^="/bill-review/?"]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;  // let new-tab through
    if (location.pathname.startsWith('/bill-review')) return;            // already in the portal
    if (getStoredUser()) return;                                         // signed in → navigate normally
    e.preventDefault();
    openAuthModal(a, { redirectTo: '/bill-review/' });
  });
}

// Highlight the current page's link in the top nav. Section links match by their
// first path segment (so /tariffs/uppcl/ still lights up "Tariffs", which points
// at /tariffs/states/); language twins (/hi/ /mr/ /ta/) are normalized first.
function initNavActive() {
  let path = location.pathname.replace(/^\/(hi|mr|ta)(?=\/|$)/, '') || '/';
  let best = null, bestLen = 0;
  document.querySelectorAll('.header-nav > a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('/#')) {
      // Anchor links (Calculator, About) — Calculator stands for the homepage.
      if (href.endsWith('#calculator') && (path === '/' || path === '/index.html') && bestLen === 0) best = best || a;
      return;
    }
    const seg = '/' + (new URL(href, location.origin).pathname.split('/')[1] || '') + '/';
    if (seg !== '//' && (path + '/').startsWith(seg) && seg.length > bestLen) { best = a; bestLen = seg.length; }
  });
  if (best) { best.classList.add('nav-active'); best.setAttribute('aria-current', 'page'); }
}

// One persistent, capture-phase outside-tap closer for the account menu. Armed once
// and querying the live DOM on every tap, it survives the header re-renders
// (syncAccountRole) that orphaned per-render document listeners, and capture phase
// means no in-page stopPropagation can starve it of the event.
let accountCloserArmed = false;
function armAccountOutsideCloser() {
  if (accountCloserArmed) return;
  accountCloserArmed = true;
  const onOutside = (e) => {
    const w = document.querySelector('.account-dropdown.open');
    if (!w || w.contains(e.target)) return;
    // No time-based guard here: the opening tap can never reach this point, because
    // its pointerdown/touchstart fires BEFORE the menu opens (no-op) and its click
    // targets the trigger, which is inside the wrap. Any event that gets here is a
    // genuine outside tap, so it always closes — timing windows previously swallowed
    // real taps and made closing feel random.
    w.classList.remove('open');
    w.querySelector('#headerLoginBtn')?.setAttribute('aria-expanded', 'false');
  };
  document.addEventListener('pointerdown', onOutside, true);
  document.addEventListener('click', onOutside, true);
  // Old WebKit doesn't emit click (or pointerdown) for taps on non-interactive
  // page areas — touchstart always fires, so outside taps can never go unseen.
  document.addEventListener('touchstart', onOutside, { capture: true, passive: true });
}

// hand-editing. Signed out: a plain "Login" button (one action, no dropdown).
// Signed in: an account dropdown — profile identity, My Complaints, My Bills,
// Expert Console (experts only, via a role flag cached by /expert/), Logout.
function initLoginButton() {
  const nav = document.querySelector('.header-nav');
  const themeBtn = document.getElementById('themeToggle');
  if (!nav || !themeBtn || !isConfigured()) return;
  if (location.pathname.startsWith('/login')) return;   // pointless on the login page itself

  // Re-runnable: after an in-modal sign-in we refresh the button in place.
  // If the menu was open (syncAccountRole re-renders ~1s after page load when the
  // confirmed role differs from the cached one), reopen it after the rebuild —
  // otherwise the user's just-opened menu vanishes under their finger on mobile.
  const existing = document.getElementById('headerLoginBtn');
  const prevWrap = existing?.closest('.account-dropdown');
  const wasOpen = !!prevWrap?.classList.contains('open');
  if (existing) (prevWrap || existing).remove();

  const escText = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const user = getStoredUser();

  if (!user) {
    const a = document.createElement('a');
    a.id = 'headerLoginBtn';
    a.className = 'login-btn';
    // Real href for no-JS, middle-click and bookmarks; a normal click opens
    // the in-page auth modal instead so the visitor keeps their page state.
    a.href = '/login/?next=' + encodeURIComponent(location.pathname);
    a.innerHTML = '<svg class="login-btn-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg><span>Login</span>';
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;  // let "open in new tab" through
      e.preventDefault();
      openAuthModal(a);
    });
    // Warm the auth code + supabase-js bundle on first hint of intent (hover / focus / touch),
    // so by the time the modal opens the form renders instantly and submit is ready — the SDK
    // is the slow, first-time-only CDN download. Fires at most once; ignored if it fails.
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      import('./support-common.js').catch(() => {});
      getSupabase().catch(() => {});
    };
    a.addEventListener('pointerenter', warm, { once: true });
    a.addEventListener('focus', warm, { once: true });
    a.addEventListener('touchstart', warm, { once: true, passive: true });
    themeBtn.after(a);   // sits to the right of the theme toggle
    return;
  }

  const firstName = (user.name || user.email).split(/[@\s]/)[0];
  const initial = (firstName[0] || '?').toUpperCase();
  let role = '';
  try { role = localStorage.getItem('discombill.role') || ''; } catch (e) {}
  const isExpert = role === 'expert';
  const isAdmin = role === 'admin';

  // 14px stroke icons for the dropdown items (Lucide outlines, stroke = currentColor)
  const icon = (paths) => `<svg class="account-item-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icComplaints = icon('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v4"/><path d="M12 14h.01"/>');
  const icBills = icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>');
  const icProfile = icon('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>');
  const icCommunity = icon('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
  const icExpert = icon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>');
  const icAdmin = icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>');
  const icEditor = icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>');
  const icLogout = icon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>');

  const wrap = document.createElement('div');
  wrap.className = 'nav-dropdown account-dropdown';
  wrap.innerHTML = `
    <button type="button" class="account-btn" id="headerLoginBtn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu — ${escText(firstName)}" title="${escText(user.name || user.email)}">
      <span class="account-avatar" aria-hidden="true">${escText(initial)}</span>
    </button>
    <div class="nav-dropdown-menu account-menu" role="menu">
      <div class="account-menu-head">
        <span class="account-avatar account-avatar-lg" aria-hidden="true">${escText(initial)}</span>
        <div class="account-menu-id">
          <strong>${escText(user.name || 'My Account')}</strong>
          <span>${escText(user.email)}</span>
        </div>
      </div>
      <a href="/profile/" class="nav-dropdown-item" role="menuitem">${icProfile} Profile</a>
      <a href="/community/" class="nav-dropdown-item" role="menuitem">${icCommunity} Community</a>
      <a href="/my-bills/" class="nav-dropdown-item" role="menuitem">${icBills} My Bills</a>
      <a href="/bill-review/" class="nav-dropdown-item" role="menuitem">${icComplaints} My Complaints</a>
      ${isExpert ? `<a href="/expert/" class="nav-dropdown-item" role="menuitem">${icExpert} Expert Console</a>` : ''}
      ${isAdmin ? `<a href="/admin/" class="nav-dropdown-item" role="menuitem">${icAdmin} Admin Console</a>` : ''}
      ${isAdmin ? `<a href="/editor.html" class="nav-dropdown-item" role="menuitem">${icEditor} Tariff Editor</a>` : ''}
      <div class="account-menu-sep" role="presentation"></div>
      <button type="button" id="accountLogout" class="nav-dropdown-item account-logout" role="menuitem">${icLogout} Sign out</button>
    </div>`;
  themeBtn.after(wrap);   // sits to the right of the theme toggle

  const trigger = wrap.querySelector('#headerLoginBtn');
  // Touch devices routinely emit duplicate / "ghost" click events for a single tap,
  // and syncAccountRole can re-render this whole dropdown mid-interaction. Per-render
  // document listeners (attached on open, removed on close) kept dying in that churn —
  // orphaned by a re-render or not yet attached when the outside tap landed — so the
  // menu either vanished instantly or refused to close. Instead: one PERSISTENT
  // capture-phase closer (armed once, below) queries the live DOM on every tap, and
  // the open/close here only flips classes.
  const closeMenu = () => {
    wrap.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    window.__popups.closeOthers('account');   // only one popup open at a time
    wrap.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  };
  window.__popups.register('account', closeMenu);
  // Plain toggle. Ghost/duplicate clicks (one physical tap delivering two click
  // events, legacy WebKit) are deduped against the LAST HANDLED toggle — not
  // against "time since open", which swallowed the user's deliberate taps and
  // made open/close feel random on mobile.
  let lastToggle = 0;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastToggle < 350) return;
    lastToggle = now;
    if (wrap.classList.contains('open')) closeMenu(); else openMenu();
  });
  armAccountOutsideCloser();
  if (wasOpen) openMenu();   // restore the menu the re-render just tore down

  wrap.querySelector('#accountLogout').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = 'Signing out…';
    try {
      const sb = await getSupabase();
      // Best-effort server-side revoke, capped so a dead network can't strand the
      // button on "Signing out…". signOut() resolves with { error } rather than
      // throwing, and on failure keeps the local session — the explicit
      // clearStoredSession() below is the logout that must always happen.
      await Promise.race([sb.auth.signOut(), new Promise(res => setTimeout(res, 2500))]);
    } catch (err) { /* SDK failed to load — clear locally below */ }
    try { localStorage.removeItem('discombill.role'); } catch (err) {}
    clearStoredSession();
    location.href = '/';
  });

  // The cached role (discombill.role) is only refreshed by pages that fetch the profile
  // (/admin, /bill-review, /expert). Confirm it against Supabase here so the Admin Console /
  // Tariff Editor / Expert Console items appear on ANY page right after login — not only once
  // the admin has visited one of those pages. Re-renders the button if the role changed.
  syncAccountRole(role);
}

/* ── Returning from Google sign-in ──────────────────────────────────────────────
   Google OAuth is a full-page redirect back to `redirectTo` (the page the auth modal
   was opened from — see signInWithGoogle in support-common.js). The modal is gone by
   then, so its onSignedIn callback never runs; the header is rendered fresh instead by
   initLoginButton().

   That reads the session SYNCHRONOUSLY from localStorage via getStoredUser(). On this
   particular load the session is not there yet — it is still sitting in the URL, and
   only supabase-js can exchange it. So the header renders "Login" for someone who has
   just signed in successfully.

   It then gets worse: with no stored user, initLoginButton() returns early and never
   reaches syncAccountRole(), which is the only thing on a plain page load that calls
   getSupabase(). Nothing constructs the client, so nothing exchanges the URL token —
   the visitor stays stuck on "Login" until something else happens to load the SDK
   (hovering the Login button warms it) and they reload by hand. That is exactly the
   "log in, still shows Login, refresh, now I'm in" behaviour.

   Fix: notice the OAuth response in the URL, load the SDK, wait for the exchange, and
   re-render the header. */
const OAUTH_URL_KEYS = [
  'code', 'access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type',
  'provider_token', 'provider_refresh_token', 'state', 'error', 'error_code',
  'error_description',
];

function oauthParamsInUrl() {
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  // `code` and `access_token` are the two success shapes (PKCE and implicit); the error
  // keys matter too, so a declined consent screen also gets the URL cleaned up.
  return ['code', 'access_token', 'error', 'error_description'].some(k => q.has(k) || h.has(k));
}

// Take the credential out of the address bar. supabase-js clears the hash itself, but a
// PKCE `?code=` can survive — and an auth code has no business sitting in browser history,
// a bookmark, or a Referer header on the next outbound click.
function stripOAuthParamsFromUrl() {
  try {
    const url = new URL(location.href);
    let touched = false;
    for (const k of OAUTH_URL_KEYS) {
      if (url.searchParams.has(k)) { url.searchParams.delete(k); touched = true; }
    }
    if (/(^|[#&])(access_token|refresh_token|provider_token)=/.test(url.hash)) {
      url.hash = ''; touched = true;
    }
    if (touched) history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch (e) { /* URL parsing failed — leaving the address bar as-is is harmless */ }
}

async function completeOAuthRedirect() {
  if (!isConfigured() || !oauthParamsInUrl()) return;
  try {
    const sb = await getSupabase();
    if (!sb) return;
    // Subscribe BEFORE awaiting, so the SIGNED_IN event is caught whenever the exchange
    // completes rather than relying on getSession() resolving after it. This also keeps
    // the header honest for the rest of the page's life — a token refresh or a sign-out
    // in another tab re-renders it too. initLoginButton() is re-runnable by design.
    sb.auth.onAuthStateChange(() => initLoginButton());
    // Constructing the client starts detectSessionInUrl; getSession() awaits that
    // initialisation, so once it resolves the session is persisted (or we know it failed).
    await sb.auth.getSession();
    initLoginButton();
  } catch (e) {
    /* SDK blocked or offline: the header stays on "Login", which is at least not a lie. */
  } finally {
    stripOAuthParamsFromUrl();
  }
}

let roleSyncedOnce = false;
async function syncAccountRole(currentRole) {
  // At most one confirm-and-re-render per page load. The loop was previously broken
  // only by the localStorage role cache matching on the next call — if that write
  // fails (private mode, quota), the header rebuilt itself once per network
  // round-trip forever, eating the open menu's tap guard each time.
  if (roleSyncedOnce) return;
  roleSyncedOnce = true;
  try {
    const sb = await getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    const { data: profile } = await sb.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (profile && profile.role) || '';
    try {
      if (role === 'admin' || role === 'expert') localStorage.setItem('discombill.role', role);
      else localStorage.removeItem('discombill.role');
    } catch (e) {}
    if (role !== currentRole) initLoginButton();   // re-render with the confirmed role (no loop: role now matches)
  } catch (e) { /* offline or no session — keep the cached view */ }
}

// Expose helpers called from onclick in the rendered bill HTML

// ── Smooth momentum scrolling (Lenis) ─────────────────────────────────────────
// Gives the whole page an eased, weighted "glide" instead of the browser's default
// jump. Disabled for users who prefer reduced motion (they keep native scrolling).
async function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: Lenis } = await import('./vendor/lenis.mjs');
  const lenis = new Lenis({
    duration: 1.1,
    easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),   // easeOutExpo — quick start, soft landing
    smoothWheel: true,
    // Leave touch devices on native scrolling (smoother + better battery/accessibility).
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // Route in-page anchor links (#calculator, #about, skip-link) through Lenis so they
  // glide to the target instead of jumping.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;                 // ignore bare "#"
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -70 });   // clear the sticky header
  });

  window.__lenis = lenis;
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
// Fade + rise elements (marked `.reveal`) as they scroll into view. Each reveals
// once, then is unobserved. Falls back to showing everything if IntersectionObserver
// is unavailable or the user prefers reduced motion.
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
    // threshold 0 + a small fixed rootMargin: reveal as soon as ~40px of the element
    // enters the viewport. A ratio threshold made TALL elements (like the 20-row
    // comparison table) stay invisible until hundreds of px had scrolled past.
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  // Reveal anything already within the viewport on load right away — the 12%
  // threshold never fires for elements taller than the space above the fold
  // (e.g. the usage-estimator layout), so they'd stay hidden until you scroll.
  els.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('is-visible');
    else io.observe(el);
  });
}

// Start every load at the top so the hero's reveal-on-load animation plays (the browser would
// otherwise restore the previous scroll position on reload/back-navigation).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';


// Register the service worker for offline support (no-op on unsupported / insecure contexts).
// Deferred to idle time after load: SW install pre-caches ~60 URLs, and starting that
// download burst during initial render steals bandwidth from what the user is looking at.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Root-absolute, not 'sw.js'. A relative path resolves against the current directory,
    // so it only ever found the worker on '/' and 404'd on every interior page — which is
    // where organic visitors actually land. Scope is pinned to '/' so one worker serves
    // the whole site rather than one per directory.
    const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(register, { timeout: 8000 });
    else setTimeout(register, 4000);
  });
}

// ── Hero sample-bill card ─────────────────────────────────────────────────────
// Homepage only (main.js loads everywhere, so bail when the card is absent). One card
// rotating through five real DISCOM bills, 5s apiece, with dots above the DISCOM chip.
// Standard tablist semantics — arrows move between dots — plus autoplay, which pauses
// while the pointer is over the card, while focus is inside it, and while the tab is
// hidden. Any manual pick stops autoplay for good: the reader has taken over.
const HBC_DWELL_MS = 5000;

function initHeroBillCard() {
  const card = document.getElementById('heroBillCard');
  if (!card) return;
  const dots   = [...card.querySelectorAll('.hbc-dot')];
  const slides = dots.map(d => document.getElementById(d.getAttribute('aria-controls')));
  const chip   = document.getElementById('hbcChip');
  if (dots.length < 2) return;

  // The CSS sweep reads its duration from this, so the animation and the timer below
  // can never drift apart.
  card.style.setProperty('--hbc-dwell', HBC_DWELL_MS + 'ms');

  // Reduced motion kills the SWEEP, not the rotation. Stopping autoplay entirely left
  // iPhone users (Reduce Motion is a common iOS setting) staring at slide 1 forever, with
  // nothing to suggest four more existed. WCAG 2.2.2 wants a way to pause auto-updating
  // content, and the dots are exactly that — so rotation continues, just without the
  // animated fill (see .hbc-dot-fill under prefers-reduced-motion in styles.css).
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0, timer = null, stopped = false;

  const show = (i, focus) => {
    index = (i + dots.length) % dots.length;
    dots.forEach((d, n) => {
      const on = n === index;
      d.classList.toggle('active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
      d.tabIndex = on ? 0 : -1;
      // CSS handles visibility (see .hbc-face); `inert` is what actually keeps the
      // off-screen slide out of the tab order and the a11y tree — visibility:hidden
      // alone still accepts programmatic focus.
      const s = slides[n];
      if (s) { s.classList.toggle('active', on); s.inert = !on; }
    });
    // Restart the dot's sweep from zero on every advance: re-adding the class alone
    // would let the running animation continue, so the pill would look half-spent.
    const fill = dots[index].querySelector('.hbc-dot-fill');
    if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
    if (chip) {
      const name = slides[index] && slides[index].dataset.chip;
      if (name) chip.textContent = name;
    }
    if (focus) dots[index].focus();
  };

  const tick  = () => { if (!stopped) timer = setTimeout(() => { show(index + 1); tick(); }, HBC_DWELL_MS); };
  const pause = () => { clearTimeout(timer); timer = null; card.classList.add('is-paused'); };
  const play  = () => {
    if (stopped || timer) return;
    card.classList.remove('is-paused');
    tick();
  };
  // A manual pick means the reader is driving; autoplay would yank the slide back.
  const stop  = () => { stopped = true; clearTimeout(timer); timer = null; card.classList.remove('is-paused'); };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stop(); show(i); });
    dot.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      stop();
      show(index + step, true);
    });
  });

  // NO hover-pause. Moving the mouse across the card on the way to something else stopped
  // the rotation, which reads as the card breaking rather than as a courtesy — the pointer
  // crosses this card constantly, since it sits between the headline and the rest of the page.
  //
  // WCAG 2.2.2 wants a way to pause auto-updating content, and it still has three, none of
  // which fire by accident: clicking a dot hands control over for good (stop()), keyboard
  // focus pauses while you are inside the card, and a hidden tab pauses everything.
  //
  // Deleting this also deletes a whole class of bug rather than guarding against it. The
  // previous version needed a touchstart flag AND a self-re-arming watchdog purely to survive
  // iOS Safari, which emits a synthetic pointerenter with pointerType "mouse" after a tap and
  // then never sends the matching pointerleave — one tap froze the card permanently. With no
  // pointerenter handler there is nothing for a synthetic hover to trigger.
  card.addEventListener('focusin',  pause);
  card.addEventListener('focusout', (e) => { if (!card.contains(e.relatedTarget)) play(); });
  // A background tab burns no timers, and the sweep would otherwise finish unseen.
  document.addEventListener('visibilitychange', () => { document.hidden ? pause() : play(); });
  // iOS restores pages from bfcache without firing visibilitychange, so a back-navigation
  // came back to a card whose timer had been cleared and never restarted.
  window.addEventListener('pageshow', () => { if (!document.hidden) play(); });

  show(0);
  play();
}

function initDeferredHeaderSearch() {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn || document.getElementById('siteSearchBtn')) return;

  let searchModulePromise = null;
  const loadSearch = () => searchModulePromise ||= import('./search.js');
  const open = () => loadSearch().then(m => m.openSearch()).catch(() => {});

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'siteSearchBtn';
  btn.className = 'site-search-btn';
  btn.setAttribute('aria-label', 'Search the site (Ctrl+K)');
  btn.title = 'Search (Ctrl+K)';
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
  btn.addEventListener('click', open);
  btn.addEventListener('pointerenter', loadSearch, { once: true });
  btn.addEventListener('focus', loadSearch, { once: true });
  themeBtn.before(btn);

  document.addEventListener('keydown', (e) => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    else if (e.key === '/' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); open(); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  onIdle(() => { initSmoothScroll().catch(() => {}); }, 1800);   // Lenis momentum scrolling (skipped under prefers-reduced-motion)
  initScrollReveal();   // fade + rise elements as they enter the viewport
  // /guides/ index only — filter + paging, loaded on demand so other pages don't pay for it.
  if (document.getElementById('blogGrid')) {
    import('./blog-index.js').then(m => m.initBlogIndex()).catch(() => {});
  }
  // Remote FPPA rates (Supabase, cached + offline-safe). When fresh rows land after the
  // form has rendered, re-run the auto prefill so the visible rate updates too.
  onIdle(() => { import('./rates.js').then(m => m.initRemoteRates()).catch(() => {}); }, 2200);
  onIdle(() => { import('./i18n.js').then(m => m.initI18n()).catch(() => {}); }, 700);   // apply saved/default language + wire the EN/हिंदी switcher
  // /compare/ and the homepage only — initComparisonTable() no-ops without #compTableBody,
  // but the import alone pulled the whole tariff registry onto every page.
  if (document.getElementById('compTableBody')) {
    import('./compare.js').then(m => m.initComparisonTable()).catch(() => {});
  }
  initLoginButton();     // top-right Login / My Account button
  completeOAuthRedirect();   // ...then correct it if we just came back from Google
  initDeferredHeaderSearch();    // header magnifier + Ctrl+K / '/' site search
  initHeroBillCard();    // homepage hero card: estimate ⇄ across-India faces
  initGatedLinks();      // Bill Review CTAs open the auth modal, then redirect in
  initNavActive();       // highlight the current page's link in the top nav

  // Theme toggle — data-theme is pre-set by the inline <head> script; here we sync the button
  // and let the user flip + persist their choice.
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    const syncThemeBtn = () => {
      const dark = root.dataset.theme === 'dark';
      // .is-dark drives the CSS sun/moon crossfade (class toggles re-style
      // reliably everywhere; attribute-selector invalidation proved flaky here).
      themeBtn.classList.toggle('is-dark', dark);
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    };
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      syncThemeBtn();
    });
    syncThemeBtn();
  }

  // Header dropdowns (Solar tools, Quick Links / More). One generic handler per
  // dropdown; the shared popup registry keeps only one open at a time. The account
  // dropdown is excluded — it has its own lifecycle (see renderAccountUi).
  document.querySelectorAll('.header-nav .nav-dropdown').forEach((drop, i) => {
    const trigger = drop.querySelector(':scope > .nav-dropdown-trigger');
    if (!trigger) return;
    const key = drop.id || 'navDrop' + i;
    const close = () => {
      drop.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };
    window.__popups.register(key, close);
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drop.classList.contains('open')) { close(); return; }
      window.__popups.closeOthers(key);   // only one popup open at a time
      drop.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    });
    document.addEventListener('click', (e) => {
      if (!drop.contains(e.target)) close();
    });
    // Nested "Get Your Bill Reviewed" subsection: a side flyout on desktop (tap
    // toggles it; hover handles itself in CSS), an inline accordion on mobile.
    // stopPropagation keeps the parent menu open. If the flyout would run off
    // the right edge of the viewport it flips to the left side instead.
    drop.querySelectorAll('.nav-subgroup-trigger').forEach((t) => {
      const g = t.closest('.nav-subgroup');
      const setFlip = () => {
        g.classList.toggle('flip', g.getBoundingClientRect().right + 250 > window.innerWidth);
      };
      g.addEventListener('mouseenter', setFlip);
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        setFlip();
        const open = g.classList.toggle('open');
        t.setAttribute('aria-expanded', String(open));
      });
    });
  });

  // Calculator pages only. This one import used to be static and cost every page on the
  // site 514KB of JS (ui.js -> renderer/engine + the registry's 37 state modules +
  // datepicker) for code a guide or tariff page never runs. See js/calculator-init.js.
  if (document.getElementById('stateSelect')) {
    const initCalculatorWhenCalm = () => {
      import('./calculator-init.js').then(m => m.initCalculator()).catch(() => {});
    };
    if ('requestIdleCallback' in window) requestIdleCallback(initCalculatorWhenCalm, { timeout: 1500 });
    else setTimeout(initCalculatorWhenCalm, 0);
  }

  // Guide articles only — the Share control. Loaded the same way and for the same reason:
  // the other ~440 generated pages have no share button, and should not pay a request for it.
  // The button renders `hidden`; share-article.js is what reveals it, so if this import fails
  // the reader sees no button rather than a dead one.
  if (document.querySelector('[data-share-article]')) {
    import('./share-article.js').catch(() => {});
  }
});
