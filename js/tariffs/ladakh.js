// Ladakh - Electricity Tariff Data (FY 2026-27)
// Source: JERC for the UT of J&K and Ladakh, Order No. 05 of 2026, issued 18-Aug-2026.

export default {
  state: "Ladakh",
  ratesAsOf: "FY 2026-27 (JERC Order No. 05 of 2026 for LPDD)",
  currentRatesFrom: "2026-09-01",
  verifiedOn: "2026-08-28",
  sourceUrl: "https://jercjkl.jk.gov.in/pdf/LPDD%20%20Tariff%20Order%20for%20FY%202026-27%20R1.pdf",
  discoms: [
    {
      id: "lpdcl",
      name: "LPDCL / Ladakh Power Dept.",
      fullName: "Ladakh Power Development Corp. / Power Development Dept., Ladakh",
      area: "Leh, Kargil districts",
      tariffYear: "2026-27",
      website: "https://ladakh.gov.in",
      sourceUrl: "https://jercjkl.jk.gov.in/pdf/LPDD%20%20Tariff%20Order%20for%20FY%202026-27%20R1.pdf",
      ratesAsOf: "Subsidised FY 2026-27 tariff schedule effective 01-Sep-2026",
      categories: [
        {
          id: "domestic",
          additionalCharges: [{ name: "Electricity Duty", type: "percent_energy", rate: 15 }],
          name: "Metered Domestic",
          fixedCharge: { type: "per_kw", rate: 13 },
          energySlabs: [
            {
              limit: 200,
              rate: 2.35
            },
            {
              limit: 400,
              rate: 4.1
            },
            {
              limit: Infinity,
              rate: 4.5
            }
          ],
          notes: "JERC directs LPDD to implement the subsidised tariff from 01-Sep-2026. BPL up to 30 units/month and non-domestic hotel/resort schedules are separate categories."
        },
        {
          id: "commercial",
          name: "Non-Domestic / Commercial - Single Phase",
          fixedCharge: { type: "per_kw", rate: 66 },
          energySlabs: [
            {
              limit: 200,
              rate: 3.75
            },
            {
              limit: 500,
              rate: 5.6
            },
            {
              limit: Infinity,
              rate: 6.1
            }
          ],
          notes: "For ordinary non-domestic/commercial supply other than hotels, guest houses, resorts and homestays. Three-phase non-domestic supply is billed separately on kVAh with a kVA fixed charge.",
          additionalCharges: [{ name: "Electricity Duty", type: "percent_energy", rate: 15 }]
        }
      ]
    }
  ]
};
