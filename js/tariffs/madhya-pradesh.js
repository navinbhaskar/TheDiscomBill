// Madhya Pradesh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Madhya Pradesh",
  discoms: [
    {
      id: "mppkvvcl",
      name: "MPPKVVCL",
      fullName: "Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd.",
      area: "West-Central MP (Indore, Ujjain, Ratlam, Mandsaur, Dewas, Khandwa, Khargone)",
      tariffYear: "2024-25",
      website: "https://www.mppkvvcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
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
                rate: 140,
                label: "1 kW – 5 kW"
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
              limit: 30,
              rate: 2.05
            },
            {
              limit: 100,
              rate: 3.65
            },
            {
              limit: 150,
              rate: 4.75
            },
            {
              limit: 300,
              rate: 5.6
            },
            {
              limit: Infinity,
              rate: 6.55
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
                rate: 200,
                label: "Up to 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 350,
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
              rate: 8.5
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
      id: "mpmkvvcl",
      name: "MPMKVVCL",
      fullName: "Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd.",
      area: "Central MP (Bhopal, Sagar, Rewa, Satna, Narsinghpur, Hoshangabad, Raisen, Vidisha)",
      tariffYear: "2024-25",
      website: "https://www.mpmkvvcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
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
                rate: 140,
                label: "1 kW – 5 kW"
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
              limit: 30,
              rate: 2.05
            },
            {
              limit: 100,
              rate: 3.65
            },
            {
              limit: 150,
              rate: 4.75
            },
            {
              limit: 300,
              rate: 5.6
            },
            {
              limit: Infinity,
              rate: 6.55
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
          name: "LT-2 (Commercial)",
          fixedCharge: 200,
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
              rate: 5
            }
          ]
        }
      ]
    },
    {
      id: "mpez",
      name: "MPEZ",
      fullName: "Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company Ltd.",
      area: "East MP (Jabalpur, Chhindwara, Seoni, Mandla, Balaghat, Dindori)",
      tariffYear: "2024-25",
      website: "https://mpez.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic)",
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
                rate: 140,
                label: "1 kW – 5 kW"
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
              limit: 30,
              rate: 2.05
            },
            {
              limit: 100,
              rate: 3.65
            },
            {
              limit: 150,
              rate: 4.75
            },
            {
              limit: 300,
              rate: 5.6
            },
            {
              limit: Infinity,
              rate: 6.55
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
