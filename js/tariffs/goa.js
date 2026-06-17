// Goa — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Goa",
  discoms: [
    {
      id: "ged",
      name: "Goa Electricity Dept.",
      fullName: "Electricity Department, Government of Goa",
      area: "Entire Goa",
      tariffYear: "2024-25",
      website: "https://www.goaelectricity.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 30,
              rate: 1.79
            },
            {
              limit: 100,
              rate: 3.04
            },
            {
              limit: 200,
              rate: 3.37
            },
            {
              limit: 500,
              rate: 5
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
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: Infinity,
              rate: 7
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
