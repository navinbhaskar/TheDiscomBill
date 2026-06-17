// Jammu & Kashmir — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Jammu & Kashmir",
  discoms: [
    {
      id: "jkpdd_jammu",
      name: "JKPDD (Jammu Region)",
      fullName: "J&K Power Development Department – Jammu Region",
      area: "Jammu, Samba, Kathua, Udhampur, Reasi, Ramban, Doda, Kishtwar, Rajouri, Poonch",
      tariffYear: "2024-25",
      website: "https://jkpdd.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 50,
          energySlabs: [
            {
              limit: 50,
              rate: 1.5
            },
            {
              limit: 100,
              rate: 2
            },
            {
              limit: 200,
              rate: 3
            },
            {
              limit: Infinity,
              rate: 4.5
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
          name: "LT Commercial",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 4.5
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
        }
      ]
    },
    {
      id: "jkpdd_kashmir",
      name: "JKPDD (Kashmir Region)",
      fullName: "J&K Power Development Department – Kashmir Region",
      area: "Srinagar, Baramulla, Anantnag, Kupwara, Pulwama, Kulgam, Ganderbal, Shopian, Bandipora",
      tariffYear: "2024-25",
      website: "https://jkpdd.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 50,
          energySlabs: [
            {
              limit: 50,
              rate: 1.5
            },
            {
              limit: 100,
              rate: 2
            },
            {
              limit: 200,
              rate: 3
            },
            {
              limit: Infinity,
              rate: 4.5
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
          name: "LT Commercial",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 4.5
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
        }
      ]
    }
  ]
};
