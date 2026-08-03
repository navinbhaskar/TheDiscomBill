// Jammu & Kashmir — Electricity Tariff Data (FY 2025-26)
// Rates: JERC for the UT of J&K and Ladakh, "JPDCL & KPDCL ARR and Tariff for FY 2025-26".
// One order covers both licensees, so JPDCL (Jammu) and KPDCL (Kashmir) share a schedule.
// tariffYear stays 2025-26: no FY 2026-27 order could be located, and the file names the
// order that demonstrably exists rather than assuming a rollover.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// Schedule 1. Fixed charge is ₹8.00/kW/month — a striking figure, and one worth stating
// plainly because secondary sources widely report ₹40/kW. The order's own table reads
// "Fixed Charges for contracted load (Rs./kW/month) … For all units … 8.00".
const JK_DOMESTIC_TYPES = [
  {
    id: "metered",
    name: "Domestic — metered",
    description: "Three telescopic slabs — ₹2.30 up to 200 units, ₹4.00 to 400, ₹4.35 beyond — on ₹8/kW/month. Among the cheapest domestic tariffs in India.",
    fixedCharge: { type: "per_kw", rate: 8 },
    energySlabs: [
      { limit: 200, rate: 2.30 },
      { limit: 400, rate: 4.00 },
      { limit: Infinity, rate: 4.35 },
    ],
  },
  {
    id: "bpl",
    name: "Domestic — Below Poverty Line (up to 30 units/month)",
    description: "₹1.40/unit on ₹5/kW/month. The concession only covers the first 30 units: anything beyond is charged at the ordinary metered rates for the relevant slab.",
    fixedCharge: { type: "per_kw", rate: 5 },
    energySlabs: [{ limit: Infinity, rate: 1.40 }],
  },
];

const JK_COMMERCIAL_TYPES = [
  {
    id: "single_phase",
    name: "Non-domestic / commercial — single phase",
    description: "₹3.55 up to 200 units, ₹5.40 to 500, ₹5.85 beyond, on ₹60/kW/month. Note the first two published bands carry the same ₹3.55 rate.",
    fixedCharge: { type: "per_kw", rate: 60 },
    energySlabs: [
      { limit: 100, rate: 3.55 },
      { limit: 200, rate: 3.55 },
      { limit: 500, rate: 5.40 },
      { limit: Infinity, rate: 5.85 },
    ],
  },
  {
    id: "three_phase",
    name: "Non-domestic / commercial — three phase",
    description: "A single ₹5.85 on all units, against a much heavier ₹130 per kVA per month demand charge.",
    fixedCharge: { type: "per_kva", rate: 130 },
    energySlabs: [{ limit: Infinity, rate: 5.85 }],
  },
];

const JK_ROUNDING_NOTE = "J&K rounds sanctioned load UP to the next half kilowatt before applying the fixed charge — the order's example is 0.25 kW billed as 0.5 kW and 1.2 kW billed as 1.5 kW. The calculator does not round, so a real bill may show slightly more.";

const jkCategories = () => [
  {
    id: "domestic",
    name: "Domestic Supply",
    supplyTypes: JK_DOMESTIC_TYPES,
    fixedCharge: JK_DOMESTIC_TYPES[0].fixedCharge,
    energySlabs: JK_DOMESTIC_TYPES[0].energySlabs,
    notes: `J&K's domestic tariff is among the cheapest in the country — ₹2.30 for the first 200 units against a fixed charge of just ₹8 per kW a month. ${JK_ROUNDING_NOTE} For a group housing society on a single connection, JERC scales the slabs by the number of houses: ten houses get the first-slab rate on the first 2,000 units, not the first 200. Electricity duty and other levies are charged in addition to the rates here.`,
  },
  {
    id: "commercial",
    name: "Non-Domestic / Commercial Supply",
    supplyTypes: JK_COMMERCIAL_TYPES,
    fixedCharge: JK_COMMERCIAL_TYPES[0].fixedCharge,
    energySlabs: JK_COMMERCIAL_TYPES[0].energySlabs,
    notes: `The commercial category is a catch-all: JERC bills anything not covered by another schedule here, excluding only Government and Defence connections. Single phase is slabbed and billed per kW; three phase is a flat ₹5.85 against a per-kVA demand charge. A connection below 100 kW that is supplied and metered on HT earns a 5% rebate on energy charges. ${JK_ROUNDING_NOTE}`,
  },
];

export default {
  state: "Jammu & Kashmir",
  ratesAsOf: "FY 2025-26 (JERC for the UT of J&K and Ladakh — JPDCL & KPDCL ARR and Tariff for FY 2025-26)",
  sourceUrl: "https://www.jpdcl.co.in/downloads/tariff/JPDCL_KPDCL_Tariff_Order_2025_26.pdf",
  discoms: [
    {
      id: "jkpdd_jammu",
      name: "JPDCL (Jammu Region)",
      fullName: "Jammu Power Distribution Corporation Ltd.",
      area: "Jammu, Samba, Kathua, Udhampur, Reasi, Ramban, Doda, Kishtwar, Rajouri, Poonch",
      tariffYear: "2025-26",
      website: "https://www.jpdcl.co.in",
      categories: jkCategories(),
    },
    {
      id: "jkpdd_kashmir",
      name: "KPDCL (Kashmir Region)",
      fullName: "Kashmir Power Distribution Corporation Ltd.",
      area: "Srinagar, Baramulla, Anantnag, Pulwama, Kupwara, Budgam, Ganderbal, Bandipora, Shopian, Kulgam",
      tariffYear: "2025-26",
      website: "https://kpdcl.jk.gov.in",
      categories: jkCategories(),
    },
  ],
};
