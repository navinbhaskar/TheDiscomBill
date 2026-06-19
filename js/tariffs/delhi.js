// Delhi — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Delhi",
  // DERC: a 30% surcharge on the fixed charge corresponding to the excess load (kW/kVA) for that billing cycle.
  excessDemand: { multiplier: 0.30, tolerancePct: 0 },
  discoms: [
    {
      id: "brpl",
      name: "BRPL (BSES Rajdhani)",
      fullName: "BSES Rajdhani Power Ltd.",
      area: "South & West Delhi",
      tariffYear: "2024-25",
      website: "https://www.bsesdelhi.com",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 20,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 5,
                rate: 50,
                label: "2 kW – 5 kW"
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
              limit: 200,
              rate: 3
            },
            {
              limit: 400,
              rate: 4.5
            },
            {
              limit: 800,
              rate: 6.5
            },
            {
              limit: Infinity,
              rate: 7
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "GNCTD subsidy: consumers using ≤200 units pay ₹0 (100% subsidy). Consumers using 201–400 units get 50% rebate on first 200 units. Subsidy optional – consumer can opt out.",
          specialSchemes: [
            {
              id: "delhi_subsidy",
              label: "Apply GNCTD Subsidy (Optional)",
              description: "0–200 units: ₹0 bill. 201–400 units: 50% rebate on first 200 units.",
              calculate: undefined
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
                maxLoad: 5,
                rate: 125,
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
              limit: 200,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 7
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
      id: "bypl",
      name: "BYPL (BSES Yamuna)",
      fullName: "BSES Yamuna Power Ltd.",
      area: "East & Central Delhi",
      tariffYear: "2024-25",
      website: "https://www.bsesdelhi.com",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 20,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 5,
                rate: 50,
                label: "2 kW – 5 kW"
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
              limit: 200,
              rate: 3
            },
            {
              limit: 400,
              rate: 4.5
            },
            {
              limit: 800,
              rate: 6.5
            },
            {
              limit: Infinity,
              rate: 7
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "GNCTD subsidy applicable (same as BRPL). ≤200 units: zero bill; 201–400 units: 50% rebate on first 200 units."
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 5,
                rate: 125,
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
              limit: 200,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 7
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
      id: "tpddl",
      name: "Tata Power-DDL (TPDDL)",
      fullName: "Tata Power Delhi Distribution Ltd.",
      area: "North & North-West Delhi",
      tariffYear: "2024-25",
      website: "https://www.tatapower-ddl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 2,
                rate: 20,
                label: "Up to 2 kW"
              },
              {
                maxLoad: 5,
                rate: 50,
                label: "2 kW – 5 kW"
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
              limit: 200,
              rate: 3
            },
            {
              limit: 400,
              rate: 4.5
            },
            {
              limit: 800,
              rate: 6.5
            },
            {
              limit: Infinity,
              rate: 7
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "GNCTD subsidy applicable. Same tariff as BRPL/BYPL per DERC order."
        },
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 5,
                rate: 125,
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
              limit: 200,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 7
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
      id: "ndmc_delhi",
      name: "NDMC",
      fullName: "New Delhi Municipal Council",
      area: "Lutyens' Delhi (Central Government area)",
      tariffYear: "2024-25",
      website: "https://www.ndmc.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 40,
          energySlabs: [
            {
              limit: 200,
              rate: 3
            },
            {
              limit: 400,
              rate: 4.5
            },
            {
              limit: Infinity,
              rate: 6.5
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
