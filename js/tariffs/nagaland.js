// Nagaland - Electricity Tariff Data (FY 2025-26)
// Source: Public FY 2025-26 tariff proposal notice and the official FY 2026-27 public notice
// confirming a NERC MYT tariff order dated 28-Mar-2025. FY 2026-27 rates remain proposals until
// NERC issues the final order.

export default {
  state: "Nagaland",
  ratesAsOf: "FY 2025-26 (NERC MYT tariff order dated 28-Mar-2025; FY 2026-27 petition pending)",
  currentRatesFrom: "2025-04-01",
  verifiedOn: "2026-08-28",
  sourceUrl: "https://ipr.nagaland.gov.in/POWER-DEPARTMENT-ISSUES-PUBLIC-NOTICE-FOR-APPROVAL-OF-ARR",
  notes: "The DIPR public notice dated 04-Aug-2026 says the FY 2026-27 tariff petition is only proposed, for 01-Oct-2026 to 31-Mar-2027, and may be amended by NERC. Those proposed rates are not used as current calculator rates.",
  discoms: [
    {
      id: "doe_nagaland",
      name: "DoE Nagaland",
      fullName: "Department of Electricity, Government of Nagaland",
      area: "Entire Nagaland",
      tariffYear: "2025-26",
      website: "https://nagaland.gov.in",
      sourceUrl: "https://ipr.nagaland.gov.in/POWER-DEPARTMENT-ISSUES-PUBLIC-NOTICE-FOR-APPROVAL-OF-ARR",
      ratesAsOf: "FY 2025-26 public tariff schedule pending direct final-order PDF access",
      categories: [
        {
          id: "domestic",
          name: "Category A Domestic - Post-paid",
          fixedCharge: 10,
          energySlabs: [
            {
              limit: 30,
              rate: 5.9
            },
            {
              limit: 100,
              rate: 6.4
            },
            {
              limit: 250,
              rate: 7.15
            },
            {
              limit: Infinity,
              rate: 7.8
            }
          ],
          notes: "Post-paid domestic energy tariff. Public-lighting recovery of Rs 10/connection/month for domestic consumers is modelled as the fixed charge because the public notice lists it as a monthly per-connection charge.",
          additionalCharges: []
        },
        {
          id: "commercial",
          name: "Category D Commercial - Post-paid",
          fixedCharge: 15,
          energySlabs: [
            {
              limit: 60,
              rate: 8.15
            },
            {
              limit: 240,
              rate: 9.45
            },
            {
              limit: Infinity,
              rate: 9.85
            }
          ],
          notes: "Post-paid commercial energy tariff. Public-lighting recovery of Rs 15/connection/month for commercial consumers is modelled as the fixed charge.",
          additionalCharges: []
        }
      ]
    }
  ]
};
