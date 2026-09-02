// js/tariffs/fppa.js
// Verified FPPA / FPPAS / PPAC / FAC values as notified by State Electricity Regulatory
// Commissions / DISCOMs. These vary by billing PERIOD (notified monthly or quarterly) and,
// in some states (e.g. Delhi), by DISCOM. Only values confirmed from official notices /
// credible reporting are listed; periods with no entry default to 0 (user-editable).
//
// Each entry: { from, to?, mode, rate, label, source, unitSlabs? }
//   mode: 'percent' (rate% of energy + demand/fixed charges) | 'per_unit' (₹/unit × units)
//   unitSlabs: optional consumption-banded per-unit rates, for orders that publish a domestic
//              slab table rather than one flat consumer charge. `rate` remains the fallback /
//              chart value for older readers. Use `maxUnits: null` for the open-ended top
//              band — NOT Infinity, which JSON.stringify turns into null.
//   from/to: inclusive date window (YYYY-MM-DD). Omit `to` for an open-ended (current) rate.
// Entries are matched top-to-bottom, so list specific dated windows BEFORE open-ended ones.

// Deliberately NO registry.js import. rates.js needs only the FPPA_BY_* data here, and it is
// loaded by main.js on every page — importing the registry pulled all 37 state tariff modules
// (163KB) onto guide and tariff pages that never touch them. The one function that did need
// the registry (resolveFppaForDiscom) now lives in ./fppa-resolve.js, which only the
// calculator imports.

// DISCOM-specific values (take priority over the state-wide table).
export const FPPA_BY_DISCOM = {
  // Delhi — FPPAS (Fuel & Power Purchase Adjustment Surcharge), % of fixed + energy charges,
  // per DISCOM. DERC moved to MONTHLY orders from Jun 2026. Each order carries a 10% ceiling
  // (Tariff Regs 2017 reg. 134(d), as amended 2026) plus a case-by-case relaxation under
  // reg. 172, so the headline figure is "10% cap + additional".
  //
  // READ THE DATES CAREFULLY. DERC names each order by the month whose power-purchase cost it
  // settles, NOT the month it is billed in — the order dated 10.08.2026 fixes the FPPAS "for
  // June 2026". The window below is therefore the period the rate is RECOVERABLE (from the
  // order's own validity clause), which is what a bill date must be matched against.
  //
  // Corrected 2026-09-02 against the order PDFs. The previous entries put TPDDL on 12.21%
  // open-ended, which was the May-2026 figure; the 10.08.2026 order raised TPDDL to 18.50%
  // and that order was already three weeks in force. BRPL and BYPL have sat at 17.94/17.43
  // across all three orders. The 10.08.2026 PDF was fetched from DERC and from BSES and the
  // two copies are byte-identical (sha256).
  brpl: [
    { from: "2026-09-10", mode: "percent", rate: 17.94, label: "BRPL FPPAS (17.94%, carried forward past the order's one-month validity)", source: "DERC order dt. 10.08.2026 (FPPAS for Jun 2026), carried forward pending the Jul-2026 FPPAS order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20June.pdf", orderDate: "2026-08-10", verifiedOn: "2026-09-02" },
    { from: "2026-08-10", to: "2026-09-09", mode: "percent", rate: 17.94, label: "BRPL FPPAS for Jun 2026 (order dt. 10.08.2026)", source: "DERC order dt. 10.08.2026, para 1(a): 10% cap + additional FPPAS for Jun 2026; para 1(b) makes it recoverable for one month from the date of the Order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20June.pdf", orderDate: "2026-08-10", verifiedOn: "2026-09-02" },
    { from: "2026-07-10", to: "2026-08-09", mode: "percent", rate: 17.94, label: "BRPL FPPAS for May 2026 (order dt. 10.07.2026)", source: "DERC order dt. 10.07.2026, para 1(a); para 1(b) runs it month-to-month from issuance till further Order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20May.pdf", orderDate: "2026-07-10", verifiedOn: "2026-09-02" },
    { from: "2026-06-10", to: "2026-07-09", mode: "percent", rate: 17.94, label: "BRPL FPPAS for Apr 2026 (order dt. 10.06.2026)", source: "DERC order dt. 10.06.2026, para 1(a)/1(b); month-to-month from issuance till further Order", sourceUrl: "https://www.bsesdelhi.com/documents/55701/1994065252/BRPL_PPAC_Order_10062026.pdf", orderDate: "2026-06-10", verifiedOn: "2026-09-02" },
    { from: "2025-05-09", to: "2025-06-30", mode: "percent", rate: 13.54, label: "BRPL summer PPAC (9 May – 30 Jun 2025)", source: "DERC differential PPAC order, May 2025" },
    { from: "2025-07-01", to: "2026-06-09", mode: "percent", rate: 7.25, label: "BRPL PPAC (Jul 2025 – Jun 2026)", source: "DERC-approved BRPL PPAC 7.25%" },
  ],
  bypl: [
    { from: "2026-09-10", mode: "percent", rate: 17.43, label: "BYPL FPPAS (17.43%, carried forward past the order's one-month validity)", source: "DERC order dt. 10.08.2026 (FPPAS for Jun 2026), carried forward pending the Jul-2026 FPPAS order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20June.pdf", orderDate: "2026-08-10", verifiedOn: "2026-09-02" },
    { from: "2026-08-10", to: "2026-09-09", mode: "percent", rate: 17.43, label: "BYPL FPPAS for Jun 2026 (order dt. 10.08.2026)", source: "DERC order dt. 10.08.2026, para 1(a): 10% cap + additional FPPAS for Jun 2026; para 1(b) makes it recoverable for one month from the date of the Order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20June.pdf", orderDate: "2026-08-10", verifiedOn: "2026-09-02" },
    { from: "2026-07-10", to: "2026-08-09", mode: "percent", rate: 17.43, label: "BYPL FPPAS for May 2026 (order dt. 10.07.2026)", source: "DERC order dt. 10.07.2026, para 1(a); para 1(b) runs it month-to-month from issuance till further Order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20May.pdf", orderDate: "2026-07-10", verifiedOn: "2026-09-02" },
    { from: "2026-06-10", to: "2026-07-09", mode: "percent", rate: 17.43, label: "BYPL FPPAS for Apr 2026 (order dt. 10.06.2026)", source: "DERC order dt. 10.06.2026, para 1(a)/1(b); month-to-month from issuance till further Order", sourceUrl: "https://www.bsesdelhi.com/documents/55701/1994065252/BRPL_PPAC_Order_10062026.pdf", orderDate: "2026-06-10", verifiedOn: "2026-09-02" },
    { from: "2025-05-09", to: "2025-06-30", mode: "percent", rate: 13.33, label: "BYPL summer PPAC (9 May – 30 Jun 2025)", source: "DERC differential PPAC order, May 2025" },
    { from: "2025-07-01", to: "2026-06-09", mode: "percent", rate: 8.11, label: "BYPL PPAC (Jul 2025 – Jun 2026)", source: "DERC-approved BYPL PPAC 8.11%" },
  ],
  tpddl: [
    { from: "2026-09-10", mode: "percent", rate: 18.5, label: "TPDDL FPPAS (18.5%, carried forward past the order's one-month validity)", source: "DERC order dt. 10.08.2026 (FPPAS for Jun 2026), carried forward pending the Jul-2026 FPPAS order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20June.pdf", orderDate: "2026-08-10", verifiedOn: "2026-09-02" },
    { from: "2026-08-10", to: "2026-09-09", mode: "percent", rate: 18.5, label: "TPDDL FPPAS for Jun 2026 (order dt. 10.08.2026)", source: "DERC order dt. 10.08.2026, para 1(a): 10% cap + additional FPPAS for Jun 2026; para 1(b) makes it recoverable for one month from the date of the Order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20June.pdf", orderDate: "2026-08-10", verifiedOn: "2026-09-02" },
    { from: "2026-07-10", to: "2026-08-09", mode: "percent", rate: 12.21, label: "TPDDL FPPAS for May 2026 (order dt. 10.07.2026)", source: "DERC order dt. 10.07.2026, para 1(a); para 1(b) runs it month-to-month from issuance till further Order", sourceUrl: "https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20May.pdf", orderDate: "2026-07-10", verifiedOn: "2026-09-02" },
    { from: "2026-06-10", to: "2026-07-09", mode: "percent", rate: 16.0, label: "TPDDL FPPAS for Apr 2026 (order dt. 10.06.2026)", source: "DERC order dt. 10.06.2026, para 1(a)/1(b); month-to-month from issuance till further Order", sourceUrl: "https://www.bsesdelhi.com/documents/55701/1994065252/BRPL_PPAC_Order_10062026.pdf", orderDate: "2026-06-10", verifiedOn: "2026-09-02" },
    { from: "2025-05-09", to: "2025-06-30", mode: "percent", rate: 19.22, label: "TPDDL summer PPAC (9 May – 30 Jun 2025)", source: "DERC differential PPAC order, May 2025" },
    { from: "2025-07-01", to: "2026-06-09", mode: "percent", rate: 10.47, label: "TPDDL PPAC (Jul 2025 – Jun 2026)", source: "DERC-approved TPDDL PPAC 10.47%" },
  ],

  // Rajasthan — Regulatory Surcharge, §32 of the Tariff for Supply of Electricity-2025.
  //
  // This belongs here rather than in additionalCharges because the order defines it AS the
  // fuel-surcharge mechanism: "The above Regulatory Surcharge shall be a combination of Fuel
  // and Power Purchase Adjustment Surcharge (FPPAS) to be levied as per Regulation 87 of the
  // RERC Tariff Regulations 2025." Its own worked examples make the ceiling explicit — FPPAS
  // ₹0.20 leaves a ₹0.80 Regulatory Surcharge, FPPAS ₹0.40 leaves ₹0.60 — so the two always
  // sum to ₹1.00 and charging FPPAS on top of the surcharge would double-count it.
  //
  // Modelled at the ₹1.00 ceiling, which is what "balance domestic and other category
  // consumers" pay. Households consuming up to 100 units a month pay ₹0.70; a per-unit
  // surcharge cannot branch on consumption, so lifeline users see ₹0.30/unit too much (at most
  // ₹30 on a 100-unit bill). Flagged in the category notes.
  jvvnl:  [{ from: "2025-10-01", mode: "per_unit", rate: 1.00, label: "Regulatory Surcharge (incl. FPPAS)", source: "Tariff for Supply of Electricity-2025 §32 (RERC Petitions 2303–2305/2025)" }],
  avvnl:  [{ from: "2025-10-01", mode: "per_unit", rate: 1.00, label: "Regulatory Surcharge (incl. FPPAS)", source: "Tariff for Supply of Electricity-2025 §32 (RERC Petitions 2303–2305/2025)" }],
  jdvvnl: [{ from: "2025-10-01", mode: "per_unit", rate: 1.00, label: "Regulatory Surcharge (incl. FPPAS)", source: "Tariff for Supply of Electricity-2025 §32 (RERC Petitions 2303–2305/2025)" }],

  // ── Maharashtra — MERC FAC / PPCA ─────────────────────────────────────────
  //
  // Only MSEDCL is modelled. The three Mumbai licensees are deliberately absent, and the
  // reason is worth recording so the gap is not "filled" again from the same documents.
  //
  // MERC's FAC/PPCA approval letters approve a LUMP SUM IN RUPEES CRORE, not a per-unit
  // rate. They also carry no text layer — all four are pure scans (0 extractable
  // characters), so nothing in them can be read without rendering the pages.
  //
  //   BEST   (MERC/PPCA/2026-27, dt. 30.06.2026, post-facto Q1 FY 2025-26):
  //          Z-FAC leviable to consumer = Rs 8.71 cr (Apr 2025), Rs 15.56 cr (May),
  //          Rs 10.74 cr (Jun). No residential slab table anywhere in the order; the
  //          annexure is a generation-cost vetting report.
  //   TPC-D  (MERC/PPCA/2026-27, dt. 30.06.2026, post-facto Q1 FY 2025-26):
  //          Apr 2025 Rs (10.28) cr and May Rs (2.68) cr went to the PPCA Fund; only
  //          Jun 2025's Rs 2.21 cr was "allowed for recovery in next billing month".
  //   AEML-D (MERC/FAC/2024-25/0023, dt. 15.01.2025, FAC for Sep 2024):
  //          Rs 146.99 cr approved; recovery sought across Jan/Feb/Mar 2025 at the
  //          "FAC ceiling rate (20% of category energy charge)".
  //
  // Turning any of those into a ₹/unit figure needs the licensee's own category-wise sales
  // volume for the month, which the orders do not print. AEML's is a PERCENTAGE OF ENERGY
  // CHARGE, which this file cannot express either: `mode: 'percent'` is applied by the
  // engine to fixedCharge + energy + penalties (see facBase in js/engine.js), so using it
  // for an energy-only levy would over-charge every bill by 20% of the fixed charge.
  //
  // To add these properly: source the per-category ₹/unit the licensee actually billed
  // (their own tariff circular, not the MERC approval), or add an energy-only percent mode
  // to the engine first. Do not divide the crore figure by an assumed MU.
  msedcl: [
    { from: "2025-06-01", to: "2025-06-30", mode: "per_unit", rate: 0,
      label: "MSEDCL FAC for Jun 2025 (nil consumer levy)",
      source: "MERC prior-approval letter Ref. MERC/FAC/2025-26 dt. 05.12.2025: FAC approved at Rs 308.18 cr but added to the existing FAC Fund, leaving the FAC leviable for June 2025 at 0 (Zero); balance fund of Rs 376.58 cr carried forward",
      sourceUrl: "https://merc.gov.in/wp-content/uploads/2025/12/MSEDCL-FAC-Approval-June-2025.pdf",
      orderDate: "2025-12-05", verifiedOn: "2026-09-02" },
  ],

};

// State-wide values (apply to every DISCOM in the state unless overridden above).
export const FPPA_BY_STATE = {
  // UPPCL monthly FPPAS — % of (fixed + energy) charges, per UPERC MYT Reg. 2025 (cl.16(4)).
  // Verified monthly notices; negative = consumer credit; capped at 10%/cycle (excess carried
  // forward). Source: UPPCL monthly FPPAS notices (UPERC MYT Reg. 2025). FPPAS is nil (0) before Apr 2025.
  "Uttar Pradesh": [
    // NEWEST MONTH IS DELIBERATELY OPEN-ENDED (no `to`). Every other month here is a closed
    // window, which is right for history but was wrong for the head of the list: once the month
    // elapsed, `pick` matched nothing, resolveFppaForDiscom returned null and the calculator
    // silently billed UP at 0% FPPAS — a wrong bill, with no warning, for the state this engine
    // is otherwise verified against to the paisa. It failed that way on 2026-09-01. Carrying the
    // last notified rate forward is what Delhi and Rajasthan already do below, and a stale rate
    // is a far better failure than a silently absent one. When the next notice lands, close this
    // window with its real `to` and add the new month above it, open-ended in turn.
    { from: "2026-08-01", mode: "percent", rate: -2.92, label: "Aug 2026 FPPAS (credit; carried forward pending the next notice)" },
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
  ].map(e => ({ ...e, source: "UPPCL monthly FPPAS notice (UPERC MYT Reg. 2025)" })),
};

export function pick(list, billingDate) {
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

export function rateForBill(entry, { units = null, billingPeriodDays = 30 } = {}) {
  if (!entry) return 0;
  if (entry.mode !== 'per_unit' || !Array.isArray(entry.unitSlabs) || !entry.unitSlabs.length) {
    return entry.rate || 0;
  }
  const months = billingPeriodDays ? Math.max(1, Math.round(billingPeriodDays / 30)) : 1;
  const monthlyUnits = units != null && Number.isFinite(+units) ? (+units / months) : null;
  if (monthlyUnits == null) return entry.rate || 0;
  // `maxUnits: null` means "no upper bound", matching how the tariff data writes an
  // open-ended slab (`limit: null`). Infinity cannot be used: it survives in memory but
  // JSON.stringify turns it into null, so any serialised copy silently loses the boundary.
  const slab = entry.unitSlabs.find(s => s.maxUnits == null || monthlyUnits <= s.maxUnits)
    || entry.unitSlabs[entry.unitSlabs.length - 1];
  return slab ? slab.rate : (entry.rate || 0);
}

// resolveFppaForDiscom moved to ./fppa-resolve.js — see the note at the top of this file.
