// js/alerts-data.js
// Public, site-wide alerts derived from the tariff records we already maintain.
// Adding an order to orders.js or a surcharge row to fppa.js automatically creates
// an alert here; there is no user-specific notification state in this module.

import { DISCOM_INDEX, DISCOM_STATE, STATES } from './tariffs/index.js';
import { ORDERS, ORDER_TYPES } from './tariffs/orders.js';
import { FPPA_BY_DISCOM, FPPA_BY_STATE } from './tariffs/fppa.js';
import { surchargeLabel } from './tariffs/surcharge-terms.js';

export const ALERT_CATEGORIES = [
  'Fuel surcharge',
  'Tariff',
  'Connection',
  'Subsidy',
  'Policy',
  'True-up',
];

const typeCategory = {
  'fuel-surcharge': 'Fuel surcharge',
  'tariff-order': 'Tariff',
  'myt-order': 'Tariff',
  'true-up-order': 'True-up',
  'amendment': 'Policy',
  'subsidy': 'Subsidy',
};

const MONTH_FMT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const MONTH_ONLY_FMT = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function dateValue(iso) {
  if (!iso) return 0;
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(t) ? t : 0;
}

// Both helpers guard on getTime(), NOT on the Date object: Number.isNaN(dateObject) does not
// coerce and is therefore always false, so the guard never fired and Intl.format() threw a
// RangeError on any malformed value. These dates come from hand-edited data files, and one
// typo in orders.js would otherwise take out the whole alerts render.
const isValidDate = (d) => !Number.isNaN(d.getTime());

export function formatAlertDate(iso) {
  if (!iso) return 'Date not recorded';
  const d = new Date(`${iso}T00:00:00Z`);
  return isValidDate(d) ? MONTH_FMT.format(d) : iso;
}

function formatMonth(iso) {
  if (!iso) return 'current period';
  const d = new Date(`${iso}T00:00:00Z`);
  return isValidDate(d) ? MONTH_ONLY_FMT.format(d) : iso;
}

function rateLabel(entry) {
  if (!entry || !Number.isFinite(entry.rate)) return 'rate recorded';
  if (entry.mode === 'percent') return `${entry.rate > 0 ? '+' : ''}${entry.rate.toFixed(2)}%`;
  if (entry.rateRange) return entry.rateRange.replace('₹', 'Rs ');
  return `Rs ${Number(entry.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/unit`;
}

function discomName(id) {
  const state = DISCOM_STATE[id];
  const discom = state && (DISCOM_INDEX[state] || []).find((d) => d.id === id);
  return discom?.name || id.toUpperCase();
}

function sourceHost(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

function sourceFor(entry, fallbackUrl = '') {
  return {
    name: entry.source || entry.regulator || sourceHost(entry.sourceUrl || fallbackUrl) || 'Official source',
    url: entry.sourceUrl || fallbackUrl || '',
  };
}

function orderSummary(order) {
  const type = ORDER_TYPES[order.type]?.label || 'Public order';
  const eff = order.effectiveFrom ? `effective from ${formatAlertDate(order.effectiveFrom)}` : 'effective date not recorded yet';
  const discoms = (order.discomIds || []).map(discomName);
  const bound = discoms.length ? ` Covers ${discoms.slice(0, 2).join(', ')}${discoms.length > 2 ? ` +${discoms.length - 2} more` : ''}.` : '';
  const note = order.notes ? ` ${order.notes}` : '';
  return `${type} ${eff}.${bound}${note}`.replace(/\s+/g, ' ').trim();
}

function orderCategory(order) {
  const text = [order.title, order.notes, order.type].filter(Boolean).join(' ');
  if (/connection|metering|meter|security deposit|sanctioned load|service line/i.test(text)) return 'Connection';
  return typeCategory[order.type] || 'Policy';
}

function orderAlert(order) {
  const date = order.orderDate || order.effectiveFrom || order.effectiveTo || null;
  return {
    id: `order-${order.id}`,
    title: order.title,
    state: order.state,
    discoms: (order.discomIds || []).map(discomName),
    category: orderCategory(order),
    severity: order.type === 'fuel-surcharge' ? 'Important' : 'Info',
    publishedDate: date,
    effectiveDate: order.effectiveFrom || null,
    summary: orderSummary(order),
    sourceName: order.regulator || sourceHost(order.sourceUrl) || 'Official source',
    sourceUrl: order.sourceUrl || '',
    href: `/orders/${order.id}/`,
    sortDate: dateValue(date),
  };
}

function surchargeImpact(entry) {
  if (!Number.isFinite(entry.rate)) return 'Check the notified value before estimating a bill.';
  if (entry.rate < 0) return 'This is a credit entry and may reduce affected bills.';
  if (entry.rate === 0) return 'No extra surcharge is recorded for this period.';
  return 'This may add to affected bills for the period.';
}

function surchargeAlert(scope, key, entry) {
  const state = scope === 'state' ? key : DISCOM_STATE[key];
  const name = scope === 'state' ? state : discomName(key);
  const mechanism = surchargeLabel(state);
  const period = entry.to
    ? `${formatMonth(entry.from)} to ${formatMonth(entry.to)}`
    : `${formatMonth(entry.from)} onward`;
  const src = sourceFor(entry);
  return {
    id: `surcharge-${scope}-${String(key).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${entry.from}`,
    title: `${name} ${mechanism} ${rateLabel(entry)}`,
    state,
    discoms: scope === 'discom' ? [name] : [],
    category: 'Fuel surcharge',
    severity: Math.abs(Number(entry.rate) || 0) >= 10 || entry.to == null ? 'Important' : 'Info',
    publishedDate: entry.orderDate || entry.verifiedOn || entry.from,
    effectiveDate: entry.from,
    summary: `${entry.label || `${mechanism} notice`} applies ${period}. ${surchargeImpact(entry)}`,
    sourceName: src.name,
    sourceUrl: src.url,
    href: state ? `/fppa/${String(state).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/` : '/fppa/',
    sortDate: dateValue(entry.orderDate || entry.verifiedOn || entry.from),
  };
}

export function getPublicAlerts() {
  const alerts = [
    ...ORDERS.map(orderAlert),
    ...Object.entries(FPPA_BY_STATE).flatMap(([state, list]) => list.map((entry) => surchargeAlert('state', state, entry))),
    ...Object.entries(FPPA_BY_DISCOM).flatMap(([id, list]) => list.map((entry) => surchargeAlert('discom', id, entry))),
  ];
  return alerts
    .filter((a) => a.state && a.title)
    .sort((a, b) => b.sortDate - a.sortDate || a.title.localeCompare(b.title));
}

export function getAlertSummary(alerts = getPublicAlerts()) {
  const states = new Set(alerts.map((a) => a.state).filter(Boolean));
  const important = alerts.filter((a) => a.severity === 'Important').length;
  return {
    total: alerts.length,
    states: states.size,
    important,
    latestDate: alerts[0]?.publishedDate || null,
    categories: ALERT_CATEGORIES.map((category) => ({
      category,
      count: alerts.filter((a) => a.category === category).length,
    })).filter((x) => x.count),
  };
}

// The categories that ACTUALLY occur, for filter UIs. ALERT_CATEGORIES is the full vocabulary
// and stays exported for classification, but only three of the six order types in orders.js are
// in use today, so four of those six could never match an alert — offering them as filter
// options meant four guaranteed-empty results.
export function getUsedAlertCategories(alerts = getPublicAlerts()) {
  const seen = new Set(alerts.map((a) => a.category));
  return ALERT_CATEGORIES.filter((c) => seen.has(c));
}

export function getAlertStates() {
  const withAlerts = new Set(getPublicAlerts().map((a) => a.state));
  return STATES.filter((state) => withAlerts.has(state));
}
