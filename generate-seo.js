// generate-seo.js — Programmatic SEO page generator.
//
// The calculator is a JS-rendered SPA-ish app, so search engines see very little real content.
// This script pre-renders STATIC, crawlable HTML landing pages straight from the tariff data:
//
//   /tariffs/states/                       → directory hub linking every state + DISCOM
//   /tariffs/<state-slug>/                 → one page per state/UT
//   /tariffs/<state-slug>/<discom-id>/     → one page per DISCOM, with full tariff tables
//                                            and indicative monthly bills from the real engine
//
// It also (re)writes sitemap.xml and robots.txt with the correct canonical domain.
//
// Pages are written into the SOURCE tree (under tariffs/) so they work in local dev and are
// picked up by build.js's recursive copy of the tariffs/ folder. Run via `npm run seo`
// (also invoked automatically by `npm run build`).

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import { TARIFF_DB, STATE_META, getStates, getDiscoms } from './js/tariffs/registry.js';
import { calculateBill } from './js/engine.js';
import { GUIDES } from './guides-content.js';
import { GLOSSARY } from './glossary-content.js';
import { STRINGS } from './js/i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SITE = 'https://thediscombill.com';
const DOMAIN_STRIPPED = 'thediscombill.com';
const TODAY = new Date().toISOString().slice(0, 10);

// ── Content-derived <lastmod> ─────────────────────────────────────────────────
// Stamping TODAY on every URL each regen trains crawlers to ignore <lastmod> entirely.
// Instead each page is rendered with its volatile dates left as tokens, hashed, and only
// re-dated when that hash changes. The per-URL {hash,lastmod} is persisted (and committed)
// in sitemap-lastmod.json so the dates are stable across machines and CI. The SAME resolved
// date then fills the sitemap <lastmod>, the JSON-LD dateModified and the visible "Updated"
// line — consistent, and unchanged on a no-op regen.
const LASTMOD_ISO = '%%LASTMOD_ISO%%';         // → YYYY-MM-DD (sitemap + JSON-LD)
const LASTMOD_EN  = '%%LASTMOD_HUMAN_EN%%';    // → "6 July 2026"
const LASTMOD_HI  = '%%LASTMOD_HUMAN_HI%%';    // → "6 जुलाई 2026"
const MANIFEST_PATH = path.join(ROOT, 'sitemap-lastmod.json');

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const replaceAllStr = (s, find, repl) => s.split(find).join(repl);
const humanDate = (iso, lang) => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

let _manifest = null;
const _seenUrls = new Set();
function loadManifest() {
  if (_manifest) return _manifest;
  try { _manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')); }
  catch (e) { _manifest = {}; }
  return _manifest;
}
// Compare this page's content hash to the stored one: unchanged → keep the old date;
// new or changed → stamp TODAY. Records the URL as "seen" so stale entries can be pruned.
function resolveLastmod(url, contentHash) {
  const m = loadManifest();
  _seenUrls.add(url);
  if (m[url] && m[url].hash === contentHash) return m[url].lastmod;
  m[url] = { hash: contentHash, lastmod: TODAY };
  return TODAY;
}
function saveManifest() {
  const m = loadManifest();
  const out = {};
  for (const k of Object.keys(m).sort()) if (_seenUrls.has(k)) out[k] = m[k];  // prune + sort
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
}
// Resolve + write a generated page: hash the tokenised HTML for a date-independent
// signature, then substitute the resolved date into all three token slots.
function emitPage(relDir, html) {
  const url = '/' + relDir.replace(/\\/g, '/') + '/';
  const lastmod = resolveLastmod(url, sha1(html));
  const final = replaceAllStr(replaceAllStr(replaceAllStr(
    html, LASTMOD_ISO, lastmod), LASTMOD_EN, humanDate(lastmod, 'en')), LASTMOD_HI, humanDate(lastmod, 'hi'));
  writePage(relDir, final);
}

// ── small utilities ──────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const attr = (s) => esc(s);
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function writePage(relDir, html) {
  const dir = path.join(ROOT, relDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

// ── Hindi (/hi/) variants ─────────────────────────────────────────────────────
// Every tariff, guide and glossary page is emitted twice: at its canonical URL (English)
// and under /hi/ (Hindi). Both carry the full hreflang trio (en-IN, hi-IN, x-default→en)
// so Google indexes the Hindi pages instead of treating them as duplicates.
const hiUrl = (u) => '/hi' + u;

// Devanagari names for every state/UT (used in Hindi titles, H1s and breadcrumbs —
// "उत्तर प्रदेश बिजली बिल कैलकुलेटर" is the query shape Hindi searchers actually type).
const STATE_HI = {
  'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश', 'Assam': 'असम',
  'Bihar': 'बिहार', 'Chandigarh': 'चंडीगढ़', 'Chhattisgarh': 'छत्तीसगढ़',
  'Dadra and Nagar Haveli and Daman and Diu': 'दादरा और नगर हवेली और दमन और दीव',
  'Delhi': 'दिल्ली', 'Goa': 'गोवा', 'Gujarat': 'गुजरात', 'Haryana': 'हरियाणा',
  'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jammu and Kashmir': 'जम्मू और कश्मीर',
  'Jharkhand': 'झारखंड', 'Karnataka': 'कर्नाटक', 'Kerala': 'केरल', 'Ladakh': 'लद्दाख',
  'Lakshadweep': 'लक्षद्वीप', 'Madhya Pradesh': 'मध्य प्रदेश', 'Maharashtra': 'महाराष्ट्र',
  'Manipur': 'मणिपुर', 'Meghalaya': 'मेघालय', 'Mizoram': 'मिज़ोरम', 'Nagaland': 'नागालैंड',
  'Odisha': 'ओडिशा', 'Puducherry': 'पुदुचेरी', 'Punjab': 'पंजाब', 'Rajasthan': 'राजस्थान',
  'Sikkim': 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु', 'Telangana': 'तेलंगाना', 'Tripura': 'त्रिपुरा',
  'Uttar Pradesh': 'उत्तर प्रदेश', 'Uttarakhand': 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल',
  'Andaman and Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह',
};
const hiState = (s) => STATE_HI[s] || s;
// FY label: "FY 2025-26" → "वित्त वर्ष 2025-26"
const hiFy = (fy) => String(fy).replace(/^FY\s*/i, 'वित्त वर्ष ');

// Consumer-facing name for the <title>/<h1>. Some DISCOMs are overwhelmingly searched under
// a predecessor board or parent brand — people type "TNEB bill calculator" (not TANGEDCO)
// and "UPPCL bill calculator" for the UP VVNLs. Lead the title/H1 with that searched term so
// the page matches real queries; the page body keeps using discom.name. The higher-volume
// term comes first. Only well-established aliases here — never invent one.
const CONSUMER_NAME = {
  tangedco: 'TNEB (TANGEDCO)',
  mvvnl: 'MVVNL (UPPCL)', pvvnl: 'PVVNL (UPPCL)', dvvnl: 'DVVNL (UPPCL)',
  puvvnl: 'PuVVNL (UPPCL)', kesco: 'KESCO (UPPCL)',
};
const consumerName = (discom) => CONSUMER_NAME[discom.id] || discom.name;
// Bare year for titles: "FY 2025-26" / "2025-26" → "2025-26".
const yearLabel = (fy) => String(fy).replace(/^FY\s*/i, '');

// ── shared chrome (header / footer) ───────────────────────────────────────────
const HEADER = `
<header class="site-header">
  <div class="header-inner">
    <a href="/" class="logo">
      <span class="logo-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2.5 6.2 13.1c-.27.42.03.95.52.95H11l-1 7.4c-.09.62.72.94 1.07.43L18 11.2c.28-.42-.02-.95-.52-.95H13l1-7.2c.09-.6-.69-.94-1-.55Z" fill="currentColor" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
        </svg>
      </span>
      <div>
        <span class="logo-text">TheDiscomBill</span>
        <span class="logo-tagline">Electricity Bill Calculator · All India</span>
      </div>
    </a>
    <nav class="header-nav">
      <a href="/#calculator" data-i18n="nav.calculator">Calculator</a>
      <div class="nav-dropdown" id="quickLinksDropdown">
        <button type="button" class="nav-dropdown-trigger" id="quickLinksTrigger" aria-haspopup="true" aria-expanded="false">
          <span data-i18n="nav.quickLinks">Quick Links</span>
          <svg class="nav-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="nav-dropdown-menu" id="quickLinksMenu" role="menu">
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.tools">Tools</span>
          <a href="/compare/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="10"/></svg><span data-i18n="ql.compare">Compare DISCOM Tariffs</span></a>
          <a href="/usage/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span data-i18n="ql.usage">Usage Estimator</span></a>
          <a href="/solar/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><span data-i18n="ql.solar">Rooftop Solar Savings</span></a>
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.tariffs">Tariffs</span>
          <a href="/tariffs/states/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg><span data-i18n="ql.tariffsByState">Tariffs by State &amp; DISCOM</span></a>
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.services">Services</span>
          <a href="/services/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg><span data-i18n="ql.discomServices">DISCOM Services</span></a>
          <a href="/bill-review/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/></svg><span data-i18n="ql.billReview">Bill Review by Experts</span></a>
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.learn">Learn</span>
          <a href="/guides/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span data-i18n="ql.guides">Electricity Bill Guides</span></a>
          <a href="/glossary/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M12 7h5M12 11h5M7 7h.01M7 11h.01"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span data-i18n="ql.glossary">Electricity Bill Glossary</span></a>
          <a href="/methodology/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 11l2 2 4-4"/></svg><span data-i18n="ql.methodology">Methodology &amp; Accuracy</span></a>
        </div>
      </div>
      <a href="/#about" data-i18n="nav.about">About</a>
      <div class="lang-switch" id="langSwitch">
        <button type="button" class="lang-trigger" id="langTrigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Language / भाषा">
          <span class="lang-trigger-text" id="langTriggerText">EN</span>
          <svg class="lang-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <ul class="lang-menu" id="langMenu" role="listbox" aria-label="Select language">
          <li class="lang-opt" role="option" data-lang="en" aria-selected="true"><span class="lang-opt-name">English</span><span class="lang-opt-code">EN</span></li>
          <li class="lang-opt" role="option" data-lang="hi" aria-selected="false"><span class="lang-opt-name">हिंदी</span><span class="lang-opt-code">HI</span></li>
        </ul>
      </div>
      <button type="button" id="themeToggle" class="theme-toggle" aria-label="Switch theme" title="Toggle light / dark theme"><svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><g class="tt-sun" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5" fill="none"/></g><path class="tt-moon" fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg></button>
    </nav>
  </div>
</header>`;

const FOOTER = `
<footer>
  <div class="container">
    <p><span data-i18n="footer.rights">&copy; 2026 TheDiscomBill. All rights reserved.</span> &nbsp;|&nbsp; <a href="/#about" data-i18n="footer.disclaimer">Disclaimer</a> &nbsp;|&nbsp; <a href="/methodology/" data-i18n="footer.methodology">Methodology</a> &nbsp;|&nbsp; <a href="/tariffs/states/" data-i18n="footer.allStates">All States &amp; DISCOMs</a> &nbsp;|&nbsp; <a href="/glossary/" data-i18n="footer.glossary">Bill Glossary</a></p>
    <!-- Facebook returns here once the account exists -->
    <div class="soc-links" aria-label="Social media">
      <a class="soc-link" href="mailto:thediscombill@gmail.com" aria-label="Email" title="Email us"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></a>
      <a class="soc-link" href="https://www.instagram.com/thediscombill/" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37a4 4 0 1 1-7.75 1.26 4 4 0 0 1 7.75-1.26z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
      <a class="soc-link" href="https://x.com/thediscombill" target="_blank" rel="noopener" aria-label="X (Twitter)" title="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93zM17.61 20.64h2.04L6.49 3.24H4.3z"/></svg></a>
    </div>
  </div>
</footer>`;

// ── page layout ───────────────────────────────────────────────────────────────
// Rewrite site-chrome links to their /hi/ variants on Hindi pages (only routes that
// actually have a Hindi twin — tools/services pages stay English).
function hiChrome(html) {
  return html
    .replace(/href="\/tariffs\/states\/"/g, 'href="/hi/tariffs/states/"')
    .replace(/href="\/guides\/"/g, 'href="/hi/guides/"')
    .replace(/href="\/glossary\/"/g, 'href="/hi/glossary/"');
}

// `page` is the site-relative English URL of this page (e.g. "/glossary/"). When given,
// the hreflang trio for the en/hi pair is emitted; `lang` picks which variant this is.
function layout({ title, description, canonical, jsonld = [], body, lang = 'en', page = null }) {
  // Every generated page carries a WebPage node with freshness + publisher links —
  // GEO signal for AI crawlers (entity graph anchored to the #org / #website ids
  // declared on the homepage).
  const hi = lang === 'hi';
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': `${SITE}/#website` },
    publisher: { '@id': `${SITE}/#org` },
    inLanguage: hi ? 'hi-IN' : 'en-IN',
    dateModified: LASTMOD_ISO   // resolved to the content-derived date by emitPage()
  };
  const ld = [webPage, ...jsonld].filter(Boolean)
    .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ');
  // hreflang trio: Google needs it on BOTH variants, and x-default points at English.
  const alternates = page ? `
  <link rel="alternate" hreflang="en-IN" href="${SITE}${page}">
  <link rel="alternate" hreflang="hi-IN" href="${SITE}${hiUrl(page)}">
  <link rel="alternate" hreflang="x-default" href="${SITE}${page}">` : '';
  // On /hi/ pages the URL itself is an explicit language choice: persist it so the
  // client i18n layer renders the shared chrome (nav/footer) in Hindi immediately.
  const langBoot = hi ? `try { localStorage.setItem('lang', 'hi'); } catch (e) {}` : '';
  const chrome = hi ? hiChrome(HEADER) : HEADER;
  const footer = hi ? hiChrome(FOOTER) : FOOTER;
  return `<!DOCTYPE html>
<html lang="${hi ? 'hi' : 'en'}">
<head>
  <meta charset="UTF-8">
  <script>
    if (window.location.hostname === 'www.thediscombill.com') {
      window.location.replace('https://thediscombill.com' + window.location.pathname + window.location.search);
    }
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1d4ed8">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/icon.svg">
  <script>
    (function () {
      document.documentElement.classList.add('js');
      try {
        var t = localStorage.getItem('theme');
        if (t !== 'dark' && t !== 'light') t = 'light';
        document.documentElement.dataset.theme = t;
      } catch (e) {}
      ${langBoot}
    })();
  </script>
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="canonical" href="${attr(canonical)}">${alternates}
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TheDiscomBill">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:image" content="${SITE}/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:alt" content="TheDiscomBill — electricity bill calculator for every Indian DISCOM, with a sample slab-wise bill breakdown">
  <meta property="og:locale" content="${hi ? 'hi_IN' : 'en_IN'}">
  ${hi ? '<meta property="og:locale:alternate" content="en_IN">' : '<meta property="og:locale:alternate" content="hi_IN">'}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(description)}">
  <meta name="twitter:image" content="${SITE}/og-image.jpg">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Fonts load async (non-render-blocking); display=swap shows fallback text immediately -->
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"></noscript>
  <link rel="stylesheet" href="/css/styles.min.css">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-D0SSNW5RZ6"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-D0SSNW5RZ6');
  </script>
  ${ld}
</head>
<body>
${chrome}
<div class="page-body">
${body}
</div>
${footer}
<script type="module" src="/js/main.js"></script>
</body>
</html>
`;
}

// Visible, crawlable link between the two language variants (shown under the breadcrumbs).
function langSwitchLink(page, lang) {
  return lang === 'hi'
    ? `<p class="seo-lang-link"><a href="${attr(page)}" hreflang="en-IN" lang="en">Read this page in English →</a></p>`
    : `<p class="seo-lang-link"><a href="${attr(hiUrl(page))}" hreflang="hi-IN" lang="hi">यह पेज हिंदी में पढ़ें →</a></p>`;
}

function breadcrumbs(trail) {
  // trail: [{name, url|null}]
  const items = trail.map((t, i) => {
    // "Home" is translated on every page; other crumbs may carry an explicit i18n key.
    const key = t.i18n || (t.name === 'Home' ? 'bc.home' : null);
    const di = key ? ` data-i18n="${key}"` : '';
    const inner = t.url ? `<a href="${attr(t.url)}"${di}>${esc(t.name)}</a>` : `<span aria-current="page"${di}>${esc(t.name)}</span>`;
    return `<li class="crumb">${inner}</li>`;
  }).join('<li class="crumb-sep" aria-hidden="true">›</li>');
  return `<nav class="seo-breadcrumbs" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
}

function breadcrumbJsonLd(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name,
      ...(t.url ? { item: SITE + t.url } : {})
    }))
  };
}

function faqJsonLd(faqs) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}

function faqHtml(faqs, hi = false) {
  if (!faqs.length) return '';
  const items = faqs.map(f => `
    <details class="seo-faq-item">
      <summary>${esc(f.q)}</summary>
      <div class="seo-faq-a">${f.a}</div>
    </details>`).join('');
  return `<section class="seo-section"><h2>${hi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently asked questions'}</h2>${items}</section>`;
}

// ── tariff renderers (static, ported from tariff-explorer.js) ─────────────────
function slabRange(prev, limit, hi = false) {
  if (limit === Infinity || limit == null) return `${hi ? 'से अधिक ' : 'Above '}${prev.toLocaleString('en-IN')}`;
  if (prev === 0) return `0 – ${limit.toLocaleString('en-IN')}`;
  return `${prev.toLocaleString('en-IN')} – ${limit.toLocaleString('en-IN')}`;
}
function energySlabsHtml(slabs, hi = false) {
  if (!Array.isArray(slabs) || !slabs.length) return `<p class="tx-muted">${hi ? 'निर्दिष्ट नहीं।' : 'Not specified.'}</p>`;
  let prev = 0;
  const rows = slabs.map(s => {
    const range = slabRange(prev, s.limit, hi);
    prev = (s.limit === Infinity || s.limit == null) ? prev : s.limit;
    const note = s.label ? ` <span class="tx-muted">(${esc(s.label)})</span>` : '';
    return `<tr><td>${range} <span class="tx-muted">${hi ? 'यूनिट' : 'units'}</span>${note}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">${hi ? '/यूनिट' : '/unit'}</span></td></tr>`;
  }).join('');
  return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
}
function fixedChargeHtml(fc, hi = false) {
  const mo = hi ? '/ माह' : '/ month';
  const flat = hi ? '/ माह (स्थिर)' : '/ month (flat)';
  if (fc == null) return '<span class="tx-muted">—</span>';
  if (typeof fc === 'number') return `<strong>${rupee(fc)}</strong> <span class="tx-muted">${flat}</span>`;
  if (fc.type === 'per_kw')  return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kW ${mo}</span>`;
  if (fc.type === 'per_kva') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kVA ${mo}</span>`;
  if (fc.type === 'flat')    return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">${flat}</span>`;
  if (fc.type === 'tiered' && Array.isArray(fc.slabs)) {
    const rows = fc.slabs.map(s => {
      const label = s.label || (s.maxLoad === Infinity ? (hi ? 'सीमा से ऊपर' : 'Above limit') : `${hi ? '' : 'Up to '}${s.maxLoad} kW${hi ? ' तक' : ''}`);
      return `<tr><td>${esc(label)}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">${hi ? '/माह' : '/mo'}</span></td></tr>`;
    }).join('');
    return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
  }
  if (typeof fc.rate === 'number') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">${mo}</span>`;
  return '<span class="tx-muted">—</span>';
}
function additionalChargesHtml(arr, hi = false) {
  if (!Array.isArray(arr) || !arr.length) return '';
  const items = arr.map(a => {
    const isPct = a.type && String(a.type).includes('percent');
    const val = isPct ? `${a.rate}%` : rupee(a.rate);
    return `<li><span>${esc(a.name || 'Charge')}</span><strong>${val}</strong></li>`;
  }).join('');
  return `<div class="tariff-field"><div class="tariff-field-label">${hi ? 'अतिरिक्त शुल्क' : 'Additional charges'}</div><ul class="tariff-addl">${items}</ul></div>`;
}
function tariffBlockHtml(obj, hi = false) {
  return `
    <div class="tariff-block">
      <div class="tariff-field">
        <div class="tariff-field-label">${hi ? 'फिक्स्ड चार्ज' : 'Fixed charge'}</div>
        <div class="tariff-field-value">${fixedChargeHtml(obj.fixedCharge, hi)}</div>
      </div>
      <div class="tariff-field">
        <div class="tariff-field-label">${hi ? 'ऊर्जा शुल्क' : 'Energy charges'}</div>
        ${energySlabsHtml(obj.energySlabs, hi)}
      </div>
      ${additionalChargesHtml(obj.additionalCharges, hi)}
    </div>`;
}
function categoryCardHtml(cat, hi = false) {
  const hasSupplyTypes = Array.isArray(cat.supplyTypes) && cat.supplyTypes.length > 0;
  let body;
  if (hasSupplyTypes) {
    body = cat.supplyTypes.map(st => `
      <div class="tariff-supplytype">
        <div class="tariff-st-name">${esc(st.name || st.id)}</div>
        ${st.description ? `<p class="tariff-st-desc">${esc(st.description)}</p>` : ''}
        ${tariffBlockHtml(st, hi)}
      </div>`).join('');
  } else {
    body = tariffBlockHtml(cat, hi);
  }
  const icon = /commerc|non.?domestic|lt-?2|lmv-?2|ned/i.test(cat.name || cat.id) ? '🏪'
             : /industr/i.test(cat.name || cat.id) ? '🏭'
             : /agri/i.test(cat.name || cat.id) ? '🌾' : '🏠';
  return `
    <article class="tariff-card">
      <header class="tariff-card-head">
        <span class="tariff-card-icon">${icon}</span>
        <div>
          <h3>${esc(cat.name || cat.id)}</h3>
          ${cat.description && !hasSupplyTypes ? `<p class="tariff-card-desc">${esc(cat.description)}</p>` : ''}
        </div>
      </header>
      ${body}
      ${cat.notes ? `<p class="tariff-card-note">ℹ️ ${esc(cat.notes)}</p>` : ''}
    </article>`;
}

// Indicative monthly bills for the primary domestic category at common usage levels.
function domesticCategory(discom) {
  const cats = discom.categories || [];
  return cats.find(c => /domestic|residential|lmv-?1|lt-?1|^dom/i.test(c.name || c.id))
      || cats.find(c => /home|household/i.test(c.name || c.id))
      || cats[0] || null;
}
function indicativeBillsHtml(state, discom, hi = false) {
  const cat = domesticCategory(discom);
  if (!cat) return '';
  const load = 2;            // assume a typical 2 kW domestic sanctioned load
  const levels = [100, 200, 300, 500];
  const rows = [];
  for (const units of levels) {
    try {
      const r = calculateBill({ discomId: discom.id, categoryId: cat.id, units, connectedLoadKw: load });
      if (r && !r.error && r.totalPayable != null) {
        rows.push(`<tr><td>${units.toLocaleString('en-IN')} ${hi ? 'यूनिट' : 'units'}</td><td class="num">${rupee(r.totalPayable)}</td></tr>`);
      }
    } catch (e) { /* skip a level that the engine can't price */ }
  }
  if (!rows.length) return '';
  const calcHref = `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`;
  return hi ? `
    <section class="seo-section">
      <h2>अनुमानित मासिक बिल — ${esc(discom.name)}</h2>
      <p>${load} kW स्वीकृत भार पर घरेलू (${esc(cat.name)}) कनेक्शन का अनुमानित कुल मासिक बिल, हमारे कैलकुलेटर वाले ही इंजन से निकाला गया। वास्तविक बिल आपकी उप-श्रेणी, फिक्स्ड/ईंधन शुल्क और स्थानीय करों के अनुसार बदलते हैं।</p>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>मासिक खपत</th><th class="num">अनुमानित बिल</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>
      <p class="seo-cta-row"><a class="seo-cta" href="${calcHref}">मेरा सटीक ${esc(discom.name)} बिल निकालें →</a></p>
    </section>` : `
    <section class="seo-section">
      <h2>Indicative monthly bill — ${esc(discom.name)}</h2>
      <p>Estimated total monthly bill for a domestic (${esc(cat.name)}) connection at a ${load} kW sanctioned load, computed with the same engine as our calculator. Actual bills vary with your sub-category, fixed/fuel charges and local duties.</p>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Monthly consumption</th><th class="num">Estimated bill</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>
      <p class="seo-cta-row"><a class="seo-cta" href="${calcHref}">Calculate my exact ${esc(discom.name)} bill →</a></p>
    </section>`;
}

// ── per-DISCOM uniqueness helpers ─────────────────────────────────────────────
// The strongest genuine differentiator between DISCOMs (especially siblings that share a
// state tariff schedule) is the SERVICE AREA — the actual districts/cities each one covers,
// which is exactly the local intent behind "<DISCOM> electricity bill". We mine that, the
// official portal, the LPSC rate and the real slab rates so every page carries unique facts,
// and vary phrasing deterministically so titles/intros aren't structurally identical.
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function variant(seed, arr) { return arr[hashStr(seed) % arr.length]; }

// Keep <title> within Google's ~60-char truncation width: use the preferred title if it fits,
// otherwise step through progressively shorter fallbacks (last one wins even if still long).
function fitTitle(preferred, fallbacks, max = 60) {
  for (const t of [preferred, ...fallbacks]) if (t.length <= max) return t;
  return fallbacks[fallbacks.length - 1];
}

// Split an `area` string like "South UP (Agra, Mathura, Aligarh)" into a region label + city list.
function parseArea(area) {
  if (!area) return { region: '', cities: [] };
  const m = String(area).match(/^(.*?)\s*\((.*)\)\s*$/);
  if (m) return { region: m[1].trim(), cities: m[2].split(/,\s*/).map(s => s.trim()).filter(Boolean) };
  return { region: String(area).trim(), cities: [] };
}

// Real domestic rate facts for this DISCOM (min/max ₹ per unit + a fixed-charge sample).
function domesticRates(discom) {
  const cat = domesticCategory(discom);
  if (!cat) return null;
  const blocks = (cat.supplyTypes && cat.supplyTypes.length) ? cat.supplyTypes : [cat];
  const rates = [];
  let fixed = null;
  for (const b of blocks) {
    for (const s of (b.energySlabs || [])) if (typeof s.rate === 'number') rates.push(s.rate);
    if (fixed == null && b.fixedCharge != null) fixed = b.fixedCharge;
  }
  if (!rates.length) return null;
  return { min: Math.min(...rates), max: Math.max(...rates), fixed, catName: cat.name };
}

// Does any sibling DISCOM in the state apply the identical tariff schedule? (Honest disclosure.)
function sharesScheduleInState(state, discom) {
  const sig = JSON.stringify(discom.categories);
  return getDiscoms(state).some(d => d.id !== discom.id && JSON.stringify(d.categories) === sig);
}

function areaServedHtml(discom, hi = false) {
  const { region, cities } = parseArea(discom.area);
  if (!region && !cities.length) return '';
  const lead = hi
    ? (cities.length
      ? `${esc(discom.name)} (${esc(discom.fullName || discom.name)}) ${region ? esc(region) : 'अपने लाइसेंस क्षेत्र'} में बिजली वितरित करती है — ${esc(cities.slice(0, 4).join(', '))}${cities.length > 4 ? ' समेत' : ''} ${cities.length} प्रमुख ज़िलों/शहरों में।`
      : `${esc(discom.name)} ${esc(region)} में बिजली वितरित करती है।`)
    : (cities.length
      ? `${esc(discom.name)} (${esc(discom.fullName || discom.name)}) distributes electricity across ${region ? esc(region) : 'its licensed area'}, serving ${cities.length} key district${cities.length > 1 ? 's' : ''} and town${cities.length > 1 ? 's' : ''} including ${esc(cities.slice(0, 4).join(', '))}${cities.length > 4 ? ' and more' : ''}.`
      : `${esc(discom.name)} distributes electricity across ${esc(region)}.`);
  const chips = cities.length
    ? `<div class="seo-area-chips">${cities.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : '';
  return `
    <section class="seo-section">
      <h2>${hi ? `${esc(discom.name)} का सेवा क्षेत्र` : `Areas served by ${esc(discom.name)}`}</h2>
      <p>${lead}</p>
      ${chips}
    </section>`;
}

function keyFactsHtml(state, discom, fy, hi = false) {
  const { region, cities } = parseArea(discom.area);
  const dr = domesticRates(discom);
  const rows = [];
  rows.push([hi ? 'वितरण कंपनी' : 'Distribution company', esc(discom.fullName || discom.name)]);
  rows.push([hi ? 'संक्षिप्त नाम' : 'Short name', esc(discom.name)]);
  rows.push([hi ? 'राज्य / केंद्र शासित प्रदेश' : 'State / UT', esc(hi ? hiState(state) : state)]);
  if (region) rows.push([hi ? 'सेवा क्षेत्र' : 'Service region', esc(region)]);
  if (cities.length) rows.push([hi ? 'सेवित ज़िले / शहर' : 'Districts / cities served', esc(cities.length) + '+ — ' + esc(cities.slice(0, 6).join(', ')) + (cities.length > 6 ? '…' : '')]);
  rows.push([hi ? 'टैरिफ वर्ष' : 'Tariff year', esc(hi ? hiFy(fy) : fy)]);
  // Freshness: states verified against real bills get an explicit badge; the rest
  // state honestly which published order the rates come from. (Never fabricate a
  // "verified" claim — only STATE_META.verified set from an actual bill check.)
  const meta = STATE_META[state] || {};
  rows.push([hi ? 'दरों की स्थिति' : 'Rates status', meta.verified
    ? (hi ? `✅ असली बिलों से सत्यापित — ${esc(meta.ratesAsOf || fy)}` : `✅ Verified against real bills — ${esc(meta.ratesAsOf || fy)}`)
    : (hi ? `${esc(hiFy(fy))} टैरिफ आदेश पर आधारित (हमारे पास उपलब्ध नवीनतम प्रकाशित डेटा)` : `Based on the ${esc(fy)} tariff order (latest published data we have verified)`)]);
  if (dr) rows.push([hi ? 'घरेलू ऊर्जा दर' : 'Domestic energy rate', `${rupee(dr.min)} – ${rupee(dr.max)} ${hi ? 'प्रति यूनिट' : 'per unit'}`]);
  if (discom.lpscRate != null) rows.push([hi ? 'विलंब भुगतान अधिभार (LPSC)' : 'Late payment surcharge (LPSC)', `${discom.lpscRate}% ${hi ? 'प्रति माह' : 'per month'}`]);
  if (discom.website) rows.push([hi ? 'आधिकारिक वेबसाइट' : 'Official website', `<a href="${attr(discom.website)}" target="_blank" rel="noopener">${esc(String(discom.website).replace(/^https?:\/\//, ''))} ↗</a>`]);
  return `
    <section class="seo-section">
      <h2>${hi ? `${esc(discom.name)} एक नज़र में` : `${esc(discom.name)} at a glance`}</h2>
      <table class="seo-facts"><tbody>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
    </section>`;
}

// Per-DISCOM "quick links" into the DISCOM Services hub tabs (pay / new-connection / complaint),
// deep-linked with ?state=&discom= so the hub opens pre-selected on this DISCOM and on the right
// tab. These are internal links to an existing page (not new thin per-DISCOM pages) — they improve
// crawl depth and topical clustering without duplicate-content risk.
function discomServiceLinksHtml(state, discom, hi = false) {
  const qs = `?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}`;
  const links = hi ? [
    [`/services/${qs}#pay`, `${esc(discom.name)} बिल देखें व भरें`, 'अपना ताज़ा बिल देखें और आधिकारिक पोर्टल पर भुगतान करें'],
    [`/services/${qs}#new-connection`, `नया ${esc(discom.name)} कनेक्शन`, 'शुल्क, दस्तावेज़ और आवेदन की चरण-दर-चरण प्रक्रिया'],
    [`/services/${qs}#complaint`, `${esc(discom.name)} शिकायत दर्ज करें`, 'बिजली गुल, बिलिंग या मीटर की शिकायत डिस्कॉम में दर्ज करें'],
  ] : [
    [`/services/${qs}#pay`, `Check &amp; pay ${esc(discom.name)} bill`, 'View your latest bill and pay on the official portal'],
    [`/services/${qs}#new-connection`, `New ${esc(discom.name)} connection`, 'Charges, documents and the step-by-step apply process'],
    [`/services/${qs}#complaint`, `Register a ${esc(discom.name)} complaint`, 'Log a no-power, billing or meter complaint with the DISCOM'],
  ];
  return `
    <section class="seo-section">
      <h2>${hi ? `${esc(discom.name)} त्वरित लिंक` : `${esc(discom.name)} quick links`}</h2>
      <div class="seo-link-grid">
        ${links.map(([href, title, sub]) =>
          `<a class="seo-link-card" href="${href}"><strong>${title}</strong><span>${sub}</span></a>`).join('')}
      </div>
    </section>`;
}

// Contextual glossary links from each DISCOM page. Real anchor text into /glossary/#<term>
// (stronger topical signal than nav/footer boilerplate) that also genuinely helps a reader
// decode the charge lines they just saw in the tariff schedule above.
function glossaryLinksHtml(discom, hi = false) {
  const base = hi ? '/hi/glossary/' : '/glossary/';
  const terms = hi ? [
    ['fppa', 'FPPA (ईंधन अधिभार)'],
    ['fixed-charge', 'फिक्स्ड चार्ज'],
    ['telescopic-slabs', 'टेलीस्कोपिक स्लैब'],
    ['sanctioned-load', 'स्वीकृत भार'],
    ['electricity-duty', 'बिजली शुल्क'],
  ] : [
    ['fppa', 'FPPA (fuel surcharge)'],
    ['fixed-charge', 'fixed charges'],
    ['telescopic-slabs', 'telescopic slabs'],
    ['sanctioned-load', 'sanctioned load'],
    ['electricity-duty', 'electricity duty'],
  ];
  const links = terms.map(([slug, label]) => `<a href="${base}#${slug}">${label}</a>`).join(', ');
  return hi ? `
    <section class="seo-section">
      <h2>अपना ${esc(discom.name)} बिल समझें</h2>
      <p>ये शुल्क लाइनें नई लगती हैं? हमारी <a href="${base}">बिजली बिल शब्दावली</a> ${esc(discom.name)}
      बिल के शब्दों को आसान भाषा में समझाती है — जिनमें ${links} शामिल हैं।</p>
    </section>` : `
    <section class="seo-section">
      <h2>Understand your ${esc(discom.name)} bill</h2>
      <p>New to these charge lines? Our <a href="${base}">electricity bill glossary</a> explains
      the terms on a ${esc(discom.name)} bill in plain language — including
      ${links}.</p>
    </section>`;
}

// Related guides for a DISCOM page: guides tagged to this state first, then evergreen
// explainers to fill up to three cards. Links point into /hi/ only when a Hindi
// translation exists (untranslated guides link to the English page from both variants).
function guideLinksHtml(state, discom, hi = false) {
  const tagged = GUIDES.filter(g => (g.states || []).includes(state));
  const evergreen = GUIDES.filter(g => !(g.states || []).length && !tagged.includes(g));
  const picks = [...tagged, ...evergreen].slice(0, 3);
  if (!picks.length) return '';
  const cards = picks.map(g => {
    const href = (hi && g.sectionsHi) ? `/hi/guides/${g.slug}/` : `/guides/${g.slug}/`;
    const title = hi ? (g.titleHi || g.title) : g.title;
    const mins = hi ? `${g.minutes} मिनट` : `${g.minutes} min read`;
    return `<a class="seo-link-card" href="${href}"><strong>${esc(title)}</strong><small>${mins}</small></a>`;
  }).join('');
  const allHref = hi ? '/hi/guides/' : '/guides/';
  return `
    <section class="seo-section">
      <h2>${hi ? `${esc(discom.name)} बिल से जुड़ी गाइड` : `Guides for ${esc(discom.name)} consumers`}</h2>
      <div class="seo-link-grid">${cards}</div>
      <p><a href="${allHref}">${hi ? 'सभी गाइड देखें →' : 'Browse all guides →'}</a></p>
    </section>`;
}

// ── page builders ─────────────────────────────────────────────────────────────
function discomPage(state, discom, lang = 'en') {
  const hi = lang === 'hi';
  const stateSlug = slugify(state);
  const enUrl = `/tariffs/${stateSlug}/${discom.id}/`;
  const url = hi ? hiUrl(enUrl) : enUrl;
  const meta = STATE_META[state] || {};
  const fy = discom.tariffYear || 'FY 2025-26';
  const long = discom.fullName || discom.name;
  const { region, cities } = parseArea(discom.area);
  const dr = domesticRates(discom);
  const shared = sharesScheduleInState(state, discom);
  const cityPhrase = cities.length ? cities.slice(0, 3).join(', ') : region;

  if (hi) return discomPageHi({ state, discom, stateSlug, enUrl, url, meta, fy, long, region, cities, dr, shared, cityPhrase });

  // Deterministic phrasing variation (keyed off the DISCOM) so titles/intros aren't a single
  // repeated template across 65 pages — each one is differently worded but factually identical.
  const seed = discom.id + state;
  const cname = consumerName(discom);   // leads titles/H1 with the term people actually search
  const yr = yearLabel(fy);             // tariff-order year — a freshness signal in the title
  // Titles stay ≤ ~60 chars (Google's truncation width) and ALWAYS lead with
  // "<name> Bill Calculator <year>" — the exact query shape ("TNEB bill calculator 2024-25",
  // "MVVNL bill calculator 2025-26") — with only the suffix varied. No brand suffix (Google
  // shows the site name separately). Long names step down via fitTitle().
  const title = fitTitle(variant(seed, [
    `${cname} Bill Calculator ${yr} — Tariff & Rates`,
    `${cname} Bill Calculator ${yr} — ${state} Tariff`,
    `${cname} Electricity Bill Calculator ${yr}`,
  ]), [
    `${cname} Bill Calculator ${yr}`,
    `${cname} Bill Calculator`,
  ]);
  const description = variant(seed + 'd', [
    `Calculate your ${discom.name} (${long}) electricity bill for ${fy}${cityPhrase ? ` in ${cityPhrase}` : ''}. Slab-wise rates, fixed charges, FPPA & duties.${dr ? ` Domestic from ${rupee(dr.min)}/unit.` : ''} Free, no sign-up.`,
    `${discom.name} electricity bill calculator for ${state}${cityPhrase ? ` (${cityPhrase})` : ''}. ${fy} domestic & commercial slab rates, fixed/demand charges and an instant itemised estimate.`,
    `Free ${discom.name} bill estimate (${fy})${cityPhrase ? ` for ${cityPhrase} and across ${region || state}` : ''}. See the full tariff schedule, indicative monthly bills and pay-bill portal.`,
  ]);
  // H1 also leads with the searched "<name> Bill Calculator <year>" phrase (matching the title),
  // then varies the tail — region or the full legal name — for on-page uniqueness.
  const h1 = variant(seed + 'h', [
    `${esc(cname)} Bill Calculator ${esc(yr)}${region ? ` — ${esc(region)}` : ''}`,
    `${esc(cname)} Bill Calculator &amp; Tariff (${esc(yr)})`,
    `${esc(cname)} Electricity Bill Calculator ${esc(yr)} — ${esc(long)}`,
  ]);
  const lead = variant(seed + 'l', [
    `Estimate your <strong>${esc(long)}</strong> bill in seconds and browse the full ${esc(fy)} tariff schedule — energy slabs, fixed/demand charges, fuel surcharge (FPPA) and electricity duty${cities.length ? ` for ${esc(cities.slice(0, 3).join(', '))} and the rest of ${esc(region || state)}` : ` across ${esc(region || state)}`}.`,
    `Get an instant, itemised <strong>${esc(discom.name)}</strong> electricity bill for ${esc(region || state)}. Below you'll find ${esc(discom.name)}'s ${esc(fy)} slab rates, fixed charges, an indicative monthly bill and a quick link to pay on the official portal.`,
    `<strong>${esc(long)}</strong> supplies power to ${cities.length ? `${esc(cities.length)}+ districts including ${esc(cities.slice(0, 3).join(', '))}` : esc(region || state)}. Use this page to check ${esc(discom.name)}'s ${esc(fy)} tariff and calculate your provisional bill.`,
  ]);

  const badges = [];
  if (meta.verified) badges.push('<span class="tariff-badge verified">✓ Verified rates</span>');
  badges.push(`<span class="tariff-badge">${esc(fy)}</span>`);
  if (region) badges.push(`<span class="tariff-badge">${esc(region)}</span>`);
  const src = discom.website || meta.sourceUrl;

  const cards = (discom.categories || []).map(categoryCardHtml).join('') || '<p class="tx-muted">No categories listed.</p>';

  // Sibling DISCOMs in the same state
  const siblings = getDiscoms(state).filter(d => d.id !== discom.id);
  const siblingHtml = siblings.length ? `
    <section class="seo-section">
      <h2>Other DISCOMs in ${esc(state)}</h2>
      <div class="seo-link-grid">
        ${siblings.map(d => { const a = parseArea(d.area); return `<a class="seo-link-card" href="/tariffs/${stateSlug}/${d.id}/"><strong>${esc(d.name)}</strong><span>${esc(d.fullName || '')}</span>${a.region ? `<small>${esc(a.region)}</small>` : ''}</a>`; }).join('')}
      </div>
    </section>` : '';

  // Honest note when siblings share the exact schedule — turns potential duplication into a
  // helpful, differentiating statement (the area + portal + LPSC are what actually differ).
  const sharedNote = shared
    ? `<p class="seo-note">${esc(discom.name)} applies the same state-wide ${esc(fy)} tariff schedule as the other ${esc(state)} DISCOMs (set by the state regulator). What differs by company is the <strong>service area</strong>, billing portal and contact details below.</p>`
    : '';

  // Data-driven FAQs — every answer carries a real ${discom.name}-specific fact, not a name swap.
  const faqs = [];
  faqs.push({ q: `How do I calculate my ${discom.name} electricity bill?`,
    a: `Open the <a href="/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator">${esc(discom.name)} bill calculator</a>, enter your units consumed and sanctioned load, and it applies the ${esc(fy)} ${esc(discom.name)} slab rates, fixed charge${meta.verified ? ', FPPA and electricity duty' : ' and other charges'} to produce an itemised provisional bill.` });
  if (cities.length) faqs.push({ q: `Which areas and cities does ${discom.name} serve?`,
    a: `${esc(discom.name)} (${esc(long)}) supplies electricity to ${region ? esc(region) + ' — ' : ''}${esc(cities.join(', '))}.` });
  if (dr) faqs.push({ q: `What is the cheapest domestic electricity rate on ${discom.name}?`,
    a: `${esc(discom.name)}'s domestic energy charge starts at ${rupee(dr.min)} per unit and rises to ${rupee(dr.max)} per unit in the highest slab (${esc(dr.catName)}), plus a monthly fixed charge${meta.verified ? '' : ' (latest available estimate)'}. The full slab table is above.` });
  if (discom.website) faqs.push({ q: `How do I pay my ${discom.name} electricity bill online?`,
    a: `Pay on the official ${esc(discom.name)} portal at <a href="${attr(discom.website)}" target="_blank" rel="noopener">${esc(String(discom.website).replace(/^https?:\/\//, ''))}</a>. Use this page first to check what your bill should be, then pay on the authentic source.` });
  if (discom.lpscRate != null) faqs.push({ q: `What is the late payment surcharge (LPSC) for ${discom.name}?`,
    a: `${esc(discom.name)} levies a Late Payment Surcharge of ${discom.lpscRate}% per month on overdue amounts. Our calculator can add LPSC and arrears to estimate your total payable.` });

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'Home', url: '/' },
      { name: 'Tariffs', url: '/tariffs/states/' },
      { name: state, url: `/tariffs/${stateSlug}/` },
      { name: discom.name, url: null },
    ])}
    ${langSwitchLink(enUrl, 'en')}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    <div class="tariff-discom-headrow seo-discom-head">
      <div>
        <div class="tariff-discom-name">${esc(long)}</div>
        ${discom.area ? `<div class="tariff-discom-area">Service area: ${esc(discom.area)}</div>` : ''}
      </div>
      <div class="tariff-badges">${badges.join('')}</div>
    </div>
    ${src ? `<p><a class="tariff-source" href="${attr(src)}" target="_blank" rel="noopener">Official ${esc(discom.name)} source ↗</a></p>` : ''}
    <p class="seo-cta-row"><a class="seo-cta" href="/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator">Open the ${esc(discom.name)} bill calculator →</a></p>

    ${discomServiceLinksHtml(state, discom)}

    ${keyFactsHtml(state, discom, fy)}
    ${areaServedHtml(discom)}
    ${indicativeBillsHtml(state, discom)}

    <section class="seo-section">
      <h2>${esc(discom.name)} tariff schedule (${esc(fy)})</h2>
      ${sharedNote}
      <div class="tariff-cards">${cards}</div>
    </section>

    ${glossaryLinksHtml(discom)}
    ${guideLinksHtml(state, discom)}
    ${siblingHtml}
    ${faqHtml(faqs)}
    <p class="seo-disclaimer">Figures are provisional estimates built on publicly available ${esc(state)} tariff orders. Always verify against your official ${esc(discom.name)} bill — rates vary by sub-category, slab and city.</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl,
    jsonld: [
      breadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Tariffs', url: '/tariffs/states/' },
        { name: state, url: `/tariffs/${stateSlug}/` },
        { name: discom.name, url },
      ]),
      faqJsonLd(faqs),
    ],
    body,
  });
}

// Hindi twin of discomPage — same data, Devanagari copy, links stay inside /hi/ where a
// Hindi variant exists. No phrasing variants needed: uniqueness comes from the data itself.
function discomPageHi({ state, discom, stateSlug, enUrl, url, meta, fy, long, region, cities, dr, shared, cityPhrase }) {
  const stateHi = hiState(state);
  const fyHi = hiFy(fy);
  const cname = consumerName(discom);   // TNEB (TANGEDCO) / MVVNL (UPPCL) — leads title + H1
  const yr = yearLabel(fy);
  const title = fitTitle(`${cname} बिजली बिल कैलकुलेटर ${yr} — टैरिफ`, [
    `${cname} बिजली बिल कैलकुलेटर ${yr}`,
    `${cname} बिल कैलकुलेटर ${yr}`,
  ]);
  const description = `${cname} (${long}) का बिजली बिल ${fyHi} के लिए निकालें${cityPhrase ? ` — ${cityPhrase}` : ''}। स्लैब दरें, फिक्स्ड चार्ज, FPPA व शुल्क।${dr ? ` घरेलू दर ${rupee(dr.min)}/यूनिट से।` : ''} मुफ़्त, बिना साइन-अप।`;
  const h1 = `${esc(cname)} बिजली बिल कैलकुलेटर व टैरिफ (${esc(fyHi)})`;
  const lead = `अपना <strong>${esc(long)}</strong> बिल सेकंडों में अनुमानित करें और ${esc(fyHi)} की पूरी टैरिफ अनुसूची देखें — ऊर्जा स्लैब, फिक्स्ड/डिमांड चार्ज, ईंधन अधिभार (FPPA) और बिजली शुल्क${cities.length ? `, ${esc(cities.slice(0, 3).join(', '))} और पूरे ${esc(region || stateHi)} के लिए` : ` — पूरे ${esc(region || stateHi)} के लिए`}।`;

  const badges = [];
  if (meta.verified) badges.push('<span class="tariff-badge verified">✓ सत्यापित दरें</span>');
  badges.push(`<span class="tariff-badge">${esc(fyHi)}</span>`);
  if (region) badges.push(`<span class="tariff-badge">${esc(region)}</span>`);
  const src = discom.website || meta.sourceUrl;

  const cards = (discom.categories || []).map(c => categoryCardHtml(c, true)).join('') || '<p class="tx-muted">कोई श्रेणी सूचीबद्ध नहीं।</p>';

  const siblings = getDiscoms(state).filter(d => d.id !== discom.id);
  const siblingHtml = siblings.length ? `
    <section class="seo-section">
      <h2>${esc(stateHi)} के अन्य डिस्कॉम</h2>
      <div class="seo-link-grid">
        ${siblings.map(d => { const a = parseArea(d.area); return `<a class="seo-link-card" href="/hi/tariffs/${stateSlug}/${d.id}/"><strong>${esc(d.name)}</strong><span>${esc(d.fullName || '')}</span>${a.region ? `<small>${esc(a.region)}</small>` : ''}</a>`; }).join('')}
      </div>
    </section>` : '';

  const sharedNote = shared
    ? `<p class="seo-note">${esc(discom.name)} पर वही राज्यव्यापी ${esc(fyHi)} टैरिफ अनुसूची लागू है जो ${esc(stateHi)} के बाक़ी डिस्कॉम पर (राज्य नियामक द्वारा निर्धारित)। कंपनियों में अंतर <strong>सेवा क्षेत्र</strong>, बिलिंग पोर्टल और संपर्क विवरण का है, जो नीचे दिए हैं।</p>`
    : '';

  const calcHref = `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`;
  const faqs = [];
  faqs.push({ q: `${discom.name} बिजली बिल कैसे निकालें?`,
    a: `<a href="${calcHref}">${esc(discom.name)} बिल कैलकुलेटर</a> खोलें, अपनी खपत (यूनिट) और स्वीकृत भार डालें — यह ${esc(fyHi)} की ${esc(discom.name)} स्लैब दरें, फिक्स्ड चार्ज${meta.verified ? ', FPPA और बिजली शुल्क' : ' और अन्य शुल्क'} लगाकर मदवार अनुमानित बिल देता है।` });
  if (cities.length) faqs.push({ q: `${discom.name} किन क्षेत्रों और शहरों में बिजली देती है?`,
    a: `${esc(discom.name)} (${esc(long)}) ${region ? esc(region) + ' — ' : ''}${esc(cities.join(', '))} में बिजली आपूर्ति करती है।` });
  if (dr) faqs.push({ q: `${discom.name} पर सबसे सस्ती घरेलू बिजली दर क्या है?`,
    a: `${esc(discom.name)} का घरेलू ऊर्जा शुल्क ${rupee(dr.min)} प्रति यूनिट से शुरू होकर सबसे ऊँचे स्लैब में ${rupee(dr.max)} प्रति यूनिट तक जाता है (${esc(dr.catName)}), साथ में मासिक फिक्स्ड चार्ज${meta.verified ? '' : ' (नवीनतम उपलब्ध अनुमान)'}। पूरी स्लैब तालिका ऊपर है।` });
  if (discom.website) faqs.push({ q: `${discom.name} बिजली बिल ऑनलाइन कैसे भरें?`,
    a: `आधिकारिक ${esc(discom.name)} पोर्टल <a href="${attr(discom.website)}" target="_blank" rel="noopener">${esc(String(discom.website).replace(/^https?:\/\//, ''))}</a> पर भुगतान करें। पहले इस पेज से जाँचें कि बिल कितना होना चाहिए, फिर आधिकारिक स्रोत पर भरें।` });
  if (discom.lpscRate != null) faqs.push({ q: `${discom.name} का विलंब भुगतान अधिभार (LPSC) कितना है?`,
    a: `${esc(discom.name)} बकाया राशि पर ${discom.lpscRate}% प्रति माह का विलंब भुगतान अधिभार लगाती है। हमारा कैलकुलेटर LPSC और बकाया जोड़कर कुल देय राशि का अनुमान दे सकता है।` });

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'होम', url: '/' },
      { name: 'टैरिफ', url: '/hi/tariffs/states/' },
      { name: stateHi, url: `/hi/tariffs/${stateSlug}/` },
      { name: discom.name, url: null },
    ])}
    ${langSwitchLink(enUrl, 'hi')}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    <div class="tariff-discom-headrow seo-discom-head">
      <div>
        <div class="tariff-discom-name">${esc(long)}</div>
        ${discom.area ? `<div class="tariff-discom-area">सेवा क्षेत्र: ${esc(discom.area)}</div>` : ''}
      </div>
      <div class="tariff-badges">${badges.join('')}</div>
    </div>
    ${src ? `<p><a class="tariff-source" href="${attr(src)}" target="_blank" rel="noopener">आधिकारिक ${esc(discom.name)} स्रोत ↗</a></p>` : ''}
    <p class="seo-cta-row"><a class="seo-cta" href="${calcHref}">${esc(discom.name)} बिल कैलकुलेटर खोलें →</a></p>

    ${discomServiceLinksHtml(state, discom, true)}

    ${keyFactsHtml(state, discom, fy, true)}
    ${areaServedHtml(discom, true)}
    ${indicativeBillsHtml(state, discom, true)}

    <section class="seo-section">
      <h2>${esc(discom.name)} टैरिफ अनुसूची (${esc(fyHi)})</h2>
      ${sharedNote}
      <div class="tariff-cards">${cards}</div>
    </section>

    ${glossaryLinksHtml(discom, true)}
    ${guideLinksHtml(state, discom, true)}
    ${siblingHtml}
    ${faqHtml(faqs, true)}
    <p class="seo-disclaimer">आँकड़े सार्वजनिक रूप से उपलब्ध ${esc(stateHi)} टैरिफ आदेशों पर आधारित अनुमानित हैं। हमेशा अपने आधिकारिक ${esc(discom.name)} बिल से मिलान करें — दरें उप-श्रेणी, स्लैब और शहर के अनुसार बदलती हैं।</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang: 'hi',
    jsonld: [
      breadcrumbJsonLd([
        { name: 'होम', url: '/' },
        { name: 'टैरिफ', url: '/hi/tariffs/states/' },
        { name: stateHi, url: `/hi/tariffs/${stateSlug}/` },
        { name: discom.name, url },
      ]),
      faqJsonLd(faqs),
    ],
    body,
  });
}

function statePage(state, lang = 'en') {
  const hi = lang === 'hi';
  const stateSlug = slugify(state);
  const enUrl = `/tariffs/${stateSlug}/`;
  const url = hi ? hiUrl(enUrl) : enUrl;
  const meta = STATE_META[state] || {};
  const discoms = getDiscoms(state);
  const fy = (discoms[0] && discoms[0].tariffYear) || meta.ratesAsOf || 'FY 2025-26';
  const names = discoms.map(d => d.name).join(', ');
  const seed = stateSlug;

  // Aggregate the real coverage data across the state's DISCOMs for unique, locally-relevant copy.
  const allCities = [...new Set(discoms.flatMap(d => parseArea(d.area).cities))];
  const cityLine = allCities.length ? allCities.slice(0, 6).join(', ') : '';
  const drs = discoms.map(domesticRates).filter(Boolean);
  const stateMin = drs.length ? Math.min(...drs.map(x => x.min)) : null;

  if (hi) {
    const stateHi = hiState(state);
    const fyHi = hiFy(fy);
    const title = fitTitle(`${stateHi} बिजली बिल कैलकुलेटर ${fy.replace(/^FY\s*/i, '')}`, [
      `${stateHi} बिजली टैरिफ ${fy.replace(/^FY\s*/i, '')}`,
      `${stateHi} बिजली टैरिफ`,
    ]);
    const description = `मुफ़्त ${stateHi} बिजली बिल कैलकुलेटर। ${discoms.length} डिस्कॉम (${names}) — ${fyHi} की स्लैब दरें, फिक्स्ड चार्ज व FPPA।${stateMin != null ? ` घरेलू दर ${rupee(stateMin)}/यूनिट से।` : ''}`;
    const discomCards = discoms.map(d => {
      const a = parseArea(d.area);
      return `
      <a class="seo-link-card" href="/hi/tariffs/${stateSlug}/${d.id}/">
        <strong>${esc(d.name)}</strong>
        <span>${esc(d.fullName || '')}</span>
        ${a.region ? `<small>${esc(a.region)}${a.cities.length ? ` — ${esc(a.cities.slice(0, 3).join(', '))}` : ''}</small>` : ''}
      </a>`;
    }).join('');
    const faqs = [];
    faqs.push({ q: `${stateHi} में बिजली बिल कैसे निकाला जाता है?`,
      a: `${esc(stateHi)} के बिल में स्लैब-वार ऊर्जा शुल्क, प्रति kW (या kVA) फिक्स्ड/डिमांड चार्ज, ईंधन व विद्युत क्रय समायोजन (FPPA) और बिजली शुल्क जुड़ते हैं। अपने डिस्कॉम का मदवार अनुमानित बिल पाने के लिए हमारा <a href="/#calculator">मुफ़्त कैलकुलेटर</a> इस्तेमाल करें।` });
    faqs.push({ q: `${stateHi} में मेरे इलाक़े में कौन-सी बिजली वितरण कंपनी है?`,
      a: `${esc(stateHi)} में ${discoms.length} डिस्कॉम ${discoms.length > 1 ? 'हैं' : 'है'}: ${discoms.map(d => { const a = parseArea(d.area); return `<strong>${esc(d.name)}</strong>${a.region ? ` (${esc(a.region)}${a.cities.length ? ` — ${esc(a.cities.slice(0, 3).join(', '))}` : ''})` : ''}`; }).join('; ')}। पूरी टैरिफ और अनुमानित बिल के लिए ऊपर अपना डिस्कॉम खोलें।` });
    if (stateMin != null) faqs.push({ q: `${stateHi} में सबसे सस्ती घरेलू बिजली दर क्या है?`,
      a: `${esc(stateHi)} के डिस्कॉम में सबसे कम घरेलू ऊर्जा शुल्क लगभग ${rupee(stateMin)} प्रति यूनिट (सबसे निचला स्लैब) से शुरू होता है — फिक्स्ड चार्ज, FPPA और शुल्क अलग। सटीक दरें आपके डिस्कॉम और खपत स्लैब पर निर्भर हैं।` });
    faqs.push({ q: `${stateHi} का वर्तमान बिजली टैरिफ वर्ष क्या है?`,
      a: `दिखाई गई दरें ${esc(fyHi)} की हैं${meta.verified ? ', प्रकाशित टैरिफ आदेश से सत्यापित' : ' (नवीनतम उपलब्ध)'}।` });

    const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'होम', url: '/' },
      { name: 'टैरिफ', url: '/hi/tariffs/states/' },
      { name: stateHi, url: null },
    ])}
    ${langSwitchLink(enUrl, 'hi')}
    <h1>${esc(stateHi)} बिजली बिल कैलकुलेटर व डिस्कॉम टैरिफ (${esc(fyHi)})</h1>
    <p class="seo-lead">${esc(stateHi)} की ${discoms.length} वितरण कंपन${discoms.length > 1 ? 'ियों' : 'ी'} — ${esc(names)} — में से किसी का भी अनुमानित बिजली बिल निकालें, ${esc(fyHi)} के पूरे स्लैब-वार विवरण के साथ${cityLine ? ` — ${esc(cityLine)} समेत` : ''}।</p>
    <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">${esc(stateHi)} बिल कैलकुलेटर खोलें →</a></p>

    <section class="seo-section">
      <h2>${esc(stateHi)} के बिजली डिस्कॉम</h2>
      <p>अपनी वितरण कंपनी चुनें — उसकी ${esc(fyHi)} टैरिफ अनुसूची, सेवा क्षेत्र और अनुमानित मासिक बिल देखें।</p>
      <div class="seo-link-grid">${discomCards}</div>
    </section>

    ${faqHtml(faqs, true)}
    <p class="seo-disclaimer">सार्वजनिक रूप से उपलब्ध ${esc(stateHi)} टैरिफ आदेशों पर आधारित अनुमानित आँकड़े${meta.sourceUrl ? ` (स्रोत: <a href="${attr(meta.sourceUrl)}" target="_blank" rel="noopener">${esc(String(meta.sourceUrl).replace(/^https?:\/\//, ''))}</a>)` : ''}। अपने आधिकारिक बिल से मिलान करें — दरें उप-श्रेणी, स्लैब और शहर के अनुसार बदलती हैं।</p>
  </section>`;

    return layout({
      title, description, canonical: SITE + url, page: enUrl, lang: 'hi',
      jsonld: [
        breadcrumbJsonLd([
          { name: 'होम', url: '/' },
          { name: 'टैरिफ', url: '/hi/tariffs/states/' },
          { name: stateHi, url },
        ]),
        faqJsonLd(faqs),
      ],
      body,
    });
  }

  // ≤ ~60 chars, keyword-first, no brand suffix (see the note above the DISCOM-page title).
  const title = fitTitle(variant(seed, [
    `${state} Electricity Bill Calculator ${fy}`,
    `${state} Electricity Tariff ${fy} — Bill Calculator`,
    `${state} DISCOM Tariffs & Bill Calculator ${fy}`,
  ]), [
    `${state} Electricity Tariff ${fy}`,
    `${state} Tariff ${fy}`,
  ]);
  const description = variant(seed + 'd', [
    `Free ${state} electricity bill calculator. ${discoms.length} DISCOM${discoms.length > 1 ? 's' : ''} (${names}) with slab-wise rates, fixed charges and FPPA for ${fy}.${stateMin != null ? ` Domestic from ${rupee(stateMin)}/unit.` : ''}`,
    `Calculate your ${state} electricity bill (${fy})${cityLine ? ` — covering ${cityLine}` : ''}. Pick your DISCOM for its full tariff schedule and an instant itemised estimate.`,
    `${state} electricity tariffs ${fy}: compare ${names}, see domestic & commercial slab rates and get a provisional bill in seconds. Free, no sign-up.`,
  ]);

  const discomCards = discoms.map(d => {
    const a = parseArea(d.area);
    return `
    <a class="seo-link-card" href="/tariffs/${stateSlug}/${d.id}/">
      <strong>${esc(d.name)}</strong>
      <span>${esc(d.fullName || '')}</span>
      ${a.region ? `<small>${esc(a.region)}${a.cities.length ? ` — ${esc(a.cities.slice(0, 3).join(', '))}` : ''}</small>` : ''}
    </a>`;
  }).join('');

  const faqs = [];
  faqs.push({ q: `How is the electricity bill calculated in ${state}?`,
    a: `${esc(state)} bills combine slab-wise energy charges, a fixed/demand charge per kW (or kVA), a fuel & power purchase adjustment (FPPA) and electricity duty. Use our <a href="/#calculator">free calculator</a> to get an itemised provisional bill for your DISCOM.` });
  faqs.push({ q: `Which electricity distribution company serves my area in ${state}?`,
    a: `${esc(state)} is served by ${discoms.length} DISCOM${discoms.length > 1 ? 's' : ''}: ${discoms.map(d => { const a = parseArea(d.area); return `<strong>${esc(d.name)}</strong>${a.region ? ` (${esc(a.region)}${a.cities.length ? ` — ${esc(a.cities.slice(0, 3).join(', '))}` : ''})` : ''}`; }).join('; ')}. Open your DISCOM above for its full tariff and an indicative bill.` });
  if (stateMin != null) faqs.push({ q: `What is the cheapest domestic electricity rate in ${state}?`,
    a: `The lowest domestic energy charge across ${esc(state)} DISCOMs starts at about ${rupee(stateMin)} per unit (lowest slab), before fixed charges, FPPA and duty. Exact rates depend on your DISCOM and consumption slab.` });
  faqs.push({ q: `What is the current electricity tariff year for ${state}?`,
    a: `The rates shown are for ${esc(fy)}${meta.verified ? ', verified against the published tariff order' : ' (latest available)'}.` });

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'Home', url: '/' },
      { name: 'Tariffs', url: '/tariffs/states/' },
      { name: state, url: null },
    ])}
    ${langSwitchLink(enUrl, 'en')}
    <h1>${esc(state)} Electricity Bill Calculator &amp; DISCOM Tariffs (${esc(fy)})</h1>
    <p class="seo-lead">Calculate your provisional electricity bill for any of ${esc(state)}'s ${discoms.length} distribution compan${discoms.length > 1 ? 'ies' : 'y'} — ${esc(names)} — with a full slab-wise breakdown for ${esc(fy)}${cityLine ? `, covering ${esc(cityLine)} and more` : ''}.</p>
    <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">Open the ${esc(state)} bill calculator →</a></p>

    <section class="seo-section">
      <h2>Electricity DISCOMs in ${esc(state)}</h2>
      <p>Select your distribution company to see its ${esc(fy)} tariff schedule, service area and an indicative monthly bill.</p>
      <div class="seo-link-grid">${discomCards}</div>
    </section>

    ${faqHtml(faqs)}
    <p class="seo-disclaimer">Provisional estimates based on publicly available ${esc(state)} tariff orders${meta.sourceUrl ? ` (source: <a href="${attr(meta.sourceUrl)}" target="_blank" rel="noopener">${esc(String(meta.sourceUrl).replace(/^https?:\/\//, ''))}</a>)` : ''}. Verify against your official bill — rates vary by sub-category, slab and city.</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl,
    jsonld: [
      breadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Tariffs', url: '/tariffs/states/' },
        { name: state, url },
      ]),
      faqJsonLd(faqs),
    ],
    body,
  });
}

// Region grouping for the directory page — purely presentational. Each region carries
// an accent colour used for its heading dot, state-code badges and card hover.
const REGIONS = [
  { en: 'North India', hi: 'उत्तर भारत', color: '#2563eb', states: ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Ladakh', 'Punjab', 'Chandigarh', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'] },
  { en: 'South India', hi: 'दक्षिण भारत', color: '#0d9488', states: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Puducherry', 'Tamil Nadu', 'Telangana'] },
  { en: 'West India', hi: 'पश्चिम भारत', color: '#d97706', states: ['Dadra & Nagar Haveli and Daman & Diu', 'Goa', 'Gujarat', 'Maharashtra'] },
  { en: 'Central India', hi: 'मध्य भारत', color: '#7c3aed', states: ['Chhattisgarh', 'Madhya Pradesh'] },
  { en: 'East India', hi: 'पूर्व भारत', color: '#e11d48', states: ['Bihar', 'Jharkhand', 'Odisha', 'Sikkim', 'West Bengal'] },
  { en: 'North-East India', hi: 'पूर्वोत्तर भारत', color: '#0891b2', states: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura'] },
];

// Official state / UT codes (the ones on vehicle plates) — instantly recognisable to
// Indian users and a compact, colourful anchor for each card.
const STATE_CODE = {
  'Delhi': 'DL', 'Haryana': 'HR', 'Himachal Pradesh': 'HP', 'Jammu & Kashmir': 'JK', 'Ladakh': 'LA',
  'Punjab': 'PB', 'Chandigarh': 'CH', 'Rajasthan': 'RJ', 'Uttar Pradesh': 'UP', 'Uttarakhand': 'UK',
  'Andhra Pradesh': 'AP', 'Karnataka': 'KA', 'Kerala': 'KL', 'Puducherry': 'PY', 'Tamil Nadu': 'TN', 'Telangana': 'TS',
  'Dadra & Nagar Haveli and Daman & Diu': 'DD', 'Goa': 'GA', 'Gujarat': 'GJ', 'Maharashtra': 'MH',
  'Chhattisgarh': 'CG', 'Madhya Pradesh': 'MP',
  'Bihar': 'BR', 'Jharkhand': 'JH', 'Odisha': 'OD', 'Sikkim': 'SK', 'West Bengal': 'WB',
  'Arunachal Pradesh': 'AR', 'Assam': 'AS', 'Manipur': 'MN', 'Meghalaya': 'ML', 'Mizoram': 'MZ', 'Nagaland': 'NL', 'Tripura': 'TR',
};
const stateCode = (s) => STATE_CODE[s] || s.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();

function directoryPage(states, lang = 'en') {
  const hi = lang === 'hi';
  const enUrl = '/tariffs/states/';
  const url = hi ? hiUrl(enUrl) : enUrl;
  const title = hi
    ? 'सभी भारतीय बिजली डिस्कॉम व राज्यवार टैरिफ'
    : 'All Indian Electricity DISCOMs & Tariffs by State';
  const description = hi
    ? 'हर भारतीय राज्य और केंद्र शासित प्रदेश के बिजली टैरिफ व बिल कैलकुलेटर देखें। 70+ डिस्कॉम, स्लैब-वार दरें, फिक्स्ड चार्ज और FPPA — एक ही डायरेक्टरी में।'
    : 'Browse electricity tariffs and bill calculators for every Indian state and union territory. 70+ DISCOMs, slab-wise rates, fixed charges and FPPA — all in one directory.';

  const base = hi ? '/hi/tariffs/' : '/tariffs/';
  let totalDiscoms = 0;

  const stateCard = (state) => {
    const stateSlug = slugify(state);
    const discoms = getDiscoms(state);
    totalDiscoms += discoms.length;
    const displayName = hi ? hiState(state) : state;
    const links = discoms.map(d => `<a href="${base}${stateSlug}/${d.id}/">${esc(d.name)}</a>`).join('');
    // data-search carries both scripts + discom names so the filter box matches everything
    const searchBlob = [state, hiState(state), ...discoms.map(d => d.name)].join(' ').toLowerCase();
    const nDiscoms = `${discoms.length} ${hi ? 'डिस्कॉम' : (discoms.length === 1 ? 'DISCOM' : 'DISCOMs')}`;
    return `
      <div class="seo-dir-state" data-search="${esc(searchBlob)}">
        <a class="seo-dir-state-head" href="${base}${stateSlug}/">
          <span class="seo-dir-badge" aria-hidden="true">${esc(stateCode(state))}</span>
          <span class="seo-dir-state-meta">
            <h3 class="seo-dir-state-name">${esc(displayName)}<span class="seo-dir-arrow" aria-hidden="true">→</span></h3>
            <span class="seo-dir-count">${nDiscoms}</span>
          </span>
        </a>
        <div class="seo-dir-discoms">${links}</div>
      </div>`;
  };

  const covered = new Set(states);
  const grouped = REGIONS
    .map(r => ({ ...r, states: r.states.filter(s => covered.has(s)) }))
    .filter(r => r.states.length);
  const leftovers = states.filter(s => !REGIONS.some(r => r.states.includes(s)));
  if (leftovers.length) grouped.push({ en: 'Other', hi: 'अन्य', color: '#64748b', states: leftovers });

  const sections = grouped.map(r => `
    <section class="seo-dir-region" style="--dir-accent:${r.color}">
      <h2 class="seo-dir-region-title"><span class="seo-dir-region-dot" aria-hidden="true"></span>${esc(hi ? r.hi : r.en)} <span class="seo-dir-region-count">${r.states.length}</span></h2>
      <div class="seo-directory">${r.states.map(stateCard).join('')}</div>
    </section>`).join('');

  // Tiny progressive-enhancement filter: hides cards (and emptied regions) as you type.
  const filterScript = `
  <script>(function(){
    var q=document.getElementById('dirSearch'); if(!q) return;
    var cards=[].slice.call(document.querySelectorAll('.seo-dir-state'));
    var regions=[].slice.call(document.querySelectorAll('.seo-dir-region'));
    var empty=document.getElementById('dirEmpty');
    q.addEventListener('input',function(){
      var t=q.value.trim().toLowerCase(), shown=0;
      cards.forEach(function(c){var hit=!t||c.getAttribute('data-search').indexOf(t)>-1;c.hidden=!hit;if(hit)shown++;});
      regions.forEach(function(r){r.hidden=!r.querySelector('.seo-dir-state:not([hidden])');});
      if(empty)empty.hidden=shown>0;
    });
  })();</script>`;

  const heroStats = (labels) => `
      <div class="seo-dir-stats" role="list">
        <span class="seo-dir-stat" role="listitem"><strong>${states.length}</strong> ${labels.states}</span>
        <span class="seo-dir-stat" role="listitem"><strong>${totalDiscoms}+</strong> ${labels.discoms}</span>
        <span class="seo-dir-stat" role="listitem"><strong>100%</strong> ${labels.free}</span>
      </div>`;

  const body = hi ? `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'होम', url: '/' },
      { name: 'टैरिफ डायरेक्टरी', url: null },
    ])}
    ${langSwitchLink(enUrl, 'hi')}
    <div class="seo-dir-hero">
      <h1>बिजली टैरिफ व बिल कैलकुलेटर — सभी राज्य व डिस्कॉम</h1>
      <p class="seo-lead">अपना राज्य चुनें और उसका बिजली बिल कैलकुलेटर व टैरिफ अनुसूची खोलें, या सीधे अपनी वितरण कंपनी पर जाएँ।</p>
      ${heroStats({ states: 'राज्य व केंद्र शासित प्रदेश', discoms: 'डिस्कॉम', free: 'मुफ़्त' })}
      <div class="seo-dir-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="dirSearch" type="search" placeholder="राज्य या डिस्कॉम खोजें — जैसे दिल्ली, UP, MVVNL…" aria-label="राज्य या डिस्कॉम खोजें" autocomplete="off">
      </div>
    </div>
    ${sections}
    <p id="dirEmpty" class="seo-dir-empty" hidden>कोई राज्य या डिस्कॉम नहीं मिला। कोई और नाम आज़माएँ।</p>
  </section>${filterScript}` : `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'Home', url: '/' },
      { name: 'Tariffs Directory', url: null },
    ])}
    ${langSwitchLink(enUrl, 'en')}
    <div class="seo-dir-hero">
      <h1>Electricity Tariffs &amp; Bill Calculators — All States &amp; DISCOMs</h1>
      <p class="seo-lead">Pick your state to open its electricity bill calculator and tariff schedule, or jump straight to your distribution company.</p>
      ${heroStats({ states: 'states &amp; UTs', discoms: 'DISCOMs', free: 'free' })}
      <div class="seo-dir-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="dirSearch" type="search" placeholder="Search state or DISCOM — e.g. UP, MVVNL, Tata…" aria-label="Search state or DISCOM" autocomplete="off">
      </div>
    </div>
    ${sections}
    <p id="dirEmpty" class="seo-dir-empty" hidden>No state or DISCOM matches that search. Try another name.</p>
  </section>${filterScript}`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    jsonld: [breadcrumbJsonLd(hi
      ? [{ name: 'होम', url: '/' }, { name: 'टैरिफ डायरेक्टरी', url }]
      : [{ name: 'Home', url: '/' }, { name: 'Tariffs Directory', url }]),
    // ItemList of every state landing page — helps Google (and AI crawlers) see the
    // directory as a structured collection rather than a flat link farm.
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      numberOfItems: states.length,
      itemListElement: states.map((s, i) => ({
        '@type': 'ListItem', position: i + 1,
        name: hi ? hiState(s) : s,
        url: SITE + base + slugify(s) + '/',
      })),
    }],
    body,
  });
}

// ── guides (/guides/) — evergreen explainers, content in guides-content.js ────
function articleJsonLd(guide, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: SITE + url,
    datePublished: guide.published || LASTMOD_ISO,
    dateModified: LASTMOD_ISO,
    inLanguage: 'en-IN',
    author: { '@id': `${SITE}/#org` },
    publisher: { '@id': `${SITE}/#org` },
  };
}

function guidePage(guide, lang = 'en') {
  const hasHi = !!guide.sectionsHi;               // untranslated guides have no /hi/ twin
  const hi = lang === 'hi' && hasHi;              // only emit a Hindi page when translated
  const enUrl = `/guides/${guide.slug}/`;
  const url = hi ? hiUrl(enUrl) : enUrl;
  const title = hi ? guide.titleHi : guide.title;
  const intro = hi ? guide.introHi : guide.intro;
  const sections = hi ? guide.sectionsHi : guide.sections;
  const faqs = hi ? (guide.faqsHi || []) : guide.faqs;
  const guidesBase = hi ? '/hi/guides/' : '/guides/';
  const trail = hi ? [
    { name: 'होम', url: '/' },
    { name: 'गाइड', url: '/hi/guides/' },
    { name: title, url: null },
  ] : [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides/' },
    { name: guide.title, url: null },
  ];
  const updated = hi ? LASTMOD_HI : LASTMOD_EN;   // resolved to the content-derived date by emitPage()
  const body = `
  <section class="seo-page container">
    ${breadcrumbs(trail)}
    ${hasHi ? langSwitchLink(enUrl, hi ? 'hi' : 'en') : ''}
    <h1>${esc(title)}</h1>
    <p class="guide-meta">${hi ? `${guide.minutes} मिनट · अपडेट: ${updated}` : `${guide.minutes} min read · Updated ${updated}`}</p>
    <p class="seo-lead">${intro}</p>
    ${sections}
    ${faqHtml(faqs, hi)}
    <section class="seo-section guide-more">
      <h2>${hi ? 'और गाइड' : 'More guides'}</h2>
      <div class="seo-link-grid">${GUIDES.filter(g => g.slug !== guide.slug).map(g => `
        <a class="seo-link-card" href="${guidesBase}${g.slug}/">
          <strong>${esc(hi ? (g.titleHi || g.title) : g.title)}</strong>
          <small>${hi ? `${g.minutes} मिनट` : `${g.minutes} min read`}</small>
        </a>`).join('')}
      </div>
    </section>
    <p class="seo-disclaimer">${hi
      ? `सार्वजनिक रूप से उपलब्ध टैरिफ आदेशों और विनियमों पर आधारित सामान्य मार्गदर्शन; विवरण राज्य, डिस्कॉम और उपभोक्ता श्रेणी के अनुसार बदलते हैं। अपने डिस्कॉम की आधिकारिक अनुसूची या छपे बिल से मिलान करें।`
      : `General guidance based on publicly available tariff orders and
    regulations; specifics vary by state, DISCOM and consumer category. Verify against your DISCOM's
    official schedule or your printed bill.`}</p>
  </section>`;

  const articleLd = articleJsonLd(hi ? { ...guide, title: guide.titleHi, description: guide.descriptionHi } : guide, url);
  if (hi) articleLd.inLanguage = 'hi-IN';
  return layout({
    title: hi ? (guide.metaTitleHi || guide.titleHi) : (guide.metaTitle || guide.title),
    description: hi ? guide.descriptionHi : guide.description,
    canonical: SITE + url,
    page: hasHi ? enUrl : null,   // no hreflang pair for untranslated guides
    lang: hi ? 'hi' : 'en',
    jsonld: [
      articleLd,
      breadcrumbJsonLd(hi
        ? [{ name: 'होम', url: '/' }, { name: 'गाइड', url: '/hi/guides/' }, { name: title }]
        : [{ name: 'Home', url: '/' }, { name: 'Guides', url: '/guides/' }, { name: guide.title }]),
      faqJsonLd(faqs),
    ],
    body,
  });
}

function guidesIndexPage(lang = 'en') {
  const hi = lang === 'hi';
  const enUrl = '/guides/';
  const url = hi ? hiUrl(enUrl) : enUrl;
  const title = hi
    ? 'बिजली बिल गाइड — बिल समझें और घटाएँ'
    : 'Electricity Bill Guides — Understand & Reduce Your Bill';
  const description = hi
    ? 'भारतीय बिजली बिलिंग की आसान भाषा में गाइड: बिल कैसे पढ़ें, बिल अचानक क्यों बढ़ते हैं, टाइम-ऑफ़-डे बिलिंग, FPPA और बहुत कुछ।'
    : 'Plain-language guides to Indian electricity billing: how to read your bill, why bills suddenly increase, Time-of-Day billing, FPPA and more.';
  const base = hi ? '/hi/guides/' : '/guides/';
  const cards = GUIDES.map(g => `
    <a class="seo-link-card" href="${base}${g.slug}/">
      <strong>${esc(hi ? (g.titleHi || g.title) : g.title)}</strong>
      <span>${esc((hi ? (g.descriptionHi || g.description) : g.description).split('।')[0].split('.')[0])}${hi ? '।' : '.'}</span>
      <small>${hi ? `${g.minutes} मिनट` : `${g.minutes} min read`}</small>
    </a>`).join('');
  const body = hi ? `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'होम', url: '/' }, { name: 'गाइड', url: null }])}
    ${langSwitchLink(enUrl, 'hi')}
    <h1>बिजली बिल गाइड</h1>
    <p class="seo-lead">भारतीय बिजली बिलिंग पर छोटे, व्यावहारिक लेख — ठीक उन्हीं सवालों के जवाब जो लोग पूछते
    हैं, और हमारे <a href="/#calculator">बिल कैलकुलेटर</a> के पीछे के लाइव टैरिफ डेटा से जुड़े हुए।</p>
    <div class="seo-link-grid guides-grid">${cards}</div>
  </section>` : `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Guides', url: null }])}
    ${langSwitchLink(enUrl, 'en')}
    <h1>Electricity Bill Guides</h1>
    <p class="seo-lead">Short, practical explainers on Indian electricity billing — written to answer
    the exact questions people ask, and linked to the live tariff data behind our
    <a href="/#calculator">bill calculator</a>.</p>
    <div class="seo-link-grid guides-grid">${cards}</div>
  </section>`;
  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    jsonld: [breadcrumbJsonLd(hi
      ? [{ name: 'होम', url: '/' }, { name: 'गाइड', url }]
      : [{ name: 'Home', url: '/' }, { name: 'Guides', url }])],
    body,
  });
}

// ── glossary (/glossary/) — DefinedTerm content in glossary-content.js ─────────
// A single definitional page. DefinedTermSet + DefinedTerm JSON-LD is exactly the entity
// shape LLMs and search engines cite, and every DISCOM/state page links in with real anchor
// text (nav, footer + a contextual block), making this a topical hub.
function definedTermSetJsonLd(url, hi = false) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE}${url}#termset`,
    name: hi ? 'बिजली बिल शब्दावली' : 'Electricity Bill Glossary',
    description: hi
      ? 'भारतीय बिजली बिलिंग और टैरिफ शब्दों की परिभाषाएँ — FPPA, बिजली शुल्क, kVAh, टेलीस्कोपिक स्लैब, स्वीकृत भार और बहुत कुछ।'
      : 'Definitions of Indian electricity billing and tariff terms — FPPA, electricity duty, kVAh, telescopic slabs, sanctioned load and more.',
    url: SITE + url,
    inLanguage: hi ? 'hi-IN' : 'en-IN',
    publisher: { '@id': `${SITE}/#org` },
    hasDefinedTerm: GLOSSARY.map(t => {
      // English term + abbr stay as alternateName on the Hindi page too — that's how
      // people actually search ("FPPA क्या है").
      const alt = hi
        ? [t.term, t.abbr, ...(t.aka || [])].filter(Boolean)
        : [t.abbr, ...(t.aka || [])].filter(Boolean);
      return {
        '@type': 'DefinedTerm',
        '@id': `${SITE}${url}#${t.slug}`,
        name: hi ? (t.termHi || t.term) : t.term,
        ...(alt.length ? { alternateName: alt } : {}),
        description: hi ? (t.shortHi || t.short) : t.short,
        inDefinedTermSet: `${SITE}${url}#termset`,
        url: `${SITE}${url}#${t.slug}`,
      };
    }),
  };
}

function glossaryPage(lang = 'en') {
  const hi = lang === 'hi';
  const enUrl = '/glossary/';
  const url = hi ? hiUrl(enUrl) : enUrl;
  const title = hi
    ? 'बिजली बिल शब्दावली — भारतीय टैरिफ शब्दों की आसान परिभाषा'
    : 'Electricity Bill Glossary — Indian Tariff Terms Explained';
  const description = hi
    ? 'भारतीय बिजली बिल और टैरिफ शब्दों की आसान भाषा में परिभाषाएँ: FPPA, बिजली शुल्क, MMC, kVAh, मल्टीप्लाइंग फैक्टर, स्वीकृत भार, टेलीस्कोपिक स्लैब, LPSC और बहुत कुछ।'
    : 'Plain-language definitions of Indian electricity bill and tariff terms: FPPA, electricity duty, MMC, kVAh, multiplying factor, sanctioned load, telescopic slabs, LPSC and more.';

  const chipText = (t) => hi
    ? (t.chipHi || t.term.replace(/\s*\(.*?\)\s*/g, '').trim())
    : t.term.replace(/\s*\(.*?\)\s*/g, '').trim();

  // Alphabetical jump index (chips) → anchors below. (Hindi page keeps the English sort
  // order so anchors stay predictable across variants.)
  const index = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
    .map(t => `<a class="glossary-chip" href="#${t.slug}" data-i18n="gl.${t.slug}.chip">${esc(chipText(t))}</a>`).join('');

  const terms = GLOSSARY.map(t => {
    const alt = [hi ? t.term : null, t.abbr, ...(t.aka || [])].filter(Boolean).filter(x => x.toLowerCase() !== t.term.toLowerCase() || hi);
    const also = alt.length ? `<p class="glossary-aka"><span data-i18n="gloss.aka">${hi ? 'अन्य नाम:' : 'Also called:'}</span> ${[...new Set(alt)].map(esc).join(', ')}</p>` : '';
    return `
      <section class="seo-section glossary-term" id="${t.slug}">
        <h2 data-i18n="gl.${t.slug}.term">${esc(hi ? (t.termHi || t.term) : t.term)}</h2>
        <p class="glossary-def" data-i18n="gl.${t.slug}.short">${esc(hi ? (t.shortHi || t.short) : t.short)}</p>
        ${also}
        <div class="glossary-body" data-i18n-html="gl.${t.slug}.body">${hi ? (t.bodyHi || t.body).replace(/href="\/glossary\//g, 'href="/hi/glossary/') : t.body}</div>
        <p class="glossary-top"><a href="#glossary-index" data-i18n="gloss.backToTop">${hi ? '↑ सभी शब्दों पर वापस' : '↑ Back to all terms'}</a></p>
      </section>`;
  }).join('');

  // Hindi term strings live in glossary-content.js (co-located with the English source), not in
  // js/i18n.js. Ship them as a per-page dictionary the i18n layer merges on language switch.
  const i18nGlossary = { en: {}, hi: {} };
  GLOSSARY.forEach(t => {
    i18nGlossary.en[`gl.${t.slug}.chip`] = chipText(t);
    i18nGlossary.en[`gl.${t.slug}.term`] = t.term;
    i18nGlossary.en[`gl.${t.slug}.short`] = t.short;
    i18nGlossary.en[`gl.${t.slug}.body`] = t.body;
    i18nGlossary.hi[`gl.${t.slug}.chip`] = t.chipHi || chipText(t);
    i18nGlossary.hi[`gl.${t.slug}.term`] = t.termHi || t.term;
    i18nGlossary.hi[`gl.${t.slug}.short`] = t.shortHi || t.short;
    i18nGlossary.hi[`gl.${t.slug}.body`] = t.bodyHi || t.body;
  });
  const glossaryDict = `<script>window.__i18nGlossary=${JSON.stringify(i18nGlossary)};</script>`;

  // Hindi shell strings come from the same dictionary the runtime language switch uses.
  const HS = STRINGS.hi || {};
  const crumbName = hi ? (HS['gloss.crumb'] || 'शब्दावली') : 'Glossary';
  const h1 = hi ? (HS['gloss.h1'] || 'बिजली बिल शब्दावली') : 'Electricity Bill Glossary';
  const lead = hi
    ? (HS['gloss.lead'] || '').replace(/href="\/tariffs\/states\/"/g, 'href="/hi/tariffs/states/"')
    : `Every charge line and code on an Indian electricity bill, defined in plain
    language. These are the terms behind our <a href="/#calculator">bill calculator</a> and
    <a href="/tariffs/states/">tariff pages</a> — from <a href="#fppa">FPPA</a> and
    <a href="#electricity-duty">electricity duty</a> to <a href="#telescopic-slabs">telescopic
    slabs</a> and <a href="#kvah">kVAh</a>.`;
  const workH2 = hi ? (HS['gloss.work.h2'] || 'इन शब्दों को काम में लाएँ') : 'Put these terms to work';
  const card1 = hi ? (HS['gloss.card1'] || '') : '<strong>Bill Calculator</strong><span>Apply these charges to your own units and load for an itemised estimate</span>';
  const card2 = hi ? (HS['gloss.card2'] || '') : '<strong>Bill Guides</strong><span>Longer walkthroughs: reading your bill, why bills rise, Time-of-Day billing</span>';
  const card3 = hi ? (HS['gloss.card3'] || '') : '<strong>Tariffs by State</strong><span>The live slab rates, fixed charges and FPPA for every DISCOM</span>';
  const disclaimer = hi ? (HS['gloss.disclaimer'] || '') : `General definitions based on common Indian tariff practice; the exact
    treatment of any charge varies by state, DISCOM and consumer category. Verify against your
    DISCOM's tariff order or your printed bill.`;
  const guidesHref = hi ? '/hi/guides/' : '/guides/';
  const tariffsHref = hi ? '/hi/tariffs/states/' : '/tariffs/states/';

  const body = `${glossaryDict}
  <section class="seo-page container">
    ${breadcrumbs([{ name: hi ? 'होम' : 'Home', url: '/' }, { name: crumbName, url: null, i18n: 'gloss.crumb' }])}
    ${langSwitchLink(enUrl, hi ? 'hi' : 'en')}
    <h1 data-i18n="gloss.h1">${h1}</h1>
    <p class="seo-lead" data-i18n-html="gloss.lead">${lead}</p>
    <nav class="glossary-index" id="glossary-index" aria-label="Glossary terms">${index}</nav>
    ${terms}
    <section class="seo-section">
      <h2 data-i18n="gloss.work.h2">${workH2}</h2>
      <div class="seo-link-grid">
        <a class="seo-link-card" href="/#calculator" data-i18n-html="gloss.card1">${card1}</a>
        <a class="seo-link-card" href="${guidesHref}" data-i18n-html="gloss.card2">${card2}</a>
        <a class="seo-link-card" href="${tariffsHref}" data-i18n-html="gloss.card3">${card3}</a>
      </div>
    </section>
    <p class="seo-disclaimer" data-i18n="gloss.disclaimer">${disclaimer}</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    jsonld: [
      definedTermSetJsonLd(url, hi),
      breadcrumbJsonLd([{ name: hi ? 'होम' : 'Home', url: '/' }, { name: crumbName, url }]),
    ],
    body,
  });
}

// ── sitemap + robots ──────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/compare/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/usage/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/solar/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/tariffs/', priority: '0.8', changefreq: 'monthly' },
  // '/tariffs/states/' is added in buildSitemap() with its Hindi alternate.
  { loc: '/services/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/bill-review/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/methodology/', priority: '0.7', changefreq: 'monthly' },
];

// lastmod for a hand-written static route: hash the source file so the date bumps only
// when that file is actually edited (these pages carry no volatile TODAY of their own).
function staticLastmod(loc) {
  const file = loc === '/' ? 'index.html' : loc.slice(1) + 'index.html';
  let content = '';
  try { content = fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch (e) { /* missing → TODAY */ }
  return resolveLastmod(loc, sha1(content));
}
// lastmod for a generated page: emitPage() already resolved and stored it.
const generatedLastmod = (loc) => (loadManifest()[loc] || {}).lastmod || TODAY;

function buildSitemap(states) {
  const urls = [...STATIC_ROUTES.map(r => ({ ...r, isStatic: true }))];
  // `alt: true` marks a URL as having an en/hi pair: both variants are listed, each with
  // the full xhtml:link hreflang set (Google's recommended sitemap-level annotation).
  urls.push({ loc: '/guides/', priority: '0.8', changefreq: 'monthly', alt: true });
  for (const g of GUIDES) {
    urls.push({ loc: `/guides/${g.slug}/`, priority: '0.7', changefreq: 'monthly', alt: !!g.sectionsHi });
  }
  urls.push({ loc: '/glossary/', priority: '0.7', changefreq: 'monthly', alt: true });
  urls.push({ loc: '/tariffs/states/', priority: '0.8', changefreq: 'monthly', alt: true });
  for (const state of states) {
    const stateSlug = slugify(state);
    urls.push({ loc: `/tariffs/${stateSlug}/`, priority: '0.7', changefreq: 'monthly', alt: true });
    for (const d of getDiscoms(state)) {
      urls.push({ loc: `/tariffs/${stateSlug}/${d.id}/`, priority: '0.6', changefreq: 'monthly', alt: true });
    }
  }
  const entries = [];
  for (const u of urls) {
    const altLinks = u.alt ? `
    <xhtml:link rel="alternate" hreflang="en-IN" href="${SITE}${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="hi-IN" href="${SITE}${hiUrl(u.loc)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${u.loc}"/>` : '';
    const lastmod = u.isStatic ? staticLastmod(u.loc) : generatedLastmod(u.loc);
    entries.push(`  <url>
    <loc>${SITE}${u.loc}</loc>${altLinks}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`);
    if (u.alt) entries.push(`  <url>
    <loc>${SITE}${hiUrl(u.loc)}</loc>${altLinks}
    <lastmod>${generatedLastmod(hiUrl(u.loc))}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

// Explicitly welcome AI / LLM crawlers (GEO): the wildcard already allows them,
// but naming them makes the policy unambiguous and survives future wildcard
// tightening. llms.txt gives LLMs a curated map of the site.
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',          // OpenAI
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot',     // Anthropic
  'PerplexityBot', 'Perplexity-User',                 // Perplexity
  'Google-Extended',                                  // Gemini training
  'Applebot', 'Applebot-Extended',                    // Apple Intelligence
  'Amazonbot', 'meta-externalagent', 'cohere-ai', 'DuckAssistBot'
];
const ROBOTS = `User-agent: *
Allow: /

${AI_CRAWLERS.map(ua => `User-agent: ${ua}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE}/sitemap.xml
`;

// ── llms.txt (https://llmstxt.org) — a curated, markdown site map for LLMs ────
function buildLlmsTxt(states) {
  const stateLinks = states.map(s =>
    `- [${s} electricity tariffs](${SITE}/tariffs/${slugify(s)}/): DISCOMs, slab rates, fixed charges and indicative bills for ${s}`
  ).join('\n');
  return `# TheDiscomBill

> Free, browser-based electricity bill calculator for India. Covers 70+ distribution companies (DISCOMs) across all 35 states and union territories with slab-wise (telescopic) energy charges, fixed/demand charges, FPPA fuel surcharge, electricity duty, solar net metering and Time-of-Day billing. Independent — not affiliated with any DISCOM, SERC or government body. Estimates are provisional; official bills come from the DISCOM.

Tariff data is compiled from publicly available tariff orders (FY 2024-25 / 2025-26) and the calculation engine applies each DISCOM's published methodology: telescopic slabs, sanctioned-load-based fixed charges, then surcharges and duty.

## Tools

- [Bill Calculator](${SITE}/): instant provisional electricity bill for any Indian DISCOM with a full slab-wise breakdown
- [Tariff Comparison](${SITE}/compare/): major DISCOMs compared at 200/400/600/1000 units for domestic and commercial
- [Usage Estimator](${SITE}/usage/): estimate monthly kWh from household appliances
- [Rooftop Solar Savings](${SITE}/solar/): system sizing, payback and net-metering savings
- [Bill Check](${SITE}/bill-check/): direct links to every DISCOM's official view/pay-bill portal
- [Bill Review by Experts](${SITE}/bill-review/): upload a bill and have a human expert review it (free account)
- [New Connection](${SITE}/new-connection/): charges, documents and process per DISCOM
- [Complaint](${SITE}/complaint/): DISCOM complaint portals and the 1912 national helpline

## Guides

${GUIDES.map(g => `- [${g.title}](${SITE}/guides/${g.slug}/): ${g.description.split('.')[0]}`).join('\n')}

## Reference

- [Electricity Bill Glossary](${SITE}/glossary/): definitions of billing terms — ${GLOSSARY.map(t => t.abbr || t.term.replace(/\s*\(.*?\)\s*/g, '').trim()).join(', ')}

## Tariff reference

- [All states & DISCOMs directory](${SITE}/tariffs/states/): index of every state and DISCOM landing page

${stateLinks}

## Notes

- All amounts are in Indian Rupees (INR). "Units" are kWh.
- FPPA (Fuel and Power Purchase Adjustment) is applied per-unit or as a percentage of energy charges, whichever the state's tariff order specifies.
- Slab calculations are telescopic: each rate applies only to units within its slab.
`;
}

// ── minified CSS ──────────────────────────────────────────────────────────────
// styles.css (~176 KB unminified) is the page's only render-blocking resource.
// Every build regenerates css/styles.min.css from it; all pages link the .min
// file. Edit styles.css as usual — just rerun this script before deploying.
// Conservative rules only: strip comments, collapse whitespace, tighten around
// structural punctuation. Colons and '>' keep their spacing so descendant
// selectors like `.foo :hover` and calc() expressions can never change meaning.
function writeMinifiedCss() {
  const src = fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8');
  const min = src
    .replace(/\/\*[\s\S]*?\*\//g, '')       // comments
    .replace(/\s+/g, ' ')                   // newlines + indentation → single spaces
    .replace(/\s*([{};,])\s*/g, '$1')       // no space around structural punctuation
    .replace(/;}/g, '}')                    // trailing semicolons
    .trim();
  fs.writeFileSync(path.join(ROOT, 'css', 'styles.min.css'), min, 'utf8');
  return `${Math.round(min.length / 1024)} KB from ${Math.round(src.length / 1024)} KB`;
}

// ── run ───────────────────────────────────────────────────────────────────────
export function generateSeo() {
  const states = getStates();
  let pages = 0;

  // English at the canonical path, Hindi twin under hi/ — same builders, lang-switched.
  // emitPage() resolves each page's content-derived <lastmod> (see the manifest logic above).
  for (const lang of ['en', 'hi']) {
    const p = lang === 'hi' ? 'hi/' : '';

    emitPage(`${p}tariffs/states`, directoryPage(states, lang));
    pages++;

    emitPage(`${p}guides`, guidesIndexPage(lang));
    pages++;
    for (const guide of GUIDES) {
      if (lang === 'hi' && !guide.sectionsHi) continue;   // untranslated guides stay English-only
      emitPage(`${p}guides/${guide.slug}`, guidePage(guide, lang));
      pages++;
    }

    emitPage(`${p}glossary`, glossaryPage(lang));
    pages++;

    for (const state of states) {
      const stateSlug = slugify(state);
      emitPage(`${p}tariffs/${stateSlug}`, statePage(state, lang));
      pages++;
      for (const discom of getDiscoms(state)) {
        emitPage(`${p}tariffs/${stateSlug}/${discom.id}`, discomPage(state, discom, lang));
        pages++;
      }
    }
  }

  // buildSitemap() resolves the hand-written static routes too, so save the manifest after it.
  const sitemap = buildSitemap(states);
  saveManifest();
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), ROBOTS, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), buildLlmsTxt(states), 'utf8');
  const cssKb = writeMinifiedCss();

  console.log(`SEO: generated ${pages} landing pages across ${states.length} states, plus sitemap.xml + robots.txt + llms.txt + styles.min.css (${cssKb})`);
  return { pages, states: states.length };
}

// Allow running directly: `node generate-seo.js`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateSeo();
}
