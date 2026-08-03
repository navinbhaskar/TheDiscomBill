// Chhattisgarh — Electricity Tariff Data (FY 2026-27)
// Rates: CSERC "Tariff Schedule for FY 2026-27", applicable from 1 July 2026.
// CSERC states in terms that BOTH energy charges and fixed charges are telescopic, and
// gives worked examples for each — see the notes below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// LV-1 Domestic. The order's own example: 150 units bills the first 100 at the 0-100 rate
// and the remaining 50 at the 101-200 rate.
const CG_DOMESTIC_SLABS = [
  { limit: 100, rate: 4.40 },
  { limit: 200, rate: 4.50 },
  { limit: 400, rate: 6.00 },
  { limit: 600, rate: 7.00 },
  { limit: Infinity, rate: 8.80 },
];

// The fixed charge is MARGINAL per kW, not a flat band amount — CSERC's example: a 7 kW
// connection pays ₹20/kW on the first 5 kW and ₹30/kW on the remaining 2 kW, i.e. ₹160.
// That is exactly `slab_per_kw`; reading it as `tiered` would bill 7 × 30 = ₹210.
const CG_DOMESTIC_FIXED = {
  type: "slab_per_kw",
  slabs: [
    { maxLoad: 5, rate: 20, label: "First 5 kW — ₹20/kW/month" },
    { maxLoad: 10, rate: 30, label: "Next 5 kW (above 5 up to 10) — ₹30/kW/month" },
    { maxLoad: Infinity, rate: 50, label: "Above 10 kW — ₹50/kW/month" },
  ],
};

const CG_COMMERCIAL_TYPES = [
  {
    id: "lv21",
    name: "LV-2.1 — Single phase non-domestic (up to 5 kW)",
    description: "Shops, offices, clinics, restaurants, coaching centres and similar on a single-phase connection up to 5 kW. Fixed charge ₹60/kW/month, which is also the monthly minimum whether or not you consume anything.",
    fixedCharge: { type: "per_kw", rate: 60 },
    energySlabs: [
      { limit: 100, rate: 6.50 },
      { limit: 400, rate: 7.60 },
      { limit: Infinity, rate: 9.10 },
    ],
  },
  {
    id: "lv22a",
    name: "LV-2.2(A) — Three phase non-domestic, up to 15 kW",
    description: "Three-phase non-domestic up to 15 kW. Billed on demand: ₹130/kW/month on the billing demand, which is also the monthly minimum.",
    fixedCharge: { type: "per_kw", rate: 130 },
    energySlabs: [
      { limit: 400, rate: 7.50 },
      { limit: Infinity, rate: 9.00 },
    ],
  },
  {
    id: "lv22b",
    name: "LV-2.2(B) — Three phase non-domestic, above 15 kW",
    description: "A single rate on all units, with a heavier demand charge of ₹210/kW/month on the billing demand.",
    fixedCharge: { type: "per_kw", rate: 210 },
    energySlabs: [{ limit: Infinity, rate: 8.40 }],
  },
  {
    id: "lv23",
    name: "LV-2.3 — Electric vehicle charging stations",
    description: "Flat ₹7.13/unit on all units with no fixed charge. The same rate applies to LV consumers who opt for minus metering.",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 7.13 }],
  },
];

const CG_LEVY_NOTE = "The CSERC schedule expressly excludes any tax or duty on electrical energy; those are notified separately by the State Government and are not included here, so your printed bill will carry them in addition.";

export default {
  state: "Chhattisgarh",
  ratesAsOf: "FY 2026-27 (CSERC Tariff Schedule for FY 2026-27, applicable from 01-Jul-2026)",
  sourceUrl: "https://cserc.gov.in",
  discoms: [
    {
      id: "cspdcl",
      name: "CSPDCL",
      fullName: "Chhattisgarh State Power Distribution Company Ltd.",
      area: "Entire Chhattisgarh",
      tariffYear: "2026-27",
      website: "https://www.cspdcl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LV-1 (Domestic)",
          fixedCharge: CG_DOMESTIC_FIXED,
          energySlabs: CG_DOMESTIC_SLABS,
          notes: `Both halves of a Chhattisgarh bill are telescopic. Energy: 150 units bills the first 100 at ₹4.40 and the next 50 at ₹4.50. Fixed charge: a 7 kW connection pays ₹20/kW on the first 5 kW plus ₹30/kW on the remaining 2 kW — ₹160, not 7 × ₹30. The fixed charge is also a monthly minimum, payable whether or not any energy is consumed. BPL consumers are billed on this same LV-1 schedule; the State Government's domestic subsidy is applied separately by order and is not modelled here. ${CG_LEVY_NOTE}`,
        },
        {
          id: "commercial",
          name: "LV-2 (Non-Domestic / Commercial)",
          supplyTypes: CG_COMMERCIAL_TYPES,
          fixedCharge: CG_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: CG_COMMERCIAL_TYPES[0].energySlabs,
          notes: `Non-domestic splits by phase and load: single phase up to 5 kW (LV-2.1), three phase up to 15 kW (LV-2.2 A) and above 15 kW (LV-2.2 B), plus a separate EV-charging rate. The fixed/demand charge is a monthly minimum in every case. CSERC also allows a 10% energy discount for registered women's self-help groups and for clinics in notified rural and tribal-development areas, and 25% for mobile towers in those areas — none of which is applied automatically here. ${CG_LEVY_NOTE}`,
        },
      ],
    },
  ],
};
