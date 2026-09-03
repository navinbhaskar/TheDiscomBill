// Goa — Electricity Tariff Data (FY 2026-27)
// Rates: JERC "Order on Approval of True-up for FY 2023-24 and ARR for the 4th MYT Control
// Period from FY 2025-26 to FY 2029-30 and Determination of Retail Tariff, Electricity
// Department of Goa", Chapter 10 Tariff Schedule (Table 187), in force from 1 October 2025.
// The order approves a rate for EACH year of the control period in advance; every figure
// below is the FY 2026-27 column, so this file is current without a fresh order.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const GOA_DOMESTIC_TYPES = [
  {
    id: "ltds2",
    name: "LTDS-II — ordinary domestic (up to 85 kW / 100 kVA)",
    description: "The standard household category: five telescopic slabs from ₹2.10 to ₹6.60, on ₹25 per kW (or part thereof) per month.",
    fixedCharge: { type: "per_kw", rate: 25 },
    energySlabs: [
      { limit: 100, rate: 2.10 },
      { limit: 200, rate: 3.10 },
      { limit: 300, rate: 4.15 },
      { limit: 400, rate: 5.45 },
      { limit: Infinity, rate: 6.60 },
    ],
  },
  {
    id: "ltds1",
    name: "LTDS-I — lifeline (load up to 250 W and up to 50 units)",
    description: "₹1.50/unit on a flat ₹20 per connection per month. Qualifying needs BOTH a connected load at or below 250 watts and consumption at or below 50 units.",
    fixedCharge: { type: "flat", rate: 20 },
    energySlabs: [{ limit: Infinity, rate: 1.50 }],
  },
  {
    id: "ltds3",
    name: "LTDS-III — let-out portions and homestays",
    description: "A slightly higher domestic schedule for the let-out part of a house: ₹3.15 to ₹6.70 across the same five slabs, on ₹30/kW/month. An owner-occupied home stays on LTDS-II; a homestay or let-out portion needs its own connection billed here.",
    fixedCharge: { type: "per_kw", rate: 30 },
    energySlabs: [
      { limit: 100, rate: 3.15 },
      { limit: 200, rate: 4.15 },
      { limit: 300, rate: 5.20 },
      { limit: 400, rate: 6.40 },
      { limit: Infinity, rate: 6.70 },
    ],
  },
];

const GOA_COMMERCIAL_TYPES = [
  {
    id: "nds1",
    name: "NDS-I — non-domestic service",
    description: "Three telescopic bands on kVAh — ₹4.25 up to 100 units, ₹6.10 to 200, ₹6.80 beyond — against a ₹60 per kVA per month fixed charge.",
    fixedCharge: { type: "per_kva", rate: 60 },
    energySlabs: [
      { limit: 100, rate: 4.25 },
      { limit: 200, rate: 6.10 },
      { limit: Infinity, rate: 6.80 },
    ],
  },
  {
    id: "nds2",
    name: "NDS-II — non-domestic service",
    description: "The same ₹60/kVA fixed charge and the same first two bands as NDS-I, but ₹6.90 above 200 units instead of ₹6.80.",
    fixedCharge: { type: "per_kva", rate: 60 },
    energySlabs: [
      { limit: 100, rate: 4.25 },
      { limit: 200, rate: 6.10 },
      { limit: Infinity, rate: 6.90 },
    ],
  },
  {
    id: "nds3",
    name: "NDS-III — non-domestic service (highest rate)",
    description: "A single ₹11.65/kVAh on all units against ₹75/kVA/month — by some distance the steepest rate in Goa's LT schedule.",
    fixedCharge: { type: "per_kva", rate: 75 },
    energySlabs: [{ limit: Infinity, rate: 11.65 }],
  },
  {
    id: "nds4",
    name: "NDS-IV — non-domestic service (concessional)",
    description: "A flat ₹4.75/kVAh on all units against ₹60/kVA/month.",
    fixedCharge: { type: "per_kva", rate: 60 },
    energySlabs: [{ limit: Infinity, rate: 4.75 }],
  },
];

const GOA_LEVY_NOTE = "JERC's schedule is the tariff alone. Domestic bills here include Goa's 20 paise/unit electricity duty; other State levies are charged on the bill in addition. Goa's fixed charge is levied per kW (or kVA) 'or part thereof', so a fractional sanctioned load is rounded up to the next whole unit before the charge is worked out — the calculator does not round, so check your sanctioned load if the fixed charge looks a rupee or two light.";

// Cross-checked 2026-09-04 against a SECOND government document: the Electricity
// Department's own monthly FPPCA computation for July-2026 consumption, which reprints the
// energy-charge schedule "w.e.f 1st April 2026" as the base it applies its percentage to.
// Every domestic figure below matched it exactly — LTDS-I 1.50; LTDS-II 2.10 / 3.10 / 4.15 /
// 5.45 / 6.60; LTDS-III 3.15 / 4.15 / 5.20 / 6.40 / 6.70. That is a confirmation of the
// tariff, not of a bill: no Goa consumer bill has been reconciled against this file.
export default {
  state: "Goa",
  ratesAsOf: "FY 2026-27 (JERC 4th MYT Control Period order, FY 2025-26 to FY 2029-30 — FY 2026-27 rates approved in advance)",
  verifiedOn: "2026-09-04",
  sourceUrl: "https://www.goaelectricity.gov.in/wp-content/uploads/2026/08/Final-FPPCA-Computation-for-May-26-to-be-levied-for-consumption-of-July-26-combined.pdf",
  discoms: [
    {
      id: "ged",
      name: "Goa Electricity Dept.",
      fullName: "Electricity Department, Government of Goa",
      area: "Entire Goa",
      tariffYear: "2026-27",
      website: "https://www.goaelectricity.gov.in",
      categories: [
        {
          id: "domestic",
          // Domestic electricity duty: 20 paise/unit. CEA does not list this state as energy-charge-only, so duty applies to the wider bill.
          // Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply
          // in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: [{ name: "Electricity Duty", type: "per_unit", rate: 0.2 }],
          name: "LTDS (Domestic Service)",
          supplyTypes: GOA_DOMESTIC_TYPES,
          fixedCharge: GOA_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: GOA_DOMESTIC_TYPES[0].energySlabs,
          notes: `Goa's domestic tariff is among the cheapest in the country at low consumption — ₹2.10 for the first 100 units — but climbs steeply, tripling to ₹6.60 above 400. Because JERC set the whole 4th control period in one order, the rates step up each year to FY 2029-30 regardless of any fresh order, so a Goa bill rises annually by design. Lifeline (LTDS-I) needs both a load at or below 250 W and consumption at or below 50 units. ${GOA_LEVY_NOTE}`,
        },
        {
          id: "commercial",
          name: "NDS (Non-Domestic Service)",
          supplyTypes: GOA_COMMERCIAL_TYPES,
          fixedCharge: GOA_COMMERCIAL_TYPES[0].fixedCharge,
          energySlabs: GOA_COMMERCIAL_TYPES[0].energySlabs,
          notes: `Non-domestic supply is billed on kVAh against a per-kVA fixed charge, so a poor power factor raises the units you are charged for. JERC splits non-domestic into several schedules whose rates differ sharply — from ₹4.75 flat on NDS-IV to ₹11.65 on NDS-III — so which one your connection sits under matters more than your consumption does. ${GOA_LEVY_NOTE}`,
        },
      ],
    },
  ],
};
