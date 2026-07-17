// Karnataka — Electricity Tariff Data (FY 2026-27)
// Source: KERC Combined ESCOMs Tariff Order 2025, dt. 27-03-2025 (Annexure-9, Tariff Schedules),
//         which determines retail tariff for FY2025-26 → FY2027-28:
//         https://kerc.karnataka.gov.in/uploads/96731743148968.pdf
// To update rates: edit the shared makeCategories() factory below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// KERC fixes a UNIFORM TARIFF ACROSS ESCOMs (Tariff Order 2025 §6.3(h)) — BESCOM, MESCOM, CESC,
// HESCOM and GESCOM all bill the same schedule — so the categories are defined once and cloned
// per ESCOM (same pattern as uttar-pradesh.js / bihar.js).
//
// Structure note: Tariff Order 2025 §6.5.7(1) merged LT-1's two-tier structure into "a uniform
// single slab for both fixed and energy charges". The old consumption slabs (1.30/4.95/7.10/
// 8.10/8.35) are gone — domestic is now a FLAT rate. Same for LT-3(a) commercial.
//
// NOT MODELLED — "FY25 True up Charges": KERC's APR orders dt. 17-04-2026 recover each ESCOM's
// FY2024-25 revenue deficit/surplus from May 2026 to Apr 2027 (BESCOM a charge, MESCOM/GESCOM/
// HRECS refunds). Per the BESCOM order (APR Petition No.39, §5.0) the amount is computed from
// **each consumer's own FY2024-25 consumption** and billed as 12 equal monthly instalments — it
// is NOT a surcharge on current units, so it cannot be derived from a bill we are estimating.
// It lands as a separate "FY25 True up Charges" line; see the category notes.

function makeCategories() {
  return [
    {
      id: "domestic",
      name: "LT-1 (Domestic / Residential)",
      // Single slab for both fixed and energy charges (FY 2026-27, eff. 1 Apr 2026).
      fixedCharge: { type: "per_kw", rate: 150 },
      energySlabs: [{ limit: Infinity, rate: 5.80 }],
      additionalCharges: [],
      notes: "KERC merged the old domestic slabs into a single flat rate — every unit costs the same. Tariff is inclusive of duties (no separate electricity-duty line). BESCOM bills also carry a separate 'FY25 True up Charges' line from May 2026 to Apr 2027, calculated from your FY2024-25 consumption and spread over 12 instalments; it is not a per-unit charge on this bill, so it is not included here. Gruha Jyoti (200 free units/month) applies via the Government Subsidy option.",
      rateHistory: [
        {
          from: "2025-04-01",
          label: "FY 2025-26 (KERC Tariff Order 2025)",
          estimated: false,
          fixedCharge: { type: "per_kw", rate: 145 },
          energySlabs: [{ limit: Infinity, rate: 5.80 }]
        },
        {
          // Pre-merger slabs our data carried for FY 2024-25 (never bill-verified).
          from: "2024-04-01",
          label: "FY 2024-25 (pre-merger slabs)",
          estimated: true,
          fixedCharge: {
            type: "tiered",
            slabs: [
              { maxLoad: 2.5, rate: 30, label: "Single phase" },
              { maxLoad: 5, rate: 50, label: "Up to 5 kW" },
              { maxLoad: Infinity, rate: 75, label: "Above 5 kW" }
            ]
          },
          energySlabs: [
            { limit: 30, rate: 1.3 },
            { limit: 100, rate: 4.95 },
            { limit: 200, rate: 7.1 },
            { limit: 500, rate: 8.1 },
            { limit: Infinity, rate: 8.35 }
          ]
        }
      ]
    },
    {
      id: "commercial",
      name: "LT-3(a) (Commercial / Non-Domestic LT)",
      // Also a single slab from the FY2025-26 order onward.
      fixedCharge: { type: "per_kw", rate: 215 },
      energySlabs: [{ limit: Infinity, rate: 6.80 }],
      additionalCharges: [],
      notes: "Shops, hotels, offices, clinics, banks and similar commercial installations. Single flat rate — KERC merged the old slabs. An optional demand-based tariff exists for sanctioned load above 5 kW and below 150 kW (fixed ₹235/kW at the same energy rate); this page models the standard load-based tariff.",
      rateHistory: [
        {
          from: "2025-04-01",
          label: "FY 2025-26 (KERC Tariff Order 2025)",
          estimated: false,
          fixedCharge: { type: "per_kw", rate: 215 },
          energySlabs: [{ limit: Infinity, rate: 7.00 }]
        },
        {
          from: "2024-04-01",
          label: "FY 2024-25 (pre-merger slabs)",
          estimated: true,
          fixedCharge: {
            type: "tiered",
            slabs: [
              { maxLoad: 2.5, rate: 75, label: "Single phase" },
              { maxLoad: Infinity, rate: 120, label: "Three phase" }
            ]
          },
          energySlabs: [
            { limit: 200, rate: 8.5 },
            { limit: Infinity, rate: 9.5 }
          ]
        }
      ]
    }
  ];
}

const DISCOM_META = [
  {
    id: "bescom",
    name: "BESCOM",
    fullName: "Bangalore Electricity Supply Company Ltd.",
    area: "Bangalore Urban, Bangalore Rural, Tumkur, Kolar, Chikkaballapur, Ramanagara, Chitradurga",
    website: "https://www.bescom.co.in"
  },
  {
    id: "mescom",
    name: "MESCOM",
    fullName: "Mangalore Electricity Supply Company Ltd.",
    area: "Dakshina Kannada, Udupi, Shivamogga, Kodagu, Chikkamagaluru",
    website: "https://www.mescom.co.in"
  },
  {
    id: "cesc_karnataka",
    name: "CESC Mysuru",
    fullName: "Chamundeshwari Electricity Supply Corporation Ltd.",
    area: "Mysuru, Mandya, Hassan, Chamarajanagar",
    website: "https://cescmysore.karnataka.gov.in"
  },
  {
    id: "gescom",
    name: "GESCOM",
    fullName: "Gulbarga Electricity Supply Company Ltd.",
    area: "Kalaburagi, Bidar, Yadgir, Raichur, Koppal",
    website: "https://www.gescom.karnataka.gov.in"
  },
  {
    id: "hescom",
    name: "HESCOM",
    fullName: "Hubli Electricity Supply Company Ltd.",
    area: "Dharwad, Gadag, Haveri, Belagavi, Uttara Kannada, Ballari, Vijayanagara",
    website: "https://www.hescom.co.in"
  }
];

export default {
  state: "Karnataka",
  // KERC: demand exceeding the sanctioned demand is billed at 1.5× the normal demand-charge rate.
  excessDemand: { multiplier: 1.5, tolerancePct: 0 },
  currentRatesFrom: "2026-04-01",
  ratesAsOf: "FY 2026-27 (KERC Tariff Order 2025, dt. 27-03-2025)",
  sourceUrl: "https://kerc.karnataka.gov.in/uploads/96731743148968.pdf",
  discoms: DISCOM_META.map(d => ({
    ...d,
    tariffYear: "2026-27",
    categories: makeCategories(),
  })),
};
