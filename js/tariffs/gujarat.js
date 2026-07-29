// Gujarat — Electricity Tariff Data (FY 2026-27)
//
// Source: GERC Tariff Orders for FY 2026-27, all dated 25-03-2026, effective 01-04-2026 —
//   DGVCL  Petition 2581/2025   MGVCL  Petition 2582/2025
//   PGVCL  Petition 2583/2025   UGVCL  Petition 2584/2025
// https://gercin.org/wp-content/uploads/2026/03/<DISCOM>-<petition>-2025-Tariff-Order-for-FY-2026-27-dtd.-25.03.2026.pdf
//
// All four GUVNL discoms were read separately and carry an IDENTICAL retail schedule — the
// RGP, RGP(Rural) and Non-RGP rates below were diffed across all four orders, not assumed
// from one. GERC also publishes a single consolidated "Tariff Schedule of DGVCL/MGVCL/PGVCL/
// UGVCL" covering the same figures. Rates were RETAINED from FY 2025-26 (no base-rate hike),
// so there is no rate change to carry in rateHistory.
//
// The previous data here (flat ₹35 fixed; 1.00/2.20/3.45/5.00) matched no published GERC
// order — neither FY24-25 nor any earlier schedule found. It has been replaced outright
// rather than kept as history.
//
// NOT verified against a real Gujarat bill — `verified` is deliberately absent. See
// TARIFF_GUIDE.md for the field schema.

// One factory, four discoms: GERC determines each licensee separately but lands them on the
// same retail schedule, so cloning is what keeps them honest — a divergence would mean one
// order was misread. Same pattern as Karnataka's ESCOMs and the Odisha TP discoms.
// Order §1.1 / §2.1 — the same load bands apply to RGP and RGP(Rural). A flat amount per
// band, NOT per kW: "Rs. 15/- per month" for a load up to 2 kW, not per kW of it.
const RGP_FIXED = {
  type: "tiered",
  slabs: [
    { maxLoad: 2,        rate: 15, label: "up to 2 kW" },
    { maxLoad: 4,        rate: 25, label: "above 2 to 4 kW" },
    { maxLoad: 6,        rate: 45, label: "above 4 to 6 kW" },
    { maxLoad: Infinity, rate: 70, label: "above 6 kW" },
  ],
};

// UNVERIFIED — carried over from the previous data. The GERC order explicitly puts ED outside
// its scope ("These tariffs are exclusive of Electricity Duty…", schedule notes §2), and the
// Gujarat Electricity Duty Act PDF on the state CEI site is a scan with no text layer.
// Secondary sources disagree (10 / 15 / 20%). Confirm from the Act's schedule or a real
// Gujarat bill before treating this figure as sound.
const GUJARAT_ED = { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 };

// Order §4.1 — MARGINAL per-kW bands: ₹50/kW on the first 10 kW, ₹85/kW on the next 30, so a
// 15 kW connection pays 10×50 + 5×85 = ₹925. Not `tiered`, which would bill all 15 kW at ₹85.
const NON_RGP_FIXED = {
  type: "slab_per_kw",
  slabs: [
    { maxLoad: 10, rate: 50, label: "first 10 kW" },
    { maxLoad: 40, rate: 85, label: "next 30 kW" },
  ],
};

const gujaratCategories = () => [
  {
    id: "domestic",
    name: "RGP (Residential General Purpose)",
    fixedCharge: RGP_FIXED,
    // Order §1.2, post-paid. Smart pre-paid meters get a lower schedule
    // (296/340/403/504 paise) that the calculator does not yet model.
    energySlabs: [
      { limit: 50,       rate: 3.05 },
      { limit: 100,      rate: 3.50 },
      { limit: 250,      rate: 4.15 },
      { limit: Infinity, rate: 5.20 },
    ],
    additionalCharges: [GUJARAT_ED],
    // getEffectiveTariff REPLACES the category with the chosen supply type rather than
    // merging, so each one carries its own complete schedule. The category-level slabs above
    // stay as the fallback for a call that passes no supplyTypeId.
    supplyTypes: [
      {
        id: "urban",
        name: "RGP — Urban / non-Gram-Panchayat",
        description: "Residential premises outside Gram Panchayat areas",
        fixedCharge: RGP_FIXED,
        energySlabs: [
          { limit: 50,       rate: 3.05 },
          { limit: 100,      rate: 3.50 },
          { limit: 250,      rate: 4.15 },
          { limit: Infinity, rate: 5.20 },
        ],
        additionalCharges: [GUJARAT_ED],
      },
      {
        id: "rural",
        name: "RGP (Rural) — within Gram Panchayat",
        description: "Residential premises inside a Gram Panchayat as defined in the Gujarat Panchayats Act",
        // Order §2.2 — a genuinely separate, cheaper schedule; same fixed-charge bands.
        fixedCharge: RGP_FIXED,
        energySlabs: [
          { limit: 50,       rate: 2.65 },
          { limit: 100,      rate: 3.10 },
          { limit: 250,      rate: 3.75 },
          { limit: Infinity, rate: 4.90 },
        ],
        additionalCharges: [GUJARAT_ED],
      },
    ],
    notes: "Smart-meter consumers get a 60 paise/unit Time-of-Use concession for consumption between 1100 and 1700 hrs. BPL households pay ₹5/month fixed and 150 paise/unit on the first 50 units.",
  },
  {
    id: "commercial",
    name: "Non-RGP (Commercial / Non-Industrial, up to 40 kW)",
    fixedCharge: NON_RGP_FIXED,
    // Order §4.2 is non-telescopic and branches on CONTRACTED load, which an energy-slab
    // schedule cannot express — so the two bands are separate supply types, the same shape
    // used for Tamil Nadu's non-telescopic LT-V.
    energySlabs: [{ limit: Infinity, rate: 4.35 }],
    additionalCharges: [
      GUJARAT_ED,
    ],
    supplyTypes: [
      {
        id: "upto10kw",
        name: "Contracted load up to 10 kW",
        description: "Entire monthly consumption at 435 paise per unit",
        fixedCharge: NON_RGP_FIXED,
        energySlabs: [{ limit: Infinity, rate: 4.35 }],
        additionalCharges: [GUJARAT_ED],
      },
      {
        id: "above10kw",
        name: "Contracted load above 10 kW",
        description: "Entire monthly consumption at 465 paise per unit, plus a 45 paise/unit peak-hour charge",
        fixedCharge: NON_RGP_FIXED,
        energySlabs: [{ limit: Infinity, rate: 4.65 }],
        additionalCharges: [GUJARAT_ED],
      },
    ],
    notes: "Above 10 kW, consumption during the two peak windows (0700–1100 and 1800–2200 hrs) carries an extra 45 paise/unit. Connections above 40 kW fall under LTMD instead.",
  },
  {
    id: "agricultural",
    name: "AG (Agriculture / Irrigation)",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 0.6 }],
    additionalCharges: [],
    notes: "Heavily subsidised; the order's headline AG tariff is HP-based at ₹200 per HP per month. Actual supply hours are limited.",
  },
];

const gujaratDiscom = (id, name, fullName, area, website) => ({
  id, name, fullName, area,
  tariffYear: "2026-27",
  website,
  categories: gujaratCategories(),
});

export default {
  state: "Gujarat",
  // GERC: demand exceeding contract demand attracts a flat penal demand charge on the excess.
  excessDemand: { rate: 360, tolerancePct: 0 },
  ratesAsOf: "FY 2026-27 (GERC orders dt. 25-Mar-2026, rates retained)",
  sourceUrl: "https://gercin.org/order-category/tariff-orders/",
  discoms: [
    gujaratDiscom("ugvcl", "UGVCL", "Uttar Gujarat Vij Company Ltd.",
      "North Gujarat (Mehsana, Patan, Banaskantha, Sabarkantha, Gandhinagar, Aravalli)",
      "https://www.ugvcl.com"),
    gujaratDiscom("mgvcl", "MGVCL", "Madhya Gujarat Vij Company Ltd.",
      "Central Gujarat (Vadodara, Anand, Kheda, Panchmahal, Dahod, Chhota Udaipur)",
      "https://www.mgvcl.com"),
    // Corrected: this previously listed Surat, Bharuch and Narmada, which are DGVCL's
    // territory. PGVCL is the Saurashtra-Kutch licensee.
    gujaratDiscom("pgvcl", "PGVCL", "Paschim Gujarat Vij Company Ltd.",
      "Saurashtra & Kutch (Rajkot, Jamnagar, Junagadh, Porbandar, Bhavnagar, Amreli, Kutch, Surendranagar, Morbi)",
      "https://www.pgvcl.com"),
    gujaratDiscom("dgvcl", "DGVCL", "Dakshin Gujarat Vij Company Ltd.",
      "South Gujarat (Surat, Bharuch, Narmada, Navsari, Valsad, Tapi, Dang)",
      "https://www.dgvcl.com"),
  ],
};
