// Tripura — Electricity Tariff Data (FY 2026-27)
// Rates: TERC "Tariff Order for TSECL for FY 2026-27", Annexure 2 — "Tariff Schedule for
// FY 2026-27 after considering Government Subsidy". Revised tariffs took effect 1 May 2026.
//
// TERC publishes three numbers per slab: the approved energy charge, the Government of
// Tripura subsidy, and the resulting rate. The rate AFTER subsidy is what the bill charges,
// so that is what is modelled; the gross charge is recorded per slab in a comment, because
// the subsidy is a State commitment that can lapse. Same treatment as Assam.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const TR_DOMESTIC_TYPES = [
  {
    id: "domestic",
    name: "Domestic (rural and urban)",
    description: "The ordinary household category: four telescopic slabs from ₹4.86 to ₹8.52 after subsidy, on ₹70 per kW per month.",
    fixedCharge: { type: "per_kw", rate: 70 },
    energySlabs: [
      { limit: 50, rate: 4.86 },   // 5.53 gross − 0.67 subsidy
      { limit: 150, rate: 6.41 },  // 6.93 gross − 0.52
      { limit: 300, rate: 7.32 },  // no subsidy
      { limit: Infinity, rate: 8.52 },  // no subsidy
    ],
  },
  {
    id: "rural_low",
    name: "Domestic (rural) — 50 units or fewer",
    description: "A concessional rural rate of ₹3.94 after subsidy, on ₹70/kW/month. It applies only while consumption stays at or below 50 units in the billing period; above that the ordinary domestic slabs apply.",
    fixedCharge: { type: "per_kw", rate: 70 },
    energySlabs: [{ limit: Infinity, rate: 3.94 }],   // 4.63 gross − 0.69
  },
  {
    id: "kutir_jyoti",
    name: "Kutir Jyoti",
    description: "The lifeline category: ₹2.31/unit after subsidy on a flat ₹30 per connection per month.",
    fixedCharge: { type: "flat", rate: 30 },
    energySlabs: [{ limit: Infinity, rate: 2.31 }],   // 3.00 gross − 0.69
  },
  {
    id: "three_phase",
    name: "Domestic — three phase (compulsory above 4 kW)",
    description: "A single ₹8.37 after subsidy on all units, on ₹125/kW/month. Any domestic connection above 4 kW must take three-phase supply and this rate.",
    fixedCharge: { type: "per_kw", rate: 125 },
    energySlabs: [{ limit: Infinity, rate: 8.37 }],   // 8.52 gross − 0.15
  },
];

const TR_COMMERCIAL_TYPES = [
  {
    id: "commercial",
    name: "Commercial — single phase",
    description: "₹7.21 after subsidy up to 150 units and ₹8.34 beyond, on ₹150 per kW per month.",
    fixedCharge: { type: "per_kw", rate: 150 },
    energySlabs: [
      { limit: 150, rate: 7.21 },  // 7.72 gross − 0.51
      { limit: Infinity, rate: 8.34 },  // no subsidy
    ],
  },
  {
    id: "pan_shop",
    name: "Small commercial / pan shop — 50 units or fewer",
    description: "₹6.27 after subsidy, on ₹150/kW/month, for very small commercial connections consuming up to 50 units.",
    fixedCharge: { type: "per_kw", rate: 150 },
    energySlabs: [{ limit: Infinity, rate: 6.27 }],   // 6.89 gross − 0.62
  },
  {
    id: "semi_commercial",
    name: "Semi-commercial",
    description: "₹8.40 after subsidy on all units, on ₹195/kW/month.",
    fixedCharge: { type: "per_kw", rate: 195 },
    energySlabs: [{ limit: Infinity, rate: 8.40 }],   // 8.50 gross − 0.10
  },
  {
    id: "three_phase",
    name: "Commercial — three phase (compulsory above 4 kW)",
    description: "₹8.62 after subsidy on all units, on ₹195/kW/month.",
    fixedCharge: { type: "per_kw", rate: 195 },
    energySlabs: [{ limit: Infinity, rate: 8.62 }],   // 8.72 gross − 0.10
  },
  {
    id: "non_domestic",
    name: "Non-domestic / non-commercial — single phase up to 4 kVA",
    description: "₹7.60/unit on ₹165/kW/month, with no subsidy at all. Above 4 kVA the rate is ₹8.67 on ₹170/kW.",
    fixedCharge: { type: "per_kw", rate: 165 },
    energySlabs: [{ limit: Infinity, rate: 7.60 }],
  },
  {
    id: "mobile_tower",
    name: "Mobile tower",
    description: "₹8.59/unit against the heaviest fixed charge in the LT schedule, ₹320 per kW per month, and no subsidy.",
    fixedCharge: { type: "per_kw", rate: 320 },
    energySlabs: [{ limit: Infinity, rate: 8.59 }],
  },
];

const TR_SUBSIDY_NOTE = "The rates here are after the Government of Tripura subsidy, which is what your bill charges. The approved tariff behind them is higher — ₹5.53 on the first domestic slab against ₹4.86 billed — and the subsidy tapers to nothing above 150 units, so the top two slabs are already unsubsidised.";

export default {
  state: "Tripura",
  ratesAsOf: "FY 2026-27 (TERC Tariff Order for TSECL, Annexure 2 — revised tariffs effective 01-May-2026)",
  sourceUrl: "https://terc.tripura.gov.in/tariff-order",
  discoms: [
    {
      id: "tsecl",
      name: "TSECL",
      fullName: "Tripura State Electricity Corporation Ltd.",
      area: "Entire Tripura",
      tariffYear: "2026-27",
      website: "https://www.tsecl.in",
      categories: [
        {
          id: "domestic",
          name: "Domestic Supply",
          supplyTypes: TR_DOMESTIC_TYPES,
          fixedCharge: TR_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: TR_DOMESTIC_TYPES[0].energySlabs,
          notes: `Tripura subsidises the bottom of the ladder and nothing above it: 67 paise comes off the first slab, 52 paise off the second, and the 151-300 and 301+ slabs get nothing. Crossing 150 units therefore costs more than the headline rate suggests, because you lose the subsidy as well as moving up a slab. Any domestic connection above 4 kW must take three-phase supply, which is a single flat rate rather than slabs. ${TR_SUBSIDY_NOTE}`,
        },
        {
          id: "commercial",
          name: "Commercial & Non-Domestic",
          supplyTypes: TR_COMMERCIAL_TYPES,
          fixedCharge: TR_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: TR_COMMERCIAL_TYPES[0].energySlabs,
          notes: `Commercial supply carries a much heavier fixed charge than domestic — ₹150/kW against ₹70 — and the non-domestic and mobile-tower categories get no subsidy at all. A mobile tower pays ₹320 per kW a month, over four times the domestic figure. As with domestic, three-phase supply becomes compulsory above 4 kW. ${TR_SUBSIDY_NOTE}`,
        },
      ],
    },
  ],
};
