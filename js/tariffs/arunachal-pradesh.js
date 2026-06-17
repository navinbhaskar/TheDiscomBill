// Arunachal Pradesh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Arunachal Pradesh",
  discoms: [
    {
      id: "appdcl",
      name: "APPDCL / Dept. of Power",
      fullName: "Arunachal Pradesh Power Distribution Corporation Ltd.",
      area: "Entire Arunachal Pradesh",
      tariffYear: "2024-25",
      website: "https://appdcl.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 30,
              rate: 0,
              label: "Subsidised"
            },
            {
              limit: 100,
              rate: 2
            },
            {
              limit: 200,
              rate: 3.5
            },
            {
              limit: Infinity,
              rate: 5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "First 30 units subsidized. Subject to state government schemes."
        },
        {
          id: "commercial",
          name: "LT Commercial",
          fixedCharge: 50,
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
