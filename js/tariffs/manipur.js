// Manipur — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Manipur",
  discoms: [
    {
      id: "mspdcl",
      name: "MSPDCL",
      fullName: "Manipur State Power Distribution Company Ltd.",
      area: "Entire Manipur",
      tariffYear: "2024-25",
      website: "https://www.mspdcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 40,
          energySlabs: [
            {
              limit: 30,
              rate: 2.35
            },
            {
              limit: 100,
              rate: 4.45
            },
            {
              limit: Infinity,
              rate: 5.95
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
