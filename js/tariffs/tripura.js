// Tripura — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Tripura",
  discoms: [
    {
      id: "tsecl",
      name: "TSECL",
      fullName: "Tripura State Electricity Corporation Ltd.",
      area: "Entire Tripura",
      tariffYear: "2024-25",
      website: "https://www.tsecl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 2.55
            },
            {
              limit: 100,
              rate: 4.3
            },
            {
              limit: 200,
              rate: 5.3
            },
            {
              limit: Infinity,
              rate: 6.3
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
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 7.5
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
