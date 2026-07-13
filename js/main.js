// js/main.js — Entry point. Imports all modules and wires up the UI.

import {
  populateStates, populateDiscoms, populateCategories, populateSupplyTypes,
  populateMonthYear, prefillFac, prefillLpsc, updateBilledDemandVisibility,
  initTabs, addPaymentRow, addAdjustmentRow,
  updateArrearTotal, updateUnitsDisplay, updateCalcButton, updateBillingPeriod,
  updateTodDisplay, updateFacUnitLabel, updateTariffPeriodHint,
  onFppaAutoToggle, markFppaManual,
  doCalculate, refreshSubsidyToggle,
  shareBill, shareBillWhatsApp, loadFromUrl, loadSample, initHistory,
  refreshSupplyTypeDependent, applyLifelineDefaultLoad, checkLifelineLimits,
  getMeterMode, setMeterMode, addMeterRow, updateAdvancedMeter,
  syncBillingMonthYear, applyDefaultBillingBasis, showToast, refreshRequiredValidation,
} from './ui.js';
import { initDatePickers } from './datepicker.js';
import { initI18n } from './i18n.js';
import { initComparisonTable } from './compare.js';
import { isConfigured, getStoredUser, getSupabase } from './supabase-config.js';
import { initHeaderSearch } from './search.js';
import Lenis from './vendor/lenis.mjs';

// ── Header account button ─────────────────────────────────────────────────────
// Injected on every page (all pages load main.js) so the header never needs
// ── Auth modal ────────────────────────────────────────────────────────────────
// Compact sign-in dialog over a blurred backdrop, opened by the header Login
// button. The visitor keeps their page state (e.g. a half-filled calculator);
// the shared auth card + Supabase SDK are lazy-loaded only when it opens.
// /login/ remains the fallback for no-JS, new-tab clicks and ?next= deep links.
async function openAuthModal(triggerEl, opts = {}) {
  if (document.querySelector('.auth-modal-overlay')) return;

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
      <h2 class="auth-modal-title" id="authModalTitle">Sign in to TheDiscomBill</h2>
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
      if (!document.querySelector('.account-dropdown')) location.reload();
    }
  });
}

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
  const icExpert = icon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>');
  const icAdmin = icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>');
  const icEditor = icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>');
  const icLogout = icon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>');

  const wrap = document.createElement('div');
  wrap.className = 'nav-dropdown account-dropdown';
  wrap.innerHTML = `
    <button type="button" class="login-btn account-btn" id="headerLoginBtn" aria-haspopup="true" aria-expanded="false">
      <span class="account-avatar" aria-hidden="true">${escText(initial)}</span>
      <span>${escText(firstName)}</span>
      <svg class="nav-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="nav-dropdown-menu account-menu" role="menu">
      <div class="account-menu-head">
        <span class="account-avatar account-avatar-lg" aria-hidden="true">${escText(initial)}</span>
        <div class="account-menu-id">
          <strong>${escText(user.name || 'My Account')}</strong>
          <span>${escText(user.email)}</span>
        </div>
      </div>
      <a href="/bill-review/" class="nav-dropdown-item" role="menuitem">${icComplaints} My Complaints</a>
      <a href="/my-bills/" class="nav-dropdown-item" role="menuitem">${icBills} My Bills</a>
      ${isExpert ? `<a href="/expert/" class="nav-dropdown-item" role="menuitem">${icExpert} Expert Console</a>` : ''}
      ${isAdmin ? `<a href="/admin/" class="nav-dropdown-item" role="menuitem">${icAdmin} Admin Console</a>` : ''}
      ${isAdmin ? `<a href="/editor.html" class="nav-dropdown-item" role="menuitem">${icEditor} Tariff Editor</a>` : ''}
      <button type="button" id="accountLogout" class="nav-dropdown-item account-logout" role="menuitem">${icLogout} Logout</button>
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
    wrap.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  };
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
      await sb.auth.signOut();
    } catch (err) { /* token may already be stale — still clear local state */ }
    try { localStorage.removeItem('discombill.role'); } catch (err) {}
    location.href = '/';
  });

  // The cached role (discombill.role) is only refreshed by pages that fetch the profile
  // (/admin, /bill-review, /expert). Confirm it against Supabase here so the Admin Console /
  // Tariff Editor / Expert Console items appear on ANY page right after login — not only once
  // the admin has visited one of those pages. Re-renders the button if the role changed.
  syncAccountRole(role);
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
function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
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

// Expose helpers called from onclick in the rendered bill HTML
window.__shareBill = shareBill;
window.__shareBillWa = shareBillWhatsApp;

// Register the service worker for offline support (no-op on unsupported / insecure contexts).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();   // Lenis momentum scrolling (skipped under prefers-reduced-motion)
  initScrollReveal();   // fade + rise elements as they enter the viewport
  if (document.getElementById('stateSelect')) {
    populateStates();
    populateMonthYear();
    initTabs();
  }
  initI18n();   // apply saved/default language + wire the EN/हिंदी switcher
  initComparisonTable(); // Render the dynamic tariff comparison table
  initLoginButton();     // top-right Login / My Account button
  initHeaderSearch();    // header magnifier + Ctrl+K / '/' site search
  initGatedLinks();      // Bill Review CTAs open the auth modal, then redirect in

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

  // Quick Links dropdown
  const qlDrop = document.getElementById('quickLinksDropdown');
  const qlTrigger = document.getElementById('quickLinksTrigger');
  if (qlDrop && qlTrigger) {
    qlTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = qlDrop.classList.toggle('open');
      qlTrigger.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', (e) => {
      if (!qlDrop.contains(e.target)) {
        qlDrop.classList.remove('open');
        qlTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const stateEl      = document.getElementById('stateSelect');
  const discomEl     = document.getElementById('discomSelect');
  const categoryEl   = document.getElementById('categorySelect');
  const supplyTypeEl = document.getElementById('supplyTypeSelect');

  if (stateEl) {
    stateEl.addEventListener('change', () => {
      populateDiscoms(stateEl.value);
      populateCategories('');
      populateSupplyTypes('', '');
      updateCalcButton();
      refreshSubsidyToggle();
    });

    discomEl.addEventListener('change', () => {
      populateCategories(discomEl.value);
      populateSupplyTypes('', '');
      updateCalcButton();
      refreshSubsidyToggle();
      prefillLpsc(discomEl.value);
      // Reflect the chosen DISCOM (and its state) in the URL without reloading, so the
      // selection can be bookmarked / shared. Other existing query params are preserved.
      const params = new URLSearchParams(location.search);
      if (discomEl.value) {
        params.set('state', stateEl.value);
        params.set('discom', discomEl.value);
      } else {
        params.delete('discom');
      }
      const qs = params.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    });

    categoryEl.addEventListener('change', () => {
      populateSupplyTypes(discomEl.value, categoryEl.value);
      applyDefaultBillingBasis();
      updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
      updateCalcButton();
      refreshSubsidyToggle();
    });

    document.getElementById('billingBasis').addEventListener('change', () => {
      updateBilledDemandVisibility(discomEl.value, categoryEl.value, supplyTypeEl.value);
    });

    supplyTypeEl.addEventListener('change', () => {
      applyLifelineDefaultLoad(discomEl.value, categoryEl.value, supplyTypeEl.value);
      refreshSupplyTypeDependent();
      checkLifelineLimits();
    });

    document.getElementById('fromDate').addEventListener('change', () => {
      updateBillingPeriod();
      prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
      checkLifelineLimits();
    });
    document.getElementById('toDate').addEventListener('change', () => {
      updateBillingPeriod();
      prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
      updateTariffPeriodHint();
      checkLifelineLimits();
    });
    document.getElementById('connectedLoad').addEventListener('input', () => {
      updateCalcButton();
      checkLifelineLimits();
    });
    document.getElementById('billedDemand').addEventListener('input', checkLifelineLimits);

    ['billingMonth', 'billingYear'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        prefillFac(discomEl.value, categoryEl.value, supplyTypeEl.value);
        updateTariffPeriodHint();
      });
    });
    document.getElementById('billingMonthYear').addEventListener('change', syncBillingMonthYear);

    document.getElementById('facMode').addEventListener('change', () => {
      updateFacUnitLabel();
      markFppaManual();
    });
    document.getElementById('fppaAuto').addEventListener('change', () => {
      onFppaAutoToggle(discomEl.value, categoryEl.value, supplyTypeEl.value);
    });
    document.getElementById('facRate').addEventListener('input', markFppaManual);

    document.querySelectorAll('input[name="meterMode"]').forEach(r => {
      r.addEventListener('change', () => setMeterMode(getMeterMode()));
    });
    document.getElementById('addMeterRowBtn').addEventListener('click', () => { addMeterRow(''); updateAdvancedMeter(); });
    setMeterMode(getMeterMode());

    ['todPeak', 'todNormal', 'todOffPeak'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => { updateTodDisplay(); checkLifelineLimits(); });
    });
    document.getElementById('arrears').addEventListener('input', updateArrearTotal);
    document.getElementById('arrearLpsc').addEventListener('input', updateArrearTotal);

    const lpscChk = document.getElementById('lpscApplicable');
    const toggleLpscFields = () => {
      const on = lpscChk.checked;
      document.getElementById('lpscRate').disabled = !on;
      document.getElementById('currentLpscMonths').disabled = !on;
      document.getElementById('lpscFields').classList.toggle('fields-disabled', !on);
    };
    lpscChk.addEventListener('change', toggleLpscFields);
    toggleLpscFields();

    document.getElementById('addPaymentBtn').addEventListener('click', addPaymentRow);
    document.getElementById('addAdjustmentBtn').addEventListener('click', addAdjustmentRow);

    const formPanel = document.querySelector('.form-panel');
    if (formPanel) {
      formPanel.addEventListener('input', refreshRequiredValidation);
      formPanel.addEventListener('change', refreshRequiredValidation);
    }

    document.getElementById('calculateBtn').addEventListener('click', doCalculate);
    document.getElementById('sampleBtn').addEventListener('click', loadSample);
    document.getElementById('sampleBtnPanel')?.addEventListener('click', loadSample);
    initHistory();

    // ── Simple / Detailed mode ────────────────────────────────────────────────
    // Simple mode strips the form to state → DISCOM → category → units → load. It reuses the
    // existing meter row in direct-units mode, so validation, sharing and history are untouched.
    const setCalcMode = (mode) => {
      const simple = mode === 'simple';
      formPanel.classList.toggle('simple-mode', simple);
      // Drives the segmented control's sliding thumb (CSS keys off this attribute)
      document.getElementById('calcMode')?.setAttribute('data-active', mode);
      document.querySelectorAll('#calcMode .calc-mode-btn').forEach(b => {
        const on = b.dataset.mode === mode;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      const hint = document.getElementById('calcModeHint');
      if (hint) hint.style.display = simple ? '' : 'none';
      if (simple) {
        // Force the plain "type your units" path: Meter Reading mode + direct-units override.
        const radio = document.querySelector('input[name="meterMode"][value="advanced"]');
        if (radio && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
        const row = document.querySelector('#advancedRows .meter-row');
        const chk = row?.querySelector('.m-override-chk');
        if (chk && !chk.checked) { chk.checked = true; chk.dispatchEvent(new Event('change')); }
        const lbl = row?.querySelector('.m-units-label');
        if (lbl) lbl.textContent = (localStorage.getItem('lang') === 'hi')
          ? 'इस महीने की खपत (यूनिट)' : 'Units consumed this month';
      }
      try { localStorage.setItem('calcMode', mode); } catch (e) {}
    };
    document.querySelectorAll('#calcMode .calc-mode-btn').forEach(b => {
      b.addEventListener('click', () => setCalcMode(b.dataset.mode));
    });
    // Default new visitors to Simple; shared bill links open in Detailed so every field they
    // carry (arrears, TOD, dates…) is visible.
    let savedMode = null;
    try { savedMode = localStorage.getItem('calcMode'); } catch (e) {}
    const hasSharePayload = new URLSearchParams(location.search).has('q');
    setCalcMode(hasSharePayload ? 'detailed' : (savedMode || 'simple'));

    const netChk = document.getElementById('netMeteringChk');
    netChk.addEventListener('change', () => {
      document.getElementById('netMeteringFields').style.display = netChk.checked ? 'block' : 'none';
    });

    initDatePickers();

    document.getElementById('billPanel').addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;
      const item = header.parentElement;
      const isOpen = item.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.getElementById('advancedRows').addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); doCalculate(); }
    });

    loadFromUrl();
  }
});
