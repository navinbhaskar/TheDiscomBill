// Rajasthan — Electricity Tariff Data (in force from 01-10-2025)
//
// Source: "TARIFF FOR SUPPLY OF ELECTRICITY - 2025", the schedule notified by the discoms in
// pursuance of the RERC order on Petitions 2303/2025, 2304/2025 and 2305/2025 under s.62/64
// of the Electricity Act 2003, read with the RERC (Terms & Conditions of Determination of
// Tariff) Regulations 2025. Effective 01-10-2025 and "shall remain in force till the next
// Tariff order of the Commission".
//   https://cescrajasthan.co.in/kedl/pages/event/uploads/Tariff-2025%202.pdf
//   https://cescrajasthan.co.in/bkesl/pages/event/uploads/JdVVNL%20Tariff%20Order%20-2025.pdf
//
// Read from two independent copies of the schedule (the JdVVNL one is a scan and OCRs with
// errors; the second has a clean text layer). Every figure below appears identically in both.
// RERC sets one retail tariff for all three discoms, so JVVNL / AVVNL / JdVVNL are cloned
// from a single factory — a divergence would mean a misreading.
//
// The previous data (load-banded fixed charge of 65/80/125/200 by kW; energy
// 3.00/4.50/6.00/6.50; no Regulatory Surcharge) was wrong in structure as well as rates:
// Rajasthan bands the domestic fixed charge by CONSUMPTION, not by sanctioned load.
//
// NOT verified against a real Rajasthan bill — `verified` is deliberately absent.

// Domestic fixed charge, order §(C)(1). Banded on the average monthly consumption of the
// PREVIOUS financial year, not the current month's units; the calculator resolves it on the
// bill being computed, which is the same figure for a household with steady usage and an
// approximation for one whose consumption has moved between years.
const DS_FIXED = {
  type: "by_consumption",
  slabs: [
    { maxUnits: 150,      rate: 150, label: "up to 150 units/month" },
    { maxUnits: 300,      rate: 300, label: "up to 300 units/month" },
    { maxUnits: 500,      rate: 500, label: "up to 500 units/month" },
    { maxUnits: Infinity, rate: 800, label: "above 500 units/month" },
  ],
};

// Order §(C)(2). Telescopic, and identical across all four General Domestic bands — GD-1..GD-4
// differ only in which slabs they can reach, so one schedule expresses all of them.
const DS_ENERGY = [
  { limit: 50,       rate: 4.75 },
  { limit: 150,      rate: 6.00 },
  { limit: 500,      rate: 7.00 },
  { limit: Infinity, rate: 7.50 },
];

// The tariff schedule is explicitly "exclusive of Electricity Duty, Taxes and Other Charges"
// (§4 of the general conditions), so the rate is not in the order.
//
// Carried here as 5% of the total and flagged unverified; it is levied per unit, not as a
// percentage. CEA records 40 P/kWh for domestic in both its FY2021-22 and FY2023-24 editions.
//
// Rajasthan also charges a 15 P/kWh urban cess, but only on connections in a municipal area
// consuming more than 100 units a month. The engine has no way to express that condition yet,
// so the cess is deliberately NOT modelled rather than applied to everyone.
// Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge
// https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
const RJ_ED = { name: "Electricity Duty (ED)", type: "per_unit", rate: 0.40 };

// The urban cess: 15 paise a unit, but only for a connection in a municipal area consuming more
// than 100 units a month. Both halves of that are now expressible — the consumption half by the
// charge band, the municipal half by making the area a supply type. Rajasthan had no supply
// types, so this adds the first ones rather than multiplying an existing list, which is exactly
// why it can be done here and not in Punjab, whose supply types are already load bands.
//
// The two share one tariff: same slabs, same fixed charge. They differ only in the cess, which
// is the same shape Gujarat, Madhya Pradesh and West Bengal already use for urban/rural.
const RJ_URBAN_CESS = { name: "Urban Cess", type: "per_unit", rate: 0.15, minUnits: 100 };

const rajasthanCategories = () => [
  {
    id: "domestic",
    name: "DS/LT-1 (Domestic Service)",
    fixedCharge: DS_FIXED,
    energySlabs: DS_ENERGY,
    // Rural is the fallback for a call that passes no supplyTypeId: it is the tariff without the
    // cess, so an unanswered question never invents a charge the consumer may not owe.
    additionalCharges: [RJ_ED],
    supplyTypes: [
      {
        id: "rural",
        name: "Rural / non-municipal area",
        description: "Outside a municipal area. Electricity duty applies; the urban cess does not.",
        fixedCharge: DS_FIXED,
        energySlabs: DS_ENERGY,
        additionalCharges: [RJ_ED],
      },
      {
        id: "urban",
        name: "Urban / municipal area",
        description: "Inside a municipal area. Adds the 15 paise/unit urban cess once consumption passes 100 units a month.",
        fixedCharge: DS_FIXED,
        energySlabs: DS_ENERGY,
        additionalCharges: [RJ_ED, RJ_URBAN_CESS],
      },
    ],
    notes: "Fixed charges are banded on average monthly consumption, not sanctioned load. A Regulatory Surcharge of ₹1.00/unit applies (₹0.70/unit for households consuming up to 100 units a month) — it is a combined ceiling that already includes the Fuel and Power Purchase Adjustment Surcharge, so FPPAS is not charged on top of it. BPL and Astha card holders and silicosis patients pay 475 paise on the first 50 units with a ₹150 fixed charge. The urban and rural options carry the same tariff and differ only in the urban cess, which is charged at 15 paise a unit on municipal-area connections using more than 100 units a month.",
  },
  {
    id: "commercial",
    // The previous data called this "LT-4", which is Agriculture. Non-domestic is LT-2.
    name: "NDS/LT-2 (Non-Domestic Service)",
    // Order §(II)(1)(I) — banded on consumption, like domestic.
    fixedCharge: {
      type: "by_consumption",
      slabs: [
        { maxUnits: 200,      rate: 350, label: "up to 200 units/month" },
        { maxUnits: 500,      rate: 450, label: "above 200 up to 500 units/month" },
        { maxUnits: Infinity, rate: 700, label: "above 500 units/month" },
      ],
    },
    // Order §(II)(2) — telescopic, and the same for every NDS band.
    energySlabs: [
      { limit: 100,      rate: 7.00 },
      { limit: Infinity, rate: 8.50 },
    ],
    additionalCharges: [RJ_ED],
    supplyTypes: [
      {
        id: "upto5kw",
        name: "Sanctioned load up to 5 kW",
        description: "Fixed charge banded on monthly consumption (₹350 / ₹450 / ₹700)",
        fixedCharge: {
          type: "by_consumption",
          slabs: [
            { maxUnits: 200,      rate: 350, label: "up to 200 units/month" },
            { maxUnits: 500,      rate: 450, label: "above 200 up to 500 units/month" },
            { maxUnits: Infinity, rate: 700, label: "above 500 units/month" },
          ],
        },
        energySlabs: [
          { limit: 100,      rate: 7.00 },
          { limit: Infinity, rate: 8.50 },
        ],
        additionalCharges: [RJ_ED],
      },
      {
        id: "above5kw",
        name: "Sanctioned load above 5 kW (max demand up to 50 kVA)",
        description: "Fixed charge ₹160 per kW of sanctioned load per month",
        // Order §(II)(1)(II): ₹160/kW up to 500 units a month, stepping to ₹200/kW (or
        // ₹320/kVA of billing demand where sanctioned load exceeds 18.65 kW) above 500.
        // The step depends on CONSUMPTION while the charge is per kW, which no current
        // primitive expresses — modelled at the ₹160 base, so bills above 500 units a month
        // understate the fixed charge. Left explicit rather than silently approximated.
        fixedCharge: { type: "per_kw", rate: 160 },
        energySlabs: [
          { limit: 100,      rate: 7.00 },
          { limit: Infinity, rate: 8.50 },
        ],
        additionalCharges: [RJ_ED],
      },
    ],
    notes: "Above 500 units a month the fixed charge for connections over 5 kW steps to ₹200/kW (₹320/kVA of billing demand where sanctioned load exceeds 18.65 kW); the calculator applies the ₹160/kW base rate. The ₹1.00/unit Regulatory Surcharge applies here too.",
  },
];

const rajasthanDiscom = (id, name, fullName, area, website) => ({
  id, name, fullName, area,
  tariffYear: "2025-26",
  website,
  categories: rajasthanCategories(),
});

export default {
  state: "Rajasthan",
  ratesAsOf: "Tariff for Supply of Electricity-2025 (RERC Petitions 2303–2305/2025, in force from 01-Oct-2025)",
  sourceUrl: "https://rerc.rajasthan.gov.in",
  currentRatesFrom: "2025-10-01",
  discoms: [
    rajasthanDiscom("jvvnl", "JVVNL", "Jaipur Vidyut Vitaran Nigam Ltd.",
      "Jaipur, Sikar, Jhunjhunu, Alwar, Bharatpur, Sawai Madhopur, Karauli, Dausa, Dholpur",
      "https://www.jaipurdiscom.com"),
    rajasthanDiscom("avvnl", "AVVNL", "Ajmer Vidyut Vitaran Nigam Ltd.",
      "Ajmer, Bhilwara, Nagaur, Sirohi, Jhalawar, Baran, Bundi, Kota, Chittorgarh, Udaipur, Banswara, Dungarpur, Rajsamand, Pratapgarh",
      "https://energy.rajasthan.gov.in/avvnl"),
    rajasthanDiscom("jdvvnl", "JdVVNL", "Jodhpur Vidyut Vitaran Nigam Ltd.",
      "Jodhpur, Barmer, Jaisalmer, Pali, Jalore, Bikaner, Churu, Hanumangarh, Sri Ganganagar",
      "https://energy.rajasthan.gov.in/jdvvnl"),
  ],
};
