// Bihar — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Bihar",
  discoms: [
    {
      id: "nbpdcl",
      name: "NBPDCL",
      fullName: "North Bihar Power Distribution Company Ltd.",
      area: "North Bihar (Patna, Muzaffarpur, Darbhanga, Begusarai, Bhagalpur, etc.)",
      tariffYear: "2024-25",
      website: "https://www.nbpdcl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic (DS)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 85,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 120,
                label: "1 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 180,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 4.2
            },
            {
              limit: 100,
              rate: 5.25
            },
            {
              limit: 200,
              rate: 5.75
            },
            {
              limit: Infinity,
              rate: 6.15
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
          name: "LT Commercial (CS)",
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
              rate: 5
            }
          ]
        }
      ]
    },
    {
      id: "sbpdcl",
      name: "SBPDCL",
      fullName: "South Bihar Power Distribution Company Ltd.",
      area: "South Bihar (Patna City, Gaya, Nalanda, Aurangabad, Rohtas, etc.)",
      tariffYear: "2024-25",
      website: "https://www.sbpdcl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic (DS)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 85,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 120,
                label: "1 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 180,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 4.2
            },
            {
              limit: 100,
              rate: 5.25
            },
            {
              limit: 200,
              rate: 5.75
            },
            {
              limit: Infinity,
              rate: 6.15
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
          name: "LT Commercial (CS)",
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
              rate: 5
            }
          ]
        }
      ]
    }
  ]
};
