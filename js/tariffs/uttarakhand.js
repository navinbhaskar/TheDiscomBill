// Uttarakhand — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Uttarakhand",
  discoms: [
    {
      id: "upcl",
      name: "UPCL",
      fullName: "Uttarakhand Power Corporation Ltd.",
      area: "Entire Uttarakhand",
      tariffYear: "2024-25",
      website: "https://www.upcl.org",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 60,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 5,
                rate: 100,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 170,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 2.5
            },
            {
              limit: 200,
              rate: 3.25
            },
            {
              limit: 400,
              rate: 4
            },
            {
              limit: Infinity,
              rate: 5.5
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
          name: "LT-2 (Commercial / Non-Domestic)",
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
                rate: 280,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
              rate: 6.5
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
