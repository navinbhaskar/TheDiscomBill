// Odisha — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Odisha",
  discoms: [
    {
      id: "tpnodl",
      name: "TPNODL",
      fullName: "TP Northern Odisha Distribution Ltd. (Tata Power)",
      area: "North Odisha (Balasore, Bhadrak, Jajpur, Kendujhar, Mayurbhanj, Sundargarh)",
      tariffYear: "2024-25",
      website: "https://www.tpnodl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 2.1
            },
            {
              limit: 200,
              rate: 3.5
            },
            {
              limit: 400,
              rate: 5
            },
            {
              limit: Infinity,
              rate: 6.2
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
    },
    {
      id: "tpsodl",
      name: "TPSODL",
      fullName: "TP Southern Odisha Distribution Ltd. (Tata Power)",
      area: "South Odisha (Ganjam, Gajapati, Kandhamal, Kalahandi, Koraput, Nabarangpur, Rayagada, Malkangiri)",
      tariffYear: "2024-25",
      website: "https://www.tpsodl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 2.1
            },
            {
              limit: 200,
              rate: 3.5
            },
            {
              limit: 400,
              rate: 5
            },
            {
              limit: Infinity,
              rate: 6.2
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
      id: "tpwodl",
      name: "TPWODL",
      fullName: "TP Western Odisha Distribution Ltd. (Tata Power)",
      area: "West Odisha (Sambalpur, Bargarh, Boudh, Deogarh, Jharsuguda, Nuapada, Bolangir, Subarnapur)",
      tariffYear: "2024-25",
      website: "https://www.tpwodl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 2.1
            },
            {
              limit: 200,
              rate: 3.5
            },
            {
              limit: 400,
              rate: 5
            },
            {
              limit: Infinity,
              rate: 6.2
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
      id: "tpcodl",
      name: "TPCODL",
      fullName: "TP Central Odisha Distribution Ltd. (Tata Power)",
      area: "Central Odisha (Bhubaneswar, Cuttack, Puri, Khordha, Jagatsinghpur, Kendrapara, Nayagarh, Angul, Dhenkanal)",
      tariffYear: "2024-25",
      website: "https://www.tpcodl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 2.1
            },
            {
              limit: 200,
              rate: 3.5
            },
            {
              limit: 400,
              rate: 5
            },
            {
              limit: Infinity,
              rate: 6.2
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
