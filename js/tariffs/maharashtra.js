// Maharashtra — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Maharashtra",
  // MERC: demand exceeding contract demand is billed at 150% of the normal demand-charge rate.
  excessDemand: { multiplier: 1.5, tolerancePct: 0 },
  discoms: [
    {
      id: "msedcl",
      name: "MSEDCL",
      fullName: "Maharashtra State Electricity Distribution Co. Ltd.",
      area: "Maharashtra (except Mumbai city area served by Adani/BEST/Tata Power)",
      tariffYear: "2024-25",
      website: "https://www.mahadiscom.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 100,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 2,
                rate: 180,
                label: "1 kW – 2 kW"
              },
              {
                maxLoad: 5,
                rate: 335,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: 10,
                rate: 605,
                label: "5 kW – 10 kW"
              },
              {
                maxLoad: Infinity,
                rate: 900,
                label: "Above 10 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 3.46
            },
            {
              limit: 300,
              rate: 6.71
            },
            {
              limit: 500,
              rate: 10.45
            },
            {
              limit: Infinity,
              rate: 11.13
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial / Non-Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 5,
                rate: 450,
                label: "Up to 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 750,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 7.5
            },
            {
              limit: 300,
              rate: 9.5
            },
            {
              limit: Infinity,
              rate: 11.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        }
      ]
    },
    {
      id: "adani_mumbai",
      name: "Adani Electricity Mumbai",
      fullName: "Adani Electricity Mumbai Ltd. (formerly Reliance Infrastructure)",
      area: "Mumbai suburbs (Bandra, Andheri, Kurla, Borivali, Malad, etc.)",
      tariffYear: "2024-25",
      website: "https://www.adanielectricity.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 175,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 2,
                rate: 280,
                label: "1 kW – 2 kW"
              },
              {
                maxLoad: 5,
                rate: 420,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 630,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 3.35
            },
            {
              limit: 300,
              rate: 6.58
            },
            {
              limit: 500,
              rate: 9.6
            },
            {
              limit: Infinity,
              rate: 10.57
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        },
        {
          id: "ht_industrial",
          name: "HT-I Industrial (HT · kVA)",
          demandUnit: "kVA",
          fixedCharge: { type: "per_kva", rate: 472 },
          // Billing demand = higher of recorded MD or 75% of contract demand (common HT rule).
          billingDemandFloorPct: 75,
          energySlabs: [ { limit: Infinity, rate: 6.73 } ],
          additionalCharges: [ { name: "Electricity Duty (ED)", type: "percent_energy", rate: 9.3 } ],
          notes: "HT-I industrial supply, kVA based — demand charge ₹472/kVA/month on the recorded MD (floored at 75% of contract demand), energy ₹6.73 per kVAh (apparent units = kWh ÷ power factor, so a poor PF raises the bill directly). Demand above contract demand is charged at 150% (state rule). Representative FY2024-25 MSEDCL HT rates; verify with the official tariff order."
        }
      ]
    },
    {
      id: "best_mumbai",
      name: "BEST Mumbai",
      fullName: "Brihanmumbai Electricity Supply and Transport (BEST)",
      area: "Mumbai Island City (South Mumbai – Colaba to Mahim/Sion)",
      tariffYear: "2024-25",
      website: "https://www.bestundertaking.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 3.07
            },
            {
              limit: 300,
              rate: 5.98
            },
            {
              limit: 500,
              rate: 8.9
            },
            {
              limit: Infinity,
              rate: 10
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        }
      ]
    },
    {
      id: "tata_power_mumbai",
      name: "Tata Power Mumbai",
      fullName: "Tata Power Company Ltd. – Mumbai Distribution",
      area: "Parts of Mumbai (Dharavi, Wadala, parts of Kurla, Chembur, etc.)",
      tariffYear: "2024-25",
      website: "https://www.tatapower.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: 70,
          energySlabs: [
            {
              limit: 100,
              rate: 3.1
            },
            {
              limit: 300,
              rate: 5.95
            },
            {
              limit: 500,
              rate: 8.9
            },
            {
              limit: Infinity,
              rate: 9.95
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        }
      ]
    }
  ]
};
