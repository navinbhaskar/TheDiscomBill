// Jharkhand — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Jharkhand",
  discoms: [
    {
      id: "jbvnl",
      name: "JBVNL",
      fullName: "Jharkhand Bijli Vitran Nigam Ltd.",
      area: "Entire Jharkhand",
      tariffYear: "2024-25",
      website: "https://jbvnl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 55,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 90,
                label: "1 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 150,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 2.95
            },
            {
              limit: 200,
              rate: 4.55
            },
            {
              limit: 300,
              rate: 5.75
            },
            {
              limit: Infinity,
              rate: 6.5
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
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 5,
                rate: 120,
                label: "Up to 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 200,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 6
            },
            {
              limit: 300,
              rate: 7
            },
            {
              limit: Infinity,
              rate: 8
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
