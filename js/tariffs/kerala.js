// Kerala — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Kerala",
  discoms: [
    {
      id: "kseb",
      name: "KSEB",
      fullName: "Kerala State Electricity Board Ltd.",
      area: "Entire Kerala",
      tariffYear: "2024-25",
      website: "https://www.kseb.in",
      categories: [
        {
          id: "domestic_low",
          name: "LT-1A (Domestic – load < 500W)",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 40,
              rate: 2.9
            },
            {
              limit: 80,
              rate: 3.5
            },
            {
              limit: 140,
              rate: 4.7
            },
            {
              limit: 180,
              rate: 6.9
            },
            {
              limit: 250,
              rate: 8.9
            },
            {
              limit: Infinity,
              rate: 9.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 10
            }
          ]
        },
        {
          id: "domestic",
          name: "LT-1B (Domestic – load 500W to 5kW)",
          fixedCharge: 75,
          energySlabs: [
            {
              limit: 40,
              rate: 3.25
            },
            {
              limit: 80,
              rate: 4.05
            },
            {
              limit: 140,
              rate: 5.1
            },
            {
              limit: 180,
              rate: 7.4
            },
            {
              limit: 250,
              rate: 9.6
            },
            {
              limit: Infinity,
              rate: 10.3
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 10
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial / Non-Domestic)",
          fixedCharge: 125,
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
              rate: 10
            }
          ]
        }
      ]
    }
  ]
};
