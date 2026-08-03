// Sikkim — Electricity Tariff Data (FY 2025-26)
// Rates: SSERC "Tariff Order for the F.Y. 2025-26", Tariff Schedule for the F.Y. 2025-26.
// tariffYear stays 2025-26: no FY 2026-27 schedule could be located, so the file names the
// order that demonstrably exists rather than assuming a rollover.
//
// Sikkim has NO fixed charge. What the schedule calls a "Monthly Minimum Charge" is a floor
// on the bill — ₹50 single phase, ₹200 three phase — not an amount added to it. Modelled as
// `minCharge`, so a light user pays the floor and everyone else pays energy charges alone.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const SK_DOMESTIC_SLABS = [
  { limit: 50, rate: 1.60 },
  { limit: 100, rate: 2.60 },
  { limit: 200, rate: 3.60 },
  { limit: 400, rate: 4.10 },
  { limit: Infinity, rate: 4.60 },
];

const SK_COMMERCIAL_SLABS = [
  { limit: 50, rate: 4.10 },
  { limit: 100, rate: 5.10 },
  { limit: 200, rate: 6.10 },
  { limit: 400, rate: 7.10 },
  { limit: Infinity, rate: 7.40 },
];

const SK_REBATE_NOTE = "The Department allows a 5% rebate on energy charges for bills paid within the due date (10 days from issue), and charges a 10% annual surcharge on arrears outstanding at the end of March. Neither is applied automatically here.";

export default {
  state: "Sikkim",
  ratesAsOf: "FY 2025-26 (SSERC Tariff Order for the F.Y. 2025-26)",
  sourceUrl: "https://selfservice.powersikkim.in/assets/home/Tariff-Schedule-FY-2025-26.pdf",
  discoms: [
    {
      id: "energy_sikkim",
      name: "Energy & Power Dept., Sikkim",
      fullName: "Energy & Power Department, Government of Sikkim",
      area: "Entire Sikkim",
      tariffYear: "2025-26",
      website: "https://powersikkim.in",
      categories: [
        {
          id: "domestic",
          name: "DS (Domestic Supply)",
          // No fixed charge in the schedule at all — only a monthly minimum.
          fixedCharge: 0,
          minCharge: 50,
          energySlabs: SK_DOMESTIC_SLABS,
          supplyTypes: [
            {
              id: "single_phase",
              name: "Domestic — single phase",
              description: "Five telescopic slabs from ₹1.60 to ₹4.60, with no fixed charge. A monthly minimum of ₹50 applies, so bills below that are rounded up to it.",
              fixedCharge: 0,
              minCharge: 50,
              energySlabs: SK_DOMESTIC_SLABS,
            },
            {
              id: "three_phase",
              name: "Domestic — three phase",
              description: "The same energy rates, but the monthly minimum rises to ₹200.",
              fixedCharge: 0,
              minCharge: 200,
              energySlabs: SK_DOMESTIC_SLABS,
            },
          ],
          notes: `Sikkim has some of the cheapest electricity in India — ₹1.60 for the first 50 units, on the back of the state's hydro generation — and levies no fixed charge at all. The ₹50 (single phase) or ₹200 (three phase) in the schedule is a monthly MINIMUM, not a standing charge: it only bites if your energy charges come to less than that, so a household using 100 units pays ₹210 in energy and nothing more. ${SK_REBATE_NOTE} If electricity supplied to domestic premises is used for a commercial purpose, the Department charges the ENTIRE supply at commercial rates.`,
        },
        {
          id: "commercial",
          name: "CS (Commercial Supply)",
          fixedCharge: 0,
          energySlabs: SK_COMMERCIAL_SLABS,
          notes: `Commercial supply runs from ₹4.10 to ₹7.40 across the same five slab boundaries as domestic, and likewise carries no fixed charge. Establishments with a sanctioned load above 25 kVA that run off a shared transformer pay a demand charge on top — ₹60/kVA/month in rural areas, ₹100/kVA/month in urban — which is not modelled here. A connection of 100 kVA or above must install its own transformer. ${SK_REBATE_NOTE}`,
        },
      ],
    },
  ],
};
