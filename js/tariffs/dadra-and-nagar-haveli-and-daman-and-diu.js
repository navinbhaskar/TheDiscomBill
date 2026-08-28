// Dadra & Nagar Haveli and Daman & Diu - Electricity Tariff Data (FY 2026-27)
// Source: JERC Petition 145/2025, DNHDDPDCL MYT retail tariff order dated 17-Sep-2025.

export default {
  state: "Dadra & Nagar Haveli and Daman & Diu",
  ratesAsOf: "FY 2026-27 (JERC Petition 145/2025, DNHDDPDCL MYT tariff schedule)",
  currentRatesFrom: "2026-04-01",
  verifiedOn: "2026-08-28",
  sourceUrl: "https://jercuts.gov.in/wp-content/uploads/2025/09/dnhddpdcl-ready-to-upload-order-1.pdf",
  discoms: [
    {
      id: "dnhpdcl",
      name: "DNHDDPDCL",
      fullName: "DNH and DD Power Distribution Corporation Limited",
      area: "Dadra & Nagar Haveli and Daman & Diu",
      tariffYear: "2026-27",
      website: "https://www.dnhddpcl.in",
      sourceUrl: "https://jercuts.gov.in/wp-content/uploads/2025/09/dnhddpdcl-ready-to-upload-order-1.pdf",
      ratesAsOf: "FY 2026-27 column of JERC Table 10-1",
      categories: [
        {
          id: "domestic",
          name: "LTDS-II Domestic",
          fixedCharge: { type: "per_kw", rate: 10 },
          energySlabs: [
            {
              limit: 100,
              rate: 1.85
            },
            {
              limit: 200,
              rate: 2.5
            },
            {
              limit: 300,
              rate: 3.15
            },
            {
              limit: 400,
              rate: 3.25
            },
            {
              limit: Infinity,
              rate: 3.8
            }
          ],
          notes: "Demand-based domestic tariff from JERC Table 10-1. LTDS-I lifeline and LTDS-III mixed-use domestic premises are separate sub-categories not selected by default.",
          additionalCharges: []
        },
        {
          id: "commercial",
          name: "NDS-I Non-Domestic",
          demandUnit: "kVA",
          fixedCharge: { type: "per_kva", rate: 25 },
          energySlabs: [
            {
              limit: 100,
              rate: 3.75
            },
            {
              limit: 200,
              rate: 4.85
            },
            {
              limit: Infinity,
              rate: 5
            }
          ],
          notes: "NDS-I uses kVAh energy billing and a kVA demand charge in the JERC MYT schedule. Hotels, religious premises, government premises and EV charging have separate non-domestic sub-categories.",
          additionalCharges: []
        }
      ]
    }
  ]
};
