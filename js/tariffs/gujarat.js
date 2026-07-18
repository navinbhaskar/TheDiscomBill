// Gujarat — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Gujarat",
  // GERC: demand exceeding contract demand attracts a flat penal demand charge (~₹360/kVA, FY2025-26) on the excess.
  excessDemand: { rate: 360, tolerancePct: 0 },
  discoms: [
    {
      id: "ugvcl",
      name: "UGVCL",
      fullName: "Uttar Gujarat Vij Company Ltd.",
      area: "North Gujarat (Mehsana, Patan, Banaskantha, Sabarkantha, Gandhinagar, Aravalli)",
      tariffYear: "2024-25",
      website: "https://www.ugvcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 50,
              rate: 1
            },
            {
              limit: 100,
              rate: 2.2
            },
            {
              limit: 250,
              rate: 3.45
            },
            {
              limit: Infinity,
              rate: 5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 20
            }
          ],
          notes: "Slab-wise tariff. Electricity Duty is 20% of energy charges."
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial / Non-Industrial)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
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
              rate: 20
            }
          ]
        },
        {
          id: "agricultural",
          name: "LT-3 (Agriculture / Irrigation)",
          fixedCharge: 0,
          energySlabs: [
            {
              limit: Infinity,
              rate: 0.6
            }
          ],
          additionalCharges: [],
          notes: "Heavily subsidized. Actual supply hours limited."
        }
      ]
    },
    {
      id: "mgvcl",
      name: "MGVCL",
      fullName: "Madhya Gujarat Vij Company Ltd.",
      area: "Central Gujarat (Vadodara, Anand, Kheda, Panchmahal, Dahod, Chhota Udaipur)",
      tariffYear: "2024-25",
      website: "https://www.mgvcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 50,
              rate: 1
            },
            {
              limit: 100,
              rate: 2.2
            },
            {
              limit: 250,
              rate: 3.45
            },
            {
              limit: Infinity,
              rate: 5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 20
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
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
              rate: 20
            }
          ]
        }
      ]
    },
    {
      id: "pgvcl",
      name: "PGVCL",
      fullName: "Paschim Gujarat Vij Company Ltd.",
      area: "West Gujarat (Rajkot, Jamnagar, Junagadh, Porbandar, Surat, Bharuch, Narmada)",
      tariffYear: "2024-25",
      website: "https://www.pgvcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 50,
              rate: 1
            },
            {
              limit: 100,
              rate: 2.2
            },
            {
              limit: 250,
              rate: 3.45
            },
            {
              limit: Infinity,
              rate: 5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 20
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
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
              rate: 20
            }
          ]
        }
      ]
    },
    {
      id: "dgvcl",
      name: "DGVCL",
      fullName: "Dakshin Gujarat Vij Company Ltd.",
      area: "South Gujarat (Surat city, Navsari, Valsad, Tapi, Dang)",
      tariffYear: "2024-25",
      website: "https://www.dgvcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 50,
              rate: 1
            },
            {
              limit: 100,
              rate: 2.2
            },
            {
              limit: 250,
              rate: 3.45
            },
            {
              limit: Infinity,
              rate: 5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 20
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
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
              rate: 20
            }
          ]
        }
      ]
    }
  ]
};
