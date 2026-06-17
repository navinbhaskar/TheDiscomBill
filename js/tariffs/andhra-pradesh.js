// Andhra Pradesh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Andhra Pradesh",
  discoms: [
    {
      id: "apspdcl",
      name: "APSPDCL",
      fullName: "Southern Power Distribution Company of Andhra Pradesh Ltd.",
      area: "Southern AP (Kurnool, Nellore, Prakasam, Chittoor, Kadapa, Tirupati)",
      tariffYear: "2024-25",
      website: "https://www.apspdcl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 0.5,
                rate: 30,
                label: "Up to 500W"
              },
              {
                maxLoad: 1,
                rate: 60,
                label: "501W – 1 kW"
              },
              {
                maxLoad: 2,
                rate: 90,
                label: "1 kW – 2 kW"
              },
              {
                maxLoad: 5,
                rate: 120,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 160,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 1.45
            },
            {
              limit: 100,
              rate: 2.75
            },
            {
              limit: 200,
              rate: 4.5
            },
            {
              limit: 300,
              rate: 6.5
            },
            {
              limit: 400,
              rate: 7
            },
            {
              limit: Infinity,
              rate: 8
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "Telescopic tariff. Fixed charge based on connected load."
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 100,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 150,
                label: "1 kW – 5 kW"
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
              limit: 50,
              rate: 5
            },
            {
              limit: 100,
              rate: 7
            },
            {
              limit: Infinity,
              rate: 9
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 6
            }
          ]
        },
        {
          id: "agricultural",
          name: "LT-V (Agricultural / Irrigation Pump Sets)",
          fixedCharge: 0,
          energySlabs: [
            {
              limit: Infinity,
              rate: 0
            }
          ],
          additionalCharges: [],
          notes: "Free power supply to agricultural consumers as per GoAP scheme. Actual supply hours may be limited."
        }
      ]
    },
    {
      id: "apepdcl",
      name: "APEPDCL",
      fullName: "Eastern Power Distribution Company of Andhra Pradesh Ltd.",
      area: "Eastern AP (Vishakhapatnam, East Godavari, West Godavari, Krishna, Guntur)",
      tariffYear: "2024-25",
      website: "https://www.apepdcl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 0.5,
                rate: 30,
                label: "Up to 500W"
              },
              {
                maxLoad: 1,
                rate: 60,
                label: "501W – 1 kW"
              },
              {
                maxLoad: 2,
                rate: 90,
                label: "1 kW – 2 kW"
              },
              {
                maxLoad: 5,
                rate: 120,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 160,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 1.45
            },
            {
              limit: 100,
              rate: 2.75
            },
            {
              limit: 200,
              rate: 4.5
            },
            {
              limit: 300,
              rate: 6.5
            },
            {
              limit: 400,
              rate: 7
            },
            {
              limit: Infinity,
              rate: 8
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 100,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 150,
                label: "1 kW – 5 kW"
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
              limit: 50,
              rate: 5
            },
            {
              limit: 100,
              rate: 7
            },
            {
              limit: Infinity,
              rate: 9
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 6
            }
          ]
        }
      ]
    }
  ]
};
