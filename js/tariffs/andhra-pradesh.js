// Andhra Pradesh — Electricity Tariff Data (FY 2026-27)
// Rates: APERC "Tariff for Retail Sale of Electricity" (Table 100), applicable 01.04.2025
// to 31.03.2026, and retained unchanged by APERC's retail supply tariff order for FY 2026-27
// (no hike, and the FY 2024-25 true-up was waived).
// One schedule covers all three licensees — APSPDCL, APCPDCL and APEPDCL — so the categories
// below are built from a single definition rather than duplicated per discom.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

// Category I(A), which the order itself labels "Domestic (Telescopic)", so each slab is
// charged at its own rate. The fixed charge is a flat ₹10/kW/month at every slab.
const AP_DOMESTIC_SLABS = [
  { limit: 30, rate: 1.90 },
  { limit: 75, rate: 3.00 },
  { limit: 125, rate: 4.50 },
  { limit: 225, rate: 6.00 },
  { limit: 400, rate: 8.75 },
  { limit: Infinity, rate: 9.75 },
];

// Category II. The main commercial ladder is II-A(i); APERC lists the rest as their own
// sub-categories, several with no fixed charge at all.
const AP_COMMERCIAL_TYPES = [
  {
    id: "commercial",
    name: "II-A(i) — Commercial",
    description: "Shops, offices and general commercial supply. Fixed charge ₹75/kW/month, billed on kWh (or kVAh where a kVAh meter is installed).",
    fixedCharge: { type: "per_kw", rate: 75 },
    energySlabs: [
      { limit: 50, rate: 5.40 },
      { limit: 100, rate: 7.65 },
      { limit: 300, rate: 9.05 },
      { limit: 500, rate: 9.60 },
      { limit: Infinity, rate: 10.15 },
    ],
  },
  {
    id: "hoardings",
    name: "II-A(ii) — Advertising hoardings",
    description: "A single rate on all units, on a heavier ₹100/kW/month fixed charge.",
    fixedCharge: { type: "per_kw", rate: 100 },
    energySlabs: [{ limit: Infinity, rate: 12.25 }],
  },
  {
    id: "function_halls",
    name: "II-A(iii) — Function halls / auditoriums",
    description: "Flat ₹12.25/unit on all units, with no fixed charge at LT.",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 12.25 }],
  },
  {
    id: "ev",
    name: "II-C — Electric vehicle charging stations",
    description: "Flat ₹6.70/unit with no fixed charge — the cheapest rate in the commercial schedule, and well under the ₹9–10 a shop pays at the same consumption.",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 6.70 }],
  },
];

const AP_LEVY_NOTE = "APERC's schedule is the tariff alone; electricity duty and any other State levies are notified separately and are charged on your bill in addition to the figures here.";

const AP_DOMESTIC_NOTE = `Andhra Pradesh domestic supply is telescopic — the order labels the category "Domestic (Telescopic)" — so 200 units bills 30 at ₹1.90, 45 at ₹3.00, 50 at ₹4.50 and 75 at ₹6.00, not all 200 at the top rate. The fixed charge is a flat ₹10/kW/month whatever the slab. The step from ₹6.00 to ₹8.75 at 226 units is the sharpest in the schedule, so a household sitting just under 225 units pays heavily for the next unit. ${AP_LEVY_NOTE}`;

const AP_COMMERCIAL_NOTE = `The commercial ladder is telescopic across five slabs from ₹5.40 to ₹10.15, on a ₹75/kW/month fixed charge. APERC sets separate rates for advertising hoardings, function halls, startup power, green power and EV charging; the ones modelled here are selectable above. Commercial supply is billed on kVAh wherever a kVAh meter is installed, so a poor power factor raises the units you are charged for. ${AP_LEVY_NOTE}`;

// Table 100 applies to all three licensees identically, and the FY 2026-27 order left it
// untouched — so the three discoms are built from one definition.
const apCategories = () => [
  {
    id: "domestic",
    name: "LT-I (Domestic)",
    fixedCharge: { type: "per_kw", rate: 10 },
    energySlabs: AP_DOMESTIC_SLABS,
    notes: AP_DOMESTIC_NOTE,
  },
  {
    id: "commercial",
    name: "LT-II (Commercial & Others)",
    supplyTypes: AP_COMMERCIAL_TYPES,
    fixedCharge: AP_COMMERCIAL_TYPES[0].fixedCharge,
    energySlabs: AP_COMMERCIAL_TYPES[0].energySlabs,
    notes: AP_COMMERCIAL_NOTE,
  },
  {
    id: "agricultural",
    name: "LT-V (Agricultural / Irrigation Pump Sets)",
    fixedCharge: 0,
    energySlabs: [{ limit: Infinity, rate: 0 }],
    notes: "Free supply to agricultural consumers under the Government of Andhra Pradesh scheme; the DISCOM is reimbursed by subsidy. Supply hours are limited, so a pump set connection is not metered-and-billed the way a domestic one is.",
  },
];

const apDiscom = (id, name, fullName, area, website) => ({
  id, name, fullName, area,
  tariffYear: "2026-27",
  website,
  categories: apCategories(),
});

export default {
  state: "Andhra Pradesh",
  ratesAsOf: "FY 2026-27 (APERC retail supply tariff order — FY 2025-26 schedule retained, no hike)",
  sourceUrl: "https://aperc.gov.in",
  // Service areas are the operating circles each licensee publishes for itself:
  //   APSPDCL  https://www.apspdcl.in/new-circles.php
  //   APCPDCL  circle-wise SAIDI/SAIFI return, https://www.apcpdcl.in/saidisaifi/
  // APCPDCL was carved out of APSPDCL in 2019, and our APSPDCL entry still carried the
  // pre-split territory: it claimed Prakasam (which is an APCPDCL circle) and omitted
  // Anantapuramu (which is not). Both corrected here against the circle lists above.
  discoms: [
    apDiscom("apspdcl", "APSPDCL", "Southern Power Distribution Company of Andhra Pradesh Ltd.",
      "Southern AP (Kurnool, Nandyal, Anantapuramu, Nellore, Chittoor, Kadapa, Annamayya, Tirupati, Sri Sathya Sai)",
      "https://www.apspdcl.in"),
    apDiscom("apcpdcl", "APCPDCL", "Andhra Pradesh Central Power Distribution Corporation Ltd.",
      "Central AP (Krishna, NTR, Guntur, Palnadu, Bapatla, Prakasam and the CRDA capital region)",
      "https://www.apcpdcl.in"),
    apDiscom("apepdcl", "APEPDCL", "Eastern Power Distribution Company of Andhra Pradesh Ltd.",
      "Eastern AP (Visakhapatnam, Anakapalli, Vizianagaram, Srikakulam, Parvathipuram Manyam, Alluri Sitharama Raju, Kakinada, East Godavari, Konaseema, West Godavari)",
      "https://www.apepdcl.in"),
  ],
};
