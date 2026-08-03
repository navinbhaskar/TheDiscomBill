// Uttarakhand — Electricity Tariff Data (FY 2026-27)
// Rates: UERC order dt. 30-Mar-2026 (True-up FY 2024-25, APR FY 2025-26, ARR FY 2026-27
// for UPCL). Every figure below is the APPROVED column — UERC rejected UPCL's proposed
// ~18.9% increase and retained the existing rates, so the proposed column is not used.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// RTS-1, "Other Domestic Consumers". Telescopic.
const UK_DOMESTIC_SLABS = [
  { limit: 100, rate: 3.65 },
  { limit: 200, rate: 5.25 },
  { limit: 400, rate: 7.15 },
  { limit: Infinity, rate: 7.80 },
];

// The connected load picks ONE rate, which then applies to the whole load — a 3 kW
// connection pays 3 × ₹85 = ₹255, not 1×75 + 2×85. Hence `tiered` with perKw, not
// slab_per_kw, which would make the bands marginal and undercharge.
const UK_DOMESTIC_FIXED = {
  type: "tiered",
  perKw: true,
  slabs: [
    { maxLoad: 1, rate: 75, label: "Up to 1 kW — ₹75/kW/month" },
    { maxLoad: 4, rate: 85, label: "Above 1 kW up to 4 kW — ₹85/kW/month" },
    { maxLoad: Infinity, rate: 100, label: "Above 4 kW — ₹100/kW/month" },
  ],
};

const UK_DOMESTIC_TYPES = [
  {
    id: "domestic",
    name: "RTS-1 — Other Domestic Consumers",
    description: "The ordinary household tariff: four telescopic slabs from ₹3.65 to ₹7.80, on a fixed charge whose per-kW rate is set by sanctioned load.",
    fixedCharge: UK_DOMESTIC_FIXED,
    energySlabs: UK_DOMESTIC_SLABS,
  },
  {
    id: "lifeline",
    name: "RTS-1 — Life Line Consumers",
    description: "₹1.85/unit on a flat ₹18 per connection per month — charged per connection, not per kW.",
    fixedCharge: { type: "flat", rate: 18 },
    energySlabs: [{ limit: Infinity, rate: 1.85 }],
  },
  {
    id: "snowbound",
    name: "RTS-1A — Snowbound areas (Domestic)",
    description: "The concessional schedule for notified snowbound areas: ₹1.85/unit on ₹18 per connection per month, with no consumption slabs at all.",
    fixedCharge: { type: "flat", rate: 18 },
    energySlabs: [{ limit: Infinity, rate: 1.85 }],
  },
  {
    id: "bulk",
    name: "RTS-1 — Single point bulk supply (domestic)",
    description: "Bulk supply to a housing society or colony, billed on kVAh: ₹6.25/kVAh on ₹120/kVA/month.",
    fixedCharge: { type: "per_kva", rate: 120 },
    energySlabs: [{ limit: Infinity, rate: 6.25 }],
  },
];

const UK_NONDOMESTIC_TYPES = [
  {
    id: "small",
    name: "RTS-2 — Up to 4 kW and up to 60 units/month",
    description: "The smallest non-domestic band: ₹5.75/unit on ₹90/kW/month. Exceed 60 units in a month and you fall to the ₹7.75 schedule instead.",
    fixedCharge: { type: "per_kw", rate: 90 },
    energySlabs: [{ limit: Infinity, rate: 5.75 }],
  },
  {
    id: "others_25kw",
    name: "RTS-2 — Others up to 25 kW",
    description: "The general shop-and-office rate: ₹7.75/unit on ₹110/kW/month.",
    fixedCharge: { type: "per_kw", rate: 110 },
    energySlabs: [{ limit: Infinity, rate: 7.75 }],
  },
  {
    id: "above_25kw",
    name: "RTS-2 — Above 25 kW",
    description: "Billed on kVAh against a demand charge: ₹7.80/kVAh on ₹115/kVA/month, so a poor power factor raises the units charged.",
    fixedCharge: { type: "per_kva", rate: 115 },
    energySlabs: [{ limit: Infinity, rate: 7.80 }],
  },
  {
    id: "govt_hospitals",
    name: "RTS-2 — Government, hospitals and charitable institutions up to 25 kW",
    description: "₹6.00/unit on ₹90/kW/month. Above 25 kW the rate is ₹5.85/kVAh on ₹100/kVA.",
    fixedCharge: { type: "per_kw", rate: 90 },
    energySlabs: [{ limit: Infinity, rate: 6.00 }],
  },
  {
    id: "education",
    name: "RTS-2 — Government / Government-aided educational institutions up to 10 kW",
    description: "₹6.00/unit on ₹90/kW/month. UERC has merged institutions above 10 kW into the ordinary non-domestic schedule.",
    fixedCharge: { type: "per_kw", rate: 90 },
    energySlabs: [{ limit: Infinity, rate: 6.00 }],
  },
  {
    id: "hoardings",
    name: "RTS-2 — Independent advertisement hoardings",
    description: "The highest LT non-domestic rate: ₹8.60/unit on ₹140/kW/month.",
    fixedCharge: { type: "per_kw", rate: 140 },
    energySlabs: [{ limit: Infinity, rate: 8.60 }],
  },
];

const UK_PREPAID_NOTE = "UERC has approved a prepaid rebate of 4% of energy charges for domestic consumers and 3% for other categories, applicable only once a prepaid meter is actually installed and operational. It is not applied automatically here.";

export default {
  state: "Uttarakhand",
  ratesAsOf: "FY 2026-27 (UERC order dt. 30-Mar-2026 — existing rates retained, UPCL's proposed hike rejected)",
  sourceUrl: "https://uerc.uk.gov.in",
  discoms: [
    {
      id: "upcl",
      name: "UPCL",
      fullName: "Uttarakhand Power Corporation Ltd.",
      area: "Entire Uttarakhand",
      tariffYear: "2026-27",
      website: "https://www.upcl.org",
      categories: [
        {
          id: "domestic",
          name: "RTS-1 (Domestic)",
          supplyTypes: UK_DOMESTIC_TYPES,
          fixedCharge: UK_DOMESTIC_FIXED,
          energySlabs: UK_DOMESTIC_SLABS,
          notes: `Uttarakhand's domestic fixed charge is banded by sanctioned load, and the band selects a per-kW rate that applies to the whole load — a 3 kW connection pays 3 × ₹85 = ₹255, not a blended figure. Energy charges are telescopic across four slabs. Life Line and snowbound-area consumers instead pay a flat ₹18 per connection with no slabs. ${UK_PREPAID_NOTE} Electricity duty and other State levies sit outside the tariff schedule and are billed in addition.`,
        },
        {
          id: "commercial",
          name: "RTS-2 (Non-Domestic)",
          supplyTypes: UK_NONDOMESTIC_TYPES,
          fixedCharge: UK_NONDOMESTIC_TYPES[1].fixedCharge,
          energySlabs: UK_NONDOMESTIC_TYPES[1].energySlabs,
          notes: `None of the non-domestic categories are slabbed — each is a single rate on every unit, and what separates them is the load band and the fixed charge. The one consumption test in the schedule is at the bottom: the ₹5.75 rate needs BOTH load up to 4 kW and consumption up to 60 units a month, and losing either drops you to ₹7.75. Above 25 kW billing switches to kVAh against a demand charge. ${UK_PREPAID_NOTE}`,
        },
      ],
    },
  ],
};
