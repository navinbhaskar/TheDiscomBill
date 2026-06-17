// West Bengal — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "West Bengal",
  discoms: [
    {
      id: "wbsedcl",
      name: "WBSEDCL",
      fullName: "West Bengal State Electricity Distribution Company Ltd.",
      area: "All of West Bengal except CESC area (Kolkata city and DPL area)",
      tariffYear: "2024-25",
      website: "https://www.wbsedcl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-A1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 25,
              rate: 4.61
            },
            {
              limit: 75,
              rate: 5.83
            },
            {
              limit: 200,
              rate: 7.41
            },
            {
              limit: 300,
              rate: 7.99
            },
            {
              limit: Infinity,
              rate: 8.84
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 4
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-B (Commercial / Non-Domestic)",
          fixedCharge: 70,
          energySlabs: [
            {
              limit: 100,
              rate: 7.5
            },
            {
              limit: 300,
              rate: 9
            },
            {
              limit: Infinity,
              rate: 10.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 4
            }
          ]
        }
      ]
    },
    {
      id: "cesc_kolkata",
      name: "CESC (Kolkata)",
      fullName: "CESC Ltd. (Calcutta Electric Supply Corporation)",
      area: "Kolkata city, Howrah, Hooghly (parts)",
      tariffYear: "2024-25",
      website: "https://www.cesc.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic (Residential)",
          fixedCharge: 15,
          energySlabs: [
            {
              limit: 25,
              rate: 4.61
            },
            {
              limit: 75,
              rate: 5.83
            },
            {
              limit: 200,
              rate: 7.41
            },
            {
              limit: 300,
              rate: 7.99
            },
            {
              limit: Infinity,
              rate: 8.84
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 4
            },
            {
              name: "Meter Rent",
              type: "flat",
              rate: 15
            }
          ]
        }
      ]
    },
    {
      id: "dpl",
      name: "DPL",
      fullName: "CESC DPL (Durgapur Projects Ltd.)",
      area: "Durgapur industrial and urban area",
      tariffYear: "2024-25",
      website: "https://www.dpl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 25,
              rate: 4.5
            },
            {
              limit: 75,
              rate: 5.5
            },
            {
              limit: 200,
              rate: 7
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
              rate: 4
            }
          ]
        }
      ]
    }
  ]
};
