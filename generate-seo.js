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
import { buildContentCss } from './scripts/split-css.mjs';
import { execSync } from 'child_process';

import { TARIFF_DB, STATE_META, getStates, getDiscoms, tariffAge, ensureAll } from './js/tariffs/registry.js';
import { buildTariffIndex } from './scripts/build-tariff-index.mjs';
import { buildTariffDatabase } from './scripts/build-tariff-database.mjs';

import { SMG } from './smart-meter-content.js';
import { METER_SVG, METER_DEVICE } from './smart-meter-svg.js';
// The same seven-segment renderer the runtime uses, so the digits in the served HTML are the
// ones paintMeter() would draw — the glass shipped with the drawing's own sample reading
// (04912.6) while the bill beside it said 14,820.
import { segmentsFor } from './js/smart-meter.js';
import { SCENARIO_COPY, LINES, UB } from './understand-bill-content.js';
import { SCENARIOS, DEFAULT_SCENARIO, billInput, readout, billHtml, liveHtml } from './js/bill-anatomy.js';

// The registry serves an index up front and loads tariff tables per state in the browser.
// A whole-site pre-render needs all of them, so pull the lot before anything reads a rate.
// Rebuilding the index first means a state file edited without regenerating cannot leave the
// generated pages describing DISCOMs the index no longer lists.
await buildTariffIndex({ quiet: true });
await ensureAll();
import { FPPA_BY_STATE, FPPA_BY_DISCOM, pick as pickFppa } from './js/tariffs/fppa.js';
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

// ── vernacular link healing ───────────────────────────────────────────────────
// Translated guide/hub bodies hardcode internal links with a /hi|/mr|/ta prefix, but not
// every twin is emitted: Tamil/Marathi tariff pages are state-scoped, and many guides have
// no vernacular twin — so some of those links 404. Rather than police the content by hand,
// downgrade any prefixed link whose twin won't exist to the English page (which always does).
// Applied to page BODIES only (layout), so head hreflang/canonical are never touched.
let _slugToState = null;
const slugToState = (slug) => {
  if (!_slugToState) { _slugToState = {}; for (const s of getStates()) _slugToState[slugify(s)] = s; }
  return _slugToState[slug];
};
function vernacularTwinEmitted(l, kind, rest) {
  const first = rest.split('/')[0];
  if (kind === 'guides') {
    if (!first) return true;                              // /l/guides/ index — emitted every lang
    const g = GUIDES.find(x => x.slug === first);
    return g ? guideHasBody(g, l) : false;               // unknown slug → downgrade (best effort)
  }
  if (!first || first === 'states') return true;          // hubs (/l/tariffs/, /l/.../states/) exist
  const state = slugToState(first);                       // tariffs + smart-meter are state-scoped
  return state ? langServesState(l, state) : true;        // unknown state → leave as authored
}
const healVernacularLinks = (html) =>
  html.replace(/\/(hi|mr|ta)\/(guides|tariffs|smart-meter-recharge)\/([a-z0-9/_-]*)/g,
    (m, l, kind, rest) => vernacularTwinEmitted(l, kind, rest) ? m : `/${kind}/${rest}`);

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

// Brands worth MATCHING in site search but not worth putting in a title. Mahavitaran is
// 285 impressions in the Aug 2026 GSC export against MSEDCL's 978, so it earns a keyword
// rather than a rename. (The 1,662 for "mahadiscom" is almost all `wss mahadiscom` portal
// navigation, which belongs to the official site and is not ours to win.)
const SEARCH_ALIAS = { msedcl: ['Mahavitaran'] };

// Alternate names to match this DISCOM on in site search: the SEARCH_ALIAS entries above,
// plus any part of its consumer-facing name that its own name does not already contain
// ("MVVNL (UPPCL)" minus "MVVNL" leaves "UPPCL").
//
// The CONSUMER_NAME aliases were never fed into the search index, so the site failed to find
// pages under the very term their own titles lead with — typing "tneb" or "uppcl" into the
// header search returned nothing, while those are 2,363 and 814 impressions respectively in
// Google, against 504 for tangedco/tnpdcl and 119 for the four VVNLs combined. Deriving the
// list from CONSUMER_NAME rather than restating it keeps the two from drifting apart.
function discomAliases(discom) {
  const out = [...(SEARCH_ALIAS[discom.id] || [])];
  const cn = CONSUMER_NAME[discom.id];
  if (cn) {
    for (const part of cn.split(/[()]/).map(s => s.trim()).filter(Boolean)) {
      if (!discom.name.toLowerCase().includes(part.toLowerCase())) out.push(part);
    }
  }
  return out;
}
// Bare year for titles: "FY 2025-26" / "2025-26" → "2025-26".
const yearLabel = (fy) => String(fy).replace(/^FY\s*/i, '');
// The year for the "…Bill Calculator <year>" slot: the plain calendar year people type
// into search at build time — NOT the tariff-order vintage. The order year (fy) stays on
// every "Tariff" phrase, description, badge and body line, so the SERP looks current
// without overstating how new the rates are. (July-2026 builds were still titling pages
// "2024-25" — a sitewide CTR leak.)
const TITLE_YEAR = String(new Date().getFullYear());

// ── shared chrome (header / footer) ───────────────────────────────────────────
// `langMenu` is built per page by langMenuItems() below, so the switcher's rows are real
// links to that page's twins rather than fixed markup driven entirely by JS. It is passed
// in as a token and swapped in after langChrome() — see the call site in layout().
const LANGMENU_TOKEN = '<!--LANGMENU-->';
const HEADER = (langMenu) => `
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
      <a href="/smart-meter/" class="nav-promoted" data-i18n="nav.smartMeter">Smart Meter</a>
      <a href="/tariffs/states/" class="nav-promoted" data-i18n="nav.tariffs">Tariffs</a>
      <a href="/guides/" class="nav-promoted" data-i18n="nav.blog">Blog</a>
      <!-- Solar tools, DISCOM services, the extra calculators and the Learn pages all moved
           to the footer sitemap. The header now carries only the four primary destinations —
           see FOOTER below, which is shared chrome on every page, so nothing lost a link. -->
      <div class="nav-dropdown nav-mob-only" id="quickLinksDropdown">
        <button type="button" class="nav-dropdown-trigger" id="quickLinksTrigger" aria-haspopup="true" aria-expanded="false">
          <span data-i18n="nav.quickLinks">More</span>
          <svg class="nav-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="nav-dropdown-menu nav-menu-card" id="quickLinksMenu" role="menu">
          <div class="nav-mob-links" role="presentation">
            <a href="/#calculator" class="nav-dropdown-item nav-mob-sm" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg><span data-i18n="nav.calculator">Calculator</span></a>
            <a href="/smart-meter/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7.5 8h9"/><path d="m12.5 11.5-2.5 3.5h3l-2 3.5"/></svg><span data-i18n="nav.smartMeter">Smart Meter</span></a>
            <a href="/tariffs/states/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg><span data-i18n="nav.tariffs">Tariffs</span></a>
            <a href="/guides/" class="nav-dropdown-item" role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span data-i18n="nav.blog">Blog</span></a>
          </div>
        </div>
      </div>
      <div class="lang-switch" id="langSwitch">
        <!-- aria-labelledby, not aria-label: the accessible name has to CONTAIN the visible
             text ("EN"), or speech input cannot activate the button and a screen reader never
             announces which language is active (WCAG 2.5.3). Referencing the live span also
             keeps the name in step when syncLangUI() rewrites the badge. -->
        <button type="button" class="lang-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false" aria-labelledby="langTriggerText langTriggerLabel">
          <span class="lang-trigger-text" id="langTriggerText">EN</span>
          <span class="sr-only" id="langTriggerLabel">— change language / भाषा बदलें</span>
          <svg class="lang-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <!-- A plain list of links, not a listbox. These rows navigate, so they are anchors:
             that makes them crawlable, middle-clickable and keyboard-operable for free,
             none of which a role="option" <li> with a click handler ever was. Rows that
             translate in place (no twin URL to point at) stay <button>s. -->
        <ul class="lang-menu" id="langMenu" aria-label="Select language">
          ${langMenu}
        </ul>
      </div>
      <button type="button" id="siteSearchBtn" class="site-search-btn" aria-label="Search the site (Ctrl+K)" title="Search (Ctrl+K)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></button>
      <button type="button" id="themeToggle" class="theme-toggle" aria-label="Switch theme" title="Toggle light / dark theme"><svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><g class="tt-sun" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5" fill="none"/></g><path class="tt-moon" fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg></button>
    </nav>
  </div>
</header>`;

// The footer is the site's link graph. Everything trimmed out of the header lives here,
// on every generated page, so relocating those links cost no internal-link depth — the
// header got leaner without the crawl paths to ~490 pages getting shorter.
const FOOTER_SITEMAP = `
    <nav class="footer-map" aria-label="All pages">
      <div class="footer-col">
        <span class="footer-col-title" data-i18n="ql.tools">Tools</span>
        <a href="/#calculator" data-i18n="nav.calculator">Calculator</a>
        <a href="/compare/" data-i18n="nav.compare">Compare</a>
        <a href="/electricity-cost-calculator/" data-i18n="ql.usage">Electricity Cost Calculator</a>
        <a href="/ev-charging-calculator/" data-i18n="ql.ev">EV Charging Cost</a>
        <a href="/sanctioned-load-optimizer/" data-i18n="ql.loadOptimizer">Sanctioned Load Optimizer</a>
        <a href="/tenant-submeter-calculator/" data-i18n="ql.tenantMeter">Tenant Sub-Meter Calculator</a>
        <a href="/install/" data-i18n="ql.install">Install Offline App</a>
      </div>
      <div class="footer-col">
        <span class="footer-col-title" data-i18n="ql.solarTools">Solar Tools</span>
        <a href="/solar-calculator/" data-i18n="nav.solarSavings">Rooftop Solar Savings Calculator 2026</a>
        <a href="/solar-panel-size-calculator/" data-i18n="nav.solarSize">Solar Panel Size Calculator (2026)</a>
        <a href="/solar-battery-backup-calculator/" data-i18n="nav.solarBattery">Solar Battery Backup Calculator (2026)</a>
        <a href="/solar-subsidy-checker/" data-i18n="nav.solarSubsidy">Solar Subsidy Checker</a>
      </div>
      <div class="footer-col">
        <span class="footer-col-title" data-i18n="ql.services">Services</span>
        <a href="/services/" data-i18n="ql.discomServices">DISCOM Services</a>
        <a href="/smart-meter-recharge/" data-i18n="ql.smartMeter">Smart Meter Recharge</a>
        <a href="/smart-meter/" data-i18n="ql.meterDisplay">Smart Meter Guide</a>
        <a href="/check-my-bill/" data-i18n="ql.ocrCheck">Instant Bill Self-Check (OCR)</a>
        <a href="/bill-review/" data-i18n="ql.billReview">Expert Bill Review</a>
        <a href="/services/#new-connection" data-i18n="footer.newConnection">New Connection</a>
      </div>
      <div class="footer-col">
        <span class="footer-col-title" data-i18n="ql.learn">Learn</span>
        <a href="/tariffs/states/" data-i18n="footer.allStates">All States &amp; DISCOMs</a>
        <a href="/guides/" data-i18n="nav.blog">Blog</a>
        <a href="/glossary/" data-i18n="ql.glossary">Bill Glossary</a>
        <a href="/understand-your-bill/" data-i18n="ql.understandBill">Understand Your Bill</a>
        <a href="/methodology/" data-i18n="ql.methodology">Methodology &amp; Accuracy</a>
        <a href="/database/">Tariff Database</a>
        <a href="/fppa/" data-i18n="ql.fuelSurcharge">Fuel Surcharge Tracker</a>
        <a href="/#about" data-i18n="nav.about">About</a>
        <a href="/contact/" data-i18n="ql.contact">Contact</a>
      </div>
    </nav>`;

const FOOTER = `
<footer>
  <div class="container">${FOOTER_SITEMAP}
    <p><span data-i18n="footer.rights">&copy; 2026 TheDiscomBill. All rights reserved.</span> &nbsp;|&nbsp; <a href="/#about" data-i18n="footer.disclaimer">Disclaimer</a> &nbsp;|&nbsp; <a href="/methodology/" data-i18n="footer.methodology">Methodology</a> &nbsp;|&nbsp; <a href="/privacy/" data-i18n="ql.privacy">Privacy Policy</a> &nbsp;|&nbsp; <a href="/cookies/" data-i18n="ql.cookies">Cookie Policy</a></p>
    <!-- Facebook returns here once the account exists -->
    <div class="soc-links" aria-label="Social media">
      <a class="soc-link" href="mailto:support@thediscombill.com" aria-label="Email" title="Email us"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></a>
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
// Matches the `badge` column of LANGS in js/i18n.js, which rebuilds this same menu at runtime.
const LANG_BADGE = { en: 'EN', hi: 'हिं', mr: 'म', ta: 'த' };

// The rows of the header language switcher for ONE page.
//
// These used to be `<li data-lang="hi">` with a JS click handler, which meant the /hi/, /mr/
// and /ta/ trees had no inbound link anywhere on the site. The only thing pointing at them was
// the <link rel="alternate"> block, and hreflang is a hint about how URLs relate — not a way in.
//
// A language gets an anchor only where a twin actually exists, and that set is `altLangs`: the
// very list the hreflang block below is built from. Deriving both from one argument is what
// keeps a visible link from ever promising a page the hreflang set doesn't claim — /hi/ has no
// homepage, for instance, so the homepage must not offer one.
//
// Pages that translate in place from the string tables have no URL to point at; those rows stay
// <button>s. js/i18n.js re-renders this menu on load with the same shape.
function langMenuItems(page, lang, altLangs) {
  const codes = ['en', ...(page ? altLangs : ['hi']).filter(l => l !== 'en')];
  return codes.map(l => {
    const label = `<span class="lang-opt-name">${LANG_NATIVE[l]}</span>`
      + `<span class="lang-opt-code">${LANG_BADGE[l]}</span>`;
    if (l === lang) {
      return `<li><span class="lang-opt" data-lang="${l}" aria-current="true">${label}</span></li>`;
    }
    if (!page) {
      return `<li><button type="button" class="lang-opt" data-lang="${l}">${label}</button></li>`;
    }
    const href = l === 'en' ? page : langUrl(page, l);
    return `<li><a class="lang-opt" href="${attr(href)}" hreflang="${LANG_LOCALE[l]}"`
      + ` lang="${l}" data-lang="${l}">${label}</a></li>`;
  }).join('\n          ');
}
const OG_LOCALE = { en: 'en_IN', hi: 'hi_IN', mr: 'mr_IN', ta: 'ta_IN' };

// `page` is the site-relative English URL of this page (e.g. "/glossary/"). When given,
// the full hreflang set for every language twin that exists for this page is emitted;
// `lang` picks which variant this is. `altLangs` restricts which vernacular twins exist
// (defaults to all — pass a subset for state-scoped pages).
function layout({ title, description, canonical, jsonld = [], body, lang = 'en', page = null, altLangs = VERNACULARS, ogImage = null, robots = 'index, follow, max-image-preview:large', noCanonical = false }) {
  // Per-page social card when one has been generated (scripts/og-images.mjs writes
  // /og/<key>.jpg); otherwise the shared default. existsSync keeps it safe: a page
  // referencing an image that hasn't been rendered yet falls back, never 404s a card.
  const ogImg = (ogImage && fs.existsSync(path.join(ROOT, 'og', `${ogImage}.jpg`)))
    ? `${SITE}/og/${ogImage}.jpg` : `${SITE}/og-image.jpg`;
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
  // SERP-facing copy is clamped HERE rather than at each of the ~30 call sites, so a new page
  // template cannot ship an over-long title by forgetting to call fitTitle().
  //
  // Only <title> and <meta name="description"> are clamped. og:/twitter: descriptions and the
  // WebPage schema node above deliberately keep the full text: social cards allow far more
  // room than a SERP snippet, and structured data is not truncated at all — so nothing is
  // lost, the long copy simply stops being the thing Google cuts off mid-word.
  const serpTitle = fitText(title, TITLE_WIDTH);
  const serpDesc = HOLD_SNIPPET.has(canonical) ? description : fitText(description, DESC_WIDTH);
  // hreflang set: Google needs it on EVERY variant, and x-default points at English.
  const alternates = page ? `
  <link rel="alternate" hreflang="en-IN" href="${SITE}${page}">${altLangs.map(l =>
  `\n  <link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${SITE}${langUrl(page, l)}">`).join('')}
  <link rel="alternate" hreflang="x-default" href="${SITE}${page}">` : '';
  // On a vernacular page the URL itself is an explicit language choice: persist it so the
  // client i18n layer renders the shared chrome (nav/footer) in that language immediately.
  const langBoot = lang !== 'en' ? `try { localStorage.setItem('lang', '${lang}'); } catch (e) {}` : '';
  // The menu is substituted AFTER langChrome, never before: langChrome rewrites bare chrome
  // hrefs like "/guides/" to "/hi/guides/", and on the Hindi guides index the switcher's
  // "English" row is exactly that string — it would have been rewritten to point at the very
  // Hindi page it is offering to leave.
  const chrome = langChrome(HEADER(LANGMENU_TOKEN), lang)
    .replace(LANGMENU_TOKEN, langMenuItems(page, lang, altLangs));
  const footer = langChrome(FOOTER, lang);
  // A page with no vernacular twins must not offer vernaculars in the switcher: the body is
  // static prose, so picking Hindi translates the chrome and leaves the article in English.
  // The attribute is DERIVED from altLangs rather than passed in, so a new English-only page
  // template cannot forget it — /fuel-surcharge/ and /understand-your-bill/ both had the dead
  // option before this.
  return `<!DOCTYPE html>
<html lang="${lang}"${altLangs.length ? '' : ' data-i18n-twins-only'}>
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
  <title>${esc(serpTitle)}</title>
  <meta name="description" content="${attr(serpDesc)}">
  ${noCanonical ? '' : `<link rel="canonical" href="${attr(canonical)}">`}${alternates}
  <meta name="robots" content="${robots}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TheDiscomBill">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:alt" content="${attr(title)}">
  <meta property="og:locale" content="${OG_LOCALE[lang] || 'en_IN'}">
  ${lang !== 'en' ? '<meta property="og:locale:alternate" content="en_IN">' : '<meta property="og:locale:alternate" content="hi_IN">'}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(description)}">
  <meta name="twitter:image" content="${ogImg}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
  <link rel="icon" href="/favicon-96.png" sizes="96x96" type="image/png">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <!-- Self-hosted fonts (fonts/fonts.css). Same-origin, subsetted to latin + the ₹ sign;
       display=swap shows fallback text immediately. These are variable fonts, so one file
       per family covers every weight — there is nothing left to preload per weight. -->
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-var-latin.woff2">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/space-grotesk-var-latin.woff2">
  <link rel="stylesheet" href="/fonts/fonts.css">
  <!-- Not styles.min.css: these generated pages are content, and 78% of the full sheet is
       the calculator app — the bill renderer, the comparison tool, the Bill Review portal,
       the datepicker — none of which a guide or tariff page ever shows. content.min.css is
       built by scripts/split-css.mjs from the markup of exactly the pages that link it, so
       it cannot drift. Hand-written tool pages keep the full sheet. -->
  <link rel="stylesheet" href="/css/content.min.css">
  <!-- Google tag (gtag.js) -->
  <!-- gtag.js is ~167KB and cost 650-1300ms of mobile main-thread time when it loaded here
       eagerly. The dataLayer stub below queues every gtag() call, so deferring the library
       to idle (or the first interaction, whichever lands first) loses no events. -->
  <script>
    (function () {
      var done = false;
      function load() {
        if (done) return; done = true;
        var s = document.createElement("script");
        s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=G-D0SSNW5RZ6";
        document.head.appendChild(s);
      }
      ["pointerdown", "keydown", "scroll"].forEach(function (e) {
        addEventListener(e, load, { once: true, passive: true });
      });
      if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 5000 });
      else addEventListener("load", function () { setTimeout(load, 2000); });
    })();
  </script>
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
<div class="page-body" role="main">
${healVernacularLinks(body)}
</div>
${footer}
<script type="module" src="/js/main.js"></script>
</body>
</html>
`;
}

// Visible, crawlable link(s) between language variants (shown under the breadcrumbs).
//
// These used to be full sentences ("यह पेज हिंदी में पढ़ें →" · "हे पेज मराठीत वाचा →" · …),
// which on an English page with all three twins was a wall of three scripts before the reader
// reached the article. The header already carries a language switcher, so the job left for
// this row is narrower: signal WHICH translations exist for THIS page — the switcher cannot
// say that, because coverage is per-page.
//
// So: capsules, not sentences. Each is labelled in its own script, which is how a Hindi
// reader recognises it fastest, and stays a real crawlable <a> so the twins remain linked
// in the HTML and not only via <head> hreflang.
//
// The row lists EVERY language this page exists in, including the one you are reading and
// including English. That is deliberate: the question a reader has is "what is this article
// available in?", and a list that silently omits the current language answers a different,
// more confusing question. An English-only article therefore shows a single English capsule
// rather than nothing — absence would be indistinguishable from a page that forgot to render
// the row. The current language is a <span>, not an <a>: linking a page to itself is noise.
//
// GUIDE ARTICLES ONLY. Every other page type used to carry this row too; it was removed
// because a capsule set describes one article's translation coverage, and on tariff, glossary,
// smart-meter and directory pages that coverage is a property of the whole state-scoped
// section rather than of the page you are looking at. The header switcher still reaches every
// language from anywhere, and <head> hreflang still links the twins for crawlers.
//
// Compact form: the visible "AVAILABLE IN" label cost more width than the capsules it
// introduced, so it is now a globe glyph with the wording kept for screen readers only.
const LANG_NATIVE = { en: 'English', hi: 'हिंदी', mr: 'मराठी', ta: 'தமிழ்' };
const LANG_GLOBE = '<svg class="seo-lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
  + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>'
  + '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
// Share control, shown at the end of the same row as the capsules. Progressive enhancement:
// the button is inert without JS, so it is rendered hidden and js/share-article.js reveals it
// — a dead button is worse than no button. On mobile it opens the OS share sheet; on desktop,
// where navigator.share is usually absent, it copies the URL and says so.
const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
  + '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>'
  + '<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

// Just the capsules, with no article tooling around them. Split out of langSwitchLink so the
// Smart Meter Guide can carry the row without also inheriting the Share button, which belongs
// to /guides/ articles and depends on share-article.js being loaded.
function langPills(page, lang, altLangs = VERNACULARS) {
  const all = ['en', ...altLangs.filter(l => l !== 'en')];
  const pills = all.map(l => {
    if (l === lang) {
      return `<span class="seo-lang-pill is-current" lang="${l}" aria-current="page">${LANG_NATIVE[l]}</span>`;
    }
    const href = l === 'en' ? page : langUrl(page, l);
    return `<a class="seo-lang-pill" href="${attr(href)}" hreflang="${LANG_LOCALE[l]}" lang="${l}">${LANG_NATIVE[l]}</a>`;
  }).join('');
  return `<p class="seo-lang-pills">${LANG_GLOBE}<span class="sr-only">Available in</span>${pills}</p>`;
}

function langSwitchLink(page, lang, altLangs = VERNACULARS) {
  const pills = langPills(page, lang, altLangs);
  // The button's three strings are rendered per-language here rather than looked up at
  // runtime: share-article.js has no i18n dependency, and the page already knows its language.
  // Without this the control read "Share" in the middle of a Devanagari or Tamil article.
  const shareLabel = T(lang, { hi: 'शेयर', mr: 'शेअर', ta: 'பகிர்', en: 'Share' });
  const shareCopied = T(lang, { hi: 'लिंक कॉपी हुआ', mr: 'लिंक कॉपी झाली', ta: 'இணைப்பு நகலெடுக்கப்பட்டது', en: 'Link copied' });
  const shareFailed = T(lang, { hi: 'कॉपी नहीं हुआ', mr: 'कॉपी झाली नाही', ta: 'நகலெடுக்க முடியவில்லை', en: 'Copy failed' });
  const share = `<button type="button" class="seo-share-btn" data-share-article hidden`
    + ` data-copied="${attr(shareCopied)}" data-failed="${attr(shareFailed)}">`
    + `${SHARE_ICON}<span class="seo-share-label" data-share-label>${esc(shareLabel)}</span></button>`;
  return `<div class="seo-article-tools">${pills}${share}</div>`;
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

// Jump-link index for a long guide, opt-in per guide with `toc: true`.
//
// The entries are DERIVED from the section headings rather than listed by hand. A hand-listed
// index is a second copy of the outline, and the moment someone renames or reorders a section
// it starts lying — which on a jump-link row means a dead anchor rather than merely stale prose.
// Deriving it means the index cannot disagree with the body.
//
// Returns both halves because the ids have to be stamped onto the sections at the same time as
// the links that point at them.
function guideToc(sectionsHtml, lang = 'en') {
  const entries = [];
  let n = 0;
  const sections = sectionsHtml.replace(
    /<section class="seo-section"([^>]*)>(\s*)<h2>([\s\S]*?)<\/h2>/g,
    (whole, attrs, gap, heading) => {
      n++;
      if (/\bid\s*=/.test(attrs)) return whole;   // an author-set id wins; do not fight it
      const text = heading.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      // Latin slug where the heading allows one; Devanagari and Tamil headings reduce to
      // nothing under [a-z0-9], so those fall back to a positional id rather than an empty one.
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        || `section-${n}`;
      // A jump row wants a label, not a sentence. Nine full headings rendered 212px of pills
      // across five wrapped rows, which pushes the article down the page and costs more than
      // the navigation is worth. So: an explicit data-toc on the section wins; otherwise take
      // the part before a colon, which is exactly the short form these headings already carry
      // ("UPPCL WSS: every service…" → "UPPCL WSS"); otherwise the heading stands as written.
      const explicit = /\bdata-toc\s*=\s*"([^"]*)"/.exec(attrs);
      const label = explicit ? explicit[1]
        : (text.includes(':') ? text.slice(0, text.indexOf(':')).trim() : text);
      entries.push({ slug, label });
      return `<section class="seo-section" id="${slug}"${attrs}>${gap}<h2>${heading}</h2>`;
    });

  if (entries.length < 3) return { toc: '', sections: sectionsHtml };  // too short to need one

  const label = T(lang, {
    en: 'On this page', hi: 'इस पेज पर', mr: 'या पानावर', ta: 'இந்தப் பக்கத்தில்',
  });
  const links = entries
    .map(e => `<a href="#${e.slug}">${esc(e.label)}</a>`)
    .join('\n        ');
  return {
    toc: `<nav class="page-toc" aria-label="${esc(label)}">
      <span class="page-toc-label">${esc(label)}</span>
      ${links}
    </nav>`,
    sections,
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
  // slab_per_kw — marginal per-kW bands (GERC Non-RGP). The rate applies only to the load
  // inside each band, so the unit suffix has to read /kW/mo, not the flat perMo used above.
  if (fc.type === 'slab_per_kw' && Array.isArray(fc.slabs)) {
    const perKwMo = T(lang, { en: '/kW/mo', hi: '/kW/माह', mr: '/kW/महिना', ta: '/kW/மாதம்' });
    const rows = fc.slabs.map(s => {
      const label = s.label || (s.maxLoad === Infinity
        ? T(lang, { en: 'Above top band', hi: 'सर्वोच्च बैंड से ऊपर', mr: 'सर्वोच्च बँडवर', ta: 'மேல் பட்டைக்கு மேல்' })
        : T(lang, { en: `Up to ${s.maxLoad} kW`, hi: `${s.maxLoad} kW तक`, mr: `${s.maxLoad} kW पर्यंत`, ta: `${s.maxLoad} kW வரை` }));
      return `<tr><td>${esc(label)}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">${perKwMo}</span></td></tr>`;
    }).join('');
    return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
  }
  // by_consumption — fixed charge set by the consumption slab (Mumbai licensees).
  if (fc.type === 'by_consumption' && Array.isArray(fc.slabs)) {
    const rows = fc.slabs.map(s => {
      const label = s.label || (s.maxUnits === Infinity
        ? T(lang, { en: 'Above top slab', hi: 'सर्वोच्च स्लैब से ऊपर', mr: 'सर्वोच्च स्लॅबवर', ta: 'மேல் அடுக்கிற்கு மேல்' })
        : T(lang, { en: `Up to ${s.maxUnits} units`, hi: `${s.maxUnits} यूनिट तक`, mr: `${s.maxUnits} युनिटपर्यंत`, ta: `${s.maxUnits} யூனிட் வரை` }));
      // perKw means the band picks a RATE that load still scales (Telangana), not a flat
      // monthly amount (the Mumbai licensees). Saying "/mo" for the former understates it.
      const unit = fc.perKw ? T(lang, { en: '/kW/mo', hi: '/kW/माह', mr: '/kW/महिना', ta: '/kW/மாதம்' }) : perMo;
      return `<tr><td>${esc(label)}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">${unit}</span></td></tr>`;
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
function tariffCategoryIconSvg(cat) {
  const text = `${cat.name || ''} ${cat.id || ''}`;
  const kind = /commerc|non.?domestic|lt-?2|lmv-?2|ned/i.test(text) ? 'commercial'
             : /industr/i.test(text) ? 'industrial'
             : /agri/i.test(text) ? 'agriculture' : 'domestic';
  const paths = {
    domestic: '<path d="M3 10.8 12 3.5l9 7.3"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.25 20v-5.2h5.5V20"/><path d="m12.5 7.5-2.1 4h2.7l-1.6 4 3-5h-2.7l.7-3Z"/>',
    commercial: '<path d="M4.5 10.5h15l-1 9.5h-13l-1-9.5Z"/><path d="M7 10.5V6.8C7 5.2 8.2 4 9.8 4h4.4C15.8 4 17 5.2 17 6.8v3.7"/><path d="M8.25 14h.01"/><path d="M15.75 14h.01"/><path d="M9.5 20v-4h5v4"/><path d="M12 4v16"/>',
    industrial: '<path d="M3.5 20V9.5l5.2 3V9.5l5.2 3V7.8L20.5 5v15h-17Z"/><path d="M7 16h1.8"/><path d="M11.2 16H13"/><path d="M15.4 16h1.8"/><path d="M18.5 5V3.5"/><path d="M14 12.5h6.5"/>',
    agriculture: '<path d="M12 21V8"/><path d="M12 14.5c-4.2 0-7.2-2.7-7.2-7.7 4.5 0 7.2 3.1 7.2 7.7Z"/><path d="M12 12.5c4.2 0 7.2-2.7 7.2-7.7-4.5 0-7.2 3.1-7.2 7.7Z"/><path d="M7 20h10"/><path d="M9 17.5h6"/>',
  };
  return `<span class="tariff-card-icon tariff-card-icon-${kind}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${paths[kind]}</svg></span>`;
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
  return `
    <article class="tariff-card">
      <header class="tariff-card-head">
        ${tariffCategoryIconSvg(cat)}
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
  const levels = [200, 300, 500, 750];
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
    en: `Common ${nm} bill calculations`, hi: `अनुमानित मासिक बिल — ${nm}`,
    mr: `अंदाजित मासिक बिल — ${nm}`, ta: `தோராயமான மாதாந்திர கட்டணம் — ${nm}` });
  const intro = T(lang, {
    en: `Typical domestic examples for a ${load} kW ${esc(cat.name)} connection, computed with the same engine as the calculator. Use them as a quick sanity check; your actual bill changes with sub-category, arrears, FPPA, duty and billing-period length.`,
    hi: `${load} kW स्वीकृत भार पर घरेलू (${esc(cat.name)}) कनेक्शन का अनुमानित कुल मासिक बिल, हमारे कैलकुलेटर वाले ही इंजन से निकाला गया। वास्तविक बिल आपकी उप-श्रेणी, फिक्स्ड/ईंधन शुल्क और स्थानीय करों के अनुसार बदलते हैं।`,
    mr: `${load} kW मंजूर भारावर घरगुती (${esc(cat.name)}) जोडणीचे अंदाजित एकूण मासिक बिल, आमच्या कॅल्क्युलेटरच्याच इंजिनने काढलेले. प्रत्यक्ष बिल तुमच्या उप-श्रेणी, फिक्स्ड/इंधन शुल्क आणि स्थानिक करांनुसार बदलते.`,
    ta: `${load} kW அனுமதிக்கப்பட்ட சுமையில் வீட்டு (${esc(cat.name)}) இணைப்பிற்கான தோராயமான மொத்த மாதாந்திர கட்டணம், எங்கள் கால்குலேட்டரின் அதே இன்ஜினால் கணக்கிடப்பட்டது. உண்மையான கட்டணங்கள் உங்கள் துணை வகை, நிலையான/எரிபொருள் கட்டணங்கள் மற்றும் உள்ளூர் வரிகளுக்கு ஏற்ப மாறுபடும்.` });
  const thUse = T(lang, { en: 'Monthly consumption', hi: 'मासिक खपत', mr: 'मासिक वापर', ta: 'மாதாந்திர நுகர்வு' });
  const thBill = T(lang, { en: 'Estimated bill', hi: 'अनुमानित बिल', mr: 'अंदाजित बिल', ta: 'தோராயமான கட்டணம்' });
  const cta = T(lang, {
    en: `Calculate my exact ${nm} bill →`, hi: `मेरा सटीक ${nm} बिल निकालें →`,
    mr: `माझे नेमके ${nm} बिल काढा →`, ta: `என் சரியான ${nm} கட்டணத்தைக் கணக்கிடு →` });
  return `
    <section class="seo-section" id="common-calculations">
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

// ── SERP width model ──────────────────────────────────────────────────────────
// Google truncates titles and snippets by PIXEL width, not character count, so a plain
// `.length <= 60` check is wrong in both directions on this site: a title of DISCOM
// acronyms ("UPPCL MSEDCL TANGEDCO") blows past the box well before 60 characters, while
// a Hindi title of 60 characters still fits comfortably.
//
// These ratios were measured, not guessed — canvas measureText in Arial (Google's desktop
// SERP face), averaged over representative strings from this site's own corpus and
// normalised so one Latin lowercase character = 1.0 unit:
//
//     Latin lowercase 1.000   Devanagari 0.951
//     Latin uppercase 1.501   Tamil      1.378
//     digits          1.227   space      0.454
//
// Note Devanagari is slightly NARROWER per codepoint than Latin lowercase. The wide scripts
// here are Tamil and — by a distance — Latin uppercase and digits, which is what this
// corpus is actually full of.
//
// Budgets are expressed in the same units, anchored so that ordinary Latin prose reproduces
// the familiar conventions: 60 units ≈ the classic 60-character title, 155 ≈ a safe snippet.
//
// The title budget is 72, not the classic 60. 60 is the DESKTOP single-line limit, and this
// site is not a desktop site: the Aug 2026 GSC export puts 68% of impressions and 78% of
// clicks on mobile, where Google wraps the title to two lines and the real allowance is far
// above one line's worth. Clamping the whole corpus to the desktop limit was costing the
// majority device its keyword payload to protect the minority one.
//
// 60 also sat just under the editorial median (English metaTitles measure 66 units at the
// median), so the typical title was cut by default rather than by exception — and because
// fitText() prefers a clause boundary and tidyCut() drops a stub em-dash tail, a title 6
// units over budget routinely lost 20+ characters. "Smart Prepaid Meter Disconnected?
// Recharge, Reconnection Time & Your Rights" was reaching the SERP as "Smart Prepaid Meter
// Disconnected?" — 75 characters authored, 33 emitted.
//
// 72 sits above the median so the common case is not cut at all, and the ~10 English titles
// that still overflow are genuinely long and should be edited rather than padded around.
const TITLE_WIDTH = 72;
const DESC_WIDTH = 155;

// A CTR experiment is running on the new-connection guides: their titles were rewritten on
// 2026-08-03 and a GSC baseline is being measured through 2026-09-15. CTR responds to the
// whole SERP result, so re-cutting these snippets mid-experiment would confound the readout
// of the title change. Their descriptions are held at full length until the baseline reports;
// their titles already fit, so the title clamp is a no-op on them either way.
//
// DELETE THIS SET (and the guard in layout()) once the experiment closes on 2026-09-15 —
// the width test will then flag these seven pages and they get trimmed with everything else.
const HOLD_SNIPPET_UNTIL = '2026-09-15';
const HOLD_SNIPPET = new Set(
  new Date().toISOString().slice(0, 10) >= HOLD_SNIPPET_UNTIL ? [] : [
    'tneb-tangedco-new-connection', 'haryana-new-connection-dhbvn-uhbvn',
    'bescom-new-connection-online', 'kseb-new-connection-online',
    'tata-power-ddl-new-connection', 'uppcl-new-connection-jhatpat',
    'msedcl-new-connection-online',
  ].map((slug) => `${SITE}/guides/${slug}/`));

function charWidth(cp) {
  if (cp === 32) return 0.454;                       // space
  if (cp >= 0x41 && cp <= 0x5a) return 1.501;        // A-Z
  if (cp >= 0x30 && cp <= 0x39) return 1.227;        // 0-9
  if (cp >= 0x900 && cp <= 0x97f) return 0.951;      // Devanagari (hi, mr)
  if (cp >= 0xb80 && cp <= 0xbff) return 1.378;      // Tamil
  // Combining marks in Indic scripts stack on the base glyph and add no advance width.
  if (cp >= 0x300 && cp <= 0x36f) return 0;
  return 1.0;                                        // Latin lowercase, punctuation, ₹, …
}

// Width of `s` in en units. Takes DECODED text — callers must unescape entities first,
// or "&amp;" counts as five characters instead of one.
function textWidth(s) {
  let w = 0;
  for (const ch of String(s)) w += charWidth(ch.codePointAt(0));
  return w;
}

// Words whose trailing full stop is an abbreviation, not a sentence end. Without this the
// sentence splitter below cuts "MSEDCL (Maharashtra State Electricity Distribution Co. Ltd.)"
// after "Co." and emits a description ending mid-parenthetical.
const ABBREV = /(?:^|\s)(?:Co|Ltd|Pvt|Corp|Dept|Nigam|Inc|Ors|No|vs|approx|Est|St|Mt|Dr|Mr|Mrs|Ms|Jr|Sr|वि|इ|उदा|क्र|सं|आदि)\.$/i;

// Trailing words that must never end a snippet — a truncated title reading "Pay Your Bill at"
// is worse than a shorter one that ends cleanly.
// Includes the vernacular conjunctions and the possessives that commonly precede the object
// they modify — a Marathi title ending "… आणि तुमचे" ("and your") is as broken as one
// ending "and your" in English, and the cut has to take both words, not just the last.
const DANGLING = new RegExp(
  '(?:\\s+(?:' + [
    'and', 'or', 'the', 'a', 'an', 'of', 'for', 'with', 'at', 'in', 'to', 'on', 'from', 'by', 'vs', '&',
    'और', 'तथा', 'एवं', 'व', 'तुम्हारे', 'आपके', 'अपने', 'उनके', 'इसके',        // Hindi
    'आणि', 'तुमचे', 'तुमच्या', 'आपले', 'आपल्या', 'त्यांचे',                      // Marathi
    'மற்றும்', 'உங்கள்', 'அதன்', 'இதன்',                                        // Tamil
  ].join('|') + '))+$', 'i');

const stripTail = (s) => String(s).replace(/[\s—–:;,.|/&-]+$/, '');

// Trim punctuation and connectives left hanging by a cut, and repair a bracket the cut opened.
function tidyCut(s, budget) {
  let out = stripTail(s).replace(DANGLING, '');

  // Position of the last UNMATCHED "(" — not simply the last one. Delhi's DISCOM list nests
  // ("4 डिस्कॉम (BRPL (BSES Rajdhani), BYPL …"), and repairing at the innermost bracket there
  // closes one that was already balanced while leaving the real orphan open.
  let depth = 0, i = -1;
  for (let k = 0; k < out.length; k++) {
    if (out[k] === '(') { if (depth === 0) i = k; depth++; }
    else if (out[k] === ')') depth = Math.max(0, depth - 1);
  }
  if (depth > 0 && i >= 0) {
    const inner = out.slice(i + 1);
    // Most orphaned brackets on this site are service-area lists — "(Ajmer, Bhilwara,
    // Nagaur, Sirohi, …)". Closing them after the last complete item keeps a truthful
    // subset of the list; dropping the whole bracket would throw away a third of the
    // snippet and the local intent that makes these pages distinct.
    const lastItem = inner.lastIndexOf(',');
    const closed = lastItem > 0 ? `${out.slice(0, i + 1)}${stripTail(inner.slice(0, lastItem))})` : '';
    const balanced = closed && (closed.match(/\(/g) || []).length === (closed.match(/\)/g) || []).length;
    out = (balanced && (!budget || textWidth(closed) <= budget)) ? closed : out.slice(0, i);
  }
  out = stripTail(out).trim();

  // A cut that lands just past an em dash leaves a stub qualifier — "How to Read a UPPCL
  // Bill 2026 — LMV-1" — which reads as though the title were damaged. Dropping the whole
  // clause gives a shorter but complete title. Only reached from the truncation paths, so
  // a title that already fits is never touched.
  const tail = out.lastIndexOf(' — ');
  if (tail > 0 && textWidth(out.slice(tail + 3)) < 12) out = stripTail(out.slice(0, tail)).trim();

  return out;
}

// Shorten `s` to fit `budget` en units, cutting at the most natural boundary available.
// Order matters: drop whole trailing sentences first (the tail of a 3-sentence description
// is the most expendable part), then fall back to a clause boundary, then a word boundary.
// No ellipsis is appended — Google adds its own, and the character would eat the budget.
//
// Every path is subject to the same floor: a cut that keeps less than 60% of the budget
// throws away more than truncation would have cost, so it is rejected in favour of the next
// strategy. That floor is what stops a stray abbreviation or an early comma from collapsing
// a 155-unit snippet to 30.
function fitText(s, budget) {
  const text = String(s).replace(/\s+/g, ' ').trim();
  if (textWidth(text) <= budget) return text;
  const floor = budget * 0.6;
  // A whole sentence is self-contained, so it earns a lower floor than a mid-clause cut:
  // Delhi's "…निकालें। 4 डिस्कॉम (BRPL (BSES Rajdhani), BYPL …" reads far better stopped at
  // the danda than carved out of the DISCOM list, even though the sentence is shorter.
  const sentenceFloor = budget * 0.45;

  // 1. Whole sentences. Handles Latin "." / "?" / "!" and the Devanagari danda "।".
  const parts = text.split(/(?<=[.?!।])\s+/);
  if (parts.length > 1) {
    let acc = '';
    for (const part of parts) {
      const next = acc ? `${acc} ${part}` : part;
      if (textWidth(next) > budget) break;
      acc = next;
    }
    if (acc && textWidth(acc) >= sentenceFloor && !ABBREV.test(acc)) return tidyCut(acc, budget);
  }

  // Longest prefix that fits, as the basis for the remaining strategies.
  let cut = '';
  for (const ch of text) {
    const next = cut + ch;
    if (textWidth(next) > budget) break;
    cut = next;
  }

  // 2. Clause boundary — em dash, colon, semicolon or comma.
  const clause = Math.max(cut.lastIndexOf(' — '), cut.lastIndexOf(': '),
    cut.lastIndexOf('; '), cut.lastIndexOf(', '));
  if (clause > 0 && textWidth(cut.slice(0, clause)) >= floor) {
    const tidy = tidyCut(cut.slice(0, clause), budget);
    if (textWidth(tidy) >= floor) return tidy;
  }

  // 3. Word boundary, never mid-word.
  const sp = cut.lastIndexOf(' ');
  return tidyCut(sp > 0 ? cut.slice(0, sp) : cut, budget);
}

// Keep <title> within Google's truncation width: use the preferred title if it fits,
// otherwise step through progressively shorter fallbacks. If even the last fallback is
// too wide it is trimmed rather than emitted long — layout() enforces this regardless,
// but stepping down here picks a better-composed title than a raw cut would.
function fitTitle(preferred, fallbacks, max = TITLE_WIDTH) {
  for (const t of [preferred, ...fallbacks]) if (textWidth(t) <= max) return t;
  return fitText(fallbacks[fallbacks.length - 1], max);
}

// A parenthetical gloss of the DISCOM's legal name — " (Madhyanchal Vidyut Vitran Nigam Ltd.)"
// after "MVVNL" — is genuinely useful when the short name is an acronym, and pure noise when
// it merely restates what was just said. Left unguarded it produced strings like
// "Adani Electricity Mumbai (Adani Electricity Mumbai Ltd. (formerly Reliance Infrastructure))"
// — the name echoed, with nested brackets — and pushed those descriptions past 260 characters.
//
// Two suppression rules, both aimed at redundancy rather than length:
//   1. the long name simply extends the short one ("Adani Electricity Mumbai" → "… Ltd."), or
//   2. most of the long name's words are already in the short name (LPDCL's
//      "LPDCL / Ladakh Power Dept." vs "Ladakh Power Development Corp. / Power Development
//      Dept., Ladakh" — same words, rearranged).
// An acronym shares no words with its expansion, so the useful case always survives.
function nameGloss(name, fullName) {
  if (!fullName) return '';
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9ऀ-ॿ஀-௿ ]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const a = norm(name), b = norm(fullName);
  if (!b || a === b || b.startsWith(a) || a.includes(b)) return '';

  const short = new Set(a.split(' ').filter(Boolean));
  const words = b.split(' ').filter((w) => w.length > 2);   // ignore "of", "&", "ltd"-like noise
  if (words.length) {
    const shared = words.filter((w) => short.has(w)).length;
    if (shared / words.length >= 0.6) return '';
  }
  // Nested brackets read badly inside a parenthetical; flatten them when the gloss is kept.
  return ` (${String(fullName).replace(/\s*\((.*?)\)\s*/g, ', $1').replace(/\s+,/g, ',').trim()})`;
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
    // energySlabsByConsumption tariffs (Telangana) carry several alternative ladders and
    // energySlabs holds only a fallback one. Spanning every ladder keeps the headline
    // range honest — quoting 5.10-10.00 would hide the 1.95 a small household really pays.
    const ladders = Array.isArray(b.energySlabsByConsumption)
      ? b.energySlabsByConsumption.map(l => l.slabs)
      : [b.energySlabs || []];
    for (const set of ladders) for (const s of set) if (typeof s.rate === 'number') rates.push(s.rate);
    if (fixed == null && b.fixedCharge != null) fixed = b.fixedCharge;
  }
  if (!rates.length) return null;
  // A 0 in a slab ladder is a data marker, not a price — Odisha's LT Domestic ends [.., 6.10, 0]
  // where the 0 stands for the subsidised/free block. Taking it as the floor produced "rates
  // from ₹0/unit" in the live Odisha snippet and would put "₹0.00–6.10/unit" in the title,
  // which is both wrong about what a household pays and reads as a broken template. The floor
  // is the lowest rate anyone is actually charged; if every rate is 0 there is nothing to quote.
  const paid = rates.filter(r => r > 0);
  if (!paid.length) return null;
  return { min: Math.min(...paid), max: Math.max(...paid), fixed, catName: cat.name };
}

// ── rate signals for tariff-page titles and snippets ─────────────────────────
// The Aug 2026 GSC export made the case: /tariffs/ carried 37,124 impressions at 0.66% CTR
// against 0.94% on /guides/, and every one of the 289 pages shared a description that ended
// "…and get your exact bill in seconds. Free, no sign-up." At position 9–11 that reads as
// templated boilerplate and gets skipped. Somebody searching a tariff wants a NUMBER; putting
// the real slab range in the title is the one thing the SERP can hand them that a generic
// aggregator cannot, and it is the difference between a result worth opening and one to scroll past.
//
// "₹4.75–10.00/unit" — one rupee sign, en dash, no space. A flat tariff collapses to "₹7.74/unit"
// rather than quoting an empty range.
function rateTag(dr, lang = 'en') {
  if (!dr) return null;
  const unit = T(lang, { en: '/unit', hi: '/यूनिट', mr: '/युनिट', ta: '/யூனிட்' });
  const span = dr.min === dr.max ? rupeeRate(dr.min) : `${rupeeRate(dr.min)}–${Number(dr.max).toFixed(2)}`;
  return span + unit;
}

// The domestic slab range spanning every DISCOM in a state, for the state hub's title. Min of
// the mins and max of the maxes: both ends are rates a household in the state genuinely pays,
// so the span is honest even though no single DISCOM covers all of it.
function stateRateRange(discoms) {
  const drs = discoms.map(domesticRates).filter(Boolean);
  if (!drs.length) return null;
  return { min: Math.min(...drs.map(x => x.min)), max: Math.max(...drs.map(x => x.max)) };
}

// "in force from 1 April 2026" — the freshness signal that separates us from the stale scraped
// tariff pages we share a SERP with. Only 6 of 34 states carry `currentRatesFrom` today, and
// this deliberately returns null for the rest rather than inferring a date from the financial
// year: FY 2026-27 rates usually start on 1 April, but Rajasthan's start on 1 October, and a
// guessed effective date on a tariff site is worse than no date at all.
// Short form ("1 Oct 2025", not "1 October 2025"): this goes in a 155-unit snippet where every
// unit spent on the month name is one not spent on the DISCOM names and the rate.
//
// The phrasing has to track whether the date falls inside the stated financial year, because
// regulators routinely carry a tariff forward untouched. Odisha's rates are labelled FY 2026-27
// and took effect on 1 Apr 2024; "2026-27 tariff (in force from 1 Apr 2024)" reads like a typo
// and costs exactly the trust the date was added to earn. "Rates unchanged since 1 Apr 2024" is
// the same fact stated so that it informs instead of contradicting — and it answers the question
// a tariff searcher is really asking, which is whether anything has moved.
function ratesPhrase(meta, fy) {
  if (!meta || !meta.currentRatesFrom) return null;
  const when = new Date(meta.currentRatesFrom + 'T00:00:00Z')
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  // Indian tariff years run April–March, so "2026-27" starts 1 Apr 2026. A tariff whose rates
  // predate its own FY start is a carried-forward order.
  const fyStart = /(\d{4})\s*[-–/]/.exec(String(fy || ''));
  const carried = fyStart && meta.currentRatesFrom < `${fyStart[1]}-04-01`;
  return { when, carried, label: carried ? `unchanged since ${when}` : `in force from ${when}` };
}

// "Electricity Tariff" unless the DISCOM's own name already says "Electricity", in which case
// the qualifier is dropped rather than echoed back. Vernacular headings take the same guard:
// "Adani Electricity Mumbai बिजली टैरिफ" repeats the word across two scripts, which is no less
// redundant for being harder to spot.
const tariffNoun = (name) => (/electricity/i.test(name) ? 'Tariff' : 'Electricity Tariff');

// The H1 tail: a service-region LABEL if the data has one, otherwise the state.
//
// parseArea() only splits a region from its cities when the source string brackets them —
// "North Haryana (Panchkula, Ambala, …)". Where it does not, `region` comes back as the whole
// district list, and the unguarded heading ran to 164 characters:
//   "AVVNL Electricity Tariff 2025-26 — Ajmer, Bhilwara, Nagaur, Sirohi, Jhalawar, Baran, …"
// 22 of 65 DISCOM pages were over 70. A comma is the tell — a genuine region reads as one
// phrase ("West Odisha", "Mumbai suburbs"), a list does not — with a length cap behind it for
// any long single-phrase region. The districts are not lost: they have their own section and
// sit in the at-a-glance table.
const h1Tail = (region, state) =>
  (region && !region.includes(',') && region.length <= 28) ? region : state;

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
    : (tariffAge(fy).yearsBehind >= 2
      // Two or more FYs behind: say plainly that we have not read a newer order. Retained
      // rates are common, so this is "unchecked", never "wrong" — but the state audits done
      // so far did turn up stale entries matching no published order, and a reader deciding
      // whether to trust a rupee figure should be told which of the two they are looking at.
      ? T(lang, {
          en: `⚠️ Based on the ${esc(fy)} tariff order — we have not yet audited a newer one, so confirm against ${esc(discom.name)}'s official order before relying on these rates`,
          hi: `⚠️ ${esc(fyLabel(fy, 'hi'))} टैरिफ आदेश पर आधारित — इससे नया आदेश हमने अभी जाँचा नहीं है, इसलिए इन दरों पर निर्भर होने से पहले ${esc(discom.name)} के आधिकारिक आदेश से पुष्टि करें`,
          mr: `⚠️ ${esc(fyLabel(fy, 'mr'))} टॅरिफ आदेशावर आधारित — यापेक्षा नवीन आदेश आम्ही अद्याप तपासलेला नाही, त्यामुळे या दरांवर विसंबण्यापूर्वी ${esc(discom.name)} च्या अधिकृत आदेशाशी खात्री करा`,
          ta: `⚠️ ${esc(fyLabel(fy, 'ta'))} கட்டண ஆணையை அடிப்படையாகக் கொண்டது — இதைவிட புதிய ஆணையை நாங்கள் இன்னும் சரிபார்க்கவில்லை, எனவே இந்த விகிதங்களை நம்புவதற்கு முன் ${esc(discom.name)} இன் அதிகாரப்பூர்வ ஆணையுடன் உறுதிப்படுத்தவும்` })
      : T(lang, {
          en: `Based on the ${esc(fy)} tariff order (latest published data we have)`,
          hi: `${esc(fyLabel(fy, 'hi'))} टैरिफ आदेश पर आधारित (हमारे पास उपलब्ध नवीनतम प्रकाशित डेटा)`,
          mr: `${esc(fyLabel(fy, 'mr'))} टॅरिफ आदेशावर आधारित (आमच्याकडील नवीनतम प्रकाशित डेटा)`,
          ta: `${esc(fyLabel(fy, 'ta'))} கட்டண ஆணையை அடிப்படையாகக் கொண்டது (எங்களிடம் உள்ள சமீபத்திய வெளியிடப்பட்ட தரவு)` }))]);
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
function discomWebsiteUrl(discom) {
  if (!discom.website) return '';
  return /^https?:\/\//i.test(discom.website) ? discom.website : `https://${discom.website}`;
}

function discomWebsiteHost(discom) {
  const site = discomWebsiteUrl(discom);
  return site ? String(site).replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
}

function servicesHubUrl(state, discom, tab = 'pay') {
  return `/services/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#${tab}`;
}


// ── Card icons ───────────────────────────────────────────────────────────────
// A line glyph per destination, drawn in CSS as a mask so one SVG can take any hue (see
// --ic-* in styles.css). Deliberately a bare icon rather than a tinted chip: nine of these
// sit together on a DISCOM page, and a container around each one is what tips the block from
// scannable into busy. Decorative only — every card still carries its own text label, so the
// icon is never the sole carrier of meaning and needs no accessible name.
const CARD_ICONS = {
  'Calculate bill': 'calc', 'Current tariff': 'table', 'Latest FPPA/FAC': 'trend',
  'Bill examples': 'doc', 'Pay or view bill': 'cash', 'Complaint': 'chat',
  'Smart meter': 'gauge', 'Solar': 'sun', 'Official site': 'globe',
  'View bill': 'doc', 'Pay bill': 'cash', 'New connection': 'plug', 'Load change': 'gauge',
};
// Open-ended lists (guides, tools) cannot be keyed by title, so they are keyed by where the
// link goes — the one thing that is always known — and fall back to a neutral glyph.
function cardIcon(title, href = '') {
  if (CARD_ICONS[title]) return CARD_ICONS[title];
  const h = String(href);
  if (/solar/.test(h)) return 'sun';
  if (/compare/.test(h)) return 'compare';
  if (/smart-meter/.test(h)) return 'gauge';
  if (/new-connection|services/.test(h)) return 'plug';
  if (/fppa|fuel-surcharge/.test(h)) return 'trend';
  if (/tariffs/.test(h)) return 'table';
  if (/guides/.test(h)) return 'guide';
  if (/glossary/.test(h)) return 'guide';
  if (/sanctioned-load|load-optimizer/.test(h)) return 'gauge';
  if (/check-my-bill|bill-review/.test(h)) return 'doc';
  if (/#calculator|estimator|electricity-cost/.test(h)) return 'calc';
  return 'doc';
}

function discomPortalActionsHtml(state, discom) {
  const stateSlug = slugify(state);
  const nm = esc(discom.name);
  const official = discomWebsiteUrl(discom);
  const officialHost = discomWebsiteHost(discom);
  const actions = [
    ['Calculate bill', `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`, `Estimate an itemised ${nm} bill with tariff, duty and surcharge`],
    ['Current tariff', '#current-tariff', 'Open the slab table, fixed charge and category rules'],
    ['Latest FPPA/FAC', '#latest-fppa', 'Check the current variable surcharge and history'],
    ['Bill examples', '#common-calculations', 'Compare 200, 300, 500 and 750 unit examples'],
    ['Pay or view bill', servicesHubUrl(state, discom, 'pay'), 'Use the official portal or payment channel'],
    ['Complaint', servicesHubUrl(state, discom, 'complaint'), 'Find complaint route and escalation reminders'],
    ['Smart meter', `/smart-meter-recharge/${stateSlug}/${discom.id}/`, 'Recharge prepaid smart meter and estimate units'],
    ['Solar', '/solar-calculator/', 'Estimate rooftop solar savings before applying officially'],
  ];
  if (official) actions.push(['Official site', official, `Open ${officialHost}`, 'external']);
  return `
    <nav class="discom-portal-actions" aria-label="${attr(discom.name)} consumer portal shortcuts">
      ${actions.map(([title, href, sub, external]) =>
        `<a class="discom-action-card" data-icon="${cardIcon(title, href)}" href="${attr(href)}"${external ? ' target="_blank" rel="noopener"' : ''}><strong>${title}</strong><span>${sub}</span></a>`).join('')}
    </nav>`;
}

function discomCalculatorPanelHtml(state, discom) {
  const calcHref = `/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator`;
  const nm = esc(discom.name);
  return `
    <section class="seo-section discom-tool-panel" id="calculate">
      <div>
        <h2>${nm} electricity bill calculator</h2>
        <p>Enter units, sanctioned load and billing dates to get an itemised ${nm} estimate. The result breaks the bill into energy charge, fixed or demand charge, FPPA/FAC, duty, arrears and late-payment surcharge where applicable.</p>
      </div>
      <a class="seo-cta" href="${calcHref}">Calculate ${nm} bill</a>
    </section>`;
}

function fppaTrendSeries(state, discom) {
  const list = FPPA_BY_DISCOM[discom.id] || FPPA_BY_STATE[state] || [];
  if (!list.length) return [];
  const latestMode = list[0]?.mode;
  return list
    .filter(e => e && e.from && Number.isFinite(e.rate) && (!latestMode || e.mode === latestMode))
    .sort((a, b) => a.from.localeCompare(b.from));
}

function fppaTrendRateLabel(e) {
  if (!e) return '—';
  if (e.mode === 'percent') return `${e.rate > 0 ? '+' : ''}${e.rate.toFixed(2)}%`;
  return `${rupeeRate(e.rate)}/unit`;
}

// A round step (1, 2, 2.5, 5 or 10 x a power of ten) near span/targetTicks, so the axis reads
// -4%, -2%, 0%, +2% rather than the quartiles of whatever the data happened to be.
function niceTickStep(span, targetTicks = 4) {
  const rough = (span || 1) / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const mult = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return mult * mag;
}

function fppaTrendSvg(series, rangeMonths, discomName) {
  const sliced = series.slice(-Math.min(series.length, rangeMonths));
  const W = 720, H = 188, PAD_L = 48, PAD_R = 14, PAD_T = 14, PAD_B = 32;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  if (!sliced.length) return '';
  const vals = sliced.map(e => e.rate);
  // The scale snaps out to round ticks. Because both ends are whole multiples of the step and
  // the range always straddles zero, zero is guaranteed to be one of them — which is the point:
  // on a signed surcharge the only line that means anything by itself is the one dividing
  // "added to your bill" from "credited back". The old axis cut the data range into quarters,
  // so zero landed on a gridline essentially never and the chart had no baseline.
  const step = niceTickStep(Math.max(0, ...vals) - Math.min(0, ...vals));
  let min = Math.floor(Math.min(0, ...vals) / step) * step;
  let max = Math.ceil(Math.max(0, ...vals) / step) * step;
  if (min === max) { min -= step; max += step; }
  const span = max - min || 1;
  const xAt = i => PAD_L + (sliced.length === 1 ? plotW / 2 : i * (plotW / (sliced.length - 1)));
  const yAt = v => PAD_T + ((max - v) / span) * plotH;
  const points = sliced.map((e, i) => [xAt(i), yAt(e.rate), e]);
  const path = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const gridVals = [];
  for (let k = Math.round(min / step); k <= Math.round(max / step); k++) gridVals.push(k * step);
  const unit = sliced[0].mode === 'percent' ? '%' : '/u';
  const dp = Math.min(2, Math.max(0, -Math.floor(Math.log10(step))));
  const fmtAxis = v => sliced[0].mode === 'percent'
    ? `${v > 0 ? '+' : ''}${v.toFixed(dp)}%`
    : `${rupeeRate(v)}${unit}`;
  const labelEvery = Math.max(1, Math.ceil(sliced.length / 5));
  const grid = gridVals.map(v => {
    const y = yAt(v);
    const zero = Math.abs(v) < step * 1e-6;
    return `<line class="fs-grid${zero ? ' fs-grid-zero' : ''}" x1="${PAD_L}" y1="${y.toFixed(1)}" x2="${W - PAD_R}" y2="${y.toFixed(1)}"/><text class="fs-axis${zero ? ' fs-axis-zero' : ''}" x="${PAD_L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end">${esc(fmtAxis(zero ? 0 : v))}</text>`;
  }).join('');
  // No fill under the line. The signed area was tinted red above zero and green below, and at
  // the low opacity it needed it read as a wash of orange rather than as a charge/credit cue.
  // The zero line, the round ticks and the per-point colours already carry the sign.
  const dots = points.map(([x, y, e]) => `<circle class="${e.rate >= 0 ? 'trend-dot-pos' : 'trend-dot-neg'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"><title>${esc(fsMonth(e.from))}: ${esc(fppaTrendRateLabel(e))}</title></circle>`).join('');
  const labels = points.map(([x, , e], i) => {
    const last = i === points.length - 1;
    // The final month is always labelled, so drop any regular tick that would crowd it.
    if (!last && (i % labelEvery !== 0 || points.length - 1 - i < labelEvery)) return '';
    return `<text class="fs-axis" x="${x.toFixed(1)}" y="${H - 10}" text-anchor="middle">${esc(fsMonth(e.from).replace(' ', ' '))}</text>`;
  }).join('');
  // The newest reading is the one people came for: ring it and print its value beside it, on
  // whichever side of the point has room so the label never sits on top of the line.
  const [lx, ly, le] = points[points.length - 1];
  const latestMark = `<circle class="trend-dot-latest" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="6.5"/>`
    + `<text class="trend-latest-label" x="${lx.toFixed(1)}" y="${(ly > PAD_T + plotH / 2 ? ly - 11 : ly + 18).toFixed(1)}" text-anchor="end">${esc(fppaTrendRateLabel(le))}</text>`;
  const latest = sliced[sliced.length - 1];
  return `<figure class="fs-chart-wrap discom-trend-chart">
    <svg class="fs-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(discomName)} FPPA or FAC trend for the last ${rangeMonths} months">
      ${grid}
      <path class="trend-line" d="${path}"/>
      ${dots}
      ${latestMark}
      ${labels}
    </svg>
    <figcaption>Latest point: ${esc(fsMonth(latest.from))} at <strong>${esc(fppaTrendRateLabel(latest))}</strong>. Positive values add to the bill; negative values are credits.</figcaption>
  </figure>`;
}

function fppaTrendHtml(state, discom) {
  const series = fppaTrendSeries(state, discom);
  const nm = esc(discom.name);
  // No verified series, no section. This used to render a heading over a line saying the data
  // did not exist yet, on 54 of the 65 DISCOM pages — a promise of a chart rather than a chart,
  // and a section a reader had to get past to reach the tariff. The "current FPPA/FAC" block
  // above already states the position honestly when nothing is notified.
  if (!series.length) return '';
  const id = `trend-${discom.id}`;
  const oldest = fsMonth(series[0].from);
  const newest = fsMonth(series[series.length - 1].from);
  return `
    <section class="seo-section">
      <h2>${nm} FPPA/FAC trend</h2>
      <p>Use the chart to see whether the variable surcharge is rising or falling. The selector switches between recent notices and the longer history currently available for ${nm}.</p>
      <div class="discom-trend-tabs">
        <input type="radio" name="${id}" id="${id}-6" checked>
        <label for="${id}-6">6 months</label>
        <input type="radio" name="${id}" id="${id}-12">
        <label for="${id}-12">1 year</label>
        <input type="radio" name="${id}" id="${id}-36">
        <label for="${id}-36">3 years</label>
        <div class="discom-trend-panels">
          <div class="trend-panel">${fppaTrendSvg(series, 6, discom.name)}</div>
          <div class="trend-panel">${fppaTrendSvg(series, 12, discom.name)}</div>
          <div class="trend-panel">${fppaTrendSvg(series, 36, discom.name)}</div>
        </div>
      </div>
      <p class="fs-legend">Available series: ${esc(oldest)} to ${esc(newest)}. Some DISCOMs publish DISCOM-specific data; others use a state-wide FPPA/FAC notice.</p>
    </section>`;
}

function currentFppaHtml(state, discom) {
  const discomList = FPPA_BY_DISCOM[discom.id];
  const stateList = FPPA_BY_STATE[state];
  const list = discomList || stateList || [];
  const current = pickFppa(list, TODAY);
  const latest = current || list[0] || null;
  const period = latest
    ? `${fsMonth(latest.from)}${latest.to ? ` - ${fsMonth(latest.to)}` : ' onward'}`
    : 'No verified period in tracker';
  const rate = latest ? fsRate(latest) : 'Not available';
  const source = latest?.source || 'No verified FPPA/FAC source recorded yet';
  const note = current
    ? 'Current applicable entry for today.'
    : latest ? `Latest published entry shown; ${fsMonth(TODAY.slice(0, 8) + '01')} may not be notified yet.` : 'Enter the surcharge printed on your bill manually in the calculator.';
  const cls = latest?.rate >= 0 ? 'fs-pos' : latest ? 'fs-neg' : 'fs-pending';
  const trackerHref = fppaCoverageStates().includes(state) ? `/fppa/${slugify(state)}/` : '/fppa/';
  return `
    <section class="seo-section" id="latest-fppa">
      <h2>Current ${esc(discom.name)} FPPA / FAC</h2>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <tbody>
            <tr><th>Current applicable FPPA</th><td><strong class="${cls}">${esc(rate)}</strong></td></tr>
            <tr><th>Applicable period</th><td>${esc(period)}</td></tr>
            <tr><th>Last updated</th><td>${LASTMOD_TOKEN.en}</td></tr>
            <tr><th>Official source</th><td>${esc(source)}</td></tr>
          </tbody>
        </table>
      </div>
      <p class="seo-note">${esc(note)} <a href="${trackerHref}">Open the surcharge tracker</a>.</p>
    </section>`;
}

function billLineExplainerHtml(discom) {
  const nm = esc(discom.name);
  const items = [
    ['Energy charge', 'The slab-wise price of the units consumed during the billing period. In telescopic slabs, each band is billed at its own rate.'],
    ['Fixed charge', 'A monthly charge linked to sanctioned load, connected load, billing demand or consumer category. It applies even when usage is low.'],
    ['Electricity duty', 'A statutory government levy. Depending on the state, it may apply on energy charges, fixed charges, or selected bill components.'],
    ['FPPA / FAC', 'Fuel and power-purchase adjustment. It changes more often than the base tariff and may appear as a charge or a credit.'],
    ['Arrears', 'Unpaid balance, corrections, security-deposit adjustments or previous-cycle amounts carried into the current bill.'],
    ['LPSC', 'Late Payment Surcharge on overdue amounts. Check the due date and pay through the official DISCOM channel to avoid it.'],
  ];
  return `
    <section class="seo-section">
      <h2>Understanding your ${nm} bill</h2>
      <div class="discom-explain-grid">
        ${items.map(([title, body]) => `<article><h3>${title}</h3><p>${body}</p></article>`).join('')}
      </div>
    </section>`;
}

function officialServicesHtmlLegacy(state, discom) {
  const site = discom.website ? (/^https?:\/\//i.test(discom.website) ? discom.website : `https://${discom.website}`) : '';
  const fallback = `/services/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}`;
  const href = site || fallback;
  const target = site ? ' target="_blank" rel="noopener"' : '';
  const host = site ? String(site).replace(/^https?:\/\//, '').replace(/\/$/, '') : 'DISCOM services page';
  const nm = esc(discom.name);
  const links = [
    ['View bill', 'Check the latest bill on the official consumer portal'],
    ['Pay bill', 'Pay only through the official portal or a BBPS-enabled app'],
    ['New connection', 'Apply for a new service connection with the DISCOM'],
    ['Load change', 'Request sanctioned-load increase or reduction'],
    ['Complaint', 'Register supply, billing or meter complaints'],
    ['Smart meter', 'Recharge or check prepaid smart-meter service options'],
  ];
  return `
    <section class="seo-section is-aside">
      <h2>${nm} consumer services</h2>
      <p>These services are provided by ${nm} or the official state/DISCOM portal, not by TheDiscomBill. Use the links below to reach the official website.</p>
      <div class="seo-link-grid discom-service-grid">
        ${links.map(([title, sub]) => `<a class="seo-link-card" href="${attr(href)}"${target}><strong>${title} ↗</strong><span>${sub}</span><small>${esc(host)}</small></a>`).join('')}
      </div>
    </section>`;
}

function officialServicesHtml(state, discom) {
  const stateSlug = slugify(state);
  const site = discomWebsiteUrl(discom);
  const host = discomWebsiteHost(discom) || 'official DISCOM portal';
  const nm = esc(discom.name);
  const siteLink = site
    ? `<a href="${attr(site)}" target="_blank" rel="noopener">${esc(host)}</a>`
    : `<a href="${servicesHubUrl(state, discom, 'pay')}">DISCOM services helper</a>`;
  const cards = [
    {
      title: 'Pay bill or download bill',
      body: `Use ${siteLink} for the final bill, receipt and payment status. The calculator here is only for checking whether the charge lines look reasonable.`,
      links: [
        ['Open payment helper', servicesHubUrl(state, discom, 'pay'), false],
        ...(site ? [['Official portal', site, true]] : []),
      ],
    },
    {
      title: 'Complaint numbers and escalation',
      body: `For supply, billing or meter complaints, use the official complaint portal first and keep the complaint number. The common electricity helpline in India is 1912 where supported by the state or DISCOM.`,
      links: [
        ['Complaint helper', servicesHubUrl(state, discom, 'complaint'), false],
        ...(site ? [['Official complaint route', site, true]] : []),
      ],
    },
    {
      title: 'New connection and load change',
      body: `Apply for a new connection, ownership update or sanctioned-load change through the official portal. Match the load you apply for with the fixed-charge section in the tariff table below.`,
      links: [
        ['New connection guide', servicesHubUrl(state, discom, 'new-connection'), false],
        ...(site ? [['Official application site', site, true]] : []),
      ],
    },
    {
      title: 'Smart meter and prepaid recharge',
      body: `If your ${nm} connection has a prepaid smart meter, check recharge channels, low-balance rules and unit estimates before topping up.`,
      links: [
        ['Smart meter recharge guide', `/smart-meter-recharge/${stateSlug}/${discom.id}/`, false],
      ],
    },
    {
      title: 'Solar and net metering',
      body: `Estimate rooftop-solar savings here, then use the official DISCOM or PM Surya Ghar process for the actual net-metering application.`,
      links: [
        ['Solar savings calculator', '/solar-calculator/', false],
        ...(site ? [['Official DISCOM site', site, true]] : []),
      ],
    },
  ];
  return `
    <section class="seo-section is-aside" id="consumer-services">
      <h2>${nm} consumer services</h2>
      <p>These services are provided by ${nm} or the official state/DISCOM portal, not by TheDiscomBill. Use this block as a practical route map before you leave for the official site.</p>
      <div class="discom-service-panels">
        ${cards.map(card => `<article class="discom-service-panel">
          <h3>${card.title}</h3>
          <p>${card.body}</p>
          <div class="discom-service-links">
            ${card.links.map(([label, href, external]) => `<a href="${attr(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}${external ? ' &nearr;' : ''}</a>`).join('')}
          </div>
        </article>`).join('')}
      </div>
    </section>`;
}

function discomSourcesHtml(state, discom, fy) {
  const meta = STATE_META[state] || {};
  const sources = [];
  if (meta.sourceUrl) sources.push(['Tariff order / regulator', meta.sourceUrl]);
  if (discom.website) sources.push([`${discom.name} official information`, discom.website]);
  if (FPPA_BY_DISCOM[discom.id] || FPPA_BY_STATE[state]) sources.push(['FPPA / FAC tracker', `/fppa/${slugify(state)}/`]);
  if (!sources.length) return '';
  return `
    <section class="seo-section">
      <h2>Sources</h2>
      <table class="seo-facts"><tbody>
        ${sources.map(([label, href]) => `<tr><th>${esc(label)}</th><td><a href="${attr(href)}"${/^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : ''}>${esc(String(href).replace(/^https?:\/\//, ''))}</a></td></tr>`).join('')}
        <tr><th>Tariff effective from</th><td>${esc((ratesPhrase(meta, fy)?.label || fy))}</td></tr>
        <tr><th>Last verified</th><td>${LASTMOD_TOKEN.en}</td></tr>
      </tbody></table>
    </section>`;
}

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
    <section class="seo-section is-aside">
      <h2>${heading}</h2>
      <div class="seo-link-grid is-compact">
        ${links.map(([href, title, sub]) =>
          `<a class="seo-link-card is-compact" data-icon="${cardIcon(title, href)}" href="${href}"><strong>${title}</strong><span>${sub}</span></a>`).join('')}
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
  const pool = [...tagged, ...evergreen];
  const guidePrefix = state === 'Uttar Pradesh' ? 'uppcl' : discom.id;
  const priority = [
    `how-to-read-${guidePrefix}-bill`,
    `${guidePrefix}-smart-meter-readings-explained`,
    `${guidePrefix}-new-connection-jhatpat`,
    'how-fppa-fuel-surcharge-is-calculated',
    'reduce-fixed-charges-sanctioned-load',
    'why-did-my-electricity-bill-increase',
  ];
  const picks = [];
  for (const slug of priority) {
    const g = pool.find(x => x.slug === slug);
    if (g && !picks.includes(g)) picks.push(g);
  }
  for (const g of pool) if (!picks.includes(g)) picks.push(g);
  picks.length = Math.min(picks.length, 5);
  if (!picks.length) return '';
  const cards = picks.map(g => {
    const href = (lang !== 'en' && guideHasBody(g, lang)) ? `/${lang}/guides/${g.slug}/` : `/guides/${g.slug}/`;
    const title = guideField(g, 'title', lang) || g.title;
    const mins = T(lang, { en: `${g.minutes} min read`, hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிட வாசிப்பு` });
    return `<a class="seo-link-card is-compact" data-icon="guide" href="${href}"><strong>${esc(title)}</strong><small>${mins}</small></a>`;
  }).join('');
  const allHref = `${lang === 'en' ? '' : '/' + lang}/guides/`;
  const heading = T(lang, { en: `Guides for ${esc(discom.name)} consumers`, hi: `${esc(discom.name)} बिल से जुड़ी गाइड`, mr: `${esc(discom.name)} ग्राहकांसाठी मार्गदर्शक`, ta: `${esc(discom.name)} நுகர்வோருக்கான வழிகாட்டிகள்` });
  const browseAll = T(lang, { en: 'Browse all guides →', hi: 'सभी गाइड देखें →', mr: 'सर्व मार्गदर्शक पहा →', ta: 'அனைத்து வழிகாட்டிகளையும் பார்க்கவும் →' });
  return `
    <section class="seo-section is-aside">
      <h2>${heading}</h2>
      <div class="seo-link-grid is-compact">${cards}</div>
      <p><a href="${allHref}">${browseAll}</a></p>
    </section>`;
}

// State-page variant of guideLinksHtml: ONLY guides tagged to this state (no evergreen
// filler — that would render the same three cards on all 36 state pages). Returns '' when
// nothing is tagged so thin states don't get a boilerplate block.
function stateGuideLinksHtml(state, lang = 'en') {
  const picks = GUIDES.filter(g => (g.states || []).includes(state)).slice(0, 4);
  if (!picks.length) return '';
  const cards = picks.map(g => {
    const href = (lang !== 'en' && guideHasBody(g, lang)) ? `/${lang}/guides/${g.slug}/` : `/guides/${g.slug}/`;
    const title = guideField(g, 'title', lang) || g.title;
    const mins = T(lang, { en: `${g.minutes} min read`, hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிட வாசிப்பு` });
    return `<a class="seo-link-card is-compact" data-icon="guide" href="${href}"><strong>${esc(title)}</strong><small>${mins}</small></a>`;
  }).join('');
  const heading = T(lang, {
    en: `Guides for ${esc(state)} consumers`, hi: `${esc(stateName(state, 'hi'))} के उपभोक्ताओं के लिए गाइड`,
    mr: `${esc(stateName(state, 'mr'))} ग्राहकांसाठी मार्गदर्शक`, ta: `${esc(stateName(state, 'ta'))} நுகர்வோருக்கான வழிகாட்டிகள்` });
  const allHref = `${lang === 'en' ? '' : '/' + lang}/guides/`;
  const browseAll = T(lang, { en: 'Browse all guides →', hi: 'सभी गाइड देखें →', mr: 'सर्व मार्गदर्शक पहा →', ta: 'அனைத்து வழிகாட்டிகளையும் பார்க்கவும் →' });
  return `
    <section class="seo-section is-aside">
      <h2>${heading}</h2>
      <div class="seo-link-grid is-compact">${cards}</div>
      <p><a href="${allHref}">${browseAll}</a></p>
    </section>`;
}

// State-page tools row. Tool/app pages exist only at English URLs (they translate at
// runtime via i18n.js), so hrefs stay unprefixed in every language — only labels localise.
// smart-meter-recharge DOES have vernacular twins, so that one link is lang-aware.
function stateToolLinksHtml(state, lang = 'en') {
  const stateSlug = slugify(state);
  const discoms = getDiscoms(state);
  const sl = esc(stateName(state, lang));
  const smrHref = discoms.length === 1
    ? `${lang === 'en' ? '' : '/' + lang}/smart-meter-recharge/${stateSlug}/${discoms[0].id}/`
    : `${lang === 'en' ? '' : '/' + lang}/smart-meter-recharge/`;
  const links = [
    ['/compare/',
      T(lang, { en: `Compare ${sl} rates with other states`, hi: `${sl} की दरें अन्य राज्यों से तुलना करें`, mr: `${sl} चे दर इतर राज्यांशी तुलना करा`, ta: `${sl} விகிதங்களை மற்ற மாநிலங்களுடன் ஒப்பிடுங்கள்` }),
      T(lang, { en: 'Same units, every state — see where power is cheapest', hi: 'समान यूनिट, हर राज्य — देखें बिजली कहाँ सस्ती है', mr: 'समान युनिट, प्रत्येक राज्य — वीज कुठे स्वस्त आहे ते पाहा', ta: 'அதே யூனிட், ஒவ்வொரு மாநிலமும் — மின்சாரம் எங்கே மலிவு எனப் பாருங்கள்' })],
    [smrHref,
      T(lang, { en: `${sl} smart meter recharge`, hi: `${sl} स्मार्ट मीटर रिचार्ज`, mr: `${sl} स्मार्ट मीटर रिचार्ज`, ta: `${sl} ஸ்மார்ட் மீட்டர் ரீசார்ஜ்` }),
      T(lang, { en: 'Recharge steps, units-per-recharge and low-balance rules', hi: 'रिचार्ज के स्टेप, प्रति रिचार्ज यूनिट और लो-बैलेंस नियम', mr: 'रिचार्जचे टप्पे, प्रति रिचार्ज युनिट आणि लो-बॅलन्स नियम', ta: 'ரீசார்ஜ் படிகள், ரீசார்ஜுக்கான யூனிட்கள் மற்றும் குறைந்த-பேலன்ஸ் விதிகள்' })],
    ['/solar-calculator/',
      T(lang, { en: 'Rooftop solar savings calculator', hi: 'रूफटॉप सोलर बचत कैलकुलेटर', mr: 'रूफटॉप सोलर बचत कॅल्क्युलेटर', ta: 'கூரை சோலார் சேமிப்பு கணிப்பான்' }),
      T(lang, { en: `How much a rooftop system would cut a ${sl} bill`, hi: `रूफटॉप सिस्टम से ${sl} का बिल कितना घटेगा`, mr: `रूफटॉप सिस्टिमने ${sl} चे बिल किती कमी होईल`, ta: `கூரை அமைப்பு ஒரு ${sl} பில்லை எவ்வளவு குறைக்கும்` })],
    ['/services/#new-connection',
      T(lang, { en: `New electricity connection in ${sl}`, hi: `${sl} में नया बिजली कनेक्शन`, mr: `${sl} मध्ये नवीन वीज जोडणी`, ta: `${sl} இல் புதிய மின் இணைப்பு` }),
      T(lang, { en: 'Documents, charges and the step-by-step apply process', hi: 'दस्तावेज़, शुल्क और आवेदन की चरण-दर-चरण प्रक्रिया', mr: 'कागदपत्रे, शुल्क आणि टप्प्याटप्प्याने अर्ज प्रक्रिया', ta: 'ஆவணங்கள், கட்டணங்கள் மற்றும் படிப்படியான விண்ணப்ப செயல்முறை' })],
  ];
  const heading = T(lang, { en: `More ${sl} electricity tools`, hi: `${sl} बिजली से जुड़े और टूल`, mr: `${sl} विजेशी संबंधित आणखी साधने`, ta: `மேலும் ${sl} மின்சார கருவிகள்` });
  return `
    <section class="seo-section is-aside">
      <h2>${heading}</h2>
      <div class="seo-link-grid is-compact">
        ${links.map(([href, title, sub]) =>
          `<a class="seo-link-card is-compact" data-icon="${cardIcon(title, href)}" href="${href}"><strong>${title}</strong><span>${sub}</span></a>`).join('')}
      </div>
    </section>`;
}

// Sibling-state links within the same region — lateral mesh between the 36 state hubs so
// crawl paths (and readers comparing with a neighbour) don't have to bounce through the
// directory page. Vernacular pages link into /<lang>/ only where that language has a twin.
function nearbyStatesHtml(state, lang = 'en') {
  const region = REGIONS.find(r => r.states.includes(state));
  if (!region) return '';
  const covered = new Set(getStates());
  const others = region.states.filter(s => s !== state && covered.has(s));
  if (!others.length) return '';
  // Chips, not cards. As full cards this was 526px on the Haryana page — nearly twice the
  // section the page exists for, spent on a list of somewhere else. It is a jump list: a state
  // name and how many DISCOMs it has. Capped at 6, with the directory carrying the rest, and
  // still ordinary links, so the lateral crawl mesh this block exists for is untouched.
  const MAX_SIBLINGS = 6;
  const shown = others.slice(0, MAX_SIBLINGS);
  const chips = shown.map(s => {
    const pfx = (lang !== 'en' && langServesState(lang, s)) ? `/${lang}` : '';
    const nd = getDiscoms(s).length;
    const ndTitle = T(lang, {
      en: `${nd} DISCOM${nd > 1 ? 's' : ''}`, hi: `${nd} डिस्कॉम`, mr: `${nd} डिस्कॉम`, ta: `${nd} DISCOM` });
    return `<a class="seo-chip" href="${pfx}/tariffs/${slugify(s)}/">`
      + `${esc(stateName(s, lang))}<b title="${attr(ndTitle)}">${nd}</b></a>`;
  }).join('');
  const heading = T(lang, {
    en: `Electricity tariffs across ${region.en}`, hi: `${region.hi} की बिजली दरें`,
    mr: `${region.mr}मधील वीज दर`, ta: `${region.ta} மின் கட்டணங்கள்` });
  const allHref = `${lang === 'en' ? '' : '/' + lang}/tariffs/states/`;
  const allLabel = T(lang, { en: 'All states & UTs →', hi: 'सभी राज्य व केंद्रशासित प्रदेश →', mr: 'सर्व राज्ये व केंद्रशासित प्रदेश →', ta: 'அனைத்து மாநிலங்கள் & யூனியன் பிரதேசங்கள் →' });
  return `
    <section class="seo-section is-aside">
      <h2>${heading}</h2>
      <div class="seo-chip-row">${chips}<a class="seo-chip is-more" href="${allHref}">${allLabel}</a></div>
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
  // The parenthetical legal name, suppressed when it only echoes the short name.
  const gloss = nameGloss(discom.name, discom.fullName);
  // A wider label for "… and across X". Only meaningful when the DISCOM publishes a region
  // label separate from its city list: when `area` has no bracketed cities, parseArea puts
  // the whole string in `region`, cityPhrase becomes that same string, and the old template
  // rendered "for <10 districts> and across <the same 10 districts>" verbatim.
  const widerArea = (cities.length && region && region !== cityPhrase) ? region
    : (cities.length ? state : '');

  if (lang !== 'en') return discomPageVernacular({ state, discom, stateSlug, enUrl, url, meta, fy, long, gloss, region, cities, dr, shared, cityPhrase, lang });

  // Which vernacular twins exist for this state (Hindi always; Marathi/Tamil only for their state).
  const altLangs = VERNACULARS.filter(l => langServesState(l, state));

  // Deterministic phrasing variation (keyed off the DISCOM) so titles/intros aren't a single
  // repeated template across 65 pages — each one is differently worded but factually identical.
  const seed = discom.id + state;
  const cname = consumerName(discom);   // leads titles/H1 with the term people actually search
  // Titles stay ≤ ~60 chars (Google's truncation width) and ALWAYS lead with
  // "<name> Bill Calculator <year>" — the exact query shape ("TNEB bill calculator 2024-25",
  // "MVVNL bill calculator 2025-26") — with only the suffix varied. No brand suffix (Google
  // shows the site name separately). Long names step down via fitTitle().
  // The slab range leads when we have it: "MVVNL Bill Calculator 2026 — ₹3.35–6.50/unit" tells
  // a searcher at position 9 something no competing result does, where "— Tariff & Rates"
  // restates the query back at them. fitTitle() steps down to the old rotation for the long
  // DISCOM names ("Adani Electricity Mumbai") where the rate tag will not fit.
  const rt = rateTag(dr);
  const title = fitTitle(rt
    ? `${cname} Bill Calculator ${TITLE_YEAR} — ${rt}`
    : variant(seed, [
      `${cname} Bill Calculator ${TITLE_YEAR} — Tariff & Rates`,
      `${cname} Bill Calculator ${TITLE_YEAR} — ${state} Tariff`,
      `${cname} Electricity Bill Calculator ${TITLE_YEAR}`,
    ]), [
    variant(seed, [
      `${cname} Bill Calculator ${TITLE_YEAR} — Tariff & Rates`,
      `${cname} Bill Calculator ${TITLE_YEAR} — ${state} Tariff`,
      `${cname} Electricity Bill Calculator ${TITLE_YEAR}`,
    ]),
    `${cname} Bill Calculator ${TITLE_YEAR}`,
    `${cname} Bill Calculator`,
  ]);
  // "In force from 1 October 2025" replaces the "Free, no sign-up." sign-off wherever we know
  // the date. Tariff searches are freshness-sensitive and the SERP is full of pages quoting
  // rates from two orders ago — a date is the strongest differentiator we have, and a stronger
  // one than restating that a free calculator is free.
  const rp = ratesPhrase(meta, fy);
  const description = variant(seed + 'd', [
    `Calculate your ${discom.name}${gloss} electricity bill for ${fy}${rp ? `, ${rp.label}` : ''}${cityPhrase ? `, in ${cityPhrase}` : ''}. Slab-wise rates, fixed charges, FPPA & duties.${dr ? ` Domestic from ${rupeeRate(dr.min)}/unit.` : ''}`,
    `${discom.name} electricity bill calculator for ${state}${cityPhrase ? ` (${cityPhrase})` : ''}. ${fy} domestic & commercial slab rates${rp ? ` (${rp.label})` : ''}, fixed/demand charges and an instant itemised estimate.`,
    `Free ${discom.name} bill estimate (${fy})${cityPhrase ? ` for ${cityPhrase}${widerArea ? ` and across ${widerArea}` : ''}` : ''}.${rp ? ` Rates ${rp.label}.` : ''} See the full tariff schedule and indicative monthly bills.`,
  ]);
  // The H1 names what the page IS: a tariff reference. It used to lead with "Bill Calculator",
  // which was wrong on three counts. There is no calculator on this page — the CTA links out to
  // /#calculator, so the heading promised a tool the page does not contain. The Aug 2026 GSC
  // export puts rate-intent queries ("uhbvn per unit rate 2026", "dhbvn electricity rate") at
  // 2,359 impressions against 543 for calculator-intent, and most of those rate queries sat at
  // 0.00% CTR from page one. And one rotation slot produced "Bill Calculator 2026 — 2026-27
  // Tariff", a calendar year and a financial year side by side, which reads as a rendering bug.
  //
  // Only the tariff-order FY appears now. That follows the year convention rather than breaking
  // it: the calendar year belongs with "Bill Calculator", so it leaves when that noun does.
  //
  // Deliberately ONE pattern, not the old three-way rotation. Rotation guards against templated
  // sameness in a SERP, where results sit next to each other — no visitor ever sees two of these
  // headings together. Across a 65-page directory the predictable shape is worth more than the
  // variety, and the DISCOM name already makes each one unique. The region (falling back to the
  // state) is the natural on-page differentiator.
  //
  // The rate range is NOT in the H1 on purpose: "<DISCOM> at a glance" repeats it a few lines
  // down, and a heading carrying a price reads like a SERP title pasted onto the page.
  //
  // Three DISCOMs carry "Electricity" in the name they are known by — Adani Electricity Mumbai,
  // Goa Electricity Dept., PDICL / Electricity Dept. — and the unguarded template gave them
  // "Adani Electricity Mumbai Electricity Tariff". Same class of redundancy nameGloss() already
  // guards against for the legal-name parenthetical.
  const h1 = `${esc(cname)} Electricity Bill Calculator &amp; Tariff ${esc(fy)}`;
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
    <section class="seo-section is-aside">
      <h2>Other DISCOMs in ${esc(state)}</h2>
      <div class="seo-link-grid">
        ${siblings.map((d, i) => discomLinkCard(state, d, `/tariffs/${stateSlug}/${d.id}/`, i)).join('')}
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
    ${discomPortalActionsHtml(state, discom)}
    ${discomCalculatorPanelHtml(state, discom)}

    ${keyFactsHtml(state, discom, fy)}
    ${currentFppaHtml(state, discom)}
    ${fppaTrendHtml(state, discom)}
    ${indicativeBillsHtml(state, discom)}

    <section class="seo-section" id="current-tariff">
      <h2>Current ${esc(discom.name)} tariff (${esc(fy)})</h2>
      ${sharedNote}
      <div class="tariff-cards">${cards}</div>
    </section>

    ${billLineExplainerHtml(discom)}
    ${areaServedHtml(discom)}
    ${officialServicesHtml(state, discom)}
    ${guideLinksHtml(state, discom)}
    ${discomSourcesHtml(state, discom, fy)}
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
function discomPageVernacular({ state, discom, stateSlug, enUrl, url, meta, fy, long, gloss, region, cities, dr, shared, cityPhrase, lang }) {
  const sl = stateName(state, lang);
  const fyL = fyLabel(fy, lang);
  const nm = esc(discom.name);
  const cname = consumerName(discom);   // TNEB (TANGEDCO) / MVVNL (UPPCL) — leads title + H1
  // consumerName already carries a bracketed alias for some DISCOMs, so the gloss is
  // recomputed against it: appending the legal name to "TNEB (TANGEDCO)" would otherwise
  // produce two parentheticals in a row.
  const cgloss = nameGloss(cname, discom.fullName);
  const yr = yearLabel(fy);
  const pfx = `/${lang}`;
  const cityList3 = esc(cities.slice(0, 3).join(', '));
  const rgn = region || sl;

  // The rate tag is script-neutral — "₹2.20–7.50/unit" carries the same meaning in a Hindi SERP
  // as an English one, and Devanagari costs 0.951/char so it fits more often here than in English.
  const rt = rateTag(dr, lang);
  const title = fitTitle(
    rt
      ? T(lang, { hi: `${cname} बिजली बिल कैलकुलेटर ${TITLE_YEAR} — ${rt}`, mr: `${cname} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR} — ${rt}`, ta: `${cname} மின் கட்டண கணிப்பான் ${TITLE_YEAR} — ${rt}`, en: `${cname} Bill Calculator ${TITLE_YEAR} — ${rt}` })
      : T(lang, { hi: `${cname} बिजली बिल कैलकुलेटर ${TITLE_YEAR} — टैरिफ`, mr: `${cname} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR} — टॅरिफ`, ta: `${cname} மின் கட்டண கணிப்பான் ${TITLE_YEAR} — கட்டணம்`, en: `${cname} Bill Calculator ${TITLE_YEAR}` }),
    [
      T(lang, { hi: `${cname} बिजली बिल कैलकुलेटर ${TITLE_YEAR} — टैरिफ`, mr: `${cname} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR} — टॅरिफ`, ta: `${cname} மின் கட்டண கணிப்பான் ${TITLE_YEAR} — கட்டணம்`, en: `${cname} Bill Calculator ${TITLE_YEAR}` }),
      T(lang, { hi: `${cname} बिजली बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${cname} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${cname} மின் கட்டண கணிப்பான் ${TITLE_YEAR}`, en: `${cname} Bill Calculator ${TITLE_YEAR}` }),
      T(lang, { hi: `${cname} बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${cname} बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${cname} கட்டண கணிப்பான் ${TITLE_YEAR}`, en: `${cname} Bill Calculator` }),
    ]);
  const description = T(lang, {
    hi: `${cname}${cgloss} का बिजली बिल ${fyL} के लिए निकालें${cityPhrase ? ` — ${cityPhrase}` : ''}। स्लैब दरें, फिक्स्ड चार्ज, FPPA व शुल्क।${dr ? ` घरेलू दर ${rupee(dr.min)}/यूनिट से।` : ''} मुफ़्त, बिना साइन-अप।`,
    mr: `${cname}${cgloss} चे वीज बिल ${fyL} साठी काढा${cityPhrase ? ` — ${cityPhrase}` : ''}. स्लॅब दर, फिक्स्ड चार्ज, FPPA व शुल्क.${dr ? ` घरगुती दर ${rupee(dr.min)}/युनिट पासून.` : ''} मोफत, साइन-अप शिवाय.`,
    ta: `${cname}${cgloss} மின் கட்டணத்தை ${fyL}-க்கு கணக்கிடுங்கள்${cityPhrase ? ` — ${cityPhrase}` : ''}. அடுக்கு விகிதங்கள், நிலையான கட்டணம், FPPA மற்றும் வரிகள்.${dr ? ` வீட்டு கட்டணம் ${rupee(dr.min)}/யூனிட் முதல்.` : ''} இலவசம், பதிவு தேவையில்லை.`,
    en: `Calculate your ${discom.name} bill for ${fy}.` });
  // Tariff-led, matching the English twin — see the H1 note in discomPage(). Leaving these on
  // the calculator wording would have the Hindi and English versions of one page disagree about
  // what the page is.
  //
  // The tail is the LOCALISED STATE name, not `rgn`. Service regions come out of the tariff data
  // as raw English ("South Haryana", "Mumbai suburbs") and are never translated, so using them
  // here produced "DHBVN बिजली टैरिफ 2026-27 — South Haryana" — a Devanagari heading ending in
  // English. The DISCOM name already makes each page unique; the state is the part worth saying.
  const vElec = /electricity/i.test(cname);
  const h1 = T(lang, {
    hi: `${esc(cname)} ${vElec ? 'टैरिफ' : 'बिजली टैरिफ'} ${esc(fyL)} — ${esc(sl)}`,
    mr: `${esc(cname)} ${vElec ? 'टॅरिफ' : 'वीज टॅरिफ'} ${esc(fyL)} — ${esc(sl)}`,
    ta: `${esc(cname)} ${vElec ? 'கட்டணம்' : 'மின் கட்டணம்'} ${esc(fyL)} — ${esc(sl)}`,
    en: `${esc(cname)} ${tariffNoun(cname)} ${esc(fyL)} — ${esc(sl)}` });
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
    <section class="seo-section is-aside">
      <h2>${siblingHead}</h2>
      <div class="seo-link-grid">
        ${siblings.map((d, i) => discomLinkCard(state, d, `${pfx}/tariffs/${stateSlug}/${d.id}/`, i)).join('')}
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
    const vRt = rateTag(stateRateRange(discoms), lang);
    const title = fitTitle(
      vRt
        ? T(lang, { hi: `${sl} बिजली टैरिफ ${yr} — ${vRt}`, mr: `${sl} वीज टॅरिफ ${yr} — ${vRt}`, ta: `${sl} மின் கட்டணம் ${yr} — ${vRt}`, en: '' })
        : T(lang, { hi: `${sl} बिजली बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${sl} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${sl} மின் கட்டண கணிப்பான் ${TITLE_YEAR}`, en: '' }), [
      T(lang, { hi: `${sl} बिजली बिल कैलकुलेटर ${TITLE_YEAR}`, mr: `${sl} वीज बिल कॅल्क्युलेटर ${TITLE_YEAR}`, ta: `${sl} மின் கட்டண கணிப்பான் ${TITLE_YEAR}`, en: '' }),
      T(lang, { hi: `${sl} बिजली टैरिफ ${yr}`, mr: `${sl} वीज टॅरिफ ${yr}`, ta: `${sl} மின் கட்டணம் ${yr}`, en: '' }),
      T(lang, { hi: `${sl} बिजली टैरिफ`, mr: `${sl} वीज टॅरिफ`, ta: `${sl} மின் கட்டணம்`, en: '' }),
    ]);
    const description = T(lang, {
      hi: `${sl} की ${fyL} स्लैब दरें देखें और 30 सेकंड में अपना सटीक बिजली बिल निकालें। ${nd} डिस्कॉम (${names}) — फिक्स्ड चार्ज व FPPA सहित।${stateMin != null ? ` घरेलू दर ${rupee(stateMin)}/यूनिट से।` : ''} मुफ़्त, बिना साइन-अप।`,
      mr: `${sl} चे ${fyL} स्लॅब दर पाहा आणि 30 सेकंदांत तुमचे नेमके वीज बिल काढा. ${nd} डिस्कॉम (${names}) — फिक्स्ड चार्ज व FPPA सह.${stateMin != null ? ` घरगुती दर ${rupee(stateMin)}/युनिट पासून.` : ''} मोफत, साइन-अप शिवाय.`,
      ta: `${sl} இன் ${fyL} அடுக்கு விகிதங்களைப் பாருங்கள், 30 விநாடிகளில் உங்கள் சரியான மின் கட்டணத்தைக் கணக்கிடுங்கள். ${nd} DISCOM (${names}) — நிலையான கட்டணம் & FPPA உடன்.${stateMin != null ? ` வீட்டு கட்டணம் ${rupee(stateMin)}/யூனிட் முதல்.` : ''} இலவசம், பதிவு தேவையில்லை.`,
      en: '' });
    const discomCards = discoms.map((d, i) => discomLinkCard(state, d, `${pfx}/tariffs/${stateSlug}/${d.id}/`, i)).join('');
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
    const h1 = T(lang, { hi: `${esc(sl)} बिजली टैरिफ ${esc(fyL)} — डिस्कॉम के अनुसार स्लैब दरें`, mr: `${esc(sl)} वीज टॅरिफ ${esc(fyL)} — डिस्कॉमनुसार स्लॅब दर`, ta: `${esc(sl)} மின் கட்டணம் ${esc(fyL)} — DISCOM வாரியாக அடுக்கு விகிதங்கள்`, en: '' });
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
    <h1>${h1}</h1>
    <p class="guide-meta">${updated}</p>
    <p class="seo-lead">${lead}</p>
    <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">${cta}</a></p>

    <section class="seo-section">
      <h2>${discomsHead}</h2>
      <p>${discomsIntro}</p>
      <div class="seo-link-grid">${discomCards}</div>
    </section>

    ${stateGuideLinksHtml(state, lang)}
    ${stateToolLinksHtml(state, lang)}
    ${nearbyStatesHtml(state, lang)}
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
  // Rate-first, same reasoning as the DISCOM page. The tariff-order FY pairs with "Tariff" and
  // the calendar year with "Bill Calculator" — that split is deliberate and matches how the two
  // phrasings are actually searched, so the fallbacks keep each year with its own noun.
  const srr = stateRateRange(discoms);
  const stateRt = rateTag(srr);
  const title = fitTitle(stateRt
    ? `${state} Electricity Tariff ${fy} — ${stateRt}`
    : variant(seed, [
      `${state} Electricity Bill Calculator ${TITLE_YEAR}`,
      `${state} Electricity Tariff ${fy} — Bill Calculator`,
      `${state} DISCOM Tariffs & Bill Calculator ${TITLE_YEAR}`,
    ]), [
    ...(stateRt ? [`${state} Tariff ${fy} — ${stateRt}`] : []),
    variant(seed, [
      `${state} Electricity Bill Calculator ${TITLE_YEAR}`,
      `${state} Electricity Tariff ${fy} — Bill Calculator`,
      `${state} DISCOM Tariffs & Bill Calculator ${TITLE_YEAR}`,
    ]),
    `${state} Electricity Tariff ${fy}`,
    `${state} Tariff ${fy}`,
  ]);
  // The effective date rides immediately after the tariff year, not as a sign-off. Trailed at
  // the end it was the first thing the 155-unit clamp threw away — Rajasthan's snippet lost
  // "In force from 1 October 2025" entirely — which is exactly backwards, since the date is the
  // most differentiating clause in the sentence and "Free, no sign-up" is the most expendable.
  const rp = ratesPhrase(meta, fy);
  const rpParen = rp ? ` (${rp.label})` : '';
  const description = variant(seed + 'd', [
    `Check ${state}'s ${fy} slab rates${rpParen} & calculate your exact electricity bill in 30 seconds. ${discoms.length} DISCOM${discoms.length > 1 ? 's' : ''} with fixed charges & FPPA${stateMin != null ? `, domestic from ${rupee(stateMin)}/unit` : ''}.`,
    `See what electricity costs in ${state} (${fy}${rp ? `, ${rp.label}` : ''})${cityLine ? ` — ${cityLine} & more` : ''}. Pick your DISCOM for its full slab table and an instant itemised bill.`,
    `${state} electricity tariff ${fy}${rpParen}: compare ${names}${stateMin != null ? `, rates from ${rupee(stateMin)}/unit,` : ''} and get your exact bill in seconds.`,
  ]);

  const discomCards = discoms.map((d, i) => discomLinkCard(state, d, `/tariffs/${stateSlug}/${d.id}/`, i)).join('');

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
    <!-- Tariff-led, FY only — see the H1 note in discomPage() for why the calculator framing
         left these headings and why the calendar year went with it. -->
    <h1>${esc(state)} Electricity Tariff ${esc(fy)} — Slab Rates by DISCOM</h1>
    <p class="guide-meta">Tariffs last updated: ${tariffUpdated(state, 'en')}${meta.verified ? ' · ✓ verified against real bills' : ''}</p>
    <p class="seo-lead">Calculate your provisional electricity bill for any of ${esc(state)}'s ${discoms.length} distribution compan${discoms.length > 1 ? 'ies' : 'y'} — ${esc(names)} — with a full slab-wise breakdown for ${esc(fy)}${cityLine ? `, covering ${esc(cityLine)} and more` : ''}.</p>
    <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">Open the ${esc(state)} bill calculator →</a></p>

    <section class="seo-section">
      <h2>Electricity DISCOMs in ${esc(state)}</h2>
      <p>Select your distribution company to see its ${esc(fy)} tariff schedule, service area and an indicative monthly bill.</p>
      <div class="seo-link-grid">${discomCards}</div>
    </section>

    ${stateGuideLinksHtml(state)}
    ${stateToolLinksHtml(state)}
    ${nearbyStatesHtml(state)}
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

// ── Region colour, shared by every state and DISCOM card ─────────────────────
// The six REGIONS hues already existed but only /tariffs/states/ ever used them — 8 pages out
// of 486, while the card a reader actually meets most often (the DISCOM list on each of the
// 476 state pages) was a plain white box. These helpers push that one colour down to every
// card, so the accent means "this is where in India you are" rather than being decoration.
// Colour never carries meaning on its own here: it rides alongside the state name and code,
// and it is used only on rails, badges and washes, never behind body text.
const REGION_OF_STATE = new Map(REGIONS.flatMap(r => r.states.map(s => [s, r])));
const REGION_FALLBACK = { en: 'Other', color: '#64748b', slug: 'other' };
const regionOf = (state) => REGION_OF_STATE.get(state) || REGION_FALLBACK;
const regionAccent = (state) => regionOf(state).color || REGION_FALLBACK.color;

// The rate span a household actually pays, for the card's stat line. Returns '' when the
// tariff DB has nothing quotable rather than inventing a range.
function domesticSpanLabel(discom) {
  const dr = domesticRates(discom);
  if (!dr) return '';
  return dr.min === dr.max ? `${rupeeRate(dr.min)}/unit` : `${rupeeRate(dr.min)}–${rupeeRate(dr.max)}/unit`;
}

function regionCardStat(text, verified) {
  if (!text) return '';
  return `<span class="seo-link-stat">${esc(text)}`
    + (verified ? '<b class="seo-link-tick" title="Verified against real bills">✓</b>' : '')
    + '</span>';
}

// ── Tile hues for DISCOM cards ───────────────────────────────────────────────
// Six soft, desaturated colours that survive being laid under text as a wash. The region hue
// used to fill this role, but every DISCOM in a state shares its state's region — so on the
// page where these cards actually live, a state page, they all came out the same colour and
// the tint told the reader nothing. Now each DISCOM in a state gets its own.
//
// The consequence, stated plainly: colour no longer encodes region here. It is stable
// decoration — the same DISCOM is always the same colour — and nothing is left depending on a
// reader decoding it, which is why the state code and the rate span do the actual work.
const TILE_HUES = ['#8b7ad6', '#cf8fa3', '#5fa3a0', '#c2916a', '#7593d4', '#8caa7d'];
// A stable per-state starting point, so two neighbouring states do not open on the same hue.
// Deterministic from the name: the build has to regenerate byte-for-byte.
const stateHueOffset = (state) => [...String(state)]
  .reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) % TILE_HUES.length;
const tileHue = (state, i) => TILE_HUES[(stateHueOffset(state) + i) % TILE_HUES.length];

// A DISCOM inside a state. Badge carries the state code, because every DISCOM on a given page
// shares it and the code is what tells the reader which page they are on at a glance.
function discomLinkCard(state, d, href, i = 0) {
  const a = parseArea(d.area);
  const area = a.region
    ? `${a.region}${a.cities.length ? ` — ${a.cities.slice(0, 3).join(', ')}` : ''}`
    : '';
  return `
    <a class="seo-link-card is-region is-tile" style="--dir-accent:${tileHue(state, i)}" href="${href}">
      <span class="seo-link-badge" aria-hidden="true">${esc(stateCode(state))}</span>
      <strong>${esc(d.name)}</strong>
      ${d.fullName ? `<span>${esc(d.fullName)}</span>` : ''}
      ${area ? `<small>${esc(area)}</small>` : ''}
      ${regionCardStat(domesticSpanLabel(d), !!(STATE_META[state] || {}).verified)}
    </a>`;
}

// A state, linking to its tariff page.
function stateLinkCard(state, href, title, sub) {
  const st = stateDomesticStats(state);
  const span = st ? (st.min === st.max ? `${rupeeRate(st.min)}/unit` : `${rupeeRate(st.min)}–${rupeeRate(st.max)}/unit`) : '';
  return `
    <a class="seo-link-card is-region" style="--dir-accent:${regionAccent(state)}" href="${href}">
      <span class="seo-link-badge" aria-hidden="true">${esc(stateCode(state))}</span>
      <strong>${title}</strong>
      ${sub ? `<small>${sub}</small>` : ''}
      ${regionCardStat(span, !!(st && st.verified))}
    </a>`;
}

// Names people still search that are not the state's current official name, plus the
// unpunctuated spellings a search box will actually receive. Search keywords only —
// nothing user-visible renders from this.
const STATE_ALIASES = {
  'Odisha': ['Orissa'],
  'Puducherry': ['Pondicherry', 'Pondy'],
  'Jammu & Kashmir': ['Jammu and Kashmir', 'Jammu Kashmir', 'J&K', 'JK'],
  'Dadra & Nagar Haveli and Daman & Diu': ['Dadra Nagar Haveli', 'Daman Diu', 'DNH'],
  'Delhi': ['New Delhi', 'NCR', 'NCT'],
  'Uttar Pradesh': ['UPPCL'],
  'Uttarakhand': ['Uttaranchal'],
  'Tamil Nadu': ['Tamilnadu', 'TNEB'],
  'Karnataka': ['Bangalore', 'Bengaluru'],
  'Maharashtra': ['MSEDCL', 'Mahavitaran'],
  'West Bengal': ['Bengal'],
  'Telangana': ['TG'],
};

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
    hi: 'हर भारतीय राज्य और केंद्र शासित प्रदेश के बिजली टैरिफ व बिल कैलकुलेटर देखें। 65 डिस्कॉम, स्लैब-वार दरें, फिक्स्ड चार्ज और FPPA — एक ही डायरेक्टरी में।',
    mr: 'प्रत्येक भारतीय राज्य आणि केंद्रशासित प्रदेशाचे वीज टॅरिफ व बिल कॅल्क्युलेटर पाहा. 65 डिस्कॉम, स्लॅब-निहाय दर, फिक्स्ड चार्ज आणि FPPA — एकाच डिरेक्टरीमध्ये.',
    ta: 'ஒவ்வொரு இந்திய மாநிலம் மற்றும் யூனியன் பிரதேசத்தின் மின் கட்டணங்கள் மற்றும் பில் கணிப்பான்களைப் பாருங்கள். 65 DISCOM-கள், அடுக்கு வாரியான விகிதங்கள், நிலையான கட்டணம் மற்றும் FPPA — ஒரே டைரக்டரியில்.',
    en: 'Browse electricity tariffs and bill calculators for every Indian state and union territory. 65 DISCOMs, slab-wise rates, fixed charges and FPPA — all in one directory.' });

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
    // data-search carries every script's name + discom names so the filter box matches everything.
    //
    // It must also carry the state CODE and the aliases, and for a long time it did not — so
    // typing "UP" (or "UK", or "UPPCL") hid the Uttar Pradesh card, even though the placeholder
    // says "e.g. UP" and the card renders a big "UP" badge. The blob held only the state's four
    // script names plus DISCOM names, and none of "uttar pradesh dvvnl mvvnl pvvnl puvvnl kesco"
    // contains the substring "up". MP and HP appeared to work purely by luck, matching inside
    // "mppkvvcl" and "hpsebl".
    //
    // Both sources already existed and are what the site-wide search indexes (see the `k` field
    // built further down) — the directory filter simply was not using them. Sharing them is the
    // point: the two searches can no longer disagree about what "UP" means.
    const searchBlob = [
      state, stateName(state, 'hi'), stateName(state, 'mr'), stateName(state, 'ta'),
      stateCode(state),                    // the code already printed on the card's badge
      ...(STATE_ALIASES[state] || []),     // UPPCL, TNEB, MSEDCL, Orissa, Pondicherry, …
      ...discoms.map(d => d.name),
    ].join(' ').toLowerCase();
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
          <!-- The state name is a span, not a heading. 35 state names in a directory grid are
               link labels, not 35 document sections — as an h3 they skipped a level under the
               page H1 and, sitting inside this span, were invalid nesting the parser had to
               repair. Google reads the anchor text either way. -->
          <span class="seo-dir-state-meta">
            <span class="seo-dir-state-name">${esc(displayName)}<span class="seo-dir-arrow" aria-hidden="true">→</span></span>
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
      // Two-letter queries are state codes, not fragments — match them at word starts only.
      // Now that every blob carries its code, a bare substring test would let "dl" pull in any
      // state whose DISCOM names happen to contain those letters. Same rule the site-wide
      // search applies, for the same reason.
      cards.forEach(function(c){
        var blob=c.getAttribute('data-search'), hit;
        if(!t) hit=true;
        else if(t.length<=2) hit=blob.split(/[^a-z0-9]+/).some(function(w){return w.indexOf(t)===0;});
        else hit=blob.indexOf(t)>-1;
        c.hidden=!hit; if(hit)shown++;
      });
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
  // `image` is a required Article property. The per-guide social card is already rendered by
  // scripts/og-images.mjs, so this reuses it rather than adding a second asset — same
  // existsSync guard as layout(), so a guide whose card hasn't been rendered yet falls back
  // to the shared default instead of pointing at a 404.
  const card = `guide-${guide.slug}`;
  const image = fs.existsSync(path.join(ROOT, 'og', `${card}.jpg`))
    ? `${SITE}/og/${card}.jpg` : `${SITE}/og-image.jpg`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    image,
    mainEntityOfPage: SITE + url,
    datePublished: guide.published || LASTMOD_ISO,
    dateModified: LASTMOD_ISO,
    inLanguage: 'en-IN',
    author: { '@id': `${SITE}/#org` },
    publisher: { '@id': `${SITE}/#org` },
  };
}

// Guide → tool/tariff cross-links: each guide points readers at the state tariff hubs it
// is tagged to plus the one tool page that matches its category. Real contextual anchors
// from long-form content into the money pages — the strongest internal-link direction.
const GUIDE_TOOL_LINK = {
  solar:      ['/solar-calculator/', { en: 'Rooftop solar savings calculator', hi: 'रूफटॉप सोलर बचत कैलकुलेटर', mr: 'रूफटॉप सोलर बचत कॅल्क्युलेटर', ta: 'கூரை சோலார் சேமிப்பு கணிப்பான்' },
    { en: 'Size a system and see the payback on your own bill', hi: 'सिस्टम का आकार तय करें और अपने बिल पर पेबैक देखें', mr: 'सिस्टिमचा आकार ठरवा आणि तुमच्या बिलावरील परतावा पाहा', ta: 'அமைப்பின் அளவை தீர்மானித்து உங்கள் பில்லில் திருப்பிச் செலுத்தும் காலத்தைப் பாருங்கள்' }],
  ev:         ['/ev-charging-calculator/', { en: 'EV charging cost calculator', hi: 'EV चार्जिंग लागत कैलकुलेटर', mr: 'EV चार्जिंग खर्च कॅल्क्युलेटर', ta: 'EV சார்ஜிங் செலவு கணிப்பான்' },
    { en: 'Per-km cost of charging at home on your tariff', hi: 'अपने टैरिफ पर घर पर चार्जिंग की प्रति-किमी लागत', mr: 'तुमच्या टॅरिफवर घरी चार्जिंगचा प्रति-किमी खर्च', ta: 'உங்கள் கட்டணத்தில் வீட்டில் சார்ஜ் செய்யும் கி.மீ.-க்கான செலவு' }],
  smartMeter: ['/smart-meter/', { en: 'Smart meter reading guide', hi: 'स्मार्ट मीटर रीडिंग गाइड', mr: 'स्मार्ट मीटर रीडिंग मार्गदर्शक', ta: 'ஸ்மார்ட் மீட்டர் ரீடிங் வழிகாட்டி' },
    { en: 'Check your smart meter reading and match it to your bill', hi: 'अपनी स्मार्ट मीटर रीडिंग जांचें और उसे बिल से मिलाएं', mr: 'तुमचे स्मार्ट मीटर रीडिंग तपासा आणि बिलाशी जुळवा', ta: 'உங்கள் ஸ்மார்ட் மீட்டர் ரீடிங்கை சரிபார்த்து பில்லுடன் பொருத்துங்கள்' }],
  newConn:    ['/services/#new-connection', { en: 'New connection helper', hi: 'नया कनेक्शन हेल्पर', mr: 'नवीन जोडणी मदतनीस', ta: 'புதிய இணைப்பு உதவியாளர்' },
    { en: 'Documents, charges and apply steps for your DISCOM', hi: 'आपके डिस्कॉम के दस्तावेज़, शुल्क और आवेदन के स्टेप', mr: 'तुमच्या डिस्कॉमसाठी कागदपत्रे, शुल्क आणि अर्जाचे टप्पे', ta: 'உங்கள் DISCOM-க்கான ஆவணங்கள், கட்டணங்கள் மற்றும் விண்ணப்ப படிகள்' }],
  charges:    ['/glossary/', { en: 'Electricity bill glossary', hi: 'बिजली बिल शब्दावली', mr: 'वीज बिल शब्दावली', ta: 'மின் கட்டண சொற்களஞ்சியம்' },
    { en: 'Every charge line on an Indian bill, in plain language', hi: 'भारतीय बिल की हर शुल्क लाइन, आसान भाषा में', mr: 'भारतीय बिलावरील प्रत्येक शुल्क ओळ, सोप्या भाषेत', ta: 'இந்திய பில்லில் உள்ள ஒவ்வொரு கட்டண வரியும், எளிய மொழியில்' }],
  saveMoney:  ['/compare/', { en: 'Compare tariffs across states', hi: 'राज्यों के टैरिफ की तुलना करें', mr: 'राज्यांच्या टॅरिफची तुलना करा', ta: 'மாநிலங்களுக்கிடையே கட்டணங்களை ஒப்பிடுங்கள்' },
    { en: 'Same units, every state — see where power is cheapest', hi: 'समान यूनिट, हर राज्य — देखें बिजली कहाँ सस्ती है', mr: 'समान युनिट, प्रत्येक राज्य — वीज कुठे स्वस्त आहे ते पाहा', ta: 'அதே யூனிட், ஒவ்வொரு மாநிலமும் — மின்சாரம் எங்கே மலிவு எனப் பாருங்கள்' }],
  basics:     ['/glossary/', { en: 'Electricity bill glossary', hi: 'बिजली बिल शब्दावली', mr: 'वीज बिल शब्दावली', ta: 'மின் கட்டண சொற்களஞ்சியம்' },
    { en: 'Every charge line on an Indian bill, in plain language', hi: 'भारतीय बिल की हर शुल्क लाइन, आसान भाषा में', mr: 'भारतीय बिलावरील प्रत्येक शुल्क ओळ, सोप्या भाषेत', ta: 'இந்திய பில்லில் உள்ள ஒவ்வொரு கட்டண வரியும், எளிய மொழியில்' }],
};

const GUIDE_AUTO_TOP_TOOL_CATEGORIES = new Set(['solar', 'ev', 'smartMeter', 'newConn', 'saveMoney']);
const GUIDE_AUTO_TOP_EXAMPLE_CATEGORIES = new Set(['solar', 'ev', 'smartMeter', 'newConn']);

// Prominent inline CTA into an interactive tool, placed right under a guide's intro.
// Guide-specific CTAs still win, then category links, then the main calculator fallback.
function guideToolCtaHtml(guide, lang = 'en') {
  if (guide.toolCta === false) return '';
  const cat = guideCategoryId(guide);
  if (!guide.toolCta && !GUIDE_AUTO_TOP_TOOL_CATEGORIES.has(cat)) return '';
  const tool = GUIDE_TOOL_LINK[cat];
  const c = guide.toolCta || (tool && {
    href: tool[0],
    title: tool[1],
    sub: tool[2],
  }) || {
    href: '/#calculator',
    title: {
      en: 'Electricity bill calculator',
      hi: 'बिजली बिल कैलकुलेटर',
      mr: 'वीज बिल कॅल्क्युलेटर',
      ta: 'மின் பில் கணிப்பான்',
    },
    sub: {
      en: 'Calculate this on your bill using real DISCOM rates',
      hi: 'असली DISCOM दरों से इसे अपने बिल पर कैलकुलेट करें',
      mr: 'खऱ्या DISCOM दरांनी हे तुमच्या बिलावर कॅल्क्युलेट करा',
      ta: 'உண்மையான DISCOM விகிதங்களில் இதை உங்கள் பில்லில் கணக்கிடுங்கள்',
    },
  };
  const label = T(lang, { en: 'Interactive tool', hi: 'इंटरैक्टिव टूल', mr: 'इंटरॅक्टिव्ह साधन', ta: 'ஊடாடும் கருவி' });
  return `
    <a class="guide-tool-cta" href="${c.href}">
      <span class="guide-tool-cta-kicker">${label}</span>
      <strong>${T(lang, c.title)}</strong>
      <span class="guide-tool-cta-sub">${T(lang, c.sub)}</span>
      <span class="guide-tool-cta-go" aria-hidden="true">→</span>
    </a>`;
}

function guideTopExampleHtml(guide, lang = 'en') {
  if (guide.topExample === false) return '';
  const cat = guideCategoryId(guide);
  if (!guide.topExample && !GUIDE_AUTO_TOP_EXAMPLE_CATEGORIES.has(cat)) return '';
  const title = T(lang, {
    en: 'Example to look for',
    hi: 'देखने वाला उदाहरण',
    mr: 'पाहण्यासारखे उदाहरण',
    ta: 'பார்க்க வேண்டிய எடுத்துக்காட்டு',
  });
  const sample = T(lang, { en: 'SAMPLE', hi: 'सैंपल', mr: 'नमुना', ta: 'மாதிரி' });
  const check = T(lang, { en: 'CHECK THIS', hi: 'यह देखें', mr: 'हे पहा', ta: 'இதைக் காண்க' });
  const note = T(lang, {
    en: 'Use this sample as a quick visual map, then match the highlighted line with your own bill or meter.',
    hi: 'इस सैंपल को विजुअल मैप की तरह देखें, फिर हाईलाइट लाइन को अपने बिल या मीटर से मिलाएं।',
    mr: 'हा नमुना दृश्य नकाशा म्हणून वापरा, मग हायलाइट केलेली ओळ तुमच्या बिलाशी किंवा मीटरशी जुळवा.',
    ta: 'இந்த மாதிரியை விரைவு காட்சி வரைபடமாகப் பயன்படுத்தி, பின்னர் குறிக்கப்பட்ட வரியை உங்கள் பில் அல்லது மீட்டருடன் பொருத்துங்கள்.',
  });

  if (cat === 'smartMeter') {
    const aria = T(lang, {
      en: 'Sample smart meter display with present reading highlighted',
      hi: 'प्रेजेंट रीडिंग हाईलाइट वाला सैंपल स्मार्ट मीटर डिस्प्ले',
      mr: 'सध्याचे रीडिंग हायलाइट केलेला स्मार्ट मीटर नमुना',
      ta: 'தற்போதைய ரீடிங் குறிக்கப்பட்ட மாதிரி ஸ்மார்ட் மீட்டர் திரை',
    });
    return `
    <figure class="guide-fig guide-example">
      <div class="guide-example-label">${title}</div>
      <div class="guide-example-meter" role="img" aria-label="${attr(aria)}">
        <div class="gem-screen">
          <span class="gem-code">1.8.0</span>
          <strong>14820.6</strong>
          <span>kWh</span>
        </div>
        <div class="gem-grid">
          <div class="gem-row"><span>Meter no.</span><b>SM-240118</b></div>
          <div class="gem-row is-hl"><span>Present reading</span><em>${check}</em><b>14820.6</b></div>
          <div class="gem-row"><span>Balance</span><b>₹642</b></div>
        </div>
      </div>
      <figcaption>${note}</figcaption>
    </figure>`;
  }

  if (cat === 'solar') {
    return `
    <figure class="guide-fig guide-example">
      <div class="guide-example-label">${title}</div>
      <div class="gbill" role="img" aria-label="${attr('Sample net meter bill with export units highlighted')}">
        <div class="gbill-head">${sample} SOLAR BILL <span>Net meter</span></div>
        <div class="gbill-row"><span>Import units <small>From grid</small></span><b>210 kWh</b></div>
        <div class="gbill-row is-hl"><span>Export units <small>Sent to grid</small></span><span class="gbill-tag">${check}</span><b>136 kWh</b></div>
        <div class="gbill-row"><span>Net billable units</span><b>74 kWh</b></div>
        <div class="gbill-total"><span>Estimated saving</span><span>₹920</span></div>
      </div>
      <figcaption>${note}</figcaption>
    </figure>`;
  }

  if (cat === 'ev') {
    return `
    <figure class="guide-fig guide-example">
      <div class="guide-example-label">${title}</div>
      <div class="gbill" role="img" aria-label="${attr('Sample electricity bill with EV charging units highlighted')}">
        <div class="gbill-head">${sample} EV BILL <span>Home charging</span></div>
        <div class="gbill-row"><span>Monthly charging</span><b>86 kWh</b></div>
        <div class="gbill-row is-hl"><span>Energy charge <small>Units x tariff slab</small></span><span class="gbill-tag">${check}</span><b>₹602</b></div>
        <div class="gbill-row"><span>Estimated running cost</span><b>₹1.25/km</b></div>
        <div class="gbill-total"><span>Added bill amount</span><span>₹710</span></div>
      </div>
      <figcaption>${note}</figcaption>
    </figure>`;
  }

  if (cat === 'newConn') {
    return `
    <figure class="guide-fig guide-example">
      <div class="guide-example-label">${title}</div>
      <div class="gbill" role="img" aria-label="${attr('Sample new connection estimate with load and deposit highlighted')}">
        <div class="gbill-head">${sample} ESTIMATE <span>New connection</span></div>
        <div class="gbill-row"><span>Applied load</span><b>3 kW</b></div>
        <div class="gbill-row is-hl"><span>Security deposit <small>Based on category and load</small></span><span class="gbill-tag">${check}</span><b>₹3,000</b></div>
        <div class="gbill-row"><span>Service line charge</span><b>₹1,500</b></div>
        <div class="gbill-total"><span>Amount payable</span><span>₹4,500</span></div>
      </div>
      <figcaption>${note}</figcaption>
    </figure>`;
  }

  if (guide.topExample !== 'bill') return '';

  return `
    <figure class="guide-fig guide-example">
      <div class="guide-example-label">${title}</div>
      <div class="gbill" role="img" aria-label="${attr('Sample electricity bill with key charge line highlighted')}">
        <div class="gbill-head">${sample} ELECTRICITY BILL <span>250 units · 2 kW</span></div>
        <div class="gbill-row"><span>Units consumed <small>Current minus previous reading</small></span><b>250 kWh</b></div>
        <div class="gbill-row is-hl"><span>Energy charge <small>Slab rate applied here</small></span><span class="gbill-tag">${check}</span><b>₹1,425</b></div>
        <div class="gbill-row"><span>Fixed charge</span><b>₹220</b></div>
        <div class="gbill-total"><span>Total payable</span><span>₹1,900</span></div>
      </div>
      <figcaption>${note}</figcaption>
    </figure>`;
}

function guideRelatedToolCards(guide, lang = 'en') {
  const slug = guide.slug;
  const cat = guideCategoryId(guide);
  const cards = [];
  const add = (href, title, sub) => {
    if (!cards.some(c => c.href === href)) cards.push({ href, title, sub });
  };

  if (/tariff|hike|surcharge|fppa|fppca|fuel/.test(slug)) {
    add('/#calculator', 'Electricity bill calculator', 'Estimate the impact on your own monthly bill');
    add('/fppa/', 'Fuel surcharge tracker', 'Check current FPPA and fuel surcharge rates');
  }
  if (/how-to-read|bill-increase|tata-power-ddl-bill|what-is-a-unit|tod-billing/.test(slug)) {
    add('/understand-your-bill/', 'Understand your bill', 'Match meter readings, units and bill lines visually');
    add('/#calculator', 'Electricity bill calculator', 'Recalculate your bill using published tariff rates');
  }
  if (cat === 'smartMeter') {
    add('/smart-meter/', 'Smart meter reading guide', 'Use the dummy meter to identify kWh, kVAh and balance screens');
    add('/understand-your-bill/', 'Understand your bill', 'Connect meter readings to the sample bill lines');
  }
  if (cat === 'newConn') {
    add('/services/#new-connection', 'New connection helper', 'Documents, charges and steps for your DISCOM');
    add('/#calculator', 'Electricity bill calculator', 'Estimate the bill for the load you plan to apply for');
  }
  if (cat === 'solar') {
    add('/solar-calculator/', 'Rooftop solar savings calculator', 'Estimate payback from your monthly units and tariff');
    add('/solar-subsidy-checker/', 'Solar subsidy checker', 'Check subsidy eligibility before sizing a system');
  }
  if (cat === 'ev') {
    add('/ev-charging-calculator/', 'EV charging cost calculator', 'Compare home charging cost with petrol and public charging');
    add('/compare/', 'Compare tariffs across states', 'See how electricity cost changes by state');
  }
  if (/landlord|ac-1-5-ton|sanctioned-load|reduce-fixed/.test(slug)) {
    add('/#calculator', 'Electricity bill calculator', 'Estimate the monthly cost using real slab rates');
  }

  return cards.map(c => `<a class="seo-link-card" href="${c.href}"><strong>${esc(c.title)}</strong><span>${esc(c.sub)}</span></a>`);
}

function guideRelatedPagesHtml(guide, lang = 'en') {
  const cards = [];
  for (const s of (guide.states || []).slice(0, 3)) {
    const pfx = (lang !== 'en' && langServesState(lang, s)) ? `/${lang}` : '';
    const sl = esc(stateName(s, lang));
    const title = T(lang, { en: `${sl} electricity tariff & bill calculator`, hi: `${sl} बिजली टैरिफ व बिल कैलकुलेटर`, mr: `${sl} वीज टॅरिफ व बिल कॅल्क्युलेटर`, ta: `${sl} மின் கட்டணம் & பில் கணிப்பான்` });
    const sub = T(lang, { en: 'Current slab rates, every DISCOM, itemised bills', hi: 'वर्तमान स्लैब दरें, हर डिस्कॉम, मदवार बिल', mr: 'सध्याचे स्लॅब दर, प्रत्येक डिस्कॉम, तपशीलवार बिले', ta: 'தற்போதைய அடுக்கு விகிதங்கள், ஒவ்வொரு DISCOM, விவரமான பில்கள்' });
    cards.push(stateLinkCard(s, `${pfx}/tariffs/${slugify(s)}/`, title, sub));
  }
  cards.push(...guideRelatedToolCards(guide, lang));
  const cat = guideCategoryId(guide);
  const tool = GUIDE_TOOL_LINK[cat];
  if (tool && GUIDE_AUTO_TOP_TOOL_CATEGORIES.has(cat) && !cards.some(c => c.includes(`href="${tool[0]}"`))) cards.push(`<a class="seo-link-card" href="${tool[0]}"><strong>${T(lang, tool[1])}</strong><span>${T(lang, tool[2])}</span></a>`);
  if (!cards.length) return '';
  const heading = T(lang, { en: 'Related on TheDiscomBill', hi: 'TheDiscomBill पर संबंधित पेज', mr: 'TheDiscomBill वरील संबंधित पाने', ta: 'TheDiscomBill-இல் தொடர்புடையவை' });
  return `
    <section class="seo-section">
      <h2>${heading}</h2>
      <div class="seo-link-grid">${cards.join('')}</div>
    </section>`;
}

function guideRelatedSeedSlugs(guide) {
  const slug = guide.slug;
  const cat = guideCategoryId(guide);
  const seeds = [];
  const add = (...slugs) => slugs.forEach(s => {
    if (s !== slug && !seeds.includes(s)) seeds.push(s);
  });

  if (/chhattisgarh|tamil-nadu|tariff|hike/.test(slug)) {
    add('how-fppa-fuel-surcharge-is-calculated', 'up-electricity-bill-10-percent-fppa-surcharge', 'electricity-duty-explained', 'why-did-my-electricity-bill-increase');
  }
  if (/fppa|fppca|fuel|surcharge/.test(slug)) {
    add('how-fppa-fuel-surcharge-is-calculated', 'msedcl-fppa-charges-explained', 'up-electricity-bill-10-percent-fppa-surcharge', 'why-did-my-electricity-bill-increase');
  }
  if (/how-to-read|tata-power-ddl-bill/.test(slug)) {
    add('why-did-my-electricity-bill-increase', 'what-is-a-unit-of-electricity', 'how-fppa-fuel-surcharge-is-calculated', 'electricity-duty-explained');
  }
  if (cat === 'smartMeter') {
    add('uppcl-smart-meter-readings-explained', 'smart-meter-balance-check', 'smart-meter-recharge-failed', 'prepaid-vs-postpaid-smart-meter', 'smart-meter-running-fast');
  }
  if (cat === 'newConn') {
    add('uppcl-new-connection-estimate-2026', 'uppcl-new-connection-jhatpat', 'msedcl-new-connection-online', 'bses-delhi-new-connection');
  }
  if (cat === 'solar') {
    add('solar-net-metering-savings', 'pm-surya-ghar-solar-subsidy');
  }
  if (cat === 'ev') {
    add('ev-home-vs-public-charging-cost');
  }
  if (/sanctioned-load|reduce-fixed/.test(slug)) {
    add('why-did-my-electricity-bill-increase', 'uppcl-sanctioned-load-increased', 'power-factor-kvah-billing-explained');
  }

  return seeds;
}

// Pick the N guides most related to `guide`. Every guide used to link to all 40 others,
// which made the footer a wall and flattened internal linking — when everything links to
// everything, no page is signalled as more important than any other.
//
// Shared state outranks shared topic deliberately: someone reading an MSEDCL guide is far
// more likely to want another Maharashtra guide than a same-category guide about Kerala.
// Ties break on GUIDES order so the output is deterministic across builds (a shuffling
// footer would churn the diff on every `npm run seo`).
function relatedGuides(guide, limit = 4) {
  const myStates = new Set(guide.states || []);
  const myCat = guideCategoryId(guide);
  const seedSlugs = guideRelatedSeedSlugs(guide);
  const seeded = seedSlugs
    .map(slug => GUIDES.find(g => g.slug === slug))
    .filter(Boolean)
    .slice(0, limit);
  if (seeded.length >= limit) return seeded;
  const seededSlugs = new Set(seeded.map(g => g.slug));
  return GUIDES
    .filter(g => g.slug !== guide.slug && !seededSlugs.has(g.slug))
    .map((g, i) => {
      let score = 0;
      for (const s of (g.states || [])) if (myStates.has(s)) score += 10;
      if (guideCategoryId(g) === myCat) score += 4;
      return { g, score, i };
    })
    // Keep a floor of `limit` cards even for a guide that matches nothing — an empty
    // "More guides" heading looks broken. Unrelated-but-present beats absent here.
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit - seeded.length)
    .map(r => r.g)
    .reduce((all, g) => all.concat(g), seeded);
}

function guidePage(guide, lang = 'en') {
  // A guide only renders in a vernacular when its body is translated in the data file;
  // otherwise fall back to English (the driver also guards emission, so this is belt-and-braces).
  const L = (lang !== 'en' && guideHasBody(guide, lang)) ? lang : 'en';
  const enUrl = `/guides/${guide.slug}/`;
  const url = langUrl(enUrl, L);
  const title = guideField(guide, 'title', L) || guide.title;
  const intro = guideField(guide, 'intro', L) || guide.intro;
  const rawSections = guideField(guide, 'sections', L) || guide.sections;
  // Opt-in: only guides that set `toc: true` get the jump-link row, so adding the feature does
  // not silently restyle 100-odd existing articles that are short enough not to want one.
  const { toc: tocHtml, sections } = guide.toc
    ? guideToc(rawSections, L)
    : { toc: '', sections: rawSections };
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
  // Visible attribution, not just the Article/@author node in JSON-LD: schema alone is a
  // claim to a crawler, whereas a reader deciding whether to trust a rupee figure needs to
  // see who stands behind it and how the rates were sourced. The site publishes as a brand
  // rather than a named person, so the accountability link is the methodology page.
  // One English methodology page serves every locale — there are no /hi/ /mr/ /ta/ twins of
  // it, and the footer already links it unlocalised. Point a locale at its own path only
  // once that page actually exists.
  const methodHref = '/methodology/';
  const byline = T(L, {
    hi: `TheDiscomBill संपादकीय · <a href="${methodHref}">दरें कहाँ से आती हैं</a>`,
    mr: `TheDiscomBill संपादकीय · <a href="${methodHref}">दर कुठून येतात</a>`,
    ta: `TheDiscomBill ஆசிரியர் குழு · <a href="${methodHref}">விகிதங்கள் எங்கிருந்து வருகின்றன</a>`,
    en: `TheDiscomBill Editorial · <a href="${methodHref}">How we source our rates</a>` });
  const meta = T(L, {
    hi: `${guide.minutes} मिनट · अपडेट: ${updated} · ${byline}`, mr: `${guide.minutes} मिनिटे · अपडेट: ${updated} · ${byline}`,
    ta: `${guide.minutes} நிமிட வாசிப்பு · புதுப்பிக்கப்பட்டது: ${updated} · ${byline}`, en: `${guide.minutes} min read · Updated ${updated} · ${byline}` });
  const ctaH2 = T(L, { hi: 'अब अपना असली बिल जाँचें', mr: 'आता तुमचे स्वतःचे बिल तपासा', ta: 'இப்போது உங்கள் சொந்த பில்லைச் சரிபார்க்கவும்', en: 'Now check your own bill' });
  const ctaP = T(L, {
    hi: 'पढ़ना काफ़ी नहीं — अपने डिस्कॉम की असली स्लैब दरों, फिक्स्ड चार्ज और FPPA के साथ अपना मदवार बिल सेकंडों में निकालें। मुफ़्त, बिना साइन-अप।',
    mr: 'वाचन अर्धेच काम — तुमच्या डिस्कॉमच्या खऱ्या स्लॅब दर, फिक्स्ड चार्ज आणि FPPA सह तुमचे तपशीलवार बिल काही सेकंदांत काढा. मोफत, साइन-अप शिवाय.',
    ta: 'படிப்பது பாதி வேலைதான் — உங்கள் DISCOM-இன் உண்மையான அடுக்கு விகிதங்கள், நிலையான கட்டணம் மற்றும் FPPA மூலம் உங்கள் யூனிட்களை இயக்கி விவரமான பில்லை சில நொடிகளில் பெறுங்கள். இலவசம், பதிவு தேவையில்லை.',
    en: 'Reading is half the job — run your own units through your DISCOM\'s real slab rates, fixed charges and FPPA and get an itemised bill in seconds. Free, no sign-up.' });
  const ctaBtn = T(L, { hi: 'बिजली बिल कैलकुलेटर खोलें →', mr: 'वीज बिल कॅल्क्युलेटर उघडा →', ta: 'மின் பில் கணிப்பானைத் திறக்கவும் →', en: 'Open the electricity bill calculator →' });
  const moreH2 = T(L, { hi: 'संबंधित गाइड', mr: 'संबंधित मार्गदर्शक', ta: 'தொடர்புடைய வழிகாட்டிகள்', en: 'Related guides' });
  // The footer now shows 4 guides instead of all 40, so the index needs an explicit route —
  // otherwise the other 36 lose their only inbound link from this page.
  const allGuidesLabel = T(L, { hi: 'सभी गाइड देखें →', mr: 'सर्व मार्गदर्शक पहा →', ta: 'அனைத்து வழிகாட்டிகளையும் காண்க →', en: 'Browse all guides →' });
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
    ${langSwitchLink(enUrl, L, altLangs)}
    <h1>${esc(title)}</h1>
    <p class="guide-meta">${meta}</p>
    <p class="seo-lead">${intro}</p>
    ${guideToolCtaHtml(guide, L)}
    ${guideTopExampleHtml(guide, L)}${tocHtml ? `\n    ${tocHtml}` : ''}
    ${sections}
    ${faqHtml(faqs, L)}
    <section class="seo-section guide-calc-cta">
      <h2>${ctaH2}</h2>
      <p>${ctaP}</p>
      <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">${ctaBtn}</a></p>
    </section>
    ${guideRelatedPagesHtml(guide, L)}
    <section class="seo-section guide-more">
      <h2>${moreH2}</h2>
      <div class="seo-link-grid">${relatedGuides(guide, 4).map(g => {
        const gt = guideField(g, 'title', L) || g.title;
        const gHref = (L !== 'en' && guideHasBody(g, L)) ? `/${L}/guides/${g.slug}/` : `/guides/${g.slug}/`;
        const gm = T(L, { hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிடம்`, en: `${g.minutes} min read` });
        return `
        <a class="seo-link-card" href="${gHref}">
          <strong>${esc(gt)}</strong>
          <small>${gm}</small>
        </a>`; }).join('')}
      </div>
      <p class="guide-more-all"><a href="${guidesBase}">${allGuidesLabel}</a></p>
    </section>
    <p class="seo-disclaimer">${disclaimer}</p>
  </section>`;

  const articleLd = articleJsonLd(L !== 'en' ? { ...guide, title, description: guideField(guide, 'description', L) || guide.description } : guide, url);
  articleLd.inLanguage = LANG_LOCALE[L];
  // HowTo rich results were deprecated by Google in September 2023 — the markup no longer
  // produces any SERP surface, so emitting it is dead weight on 8 guides. `howtoSteps` is kept
  // in guides-content.js: it is genuinely useful prose structure, and if a consuming surface
  // ever returns, re-emitting is a one-line change.
  const howToLd = null;
  return layout({
    title: guideField(guide, 'metaTitle', L) || title,
    description: guideField(guide, 'description', L) || guide.description,
    canonical: SITE + url,
    page: altLangs.length ? enUrl : null,   // only advertise a hreflang set when a twin exists
    lang: L, altLangs,
    ogImage: L === 'en' ? `guide-${guide.slug}` : null,   // per-page card (English titles only)
    jsonld: [
      articleLd,
      breadcrumbJsonLd([{ name: bcHome, url: '/' }, { name: bcGuides, url: guidesBase }, { name: title }]),
      faqJsonLd(faqs),
      ...(howToLd ? [howToLd] : []),
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
    // First sentence only. Split on a Devanagari danda or a period that actually ends a
    // sentence (followed by whitespace or end-of-string) so decimals like "1.5 ton" don't
    // truncate the snippet mid-number.
    const snip = gd.split(/[।](?:\s|$)|\.(?:\s|$)/)[0];
    const end = T(lang, { hi: '।', mr: '.', ta: '.', en: '.' });
    const gm = T(lang, { hi: `${g.minutes} मिनट`, mr: `${g.minutes} मिनिटे`, ta: `${g.minutes} நிமிடம்`, en: `${g.minutes} min read` });
    const cat = guideCategoryLabel(g, lang);
    const date = g.published ? humanDate(g.published, lang) : '';
    return `
    <a class="blog-card" href="${href}" data-cat="${esc(guideCategoryId(g))}">
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
  // Filter chips — only categories that actually have an article, in taxonomy order so the
  // bar reads the same on every language build. Counts help people see what's behind a chip.
  const present = Object.keys(GUIDE_CATEGORIES).filter(id => ordered.some(g => guideCategoryId(g) === id));
  const allLabel = T(lang, { hi: 'सभी', mr: 'सर्व', ta: 'அனைத்தும்', en: 'All' });
  const filterLabel = T(lang, { hi: 'विषय के अनुसार छाँटें', mr: 'विषयानुसार गाळा', ta: 'தலைப்பு வாரியாக வடிகட்டு', en: 'Filter by topic' });
  const moreLabel = T(lang, { hi: 'और लेख दिखाएँ', mr: 'आणखी लेख दाखवा', ta: 'மேலும் கட்டுரைகள்', en: 'Load more articles' });
  const noneLabel = T(lang, { hi: 'इस विषय पर अभी कोई लेख नहीं।', mr: 'या विषयावर अद्याप लेख नाही.', ta: 'இந்தத் தலைப்பில் இன்னும் கட்டுரைகள் இல்லை.', en: 'No articles in this topic yet.' });
  const chip = (id, label, count) =>
    `<button type="button" class="blog-filter${id === 'all' ? ' is-active' : ''}" data-filter="${esc(id)}" aria-pressed="${id === 'all'}">${esc(label)}<span class="blog-filter-n">${count}</span></button>`;
  const filterBar = `
    <div class="blog-filters" role="group" aria-label="${attr(filterLabel)}" hidden>
      ${chip('all', allLabel, ordered.length)}
      ${present.map(id => chip(id, T(lang, GUIDE_CATEGORIES[id]), ordered.filter(g => guideCategoryId(g) === id).length)).join('\n      ')}
    </div>`;
  const loadMore = `
    <div class="blog-more-wrap" hidden>
      <button type="button" class="blog-more" id="blogMore">${esc(moreLabel)}<span class="blog-more-n"></span></button>
    </div>`;
  const bcHome = T(lang, { hi: 'होम', mr: 'होम', ta: 'முகப்பு', en: 'Home' });
  const bcGuides = T(lang, { hi: 'गाइड', mr: 'मार्गदर्शक', ta: 'வழிகாட்டிகள்', en: 'Guides' });
  const h1 = T(lang, { hi: 'बिजली बिल गाइड और लेख', mr: 'वीज बिल मार्गदर्शक आणि लेख', ta: 'மின் கட்டண வழிகாட்டிகள் & கட்டுரைகள்', en: 'Electricity Bill Guides & Explainers' });
  const lead = T(lang, {
    hi: 'भारतीय बिजली बिलिंग पर छोटे, व्यावहारिक लेख — ठीक उन्हीं सवालों के जवाब जो लोग पूछते हैं, और हमारे <a href="/#calculator">बिल कैलकुलेटर</a> के पीछे के लाइव टैरिफ डेटा से जुड़े हुए।',
    mr: 'भारतीय वीज बिलिंगवरील छोटे, व्यावहारिक लेख — लोक विचारतात त्याच प्रश्नांची उत्तरे, आणि आमच्या <a href="/#calculator">बिल कॅल्क्युलेटर</a> मागील लाइव्ह टॅरिफ डेटाशी जोडलेले.',
    ta: 'இந்திய மின் பில்லிங் குறித்த சிறிய, நடைமுறை விளக்கக் கட்டுரைகள் — மக்கள் கேட்கும் அதே கேள்விகளுக்குப் பதில், எங்கள் <a href="/#calculator">பில் கணிப்பானின்</a> பின்னால் உள்ள நேரடி கட்டண தரவுடன் இணைக்கப்பட்டவை.',
    en: 'Short, practical explainers on Indian electricity billing — written to answer the exact questions people ask, and linked to the live tariff data behind our <a href="/#calculator">bill calculator</a>.' });
  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: bcHome, url: '/' }, { name: bcGuides, url: null }])}
    <h1>${h1}</h1>
    <p class="seo-lead">${lead}</p>
    ${filterBar}
    <div class="blog-grid blog-paged" id="blogGrid">${cards}</div>
    ${loadMore}
    <p class="blog-empty" id="blogEmpty" hidden>${noneLabel}</p>
    <!-- Without JS the paging/filter chrome is inert, so reveal every card instead. -->
    <noscript><style>.blog-paged .blog-card { display: flex !important; }</style></noscript>
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
  const h1 = gs('gloss.h1', 'Electricity Bill Glossary');
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
    <h1 data-i18n="gloss.h1">${h1}</h1>
    <p class="seo-lead" data-i18n-html="gloss.lead">${lead}</p>
    <nav class="glossary-index" id="glossary-index" aria-label="${attr(T(lang, { en: 'On this page', hi: 'इस पेज पर', mr: 'या पानावर', ta: 'இந்தப் பக்கத்தில்' }))}"><span class="page-toc-label">${esc(T(lang, { en: 'On this page', hi: 'इस पेज पर', mr: 'या पानावर', ta: 'இந்தப் பக்கத்தில்' }))}</span>${index}</nav>
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

// ── Fuel-surcharge tracker (/fuel-surcharge/) ─────────────────────────────────
// The FPPA layer is the freshest data on this site — notified MONTHLY, where tariff
// orders move once a year — and until now it was only ever visible as a single line
// inside a calculated bill. This page surfaces the series itself.
//
// Pre-rendered from js/tariffs/fppa.js at build time rather than fetched in the browser:
// the entire point is that a crawler can read the current rate, and a JS-rendered table
// gives it nothing on first pass. Re-run `npm run seo` after every FPPA notice.
//
// English-only, deliberately. Vernacular twins are scoped per-state via langServesState(),
// and this page is pan-India in framing but three-state in data — a combination the
// existing hreflang logic has no honest answer for. Revisit when coverage is national.
const fsMonth = (iso) => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const fsMonthLong = (iso) => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// "+10.00%" / "-4.43%" / "₹1.00/unit" — the sign is load-bearing here, because a negative
// FPPA is a CREDIT on the bill, not a charge, and readers consistently misread that.
const fsRate = (e) => !e ? '—'
  : e.mode === 'percent' ? `${e.rate > 0 ? '+' : ''}${e.rate.toFixed(2)}%`
  : `${rupeeRate(e.rate)}/unit`;

function fppaMetaByDiscom() {
  const meta = {};
  for (const st of getStates()) for (const d of getDiscoms(st)) meta[d.id] = { name: d.name, state: st };
  return meta;
}

function fppaTrackerRows() {
  const meta = fppaMetaByDiscom();
  const rows = [];
  for (const [state, list] of Object.entries(FPPA_BY_STATE)) {
    rows.push({ who: state, slug: slugify(state), scope: 'All DISCOMs', state, cur: pickFppa(list, TODAY), list, type: 'state' });
  }
  for (const [id, list] of Object.entries(FPPA_BY_DISCOM)) {
    const m = meta[id];
    if (!m) continue;
    rows.push({ who: m.name, code: id.toUpperCase(), slug: slugify(m.state), scope: m.state, state: m.state, cur: pickFppa(list, TODAY), list, type: 'discom' });
  }
  return rows.sort((a, b) => a.state.localeCompare(b.state) || a.who.localeCompare(b.who));
}

function fppaCoverageStates() {
  return [...new Set(fppaTrackerRows().map(r => r.state))].sort((a, b) => a.localeCompare(b));
}

function fppaChange(series, idx) {
  if (idx >= series.length - 1) return '—';
  const cur = series[idx].rate;
  const prev = series[idx + 1].rate;
  if (cur > prev) return '<span class="fs-up">↑</span>';
  if (cur < prev) return '<span class="fs-down">↓</span>';
  return '<span class="fs-flat">→</span>';
}

function fppaPeriod(e) {
  if (!e) return 'Not verified';
  return `${fsMonth(e.from)}${e.to ? ` - ${fsMonth(e.to)}` : ' onward'}`;
}

function fppaMechanismName(state) {
  if (state === 'Delhi') return 'PPAC / FPPAS';
  if (state === 'Uttar Pradesh') return 'FPPAS';
  if (state === 'Rajasthan') return 'Regulatory Surcharge / FPPAS';
  return 'FPPA / FAC';
}

function fppaDirection(cur, prev) {
  if (!cur || !prev) return '<span class="fs-flat">New</span>';
  if (cur.mode !== prev.mode) return '<span class="fs-flat">Changed</span>';
  if (cur.rate > prev.rate) return '<span class="fs-up">&uarr; Higher</span>';
  if (cur.rate < prev.rate) return '<span class="fs-down">&darr; Lower</span>';
  return '<span class="fs-flat">&rarr; Same</span>';
}

function fppaImpact(e) {
  if (!e) return '<span class="fs-pending">Enter bill value manually</span>';
  const amt = e.mode === 'percent' ? 3000 * e.rate / 100 : 300 * e.rate;
  const cls = amt >= 0 ? 'fs-pos' : 'fs-neg';
  const prefix = amt >= 0 ? '+' : '-';
  const basis = e.mode === 'percent' ? 'on Rs 3,000 charges' : 'on 300 units';
  return `<strong class="${cls}">${prefix}${rupee(Math.abs(amt))}</strong><span class="fs-impact-note">${basis}</span>`;
}

function fppaFmtDelta(n) {
  return Number(Math.abs(n).toFixed(2)).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function fppaDeltaUnit(mode, delta) {
  if (mode === 'percent') {
    const n = Math.abs(Number(delta.toFixed(2)));
    return `percentage point${n === 1 ? '' : 's'}`;
  }
  return 'per unit';
}

function fppaWhatChangedCard(label, mechanism, cur, prev) {
  if (!cur) {
    return `<article>
      <h3>${esc(label)}</h3>
      <p>No current verified ${esc(mechanism)} value is archived for this DISCOM yet.</p>
    </article>`;
  }
  if (!prev || cur.mode !== prev.mode) {
    return `<article>
      <h3>${esc(label)}</h3>
      <p>${esc(mechanism)} is currently ${esc(fsRate(cur))} from ${esc(fsMonth(cur.from))}, but there is no previous same-method value in the archive yet.</p>
    </article>`;
  }
  const delta = cur.rate - prev.rate;
  const curMonth = fsMonth(cur.from);
  const prevMonth = fsMonth(prev.from);
  const changed = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'remained unchanged';
  const measure = cur.mode === 'percent'
    ? `${fppaFmtDelta(delta)} ${fppaDeltaUnit(cur.mode, delta)}`
    : `${rupeeRate(Math.abs(delta))} per unit`;
  const first = delta === 0
    ? `${esc(mechanism)} remained unchanged at ${esc(fsRate(cur))} in ${esc(curMonth)} compared with ${esc(prevMonth)}.`
    : `${esc(mechanism)} ${changed} by ${esc(measure)} in ${esc(curMonth)} compared with ${esc(prevMonth)}.`;
  let second;
  if (cur.mode === 'percent') {
    const impact = 3000 * delta / 100;
    second = impact === 0
      ? `For ${rupee(3000)} of applicable charges, this represents no additional surcharge change, subject to the applicable billing formula.`
      : `For ${rupee(3000)} of applicable charges, this represents approximately <strong class="${impact > 0 ? 'fs-pos' : 'fs-neg'}">${rupee(Math.abs(impact))}</strong> ${impact > 0 ? 'additional' : 'lower'} surcharge, subject to the applicable billing formula.`;
  } else {
    const impact = 300 * delta;
    second = impact === 0
      ? `For 300 units, this represents no surcharge change, subject to the applicable billing formula.`
      : `For 300 units, this represents approximately <strong class="${impact > 0 ? 'fs-pos' : 'fs-neg'}">${rupee(Math.abs(impact))}</strong> ${impact > 0 ? 'additional' : 'lower'} surcharge, subject to the applicable billing formula.`;
  }
  return `<article>
    <h3>${esc(label)}</h3>
    <p>${first}</p>
    <p>${second}</p>
  </article>`;
}

function fppaWhatChangedHtml(state, mechanism, comparison, hasDiscomSpecific, rows) {
  const items = hasDiscomSpecific
    ? comparison.filter(r => r.cur)
    : [{ discom: { name: state }, cur: rows[0]?.cur || rows[0]?.list?.[0] || null, prev: rows[0]?.list?.slice(1).find(e => e.mode === (rows[0]?.cur || rows[0]?.list?.[0])?.mode) || null }];
  if (!items.length) return '';
  return `<section class="seo-section">
    <h2>What changed?</h2>
    <div class="fs-change-grid">
      ${items.map(r => fppaWhatChangedCard(r.discom.name, mechanism, r.cur, r.prev)).join('')}
    </div>
  </section>`;
}

function fppaStateComparison(state) {
  const discoms = getDiscoms(state);
  const stateList = FPPA_BY_STATE[state] || [];
  return discoms.map(d => {
    const rawList = FPPA_BY_DISCOM[d.id] || stateList;
    const list = [...rawList].sort((a, b) => b.from.localeCompare(a.from));
    const cur = pickFppa(list, TODAY) || list[0] || null;
    const idx = cur ? list.indexOf(cur) : -1;
    const prev = cur ? list.slice(idx + 1).find(e => e.mode === cur.mode) || null : null;
    return { discom: d, list, cur, prev };
  });
}

function fppaStateWhyHtml(state, mechanism) {
  if (state === 'Delhi') {
    return `<p>Delhi is a useful example because ${esc(mechanism)} is not one state-wide number.
    DERC handles PPAC/FPPAS through separate proceedings for each distribution licensee, so
    BRPL, BYPL, TPDDL and NDMC can have different applicable rates and different historical
    paths.</p>
    <p>The 2026 PPAC-related orders relate to recovery of power-purchase cost variations from
    earlier periods. When the approved recovery changes, the surcharge moves even if the base
    tariff and your units remain the same.</p>`;
  }
  if (state === 'Uttar Pradesh') {
    return `<p>UPPCL publishes the ${esc(mechanism)} rate monthly as a percentage of fixed plus
    energy charges. The rate can be positive when fuel and power-purchase costs are recovered,
    or negative when the adjustment is passed back as a credit.</p>`;
  }
  if (state === 'Rajasthan') {
    return `<p>Rajasthan's current tracker entry is a per-unit regulatory surcharge that includes
    the FPPAS mechanism under the tariff order. It is shown per DISCOM because the consumer is
    still billed by JVVNL, AVVNL or JDVVNL, even where the published rate is aligned.</p>`;
  }
  return `<p>The surcharge changes when actual power-purchase cost diverges from the cost assumed
  in the tariff order. We publish a value only when it is tied to an official notice or order.</p>`;
}

function fppaStateSourcesHtml(state, comparison) {
  if (state === 'Delhi') {
    return `<ul>
      <li><a href="https://derc.gov.in/commissions-proceedings-orders/other-than-142/final-order">DERC final orders and PPAC proceedings</a></li>
      <li><a href="https://www.bsesdelhi.com/web/brpl/fuel-power-purchase-adjustment-charges">BRPL fuel and power purchase adjustment charges page</a></li>
      <li><a href="https://www.tatapower-ddl.com/regulations-and-compliances/tariff-related/derc-orders-and-letters-on-ppac">Tata Power-DDL DERC orders and letters on PPAC</a></li>
    </ul>`;
  }
  const sources = [...new Set(comparison.flatMap(r => r.list.map(e => e.source).filter(Boolean)))];
  if (!sources.length) return '<p class="fs-legend">Official source details are being added as each rate is verified.</p>';
  return `<ul>${sources.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
}

function fppaEntryCoversYear(e, year) {
  const y = Number(year);
  const fromYear = Number(e.from.slice(0, 4));
  const currentYear = Number(TODAY.slice(0, 4));
  const toYear = e.to ? Number(e.to.slice(0, 4)) : currentYear;
  return fromYear <= y && y <= toYear;
}

function fppaArchiveRows(state) {
  const mechanism = fppaMechanismName(state);
  const trackerRows = fppaTrackerRows().filter(r => r.state === state);
  const hasDiscomSpecific = trackerRows.some(r => r.type === 'discom');
  if (hasDiscomSpecific) {
    return fppaStateComparison(state).flatMap(r => {
      const series = [...r.list].sort((a, b) => b.from.localeCompare(a.from));
      return series.map((e, i) => ({
        state,
        discom: r.discom.name,
        discomId: r.discom.id,
        mechanism,
        entry: e,
        prev: series.slice(i + 1).find(x => x.mode === e.mode) || null,
      }));
    });
  }
  const list = [...(FPPA_BY_STATE[state] || [])].sort((a, b) => b.from.localeCompare(a.from));
  return list.map((e, i) => ({
    state,
    discom: 'All DISCOMs',
    discomId: null,
    mechanism,
    entry: e,
    prev: list.slice(i + 1).find(x => x.mode === e.mode) || null,
  }));
}

function fppaArchiveYears(state) {
  const years = new Set();
  const currentYear = Number(TODAY.slice(0, 4));
  for (const row of fppaArchiveRows(state)) {
    const fromYear = Number(row.entry.from.slice(0, 4));
    const toYear = row.entry.to ? Number(row.entry.to.slice(0, 4)) : currentYear;
    for (let y = fromYear; y <= toYear; y++) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

function fppaArchiveYearLinks(state, activeYear = null) {
  const stateSlug = slugify(state);
  const links = fppaArchiveYears(state).map(y => {
    const active = String(y) === String(activeYear) ? ' aria-current="page"' : '';
    return `<a class="seo-lang-pill" href="/fppa/${stateSlug}/${y}/"${active}>${y}</a>`;
  }).join('');
  return links ? `<div class="seo-lang-row fs-archive-years"><span>Archive years</span>${links}</div>` : '';
}

function fppaSourceCell(e) {
  if (e.sourceUrl) return `<a href="${esc(e.sourceUrl)}">${esc(e.source || 'Official source')}</a>`;
  return esc(e.source || 'Source note pending');
}

function fppaArchiveTable(rows) {
  if (!rows.length) return '<p class="fs-legend">No verified surcharge entries are archived for this period yet.</p>';
  return `<div class="comparison-table-wrapper fs-archive-table">
    <table class="comparison-table">
      <thead><tr><th>Period</th><th>DISCOM</th><th>Mechanism</th><th>Rate</th><th>Direction</th><th>Notice / order</th><th>Source</th></tr></thead>
      <tbody>${rows.map(r => {
        const e = r.entry;
        const cls = e.rate >= 0 ? 'fs-pos' : 'fs-neg';
        return `<tr>
          <td>${esc(fppaPeriod(e))}</td>
          <td>${esc(r.discom)}</td>
          <td>${esc(r.mechanism)}</td>
          <td class="${cls}">${esc(fsRate(e))}</td>
          <td>${fppaDirection(e, r.prev)}</td>
          <td>${esc(e.label || '')}</td>
          <td>${fppaSourceCell(e)}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  </div>`;
}

function fppaArchiveSummary(rows) {
  const current = rows.filter(r => r.entry.rate > 0).length;
  const credits = rows.filter(r => r.entry.rate < 0).length;
  const flat = rows.length - current - credits;
  const discoms = new Set(rows.map(r => r.discom)).size;
  return `<div class="fs-archive-stats">
    <span><strong>${rows.length}</strong> archived entries</span>
    <span><strong>${discoms}</strong> ${discoms === 1 ? 'scope' : 'DISCOM/scopes'}</span>
    <span><strong>${current}</strong> charges</span>
    <span><strong>${credits}</strong> credits</span>
    ${flat ? `<span><strong>${flat}</strong> flat/zero</span>` : ''}
  </div>`;
}

function fppaStateSummaryCard(state, rows, i = 0) {
  const stateSlug = slugify(state);
  const current = rows.map(r => r.cur).filter(Boolean);
  const latest = current[0] || rows[0]?.list?.[0] || null;
  const mode = rows.some(r => r.type === 'discom') ? 'DISCOM-specific' : 'State-wide';
  const latestText = latest ? `Latest: ${fsMonth(latest.from)}` : 'Awaiting notice';
  // A state's DISCOMs often carry different rates, and the card used to join them into one
  // display-size run: "+17.94% / +17.43% / +12.21%", with no way to tell whose is whose, or
  // — Rajasthan — "₹1.00/unit / ₹1.00/unit / ₹1.00/unit", the same figure printed three times
  // at 26px across two lines. Big type is for one number. So: one rate (or several that agree)
  // keeps the headline and says how far it reaches; rates that differ become labelled chips.
  const withCur = rows.filter(r => r.cur);
  const rateStrs = withCur.map(r => fsRate(r.cur));
  const allSame = rateStrs.length > 1 && rateStrs.every(s => s === rateStrs[0]);
  const countText = allSame
    ? `Same across ${rateStrs.length} DISCOMs`
    : rateStrs.length > 1 ? `${rateStrs.length} current rates` : 'Current rate';
  let rateBlock;
  if (!rateStrs.length) {
    rateBlock = `<strong class="fs-state-rate is-quiet">${esc(latest ? `Last: ${fsRate(latest)}` : 'Not notified')}</strong>`;
  } else if (rateStrs.length === 1 || allSame) {
    rateBlock = `<strong class="fs-state-rate">${esc(rateStrs[0])}</strong>`;
  } else {
    rateBlock = `<span class="fs-state-rates">${withCur.map((r, i) =>
      `<span class="fs-state-chip${r.cur.rate < 0 ? ' is-neg' : ''}"><b>${esc(r.code || r.who)}</b>${esc(rateStrs[i])}</span>`).join('')}</span>`;
  }
  // Indexed, not region-keyed: the tracker currently covers Delhi, Rajasthan and Uttar Pradesh,
  // all North India, so the region hue painted all three the same blue and said nothing.
  return `<a class="fs-state-card" style="--dir-accent:${TILE_HUES[i % TILE_HUES.length]}" href="/fppa/${stateSlug}/">
    <span class="fs-state-card-top">
      <span class="seo-link-badge" aria-hidden="true">${esc(stateCode(state))}</span>
      <span class="fs-state-name">${esc(state)}</span>
      <span class="fs-state-open">Open</span>
    </span>
    ${rateBlock}
    <span class="fs-state-meta">${esc(mode)} surcharge tracker</span>
    <span class="fs-state-foot">
      <span>${esc(countText)}</span>
      <span>${esc(latestText)}</span>
    </span>
  </a>`;
}

// Bar chart of a monthly percent series. Inline SVG with no script and no library: it has
// to survive being read by a crawler and by someone with JS off, and it is the one visual
// that makes "this moves every month" obvious at a glance. Colours come from CSS classes
// so the chart follows the light/dark theme.
function fsChart(series) {
  const W = 720, H = 210, PAD_L = 38, PAD_T = 14, PAD_B = 30;
  const plotW = W - PAD_L - 10, plotH = H - PAD_T - PAD_B;
  const max = Math.max(10, ...series.map(e => Math.abs(e.rate)));
  const zeroY = PAD_T + plotH / 2;
  const unit = (plotH / 2) / max;
  const step = plotW / series.length;
  const bw = Math.max(6, step * 0.55);

  const bars = series.map((e, i) => {
    const cx = PAD_L + step * i + step / 2;
    const h = Math.abs(e.rate) * unit;
    const y = e.rate >= 0 ? zeroY - h : zeroY;
    const cls = e.rate >= 0 ? 'fs-bar fs-bar-pos' : 'fs-bar fs-bar-neg';
    // Label every third month, else the axis is unreadable below ~600px.
    const lbl = i % 3 === 0
      ? `<text class="fs-axis" x="${cx.toFixed(1)}" y="${H - 10}" text-anchor="middle">${esc(fsMonth(e.from).replace(' ', ' '))}</text>`
      : '';
    return `<rect class="${cls}" x="${(cx - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, h).toFixed(1)}" rx="2"><title>${esc(fsMonth(e.from))}: ${esc(fsRate(e))}</title></rect>${lbl}`;
  }).join('');

  const gridLines = [max, max / 2, 0, -max / 2, -max].map(v => {
    const y = zeroY - v * unit;
    const isZero = Math.abs(v) < 0.001;
    return `<line class="fs-grid${isZero ? ' fs-grid-zero' : ''}" x1="${PAD_L}" y1="${y.toFixed(1)}" x2="${W - 10}" y2="${y.toFixed(1)}"/>`
      + `<text class="fs-axis" x="${PAD_L - 6}" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${v > 0 ? '+' : ''}${v.toFixed(0)}%</text>`;
  }).join('');

  const first = fsMonth(series[0].from), last = fsMonth(series[series.length - 1].from);
  return `<figure class="fs-chart-wrap">
      <svg class="fs-chart" viewBox="0 0 ${W} ${H}" role="img"
           aria-label="Monthly UPPCL fuel surcharge from ${esc(first)} to ${esc(last)}. Bars above the zero line are charges, bars below are credits.">
        ${gridLines}${bars}
      </svg>
      <figcaption>Bars above the line are a <strong>charge</strong>; bars below are a
      <strong>credit</strong> back to you. The two spikes at +10% are the regulation's
      monthly ceiling — the excess is carried into later months, not written off.</figcaption>
    </figure>`;
}

function fuelSurchargePage({ url = '/fppa/', canonicalUrl = url } = {}) {
  const title = 'India Electricity Surcharge Tracker — FPPA / FPPAS / FAC Rates';
  const description = 'Live electricity surcharge rates (FPPA, FPPAS, PPAC, FAC) for Uttar Pradesh, Delhi and Rajasthan, '
    + 'with the full month-by-month history, what each rate adds to your bill, and the tariff regulation it is levied under.';

  // ── current standing rates ──────────────────────────────────────────────────
  // pick() resolves against today's date, which is what makes this a tracker rather than
  // an archive. A state whose current month has no notice yet resolves to null — that is
  // reported as "not yet notified", never silently as zero, because zero is a claim.
  const nowMonth = fsMonthLong(TODAY.slice(0, 8) + '01');
  const rows = fppaTrackerRows();
  const coverage = fppaCoverageStates();

  const currentRows = rows.map(r => {
    const latest = r.list[0];
    const cur = r.cur;
    const shown = cur || latest;
    const val = shown ? `<strong class="${shown.rate >= 0 ? 'fs-pos' : 'fs-neg'}">${esc(fsRate(shown))}</strong>` : '<span class="fs-pending">Not yet notified</span>';
    // Labels are authored for the bill line ("BRPL PPAC (from Jun 2026…)"), where the DISCOM
    // is not otherwise stated. Here column one already names it, so the prefix is dead weight
    // in a column that is the first to get squeezed on a phone.
    const note = cur
      ? esc(r.code && cur.label.startsWith(r.code + ' ') ? cur.label.slice(r.code.length + 1) : cur.label)
      : `Latest published: ${esc(fsMonth(latest.from))}; ${esc(nowMonth)} not yet notified`;
    return `<tr><td><a href="/fppa/${esc(r.slug)}/">${esc(r.who)}</a></td><td>${esc(r.scope)}</td><td>${val}</td><td>${note}</td></tr>`;
  }).join('');
  const stateCards = coverage.map((state, i) => fppaStateSummaryCard(state, rows.filter(r => r.state === state), i)).join('');

  // ── UP monthly series (the only state with a true month-by-month history) ────
  const upSeries = [...FPPA_BY_STATE['Uttar Pradesh']].sort((a, b) => a.from.localeCompare(b.from));
  const upChart = fsChart(upSeries);
  const upRows = [...upSeries].reverse().map(e =>
    `<tr><td>${esc(fsMonth(e.from))}</td><td class="${e.rate >= 0 ? 'fs-pos' : 'fs-neg'}">${esc(fsRate(e))}</td><td>${e.rate >= 0 ? 'Charge' : 'Credit'}</td></tr>`).join('');
  const upCharges = upSeries.filter(e => e.rate > 0).length;
  const upCredits = upSeries.length - upCharges;
  const upAvg = upSeries.reduce((s, e) => s + e.rate, 0) / upSeries.length;

  // Worked example — deliberately static text, not a JS widget, because this is the passage
  // most likely to be pulled into an AI answer or a featured snippet, and neither reads JS.
  const exBase = 1500, exPct = 10, exAmt = exBase * exPct / 100;

  // Three DISCOMs with one rate each is not a table's worth of data, and as a table it was
  // stating things twice: the Notice column repeated the DISCOM name already in column one
  // ("BRPL PPAC (Jul 2026…)" on the row labelled BRPL), and repeated the same month on all
  // three rows. As cards each says its own name once, shows the figure at a size worth reading,
  // and carries the one fact the table never did — how far it moved from the previous notice,
  // computed from the series rather than read out of a label.
  const delhiCards = rows.filter(r => r.state === 'Delhi').map(r => {
    const cur = r.cur;
    if (!cur) return '';
    // The lists are not stored newest-first throughout, so the previous notice is the latest
    // entry that starts before this one rather than simply the next array slot.
    const prev = r.list
      .filter(e => e && e.from < cur.from && Number.isFinite(e.rate))
      .sort((x, y) => y.from.localeCompare(x.from))[0] || null;
    const delta = prev ? +(cur.rate - prev.rate).toFixed(2) : null;
    const dir = delta == null ? 'flat' : delta > 0.005 ? 'up' : delta < -0.005 ? 'down' : 'flat';
    const move = delta == null
      ? 'First recorded notice'
      : dir === 'flat'
        ? `Unchanged from ${esc(fsMonth(prev.from))}`
        : `${dir === 'up' ? '▲' : '▼'} ${Math.abs(delta).toFixed(2)} pts from ${esc(prev.rate.toFixed(2))}%`;
    return `
      <article class="fs-delhi-card">
        <span class="fs-delhi-name">${esc(r.who)}</span>
        <strong class="fs-delhi-rate">${esc(fsRate(cur))}</strong>
        <span class="fs-delhi-move is-${dir}">${move}</span>
        <span class="fs-delhi-when">${esc(fsMonth(cur.from))} notice</span>
      </article>`;
  }).join('');

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Fuel Surcharge', url: null }])}
    <h1>India Electricity Surcharge Tracker</h1>
    <p class="seo-lead">Your tariff is fixed for the year. Your <strong>fuel surcharge is not</strong> —
    it is renotified every month, it can double-digit your bill without any tariff hike, and it is the
    single most common reason a bill jumps with no change in your usage. This page tracks the
    published FPPA, FPPAS, PPAC and FAC rate for every state we have verified data for.</p>
    <p class="privacy-updated">Last updated ${LASTMOD_TOKEN.en} &middot; Rates as notified by the
    state regulator or DISCOM &middot; See also <a href="/guides/how-fppa-fuel-surcharge-is-calculated/">how
    the fuel surcharge is calculated</a></p>

    <section class="seo-section fs-product-nav">
      <h2>Track by state</h2>
      <div class="fs-state-grid">${stateCards}</div>
      <p class="fs-legend">Dedicated tracker pages are generated only for states where we have verified
      surcharge notices. Maharashtra FAC/FPPCA and Telangana FPPCA are high-priority coverage targets.</p>
    </section>

    <section class="seo-section">
      <h2>Current rates — ${esc(nowMonth)}</h2>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>State / DISCOM</th><th>Applies to</th><th>Current rate</th><th>Notice</th></tr></thead>
          <tbody>${currentRows}</tbody>
        </table>
      </div>
      <p class="fs-legend"><strong>A negative rate is a credit</strong>, not a charge — when fuel
      costs fall below what the tariff assumed, the difference comes back to you. Where a month
      shows "not yet notified", the regulator has not published that month's figure at the time
      of writing; we leave it blank rather than assume zero.</p>
    </section>

    <section class="seo-section">
      <h2>Uttar Pradesh: 16 months of FPPAS</h2>
      <p>UPPCL notifies a Fuel and Power Purchase Adjustment Surcharge every month as a
      <strong>percentage of your fixed + energy charges</strong>, under
      <a href="/guides/how-fppa-fuel-surcharge-is-calculated/">UPERC MYT Regulations 2025</a>.
      Of the ${upSeries.length} months we have verified, ${upCharges} were a charge and
      ${upCredits} were a credit, averaging ${upAvg > 0 ? '+' : ''}${upAvg.toFixed(2)}%.</p>
      ${upChart}
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Month</th><th>FPPAS</th><th>Effect</th></tr></thead>
          <tbody>${upRows}</tbody>
        </table>
      </div>
    </section>

    <section class="seo-section">
      <h2>What does 10% actually cost you?</h2>
      <p>The surcharge is applied to your <strong>fixed charges plus energy charges</strong> —
      not to the bill total, and not after taxes. So on a bill where those come to
      ${rupee(exBase)}, a ${exPct}% surcharge adds <strong>${rupee(exAmt)}</strong>, and
      electricity duty is then charged on the larger figure.</p>
      <p>That ordering matters and is frequently got wrong: duty applies <em>after</em> the
      surcharge, so the money leaving your pocket is more than the surcharge line itself. On a real
      UP domestic bill of 300 units at 2&nbsp;kW, the surcharge line reads ₹194.50 — but the bill
      rises by ₹204, because 5% electricity duty is charged on the surcharge too. Our
      <a href="/#calculator">bill calculator</a> applies the correct rate for your DISCOM and
      billing month automatically — you do not need to look it up here first.</p>
      <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">Calculate my bill with this month's surcharge</a></p>
    </section>

    <section class="seo-section">
      <h2>Delhi: PPAC, revised monthly since June 2026</h2>
      <p>Delhi calls it PPAC (Power Purchase Adjustment Cost) and sets it <strong>per DISCOM</strong>,
      so two neighbours on different networks pay different surcharges on identical usage. DERC
      moved from periodic to monthly revisions in June 2026 and sanctioned sharply higher rates.</p>
      <div class="fs-delhi-grid">${delhiCards}</div>
    </section>

    <section class="seo-section">
      <h2>Why it changes every month</h2>
      <p>A tariff order fixes what you pay per unit for a year, based on an assumption about what
      power will cost the DISCOM to buy. Fuel prices do not respect that assumption. The fuel
      surcharge is the true-up: when actual power-purchase cost runs above the assumed figure,
      the gap is passed through to you; when it runs below, you get a credit.</p>
      <p>Most states cap how much can be recovered in one cycle — Uttar Pradesh at 10% — and carry
      the excess forward. That is why you can see two consecutive months pinned at exactly the
      ceiling: the underlying gap was larger than the cap allowed.</p>
      <div class="seo-link-grid">
        <a class="seo-link-card" href="/guides/how-fppa-fuel-surcharge-is-calculated/"><strong>How FPPA is calculated</strong><span>The formula, both methods, and where it lands on your bill</span></a>
        <a class="seo-link-card" href="/guides/msedcl-fppa-charges-explained/"><strong>FPPA on an MSEDCL bill</strong><span>Maharashtra's version, line by line</span></a>
        <a class="seo-link-card" href="/guides/why-did-my-electricity-bill-increase/"><strong>Why did my bill go up?</strong><span>Fuel surcharge is one of nine common causes</span></a>
      </div>
    </section>

    <section class="seo-section">
      <h2>Coverage and sources</h2>
      <p>We publish a rate only where we have the regulator's or DISCOM's own notice. That
      currently means <strong>Uttar Pradesh, Delhi and Rajasthan</strong>. For every other state
      the calculator defaults the surcharge to zero and lets you type in the figure printed on
      your own bill — an honest blank rather than a plausible guess.</p>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>State</th><th>Mechanism</th><th>Basis</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Uttar Pradesh</td><td>FPPAS</td><td>% of fixed + energy charges, capped at 10%/cycle</td><td>UPPCL monthly FPPAS notice (UPERC MYT Reg. 2025)</td></tr>
            <tr><td>Delhi</td><td>PPAC</td><td>% of fixed + energy charges, set per DISCOM</td><td>DERC PPAC approvals</td></tr>
            <tr><td>Rajasthan</td><td>Regulatory Surcharge (incl. FPPAS)</td><td>Flat per-unit</td><td>Tariff for Supply of Electricity-2025 §32 (RERC)</td></tr>
          </tbody>
        </table>
      </div>
      <p>Spotted a rate that does not match your bill? That is a bug worth fixing —
      <a href="/contact/">tell us</a> and include the month and DISCOM.</p>
    </section>

    <p class="seo-disclaimer">Fuel-surcharge rates are published by state regulators and DISCOMs and
    change monthly. Figures here are transcribed from those notices and are indicative, not a
    substitute for your printed bill. Not affiliated with any DISCOM, SERC or government body.</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + canonicalUrl, page: url, altLangs: [],
    jsonld: [breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: canonicalUrl }])],
    body,
  });
}

// ── 404 (/404.html) ───────────────────────────────────────────────────────────
// GitHub Pages serves /404.html (with a 404 status) for any unmatched path. Without
// one, visitors hitting a stale/mistyped URL — of which there are many as GSC indexes
// more pages — get GitHub's bare default with no route back into the site. This branded
// page reuses the shared chrome (so the header search works) and points at the main
// tools. English-only: it must render for any path, so it can't assume a language prefix.
function fppaStatePage(state) {
  const stateSlug = slugify(state);
  const url = `/fppa/${stateSlug}/`;
  const rows = fppaTrackerRows().filter(r => r.state === state);
  if (!rows.length) return null;

  const mechanism = fppaMechanismName(state);
  const comparison = fppaStateComparison(state);
  const comparisonCurrent = comparison.filter(r => r.cur);
  const title = `${state} Electricity ${mechanism} Tracker - Compare DISCOM Surcharge Rates`;
  const description = `Compare current ${state} electricity surcharge rates by DISCOM: current charge, effective period, previous rate, direction, historical chart and official source notes.`;
  const nowMonth = fsMonthLong(TODAY.slice(0, 8) + '01');
  const archiveUrl = `/fppa/${stateSlug}/archive/`;
  const archiveLinks = fppaArchiveYearLinks(state);
  const currentRows = comparison.map(r => {
    const cur = r.cur;
    const prev = r.prev;
    const val = cur ? `<strong class="${cur.rate >= 0 ? 'fs-pos' : 'fs-neg'}">${esc(fsRate(cur))}</strong>` : '<span class="fs-pending">Not verified yet</span>';
    const previous = prev ? esc(fsRate(prev)) : '<span class="fs-pending">No earlier rate</span>';
    const tariffPath = `/tariffs/${stateSlug}/${r.discom.id}/`;
    return `<tr>
      <td><a href="${esc(tariffPath)}">${esc(r.discom.name)}</a></td>
      <td>${val}</td>
      <td>${esc(fppaPeriod(cur))}</td>
      <td>${previous}</td>
      <td>${fppaDirection(cur, prev)}</td>
      <td>${fppaImpact(cur)}</td>
    </tr>`;
  }).join('');

  const example = comparisonCurrent.find(r => r.cur?.mode === 'percent') || comparisonCurrent[0] || null;
  const exampleAmt = example?.cur?.mode === 'percent' ? 3000 * example.cur.rate / 100 : null;
  const exampleText = example && example.cur?.mode === 'percent'
    ? `For an electricity energy/fixed-charge base of ${rupee(3000)}, ${esc(example.discom.name)}'s current ${esc(fsRate(example.cur))} adjustment equals about <strong class="${example.cur.rate >= 0 ? 'fs-pos' : 'fs-neg'}">${example.cur.rate >= 0 ? '+' : '-'}${rupee(Math.abs(exampleAmt))}</strong> before electricity duty and any precise billing-rule adjustments.`
    : `For percentage-based surcharges, multiply your fixed plus energy charges by the published percentage. For per-unit surcharges, multiply the rate by units consumed.`;

  const hasDiscomSpecific = rows.some(r => r.type === 'discom');
  const whatChangedHtml = fppaWhatChangedHtml(state, mechanism, comparison, hasDiscomSpecific, rows);
  const historyItems = hasDiscomSpecific
    ? comparison.filter(r => r.list.length)
    : [{ discom: { name: state }, list: rows[0]?.list || [] }];
  const historyBlocks = historyItems.map(r => {
    const series = [...r.list].sort((a, b) => b.from.localeCompare(a.from));
    const historyRows = series.map((e, i) =>
      `<tr><td>${esc(fsMonth(e.from))}</td><td class="${e.rate >= 0 ? 'fs-pos' : 'fs-neg'}">${esc(fsRate(e))}</td><td>${fppaChange(series, i)}</td><td>${esc(e.label || '')}</td></tr>`).join('');
    const chartSeries = [...series].reverse().filter(e => e.mode === series[0].mode);
    const chart = chartSeries.length >= 2 ? fppaTrendSvg(chartSeries, 36, r.discom.name) : '';
    return `<section class="seo-section fs-state-history">
      <h2>Historical chart: ${esc(r.discom.name)} ${esc(mechanism)}</h2>
      ${chart}
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Month</th><th>Rate</th><th>Change</th><th>Notice</th></tr></thead>
          <tbody>${historyRows}</tbody>
        </table>
      </div>
    </section>`;
  }).join('');

  const mechanismNote = hasDiscomSpecific
    ? `${state} has DISCOM-specific ${mechanism} entries in our tracker, so the rate can differ by utility.`
    : `${state} currently uses a state-wide ${mechanism} entry in our tracker, so the same rate applies across the covered DISCOMs.`;

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: '/fppa/' }, { name: state, url: null }])}
    <h1>${esc(state)} Electricity ${esc(mechanism)} Tracker</h1>
    <p class="seo-lead">Compare the current electricity surcharge across ${esc(state)} DISCOMs,
    see whether the latest order moved the rate up or down, and use the historical chart to
    understand why a bill can rise even when your units do not change.</p>
    <p class="privacy-updated">Last updated ${LASTMOD_TOKEN.en} &middot; ${esc(mechanismNote)}</p>

    <section class="seo-section">
      <h2>Compare current ${esc(mechanism)} by DISCOM</h2>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>DISCOM</th><th>Current charge</th><th>Effective period</th><th>Previous</th><th>Direction</th><th>Example impact</th></tr></thead>
          <tbody>${currentRows}</tbody>
        </table>
      </div>
      <p class="fs-legend">Current month shown: ${esc(nowMonth)}. Negative rates are credits. "Not verified yet"
      means we have not found an official current notice for that DISCOM; the calculator still lets
      you enter the printed bill value manually.</p>
    </section>

    ${whatChangedHtml}

    <section class="seo-section fs-archive-callout">
      <h2>Historical archive</h2>
      <p>We do not delete old ${esc(mechanism)} values when a new notice appears. Each verified
      period remains archived with its rate, effective dates, direction and source note, so this
      page grows into a clean long-term surcharge dataset.</p>
      ${archiveLinks}
      <p class="seo-cta-row"><a class="seo-cta" href="${esc(archiveUrl)}">View full ${esc(state)} surcharge archive</a></p>
    </section>

    <section class="seo-section">
      <h2>What this means for consumers</h2>
      <p>${exampleText}</p>
      <p>Use this as a quick approximation only. Final bill impact depends on the exact base amount,
      duty, rounding, billing period and the regulator's order.</p>
    </section>

    ${historyBlocks}

    <section class="seo-section">
      <h2>Why did it change?</h2>
      ${fppaStateWhyHtml(state, mechanism)}
    </section>

    <section class="seo-section">
      <h2>Official source</h2>
      ${fppaStateSourcesHtml(state, comparison)}
    </section>

    <section class="seo-section">
      <h2>Use this rate on your bill</h2>
      <p>Open the calculator, choose your ${esc(state)} DISCOM, and keep <strong>Auto-fill from verified
      government data</strong> enabled. The calculator applies the surcharge mode correctly: percentage
      surcharges are applied on fixed plus energy charges, while per-unit surcharges multiply units.</p>
      <p class="seo-cta-row"><a class="seo-cta" href="/#calculator">Calculate my bill with current surcharge</a></p>
    </section>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: url, altLangs: [],
    jsonld: [breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: '/fppa/' }, { name: state, url }])],
    body,
  });
}

function fppaArchivePage(state) {
  const stateSlug = slugify(state);
  const url = `/fppa/${stateSlug}/archive/`;
  const rows = fppaArchiveRows(state);
  if (!rows.length) return null;
  const mechanism = fppaMechanismName(state);
  const title = `${state} ${mechanism} Historical Archive`;
  const description = `Permanent ${state} electricity surcharge archive: historical ${mechanism} rates by DISCOM, effective period, direction, notice and source.`;
  const yearLinks = fppaArchiveYearLinks(state);
  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: '/fppa/' }, { name: state, url: `/fppa/${stateSlug}/` }, { name: 'Archive', url: null }])}
    <h1>${esc(state)} ${esc(mechanism)} Historical Archive</h1>
    <p class="seo-lead">A permanent record of verified electricity surcharge values for ${esc(state)}.
    New notices are added as new periods; old values are kept with their effective dates and source
    notes so the archive remains useful for consumers, researchers and journalists.</p>
    <p class="privacy-updated">Last updated ${LASTMOD_TOKEN.en} &middot; Archive records are never overwritten by newer notices</p>

    ${fppaArchiveSummary(rows)}
    ${yearLinks}

    <section class="seo-section">
      <h2>All archived ${esc(mechanism)} entries</h2>
      ${fppaArchiveTable(rows)}
    </section>

    <section class="seo-section">
      <h2>Why this archive matters</h2>
      <p>Most searches only need the current surcharge. But old surcharge values explain old bills,
      complaint timelines, news reports and tariff changes. This archive preserves each historical
      value instead of replacing it with the latest one.</p>
      <p class="seo-cta-row"><a class="seo-cta" href="/fppa/${stateSlug}/">Back to current ${esc(state)} tracker</a></p>
    </section>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: url, altLangs: [],
    jsonld: [breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: '/fppa/' }, { name: state, url: `/fppa/${stateSlug}/` }, { name: 'Archive', url }])],
    body,
  });
}

function fppaArchiveYearPage(state, year) {
  const stateSlug = slugify(state);
  const url = `/fppa/${stateSlug}/${year}/`;
  const rows = fppaArchiveRows(state).filter(r => fppaEntryCoversYear(r.entry, year));
  if (!rows.length) return null;
  const mechanism = fppaMechanismName(state);
  const title = `${state} ${mechanism} History ${year}`;
  const description = `${state} ${mechanism} surcharge history for ${year}: historical electricity surcharge rates by DISCOM, effective period, previous rate direction and source.`;
  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: '/fppa/' }, { name: state, url: `/fppa/${stateSlug}/` }, { name: 'Archive', url: `/fppa/${stateSlug}/archive/` }, { name: String(year), url: null }])}
    <h1>${esc(state)} ${esc(mechanism)} History ${esc(year)}</h1>
    <p class="seo-lead">Verified ${esc(state)} electricity surcharge values that applied at some
    point during ${esc(year)}. A row may start before ${esc(year)} if that order continued into this year.</p>
    <p class="privacy-updated">Last updated ${LASTMOD_TOKEN.en} &middot; Part of the permanent surcharge archive</p>

    ${fppaArchiveSummary(rows)}
    ${fppaArchiveYearLinks(state, year)}

    <section class="seo-section">
      <h2>${esc(year)} archived entries</h2>
      ${fppaArchiveTable(rows)}
    </section>

    <section class="seo-section">
      <h2>Use this history carefully</h2>
      <p>Historical surcharge rates are useful for checking an old bill, but the payable amount still
      depends on the bill period, units, fixed charges, duty, rounding and the exact DISCOM billing rules.</p>
      <p class="seo-cta-row"><a class="seo-cta" href="/fppa/${stateSlug}/archive/">View full ${esc(state)} archive</a></p>
    </section>
  </section>`;

  return layout({
    title, description, canonical: SITE + url, page: url, altLangs: [],
    jsonld: [breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Surcharge Tracker', url: '/fppa/' }, { name: state, url: `/fppa/${stateSlug}/` }, { name: 'Archive', url: `/fppa/${stateSlug}/archive/` }, { name: String(year), url }])],
    body,
  });
}

function tariffDatabasePage(summary, dbStates = []) {
  const title = "India Residential Electricity Tariff Database";
  const description = "TheDiscomBill maintains a structured Indian residential electricity tariff database covering states, DISCOMs, categories, slabs, fixed charges, duty, FPPA, subsidy notes and tariff sources.";
  const fieldRows = summary.fields.map((f) => `<tr><td><code>${esc(f)}</code></td><td>${esc(databaseFieldDescription(f))}</td></tr>`).join('');

  // ── Coverage, state by state ───────────────────────────────────────────────
  // The page used to describe the database without ever showing any of it: half its height was
  // a 17-row dictionary of field names. A reader had no way to tell whether Maharashtra was
  // covered as well as Uttar Pradesh. This table is the database's own per-state records, gaps
  // included — a state with no published source says so, because a coverage page that only
  // showed the covered parts would be the one thing this page cannot afford to be.
  // Prefer a bare "FY 2026-27", but never report a state as unrecorded just because its note is
  // phrased differently — Assam's reads "AERC order dt. 25-Mar-2025, w.e.f. …", which has no FY
  // prefix at all. Matching only the FY shape had this column calling 10 states unrecorded when
  // 8 are, i.e. the page understating its own coverage.
  const fyOf = (s) => {
    // Anchored: an unanchored match picked up whatever FY appeared first anywhere in the note,
    // and Assam's note is "AERC order dt. 25-Mar-2025 … (APDCL petitioned to continue it
    // unchanged for FY 2026-27)" — labelling that state "FY 2026-27" would be reporting a
    // pending petition as the tariff basis. Only a note that opens with the year states it.
    const m = /^FY\s*20\d\d-\d\d/.exec((s.ratesAsOf || '').trim());
    if (m) return m[0].replace(/\s+/g, ' ');
    if (s.tariffYear) return s.tariffYear;
    const note = (s.ratesAsOf || '').trim();
    if (!note) return '';
    // Enough of the note to identify the order, with the full text on hover.
    const head = note.split(/[,(]/)[0].trim();
    return head.length > 30 ? `${head.slice(0, 29)}…` : head;
  };
  const sorted = [...dbStates].sort((a, b) => a.state.localeCompare(b.state));
  const coverageRows = sorted.map((s) => {
    const verified = !!(STATE_META[s.state] || {}).verified;
    const fy = fyOf(s);
    const basis = s.ratesAsOf || '';
    return `<tr>
      <td><a href="/tariffs/${slugify(s.state)}/">${esc(s.state)}</a>${verified
        ? ' <b class="db-tick" title="Checked line by line against real bills">✓</b>' : ''}</td>
      <td class="num">${s.discomCount}</td>
      <td class="num">${s.categoryCount}</td>
      <td>${fy ? `<span title="${attr(basis)}">${esc(fy)}</span>` : '<span class="db-gap">not recorded</span>'}</td>
      <td>${s.sourceUrl
        ? `<a href="${attr(s.sourceUrl)}" target="_blank" rel="noopener nofollow">Order ↗</a>`
        : '<span class="db-gap">—</span>'}</td>
    </tr>`;
  }).join('');
  const withSource = sorted.filter((s) => s.sourceUrl).length;
  const verifiedCount = sorted.filter((s) => (STATE_META[s.state] || {}).verified).length;
  const body = `
  <section class="seo-page container">
    ${breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Tariff Database', url: null }])}
    <h1>India Residential Electricity Tariff Database</h1>
    <p class="seo-lead">TheDiscomBill is built around a structured tariff database, not just a
    collection of calculators and articles. Each calculator result, DISCOM page and surcharge
    tracker pulls from the same maintained records for states, DISCOMs, consumer categories,
    slab rates, fixed charges, duties, FPPA/FPPAS/FAC history and source notes.</p>
    <p class="privacy-updated">Last updated ${LASTMOD_TOKEN.en} &middot; Generated from verified tariff modules</p>

    <div class="fs-archive-stats database-stats">
      <span><strong>${summary.stateCount}</strong> states / UTs</span>
      <span><strong>${summary.discomCount}</strong> DISCOMs</span>
      <span><strong>${summary.categoryCount}</strong> consumer categories</span>
      <span><strong>${summary.tariffRecordCount}</strong> tariff records</span>
      <span><strong>${summary.fppaTrackedDiscomCount}</strong> FPPA-linked DISCOMs</span>
      <span><strong>${summary.tariffRecordsWithPreviousTariff}</strong> records with history</span>
    </div>

    <section class="seo-section">
      <h2>Coverage, state by state</h2>
      <p>Every row is generated from the database itself, so this page cannot claim coverage the
      data does not have. ${withSource} of the ${summary.stateCount} states and UTs carry a link to
      the regulator's own order; the remaining ${summary.stateCount - withSource} are modelled from
      published schedules with no order URL recorded yet, and say so.
      ${verifiedCount === 1
        ? 'One state is additionally marked ✓ — checked line by line against real consumer bills.'
        : `${verifiedCount} states are additionally marked ✓ — checked line by line against real consumer bills.`}</p>
      <div class="comparison-table-wrapper">
        <table class="comparison-table database-coverage">
          <thead><tr>
            <th>State / UT</th><th class="num">DISCOMs</th><th class="num">Categories</th>
            <th>Tariff basis</th><th>Source</th>
          </tr></thead>
          <tbody>${coverageRows}</tbody>
        </table>
      </div>
      <p class="fs-legend">Hover a tariff basis for the full order note. Where a state shows
      &ldquo;not recorded&rdquo;, the rates are still modelled and usable — what is missing is a
      stored order reference, not the tariff.</p>
    </section>

    <section class="seo-section is-aside">
      <h2>Fields in each record</h2>
      <details class="database-schema">
        <summary>${summary.fields.length} fields per tariff record</summary>
        <div class="comparison-table-wrapper database-schema-table">
          <table class="comparison-table">
            <thead><tr><th>Field</th><th>Meaning</th></tr></thead>
            <tbody>${fieldRows}</tbody>
          </table>
        </div>
      </details>
      <p class="fs-legend">The raw generated database is an internal TheDiscomBill data asset.
      Public pages expose the useful consumer-facing views: calculators, DISCOM tariff pages,
      FPPA archives and guides.</p>
    </section>

    <section class="seo-section">
      <h2>Why this matters</h2>
      <p>Electricity tariffs are not one number per state. A useful bill estimate needs the correct
      DISCOM, category, load rule, slab ladder, fixed charge, duty method, surcharge method,
      subsidy note and effective period. Keeping those fields structured makes the site easier
      to verify, easier to update, and much harder to reproduce casually.</p>
      <div class="seo-link-grid">
        <a class="seo-link-card" href="/tariffs/states/"><strong>Browse tariff pages</strong><span>State and DISCOM views generated from the database</span></a>
        <a class="seo-link-card" href="/fppa/"><strong>Open surcharge tracker</strong><span>Month-by-month FPPA, FPPAS, PPAC and FAC history</span></a>
        <a class="seo-link-card" href="/methodology/"><strong>Read methodology</strong><span>How rates are verified and where estimates are labelled</span></a>
      </div>
    </section>

    <p class="seo-disclaimer">The database is maintained for bill estimation and consumer education.
    It is not affiliated with any DISCOM, regulator or government body, and official tariff orders
    remain the legal source.</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + '/database/', page: '/database/', altLangs: [],
    jsonld: [breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Tariff Database', url: '/database/' }])],
    body,
  });
}

function databaseFieldDescription(field) {
  return ({
    state: 'State or union territory name.',
    discom: 'Distribution company identity, service area and official website where available.',
    tariffYear: 'Financial year or tariff schedule year represented by the current record.',
    consumerCategory: 'Domestic, commercial or other consumer category and any supply-type variant.',
    slabs: 'Telescopic or flat energy charge slabs with cumulative limits.',
    fixedCharge: 'Monthly fixed, demand or load-based charge rule.',
    electricityDuty: 'Duty or tax line extracted from additional charges.',
    fppaFac: 'Current and historical fuel/power purchase adjustment values linked by state or DISCOM.',
    subsidy: 'Modelled subsidy schemes and subsidy notes where applicable.',
    meterCharge: 'Meter rent or meter-related charge where explicitly modelled.',
    minimumCharge: 'Minimum monthly charge or consumption guarantee where present.',
    solarRules: 'Solar/net-metering rules where structured data has been added.',
    effectiveDate: 'Date from which the current tariff record applies, where known.',
    tariffOrder: 'Tariff order label or rates-as-of note.',
    sourceUrl: 'Official regulator, DISCOM or tariff-order source URL.',
    lastVerified: 'Verification date where explicitly stored.',
    previousTariff: 'Historical rateHistory entries retained for old-bill checks.',
  })[field] || 'Structured tariff field.';
}

function notFoundPage() {
  const body = `
  <section class="seo-page container">
    <h1>404 — Page not found</h1>
    <p class="seo-lead">That page has moved or never existed. The link may be out of date —
      but everything on TheDiscomBill is a click away. Try the search in the header, or pick up
      one of the main tools below.</p>
    <section class="seo-section">
      <h2>Popular destinations</h2>
      <div class="seo-link-grid">
        <a class="seo-link-card" href="/#calculator"><strong>Bill Calculator</strong><span>Itemised electricity-bill estimate for any state and DISCOM</span></a>
        <a class="seo-link-card" href="/tariffs/states/"><strong>Tariffs by State</strong><span>Live slab rates, fixed charges and FPPA for every DISCOM</span></a>
        <a class="seo-link-card" href="/compare/"><strong>Compare Tariffs</strong><span>Put any two DISCOMs side by side at your usage</span></a>
        <a class="seo-link-card" href="/guides/"><strong>Bill Guides</strong><span>Plain-language walkthroughs of bills, charges and connections</span></a>
        <a class="seo-link-card" href="/solar-calculator/"><strong>Solar Savings Calculator</strong><span>Rooftop payback and net-metering savings</span></a>
        <a class="seo-link-card" href="/glossary/"><strong>Glossary</strong><span>Every charge line on an Indian bill, defined</span></a>
      </div>
    </section>
    <p class="seo-lang-link"><a href="/">← Back to home</a></p>
  </section>`;
  return layout({
    title: '404 — Page Not Found · TheDiscomBill',
    description: 'That page could not be found. Search TheDiscomBill or jump to the bill calculator, state tariffs, comparison tool and guides.',
    // A 404 is served at whatever path the visitor mistyped, so there is no honest
    // canonical to point at — and self-canonicalising an error page while telling
    // crawlers to ignore it is a contradiction. Emit neither; noindex does the work.
    canonical: SITE + '/404.html', noCanonical: true,
    robots: 'noindex, follow',
    page: null, lang: 'en',
    body,
  });
}

// ── smart meter guide (/smart-meter/) ─────────────────────────────────────────
// Was a hand-authored English page. Generated now so the hi/mr/ta twins come from one
// source: copy in smart-meter-content.js, diagram in smart-meter-svg.js, and the chrome,
// hreflang, sitemap entries and lastmod tracking all fall out of layout()/emitPage()
// exactly as they do for every other page.
function smartMeterGuidePage(lang = 'en') {
  const enUrl = '/smart-meter/';
  const url = langUrl(enUrl, lang);
  const pfx = lang === 'en' ? '' : `/${lang}`;
  const guides = `${pfx}/guides/`;
  const S = SMG;
  // %PFX% marks a link whose target has NO vernacular twin — the homepage, /methodology/,
  // /sanctioned-load-optimizer/. Those stay root-absolute English on every twin, because a
  // /hi/methodology/ does not exist. %GUIDES% is the opposite: guides DO have twins.
  const t = (node) => T(lang, node)
    .replace(/%PFX%/g, '')
    .replace(/%GUIDES%/g, guides)
    .replace(/\s+/g, ' ')
    .trim();

  const toc = [
    ['#symbols', S.toc.symbols], ['#register-codes', S.toc.codes],
    ['#three-phase', S.toc.three], ['#amisp', S.toc.amisp], ['#faq', S.toc.faq],
  ].map(([href, node]) => `<a href="${href}">${esc(T(lang, node))}</a>`).join('\n        ');

  const legend = S.legend.map((it, i) =>
    `<li id="meter-item-${i + 1}"><strong>${esc(T(lang, it.t))}</strong> — ${t(it.d)}</li>`
  ).join('\n        ');

  // Where each numbered circle sits inside the 700x560 viewBox of METER_SVG, in the legend's
  // own order. The HTML callouts are positioned from these as percentages, so they track the
  // diagram exactly as it scales. The alternative, <text> inside the SVG, cannot wrap and
  // would break on the longer Tamil and Marathi labels.
  //
  // If a circle moves in smart-meter-svg.js, its entry here has to move with it. That is the
  // one coupling in this arrangement, and it is why the number is not repeated in the HTML:
  // the circle on the diagram IS the number, the label beside it is only the name.
  const CALLOUTS = [
    ['r', 100], ['r', 134], ['l', 214], ['l', 248], ['r', 214], ['r', 248],
    ['l', 282], ['l', 316], ['r', 292], ['l', 350], ['r', 358], ['l', 380],
    ['r', 410], ['r', 462],
  ];
  const callouts = S.legend.map((it, i) => {
    const [side, y] = CALLOUTS[i];
    return `<a class="meter-call is-${side}" href="#meter-item-${i + 1}" style="--y:${y}">`
      + `<span class="meter-call-t">${esc(T(lang, it.t))}</span></a>`;
  }).join('\n              ');

  const codeRows = S.codes.map(r =>
    `<tr><td><code>${r.c.replace(' / ', '</code> / <code>')}</code></td><td>${esc(T(lang, r.w))}</td><td>${esc(T(lang, r.y))}</td></tr>`
  ).join('\n            ');

  const threePoints = S.threePoints.map(p =>
    `<li><strong>${esc(T(lang, p.t))}</strong> ${t(p.d)}</li>`).join('\n        ');

  const card = (href, node) =>
    `<a class="seo-link-card" href="${href}"><strong>${esc(T(lang, node.t))}</strong><span>${esc(T(lang, node.d))}</span></a>`;

  const wrongCards = S.wrongCards.map(c =>
    card(c.href.replace('%GUIDES%', guides), c)).join('\n        ');

  const faqItems = S.faq.map(f =>
    `<details class="seo-faq-item">
        <summary>${esc(T(lang, f.q))}</summary>
        <div class="seo-faq-a">${t(f.a)}</div>
      </details>`).join('\n      ');

  // FAQPage is built from the same strings the page renders, so the two cannot drift.
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: S.faq.map(f => ({
      '@type': 'Question', name: T(lang, f.q),
      acceptedAnswer: { '@type': 'Answer', text: t(f.a).replace(/<[^>]+>/g, '') },
    })),
  };

  const body = `
  <section class="seo-page container smart-meter-page">
    <nav class="seo-breadcrumbs" aria-label="Breadcrumb"><ol><li class="crumb"><a href="/" data-i18n="bc.home">${esc(T(lang, { en: 'Home', hi: 'होम', mr: 'होम', ta: 'முகப்பு' }))}</a></li><li class="crumb-sep" aria-hidden="true">›</li><li class="crumb"><span aria-current="page">${esc(T(lang, S.crumb))}</span></li></ol></nav>
    <h1>${esc(T(lang, S.h1))}</h1>
    <!-- The header switcher is a <li data-lang> list driven by JS, so it emits no crawlable
         link to any twin. Without this row /hi/, /mr/ and /ta/smart-meter/ were the only three
         indexable pages on the site with zero inbound internal links — in the sitemap and
         linked by <head> hreflang, but with no crawl path and no internal link equity.
         This page is one article with exactly three twins, so per-page capsules describe its
         coverage exactly; that is why the row belongs here and not on the state-scoped
         smart-meter-recharge family. -->
    ${langPills(enUrl, lang)}
    <p class="guide-meta">${T(lang, S.meta).replace('%DATE%', LASTMOD_TOKEN[lang]).replace(/%PFX%/g, '')}</p>
    <p class="seo-lead">${t(S.lead)}</p>

    <nav class="page-toc" aria-label="${esc(T(lang, S.toc.label))}">
      <span class="page-toc-label">${esc(T(lang, S.toc.label))}</span>
      ${toc}
    </nav>

    <section class="seo-section" id="symbols">
      <h2>${esc(T(lang, S.symbolsH2))}</h2>
      <p>${t(S.symbolsIntro)}</p>
      <p class="meter-hint">
        <span class="meter-hint-tag">${esc(T(lang, S.hintTag))}</span>
        <span>${t(S.hint)}</span>
      </p>
      <figure class="meter-figure">
        <div class="meter-stage-wrap">
          <div class="meter-stage">
${METER_SVG.replace('>Press here<', `>${esc(T(lang, S.pressHere))}<`)}
            <div class="meter-callouts">
              ${callouts}
            </div>
          </div>
        </div>
        <div class="meter-readout" id="mReadout" aria-live="polite">
          <div class="meter-readout-head">
            <span class="meter-readout-step" id="mStep"></span>
            <strong id="mTitle"></strong>
          </div>
          <p id="mWhy"></p>
          <button type="button" class="meter-readout-btn" id="mNext">${esc(T(lang, S.pressHere))} →</button>
        </div>
        <figcaption>${t(S.figcaption)}</figcaption>
      </figure>
      <ol class="meter-legend">
        ${legend}
      </ol>
    </section>

    <section class="seo-section" id="register-codes">
      <h2>${esc(T(lang, S.codesH2))}</h2>
      <p>${t(S.codesIntro)}</p>
      <div class="comparison-table-wrapper"><table class="comparison-table">
        <thead><tr><th>${esc(T(lang, S.codesTh.code))}</th><th>${esc(T(lang, S.codesTh.what))}</th><th>${esc(T(lang, S.codesTh.why))}</th></tr></thead>
        <tbody>
            ${codeRows}
        </tbody>
      </table></div>
      <p class="seo-note">${t(S.codesNote)}</p>
      <aside class="inline-cta">
        <div>
          <strong>${T(lang, S.ctaTitle)}</strong>
          <span>${t(S.ctaBody)}</span>
        </div>
        <a class="btn-primary cta-arrow" href="/#calculator">
          <span>${esc(T(lang, S.ctaBtn))}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </aside>
    </section>

    <section class="seo-section" id="three-phase">
      <h2>${esc(T(lang, S.threeH2))}</h2>
      <p>${t(S.threeIntro)}</p>
      <p>${esc(T(lang, S.threeLead))}</p>
      <ul>
        ${threePoints}
      </ul>
      <p>${t(S.threeOutro)}</p>
    </section>

    <section class="seo-section" id="amisp">
      <h2>${esc(T(lang, S.amispH2))}</h2>
      <p>${t(S.amispP1)}</p>
      <p>${t(S.amispP2)}</p>
      <p class="seo-note">${t(S.amispNote)}</p>
      <div class="seo-link-grid">
        ${card('/smart-meter/amisp-list/', S.amispCard)}
      </div>
    </section>

    <section class="seo-section">
      <h2>${esc(T(lang, S.readingH2))}</h2>
      <p>${t(S.readingP)}</p>
      <div class="seo-link-grid">
        ${card('/#calculator', S.cards.calc)}
        ${card('/check-my-bill/', S.cards.check)}
        ${card(`${pfx}/smart-meter-recharge/`, S.cards.recharge)}
      </div>
    </section>

    <section class="seo-section">
      <h2>${esc(T(lang, S.wrongH2))}</h2>
      <div class="seo-link-grid">
        ${wrongCards}
      </div>
    </section>

    <section class="seo-section" id="faq">
      <h2>${esc(T(lang, S.faqH2))}</h2>
      ${faqItems}
    </section>

    <p class="seo-disclaimer">${t(S.disclaimer)}</p>
  </section>
  <script type="module">
    import { initSmartMeter } from "/js/smart-meter.js";
    initSmartMeter();
  </script>`;

  return layout({
    title: T(lang, S.title),
    description: T(lang, S.description),
    canonical: `${SITE}${url}`,
    lang, page: enUrl, altLangs: VERNACULARS,
    jsonld: [faqLd],
    body,
  });
}

// ── understand your bill (/understand-your-bill/) ─────────────────────────────
// An annotated, interactive bill. The reader changes DISCOM, units, sanctioned load or the
// arrears toggle and every figure recomputes through js/engine.js — the same engine behind
// the calculator, so the explanations describe arithmetic that really ran and a tariff
// revision reaches this page without anyone editing it.
//
// The default scenario is rendered here, at build time, complete with its numbers. That is
// deliberate and it is the difference between this page and /compare/: a page whose entire
// substance arrives by JS ships an empty document to a crawler. Only the FIGURES are live;
// every word of explanation is in the served HTML.
//
// English-only for now. The strings are already in { en } objects and T() falls back to .en,
// so adding twins later is additive — but the explanation prose is the hardest copy on the
// site to translate well, and it is not worth doing before the page has earned impressions.
// Only the families that actually have vernacular twins get a language prefix. The tool pages
// (/compare/, /check-my-bill/, /sanctioned-load-optimizer/, /bill-review/), /fuel-surcharge/
// and the homepage anchor have none, and sending a Hindi reader to /hi/compare/ would 404.
//
// Within the families listed here, coverage still varies per language — Marathi tariff twins
// exist only for Maharashtra, Tamil for none of the states in the scenario set. That is handled
// downstream: emitPage() strips a language prefix from any guides/tariffs URL whose twin was
// not generated, so a link to an untranslated page falls back to English rather than 404ing.
const TWINNED = /^\/(guides|tariffs|glossary|smart-meter)\b/;
function langUrl2(href, lang) {
  if (lang === 'en' || !TWINNED.test(href)) return href;
  return `/${lang}${href}`;
}

function understandBillPage(lang = 'en') {
  const enUrl = '/understand-your-bill/';
  const U = UB;
  const t = (node) => T(lang, node).replace(/\s+/g, ' ').trim();

  const scenario = SCENARIOS.find(s => s.id === DEFAULT_SCENARIO) || SCENARIOS[0];
  const bill = calculateBill(billInput(scenario));
  if (bill.error) throw new Error(`understandBillPage: ${bill.message}`);
  const r = readout(bill, scenario, lang);
  const { html: billMarkup, marks } = billHtml(r);

  const copy = (s) => {
    const c = SCENARIO_COPY[s.id];
    if (!c) throw new Error(`understandBillPage: no SCENARIO_COPY for "${s.id}"`);
    return c;
  };
  const scenarioOpts = SCENARIOS.map(s =>
    `<option value="${attr(s.id)}"${s.id === scenario.id ? ' selected' : ''}>${esc(T(lang, copy(s).label))}</option>`
  ).join('\n            ');

  // The scenario notes are all rendered, and JS shows the one that matches. Rendering only the
  // current one would mean the other three exist nowhere in the HTML, and they are useful copy.
  // The bill above is a schematic; these point at the DISCOM's actual bill layout and its
  // actual rate schedule. It is the most useful link on the page for a reader who has just
  // recognised their own utility in the selector.
  const scenarioLinks = SCENARIOS.map(s => {
    const parts = [];
    if (s.guide) parts.push(`<a href="${attr(langUrl2(s.guide, lang))}">${esc(T(lang, U.realBill))}</a>`);
    parts.push(`<a href="${attr(langUrl2(s.tariffPage, lang))}">${esc(T(lang, U.realRates))}</a>`);
    return `<p class="ub-more ub-more-scenario" data-scenario="${attr(s.id)}"`
      + `${s.id === scenario.id ? '' : ' hidden'}>`
      + `<span class="ub-more-label">${esc(T(lang, U.realThing))}</span>${parts.join('')}</p>`;
  }).join('\n      ');

  const scenarioNotes = SCENARIOS.map(s =>
    `<p class="ub-note" data-scenario="${attr(s.id)}"${s.id === scenario.id ? '' : ' hidden'}>${esc(T(lang, copy(s).note))}</p>`
  ).join('\n          ');

  // One explanation per LINE. A line the default bill does not carry still gets its block —
  // it is real content, it is what someone searching "what is FPPA" arrives for, and hiding
  // it would make the page's substance depend on which scenario happened to be default.
  const explain = (group) => LINES.filter(l => l.group === group).map(l => {
    const n = marks[l.id];
    const live = r.live[l.live];
    return `<article class="ub-explain" id="explain-${l.id}" data-line="${attr(l.id)}" data-live="${attr(l.live || '')}"${n ? '' : ' data-absent'}>
        <h3><span class="ub-num"${n ? '' : ' hidden'}>${n || ''}</span>${esc(T(lang, l.title))}</h3>
        <p>${t(l.body)}</p>
        <div class="ub-live"${live ? '' : ' hidden'}><span class="ub-live-tag">${esc(T(lang, U.onThisBill))}</span>
          <div class="ub-live-body">${liveHtml(live)}</div></div>
        <p class="ub-live is-absent"${live ? ' hidden' : ''}>${esc(T(lang, U.notOnThisBill))}</p>${
        (l.links || []).length ? `
        <p class="ub-more">${(l.links).map(([href, label]) =>
          `<a href="${attr(langUrl2(href, lang))}">${esc(T(lang, label))}</a>`).join('')}</p>` : ''}
      </article>`;
  }).join('\n      ');

  const section = (id, group) => `
    <section class="seo-section" id="${id}">
      <h2>${esc(T(lang, U.sectionH2[group]))}</h2>
      <p>${t(U.sectionIntro[group])}</p>
      ${explain(group)}
    </section>`;

  const toc = [
    ['#bill', U.toc.bill], ['#who', U.toc.header], ['#when', U.toc.period], ['#reading', U.toc.reading],
    ['#charges', U.toc.charges], ['#totals', U.toc.totals],
    ['#why-higher', U.toc.higher], ['#faq', U.toc.faq],
  ].map(([href, node]) => `<a href="${href}">${esc(T(lang, node))}</a>`).join('\n        ');

  const higher = T(lang, U.higherPoints).map(([h, d]) =>
    `<li><strong>${esc(h)}</strong> ${esc(d.replace(/\s+/g, ' ').trim())}</li>`).join('\n        ');

  const faqItems = U.faq.map(f =>
    `<details class="seo-faq-item">
        <summary>${esc(T(lang, f.q))}</summary>
        <div class="seo-faq-a">${t(f.a)}</div>
      </details>`).join('\n      ');

  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: U.faq.map(f => ({
      '@type': 'Question', name: T(lang, f.q),
      acceptedAnswer: { '@type': 'Answer', text: t(f.a).replace(/<[^>]+>/g, '') },
    })),
  };

  const card = (c) => `<a class="seo-link-card" data-icon="${cardIcon('', c.href)}" href="${attr(c.href)}">`
    + `<strong>${esc(T(lang, c.t))}</strong><span>${esc(T(lang, c.d))}</span></a>`;

  const body = `
  <section class="seo-page container understand-bill-page">
    <nav class="seo-breadcrumbs" aria-label="Breadcrumb"><ol><li class="crumb"><a href="/" data-i18n="bc.home">${esc(T(lang, { en: 'Home', hi: 'होम', mr: 'होम', ta: 'முகப்பு' }))}</a></li><li class="crumb-sep" aria-hidden="true">›</li><li class="crumb"><span aria-current="page">${esc(T(lang, U.crumb))}</span></li></ol></nav>
    <h1>${esc(T(lang, U.h1))}</h1>
    ${langPills(enUrl, lang)}
    <p class="guide-meta">${T(lang, U.meta).replace('%DATE%', LASTMOD_TOKEN[lang])}</p>
    <p class="seo-lead">${t(U.lead)}</p>

    <nav class="page-toc" aria-label="${esc(T(lang, U.toc.label))}">
      <span class="page-toc-label">${esc(T(lang, U.toc.label))}</span>
      ${toc}
    </nav>

    <section class="seo-section" id="bill">
      <h2>${esc(T(lang, U.controlsH2))}</h2>
      <p>${t(U.controlsIntro)}</p>

      <form class="ub-controls" id="ubControls" novalidate>
        <div class="ub-field ub-field-wide">
          <label for="ubScenario">${esc(T(lang, U.ctl.scenario))}</label>
          <select id="ubScenario" name="scenario">
            ${scenarioOpts}
          </select>
        </div>
        <div class="ub-field">
          <label for="ubUnits">${esc(T(lang, U.ctl.units))}</label>
          <input type="number" id="ubUnits" name="units" min="0" max="5000" step="10" value="${scenario.units}" inputmode="numeric">
        </div>
        <div class="ub-field">
          <label for="ubLoad">${esc(T(lang, U.ctl.load))}</label>
          <input type="number" id="ubLoad" name="load" min="0.5" max="150" step="0.5" value="${scenario.connectedLoadKw}" inputmode="decimal">
        </div>
        <div class="ub-field ub-field-own-row">
          <label for="ubMd">${esc(T(lang, U.ctl.md))} <span class="ub-optional">${esc(T(lang, U.ctl.optional))}</span></label>
          <input type="number" id="ubMd" name="md" min="0" max="500" step="0.1" placeholder="${attr(scenario.md)}" inputmode="decimal">
        </div>
        <div class="ub-field ub-field-check">
          <label><input type="checkbox" id="ubMessy" name="messy"> ${esc(T(lang, U.ctl.messy))}</label>
          <span class="ub-hint">${esc(T(lang, U.ctl.messyHint))}</span>
        </div>
        <p class="ub-hint ub-hint-md">${esc(T(lang, U.ctl.mdHint))}</p>
        <button type="button" class="btn-ghost ub-reset" id="ubReset">${esc(T(lang, U.ctl.reset))}</button>
      </form>
      ${scenarioNotes}
      ${scenarioLinks}

      <p class="ub-illustrative">
        <span class="ub-illustrative-tag">${esc(T(lang, U.illustrative))}</span>
        <span>${t(U.illustrativeBody)}</span>
      </p>

      <div class="ub-stage">
        <!-- Routed connectors from each shared marker to the part of the meter it names.
             Measured and drawn by js/understand-bill.js: the two ends live in independently
             flowing elements hundreds of pixels apart vertically, so there is no CSS that can
             join them. Empty here and stays empty without JS, where the markers fall back to
             sitting inline against their rows. -->
        <svg class="ub-links" id="ubLinks" aria-hidden="true" focusable="false">
          <path class="ub-link is-register is-live" data-link="present-reading" d=""/>
          <path class="ub-link is-register" data-link="md" d=""/>
          <path class="ub-link" data-link="meter-number" d=""/>
          <text class="ub-link-label is-register" data-link-label="present-reading">7</text>
          <text class="ub-link-label is-register" data-link-label="md">9</text>
          <text class="ub-link-label" data-link-label="meter-number">4</text>
        </svg>
      <!-- The meter and the bill carry ONE set of numbers between them: marker 4 is the meter
           number on both drawings, 7 is the present reading, 9 is the maximum demand. That shared
           digit is the connection — it needs no leader line spanning two independently-flowing
           elements, which would need JS measurement on every resize and would still be fragile.

           The three leader paths are lifted from the guide's own diagram, so they terminate on
           exactly the same parts of exactly the same drawing. -->
      <figure class="meter-mini">
        <figcaption class="meter-mini-cap">${esc(r.S.mFigure)}</figcaption>
        <div class="meter-mini-stage">
${METER_DEVICE
  .replace('>Press here<', `>${esc(T(lang, SMG.pressHere))}<`)
  .replace('<text class="m-serial" x="186" y="378">Sr. No. RND00001</text>',
           `<text class="m-serial" id="mmSerialText" x="186" y="378">Sr. No. ${esc(scenario.meterNo)}</text>`)
  .replace(/<g class="m-seg" id="mSeg">[\s\S]*?<\/g>/,
           `<g class="m-seg" id="mSeg">${segmentsFor(r.meter.screens[0].value)}</g>`)
  .replace(/<text class="m-code" id="mCode"([^>]*)>[^<]*<\/text>/,
           `<text class="m-code" id="mCode"$1>${esc(r.meter.screens[0].code)}</text>`)
  .replace(/<text class="m-unit" id="mUnit"([^>]*)>[^<]*<\/text>/,
           `<text class="m-unit" id="mUnit"$1>${esc(r.meter.screens[0].unit)}</text>`)}
          <!-- The parts a shared marker refers to. No numbers here: the marker itself lives in
               the gap between the two drawings and is the only one. These just light up. -->
          <!-- Each shared marker's route is drawn to one of these, so the anchors have to sit on
               the part actually being named: the digit field for the reading, the register-code row
               for the demand (the code is what tells you WHICH register is on screen), and the
               nameplate block for the serial. They double as the highlight wash. -->
          <g class="meter-mini-parts">
            <rect data-mm="present-reading" class="is-live" x="292" y="242" width="168" height="38" rx="3"/>
            <rect data-mm="md" x="292" y="282" width="168" height="18" rx="3"/>
            <rect data-mm="meter-number" x="180" y="368" width="232" height="70" rx="3"/>
          </g>
        </svg>
        </div>
        <p class="meter-mini-readout">
          <span class="meter-mini-step" id="mmStep">1/${r.meter.screens.length}</span>
          <strong id="mmTitle">${esc(r.S.mScreenReading)}</strong>
        </p>
        <p class="meter-mini-hint">${esc(r.S.mHint)}</p>
      </figure>

      <!-- The gutter that the numbered markers hang in lives on .bill-figure, outside the
           document's own border — the same arrangement as the meter diagram on
           /smart-meter/, where the callouts sit beside the device rather than on it. -->
      <figure class="bill-figure">
        <div class="bill-doc" id="billDoc" aria-live="polite">${billMarkup}
        </div>
      </figure>
      </div>
      <p class="seo-note" id="ubError" hidden></p>
    </section>
${section('who', 'header')}
${section('when', 'period')}
${section('reading', 'reading')}
${section('charges', 'charges')}
${section('totals', 'totals')}

    <section class="seo-section" id="why-higher">
      <h2>${esc(T(lang, U.higherH2))}</h2>
      <p>${t(U.higherIntro)}</p>
      <ul>
        ${higher}
      </ul>
      <p>${t(U.higherOutro)}</p>
    </section>

    <section class="seo-section" id="faq">
      <h2>${esc(T(lang, U.faqH2))}</h2>
      ${faqItems}
    </section>

    <section class="seo-section">
      <h2>${esc(T(lang, U.nextH2))}</h2>
      <div class="seo-link-grid">
        ${card(U.cards.calc)}
        ${card(U.cards.check)}
        ${card(U.cards.glossary)}
        ${card(U.cards.load)}
      </div>
    </section>

    <p class="seo-disclaimer">${t(U.disclaimer)}</p>
  </section>
  <script type="module">
    import { initUnderstandBill } from "/js/understand-bill.js";
    initUnderstandBill();
  </script>`;

  return layout({
    title: T(lang, U.title),
    description: T(lang, U.description),
    canonical: `${SITE}${enUrl}`,
    lang, page: enUrl, altLangs: VERNACULARS,
    jsonld: [faqLd],
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
  const gloss = nameGloss(discom.name, discom.fullName);
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
    // The Marathi fallbacks carry "ऑनलाइन" where the Hindi ones don't. Without it the two are
    // byte-identical — "स्मार्ट मीटर रिचार्ज" is the same phrase in both languages — and a long
    // DISCOM name (Adani Electricity Mumbai) pushes both past fitTitle's 60-char preferred
    // form onto this fallback, colliding the /hi/ and /mr/ titles.
    [T(lang, { hi: `${cname} स्मार्ट मीटर रिचार्ज`, mr: `${cname} स्मार्ट मीटर ऑनलाइन रिचार्ज`, ta: `${cname} ஸ்மார்ட் மீட்டர் ரீசார்ஜ்`, en: `${cname} Smart Meter Recharge Online` }),
     T(lang, { hi: `${discom.name} स्मार्ट मीटर रिचार्ज`, mr: `${discom.name} स्मार्ट मीटर ऑनलाइन रिचार्ज`, ta: `${discom.name} ஸ்மார்ட் மீட்டர் ரீசார்ஜ்`, en: `${cname} Smart Meter Recharge` })]);
  const description = T(lang, {
    hi: `${discom.name}${gloss} प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करें — आधिकारिक पोर्टल, UPI/BBPS के तरीक़े${dr ? `, और ₹500 में लगभग कितनी यूनिट मिलती हैं (${rupee(dr.min)}–${rupee(dr.max)}/यूनिट दर पर)` : ''}। कम बैलेंस व कटौती के नियम भी।`,
    mr: `${discom.name}${gloss} प्रीपेड स्मार्ट मीटर ऑनलाइन रिचार्ज करा — अधिकृत पोर्टल, UPI/BBPS पद्धती${dr ? `, आणि ₹500 मध्ये अंदाजे किती युनिट मिळतात (${rupee(dr.min)}–${rupee(dr.max)}/युनिट दराने)` : ''}. कमी बॅलन्स व खंडित होण्याचे नियमही.`,
    ta: `${discom.name}${gloss} ப்ரீபெய்டு ஸ்மார்ட் மீட்டரை ஆன்லைனில் ரீசார்ஜ் செய்யுங்கள் — அதிகாரப்பூர்வ போர்ட்டல், UPI/BBPS விருப்பங்கள்${dr ? `, மேலும் ₹500-க்கு தோராயமாக எத்தனை யூனிட் (${rupee(dr.min)}–${rupee(dr.max)}/யூனிட் விகிதத்தில்)` : ''}. குறைந்த பேலன்ஸ் & துண்டிப்பு விதிகளும்.`,
    en: `Recharge your ${discom.name}${gloss} prepaid smart meter online — official portal, UPI/BBPS options${dr ? `, and roughly how many units ₹500 buys at ${rupee(dr.min)}–${rupee(dr.max)}/unit` : ''}. Plus low-balance and disconnection rules.` });

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
          <!-- span, not a heading — same reasoning as the tariff state directory above. -->
          <span class="seo-dir-state-meta"><span class="seo-dir-state-name">${esc(stateName(state, lang))}</span></span>
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
  { loc: '/electricity-cost-calculator/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/solar-calculator/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/solar-panel-size-calculator/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/solar-battery-backup-calculator/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/ev-charging-calculator/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/tariffs/', priority: '0.8', changefreq: 'monthly' },
  // '/tariffs/states/' is added in buildSitemap() with its Hindi alternate.
  { loc: '/services/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/recharge-calculator/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/sanctioned-load-optimizer/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/solar-subsidy-checker/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/tenant-submeter-calculator/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/smart-meter/amisp-list/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/check-my-bill/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/bill-review/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/bill-review/sample-report/', priority: '0.5', changefreq: 'yearly' },
  { loc: '/methodology/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact/', priority: '0.6', changefreq: 'yearly' },
  { loc: '/privacy/', priority: '0.4', changefreq: 'yearly' },
  { loc: '/cookies/', priority: '0.3', changefreq: 'yearly' },
  { loc: '/install/', priority: '0.6', changefreq: 'yearly' },
  // index,follow + self-canonical + linked from the account nav, so it was already crawlable —
  // it was just never declared. Every other undeclared route (admin/, expert/, login/,
  // my-bills/, profile/, solar/, ev/, usage/) carries noindex or a cross-canonical on purpose.
  // /community/ is deliberately absent: it carries <meta name="robots" content="noindex">
  // until it has content. Listing a noindex URL in the sitemap sends Google two contradictory
  // instructions. Restore this entry and drop the robots tag together, not separately.
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
  urls.push({ loc: '/database/', priority: '0.75', changefreq: 'monthly' });
  // No `langs`: the tracker has no vernacular twin. changefreq monthly is literal here —
  // the underlying FPPA notices are published month by month.
  urls.push({ loc: '/fppa/', priority: '0.85', changefreq: 'monthly' });
  urls.push({ loc: '/fuel-surcharge/', priority: '0.3', changefreq: 'monthly' });
  for (const state of fppaCoverageStates()) {
    const stateSlug = slugify(state);
    urls.push({ loc: `/fppa/${stateSlug}/`, priority: '0.75', changefreq: 'monthly' });
    urls.push({ loc: `/fppa/${stateSlug}/archive/`, priority: '0.65', changefreq: 'monthly' });
    for (const year of fppaArchiveYears(state)) {
      urls.push({ loc: `/fppa/${stateSlug}/${year}/`, priority: '0.55', changefreq: 'monthly' });
    }
  }
  urls.push({ loc: '/tariffs/states/', priority: '0.8', changefreq: 'monthly', langs: [...VERNACULARS] });
  urls.push({ loc: '/smart-meter/', priority: '0.7', changefreq: 'monthly', langs: [...VERNACULARS] });
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

> Free, browser-based electricity bill calculator for India. Covers 65 distribution companies (DISCOMs) across 34 states and union territories with slab-wise energy charges, fixed/demand charges, FPPA fuel surcharge, electricity duty, solar net metering and Time-of-Day billing. Independent — not affiliated with any DISCOM, SERC or government body. Estimates are provisional; official bills come from the DISCOM.

Tariff data is compiled from publicly available tariff orders (FY 2024-25 / 2025-26) and the calculation engine applies each DISCOM's published methodology: slab-wise rates, sanctioned-load-based fixed charges, then surcharges and duty.

## Tools

- [Bill Calculator](${SITE}/): instant provisional electricity bill for any Indian DISCOM with a full slab-wise breakdown
- [Tariff Comparison](${SITE}/compare/): major DISCOMs compared at 200/400/600/1000 units for domestic and commercial
- [Electricity Cost Calculator](${SITE}/electricity-cost-calculator/): estimate monthly kWh and cost from household appliances
- [Rooftop Solar Savings](${SITE}/solar-calculator/): system sizing, payback and net-metering savings
- [EV Charging Cost Calculator](${SITE}/ev-charging-calculator/): cost per charge, per km and monthly charging bill for any EV, with petrol comparison
- [Bill Check](${SITE}/services/#pay): direct links to every DISCOM's official view/pay-bill portal
- [Bill Review by Experts](${SITE}/bill-review/): upload a bill and have a human expert review it (free account)
- [New Connection](${SITE}/services/#new-connection): charges, documents and process per DISCOM
- [Complaint](${SITE}/services/#complaint): DISCOM complaint portals and the 1912 national helpline
- [Smart Meter Recharge](${SITE}/smart-meter-recharge/): per-DISCOM guides to recharging a prepaid smart meter online, with units-per-recharge estimates from real tariff rates
- [Smart Meter Recharge Calculator](${SITE}/recharge-calculator/): how many days a ₹200–₹2000 prepaid recharge lasts on any DISCOM — daily burn rate and ideal monthly recharge from real tariff rates
- [Check My Bill](${SITE}/check-my-bill/): upload a bill photo or PDF, correct what OCR read, and recompute it against the published DISCOM tariff — shows the gap against the printed total and ranks the usual causes
- [Sanctioned Load Optimizer](${SITE}/sanctioned-load-optimizer/): whether your sanctioned load is higher than your recorded demand needs — the right load, the fixed charge at each step and the yearly saving, per DISCOM
- [Tenant Sub-Meter Calculator](${SITE}/tenant-submeter-calculator/): what a landlord's flat per-unit sub-meter rate really costs against the DISCOM tariff — your pro-rata share of the energy charges, your share of the fixed charge, and the monthly and yearly overcharge, with a printable comparison report
- [Solar Subsidy Checker](${SITE}/solar-subsidy-checker/): your PM Surya Ghar rooftop-solar subsidy sized to your bill — the right system size, the exact central subsidy (up to ₹78,000), net cost after subsidy, and estimated yearly savings and payback for your state and DISCOM

## Guides

${GUIDES.map(g => `- [${g.title}](${SITE}/guides/${g.slug}/): ${g.description.split(/\.(?:\s|$)/)[0]}`).join('\n')}

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

// ── service-worker cache version ──────────────────────────────────────────────
// The SW precaches a fixed CORE asset list; when any of those bytes change, every
// visitor must get the new version or they keep serving a stale app shell. Rather
// than hand-bumping `const CACHE = 'discombill-YYYYMMDD-NNN'` on every deploy (easy
// to forget → users stuck on old code), we stamp it here from a content hash of the
// exact files CORE precaches. Same bytes → same hash → no needless cache churn;
// any change → new hash → clean bust on the next visit. Run after writeMinifiedCss()
// so the freshly minified stylesheet is included in the hash.
function stampServiceWorker() {
  const swPath = path.join(ROOT, 'sw.js');
  const sw = fs.readFileSync(swPath, 'utf8');
  // Pull the file paths out of the CORE = [ ... ] array (skip bare-directory entries).
  const coreMatch = sw.match(/const CORE = \[([\s\S]*?)\];/);
  const paths = [...coreMatch[1].matchAll(/'\.\/([^']+)'/g)].map(m => m[1])
    .filter(p => /\.(css|js|mjs|woff2|webmanifest|svg|png|html)$/.test(p));
  const hash = crypto.createHash('sha256');
  let hashed = 0;
  for (const rel of paths.sort()) {                 // sort → order-independent
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) { hash.update(rel + '\0'); hash.update(fs.readFileSync(abs)); hashed++; }
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const version = `discombill-${date}-${hash.digest('hex').slice(0, 8)}`;
  const updated = sw.replace(/const CACHE = '[^']*';/, `const CACHE = '${version}';`);
  if (updated !== sw) fs.writeFileSync(swPath, updated, 'utf8');
  return { version, hashed };
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
    ['Solar Savings Calculator', 'सोलर बचत कैलकुलेटर', '/solar-calculator/', 'rooftop solar net metering pm surya ghar'],
    ['Solar Panel Size Calculator', 'सोलर पैनल साइज़ कैलकुलेटर', '/solar-panel-size-calculator/', 'solar panel size kw ac roof area panels count'],
    ['Solar Battery Backup Calculator', 'सोलर बैटरी बैकअप कैलकुलेटर', '/solar-battery-backup-calculator/', 'battery backup inverter lifepo4 lead acid power cut'],
    ['EV Charging Cost Calculator', 'EV चार्जिंग लागत कैलकुलेटर', '/ev-charging-calculator/', 'ev electric vehicle charging cost per km nexon ather petrol comparison'],
    ['Electricity Cost Calculator', 'बिजली लागत कैलकुलेटर', '/electricity-cost-calculator/', 'appliance electricity cost usage estimator units consumption kwh'],
    ['Bill Check', 'बिल जांच', '/bill-check/', 'verify bill overcharge audit'],
    ['Expert Bill Review', 'विशेषज्ञ बिल समीक्षा', '/services/', 'services expert review complaint help'],
    ['New Connection Guide', 'नया कनेक्शन गाइड', '/services/#new-connection', 'apply new electricity connection documents'],
    ['Complaint Letter Generator', 'शिकायत पत्र जनरेटर', '/complaint/', 'complaint letter discom forum grievance'],
    ['All Guides', 'सभी गाइड', '/guides/', 'guides articles help'],
    ['Billing Glossary', 'बिलिंग शब्दावली', '/glossary/', 'terms definitions glossary'],
    ['All States & DISCOMs', 'सभी राज्य और डिस्कॉम', '/tariffs/states/', 'tariff directory states list'],
    ['Smart Meter Recharge', 'स्मार्ट मीटर रिचार्ज', '/smart-meter-recharge/', 'prepaid smart meter recharge online balance'],
    ['Smart Meter Recharge Calculator', 'स्मार्ट मीटर रिचार्ज कैलकुलेटर', '/recharge-calculator/', 'recharge days last how long 500 prepaid balance calculator'],
    ['Check My Bill', 'मेरा बिल जांचें', '/check-my-bill/', 'upload bill photo pdf ocr scan check verify recompute overcharge audit'],
    ['Sanctioned Load Optimizer', 'स्वीकृत भार ऑप्टिमाइज़र', '/sanctioned-load-optimizer/', 'sanctioned load reduce fixed charge kw contracted demand md maximum demand optimizer'],
    ['Solar Subsidy Checker', 'सोलर सब्सिडी चेकर (PM सूर्य घर)', '/solar-subsidy-checker/', 'pm surya ghar rooftop solar subsidy muft bijli yojana system size payback kw 78000 eligibility'],
    ['Tenant Sub-Meter Calculator', 'किरायेदार सब-मीटर कैलकुलेटर', '/tenant-submeter-calculator/', 'tenant landlord submeter sub meter overcharging flat rate per unit pg rent electricity split share'],
    ['Tariff Database', 'टैरिफ डेटाबेस', '/database/', 'structured tariff database discom residential electricity slabs fixed charge duty fppa subsidy source'],
    ['Fuel Surcharge Tracker', 'ईंधन अधिभार ट्रैकर', '/fppa/', 'fppa fppas ppac fac fuel surcharge fuel power purchase adjustment current rate this month uppcl derc delhi rajasthan monthly history bill increase'],
    ['Methodology', 'कार्यप्रणाली', '/methodology/', 'how rates verified sources'],
    ['Cookie Policy', 'कुकी नीति', '/cookies/', 'cookies cookie policy tracking analytics ga consent local storage banner'],
    ['Privacy Policy', 'गोपनीयता नीति', '/privacy/', 'privacy policy data dpdp personal information cookies analytics delete my data gdpr'],
    ['Contact', 'संपर्क करें', '/contact/', 'contact email get in touch report wrong tariff rate correction feedback partnership press support help'],
    ['Install offline app', 'ऑफ़लाइन ऐप इंस्टॉल करें', '/install/', 'install app pwa offline home screen android ios iphone desktop add to home screen download apk play store'],
  ].forEach(([t, h, u, k]) => entries.push({ t, h, u, k, g: 'tool' }));

  for (const state of fppaCoverageStates()) {
    const stateSlug = slugify(state);
    const mechanism = fppaMechanismName(state);
    entries.push({
      t: `${state} ${mechanism} Archive`,
      u: `/fppa/${stateSlug}/archive/`,
      k: `${state} ${mechanism} historical archive surcharge old rates history fppa fppas ppac fac`,
      g: 'tool',
    });
    for (const year of fppaArchiveYears(state)) {
      entries.push({
        t: `${state} ${mechanism} History ${year}`,
        u: `/fppa/${stateSlug}/${year}/`,
        k: `${state} ${mechanism} ${year} surcharge history old bill archive rates`,
        g: 'tool',
      });
    }
  }

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
    // State pages shipped with NO keywords, so the abbreviation everyone actually types
    // could not reach them: "UP" returned Uttarakhand's UPCL and four UPPCL guides but
    // never Uttar Pradesh, and "MP"/"TN"/"WB" never returned their state page at all.
    // `a` is the abbreviation, scored as an exact match so it outranks a title that merely
    // starts with the same two letters. The DISCOM names ride along in `k` so searching a
    // utility ("MVVNL") also offers the state it belongs to.
    entries.push({
      t: `${state} Electricity Tariff`, h: `${hiState(state)} बिजली टैरिफ`,
      u: `/tariffs/${stateSlug}/`, hu: `/hi/tariffs/${stateSlug}/`,
      a: stateCode(state),
      k: [stateCode(state), ...(STATE_ALIASES[state] || []),
        ...getDiscoms(state).flatMap(d => [d.name, ...discomAliases(d)])]
        .filter(Boolean).join(' '),
      g: 'tariff',
    });
    for (const discom of getDiscoms(state)) {
      entries.push({
        t: `${discom.name} Tariff`,
        u: `/tariffs/${stateSlug}/${discom.id}/`, hu: `/hi/tariffs/${stateSlug}/${discom.id}/`,
        k: [discom.fullName, discom.area, state, ...discomAliases(discom)].filter(Boolean).join(' '),
        g: 'tariff',
      });
      entries.push({
        t: `${discom.name} Smart Meter Recharge`,
        u: `/smart-meter-recharge/${stateSlug}/${discom.id}/`, hu: `/hi/smart-meter-recharge/${stateSlug}/${discom.id}/`,
        k: [discom.fullName, state, 'prepaid recharge online', ...discomAliases(discom)].filter(Boolean).join(' '),
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
  const tariffDatabase = buildTariffDatabase({ quiet: true });
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

    emitPage(`${p}smart-meter`, smartMeterGuidePage(lang));
    emitPage(`${p}smart-meter-recharge`, smartMeterHubPage(states, lang));
    pages++;

    // English-only (see the note on fuelSurchargePage) — emitted once, not per language.
    if (lang === 'en') {
      emitPage('database', tariffDatabasePage(tariffDatabase.summary, tariffDatabase.db.states));
      pages++;
      emitPage('fppa', fuelSurchargePage());
      pages++;
      emitPage('fuel-surcharge', fuelSurchargePage({ url: '/fuel-surcharge/', canonicalUrl: '/fppa/' }));
      pages++;
      for (const state of fppaCoverageStates()) {
        emitPage(`fppa/${slugify(state)}`, fppaStatePage(state));
        pages++;
        emitPage(`fppa/${slugify(state)}/archive`, fppaArchivePage(state));
        pages++;
        for (const year of fppaArchiveYears(state)) {
          emitPage(`fppa/${slugify(state)}/${year}`, fppaArchiveYearPage(state, year));
          pages++;
        }
      }
    }
    emitPage(`${p}understand-your-bill`, understandBillPage(lang));
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
  fs.writeFileSync(path.join(ROOT, '404.html'), notFoundPage(), 'utf8');
  const searchEntries = writeSearchIndex(states);
  const cssKb = writeMinifiedCss();
  // Must run after the pages are on disk: it reads their markup to decide what to keep.
  const content = buildContentCss({ quiet: true });
  const sw = stampServiceWorker();

  console.log(`SEO: generated ${pages} landing pages across ${states.length} states, plus sitemap.xml + robots.txt + llms.txt + search-index.js (${searchEntries} entries) + styles.min.css (${cssKb}) + content.min.css (${(content.bytes/1024).toFixed(0)} KB) + sw ${sw.version} (${sw.hashed} assets)`);
  return { pages, states: states.length };
}

// Allow running directly: `node generate-seo.js`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateSeo();
}
