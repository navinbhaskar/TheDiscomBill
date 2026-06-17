// Telangana — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Telangana",
  discoms: [
    {
      id: "tsspdcl",
      name: "TSSPDCL",
      fullName: "Telangana State Southern Power Distribution Company Ltd.",
      area: "Southern Telangana (Hyderabad, Rangareddy, Mahbubnagar, Nalgonda, Medak, Sangareddy, Vikarabad)",
      tariffYear: "2024-25",
      website: "https://www.tssouthernpower.com",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 30,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 50,
                label: "1 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 100,
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
              rate: 2.45
            },
            {
              limit: 200,
              rate: 4
            },
            {
              limit: 300,
              rate: 6.05
            },
            {
              limit: Infinity,
              rate: 8.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 7.5
            }
          ],
          notes: "Lifeline consumers (BPL): first 50 units free. LT-1A – loads up to 900W."
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 5,
                rate: 100,
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
              limit: 50,
              rate: 5.5
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
              rate: 7.5
            }
          ]
        }
      ]
    },
    {
      id: "tsnpdcl",
      name: "TSNPDCL",
      fullName: "Telangana State Northern Power Distribution Company Ltd.",
      area: "Northern Telangana (Warangal, Karimnagar, Nizamabad, Adilabad, Khammam, Peddapalli, Rajanna Sircilla)",
      tariffYear: "2024-25",
      website: "https://www.tsnpdcl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 30,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 5,
                rate: 50,
                label: "1 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 100,
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
              rate: 2.45
            },
            {
              limit: 200,
              rate: 4
            },
            {
              limit: 300,
              rate: 6.05
            },
            {
              limit: Infinity,
              rate: 8.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 7.5
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: 100,
          energySlabs: [
            {
              limit: 50,
              rate: 5.5
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
              rate: 7.5
            }
          ]
        }
      ]
    }
  ]
};
