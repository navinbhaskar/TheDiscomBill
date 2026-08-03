// Jharkhand — Electricity Tariff Data (FY 2026-27)
// Rates: JSERC order — True-up FY 2024-25, APR FY 2025-26, MYT ARR for FY 2026-27 to
// FY 2030-31, and tariff determination for FY 2026-27 — Chapter 13, Tariff Schedule.
// Jharkhand has NO consumption slabs in any LT category: every rate below is a single
// rate on all units. What varies is rural vs urban, and the basis of the fixed charge.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// Domestic fixed charges are per CONNECTION, not per kW. The order says so in terms:
// "As the Fixed Charges are applicable per connection basis, there is little relevance of
// load for Tariff purpose, the Petitioner should not normally inspect consumer premises on
// the pretext of load verification."
const JH_DOMESTIC_TYPES = [
  {
    id: "urban",
    name: "DS Urban — areas under a Nagar Nigam, Parishad or Panchayat",
    description: "₹7.40/unit on a flat ₹100 per connection per month. No slabs — the same rate applies from the first unit to the last.",
    fixedCharge: { type: "flat", rate: 100 },
    energySlabs: [{ limit: Infinity, rate: 7.40 }],
  },
  {
    id: "rural",
    name: "DS Rural — areas outside municipal limits",
    description: "₹7.20/unit on a flat ₹75 per connection per month.",
    fixedCharge: { type: "flat", rate: 75 },
    energySlabs: [{ limit: Infinity, rate: 7.20 }],
  },
];

// Commercial reverses the basis: per kW, so load matters here in a way it does not for
// domestic. Small commercial (up to 5 kW contracted) is billed on the DOMESTIC schedule.
const JH_COMMERCIAL_TYPES = [
  {
    id: "urban",
    name: "CS Urban — commercial in municipal areas",
    description: "₹7.30/unit on ₹200 per kW per month.",
    fixedCharge: { type: "per_kw", rate: 200 },
    energySlabs: [{ limit: Infinity, rate: 7.30 }],
  },
  {
    id: "rural",
    name: "CS Rural — commercial outside municipal areas",
    description: "₹6.70/unit on ₹120 per kW per month.",
    fixedCharge: { type: "per_kw", rate: 120 },
    energySlabs: [{ limit: Infinity, rate: 6.70 }],
  },
  {
    id: "ht",
    name: "CS-HT — commercial at 100 kVA and above",
    description: "Supply at 6.6 kV and above, billed on kVAh: ₹8.00/kVAh on ₹400/kVA/month. Schools and colleges are excluded from this category.",
    fixedCharge: { type: "per_kva", rate: 400 },
    energySlabs: [{ limit: Infinity, rate: 8.00 }],
  },
];

const JH_SUBSIDY_NOTE = "The Government of Jharkhand's free-electricity scheme covers domestic consumption up to 200 units a month. It is a State subsidy applied to the bill, not a tariff rate, and is not modelled here — the figures shown are the JSERC tariff before any subsidy.";

export default {
  state: "Jharkhand",
  ratesAsOf: "FY 2026-27 (JSERC tariff determination for FY 2026-27, first year of the FY 2026-27 to FY 2030-31 control period)",
  sourceUrl: "https://jserc.org/tariff.aspx",
  discoms: [
    {
      id: "jbvnl",
      name: "JBVNL",
      fullName: "Jharkhand Bijli Vitran Nigam Ltd.",
      area: "Entire Jharkhand",
      tariffYear: "2026-27",
      website: "https://jbvnl.co.in",
      categories: [
        {
          id: "domestic",
          name: "DS (Domestic Service)",
          supplyTypes: JH_DOMESTIC_TYPES,
          fixedCharge: JH_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: JH_DOMESTIC_TYPES[0].energySlabs,
          notes: `Jharkhand does not slab domestic supply at all — one rate applies to every unit, and the only split is rural against urban. The fixed charge is levied per connection rather than per kW, and JSERC directs JBVNL not to inspect premises for load verification on that basis, so sanctioned load does not change a domestic bill. The domestic schedule also catches any connection up to 5 kW of contracted demand that would otherwise be commercial, industrial or institutional. ${JH_SUBSIDY_NOTE} JSERC abolished meter rent for every category from FY 2026-27.`,
        },
        {
          id: "commercial",
          name: "CS (Commercial Service)",
          supplyTypes: JH_COMMERCIAL_TYPES,
          fixedCharge: JH_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: JH_COMMERCIAL_TYPES[0].energySlabs,
          notes: "Commercial reverses the domestic basis: the fixed charge is per kW, so load matters here in a way it does not for a household. Anything up to 5 kW of contracted demand is billed on the domestic schedule instead, which is cheaper on the fixed charge. At 100 kVA and above, supply moves to HT and is billed on kVAh against a ₹400/kVA demand charge, with billing demand taken as the higher of recorded maximum demand or 50% of contract demand.",
        },
      ],
    },
  ],
};
