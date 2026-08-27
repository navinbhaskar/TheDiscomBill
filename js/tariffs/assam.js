// Assam — Electricity Tariff Data (AERC order dt. 25-Mar-2025, w.e.f. 1 April 2025)
// Rates: APDCL "Schedule of Tariff w.e.f 1st April 2025", the schedule AERC approved.
// APDCL petitioned AERC in December 2025 to carry this schedule into FY 2026-27 unchanged
// across every LT and HT category; that petition is why the rates below are still current.
// Because a separate FY 2026-27 order could not be confirmed, tariffYear stays 2025-26
// rather than claiming an order that may not have issued.
//
// The rate a consumer pays is NOT the tariff APDCL earns. Each slab shows a full-cost rate,
// two Government-of-Assam subsidy components, and an effective rate. The effective rate is
// what the bill charges, so that is what is modelled here; the full-cost rate is recorded in
// the notes because the subsidy is a State commitment that can lapse.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// Domestic-A: above 0.5 kW to below 5 kW. Effective rates after both GoA subsidies.
const AS_DOM_A_SLABS = [
  { limit: 120, rate: 4.25 },   // full cost 5.99 − 0.75 targeted − 0.99 tariff subsidy
  { limit: 240, rate: 6.30 },   // full cost 7.29 − 0.99
  { limit: 300, rate: 7.20 },   // full cost 8.19 − 0.99
  { limit: 500, rate: 7.40 },   // full cost 8.19 − 0.79
  { limit: Infinity, rate: 8.19 },  // unsubsidised
];

// Domestic-B: 5 kW to 30 kW. One full-cost rate of ₹7.74 throughout; only the subsidy varies.
const AS_DOM_B_SLABS = [
  { limit: 300, rate: 6.75 },   // 7.74 − 0.99
  { limit: 500, rate: 6.95 },   // 7.74 − 0.79
  { limit: Infinity, rate: 7.74 },
];

const AS_DOMESTIC_TYPES = [
  {
    id: "domestic_a",
    name: "Domestic-A — above 0.5 kW to below 5 kW",
    description: "The ordinary household category. Five telescopic slabs on a ₹70/kW/month fixed charge, with the Government of Assam subsidy already applied.",
    fixedCharge: { type: "per_kw", rate: 70 },
    energySlabs: AS_DOM_A_SLABS,
  },
  {
    id: "domestic_b",
    name: "Domestic-B — 5 kW to 30 kW",
    description: "Larger domestic connections. The underlying rate is a flat ₹7.74 at every slab; only the size of the State subsidy changes, so the effective rate rises from ₹6.75 to ₹7.74.",
    fixedCharge: { type: "per_kw", rate: 70 },
    energySlabs: AS_DOM_B_SLABS,
  },
  {
    id: "jeevan_dhara",
    name: "Jeevan Dhara — 0.5 kW and 1.5 kWh/day",
    description: "The lifeline category: ₹40 per connection per month (not per kW) and an effective ₹3.35/unit. Consume more than 45 units a month for two consecutive months and APDCL moves you to Domestic-A.",
    fixedCharge: { type: "flat", rate: 40 },
    energySlabs: [{ limit: Infinity, rate: 3.35 }],
  },
];

const AS_COMMERCIAL_TYPES = [
  {
    id: "commercial",
    name: "LT Commercial — above 0.5 kW to 30 kW",
    description: "A single unsubsidised rate of ₹8.94 on all units, on a ₹150/kW/month fixed charge.",
    fixedCharge: { type: "per_kw", rate: 150 },
    energySlabs: [{ limit: Infinity, rate: 8.94 }],
  },
  {
    id: "general_purpose",
    name: "LT General Purpose — up to 30 kW",
    description: "₹7.99/unit on the highest LT fixed charge in the schedule, ₹165/kW/month.",
    fixedCharge: { type: "per_kw", rate: 165 },
    energySlabs: [{ limit: Infinity, rate: 7.99 }],
  },
  {
    id: "schools",
    name: "Non-commercial / non-domestic — Government schools",
    description: "Government primary, secondary and higher secondary schools: ₹7.89/unit on ₹90/kW/month.",
    fixedCharge: { type: "per_kw", rate: 90 },
    energySlabs: [{ limit: Infinity, rate: 7.89 }],
  },
  {
    id: "ev",
    name: "LT Electric Vehicle charging station",
    description: "₹6.19/unit on ₹65/kW/month — the cheapest non-agricultural LT rate in the schedule.",
    fixedCharge: { type: "per_kw", rate: 65 },
    energySlabs: [{ limit: Infinity, rate: 6.19 }],
  },
];

const AS_SUBSIDY_NOTE = "The rates here are the effective rates after the Government of Assam's subsidy, which is what your bill charges. The underlying full-cost tariff is higher — ₹5.99 on the first slab against an effective ₹4.25 — and the difference is a State commitment rather than a permanent feature of the tariff.";

export default {
  state: "Assam",
  ratesAsOf: "AERC order dt. 25-Mar-2025, w.e.f. 1 April 2025 (APDCL petitioned to continue it unchanged for FY 2026-27)",
  sourceUrl: "https://aerc.gov.in",
  discoms: [
    {
      id: "apdcl",
      name: "APDCL",
      fullName: "Assam Power Distribution Company Ltd.",
      area: "Entire Assam",
      tariffYear: "2025-26",
      website: "https://www.apdcl.org",
      categories: [
        {
          id: "domestic",
          // Domestic electricity duty: 5% of the bill. CEA does not list this state as energy-charge-only, so duty applies to the wider bill.
          // Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply
          // in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: [{ name: "Electricity Duty", type: "percent_total", rate: 5 }],
          name: "LT Domestic",
          supplyTypes: AS_DOMESTIC_TYPES,
          fixedCharge: AS_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: AS_DOMESTIC_TYPES[0].energySlabs,
          notes: `Assam splits domestic supply by sanctioned load first, then by consumption. Below 5 kW you are Domestic-A with five telescopic slabs; from 5 kW you are Domestic-B, where the underlying rate never changes and only the subsidy shrinks. Both pay ₹70/kW/month. ${AS_SUBSIDY_NOTE} AERC has also introduced an optional Time-of-Day tariff for Domestic A and B — a rebate during solar hours and a surcharge in the evening peak — which is not modelled here.`,
        },
        {
          id: "commercial",
          name: "LT Commercial & General Purpose",
          supplyTypes: AS_COMMERCIAL_TYPES,
          fixedCharge: AS_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: AS_COMMERCIAL_TYPES[0].energySlabs,
          notes: "None of the non-domestic LT categories are slabbed — each is a single rate on every unit, and none carries a State subsidy. What separates them is the fixed charge, which ranges from ₹65/kW for an EV charging station to ₹165/kW for general purpose supply. Time-of-Day tariff is optional for LT Commercial, General Purpose and EV charging and is not modelled here.",
        },
        {
          id: "agricultural",
          name: "LT Agriculture — up to 30 kW",
          fixedCharge: { type: "per_kw", rate: 65 },
          energySlabs: [{ limit: Infinity, rate: 6.09 }],
          notes: "A flat ₹6.09/unit on ₹65/kW/month, with no State subsidy applied to the tariff.",
        },
      ],
    },
  ],
};
