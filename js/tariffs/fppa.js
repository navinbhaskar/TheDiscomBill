// js/tariffs/fppa.js
// Verified FPPA / FPPAS / PPAC / FAC values as notified by State Electricity Regulatory
// Commissions / DISCOMs. These vary by billing PERIOD (notified monthly or quarterly) and,
// in some states (e.g. Delhi), by DISCOM. Only values confirmed from official notices /
// credible reporting are listed; periods with no entry default to 0 (user-editable).
//
// Each entry: { from, to?, mode, rate, label, source }
//   mode: 'percent' (rate% of energy + demand/fixed charges) | 'per_unit' (₹/unit × units)
//   from/to: inclusive date window (YYYY-MM-DD). Omit `to` for an open-ended (current) rate.
// Entries are matched top-to-bottom, so list specific dated windows BEFORE open-ended ones.

import { findStateMetaByDiscom } from './registry.js';

// DISCOM-specific values (take priority over the state-wide table).
export const FPPA_BY_DISCOM = {
  // Delhi — PPAC (Power Purchase Adjustment Cost): % of fixed + energy charges, per-DISCOM.
  // DERC allowed a higher summer differential 9 May – 8 Aug 2025 (May 9–Jun 30 figures below).
  // DERC switched to MONTHLY PPAC revisions from Jun 2026 and sanctioned sharply higher
  // rates (BRPL 17.94 / BYPL 17.43 / TPDDL 16.00). Kept open-ended as the current standing
  // rate until the next notice; revisit monthly.
  brpl: [
    { from: "2026-06-01", mode: "percent", rate: 17.94, label: "BRPL PPAC (from Jun 2026, monthly revisions)", source: "DERC PPAC approval, Jun 2026 (ETV Bharat / DERC)" },
    { from: "2025-05-09", to: "2025-06-30", mode: "percent", rate: 13.54, label: "BRPL summer PPAC (9 May – 30 Jun 2025)", source: "DERC differential PPAC order, May 2025" },
    { from: "2025-07-01", to: "2026-05-31", mode: "percent", rate: 7.25, label: "BRPL PPAC (Jul 2025 – May 2026)", source: "DERC-approved BRPL PPAC 7.25%" },
  ],
  bypl: [
    { from: "2026-06-01", mode: "percent", rate: 17.43, label: "BYPL PPAC (from Jun 2026, monthly revisions)", source: "DERC PPAC approval, Jun 2026 (ETV Bharat / DERC)" },
    { from: "2025-05-09", to: "2025-06-30", mode: "percent", rate: 13.33, label: "BYPL summer PPAC (9 May – 30 Jun 2025)", source: "DERC differential PPAC order, May 2025" },
    { from: "2025-07-01", to: "2026-05-31", mode: "percent", rate: 8.11, label: "BYPL PPAC (Jul 2025 – May 2026)", source: "DERC-approved BYPL PPAC 8.11%" },
  ],
  tpddl: [
    { from: "2026-06-01", mode: "percent", rate: 16.00, label: "TPDDL PPAC (from Jun 2026, monthly revisions)", source: "DERC PPAC approval, Jun 2026 (ETV Bharat / DERC)" },
    { from: "2025-05-09", to: "2025-06-30", mode: "percent", rate: 19.22, label: "TPDDL summer PPAC (9 May – 30 Jun 2025)", source: "DERC differential PPAC order, May 2025" },
    { from: "2025-07-01", to: "2026-05-31", mode: "percent", rate: 10.47, label: "TPDDL PPAC (Jul 2025 – May 2026)", source: "DERC-approved TPDDL PPAC 10.47%" },
  ],
};

// State-wide values (apply to every DISCOM in the state unless overridden above).
export const FPPA_BY_STATE = {
  // UPPCL monthly FPPAS — % of (fixed + energy) charges, per UPERC MYT Reg. 2025 (cl.16(4)).
  // Verified monthly notices; negative = consumer credit; capped at 10%/cycle (excess carried
  // forward). Source: bijlibabu.com/tariff/fppas/list. FPPAS is nil (0) before Apr 2025.
  "Uttar Pradesh": [
    { from: "2026-07-01", to: "2026-07-31", mode: "percent", rate: -4.43, label: "Jul 2026 FPPAS (credit)" },
    { from: "2026-06-01", to: "2026-06-30", mode: "percent", rate: 10.00, label: "Jun 2026 FPPAS (10% cap)" },
    { from: "2026-05-01", to: "2026-05-31", mode: "percent", rate: -1.52, label: "May 2026 FPPAS (credit)" },
    { from: "2026-04-01", to: "2026-04-30", mode: "percent", rate: 1.24,  label: "Apr 2026 FPPAS" },
    { from: "2026-03-01", to: "2026-03-31", mode: "percent", rate: -2.42, label: "Mar 2026 FPPAS (credit)" },
    { from: "2026-02-01", to: "2026-02-28", mode: "percent", rate: 10.00, label: "Feb 2026 FPPAS (10% cap)" },
    { from: "2026-01-01", to: "2026-01-31", mode: "percent", rate: -2.33, label: "Jan 2026 FPPAS (credit)" },
    { from: "2025-12-01", to: "2025-12-31", mode: "percent", rate: 5.56,  label: "Dec 2025 FPPAS" },
    { from: "2025-11-01", to: "2025-11-30", mode: "percent", rate: 1.83,  label: "Nov 2025 FPPAS" },
    { from: "2025-10-01", to: "2025-10-31", mode: "percent", rate: -1.63, label: "Oct 2025 FPPAS (credit)" },
    { from: "2025-09-01", to: "2025-09-30", mode: "percent", rate: 2.34,  label: "Sep 2025 FPPAS" },
    { from: "2025-08-01", to: "2025-08-31", mode: "percent", rate: 0.24,  label: "Aug 2025 FPPAS" },
    { from: "2025-07-01", to: "2025-07-31", mode: "percent", rate: 1.97,  label: "Jul 2025 FPPAS" },
    { from: "2025-06-01", to: "2025-06-30", mode: "percent", rate: 4.27,  label: "Jun 2025 FPPAS" },
    { from: "2025-05-01", to: "2025-05-31", mode: "percent", rate: -2.00, label: "May 2025 FPPAS (credit)" },
    { from: "2025-04-01", to: "2025-04-30", mode: "percent", rate: 1.24,  label: "Apr 2025 FPPAS" },
  ].map(e => ({ ...e, source: "UPPCL monthly FPPAS notice (UPERC MYT Reg. 2025) — bijlibabu.com/tariff/fppas/list" })),
};

function pick(list, billingDate) {
  if (!list || !list.length) return null;
  const bd = billingDate ? new Date(billingDate) : new Date();
  if (isNaN(bd)) return null;
  for (const e of list) {
    const from = new Date(e.from);
    const to   = e.to ? new Date(e.to) : null;
    if (bd >= from && (!to || bd <= to)) return e;
  }
  return null;
}

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
