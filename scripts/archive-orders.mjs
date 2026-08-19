// scripts/archive-orders.mjs — fill in `archiveUrl` on js/tariffs/orders.js.
//
// Regulator sites reorganise constantly, and a dead link on the one page whose entire value
// is verifiability is worse than no link at all. So every order carries a Wayback snapshot
// alongside the live URL.
//
// This ASKS the Wayback Machine what it already holds (the availability API) and writes back
// exactly what it returns. It never constructs a snapshot URL from a timestamp guess: a
// fabricated citation is worse than a missing one, and the whole point of this library is
// that its citations can be checked.
//
// It does not request new captures. If archive.org has never seen a URL, the order keeps
// `archiveUrl: null` and the page says the snapshot is missing — which is a true statement,
// and a to-do we can see.
//
//   node scripts/archive-orders.mjs          # fill in the blanks
//   node scripts/archive-orders.mjs --recheck  # re-query every order, refreshing old snapshots
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = path.join(ROOT, 'js', 'tariffs', 'orders.js');
const RECHECK = process.argv.includes('--recheck');
const API = 'https://archive.org/wayback/available?url=';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lookup(url) {
  const res = await fetch(API + encodeURIComponent(url), {
    headers: { 'user-agent': 'TheDiscomBill order-library archiver (+https://thediscombill.com/orders/)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const snap = data?.archived_snapshots?.closest;
  // `available` false, or no snapshot at all, both mean "we have nothing" — not "try harder".
  if (!snap || snap.available !== true || !snap.url) return null;
  // Force https: the API frequently answers with an http:// snapshot URL, which then redirects.
  return { url: snap.url.replace(/^http:/, 'https:'), timestamp: snap.timestamp || null };
}

const { ORDERS } = await import(new URL('../js/tariffs/orders.js', import.meta.url).href);
let src = fs.readFileSync(FILE, 'utf8');
const crlf = src.includes('\r\n');

let found = 0, missing = 0, skipped = 0, failed = 0;
for (const order of ORDERS) {
  if (order.archiveUrl && !RECHECK) { skipped++; continue; }
  let snap = null;
  try {
    snap = await lookup(order.sourceUrl);
  } catch (err) {
    console.warn(`  ! ${order.id}: ${err.message}`);
    failed++;
    continue;
  }
  // Rewrite the one `archiveUrl: …` line belonging to this order. Anchored on the id so the
  // record is located by identity, never by position in the file.
  const idAnchor = `id: '${order.id}',`;
  const at = src.indexOf(crlf ? idAnchor : idAnchor);
  if (at === -1) { console.warn(`  ! ${order.id}: record not found in source`); failed++; continue; }
  const fieldRe = /archiveUrl: (?:null|'[^']*')/g;
  fieldRe.lastIndex = at;
  const m = fieldRe.exec(src);
  if (!m) { console.warn(`  ! ${order.id}: no archiveUrl field after its id`); failed++; continue; }
  const replacement = snap ? `archiveUrl: '${snap.url}'` : 'archiveUrl: null';
  src = src.slice(0, m.index) + replacement + src.slice(m.index + m[0].length);

  if (snap) { found++; console.log(`  ✓ ${order.id} → ${snap.timestamp}`); }
  else { missing++; console.log(`  · ${order.id} — no snapshot on record`); }
  await sleep(400);   // the availability API is a courtesy; do not hammer it
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`\narchive-orders: ${found} snapshots recorded, ${missing} with none, ${skipped} already had one, ${failed} errors`);
