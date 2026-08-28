// Mizoram - Electricity Tariff Data (FY 2026-27)
// Source: MZERC P&ED Tariff Order for FY 2026-27, Petition (ARR & Tariff) No. 1 of 2025.

export default {
  state: "Mizoram",
  ratesAsOf: "FY 2026-27 (MZERC P&ED tariff order, subsidised tariff schedule)",
  currentRatesFrom: "2026-04-01",
  verifiedOn: "2026-08-28",
  sourceUrl: "https://mzerc.mizoram.gov.in/uploads/attachments/2026/03/7be5860da7dbbda3560a7e255caff169/ped-to-26-27-khp27mar26-evng-with-sign.pdf",
  discoms: [
    {
      id: "ped_mizoram",
      name: "P&E Dept., Mizoram",
      fullName: "Power & Electricity Department, Government of Mizoram",
      area: "Entire Mizoram",
      tariffYear: "2026-27",
      website: "https://mizoram.gov.in",
      sourceUrl: "https://mzerc.mizoram.gov.in/uploads/attachments/2026/03/7be5860da7dbbda3560a7e255caff169/ped-to-26-27-khp27mar26-evng-with-sign.pdf",
      ratesAsOf: "Subsidised tariff approved for FY 2026-27, effective 01-Apr-2026",
      categories: [
        {
          id: "domestic",
          name: "Domestic LT",
          fixedCharge: { type: "per_kw", rate: 50 },
          energySlabs: [
            {
              limit: 100,
              rate: 4.9
            },
            {
              limit: 200,
              rate: 7.1
            },
            {
              limit: Infinity,
              rate: 8.2
            }
          ],
          notes: "Subsidised LT domestic tariff. Kutir Jyoti and HT domestic supply are separate categories in the order.",
          additionalCharges: []
        },
        {
          id: "commercial",
          name: "Commercial LT",
          fixedCharge: { type: "per_kw", rate: 80 },
          energySlabs: [
            {
              limit: 150,
              rate: 8.2
            },
            {
              limit: Infinity,
              rate: 8.45
            }
          ],
          notes: "Subsidised LT commercial tariff. The order excludes applicable taxes and duties from the tariff schedule.",
          additionalCharges: []
        }
      ]
    }
  ]
};
