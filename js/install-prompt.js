// js/install-prompt.js — native "Install app" button for the PWA.
//
// Chromium fires `beforeinstallprompt` when the site is installable and stops the browser's
// own mini-infobar if we preventDefault it. Nothing in the site captured that event before,
// so the only route to installing was the address-bar icon — which most people never notice.
//
// Deliberately narrow: this only lights up the button on /install/. No interstitial, no
// timed popover. An unprompted install nag on a bill calculator interrupts the one task the
// user came to do, and Chrome already suppresses repeat prompts for people who dismiss it.
//
// Safari/iOS never fires this event and has no programmatic install API, so iOS users always
// fall back to the written Share → Add to Home Screen steps on the page. That is why the page
// keeps full manual instructions rather than relying on the button.

let deferred = null;

function alreadyInstalled() {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true;   // iOS Safari's own flag
}

function mountButton() {
  const slot = document.getElementById('installAction');
  if (!slot) return;

  if (alreadyInstalled()) {
    slot.innerHTML = '<p class="install-state install-state-done">✓ You\'re already running the installed app.</p>';
    return;
  }
  if (!deferred) return;   // not installable (yet, or ever on this browser) — leave the manual steps as the answer

  slot.innerHTML = '<button type="button" class="seo-cta" id="installNowBtn">Install TheDiscomBill</button>'
    + '<p class="install-state">One tap — your browser will ask you to confirm.</p>';

  document.getElementById('installNowBtn').addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // The event is single-use: once prompt() resolves it cannot be reused, so drop it
    // whatever the outcome or a second click silently no-ops.
    deferred = null;
    window.gtag?.('event', 'pwa_install_prompt', { outcome });
    const slotNow = document.getElementById('installAction');
    if (!slotNow) return;
    slotNow.innerHTML = outcome === 'accepted'
      ? '<p class="install-state install-state-done">✓ Installed — look for the icon on your home screen.</p>'
      : '<p class="install-state">No problem. You can install any time from your browser menu — the steps are below.</p>';
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();          // suppress Chrome's mini-infobar; we surface it ourselves
    deferred = e;
    mountButton();               // the event often arrives after DOMContentLoaded
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    window.gtag?.('event', 'pwa_installed');
    mountButton();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountButton);
  else mountButton();
}
