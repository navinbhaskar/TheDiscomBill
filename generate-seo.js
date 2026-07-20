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
import { execSync } from 'child_process';

import { TARIFF_DB, STATE_META, getStates, getDiscoms } from './js/tariffs/registry.js';
import { calculateBill } from './js/engine.js';
import { GUIDES } from './guides-content.js';
import { GLOSSARY } from './glossary-content.js';
// Runtime i18n.js carries only English; the vernacular tables are split into
// per-language modules (lazy-loaded in the browser) — the pre-renderer needs
// them all, so import and merge them here.
import { STRINGS as BASE_STRINGS } from './js/i18n.js';
import hiStrings from './js/i18n/hi.js';
import mrStrings from './js/i18n/mr.js';
import taStrings from './js/i18n/ta.js';
const STRINGS = { ...BASE_STRINGS, hi: hiStrings, mr: mrStrings, ta: taStrings };

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
const LASTMOD_MR  = '%%LASTMOD_HUMAN_MR%%';    // → "6 जुलै 2026"
const LASTMOD_TA  = '%%LASTMOD_HUMAN_TA%%';    // → "6 ஜூலை 2026"
const LASTMOD_TOKEN = { en: LASTMOD_EN, hi: LASTMOD_HI, mr: LASTMOD_MR, ta: LASTMOD_TA };
const MANIFEST_PATH = path.join(ROOT, 'sitemap-lastmod.json');

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const replaceAllStr = (s, find, repl) => s.split(find).join(repl);
const DATE_LOCALE = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN' };
const humanDate = (iso, lang) => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString(DATE_LOCALE[lang] || 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

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
  let final = replaceAllStr(html, LASTMOD_ISO, lastmod);
  for (const l of ALL_LANGS) final = replaceAllStr(final, LASTMOD_TOKEN[l], humanDate(lastmod, l));
  writePage(relDir, final);
}

// ── Tariff-data-derived "Tariffs last updated" ────────────────────────────────
// The visible "Tariffs last updated" line must move ONLY when the state's tariff data
// changes — a chrome tweak re-dating every page was making all 400+ pages claim a tariff
// review that never happened. So this date hashes the registry data alone (manifest key
// "tariff:<state-slug>", beside the URL entries). No token needed: the data hash doesn't
// depend on the rendered page, so the date interpolates directly — and because it then
// participates in the page hash, a real tariff change re-dates <lastmod> too.
// First sighting seeds from git's last commit touching js/tariffs/<slug>.js — the honest
// date the data last moved — falling back to TODAY outside a git checkout.
function tariffLastmod(state) {
  const slug = slugify(state);
  const key = `tariff:${slug}`;
  const m = loadManifest();
  _seenUrls.add(key);   // saveManifest() prunes anything unseen
  const hash = sha1(JSON.stringify({ meta: STATE_META[state] ?? null, discoms: getDiscoms(state) }));
  if (m[key] && m[key].hash === hash) return m[key].lastmod;
  let date = TODAY;
  if (!m[key]) {
    try {
      date = execSync(`git log -1 --format=%cs -- "js/tariffs/${slug}.js"`,
        { cwd: ROOT, encoding: 'utf8' }).trim() || TODAY;
    } catch (e) { /* no git — TODAY is the best we have */ }
  }
  m[key] = { hash, lastmod: date };
  return date;
}
const tariffUpdated = (state, lang) => humanDate(tariffLastmod(state), lang);

// ── small utilities ──────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const attr = (s) => esc(s);
const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
// Per-unit rates read as money, so they keep both paise digits: ₹5.80/unit, not ₹5.8/unit.
const rupeeRate = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function writePage(relDir, html) {
  const dir = path.join(ROOT, relDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

// ── Vernacular (/hi/, /mr/, /ta/) variants ────────────────────────────────────
// English pages live at the canonical URL; each supported vernacular gets a twin under
// its language prefix. Tariff/state/smart-meter twins are STATE-SCOPED (electricity is a
// state subject): Hindi covers every state, Marathi covers Maharashtra, Tamil covers Tamil
// Nadu — matching where those readers actually are. Pan-India pages (directory, glossary,
// guides index, smart-meter hub) are emitted in every language. Each twin carries the full
// hreflang set so Google indexes it instead of treating it as a duplicate.
const VERNACULARS = ['hi', 'mr', 'ta'];                 // languages with pre-rendered twins
const ALL_LANGS = ['en', ...VERNACULARS];
// States a vernacular is scoped to for tariff/state/smart-meter pages (null = every state).
const LANG_STATES = { hi: null, mr: ['Maharashtra'], ta: ['Tamil Nadu'] };
const langServesState = (lang, state) => lang === 'en' || !LANG_STATES[lang] || LANG_STATES[lang].includes(state);
const langUrl = (u, lang) => (lang === 'en' ? u : `/${lang}` + u);

// Native state/UT names per language (used in vernacular titles, H1s and breadcrumbs —
// "उत्तर प्रदेश बिजली बिल कैलकुलेटर" / "தமிழ்நாடு மின் கட்டண கணிப்பான்" is the query
// shape those searchers actually type). Marathi and Tamil sets are complete so the
// pan-India directory renders every state name natively.
const STATE_NAMES = {
  hi: {
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
  },
  mr: {
    'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश', 'Assam': 'आसाम',
    'Bihar': 'बिहार', 'Chandigarh': 'चंदीगड', 'Chhattisgarh': 'छत्तीसगड',
    'Dadra and Nagar Haveli and Daman and Diu': 'दादरा आणि नगर हवेली आणि दमण आणि दीव',
    'Delhi': 'दिल्ली', 'Goa': 'गोवा', 'Gujarat': 'गुजरात', 'Haryana': 'हरियाणा',
    'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jammu and Kashmir': 'जम्मू आणि काश्मीर',
    'Jharkhand': 'झारखंड', 'Karnataka': 'कर्नाटक', 'Kerala': 'केरळ', 'Ladakh': 'लडाख',
    'Lakshadweep': 'लक्षद्वीप', 'Madhya Pradesh': 'मध्य प्रदेश', 'Maharashtra': 'महाराष्ट्र',
    'Manipur': 'मणिपूर', 'Meghalaya': 'मेघालय', 'Mizoram': 'मिझोराम', 'Nagaland': 'नागालँड',
    'Odisha': 'ओडिशा', 'Puducherry': 'पुद्दुचेरी', 'Punjab': 'पंजाब', 'Rajasthan': 'राजस्थान',
    'Sikkim': 'सिक्कीम', 'Tamil Nadu': 'तमिळनाडू', 'Telangana': 'तेलंगणा', 'Tripura': 'त्रिपुरा',
    'Uttar Pradesh': 'उत्तर प्रदेश', 'Uttarakhand': 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल',
    'Andaman and Nicobar Islands': 'अंदमान आणि निकोबार बेटे',
  },
  ta: {
    'Andhra Pradesh': 'ஆந்திரப் பிரதேசம்', 'Arunachal Pradesh': 'அருணாசலப் பிரதேசம்', 'Assam': 'அஸ்ஸாம்',
    'Bihar': 'பீகார்', 'Chandigarh': 'சண்டிகர்', 'Chhattisgarh': 'சத்தீஸ்கர்',
    'Dadra and Nagar Haveli and Daman and Diu': 'தாத்ரா நகர் ஹவேலி மற்றும் தமன் தியூ',
    'Delhi': 'டெல்லி', 'Goa': 'கோவா', 'Gujarat': 'குஜராத்', 'Haryana': 'ஹரியானா',
    'Himachal Pradesh': 'இமாசலப் பிரதேசம்', 'Jammu and Kashmir': 'ஜம்மு காஷ்மீர்',
    'Jharkhand': 'ஜார்க்கண்ட்', 'Karnataka': 'கர்நாடகா', 'Kerala': 'கேரளா', 'Ladakh': 'லடாக்',
    'Lakshadweep': 'லட்சத்தீவு', 'Madhya Pradesh': 'மத்தியப் பிரதேசம்', 'Maharashtra': 'மகாராஷ்டிரா',
    'Manipur': 'மணிப்பூர்', 'Meghalaya': 'மேகாலயா', 'Mizoram': 'மிசோரம்', 'Nagaland': 'நாகாலாந்து',
    'Odisha': 'ஒடிசா', 'Puducherry': 'புதுச்சேரி', 'Punjab': 'பஞ்சாப்', 'Rajasthan': 'ராஜஸ்தான்',
    'Sikkim': 'சிக்கிம்', 'Tamil Nadu': 'தமிழ்நாடு', 'Telangana': 'தெலங்கானா', 'Tripura': 'திரிபுரா',
    'Uttar Pradesh': 'உத்தரப் பிரதேசம்', 'Uttarakhand': 'உத்தராகண்ட்', 'West Bengal': 'மேற்கு வங்காளம்',
    'Andaman and Nicobar Islands': 'அந்தமான் நிக்கோபார் தீவுகள்',
  },
};
const stateName = (s, lang) => (lang === 'en' ? s : (STATE_NAMES[lang] && STATE_NAMES[lang][s]) || s);
// FY label: "FY 2025-26" → localized prefix + "2025-26".
const FY_PREFIX = { hi: 'वित्त वर्ष ', mr: 'आर्थिक वर्ष ', ta: 'நிதியாண்டு ' };
const fyLabel = (fy, lang) => (lang === 'en' ? String(fy) : String(fy).replace(/^FY\s*/i, FY_PREFIX[lang] || ''));

// Inline per-language string picker: co-locates a string's translations at its use site,
// so `hi ? A : B` becomes T(lang, { en: B, hi: A, mr: …, ta: … }). Falls back to English
// when a language is missing (keeps output valid mid-translation).
const T = (lang, m) => (m[lang] != null ? m[lang] : m.en);

// Back-compat shims for page functions not yet migrated off the Hindi-only helpers.
// (Being removed function-by-function as each page builder is converted to `lang`.)
const hiUrl = (u) => langUrl(u, 'hi');
const hiState = (s) => stateName(s, 'hi');
const hiFy = (fy) => fyLabel(fy, 'hi');

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
// The year for the "…Bill Calculator <year>" slot: the plain calendar year people type
// into search at build time — NOT the tariff-order vintage. The order year (fy) stays on
// every "Tariff" phrase, description, badge and body line, so the SERP looks current
// without overstating how new the rates are. (July-2026 builds were still titling pages
// "2024-25" — a sitewide CTR leak.)
const TITLE_YEAR = String(new Date().getFullYear());

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
      <a href="/compare/" class="nav-promoted" data-i18n="nav.compare">Compare DISCOMs</a>
      <a href="/tariffs/states/" class="nav-promoted" data-i18n="nav.tariffs">Tariffs</a>
      <a href="/guides/" class="nav-promoted" data-i18n="nav.blog">Blog</a>
      <div class="nav-dropdown" id="quickLinksDropdown">
        <button type="button" class="nav-dropdown-trigger" id="quickLinksTrigger" aria-haspopup="true" aria-expanded="false">
          <span data-i18n="nav.quickLinks">More</span>
          <svg class="nav-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="nav-dropdown-menu" id="quickLinksMenu" role="menu">
          <div class="nav-mob-links" role="presentation">
            <a href="/#calculator" class="nav-dropdown-item nav-mob-sm" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg><span data-i18n="nav.calculator">Calculator</span></a>
            <a href="/compare/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6"/></svg><span data-i18n="nav.compare">Compare DISCOMs</span></a>
            <a href="/tariffs/states/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg><span data-i18n="nav.tariffs">Tariffs</span></a>
            <a href="/guides/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span data-i18n="nav.blog">Blog</span></a>
            <a href="/#about" class="nav-dropdown-item nav-mob-sm" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span data-i18n="nav.about">About</span></a>
          </div>
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.tools">Tools</span>
          <a href="/usage/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span data-i18n="ql.usage">Electricity Cost Calculator</span></a>
          <a href="/solar/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><span data-i18n="ql.solar">Rooftop Solar Savings</span></a>
          <a href="/ev/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="13" height="10" rx="2"/><path d="M15 10h3l3 3v4h-6"/><path d="M9.5 9.5 7.5 12h3l-2 2.5"/></svg><span data-i18n="ql.ev">EV Charging Cost</span></a>
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.services">Services</span>
          <a href="/services/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg><span data-i18n="ql.discomServices">DISCOM Services</span></a>
          <a href="/smart-meter-recharge/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/><path d="M11 9l-2 3h3l-2 3"/></svg><span data-i18n="ql.smartMeter">Smart Meter Recharge</span></a>
          <div class="nav-subgroup">
          <button type="button" class="nav-dropdown-item nav-subgroup-trigger" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/></svg><span data-i18n="ql.billReviewGroup">Get Your Bill Reviewed</span><svg class="nav-subgroup-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
          <div class="nav-submenu" role="menu">
            <a href="/#calculator" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><span data-i18n="ql.ocrCheck">Instant Self-Check (OCR)</span><span class="rc-beta">Beta</span></a>
            <a href="/bill-review/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg><span data-i18n="ql.billReview">From an Expert</span></a>
          </div>
          </div>
          <span class="nav-dropdown-label" role="presentation" data-i18n="ql.learn">Learn</span>
          <a href="/glossary/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M12 7h5M12 11h5M7 7h.01M7 11h.01"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span data-i18n="ql.glossary">Electricity Bill Guide</span></a>
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
// Rewrite site-chrome links to their vernacular variants (only routes that actually
// have a twin in this language — tools/services pages stay English). Tariff/state links
// are only rewritten to /<lang>/ for states this language is scoped to; elsewhere they
// keep the English target so a Marathi reader on a pan-India page still reaches a real page.
function langChrome(html, lang) {
  if (lang === 'en') return html;
  const p = `/${lang}`;
  return html
    .replace(/href="\/tariffs\/states\/"/g, `href="${p}/tariffs/states/"`)
    .replace(/href="\/guides\/"/g, `href="${p}/guides/"`)
    .replace(/href="\/glossary\/"/g, `href="${p}/glossary/"`)
    .replace(/href="\/smart-meter-recharge\/"/g, `href="${p}/smart-meter-recharge/"`);
}

// BCP-47 tags + native og:locale for each supported language.
const LANG_LOCALE = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN' };
const OG_LOCALE = { en: 'en_IN', hi: 'hi_IN', mr: 'mr_IN', ta: 'ta_IN' };

// `page` is the site-relative English URL of this page (e.g. "/glossary/"). When given,
// the full hreflang set for every language twin that exists for this page is emitted;
// `lang` picks which variant this is. `altLangs` restricts which vernacular twins exist
// (defaults to all — pass a subset for state-scoped pages).
function layout({ title, description, canonical, jsonld = [], body, lang = 'en', page = null, altLangs = VERNACULARS }) {
  // Every generated page carries a WebPage node with freshness + publisher links —
  // GEO signal for AI crawlers (entity graph anchored to the #org / #website ids
  // declared on the homepage).
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': `${SITE}/#website` },
    publisher: { '@id': `${SITE}/#org` },
    inLanguage: LANG_LOCALE[lang] || 'en-IN',
    dateModified: LASTMOD_ISO   // resolved to the content-derived date by emitPage()
  };
  const ld = [webPage, ...jsonld].filter(Boolean)
    .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ');
  // hreflang set: Google needs it on EVERY variant, and x-default points at English.
  const alternates = page ? `
  <link rel="alternate" hreflang="en-IN" href="${SITE}${page}">${altLangs.map(l =>
  `\n  <link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${SITE}${langUrl(page, l)}">`).join('')}
  <link rel="alternate" hreflang="x-default" href="${SITE}${page}">` : '';
  // On a vernacular page the URL itself is an explicit language choice: persist it so the
  // client i18n layer renders the shared chrome (nav/footer) in that language immediately.
  const langBoot = lang !== 'en' ? `try { localStorage.setItem('lang', '${lang}'); } catch (e) {}` : '';
  const chrome = langChrome(HEADER, lang);
  const footer = langChrome(FOOTER, lang);
  return `<!DOCTYPE html>
<html lang="${lang}">
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
  <link rel="apple-touch-icon" href="/icon-192.png">
  <script>
    (function () {
      document.documentElement.classList.add('js');
      try {
        var t = localStorage.getItem('theme');
        if (t !== 'dark' && t !== 'light') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
  <meta property="og:locale" content="${OG_LOCALE[lang] || 'en_IN'}">
  ${lang !== 'en' ? '<meta property="og:locale:alternate" content="en_IN">' : '<meta property="og:locale:alternate" content="hi_IN">'}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(description)}">
  <meta name="twitter:image" content="${SITE}/og-image.jpg">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Fonts load async (non-render-blocking); display=swap shows fallback text immediately -->
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"></noscript>
  <link rel="stylesheet" href="/css/styles.min.css">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-D0SSNW5RZ6"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    if (location.hostname === 'thediscombill.com') gtag('config', 'G-D0SSNW5RZ6');
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

// Visible, crawlable link(s) between language variants (shown under the breadcrumbs). On a
// vernacular page it links back to English; on the English page it links to each vernacular
// twin that exists for this page.
const READ_IN = {
  en: 'Read this page in English →',
  hi: 'यह पेज हिंदी में पढ़ें →',
  mr: 'हे पेज मराठीत वाचा →',
  ta: 'இந்தப் பக்கத்தைத் தமிழில் படிக்கவும் →',
};
function langSwitchLink(page, lang, altLangs = VERNACULARS) {
  if (lang !== 'en') {
    return `<p class="seo-lang-link"><a href="${attr(page)}" hreflang="en-IN" lang="en">Read this page in English →</a></p>`;
  }
  const links = altLangs.map(l =>
    `<a href="${attr(langUrl(page, l))}" hreflang="${LANG_LOCALE[l]}" lang="${l}">${READ_IN[l]}</a>`).join(' &nbsp;·&nbsp; ');
  return links ? `<p class="seo-lang-link">${links}</p>` : '';
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

function faqHtml(faqs, lang = 'en') {
  if (!faqs.length) return '';
  const items = faqs.map(f => `
    <details class="seo-faq-item">
      <summary>${esc(f.q)}</summary>
      <div class="seo-faq-a">${f.a}</div>
    </details>`).join('');
  const h = T(lang, { en: 'Frequently asked questions', hi: 'अक्सर पूछे जाने वाले सवाल', mr: 'वारंवार विचारले जाणारे प्रश्न', ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்' });
  return `<section class="seo-section"><h2>${h}</h2>${items}</section>`;
}

// ── tariff renderers (static, ported from tariff-explorer.js) ─────────────────
function slabRange(prev, limit, lang = 'en') {
  if (limit === Infinity || limit == null) {
    const n = prev.toLocaleString('en-IN');
    // Tamil/Marathi put the "above" marker after the number.
    return T(lang, { en: `Above ${n}`, hi: `${n} से अधिक`, mr: `${n} पेक्षा जास्त`, ta: `${n}-க்கு மேல்` });
  }
  if (prev === 0) return `0 – ${limit.toLocaleString('en-IN')}`;
  return `${prev.toLocaleString('en-IN')} – ${limit.toLocaleString('en-IN')}`;
}
function energySlabsHtml(slabs, lang = 'en') {
  if (!Array.isArray(slabs) || !slabs.length) return `<p class="tx-muted">${T(lang, { en: 'Not specified.', hi: 'निर्दिष्ट नहीं।', mr: 'नमूद केलेले नाही.', ta: 'குறிப்பிடப்படவில்லை.' })}</p>`;
  const unit = T(lang, { en: 'units', hi: 'यूनिट', mr: 'युनिट', ta: 'யூனிட்' });
  const perUnit = T(lang, { en: '/unit', hi: '/यूनिट', mr: '/युनिट', ta: '/யூனிட்' });
  let prev = 0;
  const rows = slabs.map(s => {
    const range = slabRange(prev, s.limit, lang);
    prev = (s.limit === Infinity || s.limit == null) ? prev : s.limit;
    const note = s.label ? ` <span class="tx-muted">(${esc(s.label)})</span>` : '';
    return `<tr><td>${range} <span class="tx-muted">${unit}</span>${note}</td><td class="num">${rupeeRate(s.rate)}<span class="tx-muted">${perUnit}</span></td></tr>`;
  }).join('');
  return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
}
function fixedChargeHtml(fc, lang = 'en') {
  const mo = T(lang, { en: '/ month', hi: '/ माह', mr: '/ महिना', ta: '/ மாதம்' });
  const flat = T(lang, { en: '/ month (flat)', hi: '/ माह (स्थिर)', mr: '/ महिना (स्थिर)', ta: '/ மாதம் (நிலையானது)' });
  const perMo = T(lang, { en: '/mo', hi: '/माह', mr: '/महिना', ta: '/மாதம்' });
  if (fc == null) return '<span class="tx-muted">—</span>';
  if (typeof fc === 'number') return `<strong>${rupee(fc)}</strong> <span class="tx-muted">${flat}</span>`;
  if (fc.type === 'per_kw')  return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kW ${mo}</span>`;
  if (fc.type === 'per_kva') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kVA ${mo}</span>`;
  if (fc.type === 'flat')    return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">${flat}</span>`;
  if (fc.type === 'tiered' && Array.isArray(fc.slabs)) {
    const rows = fc.slabs.map(s => {
      const label = s.label || (s.maxLoad === Infinity
        ? T(lang, { en: 'Above limit', hi: 'सीमा से ऊपर', mr: 'मर्यादेपेक्षा जास्त', ta: 'வரம்பிற்கு மேல்' })
        : T(lang, { en: `Up to ${s.maxLoad} kW`, hi: `${s.maxLoad} kW तक`, mr: `${s.maxLoad} kW पर्यंत`, ta: `${s.maxLoad} kW வரை` }));
      return `<tr><td>${esc(label)}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">${perMo}</span></td></tr>`;
    }).join('');
    return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
  }
  if (typeof fc.rate === 'number') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">${mo}</span>`;
  return '<span class="tx-muted">—</span>';
}
function additionalChargesHtml(arr, lang = 'en') {
  if (!Array.isArray(arr) || !arr.length) return '';
  const items = arr.map(a => {
    const isPct = a.type && String(a.type).includes('percent');
    const val = isPct ? `${a.rate}%` : rupee(a.rate);
    return `<li><span>${esc(a.name || 'Charge')}</span><strong>${val}</strong></li>`;
  }).join('');
  const label = T(lang, { en: 'Additional charges', hi: 'अतिरिक्त शुल्क', mr: 'अतिरिक्त शुल्क', ta: 'கூடுதல் கட்டணங்கள்' });
  return `<div class="tariff-field"><div class="tariff-field-label">${label}</div><ul class="tariff-addl">${items}</ul></div>`;
}
function tariffBlockHtml(obj, lang = 'en') {
  return `
    <div class="tariff-block">
      <div class="tariff-field">
        <div class="tariff-field-label">${T(lang, { en: 'Fixed charge', hi: 'फिक्स्ड चार्ज', mr: 'फिक्स्ड चार्ज', ta: 'நிலையான கட்டணம்' })}</div>
        <div class="tariff-field-value">${fixedChargeHtml(obj.fixedCharge, lang)}</div>
      </div>
      <div class="tariff-field">
        <div class="tariff-field-label">${T(lang, { en: 'Energy charges', hi: 'ऊर्जा शुल्क', mr: 'ऊर्जा शुल्क', ta: 'மின் கட்டணம்' })}</div>
        ${energySlabsHtml(obj.energySlabs, lang)}
      </div>
      ${additionalChargesHtml(obj.additionalCharges, lang)}
    </div>`;
}
function categoryCardHtml(cat, lang = 'en') {
  const hasSupplyTypes = Array.isArray(cat.supplyTypes) && cat.supplyTypes.length > 0;
  let body;
  if (hasSupplyTypes) {
    body = cat.supplyTypes.map(st => `
      <div class="tariff-supplytype">
        <div class="tariff-st-name">${esc(st.name || st.id)}</div>
        ${st.description ? `<p class="tariff-st-desc">${esc(st.description)}</p>` : ''}
        ${tariffBlockHtml(st, lang)}
      </div>`).join('');
  } else {
    body = tariffBlockHtml(cat, lang);
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
function indicativeBillsHtml(state, discom, lang = 'en') {
  const cat = domesticCategory(discom);
  if (!cat) return '';
  const load = 2;            // assume a typical 2 kW domestic sanctioned load
  const levels = [100, 200, 300, 500];
  const unit = T(lang, { en: 'units', hi: 'यूनिट', mr: 'युनिट', ta: 'யூனிட்' });
  const rows = [];
  for (const units of levels) {
    try {
      const r = calculateBill({ discomId: discom.id, categoryId: cat.id, units, connectedLoadKw: load });
      if (r && !r.error && r.totalPayable != null) {
        rows.push(`<tr><td>${units.toLocaleString('en-IN')} ${unit}</td><td class="num">${rupee(r.totalPayable)}</td></tr>`);
      }
    } catch (e) { /* skip a level that the engine can't price */ }
  }
  if (!rows.length) return '';
  const calcHref = `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`;
  const nm = esc(discom.name);
  const heading = T(lang, {
    en: `Indicative monthly bill — ${nm}`, hi: `अनुमानित मासिक बिल — ${nm}`,
    mr: `अंदाजित मासिक बिल — ${nm}`, ta: `தோராயமான மாதாந்திர கட்டணம் — ${nm}` });
  const intro = T(lang, {
    en: `Estimated total monthly bill for a domestic (${esc(cat.name)}) connection at a ${load} kW sanctioned load, computed with the same engine as our calculator. Actual bills vary with your sub-category, fixed/fuel charges and local duties.`,
    hi: `${load} kW स्वीकृत भार पर घरेलू (${esc(cat.name)}) कनेक्शन का अनुमानित कुल मासिक बिल, हमारे कैलकुलेटर वाले ही इंजन से निकाला गया। वास्तविक बिल आपकी उप-श्रेणी, फिक्स्ड/ईंधन शुल्क और स्थानीय करों के अनुसार बदलते हैं।`,
    mr: `${load} kW मंजूर भारावर घरगुती (${esc(cat.name)}) जोडणीचे अंदाजित एकूण मासिक बिल, आमच्या कॅल्क्युलेटरच्याच इंजिनने काढलेले. प्रत्यक्ष बिल तुमच्या उप-श्रेणी, फिक्स्ड/इंधन शुल्क आणि स्थानिक करांनुसार बदलते.`,
    ta: `${load} kW அனுமதிக்கப்பட்ட சுமையில் வீட்டு (${esc(cat.name)}) இணைப்பிற்கான தோராயமான மொத்த மாதாந்திர கட்டணம், எங்கள் கால்குலேட்டரின் அதே இன்ஜினால் கணக்கிடப்பட்டது. உண்மையான கட்டணங்கள் உங்கள் துணை வகை, நிலையான/எரிபொருள் கட்டணங்கள் மற்றும் உள்ளூர் வரிகளுக்கு ஏற்ப மாறுபடும்.` });
  const thUse = T(lang, { en: 'Monthly consumption', hi: 'मासिक खपत', mr: 'मासिक वापर', ta: 'மாதாந்திர நுகர்வு' });
  const thBill = T(lang, { en: 'Estimated bill', hi: 'अनुमानित बिल', mr: 'अंदाजित बिल', ta: 'தோராயமான கட்டணம்' });
  const cta = T(lang, {
    en: `Calculate my exact ${nm} bill →`, hi: `मेरा सटीक ${nm} बिल निकालें →`,
    mr: `माझे नेमके ${nm} बिल काढा →`, ta: `என் சரியான ${nm} கட்டணத்தைக் கணக்கிடு →` });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <p>${intro}</p>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>${thUse}</th><th class="num">${thBill}</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>
      <p class="seo-cta-row"><a class="seo-cta" href="${calcHref}">${cta}</a></p>
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

function areaServedHtml(discom, lang = 'en') {
  const { region, cities } = parseArea(discom.area);
  if (!region && !cities.length) return '';
  const nm = esc(discom.name);
  const long = esc(discom.fullName || discom.name);
  const rgn = region ? esc(region) : '';
  const cityList = esc(cities.slice(0, 4).join(', '));
  const lead = cities.length
    ? T(lang, {
        en: `${nm} (${long}) distributes electricity across ${rgn || 'its licensed area'}, serving ${cities.length} key district${cities.length > 1 ? 's' : ''} and town${cities.length > 1 ? 's' : ''} including ${cityList}${cities.length > 4 ? ' and more' : ''}.`,
        hi: `${nm} (${long}) ${rgn || 'अपने लाइसेंस क्षेत्र'} में बिजली वितरित करती है — ${cityList}${cities.length > 4 ? ' समेत' : ''} ${cities.length} प्रमुख ज़िलों/शहरों में।`,
        mr: `${nm} (${long}) ${rgn || 'आपल्या परवाना क्षेत्रात'} वीज वितरित करते — ${cityList}${cities.length > 4 ? ' यांसह' : ''} ${cities.length} प्रमुख जिल्हे/शहरांमध्ये.`,
        ta: `${nm} (${long}) ${rgn || 'அதன் உரிமம் பெற்ற பகுதி'} முழுவதும் மின்சாரம் வழங்குகிறது — ${cityList}${cities.length > 4 ? ' உள்ளிட்ட' : ''} ${cities.length} முக்கிய மாவட்டங்கள்/நகரங்களில்.` })
    : T(lang, {
        en: `${nm} distributes electricity across ${rgn}.`, hi: `${nm} ${rgn} में बिजली वितरित करती है।`,
        mr: `${nm} ${rgn} मध्ये वीज वितरित करते.`, ta: `${nm} ${rgn} முழுவதும் மின்சாரம் வழங்குகிறது.` });
  const chips = cities.length
    ? `<div class="seo-area-chips">${cities.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : '';
  const heading = T(lang, { en: `Areas served by ${nm}`, hi: `${nm} का सेवा क्षेत्र`, mr: `${nm} चे सेवा क्षेत्र`, ta: `${nm} சேவை செய்யும் பகுதிகள்` });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <p>${lead}</p>
      ${chips}
    </section>`;
}

function keyFactsHtml(state, discom, fy, lang = 'en') {
  const { region, cities } = parseArea(discom.area);
  const dr = domesticRates(discom);
  const rows = [];
  rows.push([T(lang, { en: 'Distribution company', hi: 'वितरण कंपनी', mr: 'वितरण कंपनी', ta: 'விநியோக நிறுவனம்' }), esc(discom.fullName || discom.name)]);
  rows.push([T(lang, { en: 'Short name', hi: 'संक्षिप्त नाम', mr: 'संक्षिप्त नाव', ta: 'சுருக்கப் பெயர்' }), esc(discom.name)]);
  rows.push([T(lang, { en: 'State / UT', hi: 'राज्य / केंद्र शासित प्रदेश', mr: 'राज्य / केंद्रशासित प्रदेश', ta: 'மாநிலம் / யூனியன் பிரதேசம்' }), esc(stateName(state, lang))]);
  if (region) rows.push([T(lang, { en: 'Service region', hi: 'सेवा क्षेत्र', mr: 'सेवा क्षेत्र', ta: 'சேவைப் பகுதி' }), esc(region)]);
  if (cities.length) rows.push([T(lang, { en: 'Districts / cities served', hi: 'सेवित ज़िले / शहर', mr: 'सेवा दिलेले जिल्हे / शहरे', ta: 'சேவை செய்யும் மாவட்டங்கள் / நகரங்கள்' }), esc(cities.length) + '+ — ' + esc(cities.slice(0, 6).join(', ')) + (cities.length > 6 ? '…' : '')]);
  rows.push([T(lang, { en: 'Tariff year', hi: 'टैरिफ वर्ष', mr: 'टॅरिफ वर्ष', ta: 'கட்டண ஆண்டு' }), esc(fyLabel(fy, lang))]);
  // Freshness: states verified against real bills get an explicit badge; the rest
  // state honestly which published order the rates come from. (Never fabricate a
  // "verified" claim — only STATE_META.verified set from an actual bill check.)
  const meta = STATE_META[state] || {};
  rows.push([T(lang, { en: 'Rates status', hi: 'दरों की स्थिति', mr: 'दरांची स्थिती', ta: 'கட்டண நிலை' }), meta.verified
    ? T(lang, {
        en: `✅ Verified against real bills — ${esc(meta.ratesAsOf || fy)}`,
        hi: `✅ असली बिलों से सत्यापित — ${esc(meta.ratesAsOf || fy)}`,
        mr: `✅ खऱ्या बिलांवरून पडताळलेले — ${esc(meta.ratesAsOf || fy)}`,
        ta: `✅ உண்மையான பில்களுடன் சரிபார்க்கப்பட்டது — ${esc(meta.ratesAsOf || fy)}` })
    : T(lang, {
        en: `Based on the ${esc(fy)} tariff order (latest published data we have)`,
        hi: `${esc(fyLabel(fy, 'hi'))} टैरिफ आदेश पर आधारित (हमारे पास उपलब्ध नवीनतम प्रकाशित डेटा)`,
        mr: `${esc(fyLabel(fy, 'mr'))} टॅरिफ आदेशावर आधारित (आमच्याकडील नवीनतम प्रकाशित डेटा)`,
        ta: `${esc(fyLabel(fy, 'ta'))} கட்டண ஆணையை அடிப்படையாகக் கொண்டது (எங்களிடம் உள்ள சமீபத்திய வெளியிடப்பட்ட தரவு)` })]);
  // Flat-rate states (e.g. Bihar's single ₹7.42 slab) collapse to one figure, not "x – x".
  if (dr) rows.push([T(lang, { en: 'Domestic energy rate', hi: 'घरेलू ऊर्जा दर', mr: 'घरगुती ऊर्जा दर', ta: 'வீட்டு மின் கட்டணம்' }), `${dr.min === dr.max ? rupeeRate(dr.min) : `${rupeeRate(dr.min)} – ${rupeeRate(dr.max)}`} ${T(lang, { en: 'per unit', hi: 'प्रति यूनिट', mr: 'प्रति युनिट', ta: 'ஒரு யூனிட்டுக்கு' })}`]);
  if (discom.lpscRate != null) rows.push([T(lang, { en: 'Late payment surcharge (LPSC)', hi: 'विलंब भुगतान अधिभार (LPSC)', mr: 'विलंब भरणा अधिभार (LPSC)', ta: 'தாமத கட்டண மிகைக்கட்டணம் (LPSC)' }), `${discom.lpscRate}% ${T(lang, { en: 'per month', hi: 'प्रति माह', mr: 'दरमहा', ta: 'ஒரு மாதத்திற்கு' })}`]);
  if (discom.website) rows.push([T(lang, { en: 'Official website', hi: 'आधिकारिक वेबसाइट', mr: 'अधिकृत वेबसाइट', ta: 'அதிகாரப்பூர்வ இணையதளம்' }), `<a href="${attr(discom.website)}" target="_blank" rel="noopener">${esc(String(discom.website).replace(/^https?:\/\//, ''))} ↗</a>`]);
  const heading = T(lang, { en: `${esc(discom.name)} at a glance`, hi: `${esc(discom.name)} एक नज़र में`, mr: `${esc(discom.name)} एका दृष्टिक्षेपात`, ta: `${esc(discom.name)} ஒரு பார்வையில்` });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <table class="seo-facts"><tbody>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
    </section>`;
}

// Per-DISCOM "quick links" into the DISCOM Services hub tabs (pay / new-connection / complaint),
// deep-linked with ?state=&discom= so the hub opens pre-selected on this DISCOM and on the right
// tab. These are internal links to an existing page (not new thin per-DISCOM pages) — they improve
// crawl depth and topical clustering without duplicate-content risk.
function discomServiceLinksHtml(state, discom, lang = 'en') {
  const qs = `?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}`;
  const pfx = lang === 'en' ? '' : `/${lang}`;
  const smrHref = `${pfx}/smart-meter-recharge/${slugify(state)}/${discom.id}/`;
  const nm = esc(discom.name);
  const links = [
    [`/services/${qs}#pay`,
      T(lang, { en: `Check &amp; pay ${nm} bill`, hi: `${nm} बिल देखें व भरें`, mr: `${nm} बिल पाहा व भरा`, ta: `${nm} பில்லைப் பார்த்து செலுத்துங்கள்` }),
      T(lang, { en: 'View your latest bill and pay on the official portal', hi: 'अपना ताज़ा बिल देखें और आधिकारिक पोर्टल पर भुगतान करें', mr: 'तुमचे ताजे बिल पाहा आणि अधिकृत पोर्टलवर भरा', ta: 'உங்கள் சமீபத்திய பில்லைப் பார்த்து அதிகாரப்பூர்வ போர்ட்டலில் செலுத்துங்கள்' })],
    [`/services/${qs}#new-connection`,
      T(lang, { en: `New ${nm} connection`, hi: `नया ${nm} कनेक्शन`, mr: `नवीन ${nm} जोडणी`, ta: `புதிய ${nm} இணைப்பு` }),
      T(lang, { en: 'Charges, documents and the step-by-step apply process', hi: 'शुल्क, दस्तावेज़ और आवेदन की चरण-दर-चरण प्रक्रिया', mr: 'शुल्क, कागदपत्रे आणि टप्प्याटप्प्याने अर्ज प्रक्रिया', ta: 'கட்டணங்கள், ஆவணங்கள் மற்றும் படிப்படியான விண்ணப்ப செயல்முறை' })],
    [`/services/${qs}#complaint`,
      T(lang, { en: `Register a ${nm} complaint`, hi: `${nm} शिकायत दर्ज करें`, mr: `${nm} तक्रार नोंदवा`, ta: `${nm} புகாரைப் பதிவு செய்யுங்கள்` }),
      T(lang, { en: 'Log a no-power, billing or meter complaint with the DISCOM', hi: 'बिजली गुल, बिलिंग या मीटर की शिकायत डिस्कॉम में दर्ज करें', mr: 'वीज खंडित, बिलिंग किंवा मीटरची तक्रार डिस्कॉमकडे नोंदवा', ta: 'மின்சாரம் இல்லை, பில்லிங் அல்லது மீட்டர் புகாரை DISCOM-இல் பதிவு செய்யுங்கள்' })],
    [smrHref,
      T(lang, { en: `${nm} smart meter recharge`, hi: `${nm} स्मार्ट मीटर रिचार्ज`, mr: `${nm} स्मार्ट मीटर रिचार्ज`, ta: `${nm} ஸ்மார்ட் மீட்டர் ரீசார்ஜ்` }),
      T(lang, { en: 'How to recharge a prepaid smart meter online, with units-per-recharge estimates', hi: 'प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करने का तरीक़ा और यूनिट-अनुमान', mr: 'प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज कसे करावे, युनिट-अंदाजासह', ta: 'ப்ரீபெய்டு ஸ்மார்ட் மீட்டரை ஆன்லைனில் ரீசார்ஜ் செய்வது எப்படி, ரீசார்ஜுக்கான யூனிட் மதிப்பீடுகளுடன்' })],
  ];
  const heading = T(lang, { en: `${nm} quick links`, hi: `${nm} त्वरित लिंक`, mr: `${nm} जलद दुवे`, ta: `${nm} விரைவு இணைப்புகள்` });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <div class="seo-link-grid">
        ${links.map(([href, title, sub]) =>
          `<a class="seo-link-card" href="${href}"><strong>${title}</strong><span>${sub}</span></a>`).join('')}
      </div>
    </section>`;
}

// Contextual glossary links from each DISCOM page. Real anchor text into /glossary/#<term>
// (stronger topical signal than nav/footer boilerplate) that also genuinely helps a reader
// decode the charge lines they just saw in the tariff schedule above.
function glossaryLinksHtml(discom, lang = 'en') {
  const base = `${lang === 'en' ? '' : '/' + lang}/glossary/`;
  const nm = esc(discom.name);
  const terms = [
    ['fppa', T(lang, { en: 'FPPA (fuel surcharge)', hi: 'FPPA (ईंधन अधिभार)', mr: 'FPPA (इंधन अधिभार)', ta: 'FPPA (எரிபொருள் கட்டணம்)' })],
    ['fixed-charge', T(lang, { en: 'fixed charges', hi: 'फिक्स्ड चार्ज', mr: 'फिक्स्ड चार्ज', ta: 'நிலையான கட்டணங்கள்' })],
    ['telescopic-slabs', T(lang, { en: 'slab-wise rates', hi: 'स्लैब-वार दरें', mr: 'स्लॅबनिहाय दर', ta: 'அடுக்கு வாரியான விகிதங்கள்' })],
    ['sanctioned-load', T(lang, { en: 'sanctioned load', hi: 'स्वीकृत भार', mr: 'मंजूर भार', ta: 'அனுமதிக்கப்பட்ட சுமை' })],
    ['electricity-duty', T(lang, { en: 'electricity duty', hi: 'बिजली शुल्क', mr: 'वीज शुल्क', ta: 'மின் வரி' })],
  ];
  const links = terms.map(([slug, label]) => `<a href="${base}#${slug}">${label}</a>`).join(', ');
  const glossaryLabel = T(lang, { en: 'electricity bill glossary', hi: 'बिजली बिल शब्दावली', mr: 'वीज बिल शब्दावली', ta: 'மின் கட்டண சொற்களஞ்சியம்' });
  const heading = T(lang, { en: `Understand your ${nm} bill`, hi: `अपना ${nm} बिल समझें`, mr: `तुमचे ${nm} बिल समजून घ्या`, ta: `உங்கள் ${nm} பில்லைப் புரிந்துகொள்ளுங்கள்` });
  const body = T(lang, {
    en: `New to these charge lines? Our <a href="${base}">${glossaryLabel}</a> explains the terms on a ${nm} bill in plain language — including ${links}.`,
    hi: `ये शुल्क लाइनें नई लगती हैं? हमारी <a href="${base}">${glossaryLabel}</a> ${nm} बिल के शब्दों को आसान भाषा में समझाती है — जिनमें ${links} शामिल हैं।`,
    mr: `ह्या शुल्क ओळी नवीन वाटतात? आमची <a href="${base}">${glossaryLabel}</a> ${nm} बिलावरील शब्द सोप्या भाषेत समजावते — ${links} यांसह.`,
    ta: `இந்தக் கட்டண வரிகள் புதிதாக உள்ளதா? எங்கள் <a href="${base}">${glossaryLabel}</a> ஒரு ${nm} பில்லில் உள்ள சொற்களை எளிய மொழியில் விளக்குகிறது — ${links} உட்பட.` });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <p>${body}</p>
    </section>`;
}

// lang-suffixed guide field accessor: guideField(g, 'sections', 'mr') → g.sectionsMr.
const langSuffix = (lang) => lang.charAt(0).toUpperCase() + lang.slice(1);
const guideField = (g, base, lang) => (lang === 'en' ? g[base] : g[base + langSuffix(lang)]);
const guideHasBody = (g, lang) => (lang === 'en' ? !!g.sections : !!guideField(g, 'sections', lang));

// Related guides for a DISCOM page: guides tagged to this state first, then evergreen
// explainers to fill up to three cards. Links point into /<lang>/ only when a translation
// exists (untranslated guides link to the English page from every variant).
function guideLinksHtml(state, discom, lang = 'en') {
  const tagged = GUIDES.filter(g => (g.states || []).includes(state));
  const evergreen = GUIDES.filter(g => !(g.states || []).length && !tagged.includes(g));
  const picks = [...tagged, ...evergreen].slice(0, 3);
  if (!picks.length) return '';
  const cards = picks.map(g => {
    const href = (lang !== 'en' && guideHasBody(g, lang)) ? `/${lang}/guides/${g.slug}/` : `/guides/${g.slug}/`;
    const title = guideField(g, 'title', lang) || g.title;
    const mins = T(lang, { en: `${g.minutes} min read`, hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிட வாசிப்பு` });
    return `<a class="seo-link-card" href="${href}"><strong>${esc(title)}</strong><small>${mins}</small></a>`;
  }).join('');
  const allHref = `${lang === 'en' ? '' : '/' + lang}/guides/`;
  const heading = T(lang, { en: `Guides for ${esc(discom.name)} consumers`, hi: `${esc(discom.name)} बिल से जुड़ी गाइड`, mr: `${esc(discom.name)} ग्राहकांसाठी मार्गदर्शक`, ta: `${esc(discom.name)} நுகர்வோருக்கான வழிகாட்டிகள்` });
  const browseAll = T(lang, { en: 'Browse all guides →', hi: 'सभी गाइड देखें →', mr: 'सर्व मार्गदर्शक पहा →', ta: 'அனைத்து வழிகாட்டிகளையும் பார்க்கவும் →' });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <div class="seo-link-grid">${cards}</div>
      <p><a href="${allHref}">${browseAll}</a></p>
    </section>`;
}

// ── page builders ─────────────────────────────────────────────────────────────
function discomPage(state, discom, lang = 'en') {
  const stateSlug = slugify(state);
  const enUrl = `/tariffs/${stateSlug}/${discom.id}/`;
  const url = langUrl(enUrl, lang);
  const meta = STATE_META[state] || {};
  const fy = discom.tariffYear || 'FY 2025-26';
  const long = discom.fullName || discom.name;
  const { region, cities } = parseArea(discom.area);
  const dr = domesticRates(discom);
  const shared = sharesScheduleInState(state, discom);
  const cityPhrase = cities.length ? cities.slice(0, 3).join(', ') : region;

  if (lang !== 'en') return discomPageVernacular({ state, discom, stateSlug, enUrl, url, meta, fy, long, region, cities, dr, shared, cityPhrase, lang });

  // Which vernacular twins exist for this state (Hindi always; Marathi/Tamil only for their state).
  const altLangs = VERNACULARS.filter(l => langServesState(l, state));

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
    `${cname} Bill Calculator ${TITLE_YEAR} — Tariff & Rates`,
    `${cname} Bill Calculator ${TITLE_YEAR} — ${state} Tariff`,
    `${cname} Electricity Bill Calculator ${TITLE_YEAR}`,
  ]), [
    `${cname} Bill Calculator ${TITLE_YEAR}`,
    `${cname} Bill Calculator`,
  ]);
  const description = variant(seed + 'd', [
    `Calculate your ${discom.name} (${long}) electricity bill for ${fy}${cityPhrase ? ` in ${cityPhrase}` : ''}. Slab-wise rates, fixed charges, FPPA & duties.${dr ? ` Domestic from ${rupeeRate(dr.min)}/unit.` : ''} Free, no sign-up.`,
    `${discom.name} electricity bill calculator for ${state}${cityPhrase ? ` (${cityPhrase})` : ''}. ${fy} domestic & commercial slab rates, fixed/demand charges and an instant itemised estimate.`,
    `Free ${discom.name} bill estimate (${fy})${cityPhrase ? ` for ${cityPhrase} and across ${region || state}` : ''}. See the full tariff schedule, indicative monthly bills and pay-bill portal.`,
  ]);
  // H1 also leads with the searched "<name> Bill Calculator <year>" phrase (matching the title),
  // then varies the tail — region or the full legal name — for on-page uniqueness.
  const h1 = variant(seed + 'h', [
    `${esc(cname)} Bill Calculator ${TITLE_YEAR}${region ? ` — ${esc(region)}` : ''}`,
    `${esc(cname)} Bill Calculator ${TITLE_YEAR} — ${esc(yr)} Tariff`,
    `${esc(cname)} Electricity Bill Calculator ${TITLE_YEAR} — ${esc(long)}`,
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

  const cards = (discom.categories || []).map(c => categoryCardHtml(c)).join('') || '<p class="tx-muted">No categories listed.</p>';

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
    ${langSwitchLink(enUrl, 'en', altLangs)}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    <div class="tariff-discom-headrow seo-discom-head">
      <div>
        <div class="tariff-discom-name">${esc(long)}</div>
        ${discom.area ? `<div class="tariff-discom-area">Service area: ${esc(discom.area)}</div>` : ''}
      </div>
      <div class="tariff-badges">${badges.join('')}</div>
    </div>
    <p class="guide-meta">Tariffs last updated: ${tariffUpdated(state, 'en')}${meta.verified ? ' · ✓ verified against real bills' : ''}</p>
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
    title, description, canonical: SITE + url, page: enUrl, altLangs,
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

// Vernacular twin of discomPage (hi/mr/ta) — same data, native copy, links stay inside the
// language prefix where a twin exists. No phrasing variants needed: uniqueness comes from the
// data itself. Only emitted for languages scoped to this state (Marathi→MH, Tamil→TN, Hindi→all).
function discomPageVernacular({ state, discom, stateSlug, enUrl, url, meta, fy, long, region, cities, dr, shared, cityPhrase, lang }) {
  const sl = stateName(state, lang);
  const fyL = fyLabel(fy, lang);
  const nm = esc(discom.name);
  const cname = consumerName(discom);   // TNEB (TANGEDCO) / MVVNL (UPPCL) — leads title + H1
  const yr = yearLabel(fy);
  const pfx = `/${lang}`;
  const cityList3 = esc(cities.slice(0, 3).join(', '));
  const rgn = region || sl;

  const title = fitTitle(
    T(lang, { hi: `${cname} बिजली बिल कैलकुलेटर ${TITLE_YEAR} — टैरिफ`, mr: `${cname} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR} — टॅरिफ`, ta: `${cname} மின் கட்டண கணிப்பான் ${TITLE_YEAR} — கட்டணம்`, en: `${cname} Bill Calculator ${TITLE_YEAR}` }),
    [
      T(lang, { hi: `${cname} बिजली बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${cname} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${cname} மின் கட்டண கணிப்பான் ${TITLE_YEAR}`, en: `${cname} Bill Calculator ${TITLE_YEAR}` }),
      T(lang, { hi: `${cname} बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${cname} बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${cname} கட்டண கணிப்பான் ${TITLE_YEAR}`, en: `${cname} Bill Calculator` }),
    ]);
  const description = T(lang, {
    hi: `${cname} (${long}) का बिजली बिल ${fyL} के लिए निकालें${cityPhrase ? ` — ${cityPhrase}` : ''}। स्लैब दरें, फिक्स्ड चार्ज, FPPA व शुल्क।${dr ? ` घरेलू दर ${rupee(dr.min)}/यूनिट से।` : ''} मुफ़्त, बिना साइन-अप।`,
    mr: `${cname} (${long}) चे वीज बिल ${fyL} साठी काढा${cityPhrase ? ` — ${cityPhrase}` : ''}. स्लॅब दर, फिक्स्ड चार्ज, FPPA व शुल्क.${dr ? ` घरगुती दर ${rupee(dr.min)}/युनिट पासून.` : ''} मोफत, साइन-अप शिवाय.`,
    ta: `${cname} (${long}) மின் கட்டணத்தை ${fyL}-க்கு கணக்கிடுங்கள்${cityPhrase ? ` — ${cityPhrase}` : ''}. அடுக்கு விகிதங்கள், நிலையான கட்டணம், FPPA மற்றும் வரிகள்.${dr ? ` வீட்டு கட்டணம் ${rupee(dr.min)}/யூனிட் முதல்.` : ''} இலவசம், பதிவு தேவையில்லை.`,
    en: `Calculate your ${discom.name} bill for ${fy}.` });
  const h1 = T(lang, {
    hi: `${esc(cname)} बिजली बिल कैलकुलेटर व टैरिफ (${esc(fyL)})`,
    mr: `${esc(cname)} वीज बिल कॅल्क्युलेटर व टॅरिफ (${esc(fyL)})`,
    ta: `${esc(cname)} மின் கட்டண கணிப்பான் & கட்டணம் (${esc(fyL)})`,
    en: `${esc(cname)} Bill Calculator (${esc(fyL)})` });
  const leadTail = cities.length
    ? T(lang, { hi: `, ${cityList3} और पूरे ${esc(rgn)} के लिए`, mr: `, ${cityList3} आणि संपूर्ण ${esc(rgn)} साठी`, ta: `, ${cityList3} மற்றும் முழு ${esc(rgn)}-க்காக`, en: '' })
    : T(lang, { hi: ` — पूरे ${esc(rgn)} के लिए`, mr: ` — संपूर्ण ${esc(rgn)} साठी`, ta: ` — முழு ${esc(rgn)}-க்காக`, en: '' });
  const lead = T(lang, {
    hi: `अपना <strong>${esc(long)}</strong> बिल सेकंडों में अनुमानित करें और ${esc(fyL)} की पूरी टैरिफ अनुसूची देखें — ऊर्जा स्लैब, फिक्स्ड/डिमांड चार्ज, ईंधन अधिभार (FPPA) और बिजली शुल्क${leadTail}।`,
    mr: `तुमचे <strong>${esc(long)}</strong> बिल काही सेकंदांत अंदाजित करा आणि ${esc(fyL)} ची संपूर्ण टॅरिफ अनुसूची पाहा — ऊर्जा स्लॅब, फिक्स्ड/डिमांड चार्ज, इंधन अधिभार (FPPA) आणि वीज शुल्क${leadTail}.`,
    ta: `உங்கள் <strong>${esc(long)}</strong> கட்டணத்தை சில நொடிகளில் மதிப்பிடுங்கள், ${esc(fyL)}-இன் முழு கட்டண அட்டவணையையும் பாருங்கள் — மின் அடுக்குகள், நிலையான/தேவை கட்டணம், எரிபொருள் கட்டணம் (FPPA) மற்றும் மின் வரி${leadTail}.`,
    en: '' });

  const badges = [];
  if (meta.verified) badges.push(`<span class="tariff-badge verified">${T(lang, { hi: '✓ सत्यापित दरें', mr: '✓ पडताळलेले दर', ta: '✓ சரிபார்க்கப்பட்ட விகிதங்கள்', en: '✓ Verified rates' })}</span>`);
  badges.push(`<span class="tariff-badge">${esc(fyL)}</span>`);
  if (region) badges.push(`<span class="tariff-badge">${esc(region)}</span>`);
  const src = discom.website || meta.sourceUrl;

  const noCats = T(lang, { hi: 'कोई श्रेणी सूचीबद्ध नहीं।', mr: 'कोणतीही श्रेणी सूचीबद्ध नाही.', ta: 'எந்த வகையும் பட்டியலிடப்படவில்லை.', en: 'No categories listed.' });
  const cards = (discom.categories || []).map(c => categoryCardHtml(c, lang)).join('') || `<p class="tx-muted">${noCats}</p>`;

  const siblings = getDiscoms(state).filter(d => d.id !== discom.id);
  const siblingHead = T(lang, { hi: `${esc(sl)} के अन्य डिस्कॉम`, mr: `${esc(sl)} मधील इतर डिस्कॉम`, ta: `${esc(sl)} இல் உள்ள பிற DISCOM-கள்`, en: `Other DISCOMs in ${esc(sl)}` });
  const siblingHtml = siblings.length ? `
    <section class="seo-section">
      <h2>${siblingHead}</h2>
      <div class="seo-link-grid">
        ${siblings.map(d => { const a = parseArea(d.area); return `<a class="seo-link-card" href="${pfx}/tariffs/${stateSlug}/${d.id}/"><strong>${esc(d.name)}</strong><span>${esc(d.fullName || '')}</span>${a.region ? `<small>${esc(a.region)}</small>` : ''}</a>`; }).join('')}
      </div>
    </section>` : '';

  const sharedNote = shared
    ? `<p class="seo-note">${T(lang, {
        hi: `${nm} पर वही राज्यव्यापी ${esc(fyL)} टैरिफ अनुसूची लागू है जो ${esc(sl)} के बाक़ी डिस्कॉम पर (राज्य नियामक द्वारा निर्धारित)। कंपनियों में अंतर <strong>सेवा क्षेत्र</strong>, बिलिंग पोर्टल और संपर्क विवरण का है, जो नीचे दिए हैं।`,
        mr: `${nm} वर तीच राज्यव्यापी ${esc(fyL)} टॅरिफ अनुसूची लागू आहे जी ${esc(sl)} मधील इतर डिस्कॉमवर (राज्य नियामकाने ठरवलेली). कंपन्यांमधील फरक <strong>सेवा क्षेत्र</strong>, बिलिंग पोर्टल आणि संपर्क तपशिलाचा आहे, जे खाली दिले आहेत.`,
        ta: `${nm}-க்கு ${esc(sl)} இல் உள்ள பிற DISCOM-களுக்குப் பொருந்தும் அதே மாநில அளவிலான ${esc(fyL)} கட்டண அட்டவணையே பொருந்தும் (மாநில ஒழுங்குமுறையாளரால் நிர்ணயிக்கப்பட்டது). நிறுவனங்களுக்கிடையேயான வேறுபாடு <strong>சேவைப் பகுதி</strong>, பில்லிங் போர்ட்டல் மற்றும் தொடர்பு விவரங்கள் — கீழே கொடுக்கப்பட்டுள்ளன.`,
        en: '' })}</p>`
    : '';

  const calcHref = `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`;
  const host = esc(String(discom.website || '').replace(/^https?:\/\//, ''));
  const faqs = [];
  faqs.push({
    q: T(lang, { hi: `${discom.name} बिजली बिल कैसे निकालें?`, mr: `${discom.name} वीज बिल कसे काढावे?`, ta: `${discom.name} மின் கட்டணத்தை எப்படிக் கணக்கிடுவது?`, en: `How do I calculate my ${discom.name} bill?` }),
    a: T(lang, {
      hi: `<a href="${calcHref}">${nm} बिल कैलकुलेटर</a> खोलें, अपनी खपत (यूनिट) और स्वीकृत भार डालें — यह ${esc(fyL)} की ${nm} स्लैब दरें, फिक्स्ड चार्ज${meta.verified ? ', FPPA और बिजली शुल्क' : ' और अन्य शुल्क'} लगाकर मदवार अनुमानित बिल देता है।`,
      mr: `<a href="${calcHref}">${nm} बिल कॅल्क्युलेटर</a> उघडा, तुमचा वापर (युनिट) आणि मंजूर भार टाका — हे ${esc(fyL)} च्या ${nm} स्लॅब दर, फिक्स्ड चार्ज${meta.verified ? ', FPPA आणि वीज शुल्क' : ' आणि इतर शुल्क'} लावून तपशीलवार अंदाजित बिल देते.`,
      ta: `<a href="${calcHref}">${nm} கட்டண கணிப்பானை</a> திறந்து, உங்கள் நுகர்வு (யூனிட்) மற்றும் அனுமதிக்கப்பட்ட சுமையை உள்ளிடுங்கள் — இது ${esc(fyL)} இன் ${nm} அடுக்கு விகிதங்கள், நிலையான கட்டணம்${meta.verified ? ', FPPA மற்றும் மின் வரி' : ' மற்றும் பிற கட்டணங்கள்'} சேர்த்து விவரமான தோராயமான பில்லைக் கொடுக்கிறது.`,
      en: '' }) });
  if (cities.length) faqs.push({
    q: T(lang, { hi: `${discom.name} किन क्षेत्रों और शहरों में बिजली देती है?`, mr: `${discom.name} कोणत्या भागात व शहरांत वीज पुरवते?`, ta: `${discom.name} எந்தப் பகுதிகள் மற்றும் நகரங்களில் மின்சாரம் வழங்குகிறது?`, en: '' }),
    a: T(lang, {
      hi: `${nm} (${esc(long)}) ${region ? esc(region) + ' — ' : ''}${esc(cities.join(', '))} में बिजली आपूर्ति करती है।`,
      mr: `${nm} (${esc(long)}) ${region ? esc(region) + ' — ' : ''}${esc(cities.join(', '))} मध्ये वीज पुरवते.`,
      ta: `${nm} (${esc(long)}) ${region ? esc(region) + ' — ' : ''}${esc(cities.join(', '))} இல் மின்சாரம் வழங்குகிறது.`,
      en: '' }) });
  if (dr) faqs.push({
    q: T(lang, { hi: `${discom.name} पर सबसे सस्ती घरेलू बिजली दर क्या है?`, mr: `${discom.name} वर सर्वात स्वस्त घरगुती वीज दर किती आहे?`, ta: `${discom.name} இல் மலிவான வீட்டு மின் கட்டணம் என்ன?`, en: '' }),
    a: T(lang, {
      hi: `${nm} का घरेलू ऊर्जा शुल्क ${rupee(dr.min)} प्रति यूनिट से शुरू होकर सबसे ऊँचे स्लैब में ${rupee(dr.max)} प्रति यूनिट तक जाता है (${esc(dr.catName)}), साथ में मासिक फिक्स्ड चार्ज${meta.verified ? '' : ' (नवीनतम उपलब्ध अनुमान)'}। पूरी स्लैब तालिका ऊपर है।`,
      mr: `${nm} चे घरगुती ऊर्जा शुल्क ${rupee(dr.min)} प्रति युनिटपासून सुरू होऊन सर्वात वरच्या स्लॅबमध्ये ${rupee(dr.max)} प्रति युनिटपर्यंत जाते (${esc(dr.catName)}), सोबत मासिक फिक्स्ड चार्ज${meta.verified ? '' : ' (नवीनतम उपलब्ध अंदाज)'}. संपूर्ण स्लॅब तक्ता वर आहे.`,
      ta: `${nm} இன் வீட்டு மின் கட்டணம் ஒரு யூனிட்டுக்கு ${rupee(dr.min)} முதல் தொடங்கி மிக உயர்ந்த அடுக்கில் ஒரு யூனிட்டுக்கு ${rupee(dr.max)} வரை உயர்கிறது (${esc(dr.catName)}), மாதாந்திர நிலையான கட்டணத்துடன்${meta.verified ? '' : ' (சமீபத்திய கிடைக்கும் மதிப்பீடு)'}. முழு அடுக்கு அட்டவணை மேலே உள்ளது.`,
      en: '' }) });
  if (discom.website) faqs.push({
    q: T(lang, { hi: `${discom.name} बिजली बिल ऑनलाइन कैसे भरें?`, mr: `${discom.name} वीज बिल ऑनलाइन कसे भरावे?`, ta: `${discom.name} மின் கட்டணத்தை ஆன்லைனில் எப்படிச் செலுத்துவது?`, en: '' }),
    a: T(lang, {
      hi: `आधिकारिक ${nm} पोर्टल <a href="${attr(discom.website)}" target="_blank" rel="noopener">${host}</a> पर भुगतान करें। पहले इस पेज से जाँचें कि बिल कितना होना चाहिए, फिर आधिकारिक स्रोत पर भरें।`,
      mr: `अधिकृत ${nm} पोर्टल <a href="${attr(discom.website)}" target="_blank" rel="noopener">${host}</a> वर भरा. आधी या पेजवरून तपासा की बिल किती असावे, मग अधिकृत स्रोतावर भरा.`,
      ta: `அதிகாரப்பூர்வ ${nm} போர்ட்டல் <a href="${attr(discom.website)}" target="_blank" rel="noopener">${host}</a> இல் செலுத்துங்கள். முதலில் இந்தப் பக்கத்தில் பில் எவ்வளவு இருக்க வேண்டும் எனச் சரிபார்த்து, பிறகு அதிகாரப்பூர்வ ஆதாரத்தில் செலுத்துங்கள்.`,
      en: '' }) });
  if (discom.lpscRate != null) faqs.push({
    q: T(lang, { hi: `${discom.name} का विलंब भुगतान अधिभार (LPSC) कितना है?`, mr: `${discom.name} चा विलंब भरणा अधिभार (LPSC) किती आहे?`, ta: `${discom.name} இன் தாமத கட்டண மிகைக்கட்டணம் (LPSC) எவ்வளவு?`, en: '' }),
    a: T(lang, {
      hi: `${nm} बकाया राशि पर ${discom.lpscRate}% प्रति माह का विलंब भुगतान अधिभार लगाती है। हमारा कैलकुलेटर LPSC और बकाया जोड़कर कुल देय राशि का अनुमान दे सकता है।`,
      mr: `${nm} थकीत रकमेवर दरमहा ${discom.lpscRate}% विलंब भरणा अधिभार लावते. आमचे कॅल्क्युलेटर LPSC आणि थकबाकी जोडून एकूण देय रकमेचा अंदाज देऊ शकते.`,
      ta: `${nm} நிலுவைத் தொகைக்கு மாதம் ${discom.lpscRate}% தாமத கட்டண மிகைக்கட்டணம் விதிக்கிறது. எங்கள் கணிப்பான் LPSC மற்றும் நிலுவைத் தொகையைச் சேர்த்து மொத்த செலுத்த வேண்டிய தொகையை மதிப்பிடும்.`,
      en: '' }) });

  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const bcTariffs = T(lang, { hi: 'टैरिफ', mr: 'टॅरिफ', ta: 'கட்டணங்கள்', en: 'Tariffs' });
  const areaPrefix = T(lang, { hi: 'सेवा क्षेत्र:', mr: 'सेवा क्षेत्र:', ta: 'சேவைப் பகுதி:', en: 'Service area:' });
  const updated = T(lang, {
    hi: `टैरिफ अंतिम अपडेट: ${tariffUpdated(state, 'hi')}${meta.verified ? ' · ✓ असली बिलों से सत्यापित' : ''}`,
    mr: `टॅरिफ शेवटचे अपडेट: ${tariffUpdated(state, 'mr')}${meta.verified ? ' · ✓ खऱ्या बिलांवरून पडताळलेले' : ''}`,
    ta: `கட்டணங்கள் கடைசியாக புதுப்பிக்கப்பட்டது: ${tariffUpdated(state, 'ta')}${meta.verified ? ' · ✓ உண்மையான பில்களுடன் சரிபார்க்கப்பட்டது' : ''}`,
    en: '' });
  const sourceLink = T(lang, { hi: `आधिकारिक ${nm} स्रोत ↗`, mr: `अधिकृत ${nm} स्रोत ↗`, ta: `அதிகாரப்பூர்வ ${nm} ஆதாரம் ↗`, en: '' });
  const openCta = T(lang, { hi: `${nm} बिल कैलकुलेटर खोलें →`, mr: `${nm} बिल कॅल्क्युलेटर उघडा →`, ta: `${nm} கட்டண கணிப்பானைத் திறக்கவும் →`, en: '' });
  const schedHead = T(lang, { hi: `${nm} टैरिफ अनुसूची (${esc(fyL)})`, mr: `${nm} टॅरिफ अनुसूची (${esc(fyL)})`, ta: `${nm} கட்டண அட்டவணை (${esc(fyL)})`, en: '' });
  const disclaimer = T(lang, {
    hi: `आँकड़े सार्वजनिक रूप से उपलब्ध ${esc(sl)} टैरिफ आदेशों पर आधारित अनुमानित हैं। हमेशा अपने आधिकारिक ${nm} बिल से मिलान करें — दरें उप-श्रेणी, स्लैब और शहर के अनुसार बदलती हैं।`,
    mr: `आकडेवारी सार्वजनिकरित्या उपलब्ध ${esc(sl)} टॅरिफ आदेशांवर आधारित अंदाजित आहे. नेहमी तुमच्या अधिकृत ${nm} बिलाशी ताळमेळ करा — दर उप-श्रेणी, स्लॅब आणि शहरानुसार बदलतात.`,
    ta: `புள்ளிவிவரங்கள் பொதுவில் கிடைக்கும் ${esc(sl)} கட்டண ஆணைகளை அடிப்படையாகக் கொண்ட தோராயமானவை. எப்போதும் உங்கள் அதிகாரப்பூர்வ ${nm} பில்லுடன் சரிபார்க்கவும் — விகிதங்கள் துணை வகை, அடுக்கு மற்றும் நகரத்திற்கு ஏற்ப மாறுபடும்.`,
    en: '' });

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: bcHome, url: '/' },
      { name: bcTariffs, url: `${pfx}/tariffs/states/` },
      { name: sl, url: `${pfx}/tariffs/${stateSlug}/` },
      { name: discom.name, url: null },
    ])}
    ${langSwitchLink(enUrl, lang)}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    <div class="tariff-discom-headrow seo-discom-head">
      <div>
        <div class="tariff-discom-name">${esc(long)}</div>
        ${discom.area ? `<div class="tariff-discom-area">${areaPrefix} ${esc(discom.area)}</div>` : ''}
      </div>
      <div class="tariff-badges">${badges.join('')}</div>
    </div>
    <p class="guide-meta">${updated}</p>
    ${src ? `<p><a class="tariff-source" href="${attr(src)}" target="_blank" rel="noopener">${sourceLink}</a></p>` : ''}
    <p class="seo-cta-row"><a class="seo-cta" href="${calcHref}">${openCta}</a></p>

    ${discomServiceLinksHtml(state, discom, lang)}

    ${keyFactsHtml(state, discom, fy, lang)}
    ${areaServedHtml(discom, lang)}
    ${indicativeBillsHtml(state, discom, lang)}

    <section class="seo-section">
      <h2>${schedHead}</h2>
      ${sharedNote}
      <div class="tariff-cards">${cards}</div>
    </section>

    ${glossaryLinksHtml(discom, lang)}
    ${guideLinksHtml(state, discom, lang)}
    ${siblingHtml}
    ${faqHtml(faqs, lang)}
    <p class="seo-disclaimer">${disclaimer}</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    altLangs: VERNACULARS.filter(l => langServesState(l, state)),
    jsonld: [
      breadcrumbJsonLd([
        { name: bcHome, url: '/' },
        { name: bcTariffs, url: `${pfx}/tariffs/states/` },
        { name: sl, url: `${pfx}/tariffs/${stateSlug}/` },
        { name: discom.name, url },
      ]),
      faqJsonLd(faqs),
    ],
    body,
  });
}

function statePage(state, lang = 'en') {
  const stateSlug = slugify(state);
  const enUrl = `/tariffs/${stateSlug}/`;
  const url = langUrl(enUrl, lang);
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
  const altLangs = VERNACULARS.filter(l => langServesState(l, state));

  if (lang !== 'en') {
    const sl = stateName(state, lang);
    const fyL = fyLabel(fy, lang);
    const yr = yearLabel(fy);
    const nd = discoms.length;
    const many = nd > 1;
    const pfx = `/${lang}`;
    const title = fitTitle(
      T(lang, { hi: `${sl} बिजली बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${sl} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${sl} மின் கட்டண கணிப்பான் ${TITLE_YEAR}`, en: '' }), [
      T(lang, { hi: `${sl} बिजली टैरिफ ${yr}`, mr: `${sl} वीज टॅरिफ ${yr}`, ta: `${sl} மின் கட்டணம் ${yr}`, en: '' }),
      T(lang, { hi: `${sl} बिजली टैरिफ`, mr: `${sl} वीज टॅरिफ`, ta: `${sl} மின் கட்டணம்`, en: '' }),
    ]);
    const description = T(lang, {
      hi: `${sl} की ${fyL} स्लैब दरें देखें और 30 सेकंड में अपना सटीक बिजली बिल निकालें। ${nd} डिस्कॉम (${names}) — फिक्स्ड चार्ज व FPPA सहित।${stateMin != null ? ` घरेलू दर ${rupee(stateMin)}/यूनिट से।` : ''} मुफ़्त, बिना साइन-अप।`,
      mr: `${sl} चे ${fyL} स्लॅब दर पाहा आणि 30 सेकंदांत तुमचे नेमके वीज बिल काढा. ${nd} डिस्कॉम (${names}) — फिक्स्ड चार्ज व FPPA सह.${stateMin != null ? ` घरगुती दर ${rupee(stateMin)}/युनिट पासून.` : ''} मोफत, साइन-अप शिवाय.`,
      ta: `${sl} இன் ${fyL} அடுக்கு விகிதங்களைப் பாருங்கள், 30 விநாடிகளில் உங்கள் சரியான மின் கட்டணத்தைக் கணக்கிடுங்கள். ${nd} DISCOM (${names}) — நிலையான கட்டணம் & FPPA உடன்.${stateMin != null ? ` வீட்டு கட்டணம் ${rupee(stateMin)}/யூனிட் முதல்.` : ''} இலவசம், பதிவு தேவையில்லை.`,
      en: '' });
    const discomCards = discoms.map(d => {
      const a = parseArea(d.area);
      return `
      <a class="seo-link-card" href="${pfx}/tariffs/${stateSlug}/${d.id}/">
        <strong>${esc(d.name)}</strong>
        <span>${esc(d.fullName || '')}</span>
        ${a.region ? `<small>${esc(a.region)}${a.cities.length ? ` — ${esc(a.cities.slice(0, 3).join(', '))}` : ''}</small>` : ''}
      </a>`;
    }).join('');
    const discomInline = discoms.map(d => { const a = parseArea(d.area); return `<strong>${esc(d.name)}</strong>${a.region ? ` (${esc(a.region)}${a.cities.length ? ` — ${esc(a.cities.slice(0, 3).join(', '))}` : ''})` : ''}`; }).join('; ');
    const faqs = [];
    faqs.push({
      q: T(lang, { hi: `${sl} में बिजली बिल कैसे निकाला जाता है?`, mr: `${sl} मध्ये वीज बिल कसे काढले जाते?`, ta: `${sl} இல் மின் கட்டணம் எப்படிக் கணக்கிடப்படுகிறது?`, en: '' }),
      a: T(lang, {
        hi: `${esc(sl)} के बिल में स्लैब-वार ऊर्जा शुल्क, प्रति kW (या kVA) फिक्स्ड/डिमांड चार्ज, ईंधन व विद्युत क्रय समायोजन (FPPA) और बिजली शुल्क जुड़ते हैं। अपने डिस्कॉम का मदवार अनुमानित बिल पाने के लिए हमारा <a href="/#calculator">मुफ़्त कैलकुलेटर</a> इस्तेमाल करें।`,
        mr: `${esc(sl)} च्या बिलात स्लॅब-निहाय ऊर्जा शुल्क, प्रति kW (किंवा kVA) फिक्स्ड/डिमांड चार्ज, इंधन व वीज खरेदी समायोजन (FPPA) आणि वीज शुल्क जोडले जातात. तुमच्या डिस्कॉमचे तपशीलवार अंदाजित बिल मिळवण्यासाठी आमचे <a href="/#calculator">मोफत कॅल्क्युलेटर</a> वापरा.`,
        ta: `${esc(sl)} பில்களில் அடுக்கு வாரியான மின் கட்டணம், ஒரு kW (அல்லது kVA)-க்கு நிலையான/தேவை கட்டணம், எரிபொருள் & மின் கொள்முதல் சரிசெய்தல் (FPPA) மற்றும் மின் வரி சேர்க்கப்படுகின்றன. உங்கள் DISCOM-க்கான விவரமான தோராயமான பில்லைப் பெற எங்கள் <a href="/#calculator">இலவச கணிப்பானை</a> பயன்படுத்துங்கள்.`,
        en: '' }) });
    faqs.push({
      q: T(lang, { hi: `${sl} में मेरे इलाक़े में कौन-सी बिजली वितरण कंपनी है?`, mr: `${sl} मध्ये माझ्या भागात कोणती वीज वितरण कंपनी आहे?`, ta: `${sl} இல் என் பகுதியில் எந்த மின் விநியோக நிறுவனம் உள்ளது?`, en: '' }),
      a: T(lang, {
        hi: `${esc(sl)} में ${nd} डिस्कॉम ${many ? 'हैं' : 'है'}: ${discomInline}। पूरी टैरिफ और अनुमानित बिल के लिए ऊपर अपना डिस्कॉम खोलें।`,
        mr: `${esc(sl)} मध्ये ${nd} डिस्कॉम ${many ? 'आहेत' : 'आहे'}: ${discomInline}. संपूर्ण टॅरिफ आणि अंदाजित बिलासाठी वर तुमचा डिस्कॉम उघडा.`,
        ta: `${esc(sl)} இல் ${nd} DISCOM உள்ளன: ${discomInline}. முழு கட்டணம் மற்றும் தோராயமான பில்லுக்கு மேலே உங்கள் DISCOM-ஐத் திறக்கவும்.`,
        en: '' }) });
    if (stateMin != null) faqs.push({
      q: T(lang, { hi: `${sl} में सबसे सस्ती घरेलू बिजली दर क्या है?`, mr: `${sl} मध्ये सर्वात स्वस्त घरगुती वीज दर किती आहे?`, ta: `${sl} இல் மலிவான வீட்டு மின் கட்டணம் என்ன?`, en: '' }),
      a: T(lang, {
        hi: `${esc(sl)} के डिस्कॉम में सबसे कम घरेलू ऊर्जा शुल्क लगभग ${rupee(stateMin)} प्रति यूनिट (सबसे निचला स्लैब) से शुरू होता है — फिक्स्ड चार्ज, FPPA और शुल्क अलग। सटीक दरें आपके डिस्कॉम और खपत स्लैब पर निर्भर हैं।`,
        mr: `${esc(sl)} च्या डिस्कॉममध्ये सर्वात कमी घरगुती ऊर्जा शुल्क अंदाजे ${rupee(stateMin)} प्रति युनिट (सर्वात खालचा स्लॅब) पासून सुरू होते — फिक्स्ड चार्ज, FPPA आणि शुल्क वेगळे. नेमके दर तुमच्या डिस्कॉम आणि वापर स्लॅबवर अवलंबून आहेत.`,
        ta: `${esc(sl)} DISCOM-களில் மிகக் குறைந்த வீட்டு மின் கட்டணம் சுமார் ${rupee(stateMin)} ஒரு யூனிட்டுக்கு (குறைந்த அடுக்கு) தொடங்குகிறது — நிலையான கட்டணம், FPPA மற்றும் வரி தனி. சரியான விகிதங்கள் உங்கள் DISCOM மற்றும் நுகர்வு அடுக்கைப் பொறுத்தது.`,
        en: '' }) });
    faqs.push({
      q: T(lang, { hi: `${sl} का वर्तमान बिजली टैरिफ वर्ष क्या है?`, mr: `${sl} चे सध्याचे वीज टॅरिफ वर्ष कोणते आहे?`, ta: `${sl} இன் தற்போதைய மின் கட்டண ஆண்டு எது?`, en: '' }),
      a: T(lang, {
        hi: `दिखाई गई दरें ${esc(fyL)} की हैं${meta.verified ? ', प्रकाशित टैरिफ आदेश से सत्यापित' : ' (नवीनतम उपलब्ध)'}।`,
        mr: `दाखवलेले दर ${esc(fyL)} चे आहेत${meta.verified ? ', प्रकाशित टॅरिफ आदेशावरून पडताळलेले' : ' (नवीनतम उपलब्ध)'}.`,
        ta: `காட்டப்பட்ட விகிதங்கள் ${esc(fyL)}-ஐச் சேர்ந்தவை${meta.verified ? ', வெளியிடப்பட்ட கட்டண ஆணையிலிருந்து சரிபார்க்கப்பட்டது' : ' (சமீபத்திய கிடைக்கும்)'}.`,
        en: '' }) });

    const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
    const bcTariffs = T(lang, { hi: 'टैरिफ', mr: 'टॅरिफ', ta: 'கட்டணங்கள்', en: 'Tariffs' });
    const h1 = T(lang, { hi: `${esc(sl)} बिजली बिल कैलकुलेटर व डिस्कॉम टैरिफ (${esc(fyL)})`, mr: `${esc(sl)} वीज बिल कॅल्क्युलेटर व डिस्कॉम टॅरिफ (${esc(fyL)})`, ta: `${esc(sl)} மின் கட்டண கணிப்பான் & DISCOM கட்டணம் (${esc(fyL)})`, en: '' });
    const updated = T(lang, {
      hi: `टैरिफ अंतिम अपडेट: ${tariffUpdated(state, 'hi')}${meta.verified ? ' · ✓ असली बिलों से सत्यापित' : ''}`,
      mr: `टॅरिफ शेवटचे अपडेट: ${tariffUpdated(state, 'mr')}${meta.verified ? ' · ✓ खऱ्या बिलांवरून पडताळलेले' : ''}`,
      ta: `கட்டணங்கள் கடைசியாக புதுப்பிக்கப்பட்டது: ${tariffUpdated(state, 'ta')}${meta.verified ? ' · ✓ உண்மையான பில்களுடன் சரிபார்க்கப்பட்டது' : ''}`,
      en: '' });
    const lead = T(lang, {
      hi: `${esc(sl)} की ${nd} वितरण कंपन${many ? 'ियों' : 'ी'} — ${esc(names)} — में से किसी का भी अनुमानित बिजली बिल निकालें, ${esc(fyL)} के पूरे स्लैब-वार विवरण के साथ${cityLine ? ` — ${esc(cityLine)} समेत` : ''}।`,
      mr: `${esc(sl)} च्या ${nd} वितरण कंपन${many ? '्यांपैकी' : 'ीपैकी'} — ${esc(names)} — कोणत्याही एकाचे अंदाजित वीज बिल काढा, ${esc(fyL)} च्या संपूर्ण स्लॅब-निहाय तपशिलासह${cityLine ? ` — ${esc(cityLine)} सह` : ''}.`,
      ta: `${esc(sl)} இன் ${nd} விநியோக நிறுவனங்களில் — ${esc(names)} — எதற்கும் தோராயமான மின் கட்டணத்தைக் கணக்கிடுங்கள், ${esc(fyL)} இன் முழு அடுக்கு வாரியான விவரங்களுடன்${cityLine ? ` — ${esc(cityLine)} உட்பட` : ''}.`,
      en: '' });
    const cta = T(lang, { hi: `${esc(sl)} बिल कैलकुलेटर खोलें →`, mr: `${esc(sl)} बिल कॅल्क्युलेटर उघडा →`, ta: `${esc(sl)} கட்டண கணிப்பானைத் திறக்கவும் →`, en: '' });
    const discomsHead = T(lang, { hi: `${esc(sl)} के बिजली डिस्कॉम`, mr: `${esc(sl)} मधील वीज डिस्कॉम`, ta: `${esc(sl)} இல் மின் DISCOM-கள்`, en: '' });
    const discomsIntro = T(lang, {
      hi: `अपनी वितरण कंपनी चुनें — उसकी ${esc(fyL)} टैरिफ अनुसूची, सेवा क्षेत्र और अनुमानित मासिक बिल देखें।`,
      mr: `तुमची वितरण कंपनी निवडा — तिची ${esc(fyL)} टॅरिफ अनुसूची, सेवा क्षेत्र आणि अंदाजित मासिक बिल पाहा.`,
      ta: `உங்கள் விநியோக நிறுவனத்தைத் தேர்ந்தெடுங்கள் — அதன் ${esc(fyL)} கட்டண அட்டவணை, சேவைப் பகுதி மற்றும் தோராயமான மாதாந்திர பில்லைப் பாருங்கள்.`,
      en: '' });
    const srcNote = meta.sourceUrl ? T(lang, {
      hi: ` (स्रोत: <a href="${attr(meta.sourceUrl)}" target="_blank" rel="noopener">${esc(String(meta.sourceUrl).replace(/^https?:\/\//, ''))}</a>)`,
      mr: ` (स्रोत: <a href="${attr(meta.sourceUrl)}" target="_blank" rel="noopener">${esc(String(meta.sourceUrl).replace(/^https?:\/\//, ''))}</a>)`,
      ta: ` (ஆதாரம்: <a href="${attr(meta.sourceUrl)}" target="_blank" rel="noopener">${esc(String(meta.sourceUrl).replace(/^https?:\/\//, ''))}</a>)`,
      en: '' }) : '';
    const disclaimer = T(lang, {
      hi: `सार्वजनिक रूप से उपलब्ध ${esc(sl)} टैरिफ आदेशों पर आधारित अनुमानित आँकड़े${srcNote}। अपने आधिकारिक बिल से मिलान करें — दरें उप-श्रेणी, स्लैब और शहर के अनुसार बदलती हैं।`,
      mr: `सार्वजनिकरित्या उपलब्ध ${esc(sl)} टॅरिफ आदेशांवर आधारित अंदाजित आकडेवारी${srcNote}. तुमच्या अधिकृत बिलाशी ताळमेळ करा — दर उप-श्रेणी, स्लॅब आणि शहरानुसार बदलतात.`,
      ta: `பொதுவில் கிடைக்கும் ${esc(sl)} கட்டண ஆணைகளை அடிப்படையாகக் கொண்ட தோராயமான புள்ளிவிவரங்கள்${srcNote}. உங்கள் அதிகாரப்பூர்வ பில்லுடன் சரிபார்க்கவும் — விகிதங்கள் துணை வகை, அடுக்கு மற்றும் நகரத்திற்கு ஏற்ப மாறுபடும்.`,
      en: '' });

    const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: bcHome, url: '/' },
      { name: bcTariffs, url: `${pfx}/tariffs/states/` },
      { name: sl, url: null },
    ])}
    ${langSwitchLink(enUrl, lang, altLangs)}
    <h1>${h1}</h1>
    <p class="guide-meta">${updated}</p>
    <p class="seo-lead">${lead}</p>
    <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">${cta}</a></p>

    <section class="seo-section">
      <h2>${discomsHead}</h2>
      <p>${discomsIntro}</p>
      <div class="seo-link-grid">${discomCards}</div>
    </section>

    ${faqHtml(faqs, lang)}
    <p class="seo-disclaimer">${disclaimer}</p>
  </section>`;

    return layout({
      title, description, canonical: SITE + url, page: enUrl, lang, altLangs,
      jsonld: [
        breadcrumbJsonLd([
          { name: bcHome, url: '/' },
          { name: bcTariffs, url: `${pfx}/tariffs/states/` },
          { name: sl, url },
        ]),
        faqJsonLd(faqs),
      ],
      body,
    });
  }

  // ≤ ~60 chars, keyword-first, no brand suffix (see the note above the DISCOM-page title).
  const title = fitTitle(variant(seed, [
    `${state} Electricity Bill Calculator ${TITLE_YEAR}`,
    `${state} Electricity Tariff ${fy} — Bill Calculator`,
    `${state} DISCOM Tariffs & Bill Calculator ${TITLE_YEAR}`,
  ]), [
    `${state} Electricity Tariff ${fy}`,
    `${state} Tariff ${fy}`,
  ]);
  const description = variant(seed + 'd', [
    `Check ${state}'s ${fy} slab rates & calculate your exact electricity bill in 30 seconds. ${discoms.length} DISCOM${discoms.length > 1 ? 's' : ''} with fixed charges & FPPA${stateMin != null ? `, domestic from ${rupee(stateMin)}/unit` : ''}. Free, no sign-up.`,
    `See what electricity costs in ${state} (${fy})${cityLine ? ` — ${cityLine} & more` : ''}. Pick your DISCOM for its full slab table and an instant itemised bill. Free, no sign-up.`,
    `${state} electricity tariff ${fy}: compare ${names}${stateMin != null ? `, rates from ${rupee(stateMin)}/unit,` : ''} and get your exact bill in seconds. Free, no sign-up.`,
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
    ${langSwitchLink(enUrl, 'en', altLangs)}
    <h1>${esc(state)} Electricity Bill Calculator ${TITLE_YEAR} &amp; DISCOM Tariffs (${esc(fy)})</h1>
    <p class="guide-meta">Tariffs last updated: ${tariffUpdated(state, 'en')}${meta.verified ? ' · ✓ verified against real bills' : ''}</p>
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
    title, description, canonical: SITE + url, page: enUrl, altLangs,
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
  { en: 'North India', hi: 'उत्तर भारत', mr: 'उत्तर भारत', ta: 'வட இந்தியா', color: '#2563eb', states: ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Ladakh', 'Punjab', 'Chandigarh', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'] },
  { en: 'South India', hi: 'दक्षिण भारत', mr: 'दक्षिण भारत', ta: 'தென் இந்தியா', color: '#0d9488', states: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Puducherry', 'Tamil Nadu', 'Telangana'] },
  { en: 'West India', hi: 'पश्चिम भारत', mr: 'पश्चिम भारत', ta: 'மேற்கு இந்தியா', color: '#d97706', states: ['Dadra & Nagar Haveli and Daman & Diu', 'Goa', 'Gujarat', 'Maharashtra'] },
  { en: 'Central India', hi: 'मध्य भारत', mr: 'मध्य भारत', ta: 'மத்திய இந்தியா', color: '#7c3aed', states: ['Chhattisgarh', 'Madhya Pradesh'] },
  { en: 'East India', hi: 'पूर्व भारत', mr: 'पूर्व भारत', ta: 'கிழக்கு இந்தியா', color: '#e11d48', states: ['Bihar', 'Jharkhand', 'Odisha', 'Sikkim', 'West Bengal'] },
  { en: 'North-East India', hi: 'पूर्वोत्तर भारत', mr: 'ईशान्य भारत', ta: 'வடகிழக்கு இந்தியா', color: '#0891b2', states: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura'] },
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

// Aggregate domestic-rate stats for one state across all its DISCOMs — feeds the
// directory's per-state stat lines and the comparison table. Derived purely from
// the tariff DB, so every figure is real and regenerated with the data.
function stateDomesticStats(state) {
  let min = Infinity, max = -Infinity, fy = null;
  for (const d of getDiscoms(state)) {
    const cat = domesticCategory(d);
    if (!cat) continue;
    const blocks = (cat.supplyTypes && cat.supplyTypes.length) ? cat.supplyTypes : [cat];
    for (const b of blocks) {
      for (const s of (b.energySlabs || [])) {
        // Ignore free lifeline slabs (rate 0) — "domestic from ₹0/unit" would misstate
        // what a consumer actually pays; min is the lowest *paid* rate.
        if (typeof s.rate !== 'number' || s.rate <= 0) continue;
        if (s.rate < min) min = s.rate;
        if (s.rate > max) max = s.rate;
      }
    }
    if (!fy) fy = d.tariffYear || null;
  }
  if (!isFinite(min)) return null;
  return { min, max, fy, verified: !!(STATE_META[state] || {}).verified };
}

function directoryPage(states, lang = 'en') {
  const hi = lang === 'hi';
  const enUrl = '/tariffs/states/';
  const url = langUrl(enUrl, lang);
  const title = T(lang, {
    hi: 'सभी भारतीय बिजली डिस्कॉम व राज्यवार टैरिफ',
    mr: 'सर्व भारतीय वीज डिस्कॉम व राज्यनिहाय टॅरिफ',
    ta: 'அனைத்து இந்திய மின் DISCOM-கள் & மாநில வாரியான கட்டணங்கள்',
    en: 'All Indian Electricity DISCOMs & Tariffs by State' });
  const description = T(lang, {
    hi: 'हर भारतीय राज्य और केंद्र शासित प्रदेश के बिजली टैरिफ व बिल कैलकुलेटर देखें। 65+ डिस्कॉम, स्लैब-वार दरें, फिक्स्ड चार्ज और FPPA — एक ही डायरेक्टरी में।',
    mr: 'प्रत्येक भारतीय राज्य आणि केंद्रशासित प्रदेशाचे वीज टॅरिफ व बिल कॅल्क्युलेटर पाहा. 65+ डिस्कॉम, स्लॅब-निहाय दर, फिक्स्ड चार्ज आणि FPPA — एकाच डिरेक्टरीमध्ये.',
    ta: 'ஒவ்வொரு இந்திய மாநிலம் மற்றும் யூனியன் பிரதேசத்தின் மின் கட்டணங்கள் மற்றும் பில் கணிப்பான்களைப் பாருங்கள். 65+ DISCOM-கள், அடுக்கு வாரியான விகிதங்கள், நிலையான கட்டணம் மற்றும் FPPA — ஒரே டைரக்டரியில்.',
    en: 'Browse electricity tariffs and bill calculators for every Indian state and union territory. 65+ DISCOMs, slab-wise rates, fixed charges and FPPA — all in one directory.' });

  const pfx = lang === 'en' ? '' : `/${lang}`;
  // A vernacular tariff twin only exists for states this language is scoped to; elsewhere the
  // directory links the English page so no card points at a 404.
  const sbase = (s) => `${langServesState(lang, s) ? pfx : ''}/tariffs/`;
  const base = `${pfx}/tariffs/`;   // the directory page's own /<lang>/ base (self-links)
  let totalDiscoms = 0;

  const stateCard = (state) => {
    const stateSlug = slugify(state);
    const discoms = getDiscoms(state);
    totalDiscoms += discoms.length;
    const displayName = stateName(state, lang);
    const b = sbase(state);
    const links = discoms.map(d => `<a href="${b}${stateSlug}/${d.id}/">${esc(d.name)}</a>`).join('');
    // data-search carries every script's name + discom names so the filter box matches everything
    const searchBlob = [state, stateName(state, 'hi'), stateName(state, 'mr'), stateName(state, 'ta'), ...discoms.map(d => d.name)].join(' ').toLowerCase();
    const nDiscoms = `${discoms.length} ${T(lang, { hi: 'डिस्कॉम', mr: 'डिस्कॉम', ta: 'DISCOM', en: (discoms.length === 1 ? 'DISCOM' : 'DISCOMs') })}`;
    // Unique per-state stat line: real domestic rate span pulled from the tariff DB
    // (plus the verified badge), so no two state cards read the same.
    const st = stateDomesticStats(state);
    const statLine = st
      ? ` · <span class="seo-dir-rate">${T(lang, { hi: `घरेलू ${rupee(st.min)}–${rupee(st.max)}/यूनिट`, mr: `घरगुती ${rupee(st.min)}–${rupee(st.max)}/युनिट`, ta: `வீட்டு ${rupee(st.min)}–${rupee(st.max)}/யூனிட்`, en: `Domestic ${rupee(st.min)}–${rupee(st.max)}/unit` })}</span>${st.verified ? '<span class="seo-dir-verified" title="Verified against real bills">✓</span>' : ''}`
      : '';
    return `
      <div class="seo-dir-state" data-search="${esc(searchBlob)}">
        <a class="seo-dir-state-head" href="${b}${stateSlug}/">
          <span class="seo-dir-badge" aria-hidden="true">${esc(stateCode(state))}</span>
          <span class="seo-dir-state-meta">
            <h3 class="seo-dir-state-name">${esc(displayName)}<span class="seo-dir-arrow" aria-hidden="true">→</span></h3>
            <span class="seo-dir-count">${nDiscoms}${statLine}</span>
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
  if (leftovers.length) grouped.push({ en: 'Other', hi: 'अन्य', mr: 'इतर', ta: 'மற்றவை', color: '#64748b', states: leftovers });

  const sections = grouped.map(r => `
    <section class="seo-dir-region" style="--dir-accent:${r.color}">
      <h2 class="seo-dir-region-title"><span class="seo-dir-region-dot" aria-hidden="true"></span>${esc(r[lang] || r.en)} <span class="seo-dir-region-count">${r.states.length}</span></h2>
      <div class="seo-directory">${r.states.map(stateCard).join('')}</div>
    </section>`).join('');

  // State-wise domestic rate comparison — unique aggregated content computed from the
  // tariff DB at build time (sorted cheapest-first, so the table itself answers the
  // "which state has the cheapest electricity" query the page ranks for).
  const cmpRows = states
    .map(s => ({ s, st: stateDomesticStats(s), n: getDiscoms(s).length }))
    .filter(r => r.st)
    .sort((a, b) => a.st.min - b.st.min);
  const comparisonHtml = cmpRows.length ? `
    <section class="seo-section">
      <h2>${T(lang, { hi: 'राज्यवार घरेलू बिजली दरें — एक नज़र में', mr: 'राज्यनिहाय घरगुती वीज दर — एका दृष्टिक्षेपात', ta: 'மாநில வாரியான வீட்டு மின் விகிதங்கள் — ஒரு பார்வையில்', en: 'Domestic electricity rates by state — at a glance' })}</h2>
      <p>${T(lang, {
        hi: 'हर राज्य की सबसे कम और सबसे ऊँची घरेलू (स्लैब) ऊर्जा दर, हमारे टैरिफ डेटा से — सबसे सस्ती दर पहले। फिक्स्ड चार्ज, FPPA और शुल्क अलग से लगते हैं, इसलिए असली बिल की तुलना <a href="/#calculator">कैलकुलेटर</a> से करें।',
        mr: 'प्रत्येक राज्याचा सर्वात कमी आणि सर्वात जास्त घरगुती (स्लॅब) ऊर्जा दर, आमच्या टॅरिफ डेटावरून — सर्वात स्वस्त दर आधी. फिक्स्ड चार्ज, FPPA आणि शुल्क वेगळे लागतात, म्हणून प्रत्यक्ष बिलाची तुलना <a href="/#calculator">कॅल्क्युलेटर</a> ने करा.',
        ta: 'ஒவ்வொரு மாநிலத்தின் மிகக் குறைந்த மற்றும் மிக உயர்ந்த வீட்டு (அடுக்கு) மின் விகிதம், எங்கள் கட்டண தரவிலிருந்து — மலிவானது முதலில். நிலையான கட்டணம், FPPA மற்றும் வரி கூடுதலாக, எனவே உண்மையான பில்களை <a href="/#calculator">கணிப்பானுடன்</a> ஒப்பிடுங்கள்.',
        en: 'The lowest and highest domestic (slab) energy rate in every state, straight from our tariff data — cheapest first. Fixed charges, FPPA and duty apply on top, so compare real bills with the <a href="/#calculator">calculator</a>.' })}</p>
      <div class="comparison-table-wrapper"><table class="comparison-table">
        <thead><tr><th>${T(lang, { hi: 'राज्य / केंद्र शासित प्रदेश', mr: 'राज्य / केंद्रशासित प्रदेश', ta: 'மாநிலம் / யூடி', en: 'State / UT' })}</th><th>${T(lang, { hi: 'डिस्कॉम', mr: 'डिस्कॉम', ta: 'DISCOM', en: 'DISCOMs' })}</th><th>${T(lang, { hi: 'घरेलू दर (न्यूनतम–अधिकतम)', mr: 'घरगुती दर (किमान–कमाल)', ta: 'வீட்டு விகிதம் (குறைந்த–அதிக)', en: 'Domestic rate (min–max)' })}</th><th>${T(lang, { hi: 'टैरिफ वर्ष', mr: 'टॅरिफ वर्ष', ta: 'கட்டண ஆண்டு', en: 'Tariff year' })}</th></tr></thead>
        <tbody>${cmpRows.map(({ s, st, n }) => `<tr><td><a href="${sbase(s)}${slugify(s)}/">${esc(stateName(s, lang))}</a>${st.verified ? ' <span class="seo-dir-verified" title="Verified against real bills">✓</span>' : ''}</td><td>${n}</td><td>${rupee(st.min)} – ${rupee(st.max)}${T(lang, { hi: '/यूनिट', mr: '/युनिट', ta: '/யூனிட்', en: '/unit' })}</td><td>${esc(st.fy ? fyLabel(st.fy, lang) : '—')}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="seo-note">${T(lang, {
        hi: 'दरें प्रकाशित टैरिफ आदेशों से हैं और श्रेणी/स्लैब के अनुसार बदलती हैं; ✓ का मतलब असली बिलों से सत्यापित।',
        mr: 'दर प्रकाशित टॅरिफ आदेशांवरून आहेत आणि श्रेणी/स्लॅबनुसार बदलतात; ✓ म्हणजे खऱ्या बिलांवरून पडताळलेले.',
        ta: 'விகிதங்கள் வெளியிடப்பட்ட கட்டண ஆணைகளிலிருந்து வந்தவை, வகை/அடுக்கின்படி மாறுபடும்; ✓ என்பது உண்மையான பில்களுடன் சரிபார்க்கப்பட்ட மாநிலங்கள்.',
        en: 'Rates come from published tariff orders and vary by category/slab; ✓ marks states verified against real bills.' })}</p>
    </section>` : '';

  // Directory FAQs — figures derived from the same data (never hand-typed), so they
  // stay correct on every regeneration.
  const cheapest = cmpRows[0], dearest = cmpRows[cmpRows.length - 1];
  const cheapS = cheapest ? stateName(cheapest.s, lang) : '', dearS = dearest ? stateName(dearest.s, lang) : '';
  const dirFaqs = [
    { q: T(lang, { hi: 'डिस्कॉम (DISCOM) क्या है?', mr: 'डिस्कॉम (DISCOM) म्हणजे काय?', ta: 'DISCOM என்றால் என்ன?', en: 'What is a DISCOM?' }),
      a: T(lang, {
        hi: 'डिस्कॉम यानी Distribution Company — वह कंपनी जो आपके इलाके में बिजली पहुँचाती है और बिल जारी करती है। टैरिफ राज्य का विद्युत नियामक आयोग (SERC) तय करता है, डिस्कॉम नहीं।',
        mr: 'डिस्कॉम म्हणजे Distribution Company — जी कंपनी तुमच्या भागात वीज पुरवते आणि बिल देते. टॅरिफ राज्याचा वीज नियामक आयोग (SERC) ठरवतो, डिस्कॉम नाही.',
        ta: 'DISCOM என்பது Distribution Company — உங்கள் பகுதியில் மின்சாரம் வழங்கி பில் வழங்கும் நிறுவனம். கட்டணங்களை DISCOM அல்ல, மாநில மின் ஒழுங்குமுறை ஆணையம் (SERC) நிர்ணயிக்கிறது.',
        en: 'DISCOM stands for Distribution Company — the utility that delivers electricity to your premises and issues your bill. Tariffs are set not by the DISCOM but by the State Electricity Regulatory Commission (SERC), which is why rates differ state to state.' }) },
    { q: T(lang, { hi: 'भारत में घरेलू बिजली सबसे सस्ती कहाँ है?', mr: 'भारतात घरगुती वीज सर्वात स्वस्त कुठे आहे?', ta: 'இந்தியாவில் வீட்டு மின்சாரம் எங்கு மலிவானது?', en: 'Which state has the cheapest domestic electricity in India?' }),
      a: cheapest ? T(lang, {
        hi: `हमारे टैरिफ डेटा में सबसे कम घरेलू स्लैब दर ${cheapS} में ${rupee(cheapest.st.min)}/यूनिट से शुरू होती है, जबकि सबसे ऊँची स्लैब दरें ${dearS} जैसे राज्यों में ${rupee(dearest.st.max)}/यूनिट तक जाती हैं। असली बिल फिक्स्ड चार्ज, FPPA और शुल्क पर भी निर्भर करता है।`,
        mr: `आमच्या टॅरिफ डेटामध्ये सर्वात कमी घरगुती स्लॅब दर ${cheapS} मध्ये ${rupee(cheapest.st.min)}/युनिट पासून सुरू होते, तर सर्वात जास्त स्लॅब दर ${dearS} सारख्या राज्यांत ${rupee(dearest.st.max)}/युनिट पर्यंत जातात. प्रत्यक्ष बिल फिक्स्ड चार्ज, FPPA आणि शुल्कावरही अवलंबून असते.`,
        ta: `எங்கள் கட்டண தரவில் மிகக் குறைந்த வீட்டு அடுக்கு விகிதம் ${cheapS} இல் ${rupee(cheapest.st.min)}/யூனிட் முதல் தொடங்குகிறது, அதே நேரம் மிக உயர்ந்த அடுக்கு விகிதங்கள் ${dearS} போன்ற மாநிலங்களில் ${rupee(dearest.st.max)}/யூனிட் வரை செல்கின்றன. உண்மையான பில் நிலையான கட்டணம், FPPA மற்றும் வரியையும் பொறுத்தது.`,
        en: `In our tariff data the lowest domestic slab rate starts at ${rupee(cheapest.st.min)}/unit in ${cheapest.s}, while the highest slab rates reach ${rupee(dearest.st.max)}/unit in states like ${dearest.s}. Real bills also depend on fixed charges, FPPA and duty — compare with the calculator.` })
        : T(lang, { hi: 'राज्यवार तालिका ऊपर देखें।', mr: 'राज्यनिहाय तक्ता वर पाहा.', ta: 'மேலே உள்ள மாநில வாரியான அட்டவணையைப் பாருங்கள்.', en: 'See the state-wise table above.' }) },
    { q: T(lang, { hi: 'मेरा डिस्कॉम कौन-सा है, कैसे पता करूँ?', mr: 'माझा डिस्कॉम कोणता, कसे कळेल?', ta: 'என் DISCOM எது என்பதை எப்படி அறிவது?', en: 'How do I find out which DISCOM serves my area?' }),
      a: T(lang, {
        hi: 'अपने बिजली बिल का ऊपरी हिस्सा देखें — कंपनी का नाम/लोगो वहीं छपा होता है। या ऊपर की डायरेक्टरी में अपना राज्य खोलें: हर डिस्कॉम के साथ उसका सेवा क्षेत्र लिखा है।',
        mr: 'तुमच्या वीज बिलाचा वरचा भाग पाहा — कंपनीचे नाव/लोगो तिथेच छापलेले असते. किंवा वरील डिरेक्टरीत तुमचे राज्य उघडा: प्रत्येक डिस्कॉमसोबत त्याचे सेवा क्षेत्र लिहिलेले आहे.',
        ta: 'உங்கள் மின் பில்லின் மேற்பகுதியைப் பாருங்கள் — நிறுவனத்தின் பெயர்/சின்னம் அங்கே அச்சிடப்பட்டிருக்கும். அல்லது மேலே உள்ள டைரக்டரியில் உங்கள் மாநிலத்தைத் திறக்கவும்: ஒவ்வொரு DISCOM உடனும் அதன் சேவைப் பகுதி குறிப்பிடப்பட்டுள்ளது.',
        en: 'Check the top of your electricity bill — the company name and logo are printed there. Or open your state in the directory above: each DISCOM entry lists its service region and cities.' }) },
    { q: T(lang, { hi: 'क्या एक ही राज्य में अलग-अलग डिस्कॉम की दरें अलग होती हैं?', mr: 'एकाच राज्यात वेगवेगळ्या डिस्कॉमचे दर वेगळे असतात का?', ta: 'ஒரே மாநிலத்தில் வெவ்வேறு DISCOM-கள் வெவ்வேறு விகிதங்கள் வசூலிக்குமா?', en: 'Do different DISCOMs in the same state charge different rates?' }),
      a: T(lang, {
        hi: 'कहीं हाँ, कहीं नहीं। कई राज्यों (जैसे यूपी) में नियामक एक ही राज्यव्यापी अनुसूची सब डिस्कॉम पर लागू करता है; दिल्ली, महाराष्ट्र, ओडिशा जैसे राज्यों में हर डिस्कॉम की अपनी दरें होती हैं। हर डिस्कॉम पेज पर यह साफ़ लिखा है।',
        mr: 'कुठे हो, कुठे नाही. अनेक राज्यांत (जसे यूपी) नियामक एकच राज्यव्यापी अनुसूची सर्व डिस्कॉमवर लागू करतो; दिल्ली, महाराष्ट्र, ओडिशासारख्या राज्यांत प्रत्येक डिस्कॉमचे स्वतःचे दर असतात. प्रत्येक डिस्कॉम पेजवर हे स्पष्ट लिहिलेले आहे.',
        ta: 'சில இடங்களில் ஆம், சிலவற்றில் இல்லை. பல மாநிலங்களில் (உ.ம். உ.பி.) ஒழுங்குமுறையாளர் ஒரே மாநில அளவிலான அட்டவணையை எல்லா DISCOM-களுக்கும் பயன்படுத்துகிறார்; டெல்லி, மகாராஷ்டிரா, ஒடிசா போன்ற மாநிலங்களில் ஒவ்வொரு DISCOM-க்கும் தனித் தனி விகிதங்கள் உள்ளன. ஒவ்வொரு DISCOM பக்கத்திலும் இது தெளிவாகக் குறிப்பிடப்பட்டுள்ளது.',
        en: 'Sometimes. In many states (like Uttar Pradesh) the regulator applies one state-wide schedule to every DISCOM; in others (Delhi, Maharashtra, Odisha) each company has its own approved rates. Each DISCOM page on this site states clearly whether its schedule is shared.' }) },
  ];

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

  const crumbDir = T(lang, { hi: 'टैरिफ डायरेक्टरी', mr: 'टॅरिफ डिरेक्टरी', ta: 'கட்டண டைரக்டரி', en: 'Tariffs Directory' });
  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const dirH1 = T(lang, {
    hi: 'बिजली टैरिफ व बिल कैलकुलेटर — सभी राज्य व डिस्कॉम',
    mr: 'वीज टॅरिफ व बिल कॅल्क्युलेटर — सर्व राज्ये व डिस्कॉम',
    ta: 'மின் கட்டணங்கள் & பில் கணிப்பான்கள் — அனைத்து மாநிலங்கள் & DISCOM-கள்',
    en: 'Electricity Tariffs &amp; Bill Calculators — All States &amp; DISCOMs' });
  const dirLead = T(lang, {
    hi: 'अपना राज्य चुनें और उसका बिजली बिल कैलकुलेटर व टैरिफ अनुसूची खोलें, या सीधे अपनी वितरण कंपनी पर जाएँ।',
    mr: 'तुमचे राज्य निवडा आणि त्याचे वीज बिल कॅल्क्युलेटर व टॅरिफ अनुसूची उघडा, किंवा थेट तुमच्या वितरण कंपनीवर जा.',
    ta: 'உங்கள் மாநிலத்தைத் தேர்ந்தெடுத்து அதன் மின் பில் கணிப்பான் மற்றும் கட்டண அட்டவணையைத் திறக்கவும், அல்லது நேரடியாக உங்கள் விநியோக நிறுவனத்திற்குச் செல்லவும்.',
    en: 'Pick your state to open its electricity bill calculator and tariff schedule, or jump straight to your distribution company.' });
  const statLabels = T(lang, {
    hi: { states: 'राज्य व केंद्र शासित प्रदेश', discoms: 'डिस्कॉम', free: 'मुफ़्त' },
    mr: { states: 'राज्ये व केंद्रशासित प्रदेश', discoms: 'डिस्कॉम', free: 'मोफत' },
    ta: { states: 'மாநிலங்கள் & யூடி', discoms: 'DISCOM-கள்', free: 'இலவசம்' },
    en: { states: 'states &amp; UTs', discoms: 'DISCOMs', free: 'free' } });
  const searchPlaceholder = T(lang, {
    hi: 'राज्य या डिस्कॉम खोजें — जैसे दिल्ली, UP, MVVNL…',
    mr: 'राज्य किंवा डिस्कॉम शोधा — जसे दिल्ली, UP, MVVNL…',
    ta: 'மாநிலம் அல்லது DISCOM தேடு — உ.ம். டெல்லி, UP, MVVNL…',
    en: 'Search state or DISCOM — e.g. UP, MVVNL, Tata…' });
  const emptyMsg = T(lang, {
    hi: 'कोई राज्य या डिस्कॉम नहीं मिला। कोई और नाम आज़माएँ।',
    mr: 'कोणतेही राज्य किंवा डिस्कॉम सापडले नाही. दुसरे नाव वापरून पाहा.',
    ta: 'எந்த மாநிலமும் அல்லது DISCOM-மும் பொருந்தவில்லை. வேறு பெயரை முயற்சிக்கவும்.',
    en: 'No state or DISCOM matches that search. Try another name.' });
  const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: bcHome, url: '/' },
      { name: crumbDir, url: null },
    ])}
    ${langSwitchLink(enUrl, lang)}
    <div class="seo-dir-hero">
      <h1>${dirH1}</h1>
      <p class="seo-lead">${dirLead}</p>
      ${heroStats(statLabels)}
      <div class="seo-dir-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="dirSearch" type="search" placeholder="${attr(searchPlaceholder)}" aria-label="${attr(searchPlaceholder)}" autocomplete="off">
      </div>
    </div>
    ${sections}
    <p id="dirEmpty" class="seo-dir-empty" hidden>${emptyMsg}</p>
    ${comparisonHtml}
    ${faqHtml(dirFaqs, lang)}
  </section>${filterScript}`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    jsonld: [breadcrumbJsonLd([{ name: bcHome, url: '/' }, { name: crumbDir, url }]),
    // ItemList of every state landing page — helps Google (and AI crawlers) see the
    // directory as a structured collection rather than a flat link farm.
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      numberOfItems: states.length,
      itemListElement: states.map((s, i) => ({
        '@type': 'ListItem', position: i + 1,
        name: stateName(s, lang),
        url: SITE + sbase(s) + slugify(s) + '/',
      })),
    },
    faqJsonLd(dirFaqs)],
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
  // A guide only renders in a vernacular when its body is translated in the data file;
  // otherwise fall back to English (the driver also guards emission, so this is belt-and-braces).
  const L = (lang !== 'en' && guideHasBody(guide, lang)) ? lang : 'en';
  const enUrl = `/guides/${guide.slug}/`;
  const url = langUrl(enUrl, L);
  const title = guideField(guide, 'title', L) || guide.title;
  const intro = guideField(guide, 'intro', L) || guide.intro;
  const sections = guideField(guide, 'sections', L) || guide.sections;
  const faqs = guideField(guide, 'faqs', L) || guide.faqs || [];
  const guidesBase = `${L === 'en' ? '' : '/' + L}/guides/`;
  // Which vernaculars have a translated twin of THIS guide (for hreflang + lang-switch links).
  const altLangs = VERNACULARS.filter(l => guideHasBody(guide, l));
  const bcHome = T(L, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const bcGuides = T(L, { hi: 'गाइड', mr: 'मार्गदर्शक', ta: 'வழிகாட்டிகள்', en: 'Guides' });
  const trail = [
    { name: bcHome, url: '/' },
    { name: bcGuides, url: guidesBase },
    { name: title, url: null },
  ];
  const updated = LASTMOD_TOKEN[L];               // resolved to the content-derived date by emitPage()
  const meta = T(L, {
    hi: `${guide.minutes} मिनट · अपडेट: ${updated}`, mr: `${guide.minutes} मिनिटे · अपडेट: ${updated}`,
    ta: `${guide.minutes} நிமிட வாசிப்பு · புதுப்பிக்கப்பட்டது: ${updated}`, en: `${guide.minutes} min read · Updated ${updated}` });
  const ctaH2 = T(L, { hi: 'अब अपना असली बिल जाँचें', mr: 'आता तुमचे स्वतःचे बिल तपासा', ta: 'இப்போது உங்கள் சொந்த பில்லைச் சரிபார்க்கவும்', en: 'Now check your own bill' });
  const ctaP = T(L, {
    hi: 'पढ़ना काफ़ी नहीं — अपने डिस्कॉम की असली स्लैब दरों, फिक्स्ड चार्ज और FPPA के साथ अपना मदवार बिल सेकंडों में निकालें। मुफ़्त, बिना साइन-अप।',
    mr: 'वाचन अर्धेच काम — तुमच्या डिस्कॉमच्या खऱ्या स्लॅब दर, फिक्स्ड चार्ज आणि FPPA सह तुमचे तपशीलवार बिल काही सेकंदांत काढा. मोफत, साइन-अप शिवाय.',
    ta: 'படிப்பது பாதி வேலைதான் — உங்கள் DISCOM-இன் உண்மையான அடுக்கு விகிதங்கள், நிலையான கட்டணம் மற்றும் FPPA மூலம் உங்கள் யூனிட்களை இயக்கி விவரமான பில்லை சில நொடிகளில் பெறுங்கள். இலவசம், பதிவு தேவையில்லை.',
    en: 'Reading is half the job — run your own units through your DISCOM\'s real slab rates, fixed charges and FPPA and get an itemised bill in seconds. Free, no sign-up.' });
  const ctaBtn = T(L, { hi: 'बिजली बिल कैलकुलेटर खोलें →', mr: 'वीज बिल कॅल्क्युलेटर उघडा →', ta: 'மின் பில் கணிப்பானைத் திறக்கவும் →', en: 'Open the electricity bill calculator →' });
  const moreH2 = T(L, { hi: 'और गाइड', mr: 'आणखी मार्गदर्शक', ta: 'மேலும் வழிகாட்டிகள்', en: 'More guides' });
  const disclaimer = T(L, {
    hi: 'सार्वजनिक रूप से उपलब्ध टैरिफ आदेशों और विनियमों पर आधारित सामान्य मार्गदर्शन; विवरण राज्य, डिस्कॉम और उपभोक्ता श्रेणी के अनुसार बदलते हैं। अपने डिस्कॉम की आधिकारिक अनुसूची या छपे बिल से मिलान करें।',
    mr: 'सार्वजनिकरित्या उपलब्ध टॅरिफ आदेश आणि नियमांवर आधारित सामान्य मार्गदर्शन; तपशील राज्य, डिस्कॉम आणि ग्राहक श्रेणीनुसार बदलतात. तुमच्या डिस्कॉमच्या अधिकृत अनुसूचीशी किंवा छापील बिलाशी ताळमेळ करा.',
    ta: 'பொதுவில் கிடைக்கும் கட்டண ஆணைகள் மற்றும் ஒழுங்குமுறைகளை அடிப்படையாகக் கொண்ட பொது வழிகாட்டுதல்; விவரங்கள் மாநிலம், DISCOM மற்றும் நுகர்வோர் வகையின்படி மாறுபடும். உங்கள் DISCOM-இன் அதிகாரப்பூர்வ அட்டவணை அல்லது அச்சிடப்பட்ட பில்லுடன் சரிபார்க்கவும்.',
    en: `General guidance based on publicly available tariff orders and
    regulations; specifics vary by state, DISCOM and consumer category. Verify against your DISCOM's
    official schedule or your printed bill.` });
  const body = `
  <section class="seo-page container">
    ${breadcrumbs(trail)}
    ${L !== 'en' ? langSwitchLink(enUrl, L, altLangs) : (altLangs.length ? langSwitchLink(enUrl, 'en', altLangs) : '')}
    <h1>${esc(title)}</h1>
    <p class="guide-meta">${meta}</p>
    <p class="seo-lead">${intro}</p>
    ${sections}
    ${faqHtml(faqs, L)}
    <section class="seo-section guide-calc-cta">
      <h2>${ctaH2}</h2>
      <p>${ctaP}</p>
      <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">${ctaBtn}</a></p>
    </section>
    <section class="seo-section guide-more">
      <h2>${moreH2}</h2>
      <div class="seo-link-grid">${GUIDES.filter(g => g.slug !== guide.slug).map(g => {
        const gt = guideField(g, 'title', L) || g.title;
        const gHref = (L !== 'en' && guideHasBody(g, L)) ? `/${L}/guides/${g.slug}/` : `/guides/${g.slug}/`;
        const gm = T(L, { hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிடம்`, en: `${g.minutes} min read` });
        return `
        <a class="seo-link-card" href="${gHref}">
          <strong>${esc(gt)}</strong>
          <small>${gm}</small>
        </a>`; }).join('')}
      </div>
    </section>
    <p class="seo-disclaimer">${disclaimer}</p>
  </section>`;

  const articleLd = articleJsonLd(L !== 'en' ? { ...guide, title, description: guideField(guide, 'description', L) || guide.description } : guide, url);
  articleLd.inLanguage = LANG_LOCALE[L];
  return layout({
    title: guideField(guide, 'metaTitle', L) || title,
    description: guideField(guide, 'description', L) || guide.description,
    canonical: SITE + url,
    page: altLangs.length ? enUrl : null,   // only advertise a hreflang set when a twin exists
    lang: L, altLangs,
    jsonld: [
      articleLd,
      breadcrumbJsonLd([{ name: bcHome, url: '/' }, { name: bcGuides, url: guidesBase }, { name: title }]),
      faqJsonLd(faqs),
    ],
    body,
  });
}

// Category tag shown on each guide card (blog-style). An explicit `category` id on the
// guide wins; otherwise it's derived from the slug. Labels are translated per language.
const GUIDE_CATEGORIES = {
  solar:       { en: 'Solar',          hi: 'सोलर',          mr: 'सोलर',          ta: 'சோலார்' },
  ev:          { en: 'EV Guide',       hi: 'EV गाइड',       mr: 'EV मार्गदर्शक', ta: 'EV வழிகாட்டி' },
  smartMeter:  { en: 'Smart Meter',    hi: 'स्मार्ट मीटर',  mr: 'स्मार्ट मीटर',  ta: 'ஸ்மார்ட் மீட்டர்' },
  newConn:     { en: 'New Connection', hi: 'नया कनेक्शन',    mr: 'नवीन जोडणी',    ta: 'புதிய இணைப்பு' },
  charges:     { en: 'Bill Charges',   hi: 'बिल शुल्क',      mr: 'बिल शुल्क',      ta: 'பில் கட்டணம்' },
  saveMoney:   { en: 'Save Money',     hi: 'बचत',           mr: 'बचत',           ta: 'சேமிப்பு' },
  basics:      { en: 'Bill Basics',    hi: 'बिल बेसिक्स',    mr: 'बिल बेसिक्स',    ta: 'பில் அடிப்படை' },
};
function guideCategoryId(g) {
  if (g.category && GUIDE_CATEGORIES[g.category]) return g.category;
  const s = g.slug;
  if (/^ev-|ev-charging/.test(s)) return 'ev';
  if (/solar|surya/.test(s)) return 'solar';
  if (/smart-meter|prepaid-vs-postpaid/.test(s)) return 'smartMeter';
  if (/new-connection/.test(s)) return 'newConn';
  if (/sanctioned-load|reduce-fixed/.test(s)) return 'saveMoney';
  if (/fppa|electricity-duty|power-factor|kvah/.test(s)) return 'charges';
  if (/how-to-read|bill-increase|what-is-a-unit|tod-billing/.test(s)) return 'basics';
  return 'basics';
}
const guideCategoryLabel = (g, lang) => T(lang, GUIDE_CATEGORIES[guideCategoryId(g)]);

function guidesIndexPage(lang = 'en') {
  const enUrl = '/guides/';
  const url = langUrl(enUrl, lang);
  const title = T(lang, {
    hi: 'बिजली बिल गाइड — बिल समझें और घटाएँ',
    mr: 'वीज बिल मार्गदर्शक — बिल समजून घ्या आणि कमी करा',
    ta: 'மின் பில் வழிகாட்டிகள் — உங்கள் பில்லைப் புரிந்து குறைக்கவும்',
    en: 'Electricity Bill Guides — Understand & Reduce Your Bill' });
  const description = T(lang, {
    hi: 'भारतीय बिजली बिलिंग की आसान भाषा में गाइड: बिल कैसे पढ़ें, बिल अचानक क्यों बढ़ते हैं, टाइम-ऑफ़-डे बिलिंग, FPPA और बहुत कुछ।',
    mr: 'भारतीय वीज बिलिंगचे सोप्या भाषेतील मार्गदर्शक: बिल कसे वाचावे, बिल अचानक का वाढते, टाइम-ऑफ-डे बिलिंग, FPPA आणि बरेच काही.',
    ta: 'இந்திய மின் பில்லிங் குறித்த எளிய மொழி வழிகாட்டிகள்: பில்லை எப்படிப் படிப்பது, பில்கள் ஏன் திடீரெனக் கூடுகின்றன, டைம்-ஆஃப்-டே பில்லிங், FPPA மற்றும் பல.',
    en: 'Plain-language guides to Indian electricity billing: how to read your bill, why bills suddenly increase, Time-of-Day billing, FPPA and more.' });
  const base = `${lang === 'en' ? '' : '/' + lang}/guides/`;
  const readMore = T(lang, { hi: 'लेख पढ़ें', mr: 'लेख वाचा', ta: 'கட்டுரையைப் படிக்க', en: 'Read article' });
  // Newest first so fresh content leads the blog grid; guides carry a `published` date.
  const ordered = [...GUIDES].sort((a, b) => (b.published || '').localeCompare(a.published || ''));
  const cards = ordered.map(g => {
    // Link to the vernacular twin only where the article body is translated; else English.
    const translated = lang !== 'en' && guideHasBody(g, lang);
    const href = translated ? `/${lang}/guides/${g.slug}/` : `/guides/${g.slug}/`;
    const gt = guideField(g, 'title', lang) || g.title;
    const gd = guideField(g, 'description', lang) || g.description;
    const snip = gd.split('।')[0].split('.')[0];
    const end = T(lang, { hi: '।', mr: '.', ta: '.', en: '.' });
    const gm = T(lang, { hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிடம்`, en: `${g.minutes} min read` });
    const cat = guideCategoryLabel(g, lang);
    const date = g.published ? humanDate(g.published, lang) : '';
    return `
    <a class="blog-card" href="${href}">
      <div class="blog-card-top">
        <span class="blog-tag">${esc(cat)}</span>
        <span class="blog-meta-dot" aria-hidden="true">&bull;</span>
        <span class="blog-read">${gm}</span>
      </div>
      <strong class="blog-card-title">${esc(gt)}</strong>
      <span class="blog-card-desc">${esc(snip)}${end}</span>
      <span class="blog-card-foot">
        <span class="blog-date">${date}</span>
        <span class="blog-read-link">${readMore}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></span>
      </span>
    </a>`;
  }).join('');
  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const bcGuides = T(lang, { hi: 'गाइड', mr: 'मार्गदर्शक', ta: 'வழிகாட்டிகள்', en: 'Guides' });
  const h1 = T(lang, { hi: 'ब्लॉग और लेख', mr: 'ब्लॉग आणि लेख', ta: 'வலைப்பதிவுகள் & கட்டுரைகள்', en: 'Blogs & Articles' });
  const lead = T(lang, {
    hi: 'भारतीय बिजली बिलिंग पर छोटे, व्यावहारिक लेख — ठीक उन्हीं सवालों के जवाब जो लोग पूछते हैं, और हमारे <a href="/#calculator">बिल कैलकुलेटर</a> के पीछे के लाइव टैरिफ डेटा से जुड़े हुए।',
    mr: 'भारतीय वीज बिलिंगवरील छोटे, व्यावहारिक लेख — लोक विचारतात त्याच प्रश्नांची उत्तरे, आणि आमच्या <a href="/#calculator">बिल कॅल्क्युलेटर</a> मागील लाइव्ह टॅरिफ डेटाशी जोडलेले.',
    ta: 'இந்திய மின் பில்லிங் குறித்த சிறிய, நடைமுறை விளக்கக் கட்டுரைகள் — மக்கள் கேட்கும் அதே கேள்விகளுக்குப் பதில், எங்கள் <a href="/#calculator">பில் கணிப்பானின்</a> பின்னால் உள்ள நேரடி கட்டண தரவுடன் இணைக்கப்பட்டவை.',
    en: 'Short, practical explainers on Indian electricity billing — written to answer the exact questions people ask, and linked to the live tariff data behind our <a href="/#calculator">bill calculator</a>.' });
  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: bcHome, url: '/' }, { name: bcGuides, url: null }])}
    ${langSwitchLink(enUrl, lang)}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    <div class="blog-grid">${cards}</div>
  </section>`;
  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    jsonld: [breadcrumbJsonLd([{ name: bcHome, url: '/' }, { name: bcGuides, url }])],
    body,
  });
}

// ── glossary (/glossary/) — DefinedTerm content in glossary-content.js ─────────
// A single definitional page. DefinedTermSet + DefinedTerm JSON-LD is exactly the entity
// shape LLMs and search engines cite, and every DISCOM/state page links in with real anchor
// text (nav, footer + a contextual block), making this a topical hub.
function definedTermSetJsonLd(url, lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE}${url}#termset`,
    name: T(lang, { hi: 'बिजली बिल शब्दावली', mr: 'वीज बिल शब्दावली', ta: 'மின் பில் சொற்களஞ்சியம்', en: 'Electricity Bill Glossary' }),
    description: T(lang, {
      hi: 'भारतीय बिजली बिलिंग और टैरिफ शब्दों की परिभाषाएँ — FPPA, बिजली शुल्क, kVAh, स्लैब-वार दरें, स्वीकृत भार और बहुत कुछ।',
      mr: 'भारतीय वीज बिलिंग आणि टॅरिफ शब्दांच्या व्याख्या — FPPA, वीज शुल्क, kVAh, स्लॅबनिहाय दर, मंजूर भार आणि बरेच काही.',
      ta: 'இந்திய மின் பில்லிங் மற்றும் கட்டண சொற்களின் வரையறைகள் — FPPA, மின் வரி, kVAh, அடுக்கு வாரியான விகிதங்கள், அனுமதிக்கப்பட்ட சுமை மற்றும் பல.',
      en: 'Definitions of Indian electricity billing and tariff terms — FPPA, electricity duty, kVAh, slab-wise rates, sanctioned load and more.' }),
    url: SITE + url,
    inLanguage: LANG_LOCALE[lang] || 'en-IN',
    publisher: { '@id': `${SITE}/#org` },
    hasDefinedTerm: GLOSSARY.map(t => {
      // English term + abbr stay as alternateName on the vernacular page too — that's how
      // people actually search ("FPPA क्या है").
      const alt = lang !== 'en'
        ? [t.term, t.abbr, ...(t.aka || [])].filter(Boolean)
        : [t.abbr, ...(t.aka || [])].filter(Boolean);
      return {
        '@type': 'DefinedTerm',
        '@id': `${SITE}${url}#${t.slug}`,
        name: guideField(t, 'term', lang) || t.term,
        ...(alt.length ? { alternateName: alt } : {}),
        description: guideField(t, 'short', lang) || t.short,
        inDefinedTermSet: `${SITE}${url}#termset`,
        url: `${SITE}${url}#${t.slug}`,
      };
    }),
  };
}

function glossaryPage(lang = 'en') {
  const enUrl = '/glossary/';
  const url = langUrl(enUrl, lang);
  const pfx = lang === 'en' ? '' : `/${lang}`;
  const title = T(lang, {
    hi: 'बिजली बिल शब्दावली — भारतीय टैरिफ शब्दों की आसान परिभाषा',
    mr: 'वीज बिल शब्दावली — भारतीय टॅरिफ शब्दांची सोपी व्याख्या',
    ta: 'மின் பில் சொற்களஞ்சியம் — இந்திய கட்டண சொற்கள் விளக்கம்',
    en: 'Electricity Bill Glossary — Indian Tariff Terms Explained' });
  const description = T(lang, {
    hi: 'भारतीय बिजली बिल और टैरिफ शब्दों की आसान भाषा में परिभाषाएँ: FPPA, बिजली शुल्क, MMC, kVAh, मल्टीप्लाइंग फैक्टर, स्वीकृत भार, स्लैब-वार दरें, LPSC और बहुत कुछ।',
    mr: 'भारतीय वीज बिल आणि टॅरिफ शब्दांच्या सोप्या भाषेतील व्याख्या: FPPA, वीज शुल्क, MMC, kVAh, मल्टिप्लाईंग फॅक्टर, मंजूर भार, स्लॅबनिहाय दर, LPSC आणि बरेच काही.',
    ta: 'இந்திய மின் பில் மற்றும் கட்டண சொற்களின் எளிய மொழி வரையறைகள்: FPPA, மின் வரி, MMC, kVAh, பெருக்கல் காரணி, அனுமதிக்கப்பட்ட சுமை, அடுக்கு வாரியான விகிதங்கள், LPSC மற்றும் பல.',
    en: 'Plain-language definitions of Indian electricity bill and tariff terms: FPPA, electricity duty, MMC, kVAh, multiplying factor, sanctioned load, slab-wise rates, LPSC and more.' });

  const clean = (t) => t.term.replace(/\s*\(.*?\)\s*/g, '').trim();
  const chipText = (t) => (lang !== 'en' && guideField(t, 'chip', lang)) || clean(t);

  // Alphabetical jump index (chips) → anchors below. (Vernacular pages keep the English sort
  // order so anchors stay predictable across variants.)
  const index = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
    .map(t => `<a class="glossary-chip" href="#${t.slug}" data-i18n="gl.${t.slug}.chip">${esc(chipText(t))}</a>`).join('');

  const vern = lang !== 'en';
  const terms = GLOSSARY.map(t => {
    const alt = [vern ? t.term : null, t.abbr, ...(t.aka || [])].filter(Boolean).filter(x => x.toLowerCase() !== t.term.toLowerCase() || vern);
    const akaLabel = T(lang, { hi: 'अन्य नाम:', mr: 'इतर नावे:', ta: 'மற்ற பெயர்கள்:', en: 'Also called:' });
    const also = alt.length ? `<p class="glossary-aka"><span data-i18n="gloss.aka">${akaLabel}</span> ${[...new Set(alt)].map(esc).join(', ')}</p>` : '';
    const body = (guideField(t, 'body', lang) || t.body).replace(/href="\/glossary\//g, `href="${pfx}/glossary/`);
    const backToTop = T(lang, { hi: '↑ सभी शब्दों पर वापस', mr: '↑ सर्व शब्दांवर परत', ta: '↑ அனைத்து சொற்களுக்கும் திரும்பு', en: '↑ Back to all terms' });
    // Contextual "related guide" link: every term that maps to an explainer earns an internal
    // link to it (deep-linking to the vernacular twin where the guide is translated).
    let related = '';
    if (t.guide) {
      const g = GUIDES.find(x => x.slug === t.guide);
      if (g) {
        const gHref = (lang !== 'en' && guideHasBody(g, lang)) ? `/${lang}/guides/${g.slug}/` : `/guides/${g.slug}/`;
        const gTitle = esc(guideField(g, 'title', lang) || g.title);
        const relLabel = T(lang, { hi: 'संबंधित गाइड:', mr: 'संबंधित मार्गदर्शक:', ta: 'தொடர்புடைய வழிகாட்டி:', en: 'Related guide:' });
        related = `<p class="glossary-more"><span class="glossary-more-label" data-i18n="gloss.relatedGuide">${relLabel}</span> <a href="${gHref}">${gTitle} →</a></p>`;
      }
    }
    return `
      <section class="seo-section glossary-term" id="${t.slug}">
        <h2 data-i18n="gl.${t.slug}.term">${esc(guideField(t, 'term', lang) || t.term)}</h2>
        <p class="glossary-def" data-i18n="gl.${t.slug}.short">${esc(guideField(t, 'short', lang) || t.short)}</p>
        ${also}
        <div class="glossary-body" data-i18n-html="gl.${t.slug}.body">${body}</div>
        ${related}
        <p class="glossary-top"><a href="#glossary-index" data-i18n="gloss.backToTop">${backToTop}</a></p>
      </section>`;
  }).join('');

  // Term strings live in glossary-content.js (co-located with the English source), not in
  // js/i18n.js. Ship them as a per-page dictionary the i18n layer merges on language switch.
  // Vernaculars without a translated term fall back to English so the switch never blanks out.
  const i18nGlossary = {};
  for (const l of ALL_LANGS) {
    i18nGlossary[l] = {};
    GLOSSARY.forEach(t => {
      i18nGlossary[l][`gl.${t.slug}.chip`] = (l !== 'en' && guideField(t, 'chip', l)) || clean(t);
      i18nGlossary[l][`gl.${t.slug}.term`] = guideField(t, 'term', l) || t.term;
      i18nGlossary[l][`gl.${t.slug}.short`] = guideField(t, 'short', l) || t.short;
      i18nGlossary[l][`gl.${t.slug}.body`] = guideField(t, 'body', l) || t.body;
    });
  }
  const glossaryDict = `<script>window.__i18nGlossary=${JSON.stringify(i18nGlossary)};</script>`;

  // Shell strings come from the same dictionary the runtime language switch uses; fall back
  // to the English default when a vernacular key is missing so nothing renders blank.
  const S = STRINGS[lang] || {};
  const gs = (key, en) => (lang === 'en' ? en : (S[key] || en));
  const crumbName = gs('gloss.crumb', 'Glossary');
  const h1 = gs('gloss.h1', 'Electricity Bill Guide');
  const leadEn = `Every charge line and code on an Indian electricity bill, defined in plain
    language. These are the terms behind our <a href="/#calculator">bill calculator</a> and
    <a href="/tariffs/states/">tariff pages</a> — from <a href="#fppa">FPPA</a> and
    <a href="#electricity-duty">electricity duty</a> to <a href="#telescopic-slabs">telescopic
    slabs</a> and <a href="#kvah">kVAh</a>.`;
  const lead = (lang === 'en' ? leadEn : (S['gloss.lead'] || leadEn)).replace(/href="\/tariffs\/states\/"/g, `href="${pfx}/tariffs/states/"`);
  const workH2 = gs('gloss.work.h2', 'Put these terms to work');
  const card1 = gs('gloss.card1', '<strong>Bill Calculator</strong><span>Apply these charges to your own units and load for an itemised estimate</span>');
  const card2 = gs('gloss.card2', '<strong>Bill Guides</strong><span>Longer walkthroughs: reading your bill, why bills rise, Time-of-Day billing</span>');
  const card3 = gs('gloss.card3', '<strong>Tariffs by State</strong><span>The live slab rates, fixed charges and FPPA for every DISCOM</span>');
  const disclaimer = gs('gloss.disclaimer', `General definitions based on common Indian tariff practice; the exact
    treatment of any charge varies by state, DISCOM and consumer category. Verify against your
    DISCOM's tariff order or your printed bill.`);
  const guidesHref = `${pfx}/guides/`;
  const tariffsHref = `${pfx}/tariffs/states/`;
  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });

  const body = `${glossaryDict}
  <section class="seo-page container">
    ${breadcrumbs([{ name: bcHome, url: '/' }, { name: crumbName, url: null, i18n: 'gloss.crumb' }])}
    ${langSwitchLink(enUrl, lang)}
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
      definedTermSetJsonLd(url, lang),
      breadcrumbJsonLd([{ name: bcHome, url: '/' }, { name: crumbName, url }]),
    ],
    body,
  });
}

// ── smart meter recharge (/smart-meter-recharge/) ─────────────────────────────
// Prepaid smart meters are being mass-installed under RDSS, and "<DISCOM> smart meter
// recharge" is a high-volume, low-competition query family. One page per DISCOM (EN + HI),
// with uniqueness coming from real data: the DISCOM's portal, service area, and a
// recharge-value table derived from its actual domestic slab rates.
//
// State-specific recharge channels: ONLY well-established, verifiable facts here (the same
// rule as CONSUMER_NAME — never invent an app name). States not listed fall back to the
// generic official-portal + BBPS guidance, which is accurate everywhere.
const SMART_METER_CHANNEL = {
  'Uttar Pradesh': {
    en: 'UPPCL prepaid consumers recharge on <a href="https://uppclonline.com" target="_blank" rel="noopener">uppclonline.com</a> or the official UPPCL consumer app using the account/meter number on the smart meter card.',
    hi: 'UPPCL प्रीपेड उपभोक्ता <a href="https://uppclonline.com" target="_blank" rel="noopener">uppclonline.com</a> या आधिकारिक UPPCL उपभोक्ता ऐप पर स्मार्ट मीटर कार्ड पर लिखे खाता/मीटर नंबर से रिचार्ज करते हैं।',
  },
  'Bihar': {
    en: 'Bihar consumers (NBPDCL & SBPDCL) recharge through the official <strong>Bihar Bijli Smart Meter</strong> app or the DISCOM website using the consumer/CA number.',
    hi: 'बिहार के उपभोक्ता (NBPDCL व SBPDCL) आधिकारिक <strong>Bihar Bijli Smart Meter</strong> ऐप या डिस्कॉम वेबसाइट से उपभोक्ता/CA नंबर डालकर रिचार्ज करते हैं।',
  },
};

// ₹ amounts shown in the derived recharge-value table.
const RECHARGE_AMOUNTS = [200, 500, 1000, 2000];

// Approximate units a recharge buys, from the DISCOM's real domestic slab span.
// Range = amount at the highest rate (worst case) … at the lowest paid rate (best case).
function rechargeRowsHtml(discom, lang = 'en') {
  const dr = domesticRates(discom);
  if (!dr || dr.max <= 0) return '';
  const minRate = Math.max(dr.min, 0.01);
  const unitWord = T(lang, { hi: 'यूनिट', mr: 'युनिट', ta: 'யூனிட்', en: 'units' });
  return RECHARGE_AMOUNTS.map(amt => {
    const lo = Math.floor(amt / dr.max), hiU = Math.floor(amt / minRate);
    const range = lo === hiU ? `≈ ${lo}` : `≈ ${lo} – ${hiU}`;
    return `<tr><td>${rupee(amt)}</td><td class="num">${range} ${unitWord}</td></tr>`;
  }).join('');
}

function smartMeterDiscomPage(state, discom, lang = 'en') {
  const stateSlug = slugify(state);
  const enUrl = `/smart-meter-recharge/${stateSlug}/${discom.id}/`;
  const url = langUrl(enUrl, lang);
  const sl = stateName(state, lang);
  const long = discom.fullName || discom.name;
  const cname = consumerName(discom);
  const nm = esc(discom.name);
  const { region, cities } = parseArea(discom.area);
  const rgn = region || sl;
  const dr = domesticRates(discom);
  const channel = SMART_METER_CHANNEL[state];
  const site = discom.website ? (/^https?:\/\//i.test(discom.website) ? discom.website : 'https://' + discom.website) : null;
  const host = site ? String(site).replace(/^https?:\/\//, '').replace(/\/.*$/, '') : null;
  const pfx = lang === 'en' ? '' : `/${lang}`;
  const tariffHref = `${pfx}/tariffs/${stateSlug}/${discom.id}/`;
  const calcHref = `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`;
  const guideBase = `${pfx}/guides/`;
  const hubHref = `${pfx}/smart-meter-recharge/`;
  const altLangs = VERNACULARS.filter(l => langServesState(l, state));

  const title = fitTitle(
    T(lang, { hi: `${cname} स्मार्ट मीटर रिचार्ज कैसे करें — ऑनलाइन`, mr: `${cname} स्मार्ट मीटर रिचार्ज कसे करावे — ऑनलाइन`, ta: `${cname} ஸ்மார்ட் மீட்டர் ரீசார்ஜ் எப்படி — ஆன்லைன்`, en: `${cname} Smart Meter Recharge Online — Steps & Rates` }),
    [T(lang, { hi: `${cname} स्मार्ट मीटर रिचार्ज`, mr: `${cname} स्मार्ट मीटर रिचार्ज`, ta: `${cname} ஸ்மார்ட் மீட்டர் ரீசார்ஜ்`, en: `${cname} Smart Meter Recharge Online` }),
     T(lang, { hi: `${discom.name} स्मार्ट मीटर रिचार्ज`, mr: `${discom.name} स्मार्ट मीटर रिचार्ज`, ta: `${discom.name} ஸ்மார்ட் மீட்டர் ரீசார்ஜ்`, en: `${cname} Smart Meter Recharge` })]);
  const description = T(lang, {
    hi: `${discom.name} (${long}) प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करें — आधिकारिक पोर्टल, UPI/BBPS के तरीक़े${dr ? `, और ₹500 में लगभग कितनी यूनिट मिलती हैं (${rupee(dr.min)}–${rupee(dr.max)}/यूनिट दर पर)` : ''}। कम बैलेंस व कटौती के नियम भी।`,
    mr: `${discom.name} (${long}) प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करा — अधिकृत पोर्टल, UPI/BBPS पद्धती${dr ? `, आणि ₹500 मध्ये अंदाजे किती युनिट मिळतात (${rupee(dr.min)}–${rupee(dr.max)}/युनिट दराने)` : ''}. कमी बॅलन्स व खंडित होण्याचे नियमही.`,
    ta: `${discom.name} (${long}) ப்ரீபெய்டு ஸ்மார்ட் மீட்டரை ஆன்லைனில் ரீசார்ஜ் செய்யுங்கள் — அதிகாரப்பூர்வ போர்ட்டல், UPI/BBPS விருப்பங்கள்${dr ? `, மேலும் ₹500-க்கு தோராயமாக எத்தனை யூனிட் (${rupee(dr.min)}–${rupee(dr.max)}/யூனிட் விகிதத்தில்)` : ''}. குறைந்த பேலன்ஸ் & துண்டிப்பு விதிகளும்.`,
    en: `Recharge your ${discom.name} (${long}) prepaid smart meter online — official portal, UPI/BBPS options${dr ? `, and roughly how many units ₹500 buys at ${rupee(dr.min)}–${rupee(dr.max)}/unit` : ''}. Plus low-balance and disconnection rules.` });

  const h1 = T(lang, {
    hi: `${esc(cname)} स्मार्ट मीटर रिचार्ज — ऑनलाइन तरीक़ा`, mr: `${esc(cname)} स्मार्ट मीटर रिचार्ज — ऑनलाइन पद्धत`,
    ta: `${esc(cname)} ஸ்மார்ட் மீட்டர் ரீசார்ஜ் — ஆன்லைனில் எப்படி`, en: `${esc(cname)} Smart Meter Recharge — How to Recharge Online` });
  const cityTail = cities.length
    ? T(lang, { hi: ` — ${esc(cities.slice(0, 3).join(', '))} समेत पूरे ${esc(rgn)} के लिए`, mr: ` — ${esc(cities.slice(0, 3).join(', '))} यांसह संपूर्ण ${esc(rgn)} साठी`, ta: ` — ${esc(cities.slice(0, 3).join(', '))} உள்ளிட்ட முழு ${esc(rgn)}-க்காக`, en: ` — for ${esc(cities.slice(0, 3).join(', '))} and the rest of ${esc(rgn)}` })
    : region ? T(lang, { hi: ` — ${esc(region)} के लिए`, mr: ` — ${esc(region)} साठी`, ta: ` — ${esc(region)}-க்காக`, en: ` — across ${esc(region)}` }) : '';
  const lead = T(lang, {
    hi: `<strong>${esc(long)}</strong> के प्रीपेड स्मार्ट मीटर को ऑनलाइन रिचार्ज करने का पूरा तरीक़ा${cityTail}। साथ में असली ${nm} टैरिफ दरों से निकाला गया अनुमान कि हर रिचार्ज में कितनी यूनिट मिलती हैं।`,
    mr: `<strong>${esc(long)}</strong> च्या प्रीपेड स्मार्ट मीटरला ऑनलाइन रिचार्ज करण्याची संपूर्ण पद्धत${cityTail}. सोबत खऱ्या ${nm} टॅरिफ दरांवरून काढलेला अंदाज की प्रत्येक रिचार्जमध्ये किती युनिट मिळतात.`,
    ta: `<strong>${esc(long)}</strong> ப்ரீபெய்டு ஸ்மார்ட் மீட்டரை ஆன்லைனில் ரீசார்ஜ் செய்ய வேண்டிய அனைத்தும்${cityTail}, மேலும் உண்மையான ${nm} கட்டண விகிதங்களிலிருந்து கணக்கிடப்பட்ட ஒவ்வொரு ரீசார்ஜுக்கும் எத்தனை யூனிட் என்ற மதிப்பீடு.`,
    en: `Everything you need to recharge a <strong>${esc(long)}</strong> prepaid smart meter online${cityTail}, plus a units-per-recharge estimate computed from the real ${nm} tariff rates.` });

  // How-to steps (channel line is state-specific where we have verified facts).
  const channelLine = (channel && channel[lang]) ? channel[lang] : channel ? channel.en
    : T(lang, {
      hi: `${nm} ${site ? `के आधिकारिक पोर्टल <a href="${attr(site)}" target="_blank" rel="noopener">${esc(host)}</a>` : 'के आधिकारिक पोर्टल/ऐप'} से, या BBPS-समर्थित UPI ऐप्स (PhonePe, Google Pay, Paytm आदि) में "${nm}" चुनकर रिचार्ज करें।`,
      mr: `${nm} ${site ? `च्या अधिकृत पोर्टल <a href="${attr(site)}" target="_blank" rel="noopener">${esc(host)}</a>` : 'च्या अधिकृत पोर्टल/अ‍ॅप'} वरून, किंवा BBPS-समर्थित UPI अ‍ॅप्स (PhonePe, Google Pay, Paytm इ.) मध्ये "${nm}" निवडून रिचार्ज करा.`,
      ta: `${nm} ${site ? `இன் அதிகாரப்பூர்வ போர்ட்டல் <a href="${attr(site)}" target="_blank" rel="noopener">${esc(host)}</a>` : 'இன் அதிகாரப்பூர்வ போர்ட்டல்/ஆப்'} மூலம், அல்லது BBPS-இயக்கப்பட்ட UPI ஆப்களில் (PhonePe, Google Pay, Paytm போன்றவை) "${nm}"-ஐத் தேர்ந்தெடுத்து ரீசார்ஜ் செய்யுங்கள்.`,
      en: `Recharge on the official ${nm} ${site ? `portal at <a href="${attr(site)}" target="_blank" rel="noopener">${esc(host)}</a>` : 'portal or app'}, or through BBPS-enabled UPI apps (PhonePe, Google Pay, Paytm etc.) by selecting "${nm}".` });
  const steps = T(lang, {
    hi: [
      ['रिचार्ज चैनल खोलें', channelLine],
      ['उपभोक्ता / मीटर नंबर डालें', 'यह नंबर आपके स्मार्ट मीटर कार्ड, पुराने बिल या मीटर की डिस्प्ले पर मिलता है।'],
      ['राशि चुनें', 'नीचे दी तालिका से अंदाज़ा लें कि कितने रुपये में लगभग कितनी यूनिट मिलेंगी।'],
      ['भुगतान करें', 'UPI, डेबिट/क्रेडिट कार्ड या नेट-बैंकिंग — भुगतान की रसीद संभालकर रखें।'],
      ['बैलेंस अपडेट देखें', 'बैलेंस आमतौर पर कुछ मिनटों में अपडेट हो जाता है; कभी-कभी कुछ घंटे लग सकते हैं। मीटर की डिस्प्ले या ऐप में जाँचें।'],
    ],
    mr: [
      ['रिचार्ज चॅनल उघडा', channelLine],
      ['ग्राहक / मीटर क्रमांक टाका', 'हा क्रमांक तुमच्या स्मार्ट मीटर कार्ड, जुन्या बिलावर किंवा मीटरच्या डिस्प्लेवर मिळतो.'],
      ['रक्कम निवडा', 'खालील तक्त्यावरून अंदाज घ्या की किती रुपयांत अंदाजे किती युनिट मिळतील.'],
      ['पैसे भरा', 'UPI, डेबिट/क्रेडिट कार्ड किंवा नेट-बँकिंग — भरणा पावती जपून ठेवा.'],
      ['बॅलन्स अपडेट पाहा', 'बॅलन्स सहसा काही मिनिटांत अपडेट होतो; कधीकधी काही तास लागू शकतात. मीटर डिस्प्ले किंवा अ‍ॅपमध्ये तपासा.'],
    ],
    ta: [
      ['ரீசார்ஜ் சேனலைத் திறக்கவும்', channelLine],
      ['நுகர்வோர் / மீட்டர் எண்ணை உள்ளிடவும்', 'இந்த எண் உங்கள் ஸ்மார்ட் மீட்டர் கார்டு, பழைய பில் அல்லது மீட்டர் திரையில் இருக்கும்.'],
      ['தொகையைத் தேர்ந்தெடுக்கவும்', 'எவ்வளவு பணத்திற்கு தோராயமாக எத்தனை யூனிட் என்பதை கீழே உள்ள அட்டவணையில் பாருங்கள்.'],
      ['செலுத்துங்கள்', 'UPI, டெபிட்/கிரெடிட் கார்டு அல்லது நெட்-பேங்கிங் — கட்டண ரசீதை வைத்திருங்கள்.'],
      ['பேலன்ஸ் புதுப்பிப்பைப் பாருங்கள்', 'பேலன்ஸ் பொதுவாக சில நிமிடங்களில் புதுப்பிக்கப்படும்; சில நேரங்களில் சில மணிநேரம் ஆகலாம். மீட்டர் திரை அல்லது ஆப்பில் சரிபார்க்கவும்.'],
    ],
    en: [
      ['Open the recharge channel', channelLine],
      ['Enter your consumer / meter number', 'You\'ll find it on your smart meter card, an old bill, or the meter\'s display.'],
      ['Pick an amount', 'Use the table below to gauge roughly how many units your money buys.'],
      ['Pay', 'UPI, debit/credit card or net-banking — keep the payment receipt.'],
      ['Watch the balance update', 'The balance usually updates within minutes; occasionally it can take a few hours. Check the meter display or the app.'],
    ] });
  const stepsHtml = steps.map(([t, d], i) =>
    `<li><span class="svc-step-num">${i + 1}</span><div><strong>${esc(t)}</strong><span>${d}</span></div></li>`).join('');

  const rows = rechargeRowsHtml(discom, lang);
  const valueTable = rows ? `
    <section class="seo-section">
      <h2>${T(lang, { hi: `₹ कितने में कितनी यूनिट? — ${nm} दरों पर`, mr: `₹ किती मध्ये किती युनिट? — ${nm} दरांवर`, ta: `₹ எவ்வளவுக்கு எத்தனை யூனிட்? — ${nm} விகிதங்களில்`, en: `How many units does a recharge buy on ${nm}?` })}</h2>
      <p>${T(lang, {
        hi: `${nm} की असली घरेलू स्लैब दरों (${rupee(dr.min)}–${rupee(dr.max)}/यूनिट) से निकाला गया मोटा अनुमान। ध्यान रहे — प्रीपेड बैलेंस से सिर्फ़ ऊर्जा शुल्क ही नहीं, फिक्स्ड चार्ज, FPPA और बिजली शुल्क भी रोज़ाना कटते हैं, इसलिए असली यूनिट इससे कुछ कम मिलेंगी।`,
        mr: `${nm} च्या खऱ्या घरगुती स्लॅब दरांवरून (${rupee(dr.min)}–${rupee(dr.max)}/युनिट) काढलेला ढोबळ अंदाज. लक्षात ठेवा — प्रीपेड बॅलन्समधून फक्त ऊर्जा शुल्कच नाही, तर फिक्स्ड चार्ज, FPPA आणि वीज शुल्कही दररोज कापले जातात, म्हणून प्रत्यक्ष युनिट यापेक्षा थोडे कमी मिळतील.`,
        ta: `${nm} இன் உண்மையான வீட்டு அடுக்கு விகிதங்களிலிருந்து (${rupee(dr.min)}–${rupee(dr.max)}/யூனிட்) கணக்கிடப்பட்ட தோராயமான மதிப்பீடு. நினைவில் கொள்ளுங்கள் — ப்ரீபெய்டு பேலன்ஸிலிருந்து மின் கட்டணம் மட்டுமல்ல, நிலையான கட்டணம், FPPA மற்றும் மின் வரியும் தினமும் கழிக்கப்படுகின்றன, எனவே உண்மையான யூனிட்கள் இதைவிட சற்று குறைவாக இருக்கும்.`,
        en: `A rough estimate computed from ${nm}'s real domestic slab rates (${rupee(dr.min)}–${rupee(dr.max)}/unit). Remember — your prepaid balance doesn't only pay energy charges: fixed charges, FPPA and electricity duty are deducted daily too, so actual units will be somewhat lower.` })}</p>
      <div class="comparison-table-wrapper"><table class="comparison-table">
        <thead><tr><th>${T(lang, { hi: 'रिचार्ज राशि', mr: 'रिचार्ज रक्कम', ta: 'ரீசார்ஜ் தொகை', en: 'Recharge amount' })}</th><th class="num">${T(lang, { hi: 'अनुमानित यूनिट', mr: 'अंदाजित युनिट', ta: 'தோராயமான யூனிட்', en: 'Approx. units' })}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="seo-cta-row"><a class="seo-cta" href="${calcHref}">${T(lang, { hi: `सटीक ${nm} बिल कैलकुलेटर खोलें →`, mr: `नेमके ${nm} बिल कॅल्क्युलेटर उघडा →`, ta: `சரியான ${nm} பில் கணிப்பானைத் திறக்கவும் →`, en: `Open the exact ${nm} bill calculator →` })}</a></p>
    </section>` : '';

  const lowBalance = `
    <section class="seo-section">
      <h2>${T(lang, { hi: 'बैलेंस कम या ख़त्म हो जाए तो क्या होता है?', mr: 'बॅलन्स कमी किंवा संपला तर काय होते?', ta: 'பேலன்ஸ் குறைந்தால் அல்லது தீர்ந்தால் என்ன நடக்கும்?', en: 'What happens when the balance runs low or out?' })}</h2>
      <p>${T(lang, {
        hi: `कम बैलेंस पर मीटर/ऐप से अलर्ट (SMS/नोटिफ़िकेशन) मिलता है। बैलेंस निगेटिव होने पर सप्लाई अपने-आप कट सकती है — हालाँकि ज़्यादातर डिस्कॉम रात, रविवार और छुट्टियों में कटौती नहीं करते (नियम डिस्कॉम के अनुसार अलग हैं)। रिचार्ज करते ही सप्लाई आमतौर पर अपने-आप बहाल हो जाती है — कोई अलग reconnection शुल्क नहीं लगता। पूरा विवरण हमारी गाइड में: <a href="${guideBase}smart-meter-prepaid-disconnection/">प्रीपेड स्मार्ट मीटर कटौती के नियम →</a>`,
        mr: `कमी बॅलन्सवर मीटर/अ‍ॅपकडून अलर्ट (SMS/नोटिफिकेशन) मिळतो. बॅलन्स निगेटिव्ह झाल्यास वीजपुरवठा आपोआप खंडित होऊ शकतो — तरी बहुतांश डिस्कॉम रात्री, रविवारी आणि सुट्टीच्या दिवशी खंडित करत नाहीत (नियम डिस्कॉमनुसार वेगळे). रिचार्ज करताच पुरवठा सहसा आपोआप पूर्ववत होतो — वेगळे reconnection शुल्क लागत नाही. संपूर्ण तपशील आमच्या मार्गदर्शकात: <a href="${guideBase}smart-meter-prepaid-disconnection/">प्रीपेड स्मार्ट मीटर खंडित नियम →</a>`,
        ta: `குறைந்த பேலன்ஸில் மீட்டர்/ஆப்பிலிருந்து எச்சரிக்கை (SMS/அறிவிப்பு) வரும். பேலன்ஸ் எதிர்மறையானால் மின் இணைப்பு தானாகவே துண்டிக்கப்படலாம் — இருப்பினும் பெரும்பாலான DISCOM-கள் இரவில், ஞாயிறு மற்றும் விடுமுறை நாட்களில் துண்டிப்பதில்லை (விதிகள் DISCOM-ஐப் பொறுத்து மாறுபடும்). ரீசார்ஜ் செய்தவுடன் இணைப்பு பொதுவாக தானாகவே மீட்டமைக்கப்படும் — தனி மறு-இணைப்புக் கட்டணம் இல்லை. முழு விவரம் எங்கள் வழிகாட்டியில்: <a href="${guideBase}smart-meter-prepaid-disconnection/">ப்ரீபெய்டு ஸ்மார்ட் மீட்டர் துண்டிப்பு விதிகள் →</a>`,
        en: `You get low-balance alerts (SMS/app notification) from the meter. If the balance goes negative, supply can be disconnected automatically — though most DISCOMs do not disconnect at night, on Sundays or on holidays (rules vary by DISCOM). Once you recharge, supply is normally restored automatically with no separate reconnection fee. Full details in our guide: <a href="${guideBase}smart-meter-prepaid-disconnection/">prepaid smart meter disconnection rules →</a>` })}</p>
    </section>`;

  // Key facts table — all real data.
  const factRows = [];
  factRows.push([T(lang, { hi: 'डिस्कॉम', mr: 'डिस्कॉम', ta: 'DISCOM', en: 'DISCOM' }), esc(long)]);
  factRows.push([T(lang, { hi: 'राज्य / केंद्र शासित प्रदेश', mr: 'राज्य / केंद्रशासित प्रदेश', ta: 'மாநிலம் / யூடி', en: 'State / UT' }), esc(sl)]);
  if (region) factRows.push([T(lang, { hi: 'सेवा क्षेत्र', mr: 'सेवा क्षेत्र', ta: 'சேவைப் பகுதி', en: 'Service region' }), esc(region)]);
  if (site) factRows.push([T(lang, { hi: 'आधिकारिक रिचार्ज पोर्टल', mr: 'अधिकृत रिचार्ज पोर्टल', ta: 'அதிகாரப்பூர்வ ரீசார்ஜ் போர்ட்டல்', en: 'Official recharge portal' }), `<a href="${attr(site)}" target="_blank" rel="noopener">${esc(host)} ↗</a>`]);
  if (dr) factRows.push([T(lang, { hi: 'घरेलू ऊर्जा दर', mr: 'घरगुती ऊर्जा दर', ta: 'வீட்டு மின் கட்டணம்', en: 'Domestic energy rate' }), `${rupee(dr.min)} – ${rupee(dr.max)} ${T(lang, { hi: 'प्रति यूनिट', mr: 'प्रति युनिट', ta: 'ஒரு யூனிட்டுக்கு', en: 'per unit' })}`]);
  if (discom.tariffYear) factRows.push([T(lang, { hi: 'टैरिफ वर्ष', mr: 'टॅरिफ वर्ष', ta: 'கட்டண ஆண்டு', en: 'Tariff year' }), esc(fyLabel(discom.tariffYear, lang))]);
  const factsHtml = `
    <section class="seo-section">
      <h2>${T(lang, { hi: `${nm} स्मार्ट मीटर रिचार्ज — एक नज़र में`, mr: `${nm} स्मार्ट मीटर रिचार्ज — एका दृष्टिक्षेपात`, ta: `${nm} ஸ்மார்ட் மீட்டர் ரீசார்ஜ் — ஒரு பார்வையில்`, en: `${nm} smart meter recharge at a glance` })}</h2>
      <table class="seo-facts"><tbody>${factRows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
    </section>`;

  const rcHref = `/recharge-calculator/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}`;
  const related = `
    <section class="seo-section">
      <h2>${T(lang, { hi: 'स्मार्ट मीटर से जुड़ी और मदद', mr: 'स्मार्ट मीटरशी संबंधित आणखी मदत', ta: 'ஸ்மார்ட் மீட்டர் தொடர்பான மேலும் உதவி', en: 'More smart meter help' })}</h2>
      <div class="seo-link-grid">
        <a class="seo-link-card" href="${rcHref}"><strong>${T(lang, { hi: 'रिचार्ज कैलकुलेटर — ₹500 कितने दिन चलेगा?', mr: 'रिचार्ज कॅल्क्युलेटर — ₹500 किती दिवस पुरेल?', ta: 'ரீசார்ஜ் கணிப்பான் — ₹500 எத்தனை நாள்?', en: 'Recharge calculator — how long will ₹500 last?' })}</strong><span>${T(lang, { hi: `${nm} की असली दरों से दैनिक ख़र्च और आदर्श मासिक रिचार्ज`, mr: `${nm} च्या खऱ्या दरांवरून दैनिक खर्च आणि आदर्श मासिक रिचार्ज`, ta: `${nm} இன் உண்மையான விகிதங்களிலிருந்து தினசரி செலவு மற்றும் சிறந்த மாதாந்திர ரீசார்ஜ்`, en: `Daily burn rate and ideal monthly recharge from real ${nm} rates` })}</span></a>
        <a class="seo-link-card" href="${guideBase}smart-meter-running-fast/"><strong>${T(lang, { hi: 'क्या स्मार्ट मीटर तेज़ चलता है?', mr: 'स्मार्ट मीटर वेगात चालतो का?', ta: 'ஸ்மார்ட் மீட்டர் வேகமாக ஓடுகிறதா?', en: 'Is your smart meter running fast?' })}</strong><span>${T(lang, { hi: 'ज़्यादा रीडिंग की असली वजहें और जाँच का तरीक़ा', mr: 'जास्त रीडिंगची खरी कारणे आणि तपासण्याची पद्धत', ta: 'அதிக ரீடிங்குக்கான உண்மையான காரணங்கள் மற்றும் சோதிக்கும் முறை', en: 'Real reasons readings jump, and how to test it' })}</span></a>
        <a class="seo-link-card" href="${guideBase}smart-meter-prepaid-disconnection/"><strong>${T(lang, { hi: 'प्रीपेड कटौती के नियम', mr: 'प्रीपेड खंडित नियम', ta: 'ப்ரீபெய்டு துண்டிப்பு விதிகள்', en: 'Prepaid disconnection rules' })}</strong><span>${T(lang, { hi: 'कब कटती है सप्लाई, कब नहीं — और बहाली कैसे होती है', mr: 'पुरवठा कधी खंडित होतो, कधी नाही — आणि पूर्ववत कसा होतो', ta: 'இணைப்பு எப்போது துண்டிக்கப்படும், எப்போது இல்லை — மீட்டமைப்பு எப்படி', en: 'When supply is cut, when it isn\'t — and how restoration works' })}</span></a>
        <a class="seo-link-card" href="${tariffHref}"><strong>${T(lang, { hi: `${nm} टैरिफ व दरें`, mr: `${nm} टॅरिफ व दर`, ta: `${nm} கட்டணம் & விகிதங்கள்`, en: `${nm} tariff &amp; rates` })}</strong><span>${T(lang, { hi: `पूरी ${esc(fyLabel(discom.tariffYear || 'FY 2025-26', lang))} स्लैब अनुसूची`, mr: `संपूर्ण ${esc(fyLabel(discom.tariffYear || 'FY 2025-26', lang))} स्लॅब अनुसूची`, ta: `முழு ${esc(fyLabel(discom.tariffYear || 'FY 2025-26', lang))} அடுக்கு அட்டவணை`, en: `The full ${esc(discom.tariffYear || 'FY 2025-26')} slab schedule` })}</span></a>
      </div>
    </section>`;

  // FAQs — every answer carries a DISCOM-specific fact.
  const faqs = [];
  faqs.push({
    q: T(lang, { hi: `${discom.name} स्मार्ट मीटर रिचार्ज कैसे करें?`, mr: `${discom.name} स्मार्ट मीटर रिचार्ज कसे करावे?`, ta: `${discom.name} ஸ்மார்ட் மீட்டரை எப்படி ரீசார்ஜ் செய்வது?`, en: `How do I recharge my ${discom.name} smart meter?` }),
    a: `${channelLine} ${T(lang, { hi: 'भुगतान UPI, कार्ड या नेट-बैंकिंग से करें; बैलेंस आमतौर पर कुछ मिनटों में अपडेट हो जाता है।', mr: 'पैसे UPI, कार्ड किंवा नेट-बँकिंगने भरा; बॅलन्स सहसा काही मिनिटांत अपडेट होतो.', ta: 'UPI, கார்டு அல்லது நெட்-பேங்கிங் மூலம் செலுத்துங்கள்; பேலன்ஸ் பொதுவாக சில நிமிடங்களில் புதுப்பிக்கப்படும்.', en: 'Pay by UPI, card or net-banking; the balance usually updates within minutes.' })}` });
  if (dr) faqs.push({
    q: T(lang, { hi: `₹500 के रिचार्ज में ${discom.name} पर कितनी यूनिट मिलती हैं?`, mr: `₹500 च्या रिचार्जमध्ये ${discom.name} वर किती युनिट मिळतात?`, ta: `₹500 ரீசார்ஜில் ${discom.name} இல் எத்தனை யூனிட்?`, en: `How many units does a ₹500 recharge give on ${discom.name}?` }),
    a: T(lang, {
      hi: `${nm} की घरेलू दर ${rupee(dr.min)}–${rupee(dr.max)} प्रति यूनिट है, इसलिए ₹500 में मोटे तौर पर ${Math.floor(500 / dr.max)}–${Math.floor(500 / Math.max(dr.min, 0.01))} यूनिट मिलती हैं — फिक्स्ड चार्ज, FPPA व शुल्क कटने के बाद कुछ कम।`,
      mr: `${nm} चा घरगुती दर ${rupee(dr.min)}–${rupee(dr.max)} प्रति युनिट आहे, म्हणून ₹500 मध्ये ढोबळमानाने ${Math.floor(500 / dr.max)}–${Math.floor(500 / Math.max(dr.min, 0.01))} युनिट मिळतात — फिक्स्ड चार्ज, FPPA व शुल्क कापल्यावर थोडे कमी.`,
      ta: `${nm} இன் வீட்டு விகிதம் ஒரு யூனிட்டுக்கு ${rupee(dr.min)}–${rupee(dr.max)}, எனவே ₹500-க்கு தோராயமாக ${Math.floor(500 / dr.max)}–${Math.floor(500 / Math.max(dr.min, 0.01))} யூனிட் கிடைக்கும் — நிலையான கட்டணம், FPPA மற்றும் வரி கழிந்த பிறகு சற்று குறைவாக.`,
      en: `${nm}'s domestic rate spans ${rupee(dr.min)}–${rupee(dr.max)} per unit, so ₹500 buys roughly ${Math.floor(500 / dr.max)}–${Math.floor(500 / Math.max(dr.min, 0.01))} units — a little less after fixed charges, FPPA and duty are deducted.` }) });
  faqs.push({
    q: T(lang, { hi: 'न्यूनतम रिचार्ज राशि कितनी है?', mr: 'किमान रिचार्ज रक्कम किती आहे?', ta: 'குறைந்தபட்ச ரீசார்ஜ் தொகை என்ன?', en: 'What is the minimum recharge amount?' }),
    a: T(lang, {
      hi: 'न्यूनतम राशि डिस्कॉम के अनुसार अलग-अलग है — सटीक सीमा आधिकारिक पोर्टल/ऐप पर रिचार्ज करते समय दिखती है। बार-बार छोटे रिचार्ज से बेहतर है महीने की अनुमानित खपत के बराबर एक रिचार्ज करना।',
      mr: 'किमान रक्कम डिस्कॉमनुसार वेगळी असते — नेमकी मर्यादा अधिकृत पोर्टल/अ‍ॅपवर रिचार्ज करताना दिसते. वारंवार छोट्या रिचार्जपेक्षा महिन्याच्या अंदाजित वापराइतका एक रिचार्ज करणे बरे.',
      ta: 'குறைந்தபட்ச தொகை DISCOM-ஐப் பொறுத்து மாறுபடும் — சரியான வரம்பு அதிகாரப்பூர்வ போர்ட்டல்/ஆப்பில் ரீசார்ஜ் செய்யும்போது காட்டப்படும். அடிக்கடி சிறிய ரீசார்ஜ்களை விட, மாதாந்திர நுகர்வுக்கு ஏற்ற ஒரு ரீசார்ஜ் வசதியானது.',
      en: 'The minimum varies by DISCOM — the exact limit is shown on the official portal/app at recharge time. Rather than many small top-ups, one recharge sized to your typical monthly consumption is usually more convenient.' }) });
  faqs.push({
    q: T(lang, { hi: 'रिचार्ज के बाद भी बिजली नहीं आई तो?', mr: 'रिचार्ज केल्यावरही वीज आली नाही तर?', ta: 'ரீசார்ஜ் செய்தும் மின்சாரம் வரவில்லை என்றால்?', en: 'I recharged but power hasn\'t come back — what now?' }),
    a: T(lang, {
      hi: 'भुगतान सफल होने पर सप्लाई आमतौर पर अपने-आप बहाल हो जाती है; कुछ मिनट रुकें। न आए तो मीटर की डिस्प्ले पर बैलेंस देखें, रसीद संभालें और 1912 या डिस्कॉम हेल्पलाइन पर शिकायत करें।',
      mr: 'भरणा यशस्वी झाल्यावर पुरवठा सहसा आपोआप पूर्ववत होतो; काही मिनिटे थांबा. न आल्यास मीटर डिस्प्लेवर बॅलन्स पाहा, पावती जपा आणि 1912 किंवा डिस्कॉम हेल्पलाइनवर तक्रार करा.',
      ta: 'கட்டணம் வெற்றிகரமாக இருந்தால் இணைப்பு பொதுவாக தானாகவே மீட்டமைக்கப்படும்; சில நிமிடங்கள் காத்திருங்கள். வரவில்லை என்றால் மீட்டர் திரையில் பேலன்ஸைப் பாருங்கள், ரசீதை வைத்திருங்கள், 1912 அல்லது DISCOM உதவி எண்ணில் புகார் செய்யுங்கள்.',
      en: 'After a successful payment, supply is normally restored automatically; give it a few minutes. If not, check the balance on the meter display, keep your receipt, and raise a complaint on 1912 or your DISCOM helpline.' }) });

  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const bcSmr = T(lang, { hi: 'स्मार्ट मीटर रिचार्ज', mr: 'स्मार्ट मीटर रिचार्ज', ta: 'ஸ்மார்ட் மீட்டர் ரீசார்ஜ்', en: 'Smart Meter Recharge' });
  const trail = [
    { name: bcHome, url: '/' },
    { name: bcSmr, url: hubHref },
    { name: discom.name, url: null },
  ];

  const body = `
  <section class="seo-page container">
    ${breadcrumbs(trail)}
    ${langSwitchLink(enUrl, lang, altLangs)}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    ${site ? `<p class="seo-cta-row"><a class="seo-cta" href="${attr(site)}" target="_blank" rel="noopener">${T(lang, { hi: `आधिकारिक ${nm} पोर्टल पर रिचार्ज करें ↗`, mr: `अधिकृत ${nm} पोर्टलवर रिचार्ज करा ↗`, ta: `அதிகாரப்பூர்வ ${nm} போர்ட்டலில் ரீசார்ஜ் செய்யுங்கள் ↗`, en: `Recharge on the official ${nm} portal ↗` })}</a></p>` : ''}

    <section class="seo-section">
      <h2>${T(lang, { hi: `${nm} स्मार्ट मीटर रिचार्ज के स्टेप`, mr: `${nm} स्मार्ट मीटर रिचार्ज करण्याचे टप्पे`, ta: `${nm} ஸ்மார்ட் மீட்டர் ரீசார்ஜ் படிகள்`, en: `How to recharge a ${nm} smart meter` })}</h2>
      <ol class="svc-steps">${stepsHtml}</ol>
    </section>

    ${valueTable}
    ${lowBalance}
    ${factsHtml}
    ${related}
    ${faqHtml(faqs, lang)}
    <p class="seo-disclaimer">${T(lang, {
      hi: `सामान्य मार्गदर्शन — रिचार्ज चैनल, न्यूनतम राशि और कटौती के नियम डिस्कॉम के अनुसार बदलते हैं। भुगतान हमेशा आधिकारिक ${nm} पोर्टल/ऐप या BBPS-समर्थित ऐप से ही करें; TheDiscomBill कभी आपका खाता नंबर, OTP या पासवर्ड नहीं माँगता। <a href="${hubHref}">सभी डिस्कॉम की रिचार्ज गाइड देखें →</a>`,
      mr: `सामान्य मार्गदर्शन — रिचार्ज चॅनल, किमान रक्कम आणि खंडित होण्याचे नियम डिस्कॉमनुसार बदलतात. पैसे नेहमी अधिकृत ${nm} पोर्टल/अ‍ॅप किंवा BBPS-समर्थित अ‍ॅपवरूनच भरा; TheDiscomBill कधीही तुमचा खाते क्रमांक, OTP किंवा पासवर्ड मागत नाही. <a href="${hubHref}">सर्व डिस्कॉमचे रिचार्ज मार्गदर्शक पाहा →</a>`,
      ta: `பொது வழிகாட்டுதல் — ரீசார்ஜ் சேனல்கள், குறைந்தபட்ச தொகை மற்றும் துண்டிப்பு விதிகள் DISCOM-ஐப் பொறுத்து மாறுபடும். எப்போதும் அதிகாரப்பூர்வ ${nm} போர்ட்டல்/ஆப் அல்லது BBPS-இயக்கப்பட்ட ஆப்பில் மட்டுமே செலுத்துங்கள்; TheDiscomBill உங்கள் கணக்கு எண், OTP அல்லது கடவுச்சொல்லை ஒருபோதும் கேட்காது. <a href="${hubHref}">அனைத்து DISCOM-களின் ரீசார்ஜ் வழிகாட்டிகளைப் பாருங்கள் →</a>`,
      en: `General guidance — recharge channels, minimum amounts and disconnection rules vary by DISCOM. Always pay only on the official ${nm} portal/app or a BBPS-enabled app; TheDiscomBill never asks for your account number, OTP or password. <a href="${hubHref}">See recharge guides for every DISCOM →</a>` })}</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang, altLangs,
    jsonld: [
      breadcrumbJsonLd(trail.map((t, i) => i === trail.length - 1 ? { ...t, url } : t)),
      faqJsonLd(faqs),
    ],
    body,
  });
}

function smartMeterHubPage(states, lang = 'en') {
  const enUrl = '/smart-meter-recharge/';
  const url = langUrl(enUrl, lang);
  const pfx = lang === 'en' ? '' : `/${lang}`;
  const guideBase = `${pfx}/guides/`;
  // Per-DISCOM smart-meter twins only exist for states this language is scoped to.
  const sbase = (s) => `${langServesState(lang, s) ? pfx : ''}/smart-meter-recharge/`;
  const title = T(lang, {
    hi: 'स्मार्ट मीटर रिचार्ज कैसे करें — हर डिस्कॉम की गाइड',
    mr: 'स्मार्ट मीटर रिचार्ज कसे करावे — प्रत्येक डिस्कॉमची गाइड',
    ta: 'ஸ்மார்ட் மீட்டர் ரீசார்ஜ் — ஒவ்வொரு DISCOM-க்கும் வழிகாட்டி',
    en: 'Smart Meter Recharge — Online Guide for Every DISCOM' });
  const description = T(lang, {
    hi: 'प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करने की डिस्कॉम-वार गाइड: आधिकारिक पोर्टल, UPI/BBPS, रिचार्ज में मिलने वाली यूनिट और कम-बैलेंस के नियम — सभी राज्यों के लिए।',
    mr: 'प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करण्याची डिस्कॉम-निहाय गाइड: अधिकृत पोर्टल, UPI/BBPS, रिचार्जमध्ये मिळणारी युनिट आणि कमी-बॅलन्सचे नियम — सर्व राज्यांसाठी.',
    ta: 'ப்ரீபெய்டு ஸ்மார்ட் மீட்டரை ஆன்லைனில் ரீசார்ஜ் செய்யும் DISCOM-வாரி வழிகாட்டி: அதிகாரப்பூர்வ போர்ட்டல்கள், UPI/BBPS, ரீசார்ஜுக்கான யூனிட்கள் மற்றும் குறைந்த-பேலன்ஸ் விதிகள் — அனைத்து மாநிலங்களுக்கும்.',
    en: 'DISCOM-wise guides to recharging a prepaid smart meter online: official portals, UPI/BBPS, units per recharge and low-balance rules — for every Indian state.' });

  const stateBlocks = states.map(state => {
    const discoms = getDiscoms(state);
    if (!discoms.length) return '';
    const b = sbase(state);
    const links = discoms.map(d => `<a href="${b}${slugify(state)}/${d.id}/">${esc(d.name)}</a>`).join('');
    return `
      <div class="seo-dir-state">
        <div class="seo-dir-state-head">
          <span class="seo-dir-badge" aria-hidden="true">${esc(stateCode(state))}</span>
          <span class="seo-dir-state-meta"><h3 class="seo-dir-state-name">${esc(stateName(state, lang))}</h3></span>
        </div>
        <div class="seo-dir-discoms">${links}</div>
      </div>`;
  }).join('');

  const faqs = [
    { q: T(lang, { hi: 'स्मार्ट मीटर रिचार्ज कैसे होता है?', mr: 'स्मार्ट मीटर रिचार्ज कसे होते?', ta: 'ஸ்மார்ட் மீட்டர் ரீசார்ஜ் எப்படி வேலை செய்கிறது?', en: 'How does a smart meter recharge work?' }),
      a: T(lang, {
        hi: 'अपने डिस्कॉम के आधिकारिक पोर्टल/ऐप या BBPS-समर्थित UPI ऐप (PhonePe, Google Pay, Paytm) में उपभोक्ता/मीटर नंबर डालकर राशि चुनें और भुगतान करें। बैलेंस आमतौर पर कुछ मिनटों में अपडेट हो जाता है। ऊपर अपना डिस्कॉम चुनें — हर पेज पर सटीक तरीक़ा दिया है।',
        mr: 'तुमच्या डिस्कॉमच्या अधिकृत पोर्टल/अ‍ॅप किंवा BBPS-समर्थित UPI अ‍ॅप (PhonePe, Google Pay, Paytm) मध्ये ग्राहक/मीटर क्रमांक टाकून रक्कम निवडा आणि पैसे भरा. बॅलन्स सहसा काही मिनिटांत अपडेट होतो. वर तुमचा डिस्कॉम निवडा — प्रत्येक पेजवर नेमकी पद्धत दिली आहे.',
        ta: 'உங்கள் DISCOM-இன் அதிகாரப்பூர்வ போர்ட்டல்/ஆப் அல்லது BBPS-இயக்கப்பட்ட UPI ஆப்பில் (PhonePe, Google Pay, Paytm) நுகர்வோர்/மீட்டர் எண்ணை உள்ளிட்டு தொகையைத் தேர்ந்து செலுத்துங்கள். பேலன்ஸ் பொதுவாக சில நிமிடங்களில் புதுப்பிக்கப்படும். மேலே உங்கள் DISCOM-ஐத் தேர்ந்தெடுங்கள் — ஒவ்வொரு பக்கத்திலும் சரியான முறை உள்ளது.',
        en: 'Enter your consumer/meter number on your DISCOM\'s official portal/app or a BBPS-enabled UPI app (PhonePe, Google Pay, Paytm), pick an amount and pay. The balance usually updates within minutes. Pick your DISCOM above — each page gives the exact channel.' }) },
    { q: T(lang, { hi: 'प्रीपेड स्मार्ट मीटर में बैलेंस ख़त्म हो जाए तो क्या बिजली तुरंत कट जाती है?', mr: 'प्रीपेड स्मार्ट मीटरमध्ये बॅलन्स संपला तर वीज लगेच खंडित होते का?', ta: 'ப்ரீபெய்டு ஸ்மார்ட் மீட்டரில் பேலன்ஸ் தீர்ந்தால் மின்சாரம் உடனே துண்டிக்கப்படுமா?', en: 'Is power cut immediately when a prepaid smart meter balance runs out?' }),
      a: T(lang, {
        hi: 'निगेटिव बैलेंस पर सप्लाई अपने-आप कट सकती है, लेकिन ज़्यादातर डिस्कॉम रात, रविवार और छुट्टियों में कटौती नहीं करते। रिचार्ज करते ही सप्लाई आमतौर पर अपने-आप बहाल हो जाती है।',
        mr: 'निगेटिव्ह बॅलन्सवर पुरवठा आपोआप खंडित होऊ शकतो, पण बहुतांश डिस्कॉम रात्री, रविवारी आणि सुट्टीत खंडित करत नाहीत. रिचार्ज करताच पुरवठा सहसा आपोआप पूर्ववत होतो.',
        ta: 'எதிர்மறை பேலன்ஸில் இணைப்பு தானாகவே துண்டிக்கப்படலாம், ஆனால் பெரும்பாலான DISCOM-கள் இரவில், ஞாயிறு மற்றும் விடுமுறையில் துண்டிப்பதில்லை. ரீசார்ஜ் செய்தவுடன் இணைப்பு பொதுவாக தானாகவே மீட்டமைக்கப்படும்.',
        en: 'Supply can be disconnected automatically on a negative balance, but most DISCOMs do not disconnect at night, on Sundays or holidays. Once you recharge, supply is normally restored automatically.' }) },
    { q: T(lang, { hi: 'क्या स्मार्ट मीटर सामान्य मीटर से ज़्यादा बिल बनाता है?', mr: 'स्मार्ट मीटर सामान्य मीटरपेक्षा जास्त बिल बनवतो का?', ta: 'ஸ்மார்ட் மீட்டர் சாதாரண மீட்டரை விட அதிக பில் போடுமா?', en: 'Does a smart meter bill more than a normal meter?' }),
      a: T(lang, {
        hi: `नहीं — दरें वही टैरिफ आदेश वाली रहती हैं। रीडिंग बढ़ने की असली वजहें (पुराने मीटर की धीमी रीडिंग, बकाया समायोजन आदि) हमारी <a href="${guideBase}smart-meter-running-fast/">गाइड</a> में देखें।`,
        mr: `नाही — दर तेच टॅरिफ आदेशाप्रमाणे राहतात. रीडिंग वाढण्याची खरी कारणे (जुन्या मीटरची कमी रीडिंग, थकबाकी समायोजन इ.) आमच्या <a href="${guideBase}smart-meter-running-fast/">मार्गदर्शकात</a> पाहा.`,
        ta: `இல்லை — விகிதங்கள் கட்டண ஆணையின்படியே இருக்கும். ரீடிங் அதிகரிப்பதற்கான உண்மையான காரணங்களை (பழைய மீட்டர் குறைவாகப் பதிவு செய்தல், நிலுவை சரிசெய்தல் போன்றவை) எங்கள் <a href="${guideBase}smart-meter-running-fast/">வழிகாட்டியில்</a> பாருங்கள்.`,
        en: `No — the rates stay exactly as per the tariff order. The real reasons readings jump (an old meter under-reading, arrears adjustment and more) are covered in our <a href="${guideBase}smart-meter-running-fast/">guide</a>.` }) },
  ];

  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const bcSmr = T(lang, { hi: 'स्मार्ट मीटर रिचार्ज', mr: 'स्मार्ट मीटर रिचार्ज', ta: 'ஸ்மார்ட் மீட்டர் ரீசார்ஜ்', en: 'Smart Meter Recharge' });
  const trail = [{ name: bcHome, url: '/' }, { name: bcSmr, url: null }];
  const smGuides = [
    ['/recharge-calculator/', T(lang, { hi: 'रिचार्ज कैलकुलेटर — ₹500 कितने दिन चलेगा?', mr: 'रिचार्ज कॅल्क्युलेटर — ₹500 किती दिवस पुरेल?', ta: 'ரீசார்ஜ் கணிப்பான் — ₹500 எத்தனை நாள்?', en: 'Recharge calculator — how long will ₹500 last?' })],
    [`${guideBase}smart-meter-running-fast/`, T(lang, { hi: 'क्या स्मार्ट मीटर तेज़ चलता है?', mr: 'स्मार्ट मीटर वेगात चालतो का?', ta: 'ஸ்மார்ட் மீட்டர் வேகமாக ஓடுகிறதா?', en: 'Is your smart meter running fast?' })],
    [`${guideBase}smart-meter-prepaid-disconnection/`, T(lang, { hi: 'प्रीपेड कटौती व बहाली के नियम', mr: 'प्रीपेड खंडित व पूर्ववत नियम', ta: 'ப்ரீபெய்டு துண்டிப்பு & மீட்டமைப்பு விதிகள்', en: 'Prepaid disconnection & restoration rules' })],
    [`${guideBase}smart-meter-recharge-failed/`, T(lang, { hi: 'रिचार्ज फेल / बैलेंस अपडेट नहीं हुआ?', mr: 'रिचार्ज फेल / बॅलन्स अपडेट झाला नाही?', ta: 'ரீசார்ஜ் தோல்வி / பேலன்ஸ் புதுப்பிக்கவில்லையா?', en: 'Recharge failed or balance not updated?' })],
    [`${guideBase}smart-meter-balance-check/`, T(lang, { hi: 'बैलेंस कैसे देखें (डिस्प्ले, ऐप, SMS)', mr: 'बॅलन्स कसा पाहावा (डिस्प्ले, अ‍ॅप, SMS)', ta: 'பேலன்ஸை எப்படிப் பார்ப்பது (திரை, ஆப், SMS)', en: 'How to check your balance (display, app, SMS)' })],
    [`${guideBase}prepaid-vs-postpaid-smart-meter/`, T(lang, { hi: 'प्रीपेड बनाम पोस्टपेड — कौन बेहतर?', mr: 'प्रीपेड विरुद्ध पोस्टपेड — कोणते चांगले?', ta: 'ப்ரீபெய்டு vs போஸ்ட்பெய்டு — எது சிறந்தது?', en: 'Prepaid vs postpaid — which is better?' })],
  ];

  const body = `
  <section class="seo-page container">
    ${breadcrumbs(trail)}
    ${langSwitchLink(enUrl, lang)}
    <h1>${T(lang, { hi: 'स्मार्ट मीटर रिचार्ज — हर डिस्कॉम की ऑनलाइन गाइड', mr: 'स्मार्ट मीटर रिचार्ज — प्रत्येक डिस्कॉमची ऑनलाइन गाइड', ta: 'ஸ்மார்ட் மீட்டர் ரீசார்ஜ் — ஒவ்வொரு DISCOM-க்கும் ஆன்லைன் வழிகாட்டி', en: 'Smart Meter Recharge — Online Guide for Every DISCOM' })}</h1>
    <p class="seo-lead">${T(lang, {
      hi: 'भारत में प्रीपेड स्मार्ट मीटर तेज़ी से लग रहे हैं। अपना डिस्कॉम चुनें — आधिकारिक रिचार्ज पोर्टल, स्टेप-बाय-स्टेप तरीक़ा, और असली टैरिफ दरों से निकाला गया अनुमान कि हर रिचार्ज में कितनी यूनिट मिलती हैं।',
      mr: 'भारतात प्रीपेड स्मार्ट मीटर वेगाने बसवले जात आहेत. तुमचा डिस्कॉम निवडा — अधिकृत रिचार्ज पोर्टल, टप्प्याटप्प्याने पद्धत, आणि खऱ्या टॅरिफ दरांवरून काढलेला अंदाज की प्रत्येक रिचार्जमध्ये किती युनिट मिळतात.',
      ta: 'இந்தியாவில் ப்ரீபெய்டு ஸ்மார்ட் மீட்டர்கள் வேகமாக பொருத்தப்படுகின்றன. உங்கள் DISCOM-ஐத் தேர்ந்தெடுங்கள் — அதன் அதிகாரப்பூர்வ ரீசார்ஜ் போர்ட்டல், படிப்படியான வழிமுறை, மற்றும் உண்மையான கட்டண விகிதங்களிலிருந்து கணக்கிடப்பட்ட ஒவ்வொரு ரீசார்ஜுக்கும் எத்தனை யூனிட் என்ற மதிப்பீடு.',
      en: 'Prepaid smart meters are rolling out fast across India. Pick your DISCOM for its official recharge portal, step-by-step instructions, and a units-per-recharge estimate computed from its real tariff rates.' })}</p>
    <div class="seo-directory">${stateBlocks}</div>
    <section class="seo-section">
      <h2>${T(lang, { hi: 'स्मार्ट मीटर गाइड व टूल', mr: 'स्मार्ट मीटर मार्गदर्शक व टूल', ta: 'ஸ்மார்ட் மீட்டர் வழிகாட்டிகள் & கருவிகள்', en: 'Smart meter guides & tools' })}</h2>
      <div class="seo-link-grid">
        ${smGuides.map(([href, label]) => `<a class="seo-link-card" href="${href}"><strong>${label}</strong></a>`).join('')}
      </div>
    </section>
    ${faqHtml(faqs, lang)}
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: enUrl, lang,
    jsonld: [breadcrumbJsonLd(trail.map((t, i) => i === trail.length - 1 ? { ...t, url } : t)), faqJsonLd(faqs)],
    body,
  });
}

// ── sitemap + robots ──────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/compare/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/usage/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/solar/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/ev/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/tariffs/', priority: '0.8', changefreq: 'monthly' },
  // '/tariffs/states/' is added in buildSitemap() with its Hindi alternate.
  { loc: '/services/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/recharge-calculator/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/bill-review/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/bill-review/sample-report/', priority: '0.5', changefreq: 'yearly' },
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
  // `langs` lists the vernacular twins that exist for a URL. Pan-India pages get all of them;
  // guide articles get only the languages they're translated into; tariff/state/smart-meter
  // pages get only the languages scoped to that state. Every listed twin is emitted as its own
  // <url> and cross-linked with the full xhtml:link hreflang set (Google's recommended form).
  urls.push({ loc: '/guides/', priority: '0.8', changefreq: 'monthly', langs: [...VERNACULARS] });
  for (const g of GUIDES) {
    urls.push({ loc: `/guides/${g.slug}/`, priority: '0.7', changefreq: 'monthly', langs: VERNACULARS.filter(l => guideHasBody(g, l)) });
  }
  urls.push({ loc: '/glossary/', priority: '0.7', changefreq: 'monthly', langs: [...VERNACULARS] });
  urls.push({ loc: '/tariffs/states/', priority: '0.8', changefreq: 'monthly', langs: [...VERNACULARS] });
  urls.push({ loc: '/smart-meter-recharge/', priority: '0.8', changefreq: 'monthly', langs: [...VERNACULARS] });
  for (const state of states) {
    const stateSlug = slugify(state);
    const sLangs = VERNACULARS.filter(l => langServesState(l, state));
    urls.push({ loc: `/tariffs/${stateSlug}/`, priority: '0.7', changefreq: 'monthly', langs: sLangs });
    for (const d of getDiscoms(state)) {
      urls.push({ loc: `/tariffs/${stateSlug}/${d.id}/`, priority: '0.6', changefreq: 'monthly', langs: sLangs });
      urls.push({ loc: `/smart-meter-recharge/${stateSlug}/${d.id}/`, priority: '0.6', changefreq: 'monthly', langs: sLangs });
    }
  }
  const entries = [];
  for (const u of urls) {
    const langs = u.langs || [];
    const altLinks = langs.length ? `
    <xhtml:link rel="alternate" hreflang="en-IN" href="${SITE}${u.loc}"/>${langs.map(l =>
    `\n    <xhtml:link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${SITE}${langUrl(u.loc, l)}"/>`).join('')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${u.loc}"/>` : '';
    const lastmod = u.isStatic ? staticLastmod(u.loc) : generatedLastmod(u.loc);
    entries.push(`  <url>
    <loc>${SITE}${u.loc}</loc>${altLinks}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`);
    for (const l of langs) entries.push(`  <url>
    <loc>${SITE}${langUrl(u.loc, l)}</loc>${altLinks}
    <lastmod>${generatedLastmod(langUrl(u.loc, l))}</lastmod>
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

> Free, browser-based electricity bill calculator for India. Covers 65+ distribution companies (DISCOMs) across all 35 states and union territories with slab-wise energy charges, fixed/demand charges, FPPA fuel surcharge, electricity duty, solar net metering and Time-of-Day billing. Independent — not affiliated with any DISCOM, SERC or government body. Estimates are provisional; official bills come from the DISCOM.

Tariff data is compiled from publicly available tariff orders (FY 2024-25 / 2025-26) and the calculation engine applies each DISCOM's published methodology: slab-wise rates, sanctioned-load-based fixed charges, then surcharges and duty.

## Tools

- [Bill Calculator](${SITE}/): instant provisional electricity bill for any Indian DISCOM with a full slab-wise breakdown
- [Tariff Comparison](${SITE}/compare/): major DISCOMs compared at 200/400/600/1000 units for domestic and commercial
- [Electricity Cost Calculator](${SITE}/usage/): estimate monthly kWh and cost from household appliances
- [Rooftop Solar Savings](${SITE}/solar/): system sizing, payback and net-metering savings
- [EV Charging Cost Calculator](${SITE}/ev/): cost per charge, per km and monthly charging bill for any EV, with petrol comparison
- [Bill Check](${SITE}/bill-check/): direct links to every DISCOM's official view/pay-bill portal
- [Bill Review by Experts](${SITE}/bill-review/): upload a bill and have a human expert review it (free account)
- [New Connection](${SITE}/new-connection/): charges, documents and process per DISCOM
- [Complaint](${SITE}/complaint/): DISCOM complaint portals and the 1912 national helpline
- [Smart Meter Recharge](${SITE}/smart-meter-recharge/): per-DISCOM guides to recharging a prepaid smart meter online, with units-per-recharge estimates from real tariff rates
- [Smart Meter Recharge Calculator](${SITE}/recharge-calculator/): how many days a ₹200–₹2000 prepaid recharge lasts on any DISCOM — daily burn rate and ideal monthly recharge from real tariff rates

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
- Slab calculations are slab-wise: each rate applies only to units within its slab.
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

// ── site search index ─────────────────────────────────────────────────────────
// A compact, build-time index for the header search (js/search.js): every tool
// page, guide, glossary term and tariff page in one small module the browser
// lazy-loads only when the search opens. Entry shape (short keys = small file):
//   t  — English title            h  — Hindi title (when a Hindi rendering exists)
//   u  — English URL              hu — Hindi URL (only when the /hi/ twin is emitted)
//   k  — extra match keywords     g  — group: tool | guide | glossary | tariff
function writeSearchIndex(states) {
  const entries = [];

  // Tool + info pages (hand-listed: these are static routes, not generated ones).
  // Hindi titles come from the runtime language switch, so no `hu` — the pages
  // themselves are single-URL with client-side i18n.
  [
    ['Bill Calculator', 'बिजली बिल कैलकुलेटर', '/#calculator', 'electricity bill calculator check'],
    ['Compare Tariffs', 'टैरिफ तुलना', '/compare/', 'comparison states discom rates'],
    ['Solar Savings Calculator', 'सोलर बचत कैलकुलेटर', '/solar/', 'rooftop solar net metering pm surya ghar'],
    ['EV Charging Cost Calculator', 'EV चार्जिंग लागत कैलकुलेटर', '/ev/', 'ev electric vehicle charging cost per km nexon ather petrol comparison'],
    ['Electricity Cost Calculator', 'बिजली लागत कैलकुलेटर', '/usage/', 'appliance electricity cost usage estimator units consumption kwh'],
    ['Bill Check', 'बिल जांच', '/bill-check/', 'verify bill overcharge audit'],
    ['Expert Bill Review', 'विशेषज्ञ बिल समीक्षा', '/services/', 'services expert review complaint help'],
    ['New Connection Guide', 'नया कनेक्शन गाइड', '/new-connection/', 'apply new electricity connection documents'],
    ['Complaint Letter Generator', 'शिकायत पत्र जनरेटर', '/complaint/', 'complaint letter discom forum grievance'],
    ['All Guides', 'सभी गाइड', '/guides/', 'guides articles help'],
    ['Billing Glossary', 'बिलिंग शब्दावली', '/glossary/', 'terms definitions glossary'],
    ['All States & DISCOMs', 'सभी राज्य और डिस्कॉम', '/tariffs/states/', 'tariff directory states list'],
    ['Smart Meter Recharge', 'स्मार्ट मीटर रिचार्ज', '/smart-meter-recharge/', 'prepaid smart meter recharge online balance'],
    ['Smart Meter Recharge Calculator', 'स्मार्ट मीटर रिचार्ज कैलकुलेटर', '/recharge-calculator/', 'recharge days last how long 500 prepaid balance calculator'],
    ['Methodology', 'कार्यप्रणाली', '/methodology/', 'how rates verified sources'],
  ].forEach(([t, h, u, k]) => entries.push({ t, h, u, k, g: 'tool' }));

  for (const guide of GUIDES) {
    entries.push({
      t: guide.title,
      ...(guide.titleHi ? { h: guide.titleHi } : {}),
      u: `/guides/${guide.slug}/`,
      ...(guide.sectionsHi ? { hu: `/hi/guides/${guide.slug}/` } : {}),
      g: 'guide',
    });
  }

  for (const term of GLOSSARY) {
    entries.push({
      t: term.term,
      ...(term.termHi ? { h: term.termHi } : {}),
      u: `/glossary/#${term.slug}`,
      hu: `/hi/glossary/#${term.slug}`,
      k: [term.abbr, ...(term.aka || [])].filter(Boolean).join(' '),
      g: 'glossary',
    });
  }

  for (const state of states) {
    const stateSlug = slugify(state);
    entries.push({
      t: `${state} Electricity Tariff`, h: `${hiState(state)} बिजली टैरिफ`,
      u: `/tariffs/${stateSlug}/`, hu: `/hi/tariffs/${stateSlug}/`,
      g: 'tariff',
    });
    for (const discom of getDiscoms(state)) {
      entries.push({
        t: `${discom.name} Tariff`,
        u: `/tariffs/${stateSlug}/${discom.id}/`, hu: `/hi/tariffs/${stateSlug}/${discom.id}/`,
        k: [discom.fullName, discom.area, state].filter(Boolean).join(' '),
        g: 'tariff',
      });
      entries.push({
        t: `${discom.name} Smart Meter Recharge`,
        u: `/smart-meter-recharge/${stateSlug}/${discom.id}/`, hu: `/hi/smart-meter-recharge/${stateSlug}/${discom.id}/`,
        k: [discom.fullName, state, 'prepaid recharge online'].filter(Boolean).join(' '),
        g: 'recharge',
      });
    }
  }

  const body = '// js/search-index.js — GENERATED by generate-seo.js. Do not edit by hand.\n'
    + 'export const SEARCH_INDEX = '
    + JSON.stringify(entries)
    + ';\n';
  fs.writeFileSync(path.join(ROOT, 'js', 'search-index.js'), body, 'utf8');
  return entries.length;
}

// ── run ───────────────────────────────────────────────────────────────────────
export function generateSeo() {
  const states = getStates();
  let pages = 0;

  // English at the canonical path; each vernacular twin under its /<lang>/ prefix — same
  // builders, lang-switched. Pan-India pages (directory, guides, glossary, hub) are emitted in
  // every language; tariff/state/smart-meter pages only in languages scoped to that state
  // (Hindi=all, Marathi=Maharashtra, Tamil=Tamil Nadu); guide articles only where translated.
  // emitPage() resolves each page's content-derived <lastmod> (see the manifest logic above).
  for (const lang of ALL_LANGS) {
    const p = lang === 'en' ? '' : `${lang}/`;

    emitPage(`${p}tariffs/states`, directoryPage(states, lang));
    pages++;

    emitPage(`${p}guides`, guidesIndexPage(lang));
    pages++;
    for (const guide of GUIDES) {
      if (lang !== 'en' && !guideHasBody(guide, lang)) continue;   // untranslated guides stay English-only
      emitPage(`${p}guides/${guide.slug}`, guidePage(guide, lang));
      pages++;
    }

    emitPage(`${p}glossary`, glossaryPage(lang));
    pages++;

    emitPage(`${p}smart-meter-recharge`, smartMeterHubPage(states, lang));
    pages++;

    for (const state of states) {
      if (!langServesState(lang, state)) continue;   // vernacular tariff twins are state-scoped
      const stateSlug = slugify(state);
      emitPage(`${p}tariffs/${stateSlug}`, statePage(state, lang));
      pages++;
      for (const discom of getDiscoms(state)) {
        emitPage(`${p}tariffs/${stateSlug}/${discom.id}`, discomPage(state, discom, lang));
        pages++;
        emitPage(`${p}smart-meter-recharge/${stateSlug}/${discom.id}`, smartMeterDiscomPage(state, discom, lang));
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
  const searchEntries = writeSearchIndex(states);
  const cssKb = writeMinifiedCss();

  console.log(`SEO: generated ${pages} landing pages across ${states.length} states, plus sitemap.xml + robots.txt + llms.txt + search-index.js (${searchEntries} entries) + styles.min.css (${cssKb})`);
  return { pages, states: states.length };
}

// Allow running directly: `node generate-seo.js`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateSeo();
}
