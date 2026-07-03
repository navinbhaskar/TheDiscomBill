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
import { fileURLToPath } from 'url';

import { TARIFF_DB, STATE_META, getStates, getDiscoms } from './js/tariffs/registry.js';
import { calculateBill } from './js/engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SITE = 'https://www.thediscombill.com';
const TODAY = new Date().toISOString().slice(0, 10);

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
      <a href="/#calculator">Calculator</a>
      <div class="nav-dropdown" id="quickLinksDropdown">
        <button type="button" class="nav-dropdown-trigger" id="quickLinksTrigger" aria-haspopup="true" aria-expanded="false">
          Quick Links
          <svg class="nav-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="nav-dropdown-menu" id="quickLinksMenu" role="menu">
          <a href="/compare/" class="nav-dropdown-item" role="menuitem">Major DISCOM Tariff Comparison</a>
          <a href="/usage/" class="nav-dropdown-item" role="menuitem">Usage Estimator</a>
          <a href="/solar/" class="nav-dropdown-item" role="menuitem">Rooftop Solar Savings</a>
          <a href="/tariffs/" class="nav-dropdown-item" role="menuitem">Electricity Tariff Page</a>
          <a href="/tariffs/states/" class="nav-dropdown-item" role="menuitem">All States &amp; DISCOMs Directory</a>
          <a href="/bill-check/" class="nav-dropdown-item" role="menuitem">Bill Check</a>
          <a href="/bill-review/" class="nav-dropdown-item" role="menuitem">Bill Review by Experts</a>
          <a href="/new-connection/" class="nav-dropdown-item" role="menuitem">New Connection Charges &amp; Process</a>
          <a href="/complaint/" class="nav-dropdown-item" role="menuitem">Register Electricity Complaint</a>
        </div>
      </div>
      <a href="/#about">About</a>
      <button type="button" id="themeToggle" class="theme-toggle" aria-label="Switch theme" title="Toggle light / dark theme">☾</button>
    </nav>
  </div>
</header>`;

const FOOTER = `
<footer>
  <div class="container">
    <p>&copy; 2026 TheDiscomBill. All rights reserved. &nbsp;|&nbsp; <a href="/#about">Disclaimer</a> &nbsp;|&nbsp; <a href="/tariffs/states/">All States &amp; DISCOMs</a></p>
  </div>
</footer>`;

// ── page layout ───────────────────────────────────────────────────────────────
function layout({ title, description, canonical, jsonld = [], body }) {
  const ld = jsonld.filter(Boolean)
    .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
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
    })();
  </script>
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="canonical" href="${attr(canonical)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TheDiscomBill">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:image" content="${SITE}/icon-512.png">
  <meta property="og:locale" content="en_IN">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(description)}">
  <meta name="twitter:image" content="${SITE}/icon-512.png">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  ${ld}
</head>
<body>
${HEADER}
<div class="page-body">
${body}
</div>
${FOOTER}
<script type="module" src="/js/main.js"></script>
</body>
</html>
`;
}

function breadcrumbs(trail) {
  // trail: [{name, url|null}]
  const items = trail.map((t, i) => {
    const inner = t.url ? `<a href="${attr(t.url)}">${esc(t.name)}</a>` : `<span aria-current="page">${esc(t.name)}</span>`;
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

function faqHtml(faqs) {
  if (!faqs.length) return '';
  const items = faqs.map(f => `
    <details class="seo-faq-item">
      <summary>${esc(f.q)}</summary>
      <div class="seo-faq-a">${f.a}</div>
    </details>`).join('');
  return `<section class="seo-section"><h2>Frequently asked questions</h2>${items}</section>`;
}

// ── tariff renderers (static, ported from tariff-explorer.js) ─────────────────
function slabRange(prev, limit) {
  if (limit === Infinity || limit == null) return `Above ${prev.toLocaleString('en-IN')}`;
  if (prev === 0) return `0 – ${limit.toLocaleString('en-IN')}`;
  return `${prev.toLocaleString('en-IN')} – ${limit.toLocaleString('en-IN')}`;
}
function energySlabsHtml(slabs) {
  if (!Array.isArray(slabs) || !slabs.length) return '<p class="tx-muted">Not specified.</p>';
  let prev = 0;
  const rows = slabs.map(s => {
    const range = slabRange(prev, s.limit);
    prev = (s.limit === Infinity || s.limit == null) ? prev : s.limit;
    const note = s.label ? ` <span class="tx-muted">(${esc(s.label)})</span>` : '';
    return `<tr><td>${range} <span class="tx-muted">units</span>${note}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">/unit</span></td></tr>`;
  }).join('');
  return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
}
function fixedChargeHtml(fc) {
  if (fc == null) return '<span class="tx-muted">—</span>';
  if (typeof fc === 'number') return `<strong>${rupee(fc)}</strong> <span class="tx-muted">/ month (flat)</span>`;
  if (fc.type === 'per_kw')  return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kW / month</span>`;
  if (fc.type === 'per_kva') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ kVA / month</span>`;
  if (fc.type === 'flat')    return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ month (flat)</span>`;
  if (fc.type === 'tiered' && Array.isArray(fc.slabs)) {
    const rows = fc.slabs.map(s => {
      const label = s.label || (s.maxLoad === Infinity ? 'Above limit' : `Up to ${s.maxLoad} kW`);
      return `<tr><td>${esc(label)}</td><td class="num">${rupee(s.rate)}<span class="tx-muted">/mo</span></td></tr>`;
    }).join('');
    return `<table class="tariff-slab-table"><tbody>${rows}</tbody></table>`;
  }
  if (typeof fc.rate === 'number') return `<strong>${rupee(fc.rate)}</strong> <span class="tx-muted">/ month</span>`;
  return '<span class="tx-muted">—</span>';
}
function additionalChargesHtml(arr) {
  if (!Array.isArray(arr) || !arr.length) return '';
  const items = arr.map(a => {
    const isPct = a.type && String(a.type).includes('percent');
    const val = isPct ? `${a.rate}%` : rupee(a.rate);
    return `<li><span>${esc(a.name || 'Charge')}</span><strong>${val}</strong></li>`;
  }).join('');
  return `<div class="tariff-field"><div class="tariff-field-label">Additional charges</div><ul class="tariff-addl">${items}</ul></div>`;
}
function tariffBlockHtml(obj) {
  return `
    <div class="tariff-block">
      <div class="tariff-field">
        <div class="tariff-field-label">Fixed charge</div>
        <div class="tariff-field-value">${fixedChargeHtml(obj.fixedCharge)}</div>
      </div>
      <div class="tariff-field">
        <div class="tariff-field-label">Energy charges</div>
        ${energySlabsHtml(obj.energySlabs)}
      </div>
      ${additionalChargesHtml(obj.additionalCharges)}
    </div>`;
}
function categoryCardHtml(cat) {
  const hasSupplyTypes = Array.isArray(cat.supplyTypes) && cat.supplyTypes.length > 0;
  let body;
  if (hasSupplyTypes) {
    body = cat.supplyTypes.map(st => `
      <div class="tariff-supplytype">
        <div class="tariff-st-name">${esc(st.name || st.id)}</div>
        ${st.description ? `<p class="tariff-st-desc">${esc(st.description)}</p>` : ''}
        ${tariffBlockHtml(st)}
      </div>`).join('');
  } else {
    body = tariffBlockHtml(cat);
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
function indicativeBillsHtml(state, discom) {
  const cat = domesticCategory(discom);
  if (!cat) return '';
  const load = 2;            // assume a typical 2 kW domestic sanctioned load
  const levels = [100, 200, 300, 500];
  const rows = [];
  for (const units of levels) {
    try {
      const r = calculateBill({ discomId: discom.id, categoryId: cat.id, units, connectedLoadKw: load });
      if (r && !r.error && r.totalPayable != null) {
        rows.push(`<tr><td>${units.toLocaleString('en-IN')} units</td><td class="num">${rupee(r.totalPayable)}</td></tr>`);
      }
    } catch (e) { /* skip a level that the engine can't price */ }
  }
  if (!rows.length) return '';
  return `
    <section class="seo-section">
      <h2>Indicative monthly bill — ${esc(discom.name)}</h2>
      <p>Estimated total monthly bill for a domestic (${esc(cat.name)}) connection at a ${load} kW sanctioned load, computed with the same engine as our calculator. Actual bills vary with your sub-category, fixed/fuel charges and local duties.</p>
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr><th>Monthly consumption</th><th class="num">Estimated bill</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>
      <p class="seo-cta-row"><a class="seo-cta" href="/?state=${encodeURIComponent(state)}&amp;discom=${encodeURIComponent(discom.id)}#calculator">Calculate my exact ${esc(discom.name)} bill →</a></p>
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

function areaServedHtml(discom) {
  const { region, cities } = parseArea(discom.area);
  if (!region && !cities.length) return '';
  const lead = cities.length
    ? `${esc(discom.name)} (${esc(discom.fullName || discom.name)}) distributes electricity across ${region ? esc(region) : 'its licensed area'}, serving ${cities.length} key district${cities.length > 1 ? 's' : ''} and town${cities.length > 1 ? 's' : ''} including ${esc(cities.slice(0, 4).join(', '))}${cities.length > 4 ? ' and more' : ''}.`
    : `${esc(discom.name)} distributes electricity across ${esc(region)}.`;
  const chips = cities.length
    ? `<div class="seo-area-chips">${cities.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : '';
  return `
    <section class="seo-section">
      <h2>Areas served by ${esc(discom.name)}</h2>
      <p>${lead}</p>
      ${chips}
    </section>`;
}

function keyFactsHtml(state, discom, fy) {
  const { region, cities } = parseArea(discom.area);
  const dr = domesticRates(discom);
  const rows = [];
  rows.push(['Distribution company', esc(discom.fullName || discom.name)]);
  rows.push(['Short name', esc(discom.name)]);
  rows.push(['State / UT', esc(state)]);
  if (region) rows.push(['Service region', esc(region)]);
  if (cities.length) rows.push(['Districts / cities served', esc(cities.length) + '+ — ' + esc(cities.slice(0, 6).join(', ')) + (cities.length > 6 ? '…' : '')]);
  rows.push(['Tariff year', esc(fy)]);
  if (dr) rows.push(['Domestic energy rate', `${rupee(dr.min)} – ${rupee(dr.max)} per unit`]);
  if (discom.lpscRate != null) rows.push(['Late payment surcharge (LPSC)', `${discom.lpscRate}% per month`]);
  if (discom.website) rows.push(['Official website', `<a href="${attr(discom.website)}" target="_blank" rel="noopener">${esc(String(discom.website).replace(/^https?:\/\//, ''))} ↗</a>`]);
  return `
    <section class="seo-section">
      <h2>${esc(discom.name)} at a glance</h2>
      <table class="seo-facts"><tbody>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
    </section>`;
}

// ── page builders ─────────────────────────────────────────────────────────────
function discomPage(state, discom) {
  const stateSlug = slugify(state);
  const url = `/tariffs/${stateSlug}/${discom.id}/`;
  const meta = STATE_META[state] || {};
  const fy = discom.tariffYear || 'FY 2025-26';
  const long = discom.fullName || discom.name;
  const { region, cities } = parseArea(discom.area);
  const dr = domesticRates(discom);
  const shared = sharesScheduleInState(state, discom);
  const cityPhrase = cities.length ? cities.slice(0, 3).join(', ') : region;

  // Deterministic phrasing variation (keyed off the DISCOM) so titles/intros aren't a single
  // repeated template across 65 pages — each one is differently worded but factually identical.
  const seed = discom.id + state;
  const title = variant(seed, [
    `${discom.name} Electricity Bill Calculator & Tariff ${fy} — ${state} | TheDiscomBill`,
    `${discom.name} Bill Calculator ${fy}${region ? ` (${region})` : ''} — ${state} Tariff | TheDiscomBill`,
    `${discom.name} (${long}) Electricity Tariff & Bill Estimate ${fy} | TheDiscomBill`,
  ]);
  const description = variant(seed + 'd', [
    `Calculate your ${discom.name} (${long}) electricity bill for ${fy}${cityPhrase ? ` in ${cityPhrase}` : ''}. Slab-wise rates, fixed charges, FPPA & duties.${dr ? ` Domestic from ${rupee(dr.min)}/unit.` : ''} Free, no sign-up.`,
    `${discom.name} electricity bill calculator for ${state}${cityPhrase ? ` (${cityPhrase})` : ''}. ${fy} domestic & commercial slab rates, fixed/demand charges and an instant itemised estimate.`,
    `Free ${discom.name} bill estimate (${fy})${cityPhrase ? ` for ${cityPhrase} and across ${region || state}` : ''}. See the full tariff schedule, indicative monthly bills and pay-bill portal.`,
  ]);
  const h1 = variant(seed + 'h', [
    `${esc(discom.name)} Electricity Bill Calculator &amp; Tariff (${esc(fy)})`,
    `${esc(discom.name)} Bill Calculator &amp; ${esc(fy)} Tariff${region ? ` — ${esc(region)}` : ''}`,
    `${esc(discom.name)} (${esc(long)}) — Electricity Bill &amp; Tariff ${esc(fy)}`,
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

    ${keyFactsHtml(state, discom, fy)}
    ${areaServedHtml(discom)}
    ${indicativeBillsHtml(state, discom)}

    <section class="seo-section">
      <h2>${esc(discom.name)} tariff schedule (${esc(fy)})</h2>
      ${sharedNote}
      <div class="tariff-cards">${cards}</div>
    </section>

    ${siblingHtml}
    ${faqHtml(faqs)}
    <p class="seo-disclaimer">Figures are provisional estimates built on publicly available ${esc(state)} tariff orders. Always verify against your official ${esc(discom.name)} bill — rates vary by sub-category, slab and city.</p>
  </section>`;

  return layout({
    title, description, canonical: SITE + url,
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

function statePage(state) {
  const stateSlug = slugify(state);
  const url = `/tariffs/${stateSlug}/`;
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

  const title = variant(seed, [
    `${state} Electricity Bill Calculator & DISCOM Tariffs ${fy} | TheDiscomBill`,
    `${state} Electricity Tariff ${fy} — Bill Calculator for ${names} | TheDiscomBill`,
    `Electricity Bill Calculator for ${state} (${fy}) — All ${discoms.length} DISCOM${discoms.length > 1 ? 's' : ''} | TheDiscomBill`,
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
    title, description, canonical: SITE + url,
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

function directoryPage(states) {
  const url = '/tariffs/states/';
  const title = 'All Indian Electricity DISCOMs & Tariffs — State Directory | TheDiscomBill';
  const description = 'Browse electricity tariffs and bill calculators for every Indian state and union territory. 70+ DISCOMs, slab-wise rates, fixed charges and FPPA — all in one directory.';

  let totalDiscoms = 0;
  const sections = states.map(state => {
    const stateSlug = slugify(state);
    const discoms = getDiscoms(state);
    totalDiscoms += discoms.length;
    const links = discoms.map(d => `<a href="/tariffs/${stateSlug}/${d.id}/">${esc(d.name)}</a>`).join('');
    return `
      <div class="seo-dir-state">
        <h2><a href="/tariffs/${stateSlug}/">${esc(state)}</a></h2>
        <div class="seo-dir-discoms">${links}</div>
      </div>`;
  }).join('');

  const body = `
  <section class="seo-page container">
    ${breadcrumbs([
      { name: 'Home', url: '/' },
      { name: 'Tariffs Directory', url: null },
    ])}
    <h1>Electricity Tariffs &amp; Bill Calculators — All States &amp; DISCOMs</h1>
    <p class="seo-lead">Pick your state to open its electricity bill calculator and tariff schedule, or jump straight to your distribution company. Covering ${states.length} states &amp; UTs and ${totalDiscoms}+ DISCOMs across India.</p>
    <div class="seo-directory">${sections}</div>
  </section>`;

  return layout({
    title, description, canonical: SITE + url,
    jsonld: [breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Tariffs Directory', url }])],
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
  { loc: '/tariffs/states/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/bill-check/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/bill-review/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/new-connection/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/complaint/', priority: '0.6', changefreq: 'monthly' },
];

function buildSitemap(states) {
  const urls = [...STATIC_ROUTES.map(r => ({ ...r }))];
  for (const state of states) {
    const stateSlug = slugify(state);
    urls.push({ loc: `/tariffs/${stateSlug}/`, priority: '0.7', changefreq: 'monthly' });
    for (const d of getDiscoms(state)) {
      urls.push({ loc: `/tariffs/${stateSlug}/${d.id}/`, priority: '0.6', changefreq: 'monthly' });
    }
  }
  const body = urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

// ── run ───────────────────────────────────────────────────────────────────────
export function generateSeo() {
  const states = getStates();
  let pages = 0;

  writePage('tariffs/states', directoryPage(states));
  pages++;

  for (const state of states) {
    const stateSlug = slugify(state);
    writePage(`tariffs/${stateSlug}`, statePage(state));
    pages++;
    for (const discom of getDiscoms(state)) {
      writePage(`tariffs/${stateSlug}/${discom.id}`, discomPage(state, discom));
      pages++;
    }
  }

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(states), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), ROBOTS, 'utf8');

  console.log(`SEO: generated ${pages} landing pages across ${states.length} states, plus sitemap.xml + robots.txt`);
  return { pages, states: states.length };
}

// Allow running directly: `node generate-seo.js`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateSeo();
}
