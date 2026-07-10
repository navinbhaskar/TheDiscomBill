// js/search.js — site-wide header search.
//
// A magnifier button is injected into the header by main.js on every page; the
// generated index (js/search-index.js) is lazy-loaded only when the search is
// first hovered/opened, so pages pay nothing for it until it is used.
// Covers tools, guides, glossary terms and
// every state/DISCOM tariff page. Ctrl+K / '/' opens, Esc closes, arrows move.

let overlay = null;
let index = null;

const GROUP_LABEL = {
  en: { tool: 'Tools & pages', guide: 'Guides', glossary: 'Glossary', tariff: 'Tariffs', recharge: 'Smart Meter Recharge' },
  hi: { tool: 'टूल और पेज', guide: 'गाइड', glossary: 'शब्दावली', tariff: 'टैरिफ', recharge: 'स्मार्ट मीटर रिचार्ज' },
};

// Hindi context = a /hi/ pre-rendered page, or the runtime language switch set to hi.
function isHindi() {
  if (location.pathname.startsWith('/hi/')) return true;
  try { return localStorage.getItem('lang') === 'hi'; } catch (e) { return false; }
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFC');

// Score an entry against the query: every query token must match somewhere;
// title-prefix hits rank above title-substring hits, which rank above
// keyword-only hits. 0 = no match.
function score(entry, tokens, hi) {
  const title = norm(hi && entry.h ? entry.h : entry.t);
  const alt = norm(hi && entry.h ? entry.t : entry.h);   // the other language still matches
  const kw = norm(entry.k);
  let s = 0;
  for (const tok of tokens) {
    if (title.startsWith(tok)) s += 30;
    else if (title.split(/[\s(—-]+/).some(w => w.startsWith(tok))) s += 20;
    else if (title.includes(tok)) s += 12;
    else if (alt.includes(tok)) s += 8;
    else if (kw.includes(tok)) s += 5;
    else return 0;
  }
  return s;
}

function search(query) {
  const hi = isHindi();
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return index
    .map(e => ({ e, s: score(e, tokens, hi) }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map(r => r.e);
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function entryHref(e, hi) {
  return hi && e.hu ? e.hu : e.u;
}

function renderResults(listEl, results, hi) {
  if (!results.length) {
    listEl.innerHTML = `<div class="site-search-empty">${hi ? 'कोई परिणाम नहीं' : 'No results'}</div>`;
    return;
  }
  const labels = GROUP_LABEL[hi ? 'hi' : 'en'];
  let lastGroup = '';
  listEl.innerHTML = results.map((e, i) => {
    const head = e.g !== lastGroup ? `<div class="site-search-group">${labels[e.g] || ''}</div>` : '';
    lastGroup = e.g;
    const title = hi && e.h ? e.h : e.t;
    return `${head}<a class="site-search-item${i === 0 ? ' active' : ''}" href="${esc(entryHref(e, hi))}" role="option">${esc(title)}</a>`;
  }).join('');
}

export async function openSearch() {
  if (overlay) return;   // already open
  if (!index) ({ SEARCH_INDEX: index } = await import('./search-index.js'));
  if (overlay) return;   // double-open while the import was in flight

  const hi = isHindi();
  overlay = document.createElement('div');
  overlay.className = 'site-search-overlay';
  overlay.innerHTML = `
    <div class="site-search-panel" role="dialog" aria-modal="true" aria-label="${hi ? 'साइट खोज' : 'Site search'}">
      <div class="site-search-inputwrap">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="search" class="site-search-input" role="combobox" aria-expanded="true"
               placeholder="${hi ? 'गाइड, टैरिफ, शब्द खोजें…' : 'Search guides, tariffs, terms…'}" autocomplete="off" spellcheck="false">
        <button type="button" class="site-search-close" aria-label="Close">Esc</button>
      </div>
      <div class="site-search-results" role="listbox"></div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  window.__lenis?.stop();

  const input = overlay.querySelector('.site-search-input');
  const listEl = overlay.querySelector('.site-search-results');

  const close = () => {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    overlay = null;
    document.body.style.overflow = '';
    window.__lenis?.start();
  };

  const items = () => [...listEl.querySelectorAll('.site-search-item')];
  const move = (dir) => {
    const list = items();
    if (!list.length) return;
    const cur = list.findIndex(el => el.classList.contains('active'));
    const next = Math.min(Math.max(cur + dir, 0), list.length - 1);
    list[cur]?.classList.remove('active');
    list[next].classList.add('active');
    list[next].scrollIntoView({ block: 'nearest' });
  };

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const active = listEl.querySelector('.site-search-item.active');
      if (active) { e.preventDefault(); location.href = active.getAttribute('href'); }
    }
  };
  document.addEventListener('keydown', onKey);

  input.addEventListener('input', () => renderResults(listEl, search(input.value), isHindi()));
  // Tap on the backdrop (not the panel) closes; pointerdown so the mobile
  // ghost-click that follows can't immediately act on the page underneath.
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.site-search-close').addEventListener('click', close);
  input.focus();
}

// Injects the header button + global hotkeys. Called once by main.js.
export function initHeaderSearch() {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn || document.getElementById('siteSearchBtn')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'siteSearchBtn';
  btn.className = 'site-search-btn';
  btn.setAttribute('aria-label', 'Search the site (Ctrl+K)');
  btn.title = 'Search (Ctrl+K)';
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
  btn.addEventListener('click', () => openSearch());
  // Warm the index on first intent so the overlay opens populated-and-ready.
  btn.addEventListener('pointerenter', () => import('./search-index.js').then(m => { index = m.SEARCH_INDEX; }).catch(() => {}), { once: true });
  themeBtn.before(btn);

  document.addEventListener('keydown', (e) => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    else if (e.key === '/' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); openSearch(); }
  });
}
