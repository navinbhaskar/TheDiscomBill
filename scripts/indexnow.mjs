#!/usr/bin/env node
// scripts/indexnow.mjs — tell IndexNow which pages changed.
//
// IndexNow is a push protocol: instead of waiting for a crawler to notice an edit, the site
// names the URLs that changed. Bing, Yandex, Seznam and Naver share one submission; Google
// does not participate, so this is additive to Search Console, never a replacement.
//
// There is no account and no secret. The key is PUBLIC by design — it is served at
// https://thediscombill.com/<key>.txt and that is how the API proves the submitter controls
// the domain. Committing it is correct; rotating it means renaming that file.
//
// Usage:
//   node scripts/indexnow.mjs --changed-since <git-ref>   # URLs for pages that ref touched
//   node scripts/indexnow.mjs --all                       # every URL in sitemap.xml
//   node scripts/indexnow.mjs --changed-since HEAD~1 --dry-run
//
// --dry-run prints the payload and sends nothing.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'thediscombill.com';
const KEY  = '7b49dc4917555bc73ea87f8f4b843208';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// IndexNow caps a single submission at 10,000 URLs. We are well under that, but a run that
// silently truncated would be worse than one that says so.
const MAX_URLS = 10000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wantAll = args.includes('--all');
const sinceIdx = args.indexOf('--changed-since');
const since = sinceIdx >= 0 ? args[sinceIdx + 1] : null;

if (!wantAll && !since) {
  console.error('Usage: indexnow.mjs (--all | --changed-since <ref>) [--dry-run]');
  process.exit(2);
}

// The sitemap is the authority on what is indexable. Deriving URLs from the filesystem would
// happily submit pages that are deliberately excluded from it.
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()));

const fileToUrl = (file) => {
  if (!file.endsWith('.html')) return null;
  const clean = file.replace(/index\.html$/, '').replace(/\.html$/, '/');
  return `https://${HOST}/${clean}`.replace(/([^:])\/{2,}/g, '$1/');
};

let urls;
if (wantAll) {
  urls = [...sitemapUrls];
} else {
  let changed = [];
  try {
    changed = execFileSync('git', ['diff', '--name-only', `${since}..HEAD`], { cwd: ROOT, encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } catch (e) {
    console.error(`Could not diff against ${since}: ${e.message}`);
    process.exit(1);
  }
  // Only submit pages that changed AND are in the sitemap. A changed file that is not an
  // indexable page (css, js, a data module) is not a URL and must not be invented into one.
  urls = [...new Set(changed.map(fileToUrl).filter(u => u && sitemapUrls.has(u)))];
}

if (!urls.length) {
  console.log('IndexNow: no changed indexable pages — nothing to submit.');
  process.exit(0);
}
if (urls.length > MAX_URLS) {
  console.error(`IndexNow: ${urls.length} URLs exceeds the ${MAX_URLS} cap for one submission.`);
  process.exit(1);
}

const payload = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls };

console.log(`IndexNow: ${urls.length} URL(s)`);
for (const u of urls.slice(0, 25)) console.log('  ' + u);
if (urls.length > 25) console.log(`  …and ${urls.length - 25} more`);

if (dryRun) {
  console.log('\n--dry-run: nothing sent.');
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
const body = await res.text().catch(() => '');
// 200 = accepted, 202 = accepted but key still being validated. Both are success.
if (res.status === 200 || res.status === 202) {
  console.log(`IndexNow: accepted (HTTP ${res.status}).`);
} else {
  console.error(`IndexNow: HTTP ${res.status} ${body.slice(0, 300)}`);
  process.exit(1);
}
