// Madhya Pradesh — Electricity Tariff Data (FY 2026-27)
// Rates: MPERC "ARR for FY 2026-27 and Retail Supply Tariff Order for FY 2026-27",
// Annexure-2 (Tariff Schedules for Low Tension Consumers), Schedules LV-1 and LV-2.
// All three discoms bill on the same MPERC schedule; only the urban/rural split differs.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// LV-1.2 domestic. The order labels these "Energy Charge with telescopic benefit", so each
// slab is billed at its own rate.
const MP_DOMESTIC_SLABS = [
  { limit: 50, rate: 4.71 },
  { limit: 150, rate: 5.67 },
  { limit: 300, rate: 7.05 },
  { limit: Infinity, rate: 7.24 },
];

// Above 150 units MP stops using the sanctioned load and DERIVES one from consumption:
// every 15 units (or part) counts as 0.1 kW, charged at ₹30 (urban) / ₹28 (rural) per 0.1 kW.
// MPERC's own example: 155 units → 1.1 kW → ₹330 urban. Below 150 units it is a flat amount
// per connection, not per kW.
const mpDomesticFixed = (low, mid, step) => ({
  type: "by_consumption",
  slabs: [
    { maxUnits: 50, rate: low, label: `Up to 50 units — ₹${low}/connection` },
    { maxUnits: 150, rate: mid, label: `51–150 units — ₹${mid}/connection` },
    { maxUnits: Infinity, unitsPerStep: 15, rate: step,
      label: `Above 150 units — ₹${step} per 0.1 kW, with every 15 units counted as 0.1 kW` },
  ],
});

const MP_DOMESTIC_TYPES = [
  {
    id: "urban",
    name: "LV-1.2 Domestic — Urban",
    description: "The standard domestic schedule for urban areas. Fixed charge is a flat ₹81 (up to 50 units) or ₹134 (up to 150); above 150 units it switches to ₹30 per 0.1 kW of load derived from consumption.",
    fixedCharge: mpDomesticFixed(81, 134, 30),
    energySlabs: MP_DOMESTIC_SLABS,
  },
  {
    id: "rural",
    name: "LV-1.2 Domestic — Rural",
    description: "Same energy rates as urban; only the fixed charge is lower (₹67 / ₹111 / ₹28 per 0.1 kW).",
    fixedCharge: mpDomesticFixed(67, 111, 28),
    energySlabs: MP_DOMESTIC_SLABS,
  },
  {
    id: "lv11",
    name: "LV-1.1 Domestic — load ≤ 0.1 kW and ≤ 30 units/month",
    description: "A lifeline schedule for connections with sanctioned load not above 100 watts consuming no more than 30 units a month. Single flat rate, no fixed charge.",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 3.72 }],
  },
];

// LV-2.2 non-domestic. NOT telescopic: crossing 50 units a month re-rates every unit on the
// bill from ₹6.80 to ₹8.30, and lifts the fixed charge as well.
// The fixed charge moves with consumption too, so it needs `by_consumption` — a per-band
// `fixedCharge` inside energySlabsByConsumption is NOT read by the engine (it only picks
// `.slabs` from the matching band).
const mpNonDomestic = (lowFixed, highFixed) => ({
  fixedCharge: {
    type: "by_consumption",
    perKw: true,
    slabs: [
      { maxUnits: 50, rate: lowFixed, label: `Up to 50 units — ₹${lowFixed}/kW/month` },
      { maxUnits: Infinity, rate: highFixed, label: `Above 50 units — ₹${highFixed}/kW/month` },
    ],
  },
  energySlabsByConsumption: [
    { maxUnits: 50, slabs: [{ limit: Infinity, rate: 6.80 }] },
    { maxUnits: Infinity, slabs: [{ limit: Infinity, rate: 8.30 }] },
  ],
  energySlabs: [{ limit: Infinity, rate: 8.30 }],
});

const MP_COMMERCIAL_TYPES = [
  {
    id: "urban",
    name: "LV-2.2 Non-Domestic — Urban (load up to 10 kW)",
    description: "Shops, offices, clinics, hotels, coaching institutes and similar. Up to 50 units a month the whole bill is at ₹6.80/unit with ₹98/kW fixed; past 50 units every unit re-rates to ₹8.30 and the fixed charge rises to ₹154/kW.",
    ...mpNonDomestic(98, 154),
  },
  {
    id: "rural",
    name: "LV-2.2 Non-Domestic — Rural (load up to 10 kW)",
    description: "Same energy rates as urban; fixed charge ₹83/kW below 50 units and ₹133/kW above.",
    ...mpNonDomestic(83, 133),
  },
  {
    id: "lv21",
    name: "LV-2.1 — Schools, colleges and hostels (load up to 10 kW)",
    description: "Recognised educational institutions and student/working-women/sports hostels. Flat ₹7.00/unit with ₹172/kW/month fixed (₹141/kW rural).",
    fixedCharge: { type: "per_kw", rate: 172 },
    energySlabs: [{ limit: Infinity, rate: 7.00 }],
  },
];

const MP_NOTE_LEVIES = "Electricity duty and cess are notified separately by the State Government, not by MPERC, and are not included in this calculation — your printed bill will carry them in addition.";

const mpCategories = () => [
  {
    id: "domestic",
    // Domestic electricity duty steps with monthly consumption: 9% to 100 units, 12% above.
    // MP is not in CEA's energy-charge-only list, so the base is the wider bill.
    // Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
    // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
    additionalCharges: [
      { name: "Electricity Duty", type: "percent_total", rate: 9,  maxUnits: 100 },
      { name: "Electricity Duty", type: "percent_total", rate: 12, minUnits: 100 },
    ],
    name: "LV-1 (Domestic)",
    supplyTypes: MP_DOMESTIC_TYPES,
    fixedCharge: MP_DOMESTIC_TYPES[0].fixedCharge,
    energySlabs: MP_DOMESTIC_SLABS,
    notes: `MP's domestic fixed charge does something unusual above 150 units a month: it stops using your sanctioned load and derives one from consumption instead, counting every 15 units (or part) as 0.1 kW at ₹30 each. MPERC's own example is 155 units → 1.1 kW → ₹330, so the fixed charge jumps sharply just past the 150-unit mark. Energy slabs themselves are telescopic. ${MP_NOTE_LEVIES}`,
  },
  {
    id: "commercial",
    name: "LV-2 (Non-Domestic / Commercial)",
    supplyTypes: MP_COMMERCIAL_TYPES,
    fixedCharge: MP_COMMERCIAL_TYPES[0].fixedCharge,
    energySlabsByConsumption: MP_COMMERCIAL_TYPES[0].energySlabsByConsumption,
    energySlabs: MP_COMMERCIAL_TYPES[0].energySlabs,
    notes: `Non-domestic is not telescopic. Crossing 50 units in a month re-rates the entire bill from ₹6.80 to ₹8.30 a unit and lifts the fixed charge from ₹98 to ₹154 per kW, so a 51-unit bill costs substantially more than a 50-unit one. ${MP_NOTE_LEVIES}`,
  },
];

export default {
  state: "Madhya Pradesh",
  ratesAsOf: "FY 2026-27 (MPERC Retail Supply Tariff Order for FY 2026-27, Annexure-2)",
  sourceUrl: "https://mperc.in",
  discoms: [
    {
      id: "mppkvvcl",
      name: "MPPKVVCL",
      fullName: "Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd.",
      area: "West MP (Indore, Ujjain, Ratlam, Mandsaur, Dewas, Khandwa, Khargone, Dhar)",
      tariffYear: "2026-27",
      website: "https://www.mpwz.co.in",
      categories: mpCategories(),
    },
    {
      id: "mpmkvvcl",
      name: "MPMKVVCL",
      fullName: "Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd.",
      area: "Central MP (Bhopal, Sagar, Rewa, Satna, Narsinghpur, Narmadapuram, Raisen, Vidisha, Gwalior, Guna)",
      tariffYear: "2026-27",
      website: "https://portal.mpcz.in",
      categories: mpCategories(),
    },
    {
      id: "mpez",
      name: "MPEZ",
      fullName: "Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company Ltd.",
      area: "East MP (Jabalpur, Chhindwara, Seoni, Mandla, Balaghat, Dindori, Shahdol)",
      tariffYear: "2026-27",
      website: "https://mpez.co.in",
      categories: mpCategories(),
    },
  ],
};
