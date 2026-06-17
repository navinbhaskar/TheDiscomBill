// Karnataka — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Karnataka",
  discoms: [
    {
      id: "bescom",
      name: "BESCOM",
      fullName: "Bangalore Electricity Supply Company Ltd.",
      area: "Bangalore Urban, Bangalore Rural, Tumkur, Kolar, Chikkaballapur, Ramanagara, Chitradurga",
      tariffYear: "2024-25",
      website: "https://www.bescom.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2.5,
                rate: 30,
                label: "Single phase (up to 2.5 kW)"
              },
              {
                maxLoad: 5,
                rate: 50,
                label: "2.5 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 75,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 30,
              rate: 1.3,
              label: "First 30 units"
            },
            {
              limit: 100,
              rate: 4.95
            },
            {
              limit: 200,
              rate: 7.1
            },
            {
              limit: 500,
              rate: 8.1
            },
            {
              limit: Infinity,
              rate: 8.35
            }
          ],
          additionalCharges: [],
          notes: "Tariff is inclusive of all duties. BPL consumers (Kutir Jyoti): first 30 units may be zero per scheme. No separate electricity duty line – already included."
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial / Non-Domestic LT)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2.5,
                rate: 75,
                label: "Single phase"
              },
              {
                maxLoad: Infinity,
                rate: 120,
                label: "Three phase"
              }
            ]
          },
          energySlabs: [
            {
              limit: 200,
              rate: 8.5
            },
            {
              limit: Infinity,
              rate: 9.5
            }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "mescom",
      name: "MESCOM",
      fullName: "Mangalore Electricity Supply Company Ltd.",
      area: "Dakshina Kannada, Udupi, Shivamogga, Kodagu, Chikkamagaluru",
      tariffYear: "2024-25",
      website: "https://www.mescom.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2.5,
                rate: 30,
                label: "Single phase"
              },
              {
                maxLoad: Infinity,
                rate: 50,
                label: "Three phase"
              }
            ]
          },
          energySlabs: [
            {
              limit: 30,
              rate: 1.3
            },
            {
              limit: 100,
              rate: 4.95
            },
            {
              limit: 200,
              rate: 7.1
            },
            {
              limit: 500,
              rate: 8.1
            },
            {
              limit: Infinity,
              rate: 8.35
            }
          ],
          additionalCharges: []
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial)",
          fixedCharge: 75,
          energySlabs: [
            {
              limit: 200,
              rate: 8.5
            },
            {
              limit: Infinity,
              rate: 9.5
            }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "cesc_karnataka",
      name: "CESC (Karnataka)",
      fullName: "Chamundeshwari Electricity Supply Corporation Ltd.",
      area: "Mysuru, Mandya, Hassan, Chamarajanagar",
      tariffYear: "2024-25",
      website: "https://www.cescmysore.org",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 30,
              rate: 1.3
            },
            {
              limit: 100,
              rate: 4.95
            },
            {
              limit: 200,
              rate: 7.1
            },
            {
              limit: 500,
              rate: 8.1
            },
            {
              limit: Infinity,
              rate: 8.35
            }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "gescom",
      name: "GESCOM",
      fullName: "Gulbarga Electricity Supply Company Ltd.",
      area: "Kalaburagi, Bidar, Yadgir, Raichur, Koppal",
      tariffYear: "2024-25",
      website: "https://www.gescom.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 30,
              rate: 1.3
            },
            {
              limit: 100,
              rate: 4.95
            },
            {
              limit: 200,
              rate: 7.1
            },
            {
              limit: 500,
              rate: 8.1
            },
            {
              limit: Infinity,
              rate: 8.35
            }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "hescom",
      name: "HESCOM",
      fullName: "Hubli Electricity Supply Company Ltd.",
      area: "Dharwad, Gadag, Haveri, Belagavi, Uttara Kannada, Ballari, Vijayanagara",
      tariffYear: "2024-25",
      website: "https://www.hescom.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 30,
              rate: 1.3
            },
            {
              limit: 100,
              rate: 4.95
            },
            {
              limit: 200,
              rate: 7.1
            },
            {
              limit: 500,
              rate: 8.1
            },
            {
              limit: Infinity,
              rate: 8.35
            }
          ],
          additionalCharges: []
        }
      ]
    }
  ]
};
