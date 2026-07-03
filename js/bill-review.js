// bill-review.js — consumer portal (/bill-review/).
// Sign in → submit a complaint with documents → it lands in the expert pool →
// chat opens once an expert accepts it.

import { getStates, getDiscoms } from './tariffs/registry.js';
import { isConfigured, getSupabase } from './supabase-config.js';
import { initAuth, accountBarHtml, startChat, fileListHtml,
         esc, fmtWhen, fmtSize, statusChip } from './support-common.js';

const LOGIN_URL = '/login/?next=' + encodeURIComponent('/bill-review/');

const $ = (id) => document.getElementById(id);
const mainEl = $('brMain');
const accountEl = $('brAccount');
if (mainEl) init();

let sb = null;
let me = null;          // session user
let myProfile = null;
let stopChat = null;    // active chat cleanup

function leaveChat() { if (stopChat) { stopChat(); stopChat = null; } }

async function init() {
  // Backend not configured yet → still show the whole frontend: the sign-in /
  // create-account card plus a live preview of the complaint form (with the
  // document-upload picker), so the page is never a dead end.
  if (!isConfigured()) {
    mainEl.innerHTML = '<div id="brAuthMount"></div><div id="brDemoMount"></div>';
    await initAuth({ mount: $('brAuthMount'), onSignedIn: () => {} });
    renderComplaintForm($('brDemoMount'), { demo: true });
    return;
  }

  // Signed-out visitors go to the dedicated login page and come straight back.
  sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.replace(LOGIN_URL); return; }

  me = session.user;
  const { data } = await sb.from('profiles').select('*').eq('id', me.id).single();
  myProfile = data;
  // Keep the header dropdown's Expert Console link in sync (see main.js).
  try {
    if (myProfile?.role === 'expert' || myProfile?.role === 'admin') localStorage.setItem('discombill.role', myProfile.role);
    else localStorage.removeItem('discombill.role');
  } catch (e) {}
  renderAccountBar();
  showDashboard();

  sb.auth.onAuthStateChange((_event, s) => {
    if (!s) { leaveChat(); accountEl.innerHTML = ''; location.replace(LOGIN_URL); }
  });
}

function renderAccountBar() {
  accountEl.innerHTML = accountBarHtml(myProfile?.full_name, me.email);
  $('brSignOut').addEventListener('click', () => sb.auth.signOut());
}

// ── Dashboard: complaint list + new-complaint entry ──────────────────────────
async function showDashboard() {
  leaveChat();
  mainEl.innerHTML = '<p class="tx-muted">Loading your complaints…</p>';

  const { data: complaints, error } = await sb.from('complaints')
    .select('id, state, discom, subject, status, created_at')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });
  if (error) { mainEl.innerHTML = `<p class="br-error">Could not load complaints: ${esc(error.message)}</p>`; return; }

  const list = complaints.length ? complaints.map(c => `
    <button type="button" class="br-item" data-id="${esc(c.id)}">
      <div class="br-item-main">
        <span class="br-item-subject">${esc(c.subject)}</span>
        <span class="br-item-meta">${esc(c.discom)}, ${esc(c.state)} · ${esc(fmtWhen(c.created_at))}</span>
      </div>
      ${statusChip(c.status)}
    </button>`).join('')
    : '<p class="tx-muted">You have no complaints yet — file your first one below.</p>';

  mainEl.innerHTML = `
    <div class="br-card">
      <div class="br-card-head">
        <h3>My complaints</h3>
        <button type="button" class="btn-primary" id="brNew">+ New complaint</button>
      </div>
      <div class="br-list">${list}</div>
    </div>`;

  $('brNew').addEventListener('click', showNewComplaintForm);
  mainEl.querySelectorAll('.br-item').forEach(el =>
    el.addEventListener('click', () => showComplaint(el.dataset.id)));
}

// ── New complaint form ────────────────────────────────────────────────────────
// Shared between the real flow and the pre-setup "preview mode" on first load,
// so the upload UI is always visible.
function renderComplaintForm(mount, { demo = false } = {}) {
  const states = getStates();
  mount.innerHTML = `
    <div class="br-card">
      <div class="br-card-head">
        <h3>${demo ? 'File a complaint <span class="br-demo-tag">preview</span>' : 'New complaint'}</h3>
        ${demo ? '' : '<button type="button" class="br-back" id="brBack">← Back</button>'}
      </div>
      <form id="brForm" novalidate>
        <div class="svc-controls">
          <div class="svc-control">
            <label for="brState">State / UT</label>
            <select id="brState" required>${states.map(s => `<option ${s === 'Uttar Pradesh' ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
          </div>
          <div class="svc-control">
            <label for="brDiscom">Your DISCOM</label>
            <select id="brDiscom" required></select>
          </div>
        </div>
        <div class="svc-control">
          <label for="brSubject">What's the problem? (one line)</label>
          <input id="brSubject" type="text" maxlength="140" placeholder="e.g. Bill jumped from ₹800 to ₹4,200 with same usage" required>
        </div>
        <div class="svc-control">
          <label for="brDesc">Details</label>
          <textarea id="brDesc" rows="5" maxlength="5000" placeholder="Tell us everything relevant — meter readings, past bills, what the DISCOM said…"></textarea>
        </div>
        <div class="svc-control">
          <label for="brFiles">Documents (bill copy, meter photo… — PDF/JPG/PNG, up to 10 files, max 10&nbsp;MB each)</label>
          <input id="brFiles" type="file" multiple accept=".pdf,image/png,image/jpeg,image/webp">
          <div id="brFilePreview" class="br-files"></div>
        </div>
        <button type="submit" class="btn-primary" id="brSubmit">Submit for expert review</button>
        <p class="br-auth-msg" id="brFormMsg" role="alert"></p>
      </form>
    </div>`;

  const stateSel = $('brState'), discomSel = $('brDiscom');
  const fillDiscoms = () => {
    discomSel.innerHTML = getDiscoms(stateSel.value)
      .map(d => `<option value="${esc(d.name)}">${esc(d.name)}</option>`).join('');
  };
  fillDiscoms();
  stateSel.addEventListener('change', fillDiscoms);

  // Accumulate files across multiple picks (the file input's own selection is
  // replaced each time it's opened, so we keep our own running list) — capped
  // at MAX_FILES with per-file size checks, each removable individually.
  const MAX_FILES = 10;
  const MAX_SIZE = 10 * 1024 * 1024;
  let picked = [];

  function renderFilePreview() {
    $('brFilePreview').innerHTML = picked.map((f, i) => `
      <span class="br-file br-file-pick">📄 ${esc(f.name)} <span class="tx-muted">(${fmtSize(f.size)})</span>
        <button type="button" class="br-file-remove" data-i="${i}" aria-label="Remove ${esc(f.name)}">✕</button>
      </span>`).join('')
      + (picked.length ? `<span class="br-file-count tx-muted">${picked.length} / ${MAX_FILES} files</span>` : '');
    $('brFilePreview').querySelectorAll('.br-file-remove').forEach(btn =>
      btn.addEventListener('click', () => { picked.splice(Number(btn.dataset.i), 1); renderFilePreview(); }));
  }

  $('brFiles').addEventListener('change', () => {
    const msg = $('brFormMsg');
    msg.textContent = '';
    for (const f of $('brFiles').files) {
      if (picked.length >= MAX_FILES) { msg.textContent = `You can attach up to ${MAX_FILES} files.`; break; }
      if (f.size > MAX_SIZE) { msg.textContent = `"${f.name}" is over 10 MB and was skipped — please compress it.`; continue; }
      if (picked.some(p => p.name === f.name && p.size === f.size)) continue; // already added
      picked.push(f);
    }
    $('brFiles').value = ''; // allow re-picking the same file later, and lets picked[] be the single source of truth
    renderFilePreview();
  });

  if (demo) {
    $('brForm').addEventListener('submit', (e) => {
      e.preventDefault();
      $('brFormMsg').textContent = '⚙️ This is a preview — sign-in and submissions unlock once the Supabase backend is connected (see the banner above).';
    });
  } else {
    $('brBack').addEventListener('click', showDashboard);
    $('brForm').addEventListener('submit', (e) => submitComplaint(e, picked));
  }
}

function showNewComplaintForm() {
  leaveChat();
  renderComplaintForm(mainEl);
}

async function submitComplaint(e, files) {
  e.preventDefault();
  const msg = $('brFormMsg'), btn = $('brSubmit');
  const subject = $('brSubject').value.trim();
  if (!subject) { msg.textContent = 'Please describe the problem in one line.'; return; }
  if (files.length > 10) { msg.textContent = 'You can attach up to 10 files.'; return; }
  const tooBig = files.find(f => f.size > 10 * 1024 * 1024);
  if (tooBig) { msg.textContent = `"${tooBig.name}" is over 10 MB — please compress it.`; return; }

  btn.disabled = true;
  msg.textContent = files.length ? 'Uploading documents…' : 'Submitting…';
  try {
    const { data: complaint, error } = await sb.from('complaints').insert({
      user_id: me.id,
      state: $('brState').value,
      discom: $('brDiscom').value,
      subject,
      description: $('brDesc').value.trim()
    }).select().single();
    if (error) throw error;

    for (const f of files) {
      const safe = f.name.replace(/[^\w.\-]+/g, '_').slice(-80);
      const path = `${me.id}/${complaint.id}/${Date.now()}-${safe}`;
      const { error: upErr } = await sb.storage.from('complaint-docs').upload(path, f);
      if (upErr) throw new Error(`Upload failed for ${f.name}: ${upErr.message}`);
      const { error: metaErr } = await sb.from('complaint_files')
        .insert({ complaint_id: complaint.id, name: f.name, path, size: f.size });
      if (metaErr) throw metaErr;
    }

    showComplaint(complaint.id);
  } catch (err) {
    msg.textContent = err?.message || 'Submission failed — please try again.';
    btn.disabled = false;
  }
}

// ── Complaint detail + chat ──────────────────────────────────────────────────
async function showComplaint(id) {
  leaveChat();
  mainEl.innerHTML = '<p class="tx-muted">Loading…</p>';

  const [{ data: c, error }, { data: files }] = await Promise.all([
    sb.from('complaints').select('*').eq('id', id).single(),
    sb.from('complaint_files').select('*').eq('complaint_id', id).order('created_at')
  ]);
  if (error || !c) { mainEl.innerHTML = `<p class="br-error">Could not load this complaint.</p>`; return; }

  let expertName = '';
  if (c.expert_id) {
    const { data: p } = await sb.from('profiles').select('full_name').eq('id', c.expert_id).single();
    expertName = p?.full_name || 'Expert';
  }

  mainEl.innerHTML = `
    <div class="br-card">
      <div class="br-card-head">
        <h3>${esc(c.subject)}</h3>
        <button type="button" class="br-back" id="brBack">← My complaints</button>
      </div>
      <div class="br-detail-meta">
        ${statusChip(c.status)}
        <span class="tx-muted">${esc(c.discom)}, ${esc(c.state)} · filed ${esc(fmtWhen(c.created_at))}</span>
        ${expertName ? `<span class="tx-muted">· expert: <strong>${esc(expertName)}</strong></span>` : ''}
      </div>
      ${c.description ? `<p class="br-detail-desc">${esc(c.description)}</p>` : ''}
      <div class="tariff-field-label">Your documents</div>
      <div id="brDocs"><p class="tx-muted">Loading documents…</p></div>
      <div class="tariff-field-label">Conversation</div>
      <div id="brChat"></div>
    </div>`;

  $('brBack').addEventListener('click', showDashboard);
  fileListHtml(sb, files || []).then(html => { $('brDocs').innerHTML = html; });

  stopChat = startChat({
    sb, complaint: c, meId: me.id,
    names: { [c.expert_id]: expertName || 'Expert' },
    mount: $('brChat'),
    canSend: c.status === 'assigned'
  });
}
