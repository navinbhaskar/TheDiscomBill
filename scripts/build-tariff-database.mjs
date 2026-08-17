// scripts/build-tariff-database.mjs
// Builds the internal structured residential/commercial tariff database from the same
// verified tariff modules used by the calculator and SEO pages.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TARIFF_DB, STATE_META, ensureAll, getStates, getDiscoms } from '../js/tariffs/registry.js';
import { FPPA_BY_STATE, FPPA_BY_DISCOM, pick as pickFppa } from '../js/tariffs/fppa.js';
import { DOMESTIC_SUBSIDY } from '../js/tariffs/subsidy.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(OUT_DIR, 'tariff-database.json');
const SUMMARY_PATH = path.join(OUT_DIR, 'tariff-database-summary.json');
const TODAY = new Date().toISOString().slice(0, 10);

function cleanNumber(n) {
  if (typeof n !== 'number') return n;
  if (!Number.isFinite(n)) return null;
  return n;
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== 'object') return cleanNumber(value);
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'function' || typeof v === 'undefined') continue;
    out[k] = sanitize(v);
  }
  return out;
}

function normalizeSlabs(slabs = []) {
  return slabs.map((s) => ({
    ...sanitize(s),
    limit: Object.hasOwn(s, 'limit') ? cleanNumber(s.limit) : undefined,
    maxLoad: Object.hasOwn(s, 'maxLoad') ? cleanNumber(s.maxLoad) : undefined,
    unbounded: s.limit === Infinity || s.maxLoad === Infinity,
  }));
}

function normalizeFixedCharge(fc) {
  if (fc == null) return null;
  if (typeof fc === 'number') return { type: 'flat', rate: fc, unit: 'month' };
  const out = sanitize(fc);
  if (Array.isArray(fc.slabs)) out.slabs = normalizeSlabs(fc.slabs);
  return out;
}

function normalizeAdditionalCharges(charges = []) {
  return charges.map((c) => sanitize(c));
}

function pickElectricityDuty(charges = []) {
  return charges.filter((c) => /electricity\s+duty|\bED\b|duty/i.test(c.name || '')).map(sanitize);
}

function pickMeterCharges(tariff, charges = []) {
  const fromCharges = charges.filter((c) => /meter|rent/i.test(c.name || '')).map(sanitize);
  if (tariff.meterCharge != null) fromCharges.push(sanitize(tariff.meterCharge));
  return fromCharges;
}

function subsidyFor(state, category, tariff) {
  const schemes = [];
  if (category?.id === 'domestic' && DOMESTIC_SUBSIDY[state]) schemes.push(sanitize(DOMESTIC_SUBSIDY[state]));
  if (Array.isArray(tariff.specialSchemes)) schemes.push(...tariff.specialSchemes.map(sanitize));
  const notes = [category?.notes, tariff?.notes, tariff?.description]
    .filter((s) => /subsidy|rebate|free/i.test(String(s || '')));
  return { schemes, notes };
}

function currentFppaFor(state, discomId) {
  const list = FPPA_BY_DISCOM[discomId] || FPPA_BY_STATE[state] || [];
  return {
    current: sanitize(pickFppa(list, TODAY)),
    history: list.map(sanitize),
  };
}

function tariffSource(stateMeta, discom, tariff) {
  return {
    tariffOrder: tariff.periodLabel || discom.ratesAsOf || stateMeta.ratesAsOf || null,
    sourceUrl: discom.sourceUrl || stateMeta.sourceUrl || null,
    lastVerified: tariff.verifiedOn || discom.verifiedOn || stateMeta.verifiedOn || null,
  };
}

function normalizeTariffVariant({ state, stateMeta, discom, category, tariff, isSupplyType }) {
  const additionalCharges = normalizeAdditionalCharges(tariff.additionalCharges || category.additionalCharges || []);
  const source = tariffSource(stateMeta, discom, tariff);
  return {
    id: tariff.id || category.id,
    name: tariff.name || category.name,
    isSupplyType,
    description: tariff.description || category.description || null,
    effectiveDate: tariff.currentRatesFrom || category.currentRatesFrom || discom.currentRatesFrom || stateMeta.currentRatesFrom || null,
    tariffOrder: source.tariffOrder,
    sourceUrl: source.sourceUrl,
    lastVerified: source.lastVerified,
    slabs: normalizeSlabs(tariff.energySlabs || category.energySlabs || []),
    fixedCharge: normalizeFixedCharge(tariff.fixedCharge ?? category.fixedCharge),
    electricityDuty: pickElectricityDuty(additionalCharges),
    additionalCharges,
    fppaFac: {
      legacyFacPerUnit: tariff.fac ?? category.fac ?? null,
      ...currentFppaFor(state, discom.id),
    },
    subsidy: subsidyFor(state, category, tariff),
    meterCharge: pickMeterCharges(tariff, additionalCharges),
    minimumCharge: sanitize(tariff.minCharge ?? category.minCharge ?? null),
    solarRules: sanitize(tariff.solarRules || category.solarRules || discom.solarRules || stateMeta.solarRules || null),
    previousTariff: sanitize(tariff.rateHistory || []),
    notes: [category.notes, tariff.notes].filter(Boolean),
  };
}

function normalizeCategory({ state, stateMeta, discom, category }) {
  const tariffs = Array.isArray(category.supplyTypes) && category.supplyTypes.length
    ? category.supplyTypes.map((st) => normalizeTariffVariant({ state, stateMeta, discom, category, tariff: st, isSupplyType: true }))
    : [normalizeTariffVariant({ state, stateMeta, discom, category, tariff: category, isSupplyType: false })];
  return {
    id: category.id,
    name: category.name,
    consumerCategory: category.name,
    notes: category.notes || null,
    tariffCount: tariffs.length,
    tariffs,
  };
}

function normalizeDiscom(state, stateMeta, discom) {
  const categories = (discom.categories || []).map((category) => normalizeCategory({ state, stateMeta, discom, category }));
  return {
    state,
    id: discom.id,
    name: discom.name,
    fullName: discom.fullName || null,
    area: discom.area || null,
    website: discom.website || null,
    tariffYear: discom.tariffYear || stateMeta.tariffYear || null,
    effectiveDate: discom.currentRatesFrom || stateMeta.currentRatesFrom || null,
    ratesAsOf: discom.ratesAsOf || stateMeta.ratesAsOf || null,
    tariffOrder: discom.ratesAsOf || stateMeta.ratesAsOf || null,
    sourceUrl: discom.sourceUrl || stateMeta.sourceUrl || null,
    lastVerified: discom.verifiedOn || stateMeta.verifiedOn || null,
    lpscRate: discom.lpscRate ?? null,
    excessDemand: sanitize(discom.excessDemand || stateMeta.excessDemand || null),
    fppaFac: currentFppaFor(state, discom.id),
    categoryCount: categories.length,
    tariffCount: categories.reduce((n, c) => n + c.tariffCount, 0),
    categories,
  };
}

function summarize(db) {
  const discoms = db.states.flatMap((s) => s.discoms);
  const categories = discoms.flatMap((d) => d.categories);
  const tariffs = categories.flatMap((c) => c.tariffs);
  const withHistory = tariffs.filter((t) => t.previousTariff.length).length;
  const withFppa = discoms.filter((d) => d.fppaFac.history.length).length;
  const withSubsidy = tariffs.filter((t) => t.subsidy.schemes.length || t.subsidy.notes.length).length;
  return {
    schemaVersion: db.schemaVersion,
    generatedOn: db.generatedOn,
    stateCount: db.states.length,
    discomCount: discoms.length,
    categoryCount: categories.length,
    tariffRecordCount: tariffs.length,
    fppaTrackedDiscomCount: withFppa,
    tariffRecordsWithPreviousTariff: withHistory,
    tariffRecordsWithSubsidyNotes: withSubsidy,
    fields: db.fields,
  };
}

export function buildTariffDatabase({ quiet = false } = {}) {
  const states = getStates().map((state) => {
    const stateMeta = STATE_META[state] || {};
    const discoms = getDiscoms(state).map((discom) => normalizeDiscom(state, stateMeta, discom));
    return {
      state,
      tariffYear: stateMeta.tariffYear || null,
      effectiveDate: stateMeta.currentRatesFrom || null,
      ratesAsOf: stateMeta.ratesAsOf || null,
      sourceUrl: stateMeta.sourceUrl || null,
      discomCount: discoms.length,
      categoryCount: discoms.reduce((n, d) => n + d.categoryCount, 0),
      tariffRecordCount: discoms.reduce((n, d) => n + d.tariffCount, 0),
      discoms,
    };
  });

  const db = {
    schemaVersion: 1,
    generatedOn: TODAY,
    name: "TheDiscomBill structured Indian residential electricity tariff database",
    licenseNote: "Internal TheDiscomBill data asset. Do not treat this generated file as an official tariff order.",
    fields: [
      'state', 'discom', 'tariffYear', 'consumerCategory', 'slabs', 'fixedCharge',
      'electricityDuty', 'fppaFac', 'subsidy', 'meterCharge', 'minimumCharge',
      'solarRules', 'effectiveDate', 'tariffOrder', 'sourceUrl', 'lastVerified',
      'previousTariff',
    ],
    states,
  };
  const summary = summarize(db);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n', 'utf8');
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + '\n', 'utf8');
  if (!quiet) {
    console.log(`tariff-database: ${summary.stateCount} states, ${summary.discomCount} DISCOMs, ${summary.tariffRecordCount} tariff records`);
  }
  return { db, summary, dbPath: DB_PATH, summaryPath: SUMMARY_PATH };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  await ensureAll();
  buildTariffDatabase();
}
