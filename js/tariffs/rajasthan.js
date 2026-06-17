// Rajasthan — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Rajasthan",
  discoms: [
    {
      id: "jvvnl",
      name: "JVVNL",
      fullName: "Jaipur Vidyut Vitaran Nigam Ltd.",
      area: "Jaipur, Sikar, Jhunjhunu, Alwar, Bharatpur, Sawai Madhopur, Karauli, Dausa, Dholpur",
      tariffYear: "2024-25",
      website: "https://www.jaipurdiscom.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 65,
                label: "Up to 2 kW (single phase)"
              },
              {
                maxLoad: 5,
                rate: 80,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: 10,
                rate: 125,
                label: "5 kW – 10 kW"
              },
              {
                maxLoad: Infinity,
                rate: 200,
                label: "Above 10 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 3
            },
            {
              limit: 150,
              rate: 4.5
            },
            {
              limit: 300,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 6.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_total",
              rate: 5
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-4 (Commercial / Non-Domestic)",
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
                rate: 300,
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
              rate: 8
            },
            {
              limit: Infinity,
              rate: 9
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_total",
              rate: 5
            }
          ]
        }
      ]
    },
    {
      id: "avvnl",
      name: "AVVNL",
      fullName: "Ajmer Vidyut Vitaran Nigam Ltd.",
      area: "Ajmer, Bhilwara, Chittorgarh, Rajsamand, Nagaur, Tonk",
      tariffYear: "2024-25",
      website: "https://www.avvnl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 65,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 5,
                rate: 80,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 125,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 3
            },
            {
              limit: 150,
              rate: 4.5
            },
            {
              limit: 300,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 6.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_total",
              rate: 5
            }
          ]
        }
      ]
    },
    {
      id: "jdvvnl",
      name: "JdVVNL",
      fullName: "Jodhpur Vidyut Vitaran Nigam Ltd.",
      area: "Jodhpur, Barmer, Jaisalmer, Bikaner, Churu, Hanumangarh, Ganganagar, Pali, Jalor, Sirohi, Jalore",
      tariffYear: "2024-25",
      website: "https://www.jdvvnl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 65,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 5,
                rate: 80,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 125,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 50,
              rate: 3
            },
            {
              limit: 150,
              rate: 4.5
            },
            {
              limit: 300,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 6.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_total",
              rate: 5
            }
          ]
        }
      ]
    }
  ]
};
