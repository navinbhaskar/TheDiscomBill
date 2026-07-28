// js/tariffs/fppa-resolve.js — the one FPPA lookup that needs the tariff registry.
//
// Split out of fppa.js so that file stays pure data. rates.js imports fppa.js on every page
// (it is reached from main.js), and while fppa.js imported registry.js every page also paid
// for all 37 state tariff modules — 163KB of data a guide page never reads. Only the
// calculator needs to map a DISCOM back to its state, so only the calculator imports this.

import { FPPA_BY_DISCOM, FPPA_BY_STATE, pick } from './fppa.js';
import { findStateMetaByDiscom } from './registry.js';

/**
 * Resolve the verified FPPA/FPPAS/PPAC entry for a DISCOM at a given billing date.
 * Checks DISCOM-specific entries first, then falls back to state-wide entries.
 * @param {string} discomId - DISCOM identifier.
 * @param {string|Date} billingDate - Billing date (ISO string or Date). Uses today if omitted.
 * @returns {{from:string, to?:string, mode:string, rate:number, label:string, source:string}|null}
 */
export function resolveFppaForDiscom(discomId, billingDate) {
  const byDiscom = pick(FPPA_BY_DISCOM[discomId], billingDate);
  if (byDiscom) return byDiscom;
  const meta = findStateMetaByDiscom(discomId);
  if (meta) return pick(FPPA_BY_STATE[meta.state], billingDate);
  return null;
}
