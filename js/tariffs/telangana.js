// Telangana — Electricity Tariff Data (FY 2026-27)
//
// Source: TGERC Retail Supply Tariff Schedule, published by the discoms —
//   https://tgsouthernpower.org/resources/PDF/Tariffs/63tarifffile.pdf
// The TGERC Retail Supply Tariff Order for FY 2026-27 (dated 30-03-2026, effective
// 01-04-2026) RETAINED every energy and fixed charge unchanged from FY 2025-26, so the
// schedule below is the current one and tariffYear reads 2026-27. Surcharges and the
// Time-of-Day framework were revised in that order; neither is modelled here.
//
// TGERC sets one retail schedule for both discoms, so TGSPDCL and TGNPDCL clone one factory.
//
// The previous data (a single telescopic ladder of 1.45/2.45/4.00…, fixed charge banded by
// LOAD at 30/50/100) matched no TGERC schedule and mis-modelled the structure entirely.
//
// NOT verified against a real Telangana bill — `verified` is deliberately absent.

// Telangana does not have one telescopic ladder — it has three, and total monthly consumption
// picks which one applies to the WHOLE bill. A household on 150 units pays 100 units at ₹3.40
// plus 50 at ₹4.80; it does not pay the ≤100 ladder's ₹1.95/₹3.10 and then continue. Crossing
// a threshold re-rates consumption from the first unit, which is why these are alternatives
// rather than extra slabs — see engine.js `energySlabsByConsumption`.
const LT1_LADDERS = [
  {
    maxUnits: 100,
    slabs: [
      { limit: 50,       rate: 1.95 },
      { limit: Infinity, rate: 3.10 },
    ],
  },
  {
    maxUnits: 200,
    slabs: [
      { limit: 100,      rate: 3.40 },
      { limit: Infinity, rate: 4.80 },
    ],
  },
  {
    maxUnits: Infinity,
    slabs: [
      { limit: 200,      rate: 5.10 },
      { limit: 300,      rate: 7.70 },
      { limit: 400,      rate: 9.00 },
      { limit: 800,      rate: 9.50 },
      { limit: Infinity, rate: 10.00 },
    ],
  },
];

// ₹10 per kW per month, stepping to ₹50 per kW above 800 units — the band picks the rate and
// the sanctioned load still scales it, hence perKw.
const LT1_FIXED = {
  type: "by_consumption",
  perKw: true,
  slabs: [
    { maxUnits: 800,      rate: 10, label: "up to 800 units/month" },
    { maxUnits: Infinity, rate: 50, label: "above 800 units/month" },
  ],
};

// LT-II is the same shape: one ladder up to 50 units a month, another above it.
const LT2_LADDERS = [
  {
    maxUnits: 50,
    slabs: [{ limit: Infinity, rate: 7.00 }],
  },
  {
    maxUnits: Infinity,
    slabs: [
      { limit: 100,      rate: 8.50 },
      { limit: 300,      rate: 9.90 },
      { limit: 500,      rate: 10.40 },
      { limit: Infinity, rate: 11.00 },
    ],
  },
];

const LT2_FIXED = {
  type: "by_consumption",
  perKw: true,
  slabs: [
    { maxUnits: 50,       rate: 30,  label: "up to 50 units/month" },
    { maxUnits: 300,      rate: 70,  label: "up to 300 units/month" },
    { maxUnits: Infinity, rate: 100, label: "above 300 units/month" },
  ],
};

// The schedule is explicitly "exclusive of the Electricity duty payable as per the provisions
// of the Telangana State Electricity Duty Act, 1939". UNVERIFIED — carried from the previous
// data; confirm from the Act's schedule or a real bill.
const TG_ED = { name: "Electricity Duty (ED)", type: "percent_energy", rate: 6 };

const telanganaCategories = () => [
  {
    id: "domestic",
    name: "LT-I (Domestic)",
    fixedCharge: LT1_FIXED,
    energySlabsByConsumption: LT1_LADDERS,
    // Fallback for any caller that walks energySlabs directly: the ladder most households
    // land on. The engine always resolves energySlabsByConsumption in preference to this.
    energySlabs: LT1_LADDERS[2].slabs,
    additionalCharges: [TG_ED],
    notes: "Telangana re-rates the whole bill when consumption crosses 100 or 200 units a month, so a 101-unit bill costs noticeably more than a 100-unit one. There is no separate customer charge for domestic connections. The fixed charge is ₹10 per kW per month, rising to ₹50 per kW above 800 units.",
  },
  {
    id: "commercial",
    name: "LT-II (Non-Domestic / Commercial)",
    fixedCharge: LT2_FIXED,
    energySlabsByConsumption: LT2_LADDERS,
    energySlabs: LT2_LADDERS[1].slabs,
    additionalCharges: [
      // LT-II(A) and (B), single phase. Three-phase connections pay ₹100/month.
      { name: "Customer charge", type: "flat", rate: 50 },
      TG_ED,
    ],
    notes: "Crossing 50 units a month re-rates the entire bill from ₹7.00 to the ₹8.50 ladder. Single-phase connections pay a ₹50/month customer charge; three-phase pay ₹100. Advertising hoardings (LT-II(C)) are billed separately at ₹13.00/unit.",
  },
];

const telanganaDiscom = (id, name, fullName, area, website) => ({
  id, name, fullName, area,
  tariffYear: "2026-27",
  website,
  categories: telanganaCategories(),
});

export default {
  state: "Telangana",
  ratesAsOf: "FY 2026-27 (TGERC order dt. 30-Mar-2026, retail rates retained)",
  sourceUrl: "https://www.tgerc.telangana.gov.in",
  discoms: [
    // Ids are kept as tsspdcl / tsnpdcl for SEO continuity even though the companies now
    // brand as TGSPDCL / TGNPDCL — the same reasoning as Tamil Nadu keeping `tangedco`.
    telanganaDiscom("tsspdcl", "TGSPDCL", "Telangana State Southern Power Distribution Company Ltd.",
      "Southern Telangana (Hyderabad, Rangareddy, Mahbubnagar, Nalgonda, Medak, Sangareddy, Vikarabad, Siddipet, Nagarkurnool, Wanaparthy, Jogulamba Gadwal, Yadadri Bhuvanagiri)",
      "https://www.tgsouthernpower.org"),
    telanganaDiscom("tsnpdcl", "TGNPDCL", "Telangana State Northern Power Distribution Company Ltd.",
      "Northern Telangana (Warangal, Karimnagar, Khammam, Adilabad, Nizamabad, Jagtial, Peddapalli, Mancherial, Nirmal, Bhadradri Kothagudem, Mahabubabad, Jayashankar Bhupalpally)",
      "https://tgnpdcl.in"),
  ],
};
