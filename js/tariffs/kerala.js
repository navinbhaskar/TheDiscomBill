// Kerala — Electricity Tariff Data (in force to 31-03-2027)
// Rates: KSERC Order No. 427/D(T)/2023/KSERC dated 5 December 2024 (OP No. 18/2023),
// published in the Kerala Gazette Extraordinary No. 3939 dated 9 December 2024.
// The schedule runs w.e.f. 01-04-2025 to 31-03-2027, so it is current for FY 2026-27 —
// KSERC rejected KSEB's proposed further hike for FY 2026-27.
// Applies to KSEB Ltd and all other licensees in the State.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// LT-I Domestic. Two regimes in one schedule, switched by monthly consumption:
//   ≤ 250 units — TELESCOPIC, each slab at its own rate.
//   > 250 units — NON-TELESCOPIC, one rate applied to every unit on the bill.
// This is why a 251-unit bill costs sharply more than a 250-unit one: the whole bill
// re-rates from a blended ~₹5.4/unit to a flat ₹6.75.
const KL_TELESCOPIC = [
  { limit: 50, rate: 3.35 },
  { limit: 100, rate: 4.25 },
  { limit: 150, rate: 5.35 },
  { limit: 200, rate: 7.20 },
  { limit: 250, rate: 8.50 },
];

const KL_DOMESTIC_LADDERS = [
  { maxUnits: 250, slabs: KL_TELESCOPIC },
  { maxUnits: 300, slabs: [{ limit: Infinity, rate: 6.75 }] },
  { maxUnits: 350, slabs: [{ limit: Infinity, rate: 7.60 }] },
  { maxUnits: 400, slabs: [{ limit: Infinity, rate: 7.95 }] },
  { maxUnits: 500, slabs: [{ limit: Infinity, rate: 8.25 }] },
  { maxUnits: Infinity, slabs: [{ limit: Infinity, rate: 9.20 }] },
];

// The fixed charge is banded by the same consumption steps, and differs by phase.
const klDomesticFixed = (rates) => ({
  type: "by_consumption",
  slabs: [50, 100, 150, 200, 250, 300, 350, 400, 500, Infinity].map((maxUnits, i) => ({
    maxUnits, rate: rates[i],
  })),
});

const KL_DOMESTIC_TYPES = [
  {
    id: "single_phase",
    name: "LT-I Domestic — single phase",
    description: "The standard domestic connection. Fixed charge runs ₹50/month at low consumption up to ₹310/month above 500 units.",
    fixedCharge: klDomesticFixed([50, 85, 105, 140, 160, 220, 240, 260, 285, 310]),
    energySlabsByConsumption: KL_DOMESTIC_LADDERS,
    energySlabs: KL_TELESCOPIC,
  },
  {
    id: "three_phase",
    name: "LT-I Domestic — three phase",
    description: "Same energy rates as single phase; the fixed charge is higher at every band (₹130 to ₹310/month).",
    fixedCharge: klDomesticFixed([130, 175, 205, 215, 235, 240, 250, 260, 285, 310]),
    energySlabsByConsumption: KL_DOMESTIC_LADDERS,
    energySlabs: KL_TELESCOPIC,
  },
  {
    id: "bpl",
    name: "LT-I Domestic — BPL (≤ 1000 W, ≤ 40 units/month)",
    description: "BPL consumers with connected load of and below 1000 watts consuming up to 40 units a month: ₹1.50/unit and no fixed charge. Crossing either limit moves the connection to the ordinary domestic schedule.",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 1.50 }],
  },
];

// LT-VII(A) Commercial — the gazette marks the energy charge "Non telescopic" explicitly,
// so one rate applies to every unit on the bill.
const KL_COMMERCIAL_LADDERS = [
  { maxUnits: 100, slabs: [{ limit: Infinity, rate: 6.05 }] },
  { maxUnits: 200, slabs: [{ limit: Infinity, rate: 6.80 }] },
  { maxUnits: 300, slabs: [{ limit: Infinity, rate: 7.50 }] },
  { maxUnits: 500, slabs: [{ limit: Infinity, rate: 8.15 }] },
  { maxUnits: Infinity, slabs: [{ limit: Infinity, rate: 9.40 }] },
];

const KL_COMMERCIAL_TYPES = [
  {
    id: "single_phase",
    name: "LT-VII(A) Commercial — single phase",
    description: "Shops, showrooms, business houses, hotels and restaurants above 2 kW, lodges, cold storages, fuel bunks, service stations, studios and similar. Fixed charge ₹95 per kW (or part) per month.",
    fixedCharge: { type: "per_kw", rate: 95 },
    energySlabsByConsumption: KL_COMMERCIAL_LADDERS,
    energySlabs: [{ limit: Infinity, rate: 9.40 }],
  },
  {
    id: "three_phase",
    name: "LT-VII(A) Commercial — three phase",
    description: "Same energy rates; fixed charge ₹190 per kW (or part) per month.",
    fixedCharge: { type: "per_kw", rate: 190 },
    energySlabsByConsumption: KL_COMMERCIAL_LADDERS,
    energySlabs: [{ limit: Infinity, rate: 9.40 }],
  },
];

const KL_LEVY_NOTE = "The KSERC schedule is expressly exclusive of Electricity Duty, cesses and other State levies, which are notified separately. Domestic bills here add the 10% duty; cesses and other levies are not modelled, so your printed bill may carry a little more.";

export default {
  state: "Kerala",
  ratesAsOf: "In force to 31-Mar-2027 (KSERC Order 427/D(T)/2023 dt. 05-Dec-2024, rates w.e.f. 01-Apr-2025)",
  sourceUrl: "https://erckerala.org/orderpage",
  discoms: [
    {
      id: "kseb",
      name: "KSEB",
      fullName: "Kerala State Electricity Board Ltd.",
      area: "Entire Kerala",
      tariffYear: "2026-27",
      website: "https://www.kseb.in",
      categories: [
        {
          id: "domestic",
          // Domestic electricity duty: 10% of energy. CEA records duty on the energy charge only for
          // this state. Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply
          // in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: [{ name: "Electricity Duty", type: "percent_energy", rate: 10 }],
          name: "LT-I (Domestic)",
          supplyTypes: KL_DOMESTIC_TYPES,
          fixedCharge: KL_DOMESTIC_TYPES[0].fixedCharge,
          energySlabsByConsumption: KL_DOMESTIC_LADDERS,
          energySlabs: KL_TELESCOPIC,
          notes: `Kerala switches billing regime at 250 units a month. At or below 250 the slabs are telescopic — each band at its own rate. Above 250 the schedule is non-telescopic: a single rate is applied to every unit on the bill, so a 251-unit bill costs noticeably more than a 250-unit one, and the jump repeats at 300, 350, 400 and 500 units. The fixed charge steps up on the same boundaries. ${KL_LEVY_NOTE}`,
        },
        {
          id: "commercial",
          name: "LT-VII(A) (Commercial)",
          supplyTypes: KL_COMMERCIAL_TYPES,
          fixedCharge: KL_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabsByConsumption: KL_COMMERCIAL_LADDERS,
          energySlabs: [{ limit: Infinity, rate: 9.40 }],
          notes: `The gazette marks LT-VII(A) energy charges "Non telescopic" in terms: whichever band your monthly consumption falls in, that one rate applies to every unit. Crossing 500 units takes the entire bill to ₹9.40/unit. The fixed charge is per kW of connected load, rounded up to the next whole kW. ${KL_LEVY_NOTE}`,
        },
      ],
    },
  ],
};
