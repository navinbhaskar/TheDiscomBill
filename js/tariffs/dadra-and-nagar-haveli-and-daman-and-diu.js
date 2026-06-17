// Dadra & Nagar Haveli and Daman & Diu — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Dadra & Nagar Haveli and Daman & Diu",
  discoms: [
    {
      id: "dnhpdcl",
      name: "DNHPDCL",
      fullName: "DNH Power Distribution Corporation Ltd.",
      area: "Dadra & Nagar Haveli and Daman & Diu",
      tariffYear: "2024-25",
      website: "https://www.dnhpdcl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 1.5
            },
            {
              limit: 100,
              rate: 2
            },
            {
              limit: 200,
              rate: 3
            },
            {
              limit: Infinity,
              rate: 4.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 5
            }
          ]
        },
        {
          id: "commercial",
          name: "LT Commercial",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 4.5
            },
            {
              limit: Infinity,
              rate: 6
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 5
            }
          ]
        }
      ]
    }
  ]
};
