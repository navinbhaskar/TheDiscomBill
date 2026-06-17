// Haryana — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Haryana",
  discoms: [
    {
      id: "dhbvn",
      name: "DHBVN",
      fullName: "Dakshin Haryana Bijli Vitran Nigam Ltd.",
      area: "South Haryana (Gurugram, Faridabad, Rewari, Mahendragarh, Mewat, Palwal, Bhiwani)",
      tariffYear: "2024-25",
      website: "https://www.dhbvn.org.in",
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
                maxLoad: 5,
                rate: 100,
                label: "2 kW – 5 kW"
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
              rate: 2
            },
            {
              limit: 100,
              rate: 2.5
            },
            {
              limit: 200,
              rate: 4.25
            },
            {
              limit: 400,
              rate: 5.25
            },
            {
              limit: 500,
              rate: 5.5
            },
            {
              limit: Infinity,
              rate: 6
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
          name: "NDS (Non-Domestic Supply)",
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
              limit: 200,
              rate: 6.5
            },
            {
              limit: Infinity,
              rate: 7.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ]
        }
      ]
    },
    {
      id: "uhbvn",
      name: "UHBVN",
      fullName: "Uttar Haryana Bijli Vitran Nigam Ltd.",
      area: "North Haryana (Ambala, Kurukshetra, Karnal, Sonipat, Panipat, Yamunanagar, Hisar, Rohtak)",
      tariffYear: "2024-25",
      website: "https://www.uhbvn.org.in",
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
                maxLoad: 5,
                rate: 100,
                label: "2 kW – 5 kW"
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
              rate: 2
            },
            {
              limit: 100,
              rate: 2.5
            },
            {
              limit: 200,
              rate: 4.25
            },
            {
              limit: 400,
              rate: 5.25
            },
            {
              limit: 500,
              rate: 5.5
            },
            {
              limit: Infinity,
              rate: 6
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
          name: "NDS (Non-Domestic Supply)",
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
              limit: 200,
              rate: 6.5
            },
            {
              limit: Infinity,
              rate: 7.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ]
        }
      ]
    }
  ]
};
