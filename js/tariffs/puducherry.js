// Puducherry — Electricity Tariff Data (FY 2026-27)
// Rates: JERC "Order on Approval of True-up for FY 2023-24, APR for FY 2024-25, ARR for the
// 4th MYT Control Period from FY 2025-26 to FY 2029-30 and Determination of Retail Tariff,
// Electricity Department of Puducherry", Table 9-2 — the schedule approved for FY 2026-27.
// JERC publishes a separate table per year of the control period, so the FY 2026-27 figures
// are final and this file is current without a fresh order.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const PY_DOMESTIC_TYPES = [
  {
    id: "ltds2",
    name: "LTDS-II — domestic (demand based)",
    description: "The standard household category: five telescopic slabs from ₹2.90 to ₹7.90, on ₹35 per kW (or part thereof) per month.",
    fixedCharge: { type: "per_kw", rate: 35 },
    energySlabs: [
      { limit: 100, rate: 2.90 },
      { limit: 200, rate: 4.20 },
      { limit: 300, rate: 6.20 },
      { limit: 400, rate: 7.70 },
      { limit: Infinity, rate: 7.90 },
    ],
  },
  {
    id: "ltds1",
    name: "LTDS-I — lifeline services (connected-load based)",
    description: "₹2.65/unit on a flat ₹10 per connection per month — the cheapest fixed charge in the schedule.",
    fixedCharge: { type: "flat", rate: 10 },
    energySlabs: [{ limit: Infinity, rate: 2.65 }],
  },
  {
    id: "ltds3",
    name: "LTDS-III — common service",
    description: "Shared services in a residential building. Five paise above LTDS-II at every slab: ₹2.95 to ₹7.95, on the same ₹35/kW/month.",
    fixedCharge: { type: "per_kw", rate: 35 },
    energySlabs: [
      { limit: 100, rate: 2.95 },
      { limit: 200, rate: 4.25 },
      { limit: 300, rate: 6.25 },
      { limit: 400, rate: 7.75 },
      { limit: Infinity, rate: 7.95 },
    ],
  },
];

const PY_COMMERCIAL_TYPES = [
  {
    id: "nds1",
    name: "NDS-I — commercial",
    description: "Shops and offices, billed on kVAh: ₹6.25 up to 100 units, ₹7.30 to 200, ₹8.05 beyond, against ₹200 per kVA per month.",
    fixedCharge: { type: "per_kva", rate: 200 },
    energySlabs: [
      { limit: 100, rate: 6.25 },
      { limit: 200, rate: 7.30 },
      { limit: Infinity, rate: 8.05 },
    ],
  },
  {
    id: "nds2",
    name: "NDS-II — hotels and farmhouses",
    description: "A nickel above NDS-I at every band — ₹6.30, ₹7.35 and ₹8.10 — on the same ₹200/kVA.",
    fixedCharge: { type: "per_kva", rate: 200 },
    energySlabs: [
      { limit: 100, rate: 6.30 },
      { limit: 200, rate: 7.35 },
      { limit: Infinity, rate: 8.10 },
    ],
  },
  {
    id: "nds3",
    name: "NDS-III — hoardings",
    description: "The steepest rate in the schedule: ₹9.55/kVAh flat on all units, against ₹140/kVA/month.",
    fixedCharge: { type: "per_kva", rate: 140 },
    energySlabs: [{ limit: Infinity, rate: 9.55 }],
  },
  {
    id: "nds4",
    name: "NDS-IV — Government institutions",
    description: "₹7.50/kVAh on every unit — JERC sets the same rate for all three bands — against ₹200/kVA/month.",
    fixedCharge: { type: "per_kva", rate: 200 },
    energySlabs: [{ limit: Infinity, rate: 7.50 }],
  },
  {
    id: "nds5",
    name: "NDS-V — places of worship",
    description: "₹2.90/unit flat, on ₹35/kW/month. JERC lists five slabs but sets every one to the same rate, so consumption never changes the rate.",
    fixedCharge: { type: "per_kw", rate: 35 },
    energySlabs: [{ limit: Infinity, rate: 2.90 }],
  },
  {
    id: "ltev",
    name: "LTEV-I — EV charging station",
    description: "₹6.05/kVAh on ₹35/kVA/month — cheaper per unit than any commercial category.",
    fixedCharge: { type: "per_kva", rate: 35 },
    energySlabs: [{ limit: Infinity, rate: 6.05 }],
  },
];

const PY_LEVY_NOTE = "JERC's schedule is the tariff alone; electricity duty and other levies are charged on the bill in addition. Fixed charges are per kW or kVA 'or part thereof', so a fractional sanctioned load rounds up to the next whole unit on a real bill — the calculator does not round.";

export default {
  state: "Puducherry",
  ratesAsOf: "FY 2026-27 (JERC 4th MYT Control Period order for the Electricity Department of Puducherry, Table 9-2)",
  sourceUrl: "https://jercuts.gov.in/order_category/puducherry/",
  discoms: [
    {
      id: "pdicl",
      name: "PDICL / Electricity Dept.",
      fullName: "Puducherry Electricity Dept. / PDI Corporation Ltd.",
      area: "Puducherry, Karaikal, Mahe, Yanam",
      tariffYear: "2026-27",
      website: "https://electricity.py.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LTDS (Domestic Service)",
          supplyTypes: PY_DOMESTIC_TYPES,
          fixedCharge: PY_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: PY_DOMESTIC_TYPES[0].energySlabs,
          notes: `Puducherry's domestic ladder is gentle at the bottom and steep in the middle: ₹2.90 for the first 100 units, but the 201-300 band more than doubles that to ₹6.20 and 301-400 reaches ₹7.70. Almost all of the increase happens between 200 and 400 units, so that is the range where cutting consumption pays most. Because JERC approved every year of the FY 2025-26 to FY 2029-30 control period in one order, rates step up annually without a fresh order. ${PY_LEVY_NOTE}`,
        },
        {
          id: "commercial",
          name: "NDS (Non-Domestic Service)",
          supplyTypes: PY_COMMERCIAL_TYPES,
          fixedCharge: PY_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: PY_COMMERCIAL_TYPES[0].energySlabs,
          notes: `Non-domestic supply is billed on kVAh against a ₹200 per kVA monthly charge for most categories, so power factor affects the units you are charged for. What separates the categories is mostly what the premises is used for rather than how much it consumes — a hoarding pays ₹9.55 flat while a place of worship pays ₹2.90 flat, a spread far wider than any slab movement. ${PY_LEVY_NOTE}`,
        },
      ],
    },
  ],
};
