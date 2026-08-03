// Chandigarh — Electricity Tariff Data (FY 2026-27)
// Rates: JERC "Order on Approval of ARR and Determination of Retail Tariff for MYT Control
// Period from FY 2025-26 to FY 2029-30, Chandigarh Power Distribution Limited (CPDL)",
// Chapter 8 Tariff Schedule (Table 121). New rates took effect 1 November 2025.
// As in Goa, JERC approved a rate for EVERY year of the control period in one order, so the
// FY 2026-27 column below is final and this file is current without a fresh order.
//
// Distribution in Chandigarh passed from the Electricity Department, Chandigarh
// Administration to CPDL on privatisation; the discom id is unchanged for URL continuity.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const CH_DOMESTIC_TYPES = [
  {
    id: "ltds2",
    name: "LTDS-II — ordinary domestic",
    description: "The standard household category: five telescopic slabs from ₹2.95 to ₹5.40, on ₹30 per kW (or part thereof) per month.",
    fixedCharge: { type: "per_kw", rate: 30 },
    energySlabs: [
      { limit: 100, rate: 2.95 },
      { limit: 200, rate: 3.75 },
      { limit: 300, rate: 4.80 },
      { limit: 400, rate: 5.00 },
      { limit: Infinity, rate: 5.40 },
    ],
  },
  {
    id: "ltds1",
    name: "LTDS-I — connected-load based (lifeline)",
    description: "A single ₹2.90/unit on a flat ₹30 per connection per month, with no slabs.",
    fixedCharge: { type: "flat", rate: 30 },
    energySlabs: [{ limit: Infinity, rate: 2.90 }],
  },
  {
    id: "ltds3",
    name: "LTDS-III — demand based",
    description: "Marginally above LTDS-II at every slab: ₹3.00 to ₹5.45 on the same ₹30/kW/month.",
    fixedCharge: { type: "per_kw", rate: 30 },
    energySlabs: [
      { limit: 100, rate: 3.00 },
      { limit: 200, rate: 3.80 },
      { limit: 300, rate: 4.85 },
      { limit: 400, rate: 5.05 },
      { limit: Infinity, rate: 5.45 },
    ],
  },
];

const CH_COMMERCIAL_TYPES = [
  {
    id: "nds1",
    name: "NDS-I — non-domestic service",
    description: "Three telescopic bands on kVAh — ₹4.60 up to 100 units, ₹4.80 to 200, ₹5.75 beyond — against ₹120 per kVA per month.",
    fixedCharge: { type: "per_kva", rate: 120 },
    energySlabs: [
      { limit: 100, rate: 4.60 },
      { limit: 200, rate: 4.80 },
      { limit: Infinity, rate: 5.75 },
    ],
  },
  {
    id: "nds2",
    name: "NDS-II — non-domestic service",
    description: "The same ₹120/kVA fixed charge on slightly different bands: ₹4.65, ₹4.75 and ₹5.80.",
    fixedCharge: { type: "per_kva", rate: 120 },
    energySlabs: [
      { limit: 100, rate: 4.65 },
      { limit: 200, rate: 4.75 },
      { limit: Infinity, rate: 5.80 },
    ],
  },
];

const CH_LEVY_NOTE = "JERC's schedule is the tariff alone; electricity duty and other levies are charged on the bill in addition. The fixed charge is per kW (or kVA) 'or part thereof', so a fractional sanctioned load is rounded up to the next whole unit on a real bill — the calculator does not round.";

export default {
  state: "Chandigarh",
  ratesAsOf: "FY 2026-27 (JERC MYT order for CPDL, FY 2025-26 to FY 2029-30 — FY 2026-27 rates approved in advance)",
  sourceUrl: "https://jercuts.gov.in/order_category/chandigarh/",
  discoms: [
    {
      id: "chandigarh_ed",
      name: "CPDL (Chandigarh)",
      fullName: "Chandigarh Power Distribution Limited",
      area: "Chandigarh Union Territory",
      tariffYear: "2026-27",
      website: "https://cpdl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LTDS (Domestic Service)",
          supplyTypes: CH_DOMESTIC_TYPES,
          fixedCharge: CH_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: CH_DOMESTIC_TYPES[0].energySlabs,
          notes: `Chandigarh's domestic tariff is unusually flat: the top slab (₹5.40) is under twice the first (₹2.95), where most states more than treble across the same range, so a heavy user here is treated far more gently than in Goa or Uttar Pradesh. Because JERC fixed the whole FY 2025-26 to FY 2029-30 control period in one order, rates step up each year without any fresh order — the same slab reaches ₹5.65 by FY 2029-30. ${CH_LEVY_NOTE}`,
        },
        {
          id: "commercial",
          name: "NDS (Non-Domestic Service)",
          supplyTypes: CH_COMMERCIAL_TYPES,
          fixedCharge: CH_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: CH_COMMERCIAL_TYPES[0].energySlabs,
          notes: `Non-domestic supply is billed on kVAh against a ₹120 per kVA monthly charge, so power factor affects the units you are charged for. The energy rates are close to domestic — ₹4.60 against ₹2.95 on the first slab — but the fixed charge is four times higher per unit of load, which is where the real difference sits for a small shop. ${CH_LEVY_NOTE}`,
        },
      ],
    },
  ],
};
