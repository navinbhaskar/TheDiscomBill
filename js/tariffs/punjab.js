// Punjab — Electricity Tariff Data (FY 2026-27)
// Rates: PSERC tariff order for PSPCL, FY 2026-27, effective 01-04-2026 to 31-03-2027,
// as circulated by PSPCL (Annexure-A, "Existing Tariff and the new tariff for FY 2026-27").
// PSERC CUT rates across the board this year on the back of a surplus — the ≤2 kW domestic
// slab fell from ₹5.40 to ₹3.85 and the above-300 rate from ₹7.75 to ₹7.05.
// Category structure cross-checked against the FY 2025-26 order (Schedules SV and SVI).
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// Domestic Supply (Schedule DS-SVI). The band is chosen by SANCTIONED LOAD; within a band
// the slabs are telescopic (first 300 units at the lower rate, the rest at ₹7.05).
const PB_DOMESTIC_TYPES = [
  {
    id: "ds2",
    name: "DS — sanctioned load up to 2 kW",
    description: "Energy charge cut from ₹5.40 to ₹3.85/unit for the first 300 units in the FY 2026-27 order. Fixed charge ₹50/kW/month.",
    fixedCharge: { type: "per_kw", rate: 50 },
    energySlabs: [
      { limit: 300, rate: 3.85 },
      { limit: Infinity, rate: 7.05 },
    ],
  },
  {
    id: "ds7",
    name: "DS — above 2 kW and up to 7 kW",
    description: "The band most Punjab households sit in. First 300 units at ₹4.25 (down from ₹5.72), the rest at ₹7.05. Fixed charge ₹70/kW/month, down from ₹75.",
    fixedCharge: { type: "per_kw", rate: 70 },
    energySlabs: [
      { limit: 300, rate: 4.25 },
      { limit: Infinity, rate: 7.05 },
    ],
  },
  {
    id: "ds20",
    name: "DS — above 7 kW and up to 20 kW",
    description: "First 300 units at ₹5.00 (down from ₹6.44), the rest at ₹7.05. Fixed charge ₹100/kW/month, down from ₹110.",
    fixedCharge: { type: "per_kw", rate: 100 },
    energySlabs: [
      { limit: 300, rate: 5.00 },
      { limit: Infinity, rate: 7.05 },
    ],
  },
  {
    id: "ds100",
    name: "DS — above 20 kW/kVA and up to 100 kVA",
    description: "Flat rate on all units, billed on kVAh. No consumption slabs at this size.",
    fixedCharge: { type: "per_kva", rate: 130 },
    demandUnit: "kVA",
    energySlabs: [{ limit: Infinity, rate: 6.20 }],
  },
  {
    id: "ds100p",
    name: "DS — demand above 100 kVA",
    fixedCharge: { type: "per_kva", rate: 140 },
    demandUnit: "kVA",
    energySlabs: [{ limit: Infinity, rate: 6.40 }],
  },
];

// Non-Residential Supply (Schedule NRS-SV). Slab boundary is 500 units, not 300.
const PB_NRS_TYPES = [
  {
    id: "nrs7",
    name: "NRS — sanctioned load up to 7 kW",
    description: "Shops, offices and other non-residential connections up to 7 kW. First 500 units at ₹6.10 (down from ₹6.89), the rest at ₹7.10. Fixed charge ₹70/kW/month.",
    fixedCharge: { type: "per_kw", rate: 70 },
    energySlabs: [
      { limit: 500, rate: 6.10 },
      { limit: Infinity, rate: 7.10 },
    ],
  },
  {
    id: "nrs20",
    name: "NRS — above 7 kW and up to 20 kW",
    description: "Same energy rates as the ≤7 kW band; the difference is the fixed charge, ₹100/kW/month (down from ₹110).",
    fixedCharge: { type: "per_kw", rate: 100 },
    energySlabs: [
      { limit: 500, rate: 6.10 },
      { limit: Infinity, rate: 7.10 },
    ],
  },
  {
    id: "nrs100",
    name: "NRS — above 20 kW/kVA and up to 100 kVA",
    description: "Flat rate on all units, billed on kVAh.",
    fixedCharge: { type: "per_kva", rate: 130 },
    demandUnit: "kVA",
    energySlabs: [{ limit: Infinity, rate: 6.25 }],
  },
  {
    id: "nrs100p",
    name: "NRS — demand above 100 kVA",
    fixedCharge: { type: "per_kva", rate: 140 },
    demandUnit: "kVA",
    energySlabs: [{ limit: Infinity, rate: 6.45 }],
  },
  {
    id: "ev",
    name: "NRS — EV Charging Stations",
    description: "Cut from ₹6.28 to ₹5.00/kVAh in the FY 2026-27 order, with no fixed charge.",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 5.00 }],
  },
];

export default {
  state: "Punjab",
  ratesAsOf: "FY 2026-27 (PSERC tariff order for PSPCL, w.e.f. 01-Apr-2026)",
  sourceUrl: "https://pserc.gov.in/pages/tariff-orders.html",
  discoms: [
    {
      id: "pspcl",
      name: "PSPCL",
      fullName: "Punjab State Power Corporation Ltd.",
      area: "Entire Punjab (excl. Chandigarh)",
      tariffYear: "2026-27",
      website: "https://www.pspcl.in",
      categories: [
        {
          id: "domestic",
          name: "DS (Domestic Supply)",
          supplyTypes: PB_DOMESTIC_TYPES,
          fixedCharge: PB_DOMESTIC_TYPES[1].fixedCharge,
          energySlabs: PB_DOMESTIC_TYPES[1].energySlabs,
          notes: "Punjab picks the domestic band by sanctioned load, not by consumption, and the slabs inside a band are telescopic — the first 300 units at the band's own rate, everything above at ₹7.05. PSERC reduced rates across every band for FY 2026-27. The State's 300 free units a month still apply on top, so many domestic bills settle at zero. Statutory levies (electricity duty, cow cess, infrastructure development fee) are notified by the State Government rather than by PSERC and are NOT included in this calculation — your actual bill will carry them.",
        },
        {
          id: "commercial",
          name: "NRS (Non-Residential Supply / Commercial)",
          supplyTypes: PB_NRS_TYPES,
          fixedCharge: PB_NRS_TYPES[0].fixedCharge,
          energySlabs: PB_NRS_TYPES[0].energySlabs,
          notes: "The NRS slab boundary is 500 units, not the 300 used for domestic. Above 20 kW the schedule switches to kVAh billing, so power factor feeds straight into the energy charge. Statutory levies notified by the State Government are not included here.",
        },
      ],
    },
  ],
};
