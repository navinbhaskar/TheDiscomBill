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

// A query this short is an abbreviation, not a fragment of a longer word. Matching it as a
// bare substring is almost all noise: "up" hit Backup and Rupee, "mp" hit Complaint and
// Compare. Below this length a token must begin a word.
const SHORT_TOKEN = 2;
const words = (s) => s.split(/[^a-z0-9ऀ-ॿ]+/i).filter(Boolean);
const hasWordStarting = (text, tok) => words(text).some(w => w.startsWith(tok));

// Score an entry against the query: every query token must match somewhere. An exact hit on
// the entry's abbreviation (`a` — the state code) ranks first, because someone typing "UP"
// wants Uttar Pradesh, not the alphabetically lucky UPCL. Then title-prefix, then
// title-substring, then keyword-only. 0 = no match.
function score(entry, tokens, hi) {
  const title = norm(hi && entry.h ? entry.h : entry.t);
  const alt = norm(hi && entry.h ? entry.t : entry.h);   // the other language still matches
  const kw = norm(entry.k);
  const abbr = norm(entry.a);
  let s = 0;
  for (const tok of tokens) {
    // Short tokens match only at word starts; longer ones may match anywhere.
    const inTitle = tok.length <= SHORT_TOKEN ? hasWordStarting(title, tok) : title.includes(tok);
    const inAlt = tok.length <= SHORT_TOKEN ? hasWordStarting(alt, tok) : alt.includes(tok);
    const inKw = tok.length <= SHORT_TOKEN ? hasWordStarting(kw, tok) : kw.includes(tok);
    if (abbr && abbr === tok) s += 40;
    else if (title.startsWith(tok)) s += 30;
    else if (title.split(/[\s(—-]+/).some(w => w.startsWith(tok))) s += 20;
    else if (inTitle) s += 12;
    else if (inAlt) s += 8;
    else if (inKw) s += 5;
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

// One glyph per result type. Every result used to render as identical plain text, so a
// mixed list of tools, guides and 400+ tariff pages was impossible to scan — the icon is
// what lets the eye filter before reading.
const GROUP_ICON = {
  tool:     '<path d="M14.7 6.3a4 4 0 0 1-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5z"/>',
  guide:    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  glossary: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  tariff:   '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
  recharge: '<path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z"/>',
};

// Wrap the matched span so the user can see WHY a result came back — with 240 indexed
// entries a bare title list gives no feedback that the query did anything.
function highlight(text, tokens) {
  const out = esc(text);
  if (!tokens.length) return out;
  const rx = new RegExp('(' + tokens
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length).join('|') + ')', 'gi');
  return out.replace(rx, '<mark>$1</mark>');
}

function renderResults(listEl, results, hi, tokens = []) {
  if (!results.length) {
    listEl.innerHTML = `<div class="site-search-empty">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <p>${hi ? 'कोई परिणाम नहीं' : 'No results'}</p>
      <small>${hi ? 'राज्य, डिस्कॉम या शब्द आज़माएँ' : 'Try a state, DISCOM or term'}</small>
    </div>`;
    return;
  }
  const labels = GROUP_LABEL[hi ? 'hi' : 'en'];
  let lastGroup = '';
  listEl.innerHTML = results.map((e, i) => {
    const head = e.g !== lastGroup ? `<div class="site-search-group">${labels[e.g] || ''}</div>` : '';
    lastGroup = e.g;
    const title = hi && e.h ? e.h : e.t;
    const icon = GROUP_ICON[e.g] || GROUP_ICON.tool;
    // The URL doubles as the context line (…/tariffs/kerala/ tells you what this is);
    // cheap, always present, and it never goes stale against the index.
    const sub = String(entryHref(e, hi) || '').replace(/^\/|\/$/g, '').replace(/\//g, ' › ');
    return `${head}<a class="site-search-item${i === 0 ? ' active' : ''}" href="${esc(entryHref(e, hi))}" role="option">
      <span class="ssi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span>
      <span class="ssi-txt"><strong>${highlight(title, tokens)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</span>
      <svg class="ssi-go" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </a>`;
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
      <div class="site-search-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> ${hi ? 'चुनें' : 'to navigate'}</span>
        <span><kbd>↵</kbd> ${hi ? 'खोलें' : 'to open'}</span>
        <span><kbd>esc</kbd> ${hi ? 'बंद करें' : 'to close'}</span>
      </div>
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

  // Idle state: an empty panel reads as broken, and these four cover most of what people
  // actually open the palette for.
  const renderIdle = () => {
    const picks = ['Bill calculator', 'Compare DISCOMs', 'Solar savings', 'Glossary'];
    listEl.innerHTML = `<div class="site-search-group">${hi ? 'लोकप्रिय' : 'Popular'}</div>` +
      picks.map(q => `<button type="button" class="site-search-sugg" data-q="${esc(q)}">${esc(q)}</button>`).join('');
  };
  const rerender = () => {
    const q = input.value.trim();
    if (!q) return renderIdle();
    renderResults(listEl, search(q), isHindi(), norm(q).split(/\s+/).filter(Boolean));
  };
  renderIdle();
  input.addEventListener('input', rerender);
  listEl.addEventListener('click', (e) => {
    const s = e.target.closest('.site-search-sugg');
    if (!s) return;
    input.value = s.dataset.q;
    rerender();
    input.focus();
  });
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
