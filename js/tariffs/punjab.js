// Punjab — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Punjab",
  discoms: [
    {
      id: "pspcl",
      name: "PSPCL",
      fullName: "Punjab State Power Corporation Ltd.",
      area: "Entire Punjab (excl. Chandigarh)",
      tariffYear: "2024-25",
      website: "https://www.pspcl.in",
      categories: [
        {
          id: "domestic",
          name: "DS (Domestic Supply)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 60,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 7,
                rate: 100,
                label: "2 kW – 7 kW"
              },
              {
                maxLoad: Infinity,
                rate: 175,
                label: "Above 7 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 3.49
            },
            {
              limit: 300,
              rate: 5
            },
            {
              limit: 500,
              rate: 6.11
            },
            {
              limit: Infinity,
              rate: 6.89
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 3
            }
          ],
          notes: "Government of Punjab: 600 units free per year for domestic consumers (50 units/month). AAP scheme."
        },
        {
          id: "commercial",
          name: "NRS (Non-Residential Supply / Commercial)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 5,
                rate: 150,
                label: "Up to 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 250,
                label: "Above 5 kW"
              }
            ]
          },
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
              rate: 8
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 3
            }
          ]
        }
      ]
    }
  ]
};
