// Himachal Pradesh — Electricity Tariff Data (FY 2026-27)
// Rates: HPERC "Tariff Order for FY 2026-27" for HPSEBL-D, Part-II Schedule of Tariff,
// in force from 1 April 2026.
// Clause B of the Schedule: the rates are exclusive of electricity duty, so duty is not
// modelled here and appears on the bill in addition.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const HP_DOMESTIC_TYPES = [
  {
    id: "domestic",
    name: "DS — Other (ordinary) domestic consumers",
    description: "₹5.44/unit up to 125 units a month and ₹5.89 beyond, on a flat ₹85/month fixed charge that does not vary with load.",
    fixedCharge: { type: "flat", rate: 85 },
    energySlabs: [
      { limit: 125, rate: 5.44 },
      { limit: Infinity, rate: 5.89 },
    ],
  },
  {
    id: "lifeline",
    name: "DS — Lifeline consumers",
    description: "A concessional ₹4.71/unit on a ₹55/month fixed charge, available only up to 60 units a month. Cross 60 and the ordinary domestic tariff applies instead.",
    fixedCharge: { type: "flat", rate: 55 },
    energySlabs: [{ limit: Infinity, rate: 4.71 }],
  },
  {
    id: "tribal",
    name: "DS — Tribal and difficult areas",
    description: "Ordinary domestic energy rates, but the fixed charge is held at ₹55/month irrespective of consumption.",
    fixedCharge: { type: "flat", rate: 55 },
    energySlabs: [
      { limit: 125, rate: 5.44 },
      { limit: Infinity, rate: 5.89 },
    ],
  },
];

const HP_COMMERCIAL_TYPES = [
  {
    id: "cs_small",
    name: "CS — Commercial, contract demand up to 20 kVA",
    description: "Shops, hotels and anything not covered by another schedule: a single ₹6.39/unit on a flat ₹145/month fixed charge.",
    fixedCharge: { type: "flat", rate: 145 },
    energySlabs: [{ limit: Infinity, rate: 6.39 }],
  },
  {
    id: "cs_large",
    name: "CS — Commercial, contract demand above 20 kVA",
    description: "Two-part: no fixed charge, ₹6.30/kVAh energy and a ₹110/kVA/month demand charge. Above 100 kVA the rates become ₹6.20/kVAh and ₹170/kVA.",
    fixedCharge: { type: "per_kva", rate: 110 },
    energySlabs: [{ limit: Infinity, rate: 6.30 }],
  },
  {
    id: "ndncs_small",
    name: "NDNCS — Non-domestic non-commercial, up to 20 kVA",
    description: "Offices, institutions and similar non-commercial users: ₹6.37/unit on a flat ₹145/month.",
    fixedCharge: { type: "flat", rate: 145 },
    energySlabs: [{ limit: Infinity, rate: 6.37 }],
  },
  {
    id: "ndncs_large",
    name: "NDNCS — Non-domestic non-commercial, above 20 kVA",
    description: "Two-part: no fixed charge, ₹6.11/kVAh energy and a ₹140/kVA/month demand charge.",
    fixedCharge: { type: "per_kva", rate: 140 },
    energySlabs: [{ limit: Infinity, rate: 6.11 }],
  },
];

const HP_LEVY_NOTE = "Clause B of HPERC's Schedule states the rates are exclusive of electricity duty, so duty is billed in addition to the figures here. HPSEBL also applies a prepaid-meter rebate and, for two-part consumers, a Lower Voltage Supply Surcharge — neither is modelled.";

export default {
  state: "Himachal Pradesh",
  ratesAsOf: "FY 2026-27 (HPERC Tariff Order for HPSEBL, in force from 01-Apr-2026)",
  sourceUrl: "https://hperc.org",
  discoms: [
    {
      id: "hpsebl",
      name: "HPSEBL",
      fullName: "Himachal Pradesh State Electricity Board Ltd.",
      area: "Entire Himachal Pradesh",
      tariffYear: "2026-27",
      website: "https://www.hpseb.in",
      categories: [
        {
          id: "domestic",
          name: "DS (Domestic Supply)",
          supplyTypes: HP_DOMESTIC_TYPES,
          fixedCharge: HP_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: HP_DOMESTIC_TYPES[0].energySlabs,
          notes: `Himachal's domestic fixed charge is a flat monthly amount — ₹85, or ₹55 for lifeline consumers and for anyone in a tribal or difficult area — and does not scale with sanctioned load, which is unusual. Energy charges are telescopic across just two slabs. The lifeline rate is a cliff rather than a slab: it applies only while consumption stays at or below 60 units in the month, and the ordinary tariff takes over entirely once you cross. Consumers without an NOC from the planning or municipal authority are billed at the highest domestic slab for their whole consumption and lose the GoHP subsidy. ${HP_LEVY_NOTE}`,
        },
        {
          id: "commercial",
          name: "CS / NDNCS (Commercial & Non-Domestic)",
          supplyTypes: HP_COMMERCIAL_TYPES,
          fixedCharge: HP_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: HP_COMMERCIAL_TYPES[0].energySlabs,
          notes: `Non-domestic supply splits at 20 kVA of contract demand. At or below it you pay a flat fixed charge and a per-kWh rate; above it the fixed charge drops to nil and is replaced by a per-kVA demand charge, with energy billed on kVAh so power factor starts to matter. HPERC levies the demand charge on the higher of your actual 30-minute maximum demand or 85% of contract demand. Hoardings and billboards installed separately from the premises pay 10% more on energy. ${HP_LEVY_NOTE}`,
        },
      ],
    },
  ],
};
