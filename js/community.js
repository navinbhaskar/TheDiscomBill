// community.js — public community feed (/community/), backed by Supabase.
// Everyone can READ the feed (RLS "posts readable by all", so it works signed
// out); posting and deleting require sign-in and are restricted to the owner
// by RLS. Table + policies live in supabase/community.sql.

import { isConfigured, getSupabase } from './supabase-config.js';
import { renderSetupNotice, esc, fmtWhen } from './support-common.js';

const LOGIN_URL = '/login/?next=' + encodeURIComponent('/community/');
const composerEl = document.getElementById('cmComposer');
const feedEl = document.getElementById('cmFeed');
if (feedEl) init();

let sb = null;
let me = null;   // session user or null (feed is public)

async function init() {
  if (!isConfigured()) { renderSetupNotice(feedEl); return; }

  sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  me = session ? session.user : null;

  renderComposer();
  await renderFeed();
}

function renderComposer() {
  if (!me) {
    composerEl.innerHTML = `
      <div class="cm-signin br-card">
        <p>Sign in to ask a question or share a tip with other consumers.</p>
        <a class="btn-primary cm-signin-btn" href="${LOGIN_URL}">Sign in to post →</a>
      </div>`;
    return;
  }
  composerEl.innerHTML = `
    <form id="cmForm" class="cm-composer br-card">
      <label for="cmTitle" class="cm-label">Start a discussion</label>
      <input type="text" id="cmTitle" maxlength="160" placeholder="Title — e.g. Why did my UPPCL bill jump this month?" required>
      <textarea id="cmBody" rows="4" maxlength="4000" placeholder="Add details — your state/DISCOM, units, what you've already checked… (optional)"></textarea>
      <div class="cm-composer-foot">
        <span class="cm-hint">Posting as <strong>${esc(me.user_metadata?.full_name || me.email.split('@')[0])}</strong></span>
        <button type="submit" class="btn-primary" id="cmPost">Post</button>
      </div>
      <p class="cm-status" id="cmStatus" role="status" aria-live="polite"></p>
    </form>`;
  document.getElementById('cmForm').addEventListener('submit', submitPost);
}

async function submitPost(e) {
  e.preventDefault();
  const btn = document.getElementById('cmPost');
  const statusEl = document.getElementById('cmStatus');
  const title = document.getElementById('cmTitle').value.trim();
  const body = document.getElementById('cmBody').value.trim();
  if (title.length < 3) { statusEl.textContent = 'Title needs at least 3 characters.'; return; }

  btn.disabled = true;
  statusEl.textContent = 'Posting…';

  const author = me.user_metadata?.full_name || me.email.split('@')[0];
  const { error } = await sb.from('community_posts')
    .insert({ user_id: me.id, author_name: author, title, body });
  btn.disabled = false;

  if (error) {
    statusEl.textContent = 'Could not post: ' + error.message +
      (/find|exist|schema/i.test(error.message) ? ' — run supabase/community.sql in the Supabase SQL Editor first.' : '');
    return;
  }
  statusEl.textContent = '';
  document.getElementById('cmTitle').value = '';
  document.getElementById('cmBody').value = '';
  await renderFeed();
}

async function renderFeed() {
  const { data: posts, error } = await sb.from('community_posts')
    .select('id, user_id, author_name, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    feedEl.innerHTML = `
      <div class="br-card">
        <p class="br-error">Could not load the community feed: ${esc(error.message)}</p>
        ${/find|exist|schema/i.test(error.message) ? `
        <p class="tx-muted">First-time setup: run <code>supabase/community.sql</code> in the
        Supabase SQL Editor to create the <code>community_posts</code> table.</p>` : ''}
      </div>`;
    return;
  }

  if (!posts.length) {
    feedEl.innerHTML = `
      <div class="br-card cm-empty">
        <h3>No posts yet</h3>
        <p class="tx-muted">Be the first — ask a question about your electricity bill, tariff or smart meter.</p>
      </div>`;
    return;
  }

  feedEl.innerHTML = posts.map(p => {
    const initial = ((p.author_name || '?')[0] || '?').toUpperCase();
    const mine = me && p.user_id === me.id;
    return `
      <article class="cm-post br-card">
        <div class="cm-post-head">
          <span class="cm-post-avatar" aria-hidden="true">${esc(initial)}</span>
          <div class="cm-post-meta">
            <strong>${esc(p.author_name || 'Member')}</strong>
            <span>${esc(fmtWhen(p.created_at))}</span>
          </div>
          ${mine ? `<button type="button" class="cm-del" data-id="${esc(p.id)}" title="Delete this post" aria-label="Delete this post">Delete</button>` : ''}
        </div>
        <h3 class="cm-post-title">${esc(p.title)}</h3>
        ${p.body ? `<p class="cm-post-body">${esc(p.body)}</p>` : ''}
      </article>`;
  }).join('');

  feedEl.querySelectorAll('.cm-del').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this post permanently?')) return;
    btn.disabled = true;
    const { error: delErr } = await sb.from('community_posts').delete().eq('id', btn.dataset.id);
    if (delErr) { btn.disabled = false; alert('Could not delete: ' + delErr.message); return; }
    await renderFeed();
  }));
}
