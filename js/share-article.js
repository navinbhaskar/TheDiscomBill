// js/share-article.js — the Share control on guide articles.
//
// Progressive enhancement: generate-seo.js renders the button with `hidden`, and this module
// removes it. A share button that does nothing is worse than no share button, so it only
// appears once the code that makes it work has actually loaded.
//
// Two behaviours, picked by capability rather than by guessing at the device:
//   • navigator.share exists (most phones, Safari) → open the OS share sheet, which is what
//     a reader on a phone actually wants: WhatsApp, Messages, wherever they already talk.
//   • otherwise (most desktop browsers) → copy the URL and say so, because a share sheet that
//     silently fails looks like a broken button.

const RESET_MS = 2000;

function label(btn) { return btn.querySelector('[data-share-label]'); }

function flash(btn, text) {
  const el = label(btn);
  if (!el) return;
  const original = btn.dataset.shareOriginal || el.textContent;
  btn.dataset.shareOriginal = original;
  el.textContent = text;
  btn.classList.add('is-done');
  clearTimeout(btn._shareTimer);
  btn._shareTimer = setTimeout(() => {
    el.textContent = original;
    btn.classList.remove('is-done');
  }, RESET_MS);
}

// Clipboard API needs a secure context and can still be refused by permissions policy, so
// fall back to a selected off-screen textarea before admitting defeat.
async function copyUrl(url) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (e) { /* fall through to the legacy path */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

async function onShare(btn) {
  const url = location.href.split('#')[0];
  const title = (document.querySelector('h1')?.textContent || document.title).trim();

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;                       // the sheet handled it; no confirmation needed
    } catch (err) {
      // AbortError means the reader dismissed the sheet — that is a normal outcome, not a
      // failure, so it must not fall through to copying something they chose not to share.
      if (err && err.name === 'AbortError') return;
      // Anything else (NotAllowedError, unsupported payload) → copying is still useful.
    }
  }

  flash(btn, await copyUrl(url) ? 'Link copied' : 'Copy failed');
}

export function initShareArticle() {
  const buttons = document.querySelectorAll('[data-share-article]');
  if (!buttons.length) return;
  for (const btn of buttons) {
    btn.hidden = false;
    btn.addEventListener('click', () => { onShare(btn); });
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareArticle);
  } else {
    initShareArticle();
  }
}
