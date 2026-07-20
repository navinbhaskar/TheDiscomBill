// js/blog-index.js — /guides/ index: topic filter + "load more" paging.
//
// Every card ships in the HTML (crawlers see all article links); this module only
// controls visibility. Until it runs, CSS `.blog-paged` hides everything past the
// first PAGE cards, and a <noscript> block reveals them all — so the page is never
// stuck in a half-paged state.

const PAGE = 6;        // cards shown initially
const STEP = 6;        // cards revealed per "load more" click

export function initBlogIndex() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const cards = [...grid.querySelectorAll('.blog-card')];
  const filters = document.querySelector('.blog-filters');
  const moreWrap = document.querySelector('.blog-more-wrap');
  const moreBtn = document.getElementById('blogMore');
  const moreN = moreBtn && moreBtn.querySelector('.blog-more-n');
  const empty = document.getElementById('blogEmpty');

  // Hand visibility over from the CSS nth-child rule to explicit classes: once a filter
  // is applied, "first 6" means the first 6 *matching* cards, which nth-child cannot express.
  grid.classList.remove('blog-paged');

  let filter = 'all';
  let shown = PAGE;

  const matching = () => filter === 'all' ? cards : cards.filter(c => c.dataset.cat === filter);

  function render() {
    const match = matching();
    cards.forEach(c => c.classList.add('is-hidden'));
    match.slice(0, shown).forEach(c => c.classList.remove('is-hidden'));

    const left = match.length - shown;
    if (moreWrap) moreWrap.hidden = left <= 0;
    if (moreN) moreN.textContent = left > 0 ? ` (${left})` : '';
    if (empty) empty.hidden = match.length > 0;
  }

  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.blog-filter');
      if (!btn) return;
      filter = btn.dataset.filter;
      shown = PAGE;                       // a new topic starts from the top
      filters.querySelectorAll('.blog-filter').forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const first = matching()[shown];    // first card about to appear
      shown += STEP;
      render();
      // Send focus to the first newly revealed card so keyboard users are not
      // dumped back at the top when the button disappears on the last page.
      if (first) first.focus({ preventScroll: true });
    });
  }

  render();
}
