// js/tariffs/orders.js — the Official Order Library.
//
// Until now provenance was an ATTRIBUTE of a state or a DISCOM: one `sourceUrl` hanging off
// STATE_META, overwritten the next time that state was re-sourced. That shape cannot answer
// the questions people actually ask — "which order set this rate", "when did it take effect",
// "what changed from the previous one" — because it only ever remembers the latest link.
// Here the ORDER is the entity and the rates point at it.
//
// ── Rules for adding a record ────────────────────────────────────────────────
// 1. Every field is transcribed from a document we have actually seen. Nothing is inferred
//    from a pattern, and nothing is guessed from a neighbouring state. A fact we do not have
//    is `null`, and the page prints the gap.
// 2. `sourceUrl` is where the document lives. `isPdf` says whether that URL IS the document
//    or merely a page that links to it — the difference between a citation and a signpost,
//    and the library shows which one you are getting.
// 3. `archiveUrl` is filled by `npm run orders:archive`, which asks the Wayback Machine what
//    snapshot it already holds. It is never hand-written: a snapshot URL we made up would be
//    a fabricated citation, which is worse than none.
// 4. `orderRef` is the regulator's own case or order number, verbatim, including its spacing
//    and punctuation. It is what someone types into a regulator's search box.
//
// Order types, covering what Indian regulators actually publish:
//   tariff-order   — the annual retail supply tariff order
//   myt-order      — a multi-year tariff order fixing a control period
//   true-up-order  — a retrospective true-up of an earlier year
//   fuel-surcharge — a monthly/periodic FPPA, FPPAS, PPAC or FAC notice
//   amendment      — a corrigendum or amendment to an order above
//   subsidy        — a state subsidy notification affecting the payable amount

export const ORDER_TYPES = {
  'tariff-order':  { label: 'Tariff order',        blurb: 'Sets the retail tariff schedule for a financial year.' },
  'myt-order':     { label: 'MYT order',           blurb: 'Fixes tariffs across a multi-year control period.' },
  'true-up-order': { label: 'True-up order',       blurb: 'Settles an earlier year against what actually happened.' },
  'fuel-surcharge':{ label: 'Fuel surcharge notice', blurb: 'Periodic FPPA / FPPAS / PPAC / FAC rate, revised far more often than the tariff.' },
  'amendment':     { label: 'Amendment',           blurb: 'Corrigendum or amendment to an earlier order.' },
  'subsidy':       { label: 'Subsidy notification', blurb: 'State subsidy that changes the amount actually payable.' },
};

export const ORDERS = [
  // ── Bihar ──────────────────────────────────────────────────────────────────
  {
    id: 'berc-tariff-fy2026-27',
    state: 'Bihar', regulator: 'BERC', discomIds: ['nbpdcl', 'sbpdcl'],
    type: 'tariff-order',
    title: 'BERC tariff schedule for FY 2026-27',
    orderRef: null, orderDate: '2026-03-18',
    effectiveFrom: '2026-04-01', effectiveTo: null,
    sourceUrl: 'https://berc.co.in/images/pdf/tariff-order/2026-27/Tariff_Chart_FY_2026-27.pdf',
    isPdf: true, archiveUrl: null,
    notes: null,
  },

  // ── Jammu & Kashmir ────────────────────────────────────────────────────────
  {
    id: 'jerc-jk-tariff-fy2025-26',
    state: 'Jammu & Kashmir', regulator: 'JERC for the UT of J&K and Ladakh', discomIds: ['jkpdd_jammu', 'jkpdd_kashmir'],
    type: 'tariff-order',
    title: 'JPDCL & KPDCL ARR and tariff for FY 2025-26',
    orderRef: null, orderDate: null,
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://www.jpdcl.co.in/downloads/tariff/JPDCL_KPDCL_Tariff_Order_2025_26.pdf',
    isPdf: true, archiveUrl: null,
    notes: 'Covers both J&K distribution licensees in one order.',
  },

  // ── Karnataka ──────────────────────────────────────────────────────────────
  {
    id: 'kerc-tariff-2025',
    state: 'Karnataka', regulator: 'KERC', discomIds: ['bescom', 'mescom', 'hescom', 'gescom', 'cesc_karnataka'],
    type: 'tariff-order',
    title: 'KERC Tariff Order 2025',
    orderRef: null, orderDate: '2025-03-27',
    effectiveFrom: '2026-04-01', effectiveTo: null,
    sourceUrl: 'https://kerc.karnataka.gov.in/uploads/96731743148968.pdf',
    isPdf: true, archiveUrl: null,
    notes: null,
  },

  // ── Maharashtra — one MYT order per licensee ───────────────────────────────
  {
    id: 'merc-217-2024-msedcl',
    state: 'Maharashtra', regulator: 'MERC', discomIds: ['msedcl'],
    type: 'myt-order',
    title: 'MSEDCL multi-year tariff order',
    orderRef: 'Case No. 217 of 2024', orderDate: null,
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://www.mahadiscom.in/consumer/wp-content/uploads/2025/08/MSEDCL-MYT-Order_Case_no_217-of-2024.pdf',
    isPdf: true, archiveUrl: 'https://web.archive.org/web/20251110162154/https://www.mahadiscom.in/consumer/wp-content/uploads/2025/08/MSEDCL-MYT-Order_Case_no_217-of-2024.pdf',
    notes: 'Hosted by the licensee rather than the Commission.',
  },
  {
    id: 'merc-211-2024-aeml',
    state: 'Maharashtra', regulator: 'MERC', discomIds: ['adani_mumbai'],
    type: 'myt-order',
    title: 'Adani Electricity Mumbai multi-year tariff order',
    orderRef: 'Case No. 211 of 2024', orderDate: null,
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_AEML_English.pdf',
    isPdf: true, archiveUrl: 'https://web.archive.org/web/20250722195751/https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_AEML_English.pdf',
    notes: 'Commission press note summarising the order, not the full order text.',
  },
  {
    id: 'merc-207-2024-best',
    state: 'Maharashtra', regulator: 'MERC', discomIds: ['best_mumbai'],
    type: 'myt-order',
    title: 'BEST Undertaking multi-year tariff order',
    orderRef: 'Case No. 207 of 2024', orderDate: null,
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_BEST_English.pdf',
    isPdf: true, archiveUrl: 'https://web.archive.org/web/20250725012655/https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_BEST_English.pdf',
    notes: 'Commission press note summarising the order, not the full order text.',
  },
  {
    id: 'merc-210-2024-tpc',
    state: 'Maharashtra', regulator: 'MERC', discomIds: ['tata_power_mumbai'],
    type: 'myt-order',
    title: 'Tata Power Mumbai multi-year tariff order',
    orderRef: 'Case No. 210 of 2024', orderDate: null,
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_TPC_English.pdf',
    isPdf: true, archiveUrl: 'https://web.archive.org/web/20250723184348/https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_TPC_English.pdf',
    notes: 'Commission press note summarising the order, not the full order text.',
  },

  // ── Odisha ─────────────────────────────────────────────────────────────────
  {
    id: 'oerc-rst-fy2026-27',
    state: 'Odisha', regulator: 'OERC', discomIds: ['tpcodl', 'tpnodl', 'tpwodl', 'tpsodl'],
    type: 'tariff-order',
    title: 'OERC retail supply tariff order for FY 2026-27',
    orderRef: null, orderDate: '2026-03-24',
    effectiveFrom: '2024-04-01', effectiveTo: null,
    sourceUrl: 'https://www.orierc.org/CuteSoft_Client/writereaddata/upload/DISCOM_TARIFF_ORDER_FY_2026-27.pdf',
    isPdf: true, archiveUrl: 'https://web.archive.org/web/20260606233217/https://www.orierc.org/CuteSoft_Client/writereaddata/upload/DISCOM_Tariff_Order_FY_2026-27.PDF',
    notes: 'FY 2024-25 rates retained, which is why the effective date predates the order.',
  },

  // ── Sikkim ─────────────────────────────────────────────────────────────────
  {
    id: 'sserc-tariff-fy2025-26',
    state: 'Sikkim', regulator: 'SSERC', discomIds: ['energy_sikkim'],
    type: 'tariff-order',
    title: 'SSERC tariff order for FY 2025-26',
    orderRef: null, orderDate: null,
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://selfservice.powersikkim.in/assets/home/Tariff-Schedule-FY-2025-26.pdf',
    isPdf: true, archiveUrl: null,
    notes: null,
  },

  // ── Tamil Nadu ─────────────────────────────────────────────────────────────
  {
    id: 'tnerc-to-6-2025',
    state: 'Tamil Nadu', regulator: 'TNERC', discomIds: ['tangedco'],
    type: 'tariff-order',
    title: 'TNERC retail supply tariff order',
    orderRef: 'T.O. No. 6 of 2025', orderDate: null,
    effectiveFrom: '2025-07-01', effectiveTo: null,
    sourceUrl: 'https://www.tnerc.tn.gov.in/Orders/files/TO-Order%20No6300620252131.pdf',
    isPdf: true, archiveUrl: null,
    notes: null,
  },

  // ── Uttar Pradesh ──────────────────────────────────────────────────────────
  // The order date is recorded but no direct document URL is: uperc.org is the Commission's
  // homepage. Listed anyway, flagged, because a named gap is more useful than an omission.
  {
    id: 'uperc-2026-07-02-retained',
    state: 'Uttar Pradesh', regulator: 'UPERC',
    discomIds: ['mvvnl', 'pvvnl', 'dvvnl', 'puvvnl', 'kesco'],
    type: 'tariff-order',
    title: 'UPERC order retaining FY 2024-25 rates for FY 2026-27',
    orderRef: null, orderDate: '2026-07-02',
    effectiveFrom: '2024-10-01', effectiveTo: null,
    sourceUrl: 'https://www.uperc.org',
    isPdf: false, archiveUrl: 'https://web.archive.org/web/20260105005856/https://uperc.org/',
    notes: 'Rates retained rather than revised. We hold the order date but not a direct link to the document.',
  },

  // ── West Bengal — three licensees, three orders ────────────────────────────
  {
    id: 'wberc-fy2025-26-wbsedcl',
    state: 'West Bengal', regulator: 'WBERC', discomIds: ['wbsedcl'],
    type: 'tariff-order',
    title: 'WBERC tariff order for FY 2025-26 (gist)',
    orderRef: null, orderDate: null,
    effectiveFrom: '2025-04-01', effectiveTo: null,
    sourceUrl: 'https://www.wbsedcl.in/irj/go/km/docs/internet/new_website/pdf/Tariff_Volumn/Gist%20of%20Tariff%20Order%202025-26_28_03.pdf',
    isPdf: true, archiveUrl: null,
    notes: 'Continues until further order. Published as a gist of the order, not the full text.',
  },
  {
    id: 'wberc-2025-03-25-cesc',
    state: 'West Bengal', regulator: 'WBERC', discomIds: ['cesc_kolkata'],
    type: 'tariff-order',
    title: 'WBERC tariff order for CESC',
    orderRef: null, orderDate: '2025-03-25',
    effectiveFrom: '2025-04-01', effectiveTo: null,
    sourceUrl: 'https://www.cesc.co.in/tariff',
    isPdf: false, archiveUrl: 'https://web.archive.org/web/20260411210619/https://www.cesc.co.in/tariff',
    notes: 'Continues until further order. The licensee publishes the schedule on a page rather than as a document.',
  },
  {
    id: 'wberc-2025-03-20-dpl',
    state: 'West Bengal', regulator: 'WBERC', discomIds: ['dpl'],
    type: 'tariff-order',
    title: 'WBERC tariff order for DPL',
    orderRef: null, orderDate: '2025-03-20',
    effectiveFrom: null, effectiveTo: null,
    sourceUrl: 'https://www.wbsedcl.in/irj/go/km/docs/internet/new_website/pdf/Tariff_Volumn/Gist%20of%20Tariff%20Order%202025-26_28_03.pdf',
    isPdf: true, archiveUrl: null,
    notes: 'DPL’s schedule is maintained at its 31-12-2018 level.',
  },

  // ── Delhi — PPAC, the highest-frequency document type on the site ──────────
  {
    id: 'derc-ppac-2026-07-10',
    state: 'Delhi', regulator: 'DERC', discomIds: ['brpl', 'bypl', 'tpddl'],
    type: 'fuel-surcharge',
    title: 'DERC PPAC order, July 2026',
    orderRef: null, orderDate: '2026-07-10',
    effectiveFrom: '2026-07-01', effectiveTo: null,
    sourceUrl: 'https://derc.gov.in/commissions-proceedings-orders/other-than-142/final-order',
    isPdf: false, archiveUrl: 'https://web.archive.org/web/20250426140100/https://www.derc.gov.in/commissions-proceedings-orders/other-than-142/final-order',
    mirrors: [
      { who: 'BRPL', url: 'https://www.bsesdelhi.com/web/brpl/fuel-power-purchase-adjustment-charges' },
      { who: 'Tata Power-DDL', url: 'https://www.tatapower-ddl.com/regulations-and-compliances/tariff-related/derc-orders-and-letters-on-ppac' },
    ],
    notes: 'Set per licensee: BRPL and BYPL unchanged, TPDDL reduced.',
  },
  {
    id: 'derc-ppac-2026-06',
    state: 'Delhi', regulator: 'DERC', discomIds: ['brpl', 'bypl', 'tpddl'],
    type: 'fuel-surcharge',
    title: 'DERC PPAC approval, June 2026',
    orderRef: null, orderDate: null,
    effectiveFrom: '2026-06-01', effectiveTo: '2026-06-30',
    sourceUrl: 'https://derc.gov.in/commissions-proceedings-orders/other-than-142/final-order',
    isPdf: false, archiveUrl: 'https://web.archive.org/web/20250426140100/https://www.derc.gov.in/commissions-proceedings-orders/other-than-142/final-order',
    notes: 'The month DERC moved from periodic to monthly PPAC revisions.',
  },
];
