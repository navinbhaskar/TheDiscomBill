// Haryana — Electricity Tariff Data (FY 2026-27)
// Rates: HERC tariff order dt. 28-03-2025 (FY 2025-26), notified by DHBVN Sales Circular
// No. 04/D-2025 w.e.f. 01-04-2025. HERC left the tariff UNCHANGED for FY 2026-27, so the
// same schedule continues from 01-04-2026.
// Electricity Duty / Municipal Tax: DHBVN Sales Manual, Instruction No. 5.12 — both are
// levied per unit in Haryana, NOT as a percentage of the bill.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// Haryana levies duty and municipal tax on a per-unit basis (10 p and 5 p respectively).
// Municipal tax applies only inside municipal limits; it is included here because the
// overwhelming majority of metered urban connections fall within one.
const HR_LEVIES = [
  { name: "Electricity Duty", type: "per_unit", rate: 0.10 },
  { name: "Municipal Tax", type: "per_unit", rate: 0.05 },
];

// Domestic Supply. The category is chosen by SANCTIONED LOAD, not by consumption, and the
// slabs inside each category are telescopic (each slab billed at its own rate) — unlike
// Kerala/Telangana, the schedule lists non-overlapping ascending ranges rather than
// repeated "0-N" ladders.
const HR_DOMESTIC_TYPES = [
  {
    id: "ds1",
    name: "DS Category I — sanctioned load up to 2 kW",
    description: "Domestic connections with sanctioned load up to 2 kW. No fixed charge. The schedule is published only up to 100 units a month.",
    fixedCharge: 0,
    energySlabs: [
      { limit: 50, rate: 2.20 },
      { limit: Infinity, rate: 2.70 },
    ],
    additionalCharges: HR_LEVIES,
  },
  {
    id: "ds2",
    name: "DS Category II — sanctioned load up to 5 kW",
    description: "The schedule most Haryana households are billed on. No fixed charge up to 300 units a month; ₹50/kW/month once consumption crosses 300 units.",
    fixedCharge: {
      type: "by_consumption",
      perKw: true,
      slabs: [
        { maxUnits: 300, rate: 0, label: "Up to 300 units — no fixed charge" },
        { maxUnits: Infinity, rate: 50, label: "Above 300 units — ₹50/kW/month" },
      ],
    },
    energySlabs: [
      { limit: 150, rate: 2.95 },
      { limit: 300, rate: 5.25 },
      { limit: 500, rate: 6.45 },
      { limit: Infinity, rate: 7.10 },
    ],
    additionalCharges: HR_LEVIES,
  },
  {
    id: "ds3",
    name: "DS Category III — sanctioned load above 5 kW",
    description: "Domestic connections with sanctioned load above 5 kW. Fixed charge ₹75/kW/month at every consumption level.",
    fixedCharge: { type: "per_kw", rate: 75 },
    energySlabs: [
      { limit: 500, rate: 6.50 },
      { limit: 1000, rate: 7.15 },
      { limit: Infinity, rate: 7.50 },
    ],
    additionalCharges: HR_LEVIES,
  },
];

// Non-Domestic Supply was merged into the LT Supply schedule, which is banded by load and
// billed on kVAh.
const HR_LT_TYPES = [
  {
    id: "lt10",
    name: "LT Supply — up to 10 kW",
    description: "Shops, offices and other non-domestic connections up to 10 kW. Energy is charged on kVAh (apparent units), so a poor power factor raises the bill directly.",
    fixedCharge: { type: "per_kw", rate: 100 },
    energySlabs: [{ limit: Infinity, rate: 6.45 }],
    additionalCharges: HR_LEVIES,
  },
  {
    id: "lt20",
    name: "LT Supply — above 10 kW and up to 20 kW",
    fixedCharge: { type: "per_kw", rate: 100 },
    energySlabs: [{ limit: Infinity, rate: 6.80 }],
    additionalCharges: HR_LEVIES,
  },
  {
    id: "lt50",
    name: "LT Supply — above 20 kW and up to 50 kW",
    description: "The energy rate drops to ₹6.60/kVAh at this band but the fixed charge rises to ₹250/kW/month. Above 50 kW the connection moves to the HT schedule.",
    fixedCharge: { type: "per_kw", rate: 250 },
    energySlabs: [{ limit: Infinity, rate: 6.60 }],
    additionalCharges: HR_LEVIES,
  },
];

const haryanaCategories = () => [
  {
    id: "domestic",
    name: "DS (Domestic Supply)",
    supplyTypes: HR_DOMESTIC_TYPES,
    fixedCharge: HR_DOMESTIC_TYPES[1].fixedCharge,
    energySlabs: HR_DOMESTIC_TYPES[1].energySlabs,
    additionalCharges: HR_LEVIES,
    notes: "Haryana picks the domestic schedule by sanctioned load, not by consumption: up to 2 kW is Category I, up to 5 kW Category II, above 5 kW Category III. Category II — the default here — pays no fixed charge at all until monthly consumption crosses 300 units. Electricity Duty (10 paise/unit) and Municipal Tax (5 paise/unit) are per-unit levies, so they do not scale with the rest of the bill.",
  },
  {
    id: "commercial",
    name: "NDS / LT Supply (Non-Domestic)",
    supplyTypes: HR_LT_TYPES,
    fixedCharge: HR_LT_TYPES[0].fixedCharge,
    energySlabs: HR_LT_TYPES[0].energySlabs,
    additionalCharges: HR_LEVIES,
    notes: "The old Non-Domestic Supply schedule was merged into LT Supply, which is a flat rate per band of sanctioned load with no consumption slabs. Energy is billed on kVAh rather than kWh, so power factor feeds straight into the energy charge instead of a separate penalty.",
  },
];

export default {
  state: "Haryana",
  ratesAsOf: "FY 2026-27 (HERC order dt. 28-Mar-2025; tariff retained unchanged for FY 2026-27)",
  sourceUrl: "https://herc.gov.in",
  discoms: [
    {
      id: "dhbvn",
      name: "DHBVN",
      fullName: "Dakshin Haryana Bijli Vitran Nigam Ltd.",
      area: "South Haryana (Gurugram, Faridabad, Rewari, Mahendragarh, Nuh, Palwal, Bhiwani, Hisar, Sirsa, Fatehabad, Jind, Narnaul)",
      tariffYear: "2026-27",
      website: "https://www.dhbvn.org.in",
      categories: haryanaCategories(),
    },
    {
      id: "uhbvn",
      name: "UHBVN",
      fullName: "Uttar Haryana Bijli Vitran Nigam Ltd.",
      area: "North Haryana (Panchkula, Ambala, Yamunanagar, Kurukshetra, Karnal, Panipat, Sonipat, Rohtak, Jhajjar, Kaithal)",
      tariffYear: "2026-27",
      website: "https://www.uhbvn.org.in",
      categories: haryanaCategories(),
    },
  ],
};
