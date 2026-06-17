// Assam — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Assam",
  discoms: [
    {
      id: "apdcl",
      name: "APDCL",
      fullName: "Assam Power Distribution Company Ltd.",
      area: "Entire Assam",
      tariffYear: "2024-25",
      website: "https://www.apdcl.org",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 50,
          energySlabs: [
            {
              limit: 30,
              rate: 2.1
            },
            {
              limit: 100,
              rate: 4.6
            },
            {
              limit: 200,
              rate: 5.95
            },
            {
              limit: Infinity,
              rate: 7.2
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
          name: "LT-II (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 6.5
            },
            {
              limit: 300,
              rate: 7.5
            },
            {
              limit: Infinity,
              rate: 8.5
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
